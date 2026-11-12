/**
 * Builds the RFC 5322 message sent to the inbox.
 *
 * Everything here treats form input as hostile. The one genuinely dangerous
 * mistake available when composing mail from user input is header injection:
 * a newline inside a value ends the header and lets the submitter append
 * arbitrary headers, including `Bcc:`, turning the contact form into an open
 * relay. `headerValue()` is the only place that risk is handled, so nothing
 * may reach a header without passing through it.
 */

/** UTF-8 safe base64. `btoa` alone mangles anything outside latin1. */
function b64(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/**
 * Makes a string safe to place in a header.
 *
 * Strips CR, LF and other control characters, collapses whitespace and caps
 * the length. A header cannot contain a line break, so removing them removes
 * injection entirely rather than trying to detect malicious intent.
 */
export function headerValue(raw: string, maxLen = 200): string {
  return raw
    .replace(/[\r\n]+/g, ' ')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen)
}

/** RFC 2047 encode a header if it is not plain ASCII, so non-Latin names survive. */
export function encodeHeader(raw: string): string {
  const safe = headerValue(raw)
  // eslint-disable-next-line no-control-regex
  if (/^[\u0020-\u007e]*$/.test(safe)) return safe
  return `=?UTF-8?B?${b64(safe)}?=`
}

/**
 * An address is only used as an address if it looks like one. Anything else
 * is dropped rather than corrected, because a half-valid Reply-To is worse
 * than none: it silently sends replies to the wrong place.
 */
export function safeAddress(raw: string): string | null {
  const v = headerValue(raw, 254)
  return /^[^\s@<>,;:"\\[\]]+@[^\s@<>,;:"\\[\]]+\.[a-zA-Z]{2,}$/.test(v) ? v : null
}

export type MessageInput = {
  /** Which form this came from, e.g. "enquiry" or "report-issue". */
  formName: string
  fromAddress: string
  toAddress: string
  /** The submitter, used for Reply-To only. Never trusted as the envelope sender. */
  replyToAddress: string | null
  replyToName: string | null
  /** Ordered label/value pairs, rendered as the body. */
  fields: Array<{ label: string; value: string }>
  /** Context the visitor did not supply: IP, country, user agent, timestamp. */
  meta: Array<{ label: string; value: string }>
}

export function buildMessage(input: MessageInput): string {
  const subjectWho = input.replyToName || input.replyToAddress || 'unknown sender'
  const subject = encodeHeader(`[envenox ${input.formName}] ${subjectWho}`)

  const bodyLines: string[] = []
  bodyLines.push(`A ${input.formName} form was submitted on envenox.com.`)
  bodyLines.push('')
  for (const f of input.fields) {
    bodyLines.push(`${f.label}:`)
    // Body text is base64 encoded below, so newlines here are safe and kept.
    bodyLines.push(String(f.value).replace(/\r\n?/g, '\n').trim() || '(empty)')
    bodyLines.push('')
  }
  bodyLines.push('--')
  for (const m of input.meta) bodyLines.push(`${m.label}: ${m.value}`)
  bodyLines.push('')
  bodyLines.push('Sent by the envenox-forms Worker. Reply directly to answer the sender.')

  // Base64 with 76-column wrapping. This solves two problems at once: UTF-8
  // content survives intact, and no line can exceed SMTP's 998 character
  // limit no matter what the visitor pasted into the textarea.
  const encodedBody = (b64(bodyLines.join('\r\n')).match(/.{1,76}/g) ?? []).join('\r\n')

  const headers = [
    `From: ${encodeHeader('Envenox website')} <${input.fromAddress}>`,
    `To: <${input.toAddress}>`,
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@envenox.com>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    'Auto-Submitted: auto-generated',
    `X-Envenox-Form: ${headerValue(input.formName, 40)}`,
  ]

  if (input.replyToAddress) {
    const name = input.replyToName ? `${encodeHeader(input.replyToName)} ` : ''
    headers.push(`Reply-To: ${name}<${input.replyToAddress}>`)
  }

  return headers.join('\r\n') + '\r\n\r\n' + encodedBody + '\r\n'
}
