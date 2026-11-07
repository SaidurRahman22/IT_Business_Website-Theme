/**
 * `/contact` content.
 *
 * Three explicit routes, and the incident route is NOT behind a form. If a firm
 * sells incident response, the hotline is a visible `tel:` link - a company in
 * hour one of a breach should not be filling in a service-interest dropdown.
 *
 * The form itself must exist in server-rendered HTML. One competitor's
 * `/get-started` page contains no form at all in its served markup; it is
 * injected by JavaScript, so the money page is empty to anything that does not
 * execute it.
 */

import { site } from './site'

export const contactIntro = {
  eyebrow: 'Get started',
  /** A heading that names the NEXT STEP, not "Contact us". */
  heading: 'Book a 60-minute scoping call',
  lead: 'A technical conversation with the person who would lead the work, not a qualification script, not a discovery deck. You come away with a written scope, the exclusions stated in the body rather than in an appendix, and a day count that we have not padded.',
}

export type ContactRoute = {
  id: string
  label: string
  heading: string
  body: string
  urgency: 'standard' | 'emergency'
  action: { kind: 'form' | 'tel' | 'email' | 'calendar'; label: string; href: string }
  secondary?: { label: string; href: string }
  sla: string
}

export const contactRoutes: ContactRoute[] = [
  {
    id: 'new-enquiry',
    label: 'New enquiry',
    heading: 'You have a project, a deadline, or an auditor asking questions',
    body: 'Tell us what you are trying to achieve and what constrains it. If what you need is not what you asked for, we will say so on the first call rather than in month three. We have told clients to buy two penetration tests instead of the red team they came for, and to buy a package instead of the custom build.',
    urgency: 'standard',
    action: { kind: 'form', label: 'Send an enquiry', href: '#enquiry-form' },
    secondary: { label: 'Or book directly in a calendar', href: '/book-a-call' },
    sla: 'A named engineer replies within one business day. Scoping call within three.',
  },
  {
    id: 'incident',
    label: 'Active incident',
    heading: 'You think you are being attacked right now',
    body: 'Do not use the form. Do not email. Do not reboot or rebuild anything yet, a well-meaning rebuild destroys the evidence that would tell you what was taken. Call the hotline: a responder answers, and the first five minutes of that conversation routinely change the outcome. You do not need to be a client and that call is free.',
    urgency: 'emergency',
    action: { kind: 'tel', label: site.contact.irHotline, href: site.contact.irHotlineHref },
    secondary: { label: 'What happens on an incident engagement', href: '/services/incident-response' },
    sla: site.contact.irHotlineCommitment,
  },
  {
    id: 'careers',
    label: 'Careers & press',
    heading: 'You want to work here, or you are writing about us',
    body: 'Open roles are listed with salary bands, because a role advertised without one wastes everybody’s afternoon. For press, we will talk about methodology, research and the industry; we will not confirm or discuss a client, including whether one exists.',
    urgency: 'standard',
    action: { kind: 'email', label: site.contact.careersEmail, href: `mailto:${site.contact.careersEmail}` },
    secondary: { label: 'Open roles', href: '/careers' },
    sla: 'Careers: a reply within five working days, including a no. Press: same business day.',
  },
]

/** The form schema. Rendered server-side; works without JavaScript. */
export type Field = {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox'
  required: boolean
  autoComplete?: string
  options?: { value: string; label: string }[]
  help?: string
  /**
   * Whether this field's submitted value may be echoed back in the failure
   * redirect's query string. Defaults to TRUE, which is the right default for
   * an ordinary enquiry: a bounced form that has forgotten what you typed is
   * hostile.
   *
   * Set it to FALSE wherever the submitted text is itself a secret. A query
   * string persists in browser history, the address bar (screenshots, screen
   * shares, shoulder-surfing) and every forward-proxy and edge access log
   * between the sender and the origin - none of which `Referrer-Policy`
   * touches. `report-fields.ts` sets it false on the whole vulnerability
   * report body, because that content is an UNPATCHED FLAW IN THIS SITE and a
   * researcher who misses one required control should not have their exploit
   * written into a log as the price.
   *
   * Error CODES still travel in the URL regardless. They are a closed
   * vocabulary, re-validated on the way in, and carry no content.
   */
  echo?: boolean
}

