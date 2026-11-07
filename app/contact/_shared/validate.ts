/**
 * Server-side validation shared by every form on this site.
 *
 * NO-JAVASCRIPT CONTRACT
 * ──────────────────────────────────────────────────────────────────────────
 * The browser's own `required` / `type="email"` / `maxlength` attributes are a
 * convenience, not the validation. Everything below runs on the server, after
 * the POST, against the raw FormData - so a submission from a browser with
 * scripting off, from `curl`, or from a client that ignores the attributes is
 * validated identically.
 *
 * Errors travel back to the form as SEARCH PARAMS rather than component state,
 * because component state needs `useActionState`, which needs a Client
 * Component, which needs JavaScript. A redirect with `?err=…` re-renders the
 * page server-side and is the one mechanism that behaves the same with and
 * without scripting.
 *
 * Only ERROR CODES travel in the URL, never message text. The text lives in
 * ERROR_TEXT below, so a crafted `?err=` cannot inject copy into the page.
 * ──────────────────────────────────────────────────────────────────────────
 */

import type { Field } from '@/lib/contact'

/* ------------------------------------------------------------------ *
 * The error vocabulary
 * ------------------------------------------------------------------ */

export const ERROR_CODES = ['required', 'email', 'option', 'short', 'long', 'consent'] as const
export type ErrorCode = (typeof ERROR_CODES)[number]

const ERROR_CODE_SET: ReadonlySet<string> = new Set(ERROR_CODES)

export const ERROR_TEXT: Record<ErrorCode, string> = {
  required: 'This field is required.',
  email: 'That does not look like an email address, check for a typo.',
  option: 'Choose one of the listed options.',
  short: 'A sentence or two, so there is something to reply to.',
  long: 'Longer than this form accepts. Email us the detail instead.',
  consent: 'We cannot reply to you unless you agree to us contacting you.',
}

/** field name → error code. */
export type FieldErrors = Record<string, ErrorCode>

/** field name → the value the sender typed, echoed back into the re-render. */
export type FieldValues = Record<string, string>

/* ------------------------------------------------------------------ *
 * Length ceilings
 *
 * Each is also rendered as `maxLength` on the control, so a browser stops the
 * sender before the server has to. They cap the round-trip URL too: the error
 * redirect echoes the submitted values back, and 2000 characters of message is
 * the largest field on any form here.
 * ------------------------------------------------------------------ */

export const MAX_LENGTH: Record<string, number> = {
  text: 160,
  email: 254,
  tel: 40,
  textarea: 2000,
}

/** Shortest acceptable free-text body. Two or three sentences is ~80 chars. */
const MIN_TEXTAREA = 12

/** Deliberately permissive. Deliverability is a mail server's job, not a regex's. */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function maxLengthFor(field: Field): number | undefined {
  if (field.type === 'checkbox' || field.type === 'select') return undefined
  return MAX_LENGTH[field.type]
}

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

export type Validated = {
  errors: FieldErrors
  values: FieldValues
  ok: boolean
}

/**
 * Validate a FormData payload against a field schema.
 *
 * Returns BOTH the errors and the normalised values, so the caller can echo
 * the sender's own words back into the re-rendered form rather than emptying
 * it - losing a typed message because one field was wrong is the fastest way
 * to lose the enquiry.
 */
export function validate(fields: readonly Field[], form: FormData): Validated {
  const errors: FieldErrors = {}
  const values: FieldValues = {}

  for (const field of fields) {
    if (field.type === 'checkbox') {
      // An unchecked box is simply absent from the payload.
      const checked = form.get(field.name) != null
      values[field.name] = checked ? 'on' : ''
      if (field.required && !checked) errors[field.name] = 'consent'
      continue
    }

    const raw = form.get(field.name)
    const value = (typeof raw === 'string' ? raw : '').trim()
    const cap = maxLengthFor(field)
    // Store the value capped, because it is about to travel in a URL.
    values[field.name] = cap ? value.slice(0, cap) : value

    if (!value) {
      if (field.required) errors[field.name] = 'required'
      continue
    }

    if (cap && value.length > cap) {
      errors[field.name] = 'long'
      continue
    }

    if (field.type === 'email' && !LOOKS_LIKE_EMAIL.test(value)) {
      errors[field.name] = 'email'
      continue
    }

    if (field.type === 'select') {
      const allowed = (field.options ?? [])
        .map((o) => o.value)
        .filter((v) => v !== '')
      if (!allowed.includes(value)) {
        errors[field.name] = 'option'
        continue
      }
    }

    if (field.type === 'textarea' && value.length < MIN_TEXTAREA) {
      errors[field.name] = 'short'
      continue
    }
  }

  return { errors, values, ok: Object.keys(errors).length === 0 }
}

