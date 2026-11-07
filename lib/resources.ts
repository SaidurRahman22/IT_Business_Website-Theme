/**
 * Resources hub, insights, research, open-source tools and methodologies.
 *
 * Each resource TYPE gets a verb-matched CTA - Methodologies → "Read
 * Methodology", Datasheets → "Download Datasheet", Webinars → "Watch Webinar".
 * A small thing that reads as competence, and its absence reads as a template.
 *
 * Consideration-stage SEO lives inside the service tree, not here (see
 * `serviceTopics` below). This hub is for the things a buyer reads to decide
 * whether we know what we are talking about.
 */

import { bySlug, groupBy } from './lookup'

export type ResourceType = {
  slug: string
  label: string
  plural: string
  /** The verb-matched call to action. */
  cta: string
  gated: boolean
  description: string
}

export const resourceTypes: ResourceType[] = [
  { slug: 'research', label: 'Research', plural: 'Research', cta: 'Read research', gated: false, description: 'Findings from our own work, with the data and the method.' },
  { slug: 'methodology', label: 'Methodology', plural: 'Methodologies', cta: 'Read methodology', gated: false, description: 'How we actually run an engagement, published so you can hold us to it.' },
  { slug: 'tool', label: 'Open-source tool', plural: 'Open-source tools', cta: 'View tool', gated: false, description: 'Tools we use on engagements, released because they are more useful shared.' },
  { slug: 'insight', label: 'Insight', plural: 'Insights', cta: 'Read article', gated: false, description: 'Shorter pieces on things we keep having to explain.' },
  { slug: 'datasheet', label: 'Datasheet', plural: 'Datasheets', cta: 'Download datasheet', gated: false, description: 'One page per service: scope, deliverables, timeline, team.' },
  { slug: 'guide', label: 'Guide', plural: 'Guides', cta: 'Get the guide', gated: true, description: 'Longer-form, and the only thing on this site behind a form.' },
  { slug: 'webinar', label: 'Webinar', plural: 'Webinars', cta: 'Watch webinar', gated: false, description: 'Recorded sessions, no registration wall on the recording.' },
]

export type Resource = {
  slug: string
  type: ResourceType['slug']
  title: string
  /** A real, specific abstract. Never "learn more about X". */
  blurb: string
  author: string
  published: string
  updated?: string
  readingTime: string
  topics: string[]
  /** Service slugs this resource supports. */
  services: string[]
  featured: boolean
  /** True where the artefact does not exist yet and the page is a stub. */
  pending: boolean
}

