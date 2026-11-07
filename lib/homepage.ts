/**
 * Homepage copy.
 *
 * Held here rather than inline in the page so the voice is reviewable in one
 * place and so no section invents its own. Section order follows PART 8.1.
 *
 * Voice rules for anything added to this file:
 *  - A sentence that could appear on any competitor's site is not finished.
 *  - Name the thing. "A view with no tenant predicate" beats "a misconfiguration".
 *  - No: leverage, robust, seamless, holistic, cutting-edge, empower,
 *    comprehensive solutions, end-to-end, best-in-class, trusted partner.
 *  - Claims carry a number or they come out.
 */

export const hero = {
  /** Software development leads. Security is the differentiator, not the product. */
  eyebrow: 'Software development · in-house adversaries',

  /**
   * Three scroll beats. The hero IS the story - see DESIGN-DIRECTION.md §5.
   * Each beat is one line; `serif` marks the phrase set in Instrument Serif,
   * which is the one typographic gesture carrying any character here.
   */
  beats: [
    { lead: 'We build the', serif: 'software.', tail: '' },
    { lead: 'Then we try to', serif: 'break it.', tail: '' },
    { lead: 'Before anyone else', serif: 'gets the chance.', tail: '' },
  ],

  /** Flattened for metadata, the no-JS path, and anything that needs one string. */
  headline: 'We build the software. Then we try to break it, before anyone else gets the chance.',

  subhead:
    'Envenox is a software development firm. We ship production systems (ERP, platforms, web applications) and we keep an offensive security practice on staff whose findings land in the same sprint backlog our engineers work from. Median nine days from a finding being confirmed to the fix being live.',

  primary: { label: 'Start a conversation', href: '/contact' },
  secondary: { label: 'See what we build', href: '/services/software-development' },

  fallbackAlt:
    'Envenox, software development with an in-house offensive security practice.',
}

/** Problem framing: why the current arrangement fails. */
export const problem = {
  eyebrow: 'The arrangement that does not work',
  heading: 'Your software firm builds it for forty weeks. Your security firm tests it in week forty-one.',
  body: [
    'Both firms do their job correctly and the outcome is still bad. By week forty-one the architecture is set, the build team is rolling off, and a finding that requires a design change arrives after the design has become load-bearing. The report lands, the expensive findings get reclassified as accepted risk by someone who never spoke to a tester, and the cheap ones get fixed.',
    'Nobody in that arrangement is accountable for the gap, because the gap is between two contracts. The usual remedy, buy a second security vendor and test earlier, moves the handover rather than removing it.',
  ],
  /** The specific, checkable cost. */
  evidence: {
    figure: '5 months',
    label:
      'the launch slip on one client’s previous build, after a week-forty test returned two criticals that required an architectural change',
    href: '/case-studies/healthtech-secure-sdlc',
    linkLabel: 'Read what happened the second time',
  },
}

/** The dual-capability split, with the DevSecOps join called out as the seam. */
export const split = {
  eyebrow: 'Two practices',
  heading: 'One of these firms attacks systems. The other builds them. They sit nine metres apart.',
  /* Software development is FIRST. It is the business; security is what makes
     the business trustworthy. The previous order said the opposite. */
  pillars: [
    {
      slug: 'software-development',
      name: 'Software development',
      line: 'Products, platforms and the business systems a company runs on.',
      body: 'We build and hand over production systems, custom software, web applications, ERP, CRM, platform and DevOps. Our engineers work next to a practice that will attack what they build, which changes how authorisation, audit logging and secrets get designed: in week one, against a threat model, rather than in month ten against a report.',
      proof: { figure: '27 of 31', label: 'systems we have built are now run by the client’s own team' },
      href: '/services/software-development',
    },
    {
      slug: 'cybersecurity',
      name: 'Security practice',
      line: 'The in-house adversary that makes the build defensible.',
      body: 'Our testers have shipped production systems themselves, which is why a finding arrives with a fix an engineer will accept rather than a recommendation an engineer has to translate. They also work for clients who never buy a line of code from us, testing, assurance, detection and response, sold on its own.',
      proof: { figure: '1.4%', label: 'false-positive rate at retest, across 2,140 confirmed findings' },
      href: '/services/cybersecurity',
    },
  ],
  join: {
    eyebrow: 'The seam',
    heading: 'Secure SDLC',
    body: 'The page nobody else has built, because for most firms there is nothing to put on it. One backlog, one set of priorities, one team accountable, and a number you can check.',
    figure: '9 days',
    figureLabel: 'median from a finding being confirmed to the fix being live in production',
    href: '/services/devsecops',
    cta: 'See the model',
  },
}