export const enquiryFields: Field[] = [
  { name: 'name', label: 'Your name', type: 'text', required: true, autoComplete: 'name' },
  {
    name: 'email',
    label: 'Business email',
    type: 'email',
    required: true,
    autoComplete: 'email',
    help: 'We reply from a person, not a no-reply address.',
  },
  { name: 'company', label: 'Company', type: 'text', required: true, autoComplete: 'organization' },
  { name: 'country', label: 'Country', type: 'text', required: true, autoComplete: 'country-name', help: 'Relevant for data residency and time zone.' },
  {
    name: 'interest',
    label: 'What is this about',
    type: 'select',
    required: true,
    options: [
      { value: '', label: 'Choose one' },
      { value: 'penetration-testing', label: 'Penetration testing' },
      { value: 'application-security', label: 'Application security programme' },
      { value: 'cloud-security', label: 'Cloud security review' },
      { value: 'grc-compliance', label: 'SOC 2 / ISO 27001 / PCI DSS' },
      { value: 'managed-detection-response', label: 'Managed detection & response' },
      { value: 'red-teaming', label: 'Red team' },
      { value: 'vciso', label: 'vCISO' },
      { value: 'custom-software', label: 'Custom software build' },
      { value: 'web-application-development', label: 'Web application' },
      { value: 'platform-engineering', label: 'Platform & DevOps' },
      { value: 'business-systems', label: 'ERP / CRM / HRM / LMS' },
      { value: 'devsecops', label: 'Secure SDLC, build and test together' },
      { value: 'not-sure', label: 'Not sure yet, help me work it out' },
    ],
  },
  {
    name: 'message',
    label: 'What are you trying to achieve, and what is the deadline',
    type: 'textarea',
    required: true,
    help: 'Two or three sentences is plenty. The constraint is usually more useful than the requirement.',
  },
  {
    name: 'consent',
    label: 'I agree to Envenox contacting me about this enquiry.',
    type: 'checkbox',
    required: true,
    help: 'We keep enquiry details for 24 months from last contact and never share them. See the privacy notice.',
  },
]

/** "What happens next" - the section that reduces the cost of making contact. */
export const whatHappensNext = [
  {
    n: 1,
    name: 'A person reads it',
    body: 'Within one business day, and the reply comes from the practice lead for whatever you asked about, not from an inbox.',
  },
  {
    n: 2,
    name: 'A 60-minute technical call',
    body: 'With the person who would lead the work. We will ask what constrains the problem, and we will tell you on that call if we think you are buying the wrong thing.',
  },
  {
    n: 3,
    name: 'A written scope within five days',
    body: 'Scope, explicit exclusions, timeline, named team and price. The exclusions are in the body of the document. The team names are individuals, not roles.',
  },
  {
    n: 4,
    name: 'You decide, with no pressure applied',
    body: 'We do not chase. If the timing is wrong, say so and we will leave you alone until you come back.',
  },
]

export const contactReassurance = [
  { label: 'NDA', value: 'We will sign yours before the first call if you prefer. We do not insist on ours.' },
  { label: 'Your data', value: 'Enquiry details held 24 months from last contact, never shared, never used to train a model.' },
  { label: 'Our own posture', value: 'ISO/IEC 27001:2022 certified, SOC 2 Type II report under NDA, every engineer background-checked. Published at /trust rather than described on request.' },
  { label: 'No self-serve', value: 'There is no trial and no sign-up, because you are buying people and a document rather than a licence.' },
]

export const thankYou = {
  heading: 'Received. A person has it.',
  body: 'You will hear from the practice lead within one business day. In the meantime, the most useful thing most people read next is the report walkthrough. It is the document you would actually be buying.',
  /** The thank-you page hands over a NEXT ASSET rather than ending the journey. */
  nextAsset: { label: 'Walk a sample report', href: '/sample-report' },
  secondary: { label: 'Or read how the two practices work together', href: '/services/devsecops' },
  incidentNote: `If your situation has changed and this is now urgent, call ${site.contact.irHotline}, do not wait for our reply.`,
}
