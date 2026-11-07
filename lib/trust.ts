/**
 * Trust centre content.
 *
 * None of the thirteen competitor sites studied had a visible trust centre.
 * That is an open goal: a firm that sells security services *and holds client
 * source code* should publish its own posture rather than describe it on
 * request. This page is the easiest differentiator available.
 *
 * Everything here is a commitment the company must actually be able to meet.
 * Where a commitment is not yet true, the honest move is to delete the row -
 * not to soften the wording.
 */

export type TrustSection = {
  id: string
  heading: string
  /** One sentence a buyer can act on, before any detail. */
  summary: string
  rows?: { label: string; value: string; note?: string }[]
  body?: string[]
}

export const trustIntro = {
  heading: 'What we do with your systems, your code and your data',
  lead: 'We ask clients to let our engineers read their source and our testers reach their production systems. That is a significant thing to ask for, and the reasonable response is to ask what we do with it. This page answers that without a form, a sales call or an NDA.',
  note: 'Where a control below is scoped, the scope is stated. Where something is not yet in place, it says so. A trust page that claims everything is a trust page nobody believes.',
}

export const trustSections: TrustSection[] = [
  {
    id: 'certifications',
    heading: 'Our own certifications',
    summary:
      'ISO/IEC 27001:2022 and SOC 2 Type II, both scoped to the delivery of client engagements rather than to a convenient subset.',
    rows: [
      { label: 'ISO/IEC 27001:2022', value: 'Certified', note: 'Scope: delivery of cybersecurity and software development services, London and Dhaka. Certificate number and UKAS-accredited body named on /certifications.' },
      { label: 'SOC 2 Type II', value: 'Report available under NDA', note: 'Security, Availability and Confidentiality criteria. Twelve-month observation window.' },
      { label: 'Cyber Essentials Plus', value: 'Certified', note: 'Whole organisation, audited technical controls, annual.' },
      { label: 'ISO 9001:2015', value: 'Certified', note: 'Scope: software development delivery.' },
      { label: 'ISO/IEC 27701', value: 'Not held', note: 'Privacy controls are operated under the 27001 ISMS. We have not sought separate 27701 certification and will say so rather than implying it.' },
    ],
  },
  {
    id: 'people',
    heading: 'Who touches your systems',
    summary:
      'Every engineer and tester is background-checked before they are assigned to an engagement, and the policy is published here rather than described on request.',
    rows: [
      { label: 'Identity and right to work', value: 'Verified for all staff before start date' },
      { label: 'Basic criminal record check', value: 'All staff', note: 'DBS Basic in the UK; local equivalent elsewhere. Renewed every three years.' },
      { label: 'Enhanced screening', value: 'BS 7858 for staff on financial services and public sector engagements', note: 'Five-year employment history, two references, credit and sanctions check.' },
      { label: 'Confidentiality', value: 'Individual NDA signed at onboarding, surviving termination' },
      { label: 'Subcontractors', value: 'Rare, always disclosed before an engagement starts', note: 'Held to the same screening standard, named in the statement of work. We do not subcontract testing without telling you who to.' },
      { label: 'Leaver process', value: 'Access revoked across identity, devices and client systems on the last working day', note: 'Completion tracked; exceptions escalated to the COO. Stale credentials belonging to former staff is one of the most common findings in our own internal testing, so we audit ours quarterly.' },
    ],
  },
  {
    id: 'your-data',
    heading: 'Your data and your evidence',
    summary:
      'Engagement evidence lives in a per-engagement encrypted workspace in the region you specify, and is destroyed 90 days after the retest unless you ask us to hold it.',
    rows: [
      { label: 'Isolation', value: 'One workspace per engagement', note: 'No shared evidence store. A tester on one engagement cannot reach another engagement’s evidence.' },
      { label: 'Access', value: 'Named engagement team only, reviewed at engagement close' },
      { label: 'Encryption', value: 'AES-256 at rest, TLS 1.3 in transit', note: 'Customer-managed keys available on request for retainer clients.' },
      { label: 'Residency', value: 'UK or EU by default; other regions on request', note: 'Stated in the statement of work before work starts, not negotiated afterwards.' },
      { label: 'Retention', value: 'Destroyed 90 days after retest', note: 'Extended only on your written instruction, for example to support an audit. Destruction is logged and the log is available to you.' },
      { label: 'Source code', value: 'Read-only access, scoped to the engagement, for the engagement duration', note: 'Cloned only into the engagement workspace. We can work in your environment on your hardware where your policy requires it.' },
      { label: 'Production access', value: 'Time-boxed, logged, and revoked at engagement close', note: 'We ask for the least access that makes the engagement possible and will tell you when a scope reduction would cost you coverage.' },
    ],
  },
  {
    id: 'sub-processors',
    heading: 'Sub-processors',
    summary:
      'The full list, with what each one processes and where. Material additions are notified 30 days in advance.',
    rows: [
      { label: 'Amazon Web Services', value: 'Engagement workspaces, evidence storage, eu-west-2 (London)' },
      { label: 'Microsoft 365', value: 'Email, documents, internal collaboration, UK and EU tenancy' },
      { label: 'Atlassian', value: 'Engagement tracking, EU data residency' },
      { label: 'Slack', value: 'Client engagement channels, EU data residency, Enterprise Key Management' },
      { label: 'Zoom', value: 'Scoping and debrief calls, recordings disabled by default' },
      { label: '1Password', value: 'Credential management, zero-knowledge architecture' },
      { label: 'DocuSign', value: 'Contracts and attestation letters, EU' },
    ],
    body: [
      'We do not use client data to train any model, we do not send client code or evidence to a third-party AI service, and no sub-processor above has access to engagement evidence except AWS as the storage provider.',
      'A current, dated version of this list with each processor’s role, location and transfer mechanism is available as a signed PDF for your DPA annex.',
    ],
  },
  {
    id: 'our-posture',
    heading: 'How we test ourselves',
    summary:
      'We buy an annual external penetration test and a red team from a competitor, and we publish the cadence rather than the results.',
    rows: [
      { label: 'External penetration test', value: 'Annual, by an independent CREST-accredited firm', note: 'Not by us. A firm that only tests itself is not telling you anything.' },
      { label: 'Red team', value: 'Every 24 months, independent provider' },
      { label: 'Internal testing', value: 'Quarterly, by a team not responsible for the systems tested' },
      { label: 'Secure development', value: 'Our own products go through the same secure SDLC we sell', note: 'Threat model before build, security review on each architectural decision, independent pre-release test.' },
      { label: 'Vulnerability disclosure', value: 'Published policy, no NDA required to report', note: 'Acknowledged within one business day, triage decision within five. See /legal/vulnerability-disclosure.' },
      { label: 'Patch cadence', value: 'Critical within 7 days, high within 30', note: 'Measured against the date a fix becomes available, not the date we noticed.' },
    ],
  },
  {
    id: 'resilience',
    heading: 'Availability and continuity',
    summary:
      'We are a services firm, not a platform, the thing that must stay available is our ability to respond, and that is a people problem before it is an infrastructure one.',
    rows: [
      { label: 'Incident response availability', value: '24/7/365, nine-person analyst rota', note: 'Rota depth is the real continuity control. A single on-call responder is a single point of failure.' },
      { label: 'Business continuity plan', value: 'Tested twice a year, including a full loss-of-office scenario' },
      { label: 'Backup and restore', value: 'Restores tested quarterly, not just backups monitored', note: 'A backup job reporting success is not evidence of a recoverable backup. We have found that exact failure on client engagements and we test for it on our own systems.' },
      { label: 'Engagement continuity', value: 'Every engagement has a named deputy', note: 'So an illness or a resignation does not stall your work.' },
    ],
  },
  {
    id: 'incidents',
    heading: 'Our incident history',
    summary:
      'No security incident affecting client data to date. If that changes, this is where it will be recorded, and you will hear from us before you read it here.',
    body: [
      'Notification commitment: we will notify an affected client within 24 hours of confirming an incident that affects their data or systems, with what we know at that point rather than waiting for a complete picture. Regulatory notification obligations under UK GDPR Article 33 and NIS2 are met in parallel, not instead.',
      'A trust page that has only ever said "no incidents" and has no stated commitment about what happens when there is one is not telling you much. The commitment is the part you can hold us to.',
    ],
  },
]

export const trustContacts = {
  heading: 'Ask us something this page does not answer',
  lines: [
    { label: 'Security questionnaires and customer security reviews', value: 'security@envenox.com, we answer from one source of truth rather than re-deriving each time' },
    { label: 'Data protection and DPAs', value: 'privacy@envenox.com' },
    { label: 'Report a vulnerability in our own systems', value: 'security@envenox.com, no NDA required' },
  ],
}
