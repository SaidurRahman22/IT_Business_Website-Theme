import type { Field } from '@/lib/contact'

/**
 * The vulnerability report intake schema.
 *
 * `lib/contact.ts` owns `enquiryFields`; it does not own this one, so the
 * schema lives here and reuses that module's `Field` type so both forms render
 * through the same `Fields.tsx` component and validate through the same
 * `validate.ts`.
 *
 * Every field below exists because `legalDocsBySlug['vulnerability-disclosure']`
 * asks for it: "what you did, what happened, and enough detail for us to
 * reproduce it", the scope statement, and the credit-or-silence choice. Nothing
 * asks for an account, an NDA, or a severity score - the policy says we do the
 * scoring, so there is no severity dropdown here.
 */

/**
 * ECHO POLICY: every field below that carries content or identity is
 * `echo: false`. On a validation failure the other forms bounce the submitted
 * values back in the query string so nothing is retyped; this form must not,
 * because its content is an UNPATCHED VULNERABILITY IN THIS SITE.
 *
 * Two of the seven controls are easy to miss - `credit` is a select that
 * defaults to the empty "Choose one", and `rules` is a required checkbox - so
 * the failure path is one a researcher with a working exploit will actually
 * hit. Without this policy that bounce writes the reproduction steps and the
 * exploitation path into browser history, the address bar, and every forward
 * proxy and edge log between them and us. `Referrer-Policy` does not touch any
 * of those.
 *
 * The cost is real: a researcher who bounces retypes the body. The UX-preserving
 * fix is to carry the values in a short-lived __Host- cookie instead of the URL,
 * which keeps the no-JavaScript contract (still one POST, one redirect). Until
 * that exists, retyping is the correct trade.
 */
export const reportFields: Field[] = [
  {
    name: 'name',
    echo: false,
    label: 'Your name or handle',
    type: 'text',
    required: false,
    autoComplete: 'name',
    help: 'Optional. Use a handle if you prefer; we will credit whichever you give us, or neither.',
  },
  {
    name: 'email',
    echo: false,
    label: 'Email for the acknowledgement',
    type: 'email',
    required: true,
    autoComplete: 'email',
    help: 'Required so a person can acknowledge this within one business day and come back to you with the triage decision.',
  },
  {
    name: 'target',
    echo: false,
    label: 'Affected host, URL or endpoint',
    type: 'text',
    required: true,
    help: 'In scope: envenox.com, its subdomains, and the Envenox engagement platform. Anything belonging to a client is out of scope, report it to them.',
  },
  {
    name: 'summary',
    echo: false,
    label: 'What you did, and what happened',
    type: 'textarea',
    required: true,
    help: 'A reproduction path is worth more than a severity score. Include the steps, the request, and what came back.',
  },
  {
    name: 'impact',
    echo: false,
    label: 'What an attacker could do with it',
    type: 'textarea',
    required: false,
    help: 'Optional. If you stopped at proof of concept, which the policy asks you to, say what you believe the next step would have been rather than taking it.',
  },
  {
    name: 'credit',
    label: 'Credit preference',
    type: 'select',
    required: true,
    options: [
      { value: '', label: 'Choose one' },
      { value: 'credit', label: 'Credit me in the acknowledgements' },
      { value: 'anonymous', label: 'Do not name me anywhere' },
      { value: 'decide-later', label: 'Ask me again once it is fixed' },
    ],
  },
  {
    name: 'rules',
    label: 'I tested only accounts I own or have permission to test, and I stopped at proof of concept.',
    type: 'checkbox',
    required: true,
    help: 'The rules of engagement in the policy. Ticking this is not a legal waiver and it does not transfer anything to us, it tells us the report is good-faith research within scope, which is the condition under which we will not pursue legal action.',
  },
]
