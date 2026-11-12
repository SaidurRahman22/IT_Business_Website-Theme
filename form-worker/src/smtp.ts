/**
 * A minimal SMTP client for Cloudflare Workers.
 *
 * Implicit TLS on port 465 by default. Port 25 is blocked by the Workers
 * runtime ("Connections to port 25 are prohibited"), which is why 465 is the
 * target rather than the conventional relay port.
 *
 * Scope is deliberately small: connect, authenticate, send one message, quit.
 * It is not a general SMTP library and should not grow into one.
 */

import { connect } from 'cloudflare:sockets'

export class SmtpError extends Error {
  constructor(
    message: string,
    readonly code?: number,
    readonly stage?: string,
  ) {
    super(message)
    this.name = 'SmtpError'
  }
}

export type SmtpConfig = {
  hostname: string
  port: number
  username: string
  password: string
  /** Per-command deadline. The whole send is bounded by the Worker's own limit. */
  timeoutMs?: number
}

export type Envelope = {
  from: string
  to: string
  /** Full RFC 5322 message: headers, blank line, body. CRLF line endings. */
  message: string
}

/**
 * Reads SMTP replies off a socket.
 *
 * A reply may span several lines: continuation lines are `250-TEXT` and the
 * final line is `250 TEXT`, with a SPACE in the fourth position. Reading a
 * single chunk is not enough, because TCP gives no guarantee that one read
 * returns one reply, and a multiline EHLO routinely arrives split.
 */
class ReplyReader {
  private buf = ''
  private readonly decoder = new TextDecoder()

  constructor(private readonly reader: ReadableStreamDefaultReader<Uint8Array>) {}

  async read(stage: string, timeoutMs: number): Promise<{ code: number; text: string }> {
    const deadline = Date.now() + timeoutMs
    for (;;) {
      const complete = this.takeCompleteReply()
      if (complete) return complete

      const remaining = deadline - Date.now()
      if (remaining <= 0) throw new SmtpError(`timed out waiting for reply`, undefined, stage)

      const chunk = await Promise.race([
        this.reader.read(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new SmtpError('timed out', undefined, stage)), remaining),
        ),
      ])
      if (chunk.done) throw new SmtpError('connection closed by server', undefined, stage)
      if (chunk.value) this.buf += this.decoder.decode(chunk.value, { stream: true })
    }
  }

  /** Returns a reply only once its final line has arrived. */
  private takeCompleteReply(): { code: number; text: string } | null {
    const lines = this.buf.split('\r\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? ''
      // Final line of a reply: three digits then a space.
      if (/^\d{3} /.test(line)) {
        const text = lines.slice(0, i + 1).join('\n')
        this.buf = lines.slice(i + 1).join('\r\n')
        return { code: Number(line.slice(0, 3)), text }
      }
    }
    return null
  }
}

export async function sendMail(cfg: SmtpConfig, envelope: Envelope): Promise<void> {
  const timeoutMs = cfg.timeoutMs ?? 10_000
  const socket = connect(
    { hostname: cfg.hostname, port: cfg.port },
    { secureTransport: 'on', allowHalfOpen: false },
  )

  const writer = socket.writable.getWriter()
  const rawReader = socket.readable.getReader()
  const replies = new ReplyReader(rawReader)
  const encoder = new TextEncoder()

  const send = async (line: string) => {
    await writer.write(encoder.encode(line + '\r\n'))
  }

  /** Send a command and require one of `expect`, else throw with the server's own words. */
  const step = async (stage: string, line: string | null, expect: number[]) => {
    if (line !== null) await send(line)
    const reply = await replies.read(stage, timeoutMs)
    if (!expect.includes(reply.code)) {
      const firstLine = reply.text.split('\n')[0] ?? ''
      throw new SmtpError(
        `${stage}: server replied ${reply.code} ${firstLine.slice(4)}`,
        reply.code,
        stage,
      )
    }
    return reply
  }

  try {
    await step('greeting', null, [220])
    await step('ehlo', `EHLO envenox.com`, [250])

    // AUTH LOGIN: the server prompts for username then password, each base64.
    // PLAIN would be one round trip, but LOGIN is what Zoho advertises first
    // and is accepted everywhere; the extra round trip is not worth optimising.
    await step('auth', 'AUTH LOGIN', [334])
    await step('auth-user', btoa(cfg.username), [334])
    await step('auth-pass', btoa(cfg.password), [235])

    await step('mail-from', `MAIL FROM:<${envelope.from}>`, [250])
    await step('rcpt-to', `RCPT TO:<${envelope.to}>`, [250, 251])
    await step('data', 'DATA', [354])

    // The message terminates with a lone dot, so any body line that is itself
    // a lone dot must be escaped or it ends the message early. This is the
    // classic SMTP injection vector and is not optional.
    const stuffed = envelope.message.replace(/\r\n\./g, '\r\n..')
    await writer.write(encoder.encode(stuffed))
    if (!stuffed.endsWith('\r\n')) await writer.write(encoder.encode('\r\n'))
    await step('data-end', '.', [250])

    await send('QUIT')
  } finally {
    // Close in a fixed order and never let cleanup mask the real error.
    try {
      await writer.close()
    } catch {
      /* already closed */
    }
    try {
      await rawReader.cancel()
    } catch {
      /* already cancelled */
    }
    try {
      await socket.close()
    } catch {
      /* already closed */
    }
  }
}