/* ------------------------------------------------------------------ *
 * Encoding to and from the URL
 * ------------------------------------------------------------------ */

/** Echoed values are namespaced so they cannot collide with a real param. */
const VALUE_PREFIX = 'f_'

/**
 * `{ name: 'required', email: 'email' }` → `name:required,email:email`
 */
export function encodeErrors(errors: FieldErrors): string {
  return Object.entries(errors)
    .map(([name, code]) => `${name}:${code}`)
    .join(',')
}

/**
 * Build the query string the failure redirect carries.
 *
 * Unknown field names and unknown codes are impossible here because both come
 * from the schema, but `decodeErrors` validates them again on the way in -
 * the URL is sender-controlled and is never trusted.
 */
export function failureQuery(
  fields: readonly Field[],
  result: Validated,
  extra: Record<string, string> = {},
): string {
  const params = new URLSearchParams()
  params.set('err', encodeErrors(result.errors))
  for (const field of fields) {
    if (field.type === 'checkbox') continue
    // `echo: false` means this value must never reach a URL. See the field's
    // doc comment in lib/contact.ts - the vulnerability report body sets it.
    if (field.echo === false) continue
    const value = result.values[field.name]
    if (value) params.set(`${VALUE_PREFIX}${field.name}`, value)
  }
  for (const [k, v] of Object.entries(extra)) params.set(k, v)
  return params.toString()
}

type RawParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? (v[0] ?? '') : (v ?? '')

/**
 * Read `?err=` back off the URL, keeping only pairs whose field name exists in
 * the schema and whose code exists in the vocabulary. Anything else is
 * discarded silently: a visitor pasting `?err=<script>` gets a clean page.
 */
export function decodeErrors(fields: readonly Field[], params: RawParams): FieldErrors {
  const raw = first(params.err)
  if (!raw) return {}
  const known = new Set(fields.map((f) => f.name))
  const out: FieldErrors = {}
  for (const pair of raw.split(',')) {
    const [name, code] = pair.split(':')
    if (!name || !code) continue
    if (!known.has(name)) continue
    if (!ERROR_CODE_SET.has(code)) continue
    out[name] = code as ErrorCode
  }
  return out
}

/**
 * Read the echoed values back. Each is capped again on the way in, and a
 * select's value is dropped unless it is one of that select's own options.
 */
export function decodeValues(fields: readonly Field[], params: RawParams): FieldValues {
  const out: FieldValues = {}
  for (const field of fields) {
    if (field.type === 'checkbox') continue
    // Symmetric with `failureQuery`: a field that may not be WRITTEN to a URL
    // may not be READ from one either. Without this, a crafted link could
    // prefill a vulnerability report's body for someone else to submit, and
    // the field would render the attacker's text as the sender's own.
    if (field.echo === false) continue
    const value = first(params[`${VALUE_PREFIX}${field.name}`])
    if (!value) continue
    if (field.type === 'select') {
      const allowed = (field.options ?? []).map((o) => o.value)
      if (!allowed.includes(value)) continue
      out[field.name] = value
      continue
    }
    const cap = maxLengthFor(field)
    out[field.name] = cap ? value.slice(0, cap) : value
  }
  return out
}

/**
 * The ordered list the error summary renders. Schema order, not object key
 * order, so "three errors" always reads top-to-bottom in form order.
 */
export function orderedErrors(
  fields: readonly Field[],
  errors: FieldErrors,
): { field: Field; code: ErrorCode }[] {
  return fields
    .filter((f) => errors[f.name])
    .map((f) => ({ field: f, code: errors[f.name] }))
}
