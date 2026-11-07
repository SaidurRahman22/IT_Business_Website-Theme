import { TriangleAlert } from 'lucide-react'
import type { Field } from '@/lib/contact'
import {
  ERROR_TEXT,
  maxLengthFor,
  orderedErrors,
  type FieldErrors,
  type FieldValues,
} from './validate'

/**
 * The form field renderer. A Server Component - no client bundle, no hydration
 * step, and therefore nothing the form depends on that JavaScript could fail
 * to deliver.
 *
 * ACCESSIBILITY CONTRACT
 *   · A real, visible <label> per control. Never a placeholder standing in for
 *     a label: a placeholder disappears the moment someone types, so by the
 *     time they make a mistake the question is gone.
 *   · `aria-describedby` points at the help text AND the error, in that order.
 *   · `aria-invalid="true"` on the control, `data-invalid` on its wrapper, so
 *     the failure is carried by a border and a left rule as well as by text.
 *   · Errors appear NEXT TO THE FIELD and in a summary at the top that links
 *     to the first invalid control. Both, because a summary alone makes you
 *     hunt and an inline message alone is invisible to someone who has just
 *     been bounced to the top of a long form.
 *   · Severity colours are not used. `--signal-*` is reserved for product UI
 *     and severity labels (see components/ui/Badge.tsx), so an invalid field is
 *     marked with weight, a 2px left rule, an inset ring and an icon instead.
 */

const CSS = `
.frm { display: grid; gap: var(--s8); }
.frm__grid { display: grid; gap: var(--s6); }
@media (min-width: 640px) {
  .frm__grid--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* ---- the field ---- */
.frm__field { display: grid; gap: var(--s2); min-width: 0; }
.frm__field[data-invalid='true'] {
  border-left: 2px solid var(--fg);
  padding-left: var(--s4);
  margin-left: -2px;
}

.frm__label {
  display: block;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fg);
  line-height: 1.35;
}
.frm__optional {
  font-weight: 400;
  color: var(--muted);
}

.frm__help {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.45;
  color: var(--muted);
  max-width: 62ch;
}

/* ---- controls ---- */
.frm__control {
  width: 100%;
  min-height: 44px;
  padding: var(--s3) var(--s4);
  background-color: var(--bg);
  color: var(--fg);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--text-base);
  line-height: 1.45;
  transition:
    border-color var(--dur-micro) var(--ease-out),
    background-color var(--dur-micro) var(--ease-out);
}
.frm__control::placeholder { color: var(--muted); }
.frm__control:hover { border-color: var(--fg); }
textarea.frm__control { min-height: 144px; resize: vertical; }
select.frm__control {
  appearance: none;
  background-image: none;
  padding-right: var(--s8);
  cursor: pointer;
}
/* A hairline chevron drawn by the wrapper, so the native arrow is not needed. */
.frm__select { position: relative; display: grid; }
.frm__select::after {
  content: '';
  position: absolute;
  right: var(--s4);
  top: 50%;
  width: 7px;
  height: 7px;
  margin-top: -5px;
  border-right: 1px solid var(--muted);
  border-bottom: 1px solid var(--muted);
  transform: rotate(45deg);
  pointer-events: none;
}

.frm__control[aria-invalid='true'] {
  border-color: var(--fg);
  box-shadow: inset 0 0 0 1px var(--fg);
}

/* ---- checkbox ---- */
.frm__check {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--s3);
  align-items: start;
}
.frm__check input[type='checkbox'] {
  width: 20px;
  height: 20px;
  margin: 2px 0 0;
  flex: none;
  accent-color: var(--accent);
  cursor: pointer;
}
.frm__check .frm__label { cursor: pointer; }

/* ---- the inline error ---- */
.frm__error {
  display: flex;
  align-items: flex-start;
  gap: var(--s2);
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.45;
  color: var(--fg);
}
.frm__error svg { flex: none; margin-top: 2px; }

/* ---- the summary ---- */
.frm__summary {
  border: 1px solid var(--fg);
  border-left-width: 3px;
  border-radius: var(--radius-md);
  background-color: var(--surface);
  padding: var(--s4) var(--s6);
}
.frm__summary:focus-visible { outline-offset: 4px; }
.frm__summary h3 {
  display: flex;
  align-items: center;
  gap: var(--s2);
  margin: 0;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--fg);
}
.frm__summary ol {
  margin: var(--s3) 0 0;
  padding-left: var(--s4);
  font-size: var(--text-sm);
  color: var(--muted-strong);
}
.frm__summary li + li { margin-top: var(--s1); }
.frm__summary a { color: var(--fg); }

/* ---- footer row ---- */
.frm__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s4);
}
.frm__note {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--muted);
  max-width: 58ch;
}

.frm__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
`

