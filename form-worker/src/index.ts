/**
 * envenox-forms — receives form submissions from envenox.com and relays them
 * to the admin mailbox over authenticated SMTP.
 *
 * Runs on its own deployment, separate from the website. The site is static
 * assets with no Worker script precisely because a Next server Worker once
 * exceeded the CPU allowance and took envenox.com down. A fault in this
 * Worker can lose a form submission; it cannot take the website offline.
 *
 * No third party sees a submission. That is the point: /report-issue invites
 * vulnerability disclosures, and routing those through a free form service
 * would be indefensible for a security firm.
 */

import { sendMail, SmtpError } from './smtp'
import { buildMessage, safeAddress, headerValue } from './email'

export interface Env {
  SMTP_HOST: string
  SMTP_PORT: string
  MAIL_FROM: string
  MAIL_TO: string
  /** wrangler secret put SMTP_PASSWORD */
  SMTP_PASSWORD: string
  /** Optional. wrangler secret put TURNSTILE_SECRET */
  TURNSTILE_SECRET?: string
  /** Optional native rate-limit binding; absent in local dev. */
  FORM_RATE_LIMIT?: { limit(o: { key: string }): Promise<{ success: boolean }> }
}

const ALLOWED_ORIGINS = new Set([
  'https://envenox.com',
  'https://www.envenox.com',
])

/** Max bytes accepted. A contact form has no business being larger. */
const MAX_BODY_BYTES = 32 * 1024

/**
 * Known forms and their required fields. An unknown form name is rejected
 * rather than relayed: this endpoint is public, and without a whitelist it
 * becomes a way to send arbitrary mail through the company mailbox.
 *
 * THESE NAMES ARE NOT FREE CHOICES. They must match the `name` attributes the
 * site actually renders. They were originally guessed, and on the first live
 * test /report-issue rejected every submission because the Worker required a
 * field called `message` while the form renders `summary`. A field the Worker
 * does not list is silently dropped from the email, which is worse: the
 * submission succeeds and arrives incomplete.
 *
 * `npm run check:forms` compares this table against the built HTML. Run it
 * after any form change.
 */
const FORMS: Record<string, { required: string[]; fields: string[] }> = {
  enquiry: {
    required: ['email', 'message'],
    fields: ['name', 'email', 'company', 'country', 'interest', 'message', 'consent'],
  },
  'report-issue': {
    required: ['email', 'summary'],
    fields: ['name', 'email', 'target', 'summary', 'impact', 'credit', 'rules'],
  },
  newsletter: {
    required: ['email'],
    fields: ['email', 'status'],
  },
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  company: 'Company',
  country: 'Country',
  interest: 'What this is about',
  message: 'Message',
  consent: 'Consent to be contacted',
  target: 'Affected host, URL or endpoint',
  summary: 'What they did, and what happened',
  impact: 'Potential impact',
  credit: 'Credit preference',
  rules: 'Rules of engagement accepted',
  status: 'Subscription status',
}

function redirect(to: string): Response {
  // 303 so the browser follows with GET. Without it a refresh on the
  // confirmation page would re-POST the form.
  return Response.redirect(to, 303)
}

function problem(status: number, publicMessage: string, wantsJson: boolean, origin: string | null): Response {
  if (wantsJson) {
    return new Response(JSON.stringify({ ok: false, error: publicMessage }), {
      status,
      headers: corsHeaders(origin, { 'content-type': 'application/json; charset=utf-8' }),
    })
  }
  return redirect(`https://envenox.com/thank-you?status=error&reason=${encodeURIComponent(publicMessage)}`)
}

function corsHeaders(origin: string | null, extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra }
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['access-control-allow-origin'] = origin
    headers['vary'] = 'origin'
  }
  return headers
}

