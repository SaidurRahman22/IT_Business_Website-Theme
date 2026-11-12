/**
 * Site-wide constants.
 *
 * CONTENT STATUS: values marked `@placeholder` are structurally correct but
 * commercially unverified. `scripts/check-placeholders.ts` fails a production
 * build while any remain flagged. See content/PLACEHOLDER-REGISTER.md.
 */

export const site = {
  name: 'Envenox',
  legalName: 'Envenox Ltd',
  domain: 'envenox.com',
  url: 'https://envenox.com',

  /** Positioning naming BOTH capabilities (PART 12.1). */
  tagline: 'We build the software. Then we try to break it.',
  positioning:
    'Envenox is a software development firm. We ship production systems (custom software, web applications, ERP and the platforms underneath them) and we keep an offensive security practice on staff that attacks what we build before anyone else gets the chance.',
  boilerplate:
    'Envenox is a software development firm. We design, build and hand over the systems a business runs on, custom software, web applications, ERP, CRM, and the cloud platforms underneath them. What makes the work defensible is that we keep an offensive security practice on staff: our penetration testers read the code our engineers are writing and file findings into the same sprint backlog, so a system arrives already attacked rather than waiting for its first external test. That practice also works on its own, for clients who never buy a line of code from us. We work with regulated organisations across finance, healthcare, logistics and public sector, and we publish our own security posture at /trust.',

  /** The named methodology (PART 7.1). Sales needs a noun. */
  methodology: {
    name: 'The Adversary Loop',
    slug: 'approach',
    oneLine:
      'Threat models shape the build. The build gets attacked. The attack rewrites the threat model.',
  },

  /** Chosen once, used everywhere (PART 12.1). */
  primaryCta: { label: 'Start a conversation', href: '/contact' },
  secondaryCta: { label: 'See the work', href: '/case-studies' },

  contact: {
    /** @placeholder - the IR hotline must be a real, staffed number before launch. */
    irHotline: '+44 20 4525 9100',
    irHotlineHref: 'tel:+442045259100',
    irHotlineCommitment: 'Answered by a responder, 24/7. Median pickup under 4 minutes.',
    /** @placeholder */
    switchboard: '+44 20 4525 9101',
    /**
     * MAILBOX REALITY, verified 2026-11-08 by SMTP RCPT probe against
     * mx.zoho.com: `admin@envenox.com` is the ONLY address that exists.
     * hello@, security@, press@, careers@ and privacy@ every one returned
     * `550 5.1.1 User does not exist`, so until this change the site
     * published five addresses that hard-bounced, including the one in
     * /.well-known/security.txt that researchers are told to disclose to.
     *
     * All five therefore point at the one real mailbox. They are kept as
     * separate fields on purpose: when role aliases are created in Zoho
     * (Admin Console, Users, admin@envenox.com, Mail Aliases), give each
     * field its own address back and every consumer updates with it. Do
     * not re-introduce an address here before probing that it accepts mail.
     */
    email: 'admin@envenox.com',
    securityEmail: 'admin@envenox.com',
    pressEmail: 'admin@envenox.com',
    careersEmail: 'admin@envenox.com',
    privacyEmail: 'admin@envenox.com',
    responseSla: 'A named engineer replies within one business day. Scoping call within three.',
  },

  /**
   * Where every form POSTs.
   *
   * The site is a static export and cannot receive a POST itself, so forms go
   * to the `envenox-forms` Worker (see form-worker/), which validates the
   * submission and relays it over authenticated SMTP to the admin mailbox.
   * Nothing passes through a third party, which matters because /report-issue
   * invites vulnerability disclosures.
   *
   * Do NOT point this back at /thank-you. That was the old behaviour and it
   * silently discarded every enquiry.
   */
  forms: {
    endpoint: 'https://forms.envenox.com/submit',
  },

  social: {
    linkedin: 'https://www.linkedin.com/company/envenox',
    github: 'https://github.com/envenox',
    x: 'https://x.com/envenox',
  },

  offices: [
    { city: 'London', country: 'United Kingdom', line: '1 Fore Street Avenue, London EC2Y 9DT', primary: true },
    { city: 'Dhaka', country: 'Bangladesh', line: 'Level 7, Bay’s Galleria, Gulshan 1, Dhaka 1212', primary: false },
  ],
} as const

/**
 * Capacity stats - services buyers read capacity, not usage (PART 9.5).
 * Every stat carries a source and a date, per PART 12.3.
 */
export type Stat = {
  value: number
  display: string
  suffix?: string
  label: string
  source: string
  asOf: string
  placeholder?: boolean
}

export const headlineStats: Stat[] = [
  {
    value: 38,
    display: '38',
    label: 'engineers and testers on staff',
    source: 'Internal headcount register',
    asOf: '2026-10-01',
    placeholder: false,
  },
  {
    value: 11,
    display: '11',
    label: 'years operating',
    source: 'Companies House incorporation record',
    asOf: '2026-01-01',
    placeholder: false,
  },
  {
    value: 240,
    display: '240',
    suffix: '+',
    label: 'engagements delivered',
    source: 'Delivery system export',
    asOf: '2026-10-01',
    placeholder: false,
  },
  {
    value: 71,
    display: '71',
    label: 'net promoter score',
    source: 'Post-engagement survey, 94 responses',
    asOf: '2026-09-30',
    placeholder: false,
  },
]

/** Aggregate credentials beat adjectives (PART 8.8). */
export const teamCredentials = [
  { count: 14, label: 'OSCP' },
  { count: 6, label: 'CISSP' },
  { count: 4, label: 'CREST CRT' },
  { count: 3, label: 'OSWE' },
  { count: 5, label: 'AWS Solutions Architect' },
  { count: 2, label: 'ISO 27001 Lead Auditor' },
] as const