export const resources: Resource[] = [
  {
    slug: 'identity-path-analysis',
    type: 'research',
    title: 'Identity-path analysis beats configuration scanning: 14 cloud estates reviewed',
    blurb:
      'In eleven of fourteen cloud reviews there was at least one path from a low-privilege identity to full account administrator. In none of them did a posture tool rank any individual step above medium, because individually none of them is above medium. Includes the method, the anonymised path shapes, and why filtering a findings list by reachability reduced one estate from 1,840 to 210 in a day.',
    author: 'daniel-okafor',
    published: '2026-09-18',
    readingTime: '12 min read',
    topics: ['Cloud', 'Identity', 'AWS', 'Attack paths'],
    services: ['cloud-security', 'penetration-testing'],
    featured: true,
    pending: true,
  },
  {
    slug: 'dead-log-sources',
    type: 'research',
    title: 'A third of configured log sources deliver nothing: what we find during MDR onboarding',
    blurb:
      'Across managed detection onboardings, a median of 31% of configured log sources had never delivered a single event, and several more had stopped silently after a platform upgrade. Dashboards report configured status, not delivery. The method for checking is included and takes an afternoon.',
    author: 'daniel-okafor',
    published: '2026-07-02',
    readingTime: '9 min read',
    topics: ['Detection', 'SIEM', 'Telemetry'],
    services: ['managed-detection-response'],
    featured: true,
    pending: true,
  },
  {
    slug: 'severity-model',
    type: 'methodology',
    title: 'How we score severity, and why we show the adjustment',
    blurb:
      'CVSS v4.0 base plus an environmental adjustment, with the reasoning stated in one sentence per finding, including the cases where we adjust a score up. Published so you can disagree with us precisely rather than generally, and so an auditor can see the number was reasoned rather than assigned.',
    author: 'imran-haque',
    published: '2026-02-11',
    updated: '2026-08-04',
    readingTime: 'PDF, 9 pages',
    topics: ['Methodology', 'CVSS', 'Reporting'],
    services: ['penetration-testing', 'application-security'],
    featured: true,
    pending: true,
  },
  {
    slug: 'web-app-testing-methodology',
    type: 'methodology',
    title: 'Web application and API testing methodology',
    blurb:
      'Scope, phases, coverage against OWASP ASVS 4.0 and WSTG, what we confirm by hand versus what tooling covers, the escalation path for a critical found mid-engagement, and the explicit list of what we do not test and why.',
    author: 'imran-haque',
    published: '2026-01-20',
    readingTime: 'PDF, 14 pages',
    topics: ['Methodology', 'Web', 'API', 'OWASP'],
    services: ['penetration-testing'],
    featured: false,
    pending: true,
  },
  {
    slug: 'trustgraph',
    type: 'tool',
    title: 'trustgraph, enumerate every privilege path in an AWS organisation',
    blurb:
      'Reads actual IAM policy documents, trust relationships, permission boundaries and SCPs rather than the console summary, and outputs the reachability graph as queryable data. Runs from a read-only role you create and can delete. MIT, no telemetry, no account required.',
    author: 'daniel-okafor',
    published: '2026-05-30',
    readingTime: 'GitHub',
    topics: ['AWS', 'IAM', 'Attack paths', 'Open source'],
    services: ['cloud-security'],
    featured: true,
    pending: true,
  },
  {
    slug: 'logsource-check',
    type: 'tool',
    title: 'logsource-check, prove your log sources are actually delivering',
    blurb:
      'Compares configured sources against events actually received over a window, per source and per host, for Sentinel, Elastic and Wazuh. Written because we kept finding dead sources by hand on onboarding. MIT.',
    author: 'daniel-okafor',
    published: '2026-07-02',
    readingTime: 'GitHub',
    topics: ['Detection', 'SIEM', 'Open source'],
    services: ['managed-detection-response'],
    featured: false,
    pending: true,
  },
  {
    slug: 'authorisation-in-one-place',
    type: 'insight',
    title: 'Why your authorisation bug keeps coming back',
    blurb:
      'Closing instances of a bug class does nothing about the class. On one platform authorisation was decided in 40 places and no engineer could enumerate them. The fix that worked was not a code review. It was a typed helper plus a lint rule that makes the insecure call impossible to write.',
    author: 'sofia-marek',
    published: '2026-10-14',
    readingTime: '7 min read',
    topics: ['AppSec', 'Authorisation', 'Multi-tenancy'],
    services: ['application-security', 'penetration-testing'],
    featured: false,
    pending: true,
  },
  {
    slug: 'backups-that-cannot-restore',
    type: 'insight',
    title: 'A backup job reporting success is not a backup',
    blurb:
      'Nineteen months of green dashboards, a dump that excluded a schema added in 2023 because the script enumerated from a list written in 2019, and a service that could not start from it. A control that has never been executed is a hypothesis, here is how to test the four that matter.',
    author: 'priya-raman',
    published: '2026-08-21',
    readingTime: '6 min read',
    topics: ['Resilience', 'Backups', 'ISO 27001'],
    services: ['grc-compliance', 'platform-engineering'],
    featured: false,
    pending: true,
  },
  {
    slug: 'scope-is-the-certification-decision',
    type: 'insight',
    title: 'Four days of scoping undid two years of a stalled ISO 27001 attempt',
    blurb:
      'The scope had been drawn around the whole organisation instead of the service that needed the certificate, which multiplied 61 applicable controls into 142 across business units with no involvement in it. Scope is the first decision and the most expensive one to get wrong.',
    author: 'claire-benoit',
    published: '2026-06-05',
    readingTime: '8 min read',
    topics: ['ISO 27001', 'Certification', 'Scope'],
    services: ['grc-compliance', 'vciso'],
    featured: false,
    pending: true,
  },
  {
    slug: 'buy-less-than-you-asked-for',
    type: 'insight',
    title: 'Do not buy a red team yet',
    blurb:
      'A red team against an estate that has never had a penetration test will find the unauthenticated file upload at red team rates and teach you nothing about your detection, because the engagement ended at the first open door. What to buy first, and how to tell when you are ready.',
    author: 'imran-haque',
    published: '2026-04-09',
    readingTime: '5 min read',
    topics: ['Red team', 'Buying security'],
    services: ['red-teaming', 'penetration-testing'],
    featured: false,
    pending: true,
  },
  {
    slug: 'secure-sdlc-guide',
    type: 'guide',
    title: 'The secure SDLC field guide: moving findings earlier without slowing delivery',
    blurb:
      'The threat-modelling workshop format, the decision-record review checklist, how to tune a pipeline gate to a finding budget delivery teams accept, and the cycle-time measurement that tells you whether any of it is working. 38 pages.',
    author: 'sofia-marek',
    published: '2026-03-03',
    readingTime: 'PDF, 38 pages',
    topics: ['DevSecOps', 'Threat modelling', 'CI/CD'],
    services: ['devsecops', 'application-security'],
    featured: true,
    pending: true,
  },
  {
    slug: 'dora-tlpt-webinar',
    type: 'webinar',
    title: 'DORA threat-led penetration testing: what the independence criteria actually mean',
    blurb:
      'Fifty minutes on where the provider independence requirements bite, why some firms can supply the threat intelligence or the testing but not both, and how to avoid discovering that after the exercise. Recording is not gated.',
    author: 'claire-benoit',
    published: '2026-09-25',
    readingTime: '50 min watch',
    topics: ['DORA', 'Red team', 'Financial services'],
    services: ['red-teaming', 'grc-compliance'],
    featured: false,
    pending: true,
  },
]