/**
 * STATIC EXPORT - WHY THESE INPUTS CARRY NO `name`
 *
 * This site is a static export served from Workers Assets. There is no server
 * to receive a POST, so every form now submits GET to /thank-you.
 *
 * A GET submit puts every named field into the query string. For a contact form
 * that means the sender's name, email, company and message land in the URL, and
 * from there in browser history, the Referer header of every subsequent request,
 * and any access log along the path. This project already rejected that class of
 * leak once: `echo: false` exists in lib/contact.ts precisely to keep submitted
 * values out of bounce-back URLs.
 *
 * Nothing currently consumes these values - the former Server Actions only
 * validated and redirected, sending and storing nothing - so omitting `name`
 * removes the leak at zero functional cost. The inputs, labels, options and
 * `required`/`type` validation all remain in the served HTML, so the form is
 * still complete to a crawler, to reader mode, and with scripting disabled.
 *
 * WHEN A REAL BACKEND IS ADDED: set SUBMITS_VALUES to true and point the forms
 * at it. That is the only change needed here.
 */
const SUBMITS_VALUES = false

export function FormStyles() {
  return (
    <style href="envenox-form" precedence="default">
      {CSS}
    </style>
  )
}

/* ------------------------------------------------------------------ *
 * Error summary
 * ------------------------------------------------------------------ */

export function ErrorSummary({
  id,
  fields,
  errors,
}: {
  id: string
  fields: readonly Field[]
  errors: FieldErrors
}) {
  const list = orderedErrors(fields, errors)
  if (list.length === 0) return null

  return (
    <div
      id={id}
      className="frm__summary"
      role="alert"
      tabIndex={-1}
      // The fragment lands here, so make it a real focus target.
      aria-labelledby={`${id}-heading`}
    >
      <h3 id={`${id}-heading`}>
        <TriangleAlert size={18} aria-hidden="true" />
        {list.length === 1
          ? 'One field needs attention before this can be sent'
          : `${list.length} fields need attention before this can be sent`}
      </h3>
      <ol>
        {list.map(({ field, code }) => (
          <li key={field.name}>
            <a className="u-link" href={`#${fieldId(field.name)}`}>
              {field.label}
            </a>{' '}
           , {ERROR_TEXT[code]}
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * One field
 * ------------------------------------------------------------------ */

export const fieldId = (name: string) => `f-${name}`

type FieldProps = {
  field: Field
  errors: FieldErrors
  values: FieldValues
  /** Rendered beneath the control, after the help text. */
  children?: never
}

export function FormField({ field, errors, values }: FieldProps) {
  const id = fieldId(field.name)
  const code = errors[field.name]
  const helpId = field.help ? `${id}-help` : undefined
  const errorId = code ? `${id}-error` : undefined
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined
  const value = values[field.name] ?? ''
  const maxLength = maxLengthFor(field)

  const labelNode = (
    <label className="frm__label" htmlFor={id}>
      {field.label}
      {field.required ? null : <span className="frm__optional"> (optional)</span>}
    </label>
  )

  const errorNode = code ? (
    <p className="frm__error" id={errorId}>
      <TriangleAlert size={16} aria-hidden="true" />
      <span>
        <span className="frm__sr">Error: </span>
        {ERROR_TEXT[code]}
      </span>
    </p>
  ) : null

  const helpNode = field.help ? (
    <p className="frm__help" id={helpId}>
      {field.help}
    </p>
  ) : null

  /* ---- checkbox: label sits beside the box, not above it ---- */
  if (field.type === 'checkbox') {
    return (
      <div className="frm__field" data-invalid={code ? 'true' : undefined}>
        <div className="frm__check">
          <input
            id={id}
            name={SUBMITS_VALUES ? field.name : undefined}
            type="checkbox"
            value="yes"
            required={field.required}
            aria-invalid={code ? 'true' : undefined}
            aria-describedby={describedBy}
          />
          <div>
            {labelNode}
            {helpNode}
          </div>
        </div>
        {errorNode}
      </div>
    )
  }

  /* ---- select ---- */
  if (field.type === 'select') {
    return (
      <div className="frm__field" data-invalid={code ? 'true' : undefined}>
        {labelNode}
        {helpNode}
        <div className="frm__select">
          <select
            id={id}
            name={SUBMITS_VALUES ? field.name : undefined}
            className="frm__control"
            required={field.required}
            defaultValue={value}
            autoComplete={field.autoComplete}
            aria-invalid={code ? 'true' : undefined}
            aria-describedby={describedBy}
          >
            {(field.options ?? []).map((option) => (
              <option key={option.value || 'empty'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {errorNode}
      </div>
    )
  }

  /* ---- textarea ---- */
  if (field.type === 'textarea') {
    return (
      <div className="frm__field" data-invalid={code ? 'true' : undefined}>
        {labelNode}
        {helpNode}
        <textarea
          id={id}
          name={SUBMITS_VALUES ? field.name : undefined}
          className="frm__control"
          rows={5}
          required={field.required}
          defaultValue={value}
          maxLength={maxLength}
          autoComplete={field.autoComplete}
          aria-invalid={code ? 'true' : undefined}
          aria-describedby={describedBy}
        />
        {errorNode}
      </div>
    )
  }

  /* ---- text / email / tel ---- */
  return (
    <div className="frm__field" data-invalid={code ? 'true' : undefined}>
      {labelNode}
      {helpNode}
      <input
        id={id}
        name={SUBMITS_VALUES ? field.name : undefined}
        type={field.type}
        className="frm__control"
        required={field.required}
        defaultValue={value}
        maxLength={maxLength}
        autoComplete={field.autoComplete}
        aria-invalid={code ? 'true' : undefined}
        aria-describedby={describedBy}
      />
      {errorNode}
    </div>
  )
}