/** The named methodology, teased on the homepage. */
export const methodologyTeaser = {
  eyebrow: 'How we work',
  name: 'The Adversary Loop',
  line: 'Threat models shape the build. The build gets attacked. The attack rewrites the threat model.',
  steps: [
    { n: 1, name: 'Model', body: 'Before the first sprint, with the engineers who will own each component. The cheapest security finding is an architecture decision.' },
    { n: 2, name: 'Build', body: 'Two-week sprints, trunk-based, deployed to staging continuously. Security reviews each architectural decision record as it is written.' },
    { n: 3, name: 'Attack', body: 'Continuous review of the sensitive paths during the build, then an independent pre-release test by a tester who wrote none of the code.' },
    { n: 4, name: 'Watch', body: 'Detections written for the system as built, by people who have been reading it for months rather than meeting it at handover.' },
    { n: 5, name: 'Rewrite', body: 'What the testing and the monitoring find goes back into the threat model. That is the loop, and it is why the second year costs less than the first.' },
  ],
  /** The closing edge of the cycle, stated rather than only drawn.
   *
   *  The homepage band draws a return path from 05 back to 01, and a dashed
   *  line is not an argument on its own: a visitor has to be told what the
   *  return path costs and what it buys. This deliberately does NOT restate
   *  step 5's body, which already covers what comes back; it covers why the
   *  return path is the part that needs both practices under one roof, which
   *  is the claim the whole band exists to make. Same position as
   *  approachIntro.lead in lib/approach.ts, compressed to one line. */
  returnPath:
    'The output of 05 is the input to 01. That return path is the only unusual part of this, and it is the part that requires both practices to be in one firm.',
  href: '/approach',
  cta: 'Read the method',
}

/** Credentials row - aggregate counts beat adjectives. */
export const credentialsRow = {
  eyebrow: 'Credentials',
  heading: 'Who is actually on the engagement',
  note: 'Aggregate certification counts across the practice. Individual certifications are listed on each person’s profile.',
  href: '/certifications',
  cta: 'Certificates, numbers and expiry dates',
}

/** Closing CTA band - names a SPECIFIC next step, never "contact us". */
export const closingCta = {
  eyebrow: 'Next step',
  heading: 'Book a 60-minute scoping call with the person who would lead the work.',
  body: 'Not a qualification script and not a discovery deck. A technical conversation about what you are trying to achieve and what constrains it, after which you get a written scope with the exclusions stated in the body rather than in an appendix.',
  primary: { label: 'Book a scoping call', href: '/book-a-call' },
  secondary: { label: 'Or walk a sample report first', href: '/sample-report' },
  reassurance: [
    'A named engineer replies within one business day.',
    'NDA before the call if you prefer. We will sign yours.',
    'If you are in an active incident, do not book. Call the hotline.',
  ],
}

/** Insights teaser - three cards. */
export const insightsTeaser = {
  eyebrow: 'Research & insights',
  heading: 'What we have been finding',
  href: '/resources',
  cta: 'All resources',
  items: [
    {
      kind: 'Research',
      title: 'Identity-path analysis beats configuration scanning: 14 cloud estates reviewed',
      blurb:
        'In eleven of fourteen reviews there was at least one path from a low-privilege identity to full account administrator. In none of them did a CSPM tool rank any single step above medium.',
      href: '/research/identity-path-analysis',
      readingTime: '12 min read',
      cta: 'Read research',
    },
    {
      kind: 'Methodology',
      title: 'How we score severity, and why we show the adjustment',
      blurb:
        'CVSS v4.0 base plus an environmental adjustment, with the reasoning in one sentence per finding, so you can disagree with us precisely rather than generally.',
      href: '/methodologies/severity-model',
      readingTime: 'PDF, 9 pages',
      cta: 'Read methodology',
    },
    {
      kind: 'Open-source',
      title: 'trustgraph, enumerate every privilege path in an AWS organisation',
      blurb:
        'The tool we use on cloud reviews, reading actual policy documents rather than the console summary. MIT, no telemetry, runs from a read-only role.',
      href: '/tools/trustgraph',
      readingTime: 'GitHub',
      cta: 'View tool',
    },
  ],
}

/** The "not sure what you need" router. */
export const router = {
  eyebrow: 'Not sure what you need?',
  heading: 'Most people arrive with a deadline rather than a service name.',
  routes: [
    { trigger: 'A customer or auditor is asking for a penetration test', goes: 'Penetration Testing', href: '/services/penetration-testing' },
    { trigger: 'We committed to SOC 2 or ISO 27001 and need to actually get there', goes: 'GRC & Compliance', href: '/services/grc-compliance' },
    { trigger: 'We keep finding the same class of bug every year', goes: 'Application Security', href: '/services/application-security' },
    { trigger: 'We have alerts nobody reads and no idea what our coverage is', goes: 'Managed Detection & Response', href: '/services/managed-detection-response' },
    { trigger: 'We are replacing a system the business depends on', goes: 'Custom Software', href: '/services/custom-software' },
    { trigger: 'We are building something and do not want a week-forty surprise', goes: 'Secure SDLC', href: '/services/devsecops' },
    { trigger: 'We think we are being attacked right now', goes: 'Call the hotline, do not use this form', href: '/services/incident-response' },
  ],
}