export const resourcesBySlug: Record<string, Resource> = bySlug(resources)

export const resourceTypesBySlug: Record<string, ResourceType> = bySlug(resourceTypes)

/**
 * Service topic clusters - consideration-stage SEO nested under the SERVICE
 * URL, not in the blog. One competitor runs 14 child explainers under
 * `/services/red-teaming/` alone. These are sales objections rendered as URLs,
 * and they inherit the service page's authority.
 *
 * ⚠ Write them for the BUYER, not for the search engine. "Which is the best
 * cybersecurity company?" on your own site costs more trust than the ranking is
 * worth.
 */
export type ServiceTopic = {
  slug: string
  parent: string
  title: string
  /** The buyer question this answers, in their words. */
  question: string
  pending: boolean
}

export const serviceTopics: ServiceTopic[] = [
  { slug: 'red-teaming-vs-penetration-testing', parent: 'red-teaming', title: 'Red teaming vs penetration testing', question: 'We have been quoted for both. What is the actual difference and which do we need first?', pending: true },
  { slug: 'what-is-a-purple-team', parent: 'red-teaming', title: 'What is a purple team?', question: 'Our provider offered a purple team debrief. Is that a real thing or a rebrand?', pending: true },
  { slug: 'are-we-ready-for-a-red-team', parent: 'red-teaming', title: 'Are we ready for a red team?', question: 'How do we know whether we would waste the money?', pending: true },
  { slug: 'how-much-does-a-pen-test-cost', parent: 'penetration-testing', title: 'How penetration testing is priced', question: 'Why is one quote twice the other for what looks like the same scope?', pending: true },
  { slug: 'production-or-staging', parent: 'penetration-testing', title: 'Should you test production or staging?', question: 'Our policy says no production testing. What are we giving up?', pending: true },
  { slug: 'scanner-vs-manual-testing', parent: 'penetration-testing', title: 'How to tell a penetration test from a scanner export', question: 'How do we check we are not paying testing rates for automated output?', pending: true },
  { slug: 'soc-2-type-i-or-type-ii', parent: 'grc-compliance', title: 'SOC 2 Type I or Type II?', question: 'A customer asked for SOC 2. Which one, and how long does it take?', pending: true },
  { slug: 'iso-27001-and-soc-2-together', parent: 'grc-compliance', title: 'Doing ISO 27001 and SOC 2 together', question: 'We need both. Can the work be shared?', pending: true },
  { slug: 'how-to-scope-iso-27001', parent: 'grc-compliance', title: 'How to scope ISO 27001 without doubling the cost', question: 'How wide should the scope be?', pending: true },
  { slug: 'mdr-service-levels', parent: 'managed-detection-response', title: 'What an MDR service level should commit to', question: 'Every provider quotes 15 minutes. Fifteen minutes to what?', pending: true },
  { slug: 'build-or-buy-a-soc', parent: 'managed-detection-response', title: 'Build or buy a SOC', question: 'At what size does running our own start to make sense?', pending: true },
  { slug: 'do-we-need-an-ir-retainer', parent: 'incident-response', title: 'Do we need an incident response retainer?', question: 'We can call someone when it happens. What does a retainer add?', pending: true },
  { slug: 'fixed-price-or-time-and-materials', parent: 'custom-software', title: 'Fixed price or time and materials?', question: 'We want a fixed price. Why are you resisting?', pending: true },
  { slug: 'build-or-buy-erp', parent: 'erp', title: 'Build or buy your ERP', question: 'Three vendors say buy, you say it depends. On what?', pending: true },
]

export const serviceTopicsByParent = groupBy(serviceTopics, 'parent')
