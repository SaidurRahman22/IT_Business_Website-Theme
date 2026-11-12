import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { enquiryFields } from '@/lib/contact'
import { site } from '@/lib/site'
import { Button } from '@/components/ui/Button'
import { ErrorSummary, FormField, FormStyles, Honeypot } from './Fields'
import { decodeErrors, decodeValues } from './validate'

/**
 * The enquiry form. Server-rendered markup, server-side validation, server
 * action submit. No client component anywhere in the tree.
 *
 * One competitor's `/get-started` ships no form at all in its served HTML - it
 * is injected by JavaScript, so their money page is empty to a crawler, a
 * reader-mode pass, a link preview, and anyone whose script request failed.
 * Verify this one by fetching the route and grepping the body for `<form`:
 * the element, every label and every option is in the first byte of HTML.
 */

type RawParams = Record<string, string | string[] | undefined>

/** Which fields share a row at ≥640px. Anything unlisted spans the full width. */
const ROWS: string[][] = [
  ['name', 'email'],
  ['company', 'country'],
]

export type EnquiryFormProps = {
  /** The route this form lives on. Must be in the action's allowlist. */
  returnPath: '/contact' | '/get-started' | '/book-a-call'
  /** `searchParams` from the page, already awaited. */
  params: RawParams
  /** Submit button copy. The CTA differs per route; the form does not. */
  submitLabel: string
  /** Rendered beside the submit button. */
  note?: string
}

export function EnquiryForm({ returnPath, params, submitLabel, note }: EnquiryFormProps) {
  const errors = decodeErrors(enquiryFields, params)
  const values = decodeValues(enquiryFields, params)

  const byName = new Map(enquiryFields.map((f) => [f.name, f]))
  const paired = new Set(ROWS.flat())
  const rest = enquiryFields.filter((f) => !paired.has(f.name))

  return (
    <>
      <FormStyles />
      {/* POSTs to the envenox-forms Worker, which relays it over SMTP to the
          admin mailbox and then 303s the visitor to /thank-you. A plain form
          POST, so it works with scripting disabled. */}
      <form className="frm" action={site.forms.endpoint} method="post">
        <input type="hidden" name="form" value="enquiry" />
        <Honeypot />
        {/* Where a validation failure bounces back to. Validated against an
            allowlist in the action, never used as a raw redirect target. */}
        <input type="hidden" name="_return" value={returnPath} />

        <ErrorSummary id="enquiry-errors" fields={enquiryFields} errors={errors} />

        <div className="frm__grid">
          {ROWS.map((row) => {
            const fields = row.map((n) => byName.get(n)).filter((f) => f !== undefined)
            if (fields.length === 0) return null
            return (
              <div className="frm__grid frm__grid--2" key={row.join('-')}>
                {fields.map((field) => (
                  <FormField key={field.name} field={field} errors={errors} values={values} />
                ))}
              </div>
            )
          })}

          {rest.map((field) => (
            <FormField key={field.name} field={field} errors={errors} values={values} />
          ))}
        </div>

        <div className="frm__actions">
          <Button type="submit" size="lg" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
            {submitLabel}
          </Button>
          {note ? <p className="frm__note">{note}</p> : null}
        </div>

        <p className="frm__note">
          Fields marked without “(optional)” are required. Read how we handle what you send in the{' '}
          <Link className="u-link" href="/legal/privacy">
            privacy notice
          </Link>
          .
        </p>
      </form>
    </>
  )
}

export default EnquiryForm
