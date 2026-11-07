/**
 * The inline enquiry form.
 *
 * SERVER-RENDERED, NO-JAVASCRIPT: every control, every `<label>` and every
 * option is in the served HTML. Labels are visible text, never a placeholder
 * standing in for one - a placeholder disappears the moment someone types,
 * which is precisely when they need to know what the field was.
 *
 * The schema is `enquiryFields` from lib/contact.ts, read rather than restated,
 * so the form, the validator in ./actions.ts and the /contact page cannot drift.
 *
 * ERROR STATE WITHOUT SCRIPTING: both summaries are always in the markup and
 * hidden with `display: none`; the server action redirects to one of their
 * anchors and `:target` reveals it. No client state, no hydration, and - the
 * reason it is done this way - no `searchParams` read, which would have opted
 * every service page out of static generation. See chrome.tsx for the full note.
 */

import type { Field } from '@/lib/contact'
import { enquiryFields } from '@/lib/contact'
import { site } from '@/lib/site'
import { Button } from '@/components/ui/Button'

/** id -> message. Each is rendered hidden and revealed by :target. */
const ERRORS: readonly { id: string; message: string }[] = [
  {
    id: 'enquiry-incomplete',
    message:
      'Some required fields came through empty. They are marked below, fill them in and send again.',
  },
  {
    id: 'enquiry-email',
    message: 'That email address did not look complete. Check it and send again.',
  },
]

function FieldControl({ field, id }: { field: Field; id: string }) {
  const describedBy = field.help ? `${id}-help` : undefined

  if (field.type === 'select') {
    return (
      <select
        id={id}
        name={field.name}
        className="sv-select"
        required={field.required}
        defaultValue=""
        aria-describedby={describedBy}
      >
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value} disabled={option.value === ''}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea
        id={id}
        name={field.name}
        className="sv-textarea"
        rows={5}
        required={field.required}
        aria-describedby={describedBy}
      />
    )
  }

  return (
    <input
      id={id}
      name={field.name}
      className="sv-input"
      type={field.type}
      required={field.required}
      autoComplete={field.autoComplete}
      aria-describedby={describedBy}
    />
  )
}

export type EnquiryFormProps = {
  /** The path this form posts from, so a validation bounce returns here. */
  returnTo: string
  /** Pre-select the "What is this about" option, e.g. a service slug. */
  interest?: string
  id?: string
}

export function EnquiryForm({ returnTo, interest, id = 'enquiry-form' }: EnquiryFormProps) {
  return (
    // React supplies method="post" and the encType itself for a function
    // action, and warns if either is restated here. The served markup is still
    // an ordinary POST form with a hidden action id, which is what makes the
    // no-JavaScript path work.
    <form action="/thank-you" method="get" className="sv-form" id={id}>
      <input type="hidden" name="from" value="enquiry" />
      <input type="hidden" name="returnTo" value={returnTo} />

      {ERRORS.map((entry) => (
        <div key={entry.id} id={entry.id} className="sv-form__error" role="alert">
          <p>{entry.message}</p>
        </div>
      ))}

      {enquiryFields.map((field) => {
        const controlId = `enq-${field.name}`

        if (field.type === 'checkbox') {
          return (
            <div key={field.name} className="sv-field sv-field--check">
              <input
                id={controlId}
                name={field.name}
                type="checkbox"
                className="sv-check"
                required={field.required}
                aria-describedby={field.help ? `${controlId}-help` : undefined}
              />
              <span>
                <label className="sv-label" htmlFor={controlId}>
                  {field.label}
                  {field.required ? (
                    <span className="sv-req" aria-hidden="true">
                      *
                    </span>
                  ) : null}
                </label>
                {field.help ? (
                  <p className="sv-help" id={`${controlId}-help`}>
                    {field.help}
                  </p>
                ) : null}
              </span>
            </div>
          )
        }

        // The interest select is the one field a service page can pre-answer.
        const control =
          field.type === 'select' && interest ? (
            <select
              id={controlId}
              name={field.name}
              className="sv-select"
              required={field.required}
              defaultValue={
                (field.options ?? []).some((o) => o.value === interest) ? interest : ''
              }
              aria-describedby={field.help ? `${controlId}-help` : undefined}
            >
              {(field.options ?? []).map((option) => (
                <option key={option.value} value={option.value} disabled={option.value === ''}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <FieldControl field={field} id={controlId} />
          )

        return (
          <div key={field.name} className="sv-field">
            <label className="sv-label" htmlFor={controlId}>
              {field.label}
              {field.required ? (
                <span className="sv-req" aria-hidden="true">
                  *
                </span>
              ) : null}
            </label>
            {control}
            {field.help ? (
              <p className="sv-help" id={`${controlId}-help`}>
                {field.help}
              </p>
            ) : null}
          </div>
        )
      })}

      <p className="sv-help">
        <span aria-hidden="true" className="sv-req">
          *
        </span>{' '}
        Required.
      </p>

      <div className="sv-form__actions">
        <Button type="submit" variant="primary" size="lg">
          Send an enquiry
        </Button>
        <p className="sv-form__sla">{site.contact.responseSla}</p>
      </div>
    </form>
  )
}

export default EnquiryForm