export type NavChild = { label: string; href: string; blurb?: string }
export type NavGroup = { label: string; href?: string; children?: NavChild[]; featured?: NavChild }

/**
 * ONE NAME PER CONCEPT across both navigation axes (PART 9.6).
 * The labels here are the single source of truth; service pages read from
 * lib/services.ts, which uses the identical strings.
 */
export const primaryNav: NavGroup[] = [
  {
    label: 'Services',
    href: '/services',
    featured: {
      label: 'Secure SDLC',
      href: '/services/devsecops',
      blurb: 'The page that explains why one firm does both. Start here.',
    },
    children: [
      { label: 'Cybersecurity', href: '/services/cybersecurity', blurb: 'Testing, assurance, detection and response' },
      { label: 'Software Development', href: '/services/software-development', blurb: 'Product build, platform and modernisation' },
      { label: 'Penetration Testing', href: '/services/penetration-testing', blurb: 'Web, mobile, network, cloud, API' },
      { label: 'Application Security', href: '/services/application-security', blurb: 'Secure code review and SDLC uplift' },
      { label: 'Managed Detection & Response', href: '/services/managed-detection-response', blurb: '24/7 SOC on your telemetry' },
      { label: 'GRC & Compliance', href: '/services/grc-compliance', blurb: 'SOC 2, ISO 27001, PCI DSS, DORA, NIS2' },
      { label: 'Custom Software', href: '/services/custom-software', blurb: 'Systems built to survive an audit' },
      { label: 'Engagement Models', href: '/services/engagement-models', blurb: 'How retainers and projects actually run' },
    ],
  },
  {
    label: 'Industries',
    href: '/industries',
    children: [
      { label: 'Financial Services', href: '/industries/financial-services' },
      { label: 'Healthcare', href: '/industries/healthcare' },
      { label: 'SaaS & Technology', href: '/industries/saas' },
      { label: 'Logistics', href: '/industries/logistics' },
      { label: 'Public Sector', href: '/industries/public-sector' },
      { label: 'Retail & Payments', href: '/industries/retail' },
    ],
  },
  {
    label: 'Proof',
    href: '/case-studies',
    featured: {
      label: 'Anatomy of a report',
      href: '/sample-report',
      blurb: 'Walk a real deliverable, redacted. See what actually lands in your inbox.',
    },
    children: [
      { label: 'Case Studies', href: '/case-studies', blurb: '24 stories, filterable' },
      { label: 'Customers', href: '/customers', blurb: 'Who we work with, and what they say' },
      { label: 'Certifications', href: '/certifications', blurb: 'Ours, with certificate numbers' },
      { label: 'Trust Centre', href: '/trust', blurb: 'Our own security posture, published' },
    ],
  },
  {
    label: 'Resources',
    href: '/resources',
    children: [
      { label: 'All resources', href: '/resources' },
      { label: 'Insights', href: '/blog' },
      { label: 'Research & Labs', href: '/research' },
      { label: 'Open-source tools', href: '/tools' },
      { label: 'Methodologies', href: '/methodologies' },
    ],
  },
  {
    label: 'Company',
    href: '/about',
    children: [
      { label: 'About', href: '/about' },
      { label: 'Leadership', href: '/about/leadership' },
      { label: 'The Adversary Loop', href: '/approach', blurb: 'How we actually work' },
      { label: 'Careers', href: '/careers' },
      { label: 'Newsroom', href: '/newsroom' },
    ],
  },
]

/** The footer is a second homepage (PART 9.12). */
export const footerNav: { heading: string; links: NavChild[] }[] = [
  {
    heading: 'Cybersecurity',
    links: [
      { label: 'Penetration Testing', href: '/services/penetration-testing' },
      { label: 'Application Security', href: '/services/application-security' },
      { label: 'Cloud Security', href: '/services/cloud-security' },
      { label: 'Red Teaming', href: '/services/red-teaming' },
      { label: 'Managed Detection & Response', href: '/services/managed-detection-response' },
      { label: 'Incident Response', href: '/services/incident-response' },
      { label: 'GRC & Compliance', href: '/services/grc-compliance' },
      { label: 'vCISO', href: '/services/vciso' },
    ],
  },
  {
    heading: 'Software Development',
    links: [
      { label: 'Custom Software', href: '/services/custom-software' },
      { label: 'Web Applications', href: '/services/web-application-development' },
      { label: 'Platform & DevOps', href: '/services/platform-engineering' },
      { label: 'ERP', href: '/services/erp' },
      { label: 'CRM', href: '/services/crm' },
      { label: 'HRM', href: '/services/hrm' },
      { label: 'LMS', href: '/services/lms' },
      { label: 'QA & Test Automation', href: '/services/qa-automation' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Leadership', href: '/about/leadership' },
      { label: 'The Adversary Loop', href: '/approach' },
      { label: 'Careers', href: '/careers' },
      { label: 'Newsroom', href: '/newsroom' },
      { label: 'Locations', href: '/locations' },
      { label: 'Partners', href: '/partners' },
    ],
  },
  {
    heading: 'Proof & Resources',
    links: [
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Sample Report', href: '/sample-report' },
      { label: 'Customers', href: '/customers' },
      { label: 'Certifications', href: '/certifications' },
      { label: 'Trust Centre', href: '/trust' },
      { label: 'Insights', href: '/blog' },
      { label: 'Research & Labs', href: '/research' },
    ],
  },
]

export const legalNav: NavChild[] = [
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Cookies', href: '/legal/cookies' },
  { label: 'Terms', href: '/legal/terms' },
  { label: 'Accessibility', href: '/legal/accessibility' },
  { label: 'Vulnerability disclosure', href: '/legal/vulnerability-disclosure' },
  { label: 'Sitemap', href: '/sitemap' },
]
