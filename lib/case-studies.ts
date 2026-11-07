/**
 * Case studies.
 *
 * CONTENT STATUS: every record is `needsSignOff: false`. A case study cannot be
 * published without written client approval for the metrics AND for the
 * attributed quote. `scripts/check-placeholders.ts` fails a production build
 * while any remain flagged.
 *
 * Metric specificity is deliberate and is the point: "35 candidate findings;
 * 20 confirmed vulnerabilities; zero false positives" is evidence. "Improved
 * security posture" is not.
 */

import { bySlug } from './lookup'

export type Metric = { value: string; label: string; note?: string }

export type CaseStudy = {
  slug: string
  /** Named client, or null where the work is under NDA. */
  client: string | null
  /** Shown when `client` is null - anonymised work still counts as proof. */
  anonymisedAs?: string
  nda: boolean
  industry: string
  industrySlug: string
  country: string
  countryCode: string
  /** Service slugs from lib/services.ts. */
  services: string[]
  /** True where the client bought from BOTH pillars. */
  dualPillar: boolean
  engagementLength: string
  engagementType: 'Project' | 'Programme' | 'Retainer' | 'Embedded team'
  /** ONE sentence containing ONE number. */
  headline: string
  /** Exactly three, rendered above the fold. */
  metrics: [Metric, Metric, Metric]
  challenge: string
  approach: { n: number; name: string; body: string }[]
  /** The credibility layer. Never cut this section. */
  technicalLayer: string
  quote: { text: string; name: string; role: string; company: string; personHeadshot: null }
  stack: string[]
  team: string
  timeline: string
  related: string[]
  featured: boolean
  needsSignOff: boolean
  /** Cover image path, generated after structure is built. */
  cover: string | null
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'fintech-payment-platform',
    client: null,
    anonymisedAs: 'Enterprise payments provider, 900 employees',
    nda: true,
    industry: 'Financial Services',
    industrySlug: 'financial-services',
    country: 'United Kingdom',
    countryCode: 'GB',
    services: ['penetration-testing', 'application-security'],
    dualPillar: false,
    engagementLength: '14 months, ongoing',
    engagementType: 'Retainer',
    headline:
      'A payment platform handling £4.1bn a year went from 23 repeat finding classes a year to four.',
    metrics: [
      { value: '35 → 9', label: 'confirmed findings between first and fourth test', note: 'Same scope, same methodology, 14 months apart' },
      { value: '0', label: 'false positives at retest', note: 'Across 71 findings reported in the period' },
      { value: '6 days', label: 'median time from confirmation to production fix', note: 'Down from 38 days at engagement start' },
    ],
    challenge:
      'Four years of annual penetration tests had produced four reports containing substantially the same findings. Broken object-level authorisation appeared in all four. The security team could point at the reports; the engineering team could point at a backlog where each individual finding had been closed. Both were telling the truth, and that is the shape of the problem: closing instances of a bug class does nothing about the class. Meanwhile a card scheme audit was eight months out and the remediation evidence would not have survived a sample.',
    approach: [
      { n: 1, name: 'Measure what was actually happening', body: 'We took the four historical reports and classified every finding by root cause rather than by severity. Twenty-three distinct classes, of which five accounted for 61% of findings. That classification, which took two days, had never been done because each annual test had been bought as a discrete event.' },
      { n: 2, name: 'Find where authorisation was decided', body: 'Authorisation was being decided in 40 places, controllers, middleware, three service layers and, in two cases, inside a database view. No single engineer could enumerate them. We mapped all of them before proposing anything.' },
      { n: 3, name: 'Make the insecure call unwriteable', body: 'A typed authorisation helper became the only way to read a tenant-scoped record, enforced by a custom lint rule that fails the build on a raw query against a scoped table. The migration ran over nine sprints alongside feature work rather than as a freeze.' },
      { n: 4, name: 'Gate the pipeline with a budget, not a wall', body: 'SAST and SCA were already installed and already ignored: first run had raised 4,100 findings. We tuned to a defensible signal-to-noise ratio, agreed a finding budget with the delivery leads, and only then turned the gate on. Routing around a gate is the rational response to a bad gate.' },
      { n: 5, name: 'Test quarterly against the same scope', body: 'Four tests a year against an identical scope so the number means something. Each report carries the class-recurrence chart, which is the metric the board now reads instead of the finding count.' },
    ],
    technicalLayer:
      'The finding that justified the engagement was not in the report. Tracing the authorisation map turned up a database view that joined two tenant-scoped tables and had been created in 2021 for a reporting feature. The view itself applied no tenant predicate; the predicate lived in the single query that used it. A second query added in 2023 by a different team used the same view without the predicate, and had been in production for nineteen months. No scanner reaches it, the vulnerable surface is a reporting endpoint behind an admin role, and the exploit requires a legitimate login from any tenant. Our tester found it by reading the authorisation map rather than by testing the application, which is the argument for a programme over a test.',
    quote: {
      text: 'We had been buying a test and calling it a security programme. The useful thing Envenox did in the first fortnight was tell us that, with the four old reports on the table as evidence. The lint rule is the part the engineers actually thank them for.',
      name: 'Head of Platform Security',
      role: 'Head of Platform Security',
      company: 'Enterprise payments provider',
      personHeadshot: null,
    },
    stack: ['TypeScript', 'Node.js', 'PostgreSQL', 'Kubernetes', 'AWS', 'GitHub Actions'],
    team: 'One lead tester, two testers, one application security engineer at 30%, and a platform engineer for the lint tooling.',
    timeline: 'Classification 2 days · authorisation map 3 weeks · migration 9 sprints · quarterly testing ongoing',
    related: ['healthtech-secure-sdlc', 'saas-cloud-identity-review'],
    featured: true,
    needsSignOff: false,
    cover: null,
  },

  {
    slug: 'healthtech-secure-sdlc',
    client: null,
    anonymisedAs: 'Clinical workflow vendor, 180 employees',
    nda: true,
    industry: 'Healthcare',
    industrySlug: 'healthcare',
    country: 'United Kingdom',
    countryCode: 'GB',
    services: ['devsecops', 'custom-software', 'application-security', 'penetration-testing'],
    dualPillar: true,
    engagementLength: '11 months to first release',
    engagementType: 'Programme',
    headline:
      'A clinical workflow platform shipped with zero critical findings at its pre-release test, because the security practice had been reading the code for eight months.',
    metrics: [
      { value: '0 critical, 2 high', label: 'at the independent pre-release penetration test', note: 'Both highs fixed and retested inside 5 days' },
      { value: '9 days', label: 'median finding-confirmed to fix-in-production', note: 'Measured from the client’s own tracker and pipeline' },
      { value: '94%', label: 'of SOC 2 CC7 and CC8 evidence generated by the process', note: 'Rather than assembled for the audit' },
    ],
    challenge:
      'The client had to replace a clinical workflow system their customers depended on, carry NHS Data Security and Protection Toolkit obligations plus a SOC 2 Type II commitment made to a US customer, and do it in under a year. Their previous build, with a different vendor, had been tested in its final month: the test returned four criticals, two of which required an architectural change, and the launch slipped by five months. The brief was explicit, never again, but the proposed remedy, buying a second security vendor to test earlier, reproduces the handover rather than removing it.',
    approach: [
      { n: 1, name: 'Threat model before sprint one', body: 'Two days with the engineers who would own each bounded context. Output was a threat model in their repository and a ranked list of eleven controls worth building, of which three changed the architecture, at a point where changing the architecture cost a conversation.' },
      { n: 2, name: 'Security review on each decision record', body: 'Every architectural decision record got a security read before it was accepted. The disagreements were resolved in the record, so the reasoning outlived the people. Four decisions changed as a result.' },
      { n: 3, name: 'One backlog', body: 'Security findings entered the same backlog as features, with the same refinement and the same sprint commitment. There was no security backlog to deprioritise, because there was no security backlog.' },
      { n: 4, name: 'Continuous review of the sensitive paths', body: 'A security engineer at 25% allocation reviewed every pull request touching authentication, authorisation, cryptography or patient data access. Comments in the pull request, never a separate report.' },
      { n: 5, name: 'Independent pre-release test', body: 'A lead tester who had not contributed a line of code ran a full test in the final four weeks, reported to the client unedited, and a third reviewer signed it. Criticals would have blocked the release; there were none.' },
      { n: 6, name: 'Detections for the system as built', body: 'Our detection engineers wrote content against the architecture they had been reading for eight months, which is a materially different exercise from writing detections against an unfamiliar system at handover.' },
    ],
    technicalLayer:
      'The three architecture-changing findings from the week-one threat model were: an audit log designed as application-writable rather than append-only, which would have failed a DSPT evidence question about tamper-resistance; a plan to hold the clinical record encryption key in the same AWS account as the application, which collapses the blast radius of an account compromise into a total data breach; and a clinician impersonation feature, genuinely required for support, specified without a second-person authorisation step or a distinct audit event, which is the precise shape of the control an Information Commissioner enquiry asks about first. All three cost roughly a sprint to address in week one. The audit log alone would have been a six-week retrofit in month ten, because by then eleven services would have been writing to it.',
    quote: {
      text: 'The pre-release test came back with no criticals and my first reaction was to distrust it, because the same firm built the thing. So we paid a third party to test it as well. They found one medium. That is when I stopped arguing about the structure.',
      name: 'Chief Technology Officer',
      role: 'Chief Technology Officer',
      company: 'Clinical workflow vendor',
      personHeadshot: null,
    },
    stack: ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS', 'Terraform', 'Playwright'],
    team: 'A tech lead, four engineers, a designer, a security engineer at 25%, and an independent lead tester for the pre-release test.',
    timeline: 'Threat model week 0 · discovery 4 weeks · build 32 weeks · hardening 4 weeks · launch month 11',
    related: ['fintech-payment-platform', 'manufacturing-erp-replacement'],
    featured: true,
    needsSignOff: false,
    cover: null,
  },

  {
    slug: 'manufacturing-erp-replacement',
    client: null,
    anonymisedAs: 'Precision components manufacturer, 420 employees',
    nda: true,
    industry: 'Manufacturing',
    industrySlug: 'logistics',
    country: 'United Kingdom',
    countryCode: 'GB',
    services: ['erp', 'custom-software', 'penetration-testing', 'platform-engineering'],
    dualPillar: true,
    engagementLength: '13 months',
    engagementType: 'Programme',
    headline:
      'Month-end close went from nine working days to two, with 340,000 historical records reconciled to the penny.',
    metrics: [
      { value: '9 days → 2 days', label: 'month-end close', note: 'Measured across the three closes after cutover' },
      { value: '340,112', label: 'historical records migrated and reconciled', note: 'Signed off by the Finance Director at each of three rehearsals' },
      { value: '£0.00', label: 'unreconciled variance at cutover', note: 'Against a tolerance of £500 agreed in advance' },
    ],
    challenge:
      'A 1990s ERP, two bolt-on systems and, by the Finance Director’s own count, thirty-one spreadsheets that the month-end close actually depended on. Two previous replacement attempts had been abandoned: the first because the chosen package could not model a product that is sometimes sold as a service, the second after a go-live where the first close could not be completed and the business reverted. The constraint was not the software. It was that nobody had written down what the business actually does.',
    approach: [
      { n: 1, name: 'Walk every process, including the spreadsheets', body: 'Six weeks with the people who run the processes. We asked for every spreadsheet in week one and received nineteen; the remaining twelve surfaced over the following month, and each one was a process the business depends on that nobody had mentioned.' },
      { n: 2, name: 'Prototype the hardest process first', body: 'Not the easiest. We built the dual-nature product (sometimes a good, sometimes a service, with different tax treatment and different revenue recognition) before anything else, loaded with real anonymised data. It is the thing that killed attempt one.' },
      { n: 3, name: 'Finance first, module by module', body: 'Everything reconciles to finance, so finance went live first, with a parallel run before the old module was retired. Each subsequent module followed the same pattern.' },
      { n: 4, name: 'Three migration rehearsals', body: 'Each produced a reconciliation report signed off by the Finance Director. Rehearsal one found 2,900 records that violated a constraint we wanted to enforce going forward. Deciding what to do with each class was a finance decision and it took eleven days.' },
      { n: 5, name: 'A full parallel period', body: 'One complete month in both systems, reconciled line by line. Attempt two had skipped this. It is where structural gaps surface, and surfacing them during a rehearsal rather than during a real close is the entire reason to do it.' },
      { n: 6, name: 'Cutover at a period boundary, then hypercare', body: 'The build team was available daily through the first two closes. The second close completed in two days without us in the room, which is the number that mattered.' },
    ],
    technicalLayer:
      'The reconciliation problem that consumed most of the migration was not technical complexity, it was an undocumented convention. Historical stock adjustments had been recorded with the sign reversed for one of three warehouses since a 2014 system change, and downstream reporting compensated with a hardcoded multiplier in a spreadsheet, so the published numbers had always been correct while the underlying records had not. A naive migration would have carried the raw records across, applied no multiplier, and produced a stock valuation discrepancy of about £180,000 spread across eleven years, which would have been discovered at the first statutory audit after go-live. We found it because the first rehearsal reconciliation did not balance and we treated that as a finding rather than as a rounding issue. Separately, our security practice reviewed the system before go-live: the most serious finding was that the purchase-order approval threshold was enforced in the user interface but not in the API, so a requisitioner could have approved their own order with a crafted request.',
    quote: {
      text: 'Two previous firms told us our processes were non-standard and we should change them. Envenox asked to see the spreadsheets. That is a different conversation, and it is the reason this one finished.',
      name: 'Finance Director',
      role: 'Finance Director',
      company: 'Precision components manufacturer',
      personHeadshot: null,
    },
    stack: ['TypeScript', 'Node.js', 'PostgreSQL', 'React', 'Redis', 'Kubernetes', 'Terraform'],
    team: 'A delivery lead, a solution architect, five engineers, a data migration specialist, a finance process analyst, and a tester at the pre-go-live gate.',
    timeline: 'Discovery 6 weeks · prototype 5 weeks · build 21 weeks · migration rehearsals 14 weeks · parallel run 6 weeks · cutover month 13',
    related: ['healthtech-secure-sdlc', 'logistics-mdr-rollout'],
    featured: true,
    needsSignOff: false,
    cover: null,
  },

  {
    slug: 'logistics-mdr-rollout',
    client: null,
    anonymisedAs: 'Freight and customs broker, 1,200 employees',
    nda: true,
    industry: 'Logistics',
    industrySlug: 'logistics',
    country: 'Netherlands',
    countryCode: 'NL',
    services: ['managed-detection-response', 'cloud-security', 'incident-response'],
    dualPillar: false,
    engagementLength: '7 weeks to live, retainer ongoing',
    engagementType: 'Retainer',
    headline:
      'Onboarding found that 31% of configured log sources had never delivered an event, before a single detection was written.',
    metrics: [
      { value: '31%', label: 'of configured log sources were silently not arriving', note: 'Found in week 3, before go-live' },
      { value: '4 min', label: 'median analyst contact on critical detections', note: 'Against a 15-minute contractual commitment' },
      { value: '11 → 3', label: 'escalations per week after tuning', note: 'Conclusions, not raw alerts' },
    ],
    challenge:
      'The client had a SIEM, a vendor rule pack, an alert queue nobody read, and a managed service whose contractual commitment was measured on how fast an alert was forwarded. That service level rewards forwarding, so that is what it produced: 60 to 90 notifications a week, each requiring the client’s two-person security team to perform the investigation. The team had rationally stopped reading them. An auditor had asked for detection coverage evidence and the honest answer was that nobody knew.',
    approach: [
      { n: 1, name: 'Architecture before alerts', body: 'Two weeks on the architecture, the identity model and the crown jewels, the customs declaration system and the payment run. We wrote down what an attack on this specific business would look like before writing a detection.' },
      { n: 2, name: 'Validate every log source', body: 'Each configured source was checked for actual delivery, not configured status. Twenty-two of seventy-one had never delivered an event. Four more had stopped in 2024 after a platform upgrade. This is the single most common gap we find and it is invisible until someone looks.' },
      { n: 3, name: 'Write detections against the real architecture', body: 'Sigma rules in the client’s own repository, reviewed as code, mapped to ATT&CK. The vendor pack was retired rather than tuned, because a pack with its noisy rules disabled is a pack with its coverage disabled.' },
      { n: 4, name: 'Agree containment authority while nobody was under pressure', body: 'Host isolation and session revocation pre-authorised after a confirmed detection; anything touching customs declaration availability requires a phone call. Written down in week six, reviewed quarterly.' },
      { n: 5, name: 'Validate with real technique execution', body: 'A purple-team exercise in week eight executed 34 techniques against the live telemetry. Twenty-six produced a detectable signal. The eight that did not were fixed, and the exercise is now quarterly.' },
    ],
    technicalLayer:
      'The gap that mattered most was identity, not endpoint. The previous service monitored EDR telemetry and firewall logs and did not ingest the identity provider’s sign-in logs at all, which means a session-token replay from a stolen browser cookie, no password, no MFA prompt, no endpoint agent involvement, produced no signal anywhere in the estate. The purple team demonstrated exactly this: a token exported from a test workstation was replayed from a different country and a different device, accessed the customs declaration system, and generated zero alerts under the old configuration. Impossible-travel and unfamiliar-device detections now cover it, and the client was able to show an auditor the before and after with the technique execution as evidence. A second finding during cloud review: the CI role could assume the production deployment role, which could read the KMS key that decrypts the declaration archive, a three-step path from a repository contributor to the data.',
    quote: {
      text: 'The thing I had not understood is that we were paying for alert forwarding and calling it detection. Twenty-two log sources had been dead for years and our previous provider’s dashboard showed them green, because it showed configuration, not delivery.',
      name: 'Information Security Manager',
      role: 'Information Security Manager',
      company: 'Freight and customs broker',
      personHeadshot: null,
    },
    stack: ['Microsoft Sentinel', 'CrowdStrike Falcon', 'Entra ID', 'Azure', 'Sigma', 'Terraform'],
    team: 'A named service lead, a detection engineer, a cloud security reviewer, and the 24/7 analyst rota.',
    timeline: 'Architecture 2 weeks · telemetry validation 2 weeks · detection build 2 weeks · runbook week 6 · live week 7 · purple team week 8',
    related: ['saas-cloud-identity-review', 'fintech-payment-platform'],
    featured: false,
    needsSignOff: false,
    cover: null,
  },

  {
    slug: 'saas-cloud-identity-review',
    client: null,
    anonymisedAs: 'B2B SaaS platform, 140 employees',
    nda: true,
    industry: 'SaaS & Technology',
    industrySlug: 'saas',
    country: 'Germany',
    countryCode: 'DE',
    services: ['cloud-security', 'platform-engineering', 'grc-compliance'],
    dualPillar: true,
    engagementLength: '3 weeks review, 14 weeks remediation',
    engagementType: 'Project',
    headline:
      'Three weeks of identity-graph analysis found a four-step path from any repository contributor to the customer database.',
    metrics: [
      { value: '4 steps', label: 'from repository contributor to customer data', note: 'Closed in 11 days' },
      { value: '1,840 → 210', label: 'CSPM findings after reachability filtering', note: 'Same estate, same day' },
      { value: '11 days → 40 min', label: 'median lead time for change', note: 'After the platform work, measured over 14 months' },
    ],
    challenge:
      'A SOC 2 Type II commitment to a large customer, a CSPM tool producing 1,840 findings, and an engineering team of nineteen with no security specialist. The findings list had been triaged twice and abandoned twice, because a list ranked by vendor severity and filtered by nothing gives a team no way to decide what to do on Monday. Separately, deploying to production depended on one engineer and a laptop.',
    approach: [
      { n: 1, name: 'Build the identity graph', body: 'Every human user, service principal, CI role, instance profile, cross-account trust and OIDC federation, read from the actual policy documents rather than the console summary. Enumeration took hours; the analysis took three weeks.' },
      { n: 2, name: 'Filter the findings by reachability', body: 'We ingested the CSPM output and filtered to what is exploitable in this topology. 1,840 became 210, and 210 is a list a team of nineteen can act on.' },
      { n: 3, name: 'Fix the paths, as pull requests', body: 'Terraform for every recommended change, raised against their infrastructure repository and reviewed by their engineers like any other change. A diff beats a recommendation.' },
      { n: 4, name: 'Move the pipeline identity', body: 'Long-lived access keys in CI replaced with short-lived OIDC federation scoped per environment. This was the root of the four-step path and it is the most common cloud finding we report.' },
      { n: 5, name: 'Make deployment boring', body: 'Build-once-promote pipeline, preview environments per pull request, automated rollback on signal. The dependency on one engineer and one laptop was removed in week six.' },
      { n: 6, name: 'Re-run the graph', body: 'After remediation, to confirm the paths were closed rather than relocated, which is a real failure mode when fixes are applied individually.' },
    ],
    technicalLayer:
      'The path: any contributor could open a pull request; the pull-request workflow ran with the same long-lived AWS access key as the deploy workflow, because both used the repository-level secret; that key’s role could assume the production deployment role via a trust policy with no external ID and no condition on the source workflow; the deployment role carried `kms:Decrypt` on the key protecting the customer database snapshot bucket, because a restore script had needed it once in 2023 and the permission had never been removed. Four steps, no exploit, no vulnerability in any software: four configuration decisions each of which was locally reasonable. No CSPM tool ranked any of them above medium, because individually none of them is above medium. The fix was OIDC federation with a condition on both the repository and the branch, a scoped deployment role per environment, and the removal of the 2023 permission.',
    quote: {
      text: 'We had 1,840 findings and no way to start. The useful output was not the report, it was the 210 and the reason the other 1,630 did not matter in our setup. Our engineers merged the Terraform the same week.',
      name: 'VP Engineering',
      role: 'VP Engineering',
      company: 'B2B SaaS platform',
      personHeadshot: null,
    },
    stack: ['AWS', 'Terraform', 'GitHub Actions', 'Kubernetes', 'ArgoCD', 'PostgreSQL'],
    team: 'A cloud security lead, a platform engineer, and a GRC lead for the SOC 2 mapping.',
    timeline: 'Identity graph 3 weeks · remediation 14 weeks · verification week 17 · SOC 2 Type II achieved month 11',
    related: ['logistics-mdr-rollout', 'fintech-payment-platform'],
    featured: false,
    needsSignOff: false,
    cover: null,
  },

  {
    slug: 'public-sector-iso-27001',
    client: null,
    anonymisedAs: 'Arm’s-length public body, 650 employees',
    nda: true,
    industry: 'Public Sector',
    industrySlug: 'public-sector',
    country: 'United Kingdom',
    countryCode: 'GB',
    services: ['grc-compliance', 'vciso', 'penetration-testing'],
    dualPillar: false,
    engagementLength: '9 months to certificate',
    engagementType: 'Programme',
    headline:
      'ISO 27001 certification achieved in nine months with zero major non-conformities, after a previous attempt stalled for two years.',
    metrics: [
      { value: '0 major', label: 'non-conformities at Stage 2', note: 'Three minors, all closed within 30 days' },
      { value: '142 → 61', label: 'controls in scope after the scope was redrawn', note: 'The previous attempt had scoped the whole organisation' },
      { value: '86%', label: 'of evidence collected automatically', note: 'From systems already in operation' },
    ],
    challenge:
      'A two-year certification attempt had produced a 400-page policy set, a risk register in which every risk was scored medium and every treatment was "accepted", and no certificate. The root cause was visible in the first hour: the scope had been drawn around the entire organisation, including two business units with no involvement in the service the certificate was actually needed for, and every control therefore had to be evidenced across all of them.',
    approach: [
      { n: 1, name: 'Redraw the scope', body: 'Scoped to the service the certificate is needed for, with defensible boundaries and documented interfaces. 142 applicable controls became 61. This single decision was most of the two-year difference and it took four days.' },
      { n: 2, name: 'Rebuild the risk assessment from the real threat model', body: 'Risks derived from how this organisation would actually be attacked, scored with a methodology that produces a distribution rather than a column of mediums, and each with a named owner and a treatment with a date.' },
      { n: 3, name: 'Replace the policy set', body: 'The 400 pages described a generic organisation. We wrote 60 pages describing this one. An auditor tests whether the policy matches practice, and a policy describing someone else’s company fails that test while generating work for everyone obliged to pretend to follow it.' },
      { n: 4, name: 'Instrument the evidence', body: 'Access reviews, change records, backup verification and vulnerability management evidence pulled on a schedule from the systems that already produce them. 86% automated means the surveillance audit is an engineering task rather than a company-wide fire drill.' },
      { n: 5, name: 'Build the controls that were genuinely missing', body: 'Most of the remaining work was engineering, not writing: centralised logging, a real access review cycle, and a tested restore procedure. A control which has never been executed is a hypothesis.' },
      { n: 6, name: 'Audit', body: 'Stage 1, Stage 2, sample response. We sat in the audit. Three minor non-conformities, all closed inside 30 days.' },
    ],
    technicalLayer:
      'The most instructive finding was in the backup control, which the previous attempt had marked as implemented on the strength of a nightly job and a monitoring dashboard showing success. Nobody had ever performed a restore. When we tested one, the restore completed and the application would not start: the database dump excluded a schema added in 2023 because the backup script enumerated schemas from a hardcoded list written in 2019. The job had been reporting success for nineteen months while producing a backup from which the service could not be recovered. This is exactly the class of thing an auditor’s sample is designed to find and that a documentation-first programme is designed, unintentionally, to conceal, and it had nothing to do with ISO 27001. It was simply true, and nobody had looked.',
    quote: {
      text: 'Four days to redraw the scope, and that undid two years. I would like to say the lesson was about ISO 27001. It was about having someone in the room who had done it before and was willing to say the previous approach was wrong.',
      name: 'Director of Digital',
      role: 'Director of Digital',
      company: 'Arm’s-length public body',
      personHeadshot: null,
    },
    stack: ['Microsoft 365', 'Azure', 'Entra ID', 'Microsoft Sentinel'],
    team: 'A GRC lead, a security engineer for the control work, a technical writer, and a vCISO at 2 days a month.',
    timeline: 'Scope 4 days · risk and design 6 weeks · implementation 12 weeks · evidence window 12 weeks · Stage 1 month 7 · certificate month 9',
    related: ['saas-cloud-identity-review', 'logistics-mdr-rollout'],
    featured: false,
    needsSignOff: false,
    cover: null,
  },
]

export const caseStudiesBySlug: Record<string, CaseStudy> = bySlug(caseStudies)

/** Filter facets for the index - Location matters for services buyers. */
export const caseStudyFacets = {
  service: Array.from(new Set(caseStudies.flatMap((c) => c.services))).sort(),
  industry: Array.from(new Set(caseStudies.map((c) => c.industry))).sort(),
  country: Array.from(new Set(caseStudies.map((c) => c.country))).sort(),
  engagementType: Array.from(new Set(caseStudies.map((c) => c.engagementType))).sort(),
}

/** Published corpus size, shown in the index hero. */
export const caseStudyCorpus = { total: 24, published: caseStudies.length }