async function verifyTurnstile(secret: string, token: string, ip: string | null): Promise<boolean> {
  const body = new FormData()
  body.append('secret', secret)
  body.append('response', token)
  if (ip) body.append('remoteip', ip)
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    })
    const json = (await res.json()) as { success?: boolean }
    return json.success === true
  } catch {
    // A verification outage must not silently let everything through.
    return false
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    const origin = request.headers.get('origin')

    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          ok: true,
          smtpHost: env.SMTP_HOST,
          smtpPort: env.SMTP_PORT,
          passwordConfigured: Boolean(env.SMTP_PASSWORD),
          turnstileConfigured: Boolean(env.TURNSTILE_SECRET),
          rateLimitBound: Boolean(env.FORM_RATE_LIMIT),
        }),
        { headers: { 'content-type': 'application/json; charset=utf-8' } },
      )
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, {
          'access-control-allow-methods': 'POST, OPTIONS',
          'access-control-allow-headers': 'content-type',
          'access-control-max-age': '86400',
        }),
      })
    }

    if (url.pathname !== '/submit') return new Response('Not found', { status: 404 })
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } })

    const wantsJson = (request.headers.get('accept') ?? '').includes('application/json')

    // Origin check. A plain form navigation may omit Origin on some browsers,
    // so an absent header is tolerated; a WRONG one never is.
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return problem(403, 'This form may only be submitted from envenox.com.', wantsJson, origin)
    }

    const contentLength = Number(request.headers.get('content-length') ?? '0')
    if (contentLength > MAX_BODY_BYTES) {
      return problem(413, 'That submission is too large.', wantsJson, origin)
    }

    let form: FormData
    try {
      form = await request.formData()
    } catch {
      return problem(400, 'That submission could not be read.', wantsJson, origin)
    }

    const get = (k: string) => {
      const v = form.get(k)
      return typeof v === 'string' ? v : ''
    }

    // Honeypot. A field hidden from humans; only a bot fills it. Answer 303
    // exactly as on success so the bot learns nothing from the response.
    if (get('website').trim() !== '') {
      return wantsJson
        ? new Response(JSON.stringify({ ok: true }), { headers: corsHeaders(origin, { 'content-type': 'application/json' }) })
        : redirect('https://envenox.com/thank-you?from=enquiry')
    }

    const formName = headerValue(get('form') || 'enquiry', 40)
    const spec = FORMS[formName]
    if (!spec) return problem(400, 'Unknown form.', wantsJson, origin)

    const ip = request.headers.get('cf-connecting-ip')

    if (env.TURNSTILE_SECRET) {
      const token = get('cf-turnstile-response')
      if (!token || !(await verifyTurnstile(env.TURNSTILE_SECRET, token, ip))) {
        return problem(403, 'Could not verify that you are human. Please try again.', wantsJson, origin)
      }
    }

    if (env.FORM_RATE_LIMIT && ip) {
      const { success } = await env.FORM_RATE_LIMIT.limit({ key: ip })
      if (!success) {
        return problem(429, 'Too many submissions. Please wait a minute and try again.', wantsJson, origin)
      }
    }

    const missing = spec.required.filter((f) => get(f).trim() === '')
    if (missing.length > 0) {
      return problem(400, `Please complete: ${missing.join(', ')}.`, wantsJson, origin)
    }

    const senderEmail = safeAddress(get('email'))
    if (spec.required.includes('email') && !senderEmail) {
      return problem(400, 'That email address does not look valid.', wantsJson, origin)
    }

    const fields = spec.fields
      .map((f) => ({ label: FIELD_LABELS[f] ?? f, value: get(f).slice(0, 5000) }))
      .filter((f) => f.value.trim() !== '')

    const message = buildMessage({
      formName,
      fromAddress: env.MAIL_FROM,
      toAddress: env.MAIL_TO,
      replyToAddress: senderEmail,
      replyToName: get('name') ? headerValue(get('name'), 80) : null,
      fields,
      meta: [
        { label: 'Submitted', value: new Date().toISOString() },
        { label: 'IP', value: ip ?? 'unknown' },
        { label: 'Country', value: request.headers.get('cf-ipcountry') ?? 'unknown' },
        { label: 'User agent', value: headerValue(request.headers.get('user-agent') ?? '', 180) },
      ],
    })

    // Fail loudly and early on a missing secret. Without this the password
    // coerces to the string "undefined", the server answers 535, and the log
    // reads like a wrong password rather than an unconfigured Worker.
    if (!env.SMTP_PASSWORD) {
      console.error('SMTP_PASSWORD is not set; run: wrangler secret put SMTP_PASSWORD')
      return problem(503, 'The contact form is not configured yet. Please email admin@envenox.com.', wantsJson, origin)
    }

    try {
      await sendMail(
        {
          hostname: env.SMTP_HOST,
          port: Number(env.SMTP_PORT),
          username: env.MAIL_FROM,
          password: env.SMTP_PASSWORD,
        },
        { from: env.MAIL_FROM, to: env.MAIL_TO, message },
      )
    } catch (err) {
      // Log the detail, return none of it. An SMTP reply can disclose whether
      // a mailbox exists and what the relay policy is.
      console.error('smtp send failed', {
        stage: err instanceof SmtpError ? err.stage : undefined,
        code: err instanceof SmtpError ? err.code : undefined,
        message: err instanceof Error ? err.message : String(err),
        form: formName,
      })
      return problem(502, 'We could not deliver your message. Please email admin@envenox.com directly.', wantsJson, origin)
    }

    if (wantsJson) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: corsHeaders(origin, { 'content-type': 'application/json; charset=utf-8' }),
      })
    }
    return redirect(`https://envenox.com/thank-you?from=${encodeURIComponent(formName)}`)
  },
}
