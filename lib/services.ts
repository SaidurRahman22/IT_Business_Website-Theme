import { bySlug } from './lookup'
import type { LucideIcon } from 'lucide-react'
import {
  Radar,
  Bug,
  FileCode2,
  Cloud,
  ScrollText,
  Swords,
  Siren,
  UserCog,
  Boxes,
  Globe,
  Server,
  Building2,
  Users,
  GraduationCap,
  TestTubeDiagonal,
  GitBranch,
  Workflow,
  Handshake,
} from 'lucide-react'

export type Pillar = 'security' | 'software' | 'join'

export type Phase = { n: number; name: string; body: string; days?: string }
export type Faq = { q: string; a: string }

export type Service = {
  slug: string
  pillar: Pillar
  /** The ONE name for this concept, everywhere (PART 9.6). */
  name: string
  /** Short nav/card label when the full name is too long. */
  short?: string
  icon: LucideIcon
  /** H1 outcome subhead. */
  outcome: string
  /** The credibility stat that must appear in the first paragraph (PART 8.3). */
  credibility: { figure: string; context: string }
  /** ~150-word intro. */
  intro: string
  /** One-line outcome for service cards. */
  cardLine: string
  included: { title: string; body: string }[]
  phases: Phase[]
  deliverables: string[]
  outcomes: string[]
  frameworks?: string[]
  stack?: string[]
  timeline: string
  teamShape: string
  engagement: string
  faqs: Faq[]
  /** Must contain at least one cross-pillar link (PART 8.3). */
  related: string[]
  /** Slug from lib/people.ts. */
  expert: string
  caseStudy?: string
  tier: 'E' | 'R' | 'O'
}

/* ========================================================================== *
 * SECURITY PILLAR
 * ========================================================================== */

const security: Service[] = [
  {
    slug: 'penetration-testing',
    pillar: 'security',
    name: 'Penetration Testing',
    icon: Bug,
    outcome: 'Findings your engineers can fix on Monday, not a PDF nobody opens.',
    credibility: {
      figure: '2,140 confirmed findings',
      context: 'across 318 tests since 2019, with a 1.4% false-positive rate measured at retest',
    },
    intro:
      'Most penetration test reports fail at the handover. They arrive as a 90-page PDF, the critical finding is on page 41 next to a severity rubric nobody agreed to, and six weeks later the retest discovers that two of the five criticals were closed and three were reclassified as accepted risk by someone who never spoke to a tester. We test the way we would want our own systems tested: a named tester, a shared channel open for the whole engagement, criticals reported the hour they are confirmed rather than at the end, and a report whose remediation section is written for the person who owns the code. Every finding carries a reproduction path, the exact request, the affected component, and a fix we would accept in code review.',
    cardLine: 'Manual, evidence-led testing with criticals reported the hour they are confirmed.',
    included: [
      {
        title: 'Web application testing',
        body: 'Authenticated and unauthenticated, per-role. Business-logic abuse, not just the OWASP list, the flaws that matter are usually in what your application is allowed to do, not in how it parses input.',
      },
      {
        title: 'API testing',
        body: 'REST, GraphQL and gRPC against the spec and against reality. Object-level and function-level authorisation are where we find the most, and they are what scanners find least.',
      },
      {
        title: 'Mobile application testing',
        body: 'iOS and Android binaries, runtime instrumentation with Frida, certificate pinning bypass, local storage and keychain review, plus the backend the app actually talks to.',
      },
      {
        title: 'Internal and network testing',
        body: 'From an assumed-breach position on the corporate LAN or a VPN foothold. Active Directory path analysis, lateral movement, credential exposure, and the service accounts nobody has rotated since 2019.',
      },
      {
        title: 'Cloud configuration review',
        body: 'AWS, Azure and GCP. IAM trust-policy analysis, exposed storage, metadata-service access from compute, and the cross-account roles your CI uses.',
      },
      {
        title: 'Retest as standard',
        body: 'A full retest of every finding within 30 days of the report, included. Fixes get verified or they get reopened with evidence.',
      },
    ],
    phases: [
      {
        n: 1,
        name: 'Scoping',
        days: '3–5 days before start',
        body: 'A 60-minute technical call, not a questionnaire. We agree targets, roles, test accounts, rate limits, out-of-hours windows and the escalation path for a critical. You get a written scope with explicit exclusions, what we will not test is as important as what we will.',
      },
      {
        n: 2,
        name: 'Reconnaissance and mapping',
        days: 'Day 1',
        body: 'The application is walked by hand with every supplied role, and the attack surface is mapped against the architecture you described. Where the two disagree, that difference is usually the first finding.',
      },
      {
        n: 3,
        name: 'Manual testing',
        days: 'Days 2–8',
        body: 'Tooling is used for coverage and nothing else. Every candidate finding is confirmed by hand before it reaches you. Criticals and highs are reported in the shared channel within the hour, with a reproduction path, so remediation can start while the test is still running.',
      },
      {
        n: 4,
        name: 'Reporting',
        days: 'Days 9–11',
        body: 'Findings are written for two readers: an executive summary a board can act on, and a technical body an engineer can work from. Severity uses CVSS v4.0 base plus an environmental adjustment we show our working for.',
      },
      {
        n: 5,
        name: 'Debrief',
        days: 'Within 5 days of the report',
        body: 'A 90-minute call with the testers who found the issues, not an account manager. Walk the findings, argue the severities, agree the remediation order.',
      },
      {
        n: 6,
        name: 'Retest',
        days: 'Within 30 days',
        body: 'Every finding retested and the report reissued with a verified status column. Anything still open is reopened with fresh evidence, not with the original screenshot.',
      },
    ],
    deliverables: [
      'Technical report, every finding with CVSS v4.0 vector, affected component, reproduction path, raw request/response evidence, and a remediation we would accept in code review',
      'Executive summary: two pages, written for a board, with the risk narrative and the three decisions that matter',
      'Findings register as CSV and JSON, keyed for direct import into Jira, Linear or ServiceNow',
      'Retest report within 30 days with a per-finding verified status',
      '90-minute debrief with the testers',
      'Attestation letter suitable for customers, auditors and insurers',
    ],
    outcomes: [
      'Criticals reach your engineers on the day they are found, not at the end of the engagement',
      'A severity model you can defend to an auditor because the working is shown',
      'A retest that closes the loop instead of leaving a report to age',
      'Evidence you can hand to a prospect without redacting half of it',
      'A finding register that imports into your tracker instead of being retyped',
      'Testers you can argue with, by name',
    ],
    frameworks: ['OWASP ASVS 4.0', 'OWASP WSTG', 'OWASP MASVS', 'PTES', 'CREST', 'NIST SP 800-115'],
    timeline: '5–15 testing days depending on scope. Report 3 days after testing ends.',
    teamShape: 'One lead tester plus one or two testers, with a technical reviewer who signs the report.',
    engagement: 'Fixed-scope project, or an annual retainer with a reserved window each quarter.',
    faqs: [
      {
        q: 'How do you price a test?',
        a: 'By tester-days, derived from the scope call. A single-role web application with 40 endpoints is usually 5 days; a multi-tenant platform with an admin console, a public API and three user roles is usually 10 to 12. We send the day count and what it buys before you commit, and we do not pad the scope to hit a number.',
      },
      {
        q: 'Will you test production?',
        a: 'Usually yes, and it is usually the right answer, because a staging environment with synthetic data and a relaxed WAF does not tell you much. We agree rate limits, a stop-word for immediate halt, and an out-of-hours window for anything destructive. Where production testing genuinely is not viable, we test a staging environment and say so plainly in the report rather than implying coverage we did not have.',
      },
      {
        q: 'What happens if you find something critical at 2am?',
        a: 'We call. The escalation path and the phone number are agreed in scoping, and a confirmed critical is a phone call and a written reproduction within the hour, whatever time it is. You do not learn about a pre-auth remote code execution from page 41 of a PDF eleven days later.',
      },
      {
        q: 'Do you use automated scanners?',
        a: 'For coverage, yes. They are good at breadth. Everything a scanner raises is confirmed by hand before it reaches your report, which is why our measured false-positive rate at retest is 1.4%. A report that is a lightly edited scanner export is not a penetration test and you should not pay testing rates for one.',
      },
      {
        q: 'Can you work under our NDA?',
        a: 'Yes, and we will sign yours rather than insisting on ours. Every tester is background-checked before they touch client systems; the policy is published at /trust rather than described on request.',
      },
      {
        q: 'How do you handle our data?',
        a: 'Evidence is stored in a per-engagement encrypted workspace in the region you specify, access is limited to the engagement team, and everything is destroyed 90 days after the retest unless you ask us to hold it for an audit. Data residency and sub-processors are listed at /trust.',
      },
      {
        q: 'Do you give us the raw tooling output?',
        a: 'On request, yes, attached as an appendix, clearly labelled as unverified. We do not put it in the body of the report, because mixing confirmed findings with scanner noise is how a severity model loses its meaning.',
      },
      {
        q: 'What is not included?',
        a: 'Denial-of-service testing, physical intrusion, and social engineering of your staff are out of scope unless separately agreed, the first because it proves little and risks much, the other two because they belong in a red team engagement with different rules. Remediation work is also separate: we will tell you exactly what to change, and our engineering practice can do it, but a tester who fixes their own findings cannot retest them impartially.',
      },
      {
        q: 'Can we share the report with customers?',
        a: 'Yes. The attestation letter exists for exactly that, and the executive summary is written to be shareable. If a customer wants the full technical report, we will help you decide what to redact.',
      },
      {
        q: 'How soon can you start?',
        a: 'Typically two to four weeks for a new scope, and inside a week for retainer clients with a reserved window. For an active incident, do not book a test, call the hotline.',
      },
    ],
    related: ['application-security', 'red-teaming', 'devsecops', 'web-application-development'],
    expert: 'imran-haque',
    caseStudy: 'fintech-payment-platform',
    tier: 'E',
  },

  {
    slug: 'application-security',
    pillar: 'security',
    name: 'Application Security',
    short: 'AppSec',
    icon: FileCode2,
    outcome: 'Fix the class of bug, not the instance. Then make it impossible to reintroduce.',
    credibility: {
      figure: '64% median reduction',
      context: 'in repeat finding classes between a first and second test, across 41 AppSec programmes',
    },
    intro:
      'A penetration test tells you what is broken today. An application security programme tells you why that class of bug keeps appearing and what would have to change for it to stop. We read the code. We read the CI pipeline. We read the pull request template and the three places where authorisation is actually decided. Then we fix the class: a typed authorisation helper that makes the insecure call impossible to write, a CI gate with a budget rather than a wall of findings, a threat model that an engineer wrote and will therefore maintain. The deliverable is not a list. It is a smaller list next time, and the measurement to prove it.',
    cardLine: 'Secure code review, CI gates and threat models that engineers will actually maintain.',
    included: [
      {
        title: 'Secure code review',
        body: 'Manual review of authentication, authorisation, session handling, cryptography, deserialisation, file handling and the data access layer. Targeted by threat model, not by line count.',
      },
      {
        title: 'Threat modelling',
        body: 'STRIDE against your real architecture, run as a two-hour workshop with the engineers who own each component. They write it, we facilitate. A threat model authored by a consultant is read once.',
      },
      {
        title: 'SAST / DAST / SCA in CI',
        body: 'Tuned until the signal-to-noise ratio is defensible, with a finding budget rather than a hard fail on every medium. A gate that developers route around is worse than no gate.',
      },
      {
        title: 'Secure design review',
        body: 'Before the build, on the design document. The cheapest finding is the one that never becomes code.',
      },
      {
        title: 'Dependency and supply chain',
        body: 'SBOM generation, reachability analysis so you fix the 6% of CVEs that are actually callable, and signed builds with provenance attestation.',
      },
      {
        title: 'Secure coding uplift',
        body: 'Language-specific sessions against your own codebase and your own findings. Generic secure-coding training does not survive contact with a real pull request.',
      },
    ],
    phases: [
      {
        n: 1,
        name: 'Baseline',
        days: 'Week 1',
        body: 'Read the architecture, the pipeline and the last two test reports. Measure what you have: coverage, mean time to remediate, and which finding classes recur.',
      },
      {
        n: 2,
        name: 'Threat model',
        days: 'Week 2',
        body: 'One workshop per bounded context, authored by the owning engineers. Output is a short document and a ranked list of the controls worth building.',
      },
      {
        n: 3,
        name: 'Deep review',
        days: 'Weeks 3–4',
        body: 'Manual code review targeted by the threat model. Findings land as pull request comments and tickets in your tracker, not as a document.',
      },
      {
        n: 4,
        name: 'Pipeline work',
        days: 'Weeks 4–5',
        body: 'SAST, DAST, SCA and secret scanning configured, tuned and gated with an agreed budget. We write the configuration; your engineers review it like any other change.',
      },
      {
        n: 5,
        name: 'Structural fixes',
        days: 'Weeks 5–8',
        body: 'Build the helpers and defaults that make the bug class unwriteable. A typed permission check, a template that escapes by default, a linter that refuses the raw query builder.',
      },
      {
        n: 6,
        name: 'Measure',
        days: 'Quarterly',
        body: 'Re-measure the baseline. The programme is working when the next test finds fewer of the same thing and more of something new.',
      },
    ],
    deliverables: [
      'Threat model per bounded context, authored by your engineers, in your repository',
      'Code review findings as pull request comments plus tickets in your tracker',
      'Working CI configuration for SAST, DAST, SCA and secret scanning, with the tuning rationale documented',
      'Secure-defaults library and the lint rules that enforce it',
      'SBOM with reachability analysis',
      'Quarterly programme report with the recurrence metric',
    ],
    outcomes: [
      'Repeat finding classes fall measurably between tests',
      'A CI gate developers do not route around',
      'Authorisation decided in one place instead of forty',
      'Dependency work prioritised by reachability, not by CVE count',
      'Threat models that get updated because their authors own them',
      'An audit trail that satisfies SOC 2 CC8.1 without a separate evidence exercise',
    ],
    frameworks: ['OWASP ASVS 4.0', 'OWASP SAMM 2.0', 'NIST SSDF (SP 800-218)', 'SLSA v1.0'],
    timeline: '8 weeks for an initial programme, then a quarterly cadence.',
    teamShape: 'One application security lead, one reviewer, and an engineer from our build practice for the structural work.',
    engagement: 'Programme engagement with a quarterly review, or embedded days per sprint.',
    faqs: [
      {
        q: 'How is this different from a penetration test?',
        a: 'A test is a point-in-time measurement from the outside. This is the programme that changes the measurement. Most clients buy both: the test gives you the number, the programme moves it. Buying only tests is how an organisation ends up with four years of reports that all contain the same three finding classes.',
      },
      {
        q: 'Do you need access to our source code?',
        a: 'Yes, for the review portion. Read-only access to the repository, scoped to the engagement team, under your NDA, for the duration. Every reviewer is background-checked; the policy is at /trust. We can work in your environment on your hardware if your policy requires it.',
      },
      {
        q: 'Our developers resist security tooling. How do you handle that?',
        a: 'By agreeing the budget before turning the gate on, and by fixing the tooling rather than the developers. A SAST configuration that raises 4,000 findings on first run is not a security control, it is an obstacle, and routing around it is the rational response. We tune to a defensible signal-to-noise ratio first, gate second, and put the tuning rationale in the repository so the next engineer can argue with it.',
      },
      {
        q: 'Can you work in our language and framework?',
        a: 'TypeScript, Python, Go, Java, C#, Ruby, PHP, Rust, Kotlin and Swift are all routine. If your stack is genuinely unusual we will say so during scoping and either bring in a specialist or decline, a reviewer who is learning your language on your budget is not a reviewer.',
      },
      {
        q: 'What does a finding budget mean?',
        a: 'An agreed threshold for what blocks a build, by severity and by whether the code path is reachable. Criticals and reachable highs block. Everything else lands in a queue with a service level. The point is that the gate stays credible, so when it does fire, people stop.',
      },
      {
        q: 'How do you measure success?',
        a: 'Recurrence of finding classes between tests, mean time to remediate by severity, and the share of findings caught before merge rather than after release. We baseline all three in week one so the quarterly number means something.',
      },
      {
        q: 'Will you write the fixes?',
        a: 'For structural work (the helpers, the defaults, the lint rules) yes, and our engineering practice treats it as ordinary delivery work with pull requests and review. For individual findings we would rather your team fixed them, because the team that writes the fix remembers the cause.',
      },
      {
        q: 'Does this satisfy SOC 2 or ISO 27001?',
        a: 'It produces most of the evidence for SOC 2 CC7 and CC8 and for ISO 27001 Annex A 8.25 to 8.31, as a by-product rather than as a separate exercise. Our GRC practice maps the output to whichever framework you are being audited against.',
      },
    ],
    related: ['penetration-testing', 'devsecops', 'grc-compliance', 'custom-software'],
    expert: 'sofia-marek',
    caseStudy: 'healthtech-secure-sdlc',
    tier: 'E',
  },

  {
    slug: 'cloud-security',
    pillar: 'security',
    name: 'Cloud Security',
    icon: Cloud,
    outcome: 'The identity graph, not the misconfiguration list.',
    credibility: {
      figure: '11 of 14 cloud reviews',
      context: 'found at least one path from a low-privilege identity to full account administrator',
    },
    intro:
      'Cloud security posture tools produce a list of misconfigurations ranked by a vendor severity that does not know your architecture. The question that matters is different and harder: from any identity an attacker could plausibly obtain, what is reachable? We build the identity graph for your accounts (human users, service principals, CI roles, instance profiles, cross-account trust, OIDC federation) and we trace the paths. A public S3 bucket is a finding. A CI role that can assume a production deployment role that can read the KMS key that decrypts the customer database is an incident waiting for a leaked token, and no posture tool will rank it first.',
    cardLine: 'Identity-path analysis across AWS, Azure and GCP, not a CSPM findings dump.',
    included: [
      { title: 'Identity and access review', body: 'IAM policies, trust relationships, permission boundaries, SCPs, and every path from an assumable identity to a privileged one.' },
      { title: 'Network and perimeter', body: 'VPC design, security groups, NACLs, private endpoints, egress control, and what is actually reachable from the internet versus what you believe is.' },
      { title: 'Data protection', body: 'Encryption at rest and in transit, KMS key policies, and who can decrypt what through which role chain.' },
      { title: 'Workload security', body: 'Container images, Kubernetes RBAC and admission control, serverless execution roles, and metadata service access from compute.' },
      { title: 'CI/CD and supply chain', body: 'Pipeline identities, OIDC federation to your repository provider, artefact signing, and the branch protection that stands between a pull request and production.' },
      { title: 'Detection coverage', body: 'What your current logging would and would not have caught, mapped against MITRE ATT&CK for Cloud.' },
    ],
    phases: [
      { n: 1, name: 'Inventory', days: 'Week 1', body: 'Read-only role, full account enumeration, and the identity graph built from the actual policy documents rather than from the console summary.' },
      { n: 2, name: 'Path analysis', days: 'Week 1–2', body: 'Trace privilege escalation and lateral movement paths. Each path gets a concrete narrative: this identity, this action, this result.' },
      { n: 3, name: 'Configuration review', days: 'Week 2', body: 'Benchmark review against CIS and the relevant provider baseline, filtered to what is exploitable in your topology.' },
      { n: 4, name: 'Detection gap analysis', days: 'Week 3', body: 'Replay representative attack techniques against your logging and show which ones produce a detectable signal today.' },
      { n: 5, name: 'Remediation plan', days: 'Week 3', body: 'Ordered by path severity, with Terraform or Bicep for the fixes we recommend. A diff beats a recommendation.' },
      { n: 6, name: 'Verification', days: 'Week 6', body: 'Re-run the graph after remediation and confirm the paths are closed rather than relocated.' },
    ],
    deliverables: [
      'Identity graph with every privilege-escalation and lateral-movement path, as a diagram and as queryable data',
      'Configuration findings filtered to what is exploitable in your topology, with CIS benchmark mapping',
      'Detection coverage matrix against MITRE ATT&CK for Cloud',
      'Infrastructure-as-code pull requests for the recommended fixes',
      'Verification report after remediation',
    ],
    outcomes: [
      'Privilege-escalation paths closed, not just buckets made private',
      'A remediation order based on reachability rather than vendor severity',
      'Terraform you can merge instead of advice you have to translate',
      'Known detection gaps, with the query that would close each one',
      'Evidence mapped to SOC 2, ISO 27001 and PCI DSS cloud requirements',
    ],
    frameworks: ['CIS Benchmarks', 'AWS Well-Architected Security Pillar', 'MITRE ATT&CK for Cloud', 'NIST SP 800-204'],
    stack: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Terraform', 'Pulumi'],
    timeline: '3 weeks per cloud estate, verification at week 6.',
    teamShape: 'One cloud security lead and one platform engineer who writes the infrastructure-as-code fixes.',
    engagement: 'Fixed-scope review, or continuous posture monitoring as part of an MDR retainer.',
    faqs: [
      { q: 'Do you need write access?', a: 'No. The review runs entirely from a read-only role you create and can delete afterwards, we supply the Terraform for it. Remediation arrives as pull requests against your infrastructure repository, which your team merges.' },
      { q: 'We already run a CSPM tool. What does this add?', a: 'Your CSPM tool knows configurations; it does not know which of them are reachable from an identity an attacker could get. We ingest its findings, filter out the ones that are unexploitable in your topology, and add the path analysis it cannot do. Most clients see the finding count fall sharply and the remaining list become actionable.' },
      { q: 'How long does the identity graph take on a large estate?', a: 'Enumeration is automated and takes hours even across dozens of accounts. The analysis is the human part: three weeks covers an estate of up to roughly 40 accounts. Beyond that we scope by business unit.' },
      { q: 'Can you review Kubernetes specifically?', a: 'Yes, RBAC, admission control, network policy, secrets handling, workload identity and the node-to-control-plane boundary. On managed clusters we also review the cloud identity attached to the node pool, which is where cluster compromise usually becomes account compromise.' },
      { q: 'Does this cover multi-cloud?', a: 'Yes, and the interesting findings are usually at the joins, the federated identity that lets a GitHub Actions workflow assume a role in AWS and a service principal in Azure, with nobody owning the trust boundary between them.' },
      { q: 'Will you help us fix it?', a: 'We write the infrastructure-as-code for the recommended fixes and raise them as pull requests. If you want the remediation delivered, our platform engineering practice does that as a separate engagement, and a different engineer verifies it.' },
    ],
    related: ['penetration-testing', 'managed-detection-response', 'platform-engineering', 'grc-compliance'],
    expert: 'daniel-okafor',
    tier: 'E',
  },

  {
    slug: 'grc-compliance',
    pillar: 'security',
    name: 'GRC & Compliance',
    icon: ScrollText,
    outcome: 'Certification as a by-product of controls that work, not a parallel paperwork exercise.',
    credibility: {
      figure: '23 certifications achieved',
      context: 'first time, with no major non-conformities, across SOC 2, ISO 27001 and PCI DSS',
    },
    intro:
      'There are two ways to pass an audit. One is to build a controls programme that genuinely reduces risk and then evidence it. The other is to build a documentation programme that satisfies an auditor and runs alongside the real company, costing a fortune to maintain and protecting nothing. The second is more common, and you can usually tell within an hour of reading the risk register, every risk scored medium, every treatment "accepted", every control owner the same person. We build the first kind. The controls come from your actual architecture and your actual threat model, the evidence is generated by systems you already run, and the audit is a reading of what exists rather than a performance staged for a week.',
    cardLine: 'SOC 2, ISO 27001, PCI DSS, DORA and NIS2, evidenced from systems you already run.',
    included: [
      { title: 'Readiness assessment', body: 'Gap analysis against the target framework, with an honest estimate of effort and cost per gap. No gap is closed by a policy document alone.' },
      { title: 'Control design and implementation', body: 'Controls built into the systems that already exist, so evidence is a query rather than a screenshot taken the week before the audit.' },
      { title: 'ISMS build', body: 'Scope statement, risk methodology, Statement of Applicability, and a risk register with real treatment decisions and named owners.' },
      { title: 'Evidence automation', body: 'Control evidence pulled from your cloud provider, your identity provider, your tracker and your CI, on a schedule, into an audit workspace.' },
      { title: 'Audit management', body: 'Auditor selection, Stage 1 and Stage 2 preparation, sample response, and someone in the room who has answered these questions before.' },
      { title: 'Ongoing operation', body: 'Internal audit, management review, corrective actions, and surveillance audit preparation. Certification is a subscription, not a purchase.' },
    ],
    phases: [
      { n: 1, name: 'Scope and gap', days: 'Weeks 1–3', body: 'Define the certification scope precisely, an over-wide scope is the single most expensive early mistake, then assess against it.' },
      { n: 2, name: 'Risk and design', days: 'Weeks 4–6', body: 'Risk assessment from your real threat model. Controls designed against those risks, each with an owner and an evidence source.' },
      { n: 3, name: 'Implementation', days: 'Weeks 7–18', body: 'Build the controls. Most of the work is engineering, not writing: logging, access review, change management, backup verification.' },
      { n: 4, name: 'Evidence and observation', days: 'Weeks 14–26', body: 'Run the controls and accumulate the observation window. SOC 2 Type II needs three to twelve months of operation; it cannot be compressed.' },
      { n: 5, name: 'Audit', days: 'Weeks 26–32', body: 'Stage 1, Stage 2, sample response, non-conformity management. We sit in the audit with you.' },
      { n: 6, name: 'Operate', days: 'Ongoing', body: 'Internal audit, management review, corrective action, surveillance. Handover to your team when they are ready to own it.' },
    ],
    deliverables: [
      'Readiness report with a costed, ordered gap list',
      'Risk methodology, risk register and Statement of Applicability',
      'Policy set written for your organisation, not a template pack',
      'Automated evidence collection into an audit workspace',
      'Internal audit programme and management review pack',
      'Audit support through to certificate issue',
    ],
    outcomes: [
      'Certification achieved without a separate parallel paperwork company',
      'Evidence generated by systems you already run',
      'A risk register a technical reader finds credible',
      'Security questionnaires answered from one source of truth',
      'Surveillance audits that are uneventful',
    ],
    frameworks: ['SOC 2', 'ISO/IEC 27001:2022', 'ISO/IEC 27701', 'PCI DSS 4.0', 'HIPAA', 'UK GDPR', 'NIS2', 'DORA', 'Cyber Essentials Plus'],
    timeline: 'ISO 27001 typically 7–9 months to certificate. SOC 2 Type II is bounded by the observation window.',
    teamShape: 'One GRC lead, one security engineer for the control work, and a technical writer.',
    engagement: 'Programme engagement to certificate, then a fractional retainer, or vCISO.',
    faqs: [
      { q: 'How long does ISO 27001 actually take?', a: 'Seven to nine months from a standing start to certificate for an organisation of 50 to 300 people, assuming engineering capacity is available for the control work. Anyone promising three months is either scoping very narrowly or writing documents that an auditor will test and find hollow.' },
      { q: 'SOC 2 Type I or Type II?', a: 'Type I is a point-in-time design opinion and most enterprise buyers now treat it as a staging post. Go to Type II with a three-month initial window if you need something fast, then extend to twelve. Type I alone increasingly fails to clear procurement.' },
      { q: 'Can we reuse work across frameworks?', a: 'Substantially. ISO 27001 and SOC 2 overlap by roughly 70% at control level, and PCI DSS adds a scoped set on top. We map controls once to a common register and generate the per-framework view, so a second certification costs far less than the first.' },
      { q: 'Do you provide the policies?', a: 'We write them for your organisation. A template pack is worse than nothing: an auditor tests whether the policy describes what you do, and a policy describing someone else’s company fails that test while creating work for everyone who has to pretend to follow it.' },
      { q: 'Who audits us?', a: 'Not us. That would be a conflict and no accredited body would accept it. We help you select a certification body or CPA firm, prepare you, and sit with you through the audit. We will tell you which auditors are thorough and which are cheap, and the difference matters to how much your certificate is worth.' },
      { q: 'What about DORA and NIS2?', a: 'Both are in force and both are operational rather than documentary: DORA wants evidence of threat-led penetration testing and third-party risk management; NIS2 wants incident reporting inside 24 hours and management accountability with personal liability. Our testing and MDR practices supply the evidence, which is one of the practical advantages of buying both from one firm.' },
      { q: 'We already have a certificate and the renewal is painful. Can you help?', a: 'That is usually a symptom of evidence being collected by hand. We instrument the evidence sources, retire the controls that exist only to be audited, and reduce the scope where it was drawn too wide. Renewals typically become an engineering task rather than a company-wide fire drill.' },
      { q: 'Do you offer vCISO alongside this?', a: 'Yes, and it is a common pairing: the GRC programme builds the system, the vCISO runs it and owns the board conversation. See /services/vciso.' },
    ],
    related: ['vciso', 'application-security', 'cloud-security', 'custom-software'],
    expert: 'claire-benoit',
    tier: 'E',
  },

  {
    slug: 'managed-detection-response',
    pillar: 'security',
    name: 'Managed Detection & Response',
    short: 'MDR',
    icon: Radar,
    outcome: 'Analysts who read your architecture before they read your alerts.',
    credibility: {
      figure: '6 minutes median',
      context: 'from detection to a human analyst making contact, measured across 2026 to date',
    },
    intro:
      'Most managed detection is alert triage performed by people who have never seen your architecture diagram. They forward the alert, you do the investigation, and the service level is measured on how fast the forwarding happened. We run it differently. Onboarding starts with your architecture, your identity model and your crown-jewel systems, and the detections we write are specific to them, not a vendor rule pack with the noisy ones disabled. When something fires, an analyst investigates before you hear about it, and what reaches you is a conclusion with evidence and a recommended action, not a notification. Where you have authorised containment, we contain first and tell you immediately.',
    cardLine: '24/7 detection and response on your telemetry, with detections written for your architecture.',
    included: [
      { title: 'Detection engineering', body: 'Detections written against your architecture and mapped to MITRE ATT&CK, version-controlled and reviewed like code. Detection-as-code, in a repository you can read.' },
      { title: '24/7 triage and investigation', body: 'Human analysts, not a forwarding service. Investigation happens before escalation, and the escalation carries a conclusion.' },
      { title: 'Containment', body: 'Pre-authorised actions executed inside your runbook (host isolation, session revocation, key disablement) with immediate notification.' },
      { title: 'Threat hunting', body: 'Hypothesis-driven hunts each month against your telemetry, informed by what we see across the client base and in our own research.' },
      { title: 'Platform operations', body: 'We operate your SIEM and EDR (Wazuh, Elastic, Microsoft Sentinel, CrowdStrike, SentinelOne) or run ours. Your data stays in your tenancy and your region.' },
      { title: 'Coverage reporting', body: 'Monthly ATT&CK coverage, detection changes, alert volume, false-positive rate and tuning decisions, with the reasoning.' },
    ],
    phases: [
      { n: 1, name: 'Architecture onboarding', days: 'Weeks 1–2', body: 'Your architecture, identity model, crown jewels and existing telemetry. We write down what an attack on you would look like before writing a single detection.' },
      { n: 2, name: 'Telemetry and baseline', days: 'Weeks 2–4', body: 'Log sources connected and validated, a source that is configured but not arriving is the most common gap we find. Normal behaviour baselined.' },
      { n: 3, name: 'Detection build', days: 'Weeks 4–6', body: 'Detections written, tested against replayed technique data, and committed to the detection repository.' },
      { n: 4, name: 'Runbook and authority', days: 'Week 6', body: 'Agree what we may do without asking, what needs a call, and who to call at 3am. A containment authority nobody agreed to is a containment authority nobody uses.' },
      { n: 5, name: 'Go live', days: 'Week 7', body: 'Parallel run, then full handover of monitoring. A purple-team exercise in week eight validates the coverage with real technique execution.' },
      { n: 6, name: 'Operate and improve', days: 'Ongoing', body: 'Monthly hunts, quarterly purple team, continuous tuning. Coverage is reported as a trend, not as a number in isolation.' },
    ],
    deliverables: [
      'Detection repository, version-controlled, mapped to MITRE ATT&CK, yours to keep',
      'Validated log source inventory with coverage gaps named',
      'Incident runbook with agreed containment authority and escalation paths',
      'Monthly coverage and tuning report with reasoning, not just counts',
      'Quarterly purple-team validation of the detections that matter',
      'Post-incident reports with root cause and control changes',
    ],
    outcomes: [
      'An analyst makes contact in minutes, with a conclusion rather than an alert',
      'Detections that reflect your architecture, reviewed like code',
      'Telemetry gaps found during onboarding rather than during an incident',
      'Containment inside the window where it still helps',
      'Coverage you can show an auditor and a board',
      'A detection repository you keep if you leave',
    ],
    frameworks: ['MITRE ATT&CK', 'NIST SP 800-61r3', 'Sigma', 'OCSF'],
    stack: ['Wazuh', 'Elastic Security', 'Microsoft Sentinel', 'CrowdStrike Falcon', 'SentinelOne', 'Cloudflare'],
    timeline: '7 weeks to full monitoring. Purple-team validation at week 8.',
    teamShape: 'A named service lead, a detection engineer, and a 24/7 analyst rota of nine.',
    engagement: 'Annual retainer priced by log volume and endpoint count, with incident response hours included.',
    faqs: [
      { q: 'Do we have to move to your platform?', a: 'No. We would rather operate what you already have, and your data staying in your tenancy and your region is usually the right answer for both data residency and exit. If you have no platform we will deploy one in your account, not ours.' },
      { q: 'What does your SLA actually commit to?', a: 'Time to human contact, not time to alert forwarding. Fifteen minutes for critical, with a 2026 median of six. A service level measured on forwarding speed rewards the wrong behaviour and you should read every MDR contract for which one it buys.' },
      { q: 'Can you contain without asking us?', a: 'Only what you pre-authorise in the runbook, and we notify immediately. Most clients authorise host isolation and session revocation after a confirmed detection, and require a call before anything that affects production availability. The authority is reviewed quarterly.' },
      { q: 'How do you avoid drowning us in alerts?', a: 'Analysts investigate before escalating, so volume to you is conclusions rather than alerts, typically single digits per week for a mid-size estate. False-positive rate and tuning decisions are reported monthly with the reasoning, so you can challenge them.' },
      { q: 'What if we are breached right now?', a: 'Call the hotline. Do not wait for an onboarding call, incident response is available to non-clients and the number is in the navigation of every page on this site.' },
      { q: 'Do you cover cloud and identity, or only endpoints?', a: 'Cloud control plane, identity provider, SaaS audit logs, network and endpoint. Identity is where most real intrusions are now visible first, and an EDR-only service will miss a session-token replay entirely.' },
      { q: 'What happens to the detections if we leave?', a: 'They are yours. The repository is in your source control from day one, written in Sigma or your platform’s native language, with the test cases. Exit should cost you nothing but notice.' },
    ],
    related: ['incident-response', 'cloud-security', 'penetration-testing', 'platform-engineering'],
    expert: 'daniel-okafor',
    caseStudy: 'logistics-mdr-rollout',
    tier: 'E',
  },

  {
    slug: 'incident-response',
    pillar: 'security',
    name: 'Incident Response',
    icon: Siren,
    outcome: 'A responder on the phone in minutes, and a forensic record that holds up afterwards.',
    credibility: {
      figure: '4 minutes median pickup',
      context: 'on the 24/7 hotline, with a responder briefed and working within 30 minutes',
    },
    intro:
      'An incident is a decision-making problem under time pressure with incomplete information, and most of the damage is done by decisions made in the first two hours. Rebuilding a compromised host before it is imaged destroys the evidence that would have told you what was taken. Resetting every password before the persistence is found tells the intruder you are watching. We bring a responder who has done this before, a forensic process that preserves what the lawyers and the regulator will later need, and the discipline to find the whole footprint before closing the door. The hotline is answered by a responder, it is not behind a form, and you do not need to be a client to call it.',
    cardLine: '24/7 hotline answered by a responder. Retainer or emergency.',
    included: [
      { title: 'Emergency response', body: 'Hotline to a responder, triage inside 30 minutes, and a remote team working within the hour. On-site where it is warranted.' },
      { title: 'Digital forensics', body: 'Memory and disk imaging with chain of custody, cloud and identity log reconstruction, and malware analysis. Evidence handled so it stays admissible.' },
      { title: 'Containment and eradication', body: 'Find the full footprint before closing any door. Partial eradication is how an organisation gets compromised twice by the same actor.' },
      { title: 'Recovery', body: 'Rebuild order, backup integrity validation, and staged restoration with monitoring in place before anything returns to service.' },
      { title: 'Regulatory and legal support', body: 'Evidence packs for GDPR Article 33, NIS2 24-hour reporting, DORA, and your cyber insurer. Written to be submitted.' },
      { title: 'IR retainer', body: 'Pre-agreed terms, pre-signed NDA, an environment we already understand, and reserved hours. The retainer removes the procurement call from the worst hour of your year.' },
    ],
    phases: [
      { n: 1, name: 'Contact and triage', days: 'Hour 0', body: 'A responder answers, establishes what is known, and decides what must stop immediately versus what must be preserved.' },
      { n: 2, name: 'Stabilise', days: 'Hours 1–6', body: 'Preserve evidence, establish an out-of-band communications channel, and prevent the obvious spread without alerting the actor prematurely.' },
      { n: 3, name: 'Investigate', days: 'Days 1–5', body: 'Timeline reconstruction, initial access, persistence, privilege escalation, lateral movement, and what was accessed or exfiltrated.' },
      { n: 4, name: 'Eradicate', days: 'Coordinated', body: 'Remove the whole footprint at once. Monitoring and detection are in place before the actor learns they have been found.' },
      { n: 5, name: 'Recover', days: 'Days 3–14', body: 'Staged restoration against a validated rebuild order, with heightened monitoring and a watch period.' },
      { n: 6, name: 'Learn', days: 'Weeks 2–4', body: 'Root cause, a timeline that is honest about detection and decision delays, and the control changes that would have altered the outcome.' },
    ],
    deliverables: [
      'Incident timeline with evidence references and chain of custody',
      'Root cause analysis naming the control that failed and the control that would have caught it',
      'Indicators of compromise, with detections to prevent recurrence',
      'Regulatory notification pack for GDPR, NIS2, DORA or sector regulator',
      'Executive and board briefing',
      'Post-incident control roadmap with owners and dates',
    ],
    outcomes: [
      'Decisions made by someone who has made them before',
      'Evidence preserved rather than destroyed by a well-meaning rebuild',
      'The whole footprint found before the door is closed',
      'Regulatory deadlines met with a submittable pack',
      'Detections written so the same path does not work twice',
    ],
    frameworks: ['NIST SP 800-61r3', 'SANS PICERL', 'MITRE ATT&CK', 'ISO/IEC 27035'],
    timeline: 'Hotline answered 24/7. Triage within 30 minutes. Remote team within the hour.',
    teamShape: 'An incident lead, two to four responders, a forensic analyst, and a communications adviser.',
    engagement: 'Retainer with reserved hours, or emergency engagement at incident rates.',
    faqs: [
      { q: 'We think we are being attacked right now. What do we do?', a: `Call ${'+44 20 4525 9100'}. Do not email, do not fill in a form, and do not reboot or rebuild anything yet. A responder will answer and tell you what to preserve in the first five minutes, that conversation is free and it routinely changes the outcome.` },
      { q: 'Do we need a retainer to call?', a: 'No. We take emergency engagements from non-clients. A retainer buys pre-agreed commercial terms, a pre-signed NDA, reserved hours and a team that already knows your environment, which typically removes four to twelve hours of procurement and onboarding from hour one of an incident.' },
      { q: 'Should we pay a ransom?', a: 'That is a business decision with legal and sanctions dimensions, and we will not make it for you. We will tell you what we can recover without paying, what the decryptor is likely to deliver if you do, whether the actor is subject to sanctions, and what the data we have found suggests about the exfiltration claim. Many organisations discover their backups were viable once someone competent tested them.' },
      { q: 'Will you work with our insurer and lawyers?', a: 'Routinely, and we will work under legal privilege where your counsel directs it. Tell us at hour zero if privilege applies, because it changes how reporting is structured.' },
      { q: 'Can you work with our existing MDR provider?', a: 'Yes, and we would rather augment than displace during an incident. Changing providers mid-incident loses context you cannot afford to lose.' },
      { q: 'How much does an emergency engagement cost?', a: 'Incident rates by responder-day with a minimum engagement, quoted on the first call before work starts. Retainer clients draw against reserved hours at standard rates. We will not refuse to quote while the clock runs.' },
      { q: 'What do you need from us on day one?', a: 'An out-of-band way to talk, someone with authority to make containment decisions, read access to your identity provider and cloud control plane, and your network and architecture documentation however rough. We bring the tooling.' },
    ],
    related: ['managed-detection-response', 'penetration-testing', 'grc-compliance', 'platform-engineering'],
    expert: 'imran-haque',
    tier: 'E',
  },

  {
    slug: 'red-teaming',
    pillar: 'security',
    name: 'Red Teaming',
    icon: Swords,
    outcome: 'A test of your detection and response, not of your patch level.',
    credibility: {
      figure: '7 of 9 red teams',
      context: 'reached a crown-jewel objective; 3 were detected before reaching it',
    },
    intro:
      'A penetration test asks whether a system is vulnerable. A red team asks whether your organisation would notice and what it would do. Those are different questions and they need different engagements, which is why running a red team against an estate that has never had a penetration test is usually a waste of money. If nobody has looked for the unauthenticated file upload, a red team will find it, and you will have paid red team rates to learn something a test would have told you for less. We run red teams against organisations with a functioning security programme, under objectives agreed with a small control group, with a white cell that knows the exercise is running and a blue team that does not.',
    cardLine: 'Objective-based adversary simulation, with a purple-team debrief that transfers the knowledge.',
    included: [
      { title: 'Objective-based simulation', body: 'Agreed crown-jewel objectives (payment initiation, customer data access, production deployment) rather than a vulnerability count.' },
      { title: 'Initial access', body: 'External infrastructure, credential stuffing against exposure, phishing and pretexting where authorised, and the supply chain path.' },
      { title: 'Social engineering', body: 'Phishing, vishing and physical pretexting under strict rules of engagement, with staff treated as colleagues rather than as targets to embarrass.' },
      { title: 'Assumed breach', body: 'Start from a foothold to test detection depth rather than spending the budget proving perimeter entry is possible.' },
      { title: 'Purple-team debrief', body: 'Replay the whole attack path with your defenders, step by step, and build the detections live. This is where most of the value lands.' },
      { title: 'Tabletop exercise', body: 'Run the executive decision-making scenario separately, because the technical path and the decision path fail in different ways.' },
    ],
    phases: [
      { n: 1, name: 'Objectives and rules', days: 'Weeks 1–2', body: 'Control group formed, objectives agreed, rules of engagement written, legal authorisation signed, and a deconfliction process established.' },
      { n: 2, name: 'Reconnaissance', days: 'Weeks 2–3', body: 'Open-source intelligence on infrastructure, people and suppliers. Most clients find this phase alone worth the engagement.' },
      { n: 3, name: 'Initial access', days: 'Weeks 3–5', body: 'Attempt entry through the authorised vectors, with every action logged for later replay against your telemetry.' },
      { n: 4, name: 'Objective pursuit', days: 'Weeks 5–8', body: 'Escalate, move laterally and pursue the objectives. If detected, we note it precisely and, where agreed, continue from a new position.' },
      { n: 5, name: 'Debrief', days: 'Week 9', body: 'Control group first, then a full purple-team replay with the defenders. Detections written in the room.' },
      { n: 6, name: 'Retest detections', days: 'Week 12', body: 'Re-execute the techniques that went unnoticed and confirm the new detections fire.' },
    ],
    deliverables: [
      'Attack narrative with a full timeline and the evidence for each step',
      'Detection and response assessment: what fired, what did not, and how long each decision took',
      'Technique-by-technique ATT&CK mapping with your coverage marked',
      'Purple-team session with detections built live',
      'Executive briefing framed as organisational capability, never as individual blame',
      'Detection retest report',
    ],
    outcomes: [
      'An evidenced answer to whether you would notice',
      'Response times measured against a real adversary rather than a drill',
      'Detections built with your own team, for the gaps that actually existed',
      'Threat-led testing evidence for DORA and CBEST-style requirements',
      'A board conversation grounded in a narrative rather than a severity chart',
    ],
    frameworks: ['MITRE ATT&CK', 'TIBER-EU', 'CBEST', 'DORA TLPT', 'CREST STAR'],
    timeline: '8–12 weeks, including a 3-week preparation phase.',
    teamShape: 'A red team lead, two or three operators, and a dedicated white cell contact.',
    engagement: 'Fixed-scope project. Annual cadence is typical for regulated firms.',
    faqs: [
      { q: 'How is this different from a penetration test?', a: 'A test measures a system; a red team measures your organisation. Do not buy one before the other, a red team against an untested estate finds the obvious vulnerability a test would have found at a lower rate, and you learn nothing about your detection because the engagement ended at the first open door.' },
      { q: 'Will you phish our staff?', a: 'Only if authorised, and the framing matters. Results are reported as an organisational control outcome, never as a league table of who clicked. A phishing exercise that produces blame makes the next real report arrive later, which is a net loss to your security posture.' },
      { q: 'Who knows the exercise is running?', a: 'A control group of two to four people, plus a white cell contact reachable at any hour for deconfliction. The blue team does not know, because that is the entire point. We will stand down immediately on a control group instruction.' },
      { q: 'What if you cause an outage?', a: 'Rules of engagement prohibit destructive actions, we hold a stop-word that halts everything, and the white cell contact can reach an operator at any hour. In nine engagements we have had no client-impacting outage, and we will tell you if that changes.' },
      { q: 'Does this satisfy DORA threat-led penetration testing?', a: 'The methodology aligns with TIBER-EU and DORA TLPT. Formal TLPT requires a threat intelligence provider and a tester that meet regulator independence criteria, and in some engagements that means we act as one and not the other. We will tell you which during scoping rather than after.' },
      { q: 'Is the purple team optional?', a: 'Technically, but declining it is leaving most of the value on the table. A red team report tells you what happened; the purple session is where your defenders learn to see it, and where the detections actually get written.' },
    ],
    related: ['penetration-testing', 'managed-detection-response', 'incident-response', 'application-security'],
    expert: 'imran-haque',
    tier: 'R',
  },

  {
    slug: 'vciso',
    pillar: 'security',
    name: 'vCISO',
    icon: UserCog,
    outcome: 'Security leadership at the board table, at a fraction of a hire.',
    credibility: {
      figure: '9 current engagements',
      context: 'averaging 2.4 days a month, with 4 clients having since hired a permanent CISO we helped recruit',
    },
    intro:
      'Below roughly 400 people, a full-time CISO is often the wrong shape of hire: the strategic work is a few days a month, the operational work is engineering, and a senior security leader with no team spends their first year building one instead of reducing risk. A vCISO gives you the leadership (the board conversation, the risk decisions, the programme ownership, the vendor and insurer negotiation) without the headcount. The explicit goal is to become unnecessary. We write the plan that gets you to a permanent hire, and we will help you recruit and hand over to them.',
    cardLine: 'Fractional security leadership, with an explicit plan to make itself redundant.',
    included: [
      { title: 'Board and executive reporting', body: 'Risk in business language, quarterly, with the two or three decisions that need a decision-maker rather than a dashboard.' },
      { title: 'Strategy and roadmap', body: 'A costed, ordered security roadmap tied to actual business risk and actual budget, reviewed quarterly against what changed.' },
      { title: 'Risk management', body: 'A risk register that gets used, real treatment decisions, named owners, and risks that get closed rather than perpetually reviewed.' },
      { title: 'Programme ownership', body: 'Own the compliance programme, the testing cadence, the MDR relationship and the incident readiness, so no single engineer is quietly carrying all four.' },
      { title: 'Customer assurance', body: 'Security questionnaires, customer security reviews and audit conversations handled, so your engineers stay on the roadmap.' },
      { title: 'Succession', body: 'The hiring plan, the job description, interview support, and a handover pack for the permanent CISO.' },
    ],
    phases: [
      { n: 1, name: 'Assess', days: 'Month 1', body: 'Current posture, obligations, real risk, and what the organisation can absorb. An honest baseline, including what is not worth fixing yet.' },
      { n: 2, name: 'Plan', days: 'Month 2', body: 'A costed roadmap with an order, presented to the board with the trade-offs made explicit.' },
      { n: 3, name: 'Establish', days: 'Months 2–4', body: 'Governance that fits your size: a security forum that meets, a risk register that moves, an incident process that has been rehearsed.' },
      { n: 4, name: 'Execute', days: 'Ongoing', body: 'Drive the roadmap, own the vendors, handle assurance, and report quarterly on movement rather than activity.' },
      { n: 5, name: 'Transition', days: 'Month 12+', body: 'Hiring plan, recruitment support, handover. Then a lighter advisory retainer if the new CISO wants one.' },
    ],
    deliverables: [
      'Posture assessment and costed risk baseline',
      'Board-ready security strategy and quarterly reporting pack',
      'Risk register with owners, treatments and closure dates',
      'Policy framework proportionate to your size',
      'Incident response plan, rehearsed at least twice a year',
      'CISO hiring plan and handover documentation',
    ],
    outcomes: [
      'A security voice in the room where budget is decided',
      'A roadmap with an order and a cost, not a wish list',
      'Customer security reviews answered without pulling engineers off delivery',
      'Insurance and regulatory conversations handled by someone fluent in them',
      'A credible path to a permanent hire, with the handover written',
    ],
    frameworks: ['NIST CSF 2.0', 'ISO/IEC 27001:2022', 'CIS Controls v8.1'],
    timeline: 'Two to four days a month, minimum six-month term.',
    teamShape: 'A named vCISO with GRC and incident support drawn from the wider practice as needed.',
    engagement: 'Monthly retainer by day allocation. Escalation to full-time cover during an incident.',
    faqs: [
      { q: 'How many days do we need?', a: 'Two days a month suits a 50 to 150 person company with a straightforward obligation set. Three to four suits a regulated firm or one going through certification. More than five and you should be hiring, and we will say so rather than selling you days.' },
      { q: 'Will the same person stay with us?', a: 'Yes. A named vCISO with a named deputy for continuity. Rotating fractional leadership is the failure mode of this model. The value is institutional knowledge, and a new face each quarter has none.' },
      { q: 'Can a vCISO sign off on things?', a: 'They can own decisions within a delegated authority you define, and they can carry the accountability for the security programme. They cannot be your statutory accountable person where regulation requires an employee, and we will tell you where that line sits for your regime.' },
      { q: 'Does this conflict with buying testing from you?', a: 'It is a fair question and the answer is in the structure: the vCISO sets the testing requirement and reviews the results, but does not manage the testing team or sign their reports. If you would rather the testing came from a third party, we will help you select one and review their work.' },
      { q: 'What happens during an incident?', a: 'The vCISO steps up to full-time incident leadership and our response team deploys. That is covered by the retainer’s escalation clause, agreed before you need it rather than negotiated during it.' },
      { q: 'How do we know it is working?', a: 'Quarterly movement on an agreed set: risks closed, testing cadence held, mean time to remediate, questionnaire turnaround, and incident rehearsal completion. Activity reports are easy to produce and tell you nothing.' },
    ],
    related: ['grc-compliance', 'incident-response', 'application-security', 'penetration-testing'],
    expert: 'claire-benoit',
    tier: 'R',
  },
]

/* ========================================================================== *
 * SOFTWARE PILLAR
 * ========================================================================== */

const software: Service[] = [
  {
    slug: 'custom-software',
    pillar: 'software',
    name: 'Custom Software',
    icon: Boxes,
    outcome: 'Systems built to survive an audit, a breach attempt and a handover.',
    credibility: {
      figure: '31 systems in production',
      context: 'the oldest running 9 years, 27 of them handed over to in-house teams',
    },
    intro:
      'Most custom software is built to pass a demo. It works on the happy path, the authorisation is checked in the controller that the developer remembered, the audit log records who clicked save but not what changed, and the first real security review arrives after launch when every fix is expensive. We build the other kind. Authorisation is a typed decision in one place. Every state change is recorded in an append-only log because your auditor will ask and your incident responder will need it. Secrets live in a vault from the first commit. The same people who will attack this system reviewed its design, which is a short sentence describing the main reason to buy software from us rather than from a firm that only builds.',
    cardLine: 'Production systems with authorisation, audit and secrets handled properly from the first commit.',
    included: [
      { title: 'Discovery and architecture', body: 'Two to four weeks ending in a decision record, a threat model, a costed plan and a working walking skeleton deployed to a real environment.' },
      { title: 'Build', body: 'Two-week sprints, trunk-based development, continuous deployment to staging from day one, and a demo you can click every fortnight.' },
      { title: 'Security by construction', body: 'Threat model first, secure design review at each architectural decision, and a penetration test before go-live by our own testers against code they have read.' },
      { title: 'Data and integration', body: 'Migration from the system you are replacing, including the records that do not fit the new model, which is where these projects actually fail.' },
      { title: 'Launch', body: 'Load tested against a realistic profile, runbooks written, on-call rota agreed, and a rollback that has been rehearsed rather than documented.' },
      { title: 'Handover or support', body: 'Either your team takes it (with documentation, a tour and paired work) or we run it under an SLA. Both are planned from the start, not decided at the end.' },
    ],
    phases: [
      { n: 1, name: 'Discovery', days: 'Weeks 1–4', body: 'Users, constraints, obligations and non-goals. Output is a decision record, a threat model, a costed plan, and a walking skeleton deployed and authenticating.' },
      { n: 2, name: 'Design', days: 'Weeks 3–6', body: 'Interface design against real content and real edge cases. Secure design review on the architecture. Empty states, error states and the permission matrix, all designed rather than discovered.' },
      { n: 3, name: 'Build', days: 'Weeks 5–24', body: 'Two-week sprints. Planning Monday, demo and retro Friday of week two, backlog refinement mid-sprint. Trunk-based, feature-flagged, deployed to staging continuously.' },
      { n: 4, name: 'Test', days: 'Continuous, hardening in the last 4 weeks', body: 'Unit and integration tests written with the code, end-to-end on critical journeys, accessibility audit, load test, and a penetration test by our security practice.' },
      { n: 5, name: 'Deploy', days: 'Launch window', body: 'Staged rollout behind flags, monitoring and alerting live before traffic, rehearsed rollback, and a hypercare period with the build team on call.' },
      { n: 6, name: 'Operate or hand over', days: 'Ongoing', body: 'Documented handover with paired work and a recorded architecture tour, or a support agreement with a response SLA and a named engineer.' },
    ],
    deliverables: [
      'Working software in production, with the source in your repository under your licence',
      'Architecture decision records explaining why, not just what',
      'Threat model and a clean penetration test report at go-live',
      'Infrastructure as code, reproducible from empty account to running system',
      'Runbooks, alert definitions and a rehearsed rollback procedure',
      'Handover pack: recorded tour, onboarding guide, and two weeks of paired work',
    ],
    outcomes: [
      'A system that passes its first security review because it was designed against one',
      'An audit trail that answers "who changed what, when" without a database query',
      'Deployment your team can do on a Tuesday afternoon',
      'No single engineer who is the only one who understands it',
      'A credible exit: the code, the infrastructure and the knowledge are yours',
    ],
    stack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Go', 'PostgreSQL', 'Kubernetes', 'AWS', 'Azure'],
    timeline: '4–8 months to first production release for a typical business system.',
    teamShape: 'A tech lead, two to five engineers, a designer, and a part-time delivery lead. A security engineer at the design and hardening gates.',
    engagement: 'Fixed-scope phases with a time-and-materials build, or a dedicated squad on a quarterly commitment.',
    faqs: [
      { q: 'Fixed price or time and materials?', a: 'Discovery is fixed price, because it is a bounded piece of work with a defined output. The build is time and materials against a prioritised backlog with a cap and a monthly review. A fixed price for a build you have not designed yet is priced for the worst case and spent defending the scope boundary.' },
      { q: 'Who owns the code?', a: 'You do, from the first commit, in your repository. No escrow arrangement, no licence-back, no runtime dependency on us. If you want to take it in-house after discovery, the discovery output is designed to be usable by another firm.' },
      { q: 'Can you work with our existing team?', a: 'Routinely, and it is usually the better arrangement. We pair, we review each other’s pull requests, and we aim to leave your engineers more capable than we found them. We will not run a parallel team that throws work over a wall.' },
      { q: 'What if requirements change?', a: 'They will. The backlog is prioritised and reviewed every sprint, the cap is reviewed monthly, and a change that invalidates an architectural decision gets a new decision record rather than a quiet workaround. What we will not do is absorb scope silently and then explain the overrun at the end.' },
      { q: 'How do you handle accessibility?', a: 'WCAG 2.2 AA is the baseline, designed in rather than audited on. Keyboard operation, focus management, announced errors and reduced-motion paths are acceptance criteria on each story, and an axe-core run is a CI gate. Retrofitting accessibility after launch costs several times what building it in does.' },
      { q: 'Do you build mobile?', a: 'Yes, React Native where a shared codebase is right, native Swift or Kotlin where the application is genuinely platform-specific. We will tell you which during discovery and explain the trade-off rather than defaulting to whichever we prefer.' },
      { q: 'What happens after launch?', a: 'Whichever was planned in discovery. Either a documented handover with paired work and a recorded tour, or a support agreement with a response SLA and a named engineer. The failure mode is deciding this in the last week, which is why it is a discovery output.' },
      { q: 'Will your security practice test what you build?', a: 'Yes, and the report comes to you unedited. A separate lead tester who did not write the code signs it. If you would rather a third party tested it, we will support that and share the threat model with them.' },
    ],
    related: ['web-application-development', 'platform-engineering', 'devsecops', 'application-security'],
    expert: 'marcus-reid',
    caseStudy: 'manufacturing-erp-replacement',
    tier: 'E',
  },

  {
    slug: 'web-application-development',
    pillar: 'software',
    name: 'Web Application Development',
    short: 'Web Applications',
    icon: Globe,
    outcome: 'Fast on a throttled corporate network, correct without JavaScript, and accessible by construction.',
    credibility: {
      figure: 'Lighthouse 97 median',
      context: 'across 18 shipped applications, measured on throttled 4G rather than on a developer laptop',
    },
    intro:
      'A web application that scores 40 on a mid-range Android is not a fast application with a performance ticket in the backlog. It is a slow application, and your enterprise buyer on a throttled corporate VPN is having the bad experience right now. We build server-rendered applications that work before JavaScript arrives and get better when it does. Content, navigation and forms exist in the HTML. Interactivity is added where it earns its weight. Performance has a budget enforced in continuous integration, so the regression is caught in the pull request that caused it rather than in a quarterly audit that produces a ticket nobody prioritises.',
    cardLine: 'Server-rendered, budget-enforced front ends that work before JavaScript arrives.',
    included: [
      { title: 'Server-rendered architecture', body: 'Next.js App Router or equivalent, with server components by default and client interactivity only where it is needed. Forms that submit without JavaScript.' },
      { title: 'Performance budget in CI', body: 'Bundle size, LCP, CLS and INP budgets enforced as a build gate. The regression fails the pull request, not the quarterly review.' },
      { title: 'Design system', body: 'Tokens, components and documentation in the repository, with every component rendered in a styleguide route in every theme and state.' },
      { title: 'Accessibility by construction', body: 'Radix or equivalent primitives for keyboard and ARIA, axe-core in CI, and manual screen-reader passes on the critical journeys.' },
      { title: 'Motion system', body: 'A fixed vocabulary of durations, easings and distances. A full reduced-motion path that looks deliberate rather than stripped.' },
      { title: 'Observability', body: 'Real-user monitoring from launch, with Core Web Vitals segmented by device class. The median is a comfortable lie.' },
    ],
    phases: [
      { n: 1, name: 'Foundations', days: 'Weeks 1–2', body: 'Tokens, motion system, layout primitives and a styleguide route that renders every component in every theme and state. Nothing else starts first.' },
      { n: 2, name: 'Critical journey', days: 'Weeks 2–5', body: 'Build the one journey the business depends on, end to end, including empty, error and loading states. Measure it before building anything else.' },
      { n: 3, name: 'Breadth', days: 'Weeks 4–14', body: 'Remaining surfaces against the established system. By now the design system makes each new screen cheaper than the last.' },
      { n: 4, name: 'Hardening', days: 'Weeks 12–16', body: 'Lighthouse and axe against real devices, no-JavaScript pass, reduced-motion screenshots of every section, and structured data validation.' },
      { n: 5, name: 'Launch', days: 'Launch week', body: 'Staged rollout, real-user monitoring live before traffic, and a rollback that has been rehearsed.' },
    ],
    deliverables: [
      'Production application with the source in your repository',
      'Styleguide route rendering every component in every theme and state',
      'Performance budgets wired into CI with the rationale documented',
      'Accessibility conformance report against WCAG 2.2 AA',
      'Real-user monitoring dashboards segmented by device class',
      'Component documentation written for the engineer who joins next year',
    ],
    outcomes: [
      'Content, navigation and forms present in the server-rendered HTML',
      'Performance regressions caught in the pull request that caused them',
      'Keyboard and screen-reader journeys that have been walked, not assumed',
      'A reduced-motion experience that looks like a decision',
      'New screens that get cheaper as the system matures',
    ],
    stack: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Radix UI', 'PostgreSQL', 'Playwright', 'Vitest'],
    timeline: '3–6 months for a substantial application.',
    teamShape: 'A front-end lead, two or three engineers, a product designer, and an accessibility reviewer at each gate.',
    engagement: 'Phased project or a dedicated squad.',
    faqs: [
      { q: 'Why server-rendered rather than a single-page application?', a: 'Because the content, the navigation and the forms should exist before JavaScript executes. That matters for the enterprise buyer on a throttled VPN, for crawlers and link previews, for AI summarisers, and for the user whose bundle failed to load on a train. A single-page application is the right answer for a tool used all day behind a login; it is rarely the right answer for anything a prospect or a regulator will read.' },
      { q: 'Do you use a component library?', a: 'Unstyled primitives, Radix or equivalent, for the behavioural and accessibility work that is genuinely hard to get right, and our own styling on top. Pre-styled libraries are fast for a fortnight and then you are fighting them, and the design ends up looking like the library rather than like you.' },
      { q: 'How do you enforce a performance budget?', a: 'Bundle size and Lighthouse assertions as a CI gate on every pull request, with an explicit allowance per route agreed up front. Exceeding it fails the build and requires a documented decision to raise it. A budget nobody can breach without a conversation is the only kind that holds.' },
      { q: 'Can you work with our existing design system?', a: 'Yes. If it is tokenised we adopt it directly. If it is a Figma file with no token layer, extracting one is usually the first week of work and pays for itself before the month is out.' },
      { q: 'What about animation?', a: 'A fixed vocabulary (a small set of durations, easings and distances) applied consistently, plus a complete reduced-motion path. Most perceived quality comes from consistency rather than from any individual effect. We do not add a scroll-hijacking library; it breaks keyboard and screen-reader scrolling and generates accessibility review cost for a marginal aesthetic gain.' },
      { q: 'Do you handle SEO?', a: 'Structured data, canonical URLs, server-rendered metadata, sitemap generation and an information architecture that a crawler can traverse. We will not write keyword-stuffed content, and we will say so if the brief asks for it.' },
    ],
    related: ['custom-software', 'platform-engineering', 'application-security', 'qa-automation'],
    expert: 'marcus-reid',
    tier: 'E',
  },

  {
    slug: 'platform-engineering',
    pillar: 'software',
    name: 'Platform & DevOps',
    icon: Server,
    outcome: 'Deployment that is boring, and a rollback somebody has actually rehearsed.',
    credibility: {
      figure: 'From 11 days to 40 minutes',
      context: 'median lead time for change on our longest-running platform engagement, over 14 months',
    },
    intro:
      'You can tell how healthy a platform is from one question: what happens when the person who set up the pipeline is on holiday and a release has to go out? If the answer involves a specific laptop, an undocumented step or a shared credential in a chat thread, the platform is a person, and that person is a single point of failure for your release process. We build platforms that are reproducible from an empty cloud account, where deploying is a merge, where rolling back has been rehearsed rather than documented, and where the identity your pipeline uses is short-lived and scoped rather than a long-lived key in an environment variable.',
    cardLine: 'Reproducible infrastructure, short-lived pipeline identity, and a rehearsed rollback.',
    included: [
      { title: 'Infrastructure as code', body: 'Terraform or equivalent, reproducible from an empty account, with environments that differ by variables rather than by history.' },
      { title: 'CI/CD', body: 'Build once, promote the artefact. Short-lived OIDC identity for deployment rather than static keys. Progressive delivery with automated rollback on signal.' },
      { title: 'Kubernetes and runtime', body: 'Cluster design, workload identity, admission control, autoscaling and cost shaping. Or a deliberate decision not to use Kubernetes, which is often correct.' },
      { title: 'Observability', body: 'Structured logs, metrics, traces and alerts that page a human only for things a human must do. Service level objectives with an error budget that has consequences.' },
      { title: 'Secrets and identity', body: 'Vault or cloud-native secret management, automated rotation, and no long-lived credentials in CI. This is the most common finding in our own cloud reviews.' },
      { title: 'Developer experience', body: 'One-command local environment, preview environments per pull request, and a path to production an engineer can follow on their first week.' },
    ],
    phases: [
      { n: 1, name: 'Assess', days: 'Weeks 1–2', body: 'Measure the four delivery metrics, read the pipeline, and find the single points of failure, usually a person, a laptop or a credential.' },
      { n: 2, name: 'Foundations', days: 'Weeks 2–6', body: 'Infrastructure as code for one environment, reproducible from empty. Pipeline identity moved to OIDC. Secrets into a vault.' },
      { n: 3, name: 'Pipeline', days: 'Weeks 5–10', body: 'Build-once-promote pipeline with environment gates, preview environments, and automated rollback triggered by signal rather than by someone noticing.' },
      { n: 4, name: 'Observability', days: 'Weeks 8–12', body: 'Instrument, define service level objectives with the business, and prune the alerts that page without requiring action.' },
      { n: 5, name: 'Rehearse', days: 'Week 12', body: 'Game day: rehearse rollback, failover and restore-from-backup. A documented procedure that has never been executed is a hypothesis.' },
      { n: 6, name: 'Hand over', days: 'Weeks 12–16', body: 'Paired work, runbooks, and an on-call rota your team owns. Then a lighter advisory retainer if wanted.' },
    ],
    deliverables: [
      'Infrastructure as code, reproducible from an empty account, in your repository',
      'CI/CD pipeline with short-lived identity and automated rollback',
      'Service level objectives with error budgets and alerting that requires action',
      'Game day report covering rollback, failover and restore-from-backup',
      'Runbooks and an on-call rota your team can operate',
      'Delivery metrics dashboard: lead time, deploy frequency, change failure rate, restore time',
    ],
    outcomes: [
      'Releases that do not depend on a specific person being available',
      'A rollback that has been executed, not just written down',
      'No long-lived cloud credentials in continuous integration',
      'Alerts that page a human only when a human is needed',
      'Environments that differ by configuration rather than by archaeology',
    ],
    stack: ['Terraform', 'Kubernetes', 'ArgoCD', 'GitHub Actions', 'AWS', 'Azure', 'GCP', 'Prometheus', 'Grafana', 'OpenTelemetry', 'HashiCorp Vault'],
    timeline: '12–16 weeks for a platform uplift, then advisory.',
    teamShape: 'A platform lead and one or two engineers, with a cloud security reviewer at the identity and secrets gates.',
    engagement: 'Project engagement with handover, or an embedded platform engineer.',
    faqs: [
      { q: 'Do we need Kubernetes?', a: 'Probably not. Kubernetes is the right answer for many services, many teams and genuine multi-tenancy. For a handful of services and one team, a managed container runtime costs a fraction of the operational burden. We will tell you which case you are in during the assessment, and "we already decided on Kubernetes" is a fine answer too. We will just make it boring.' },
      { q: 'How do you measure improvement?', a: 'The four delivery metrics (lead time for change, deployment frequency, change failure rate, time to restore) baselined in week one. They are the only honest way to tell a platform improvement from a platform migration.' },
      { q: 'Can you do this without a platform freeze?', a: 'Yes, and we prefer to. The new pipeline runs in parallel, one service migrates, then the rest follow once it has survived a fortnight. A big-bang platform migration is the shape of engagement most likely to be abandoned halfway with two platforms to maintain.' },
      { q: 'What about cost?', a: 'Cost shaping is part of the work: rightsizing, spot and savings commitments, storage lifecycle, and egress, which is the line item that surprises people. We report the saving against the baseline rather than claiming a percentage.' },
      { q: 'Who is on call after you leave?', a: 'Your team, with a rota we helped design and runbooks written from real incidents rather than from imagination. We can hold a secondary escalation during the first quarter if you want a safety net.' },
      { q: 'Will your security practice review it?', a: 'Yes, at the identity and secrets gates, and a cloud security review at the end. The pipeline identity is where we most often find a path from a repository contributor to production.' },
    ],
    related: ['cloud-security', 'custom-software', 'devsecops', 'managed-detection-response'],
    expert: 'priya-raman',
    tier: 'E',
  },

  {
    slug: 'erp',
    pillar: 'software',
    name: 'ERP',
    icon: Building2,
    outcome: 'The processes you actually run, not the ones a vendor template assumes.',
    credibility: {
      figure: '6 ERP implementations',
      context: 'with a median of 340,000 historical records migrated and reconciled to the penny',
    },
    intro:
      'ERP projects fail at the data and at the exceptions. The demo covers the standard purchase-to-pay flow; your business has a supplier who invoices in two currencies, a product that is sometimes a service, and a month-end adjustment that one person does in a spreadsheet and nobody has written down. A vendor template forces you to change the process or to build around the template, and both are expensive in ways that only become visible in year two. We build the ERP around the processes you run, we model the exceptions as first-class cases rather than as workarounds, and we migrate the history with a reconciliation you can hand to your auditor.',
    cardLine: 'Finance, inventory and procurement modelled on your exceptions, with history reconciled.',
    included: [
      { title: 'Process mapping', body: 'Order-to-cash, procure-to-pay, record-to-report and inventory, mapped as they are actually run, including the spreadsheet steps.' },
      { title: 'Finance core', body: 'Chart of accounts, multi-currency, multi-entity, tax determination, period close and an audit trail that satisfies a statutory audit.' },
      { title: 'Inventory and operations', body: 'Multi-location stock, batch and serial traceability, landed cost, and the stock adjustment workflow with approval thresholds.' },
      { title: 'Procurement', body: 'Requisition to receipt with approval matrices, three-way match, and the tolerance rules finance actually applies rather than the ones in the policy document.' },
      { title: 'Data migration', body: 'Historical records migrated, reconciled and signed off by finance. Budget a third of the project for this, because it is a third of the project.' },
      { title: 'Integration', body: 'Banking, payroll, e-commerce, logistics, tax filing and the CRM. ERP value is largely in what it connects.' },
    ],
    phases: [
      { n: 1, name: 'Process discovery', days: 'Weeks 1–6', body: 'Walk every process with the people who run it, including month-end. Document the exceptions, which is where the real requirements live.' },
      { n: 2, name: 'Model and prototype', days: 'Weeks 5–10', body: 'Data model, chart of accounts, and a working prototype of the hardest process, not the easiest, loaded with real anonymised data.' },
      { n: 3, name: 'Build', days: 'Weeks 9–30', body: 'Module by module, finance first because everything reconciles to it. Each module goes live with a parallel run before the old one is retired.' },
      { n: 4, name: 'Migrate', days: 'Weeks 20–34', body: 'Three migration rehearsals minimum. Reconciliation reports per rehearsal, signed off by finance each time.' },
      { n: 5, name: 'Parallel run', days: 'Weeks 32–38', body: 'One full period in both systems, reconciled. This is not optional and the first close in a new ERP is where undiscovered gaps surface.' },
      { n: 6, name: 'Cutover and support', days: 'Week 38+', body: 'Cutover at a period boundary, hypercare through the first two closes with the build team available daily.' },
    ],
    deliverables: [
      'Process documentation as implemented, including exception handling',
      'Configured and tested system with role-based access and segregation of duties',
      'Migration reconciliation reports signed off by finance',
      'Integration suite with monitoring and failure handling',
      'Role-based training, delivered per role rather than as one long session',
      'Month-end close runbook',
    ],
    outcomes: [
      'A month-end close that completes without a parallel spreadsheet',
      'History migrated and reconciled to the penny',
      'Segregation of duties your auditor accepts',
      'Exceptions handled in the system rather than around it',
      'One source of truth your finance team trusts enough to stop reconciling',
    ],
    stack: ['TypeScript', 'Node.js', 'PostgreSQL', 'React', 'Redis', 'Kubernetes'],
    frameworks: ['IFRS', 'UK GAAP', 'Making Tax Digital', 'SOX-style controls'],
    timeline: '9–14 months for a mid-market implementation, finance module live first.',
    teamShape: 'A delivery lead, a solution architect, three to five engineers, a data migration specialist, and a finance process analyst.',
    engagement: 'Phased programme with a fixed-price discovery and module-by-module delivery.',
    faqs: [
      { q: 'Why build rather than buy SAP, NetSuite or Odoo?', a: 'Often you should buy. If your processes are standard and you are prepared to adapt to the package, a package is cheaper and faster, and we will tell you so during discovery rather than after you have paid us to build. Building is right when the process is your competitive advantage, when the package forces a change that costs more than the licence saves, or when you have already built so much around a package that you are maintaining both.' },
      { q: 'How long does migration really take?', a: 'About a third of the project. Extraction is quick; reconciliation is not, because historical data contains records that do not satisfy the constraints you want to enforce going forward. Deciding what to do with each class of exception is a finance decision, not an engineering one, and it cannot be rushed.' },
      { q: 'Can you integrate with our existing systems?', a: 'Yes, and we would usually rather integrate than replace. Payroll, banking, tax filing and e-commerce are generally better left where they are, with the ERP as the system of record that reconciles them.' },
      { q: 'What about the spreadsheets?', a: 'We want to see them in week one. Every undocumented spreadsheet is a process the business depends on, and the ones nobody mentions during discovery are the ones that break the first close. We model them in the system or we document them as a deliberate exception.' },
      { q: 'Do we really need a parallel run?', a: 'Yes. One full period in both systems, reconciled line by line. Every ERP go-live that has gone badly in our experience skipped or shortened it, and the first close is where structural gaps surface, at the worst possible moment if nobody has rehearsed.' },
      { q: 'How is access controlled?', a: 'Role-based, with segregation of duties enforced in the system rather than in a policy, the person who raises a purchase order cannot approve it or receive against it. Every state change is in an append-only audit log with the actor, the before value and the after value.' },
    ],
    related: ['custom-software', 'crm', 'grc-compliance', 'application-security'],
    expert: 'priya-raman',
    caseStudy: 'manufacturing-erp-replacement',
    tier: 'R',
  },

  {
    slug: 'crm',
    pillar: 'software',
    name: 'CRM',
    icon: Users,
    outcome: 'A pipeline your sales team updates because it helps them, not because it is mandated.',
    credibility: {
      figure: '91% weekly active use',
      context: 'among licensed sellers at 90 days, against an industry benchmark nearer 55%',
    },
    intro:
      'The defining failure of CRM is not technical. It is that salespeople do not update it, because updating it costs them twenty minutes and gives them nothing, while the report it feeds is for someone else. Every subsequent problem (stale pipeline, invented forecasts, a management dashboard that contradicts the sales floor) follows from that. We design the other way round: the seller gets something back from every field they fill, data that can be captured automatically is never typed, and the forecast is assembled from activity that happens anyway. Then the pipeline stays current without anyone being chased, and the report is a by-product rather than an obligation.',
    cardLine: 'Pipeline, activity and forecasting designed so sellers get something back from every field.',
    included: [
      { title: 'Pipeline and stages', body: 'Stages defined by buyer behaviour with explicit exit criteria, not by internal optimism. A stage you cannot evidence is not a stage.' },
      { title: 'Activity capture', body: 'Email, calendar and call logging captured automatically. Manual activity entry is a tax sellers will not pay.' },
      { title: 'Forecasting', body: 'Weighted and committed forecasts built from real stage movement and velocity, with the assumptions visible rather than embedded in a spreadsheet.' },
      { title: 'Quote and proposal', body: 'Configure-price-quote with approval thresholds, versioned proposals, and e-signature.' },
      { title: 'Integration', body: 'Marketing automation, support, billing and the ERP. Sellers should not need to open four systems to answer one customer question.' },
      { title: 'Reporting', body: 'Cohort retention, win and loss reasons, velocity by segment, and the activity-to-outcome ratios that tell a manager where coaching is needed.' },
    ],
    phases: [
      { n: 1, name: 'Sales process discovery', days: 'Weeks 1–4', body: 'Shadow actual sales calls. The documented process and the practised one always differ, and the practised one is the requirement.' },
      { n: 2, name: 'Model', days: 'Weeks 3–6', body: 'Account, contact, opportunity and activity model, plus the stage definitions with exit criteria. Agreed with the sellers who will live in it.' },
      { n: 3, name: 'Build', days: 'Weeks 5–18', body: 'Core pipeline first, in the hands of a pilot team within six weeks. Feedback from real use beats any amount of workshop.' },
      { n: 4, name: 'Migrate', days: 'Weeks 14–20', body: 'Deduplicate and migrate accounts, contacts and history. Historical opportunity data gets mapped to the new stage model with the mapping documented.' },
      { n: 5, name: 'Roll out', days: 'Weeks 18–24', body: 'Team by team, with training by role and a two-week adoption watch per team. Adoption is measured, not assumed.' },
      { n: 6, name: 'Tune', days: 'Ongoing', body: 'Quarterly review of stage conversion, forecast accuracy and field usage. Fields nobody uses get deleted rather than mandated.' },
    ],
    deliverables: [
      'Configured CRM with the agreed data model and stage definitions',
      'Automatic activity capture from email, calendar and telephony',
      'Forecast model with visible assumptions',
      'Deduplicated, migrated history with a documented mapping',
      'Role-based training and a manager coaching guide',
      'Adoption dashboard tracked for the first two quarters',
    ],
    outcomes: [
      'A pipeline that is current without anybody being chased',
      'A forecast that survives contact with the end of quarter',
      'Sellers who open it because it is useful, not because it is mandated',
      'Win and loss reasons captured consistently enough to analyse',
      'One customer view shared by sales, support and finance',
    ],
    stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'Redis', 'Elasticsearch'],
    timeline: '5–7 months, pilot team live by week 6.',
    teamShape: 'A delivery lead, a solution architect, two or three engineers, and a revenue operations analyst.',
    engagement: 'Phased delivery with a pilot-first rollout.',
    faqs: [
      { q: 'Why not Salesforce or HubSpot?', a: 'For most companies, use one of them. Build when your sales motion is genuinely unusual, when per-seat licensing at your headcount exceeds a build, or when you have already built so many integrations around a package that you are maintaining both anyway. We will say which case you are in during discovery.' },
      { q: 'How do you get sellers to adopt it?', a: 'By making every field give something back and by never asking them to type what can be captured. Adoption is a design outcome, not a training outcome, if a seller has to enter data purely so a manager can run a report, no amount of training will fix it, and mandating it produces fiction rather than data.' },
      { q: 'What about data quality in the migration?', a: 'Deduplication, normalisation and enrichment with a report of what we could not reconcile. We would rather hand you 12,000 clean accounts and a list of 400 ambiguous ones than 14,000 records you cannot trust.' },
      { q: 'Can managers still get their reports?', a: 'Yes, and they get better ones, because the underlying data is current. The difference is that the report is assembled from activity that happens anyway rather than from a weekly update ritual.' },
      { q: 'Does it integrate with the ERP?', a: 'Yes, accounts, contracts, invoices and payment status, so a seller can answer a billing question without leaving the CRM. If you are buying both from us, the integration is designed once rather than bolted on twice.' },
    ],
    related: ['erp', 'custom-software', 'web-application-development', 'application-security'],
    expert: 'priya-raman',
    tier: 'R',
  },

  {
    slug: 'hrm',
    pillar: 'software',
    name: 'HRM',
    icon: Handshake,
    outcome: 'Employee data handled with the care a regulator expects, and a joiner process that finishes.',
    credibility: {
      figure: '4 HRM systems live',
      context: 'the largest covering 2,400 employees across 6 jurisdictions and 3 payroll providers',
    },
    intro:
      'HR systems hold the most sensitive personal data in the company (salary, health, performance, disciplinary records, right-to-work documents) and they are routinely the least carefully built system in the estate, with broad access, no field-level controls, and an audit log that records logins but not record views. They are also where process failures are most visible: a joiner whose laptop, accounts and access arrive on three different days, or a leaver whose VPN credential still works in March. We build HRM with field-level access control, an audit log that records reads as well as writes, and joiner-mover-leaver flows that complete rather than stall.',
    cardLine: 'Field-level access control, read-auditing, and joiner-mover-leaver flows that complete.',
    included: [
      { title: 'Employee record', body: 'Personal, contractual, compensation and document records with field-level access control and an audit log that records who viewed what.' },
      { title: 'Joiner, mover, leaver', body: 'Orchestrated across identity, devices, access and payroll, with completion tracked. Half-finished onboarding is the common failure and it is a security problem.' },
      { title: 'Absence and time', body: 'Leave entitlement by jurisdiction, approvals, statutory absence types, and the carry-over rules HR actually applies.' },
      { title: 'Performance and development', body: 'Review cycles, objectives and one-to-one records, with visibility rules that make a difficult conversation safe to record.' },
      { title: 'Recruitment', body: 'Applicant tracking through to offer and contract, with right-to-work and background-check evidence attached to the record.' },
      { title: 'Payroll integration', body: 'Bidirectional with your payroll providers, with a variance report before every run rather than a correction after it.' },
    ],
    phases: [
      { n: 1, name: 'Discovery', days: 'Weeks 1–4', body: 'Processes, jurisdictions, obligations, and the data protection impact assessment. A DPIA for an HR system is not optional and it shapes the model.' },
      { n: 2, name: 'Model and access', days: 'Weeks 3–7', body: 'Data model with field-level classification and the access matrix: who can see salary, who can see health data, who can see a disciplinary record.' },
      { n: 3, name: 'Build', days: 'Weeks 6–20', body: 'Core record and joiner-mover-leaver first, because that is where the security and the operational value both are.' },
      { n: 4, name: 'Integrate', days: 'Weeks 16–24', body: 'Identity provider, device management, payroll and finance. Joiner-mover-leaver only works end to end when identity and devices are in the loop.' },
      { n: 5, name: 'Migrate and launch', days: 'Weeks 22–28', body: 'Migrate with a retention review, most HR migrations are an opportunity to delete data you have no lawful basis to keep. Launch by population.' },
      { n: 6, name: 'Operate', days: 'Ongoing', body: 'Access reviews, retention enforcement, and a quarterly audit of who viewed sensitive records.' },
    ],
    deliverables: [
      'Configured system with field-level access control and read-auditing',
      'Data protection impact assessment and a records-of-processing entry',
      'Joiner-mover-leaver orchestration with completion tracking',
      'Payroll integration with pre-run variance reporting',
      'Retention schedule enforced in the system, not in a policy document',
      'Manager and employee self-service, with training per audience',
    ],
    outcomes: [
      'Access to sensitive fields restricted and reviewable',
      'An audit log that answers who viewed a record, not just who logged in',
      'Leavers whose access actually ends on their last day',
      'Retention enforced automatically rather than annually by hand',
      'A DPIA your data protection officer can defend',
    ],
    stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'Kubernetes'],
    frameworks: ['UK GDPR', 'EU GDPR', 'ISO/IEC 27701'],
    timeline: '6–8 months.',
    teamShape: 'A delivery lead, a solution architect, two or three engineers, and a privacy specialist from the GRC practice.',
    engagement: 'Phased delivery, population by population.',
    faqs: [
      { q: 'Why not use a packaged HR system?', a: 'Usually you should, and for a single-jurisdiction company a package is clearly right. Building becomes reasonable at multi-jurisdiction complexity, where the package forces a process that breaks local statutory rules, or where integration with your own systems is the point.' },
      { q: 'How do you handle special category data?', a: 'Health, ethnicity and similar data are classified at field level, access is restricted to named roles, reads are audited as well as writes, and retention is enforced by the system. The DPIA documents the lawful basis for each category. This is the part most HR systems get wrong, and it is the part a regulator asks about first.' },
      { q: 'Can employees see their own data?', a: 'Yes, self-service for personal data, payslips, leave and documents, which also discharges much of your subject access obligation without a manual process each time.' },
      { q: 'What about payroll?', a: 'We integrate rather than replace. Payroll is specialised, jurisdiction-specific and heavily regulated, and building it is rarely a good use of your budget. We supply a pre-run variance report so errors are caught before the run rather than corrected after.' },
      { q: 'Does this help with offboarding security?', a: 'Materially. Leaver triggers access revocation across identity, devices and applications, with completion tracked and exceptions escalated. Stale credentials belonging to former staff are one of the most common findings in our own internal network tests.' },
    ],
    related: ['custom-software', 'grc-compliance', 'application-security', 'erp'],
    expert: 'marcus-reid',
    tier: 'R',
  },

  {
    slug: 'lms',
    pillar: 'software',
    name: 'LMS',
    icon: GraduationCap,
    outcome: 'Completion you can evidence to an auditor, and content people finish.',
    credibility: {
      figure: '87% completion',
      context: 'on mandatory modules within the compliance window, against a 61% baseline before replacement',
    },
    intro:
      'A learning platform is bought for one of two reasons, and they pull in different directions. Either you must evidence that named people completed required training by a date, or you want people to actually learn something. Compliance-first platforms produce excellent reports about content nobody remembers; learning-first platforms produce engaged users and an audit finding. We build for both: the evidence model is rigorous enough for a regulator (who completed what, when, on which version of the content, with the assessment they passed) and the experience is good enough that completion happens inside the window without three reminder emails and a manager escalation.',
    cardLine: 'Audit-grade completion evidence with content people finish inside the window.',
    included: [
      { title: 'Content and curriculum', body: 'Authoring, versioning and SCORM or xAPI import, with a clear record of which version of a module a learner completed.' },
      { title: 'Assignment and compliance', body: 'Rule-based assignment by role, location and start date, with recurrence, grace periods and escalation paths that match your policy.' },
      { title: 'Assessment', body: 'Question banks, randomisation, attempt limits and pass marks, designed so the evidence of competence means something.' },
      { title: 'Evidence and reporting', body: 'Per-learner completion records tied to a content version and an assessment attempt. Exportable in a shape an auditor accepts.' },
      { title: 'Learner experience', body: 'Resumable on mobile, accessible to WCAG 2.2 AA, with captions and transcripts. Most mandatory training is completed on a phone, late.' },
      { title: 'Integration', body: 'Identity provider for single sign-on, HRM for the population and the joiner trigger, and your certification registry.' },
    ],
    phases: [
      { n: 1, name: 'Discovery', days: 'Weeks 1–3', body: 'Obligations, populations, content inventory and the evidence an auditor will ask for. Design the evidence model before the experience.' },
      { n: 2, name: 'Model', days: 'Weeks 3–5', body: 'Curriculum, assignment rules, versioning and completion semantics. "Complete" needs a definition everyone agrees on and it is harder than it sounds.' },
      { n: 3, name: 'Build', days: 'Weeks 5–16', body: 'Learner experience and the compliance engine. One real mandatory module live with a pilot population by week eight.' },
      { n: 4, name: 'Content migration', days: 'Weeks 12–18', body: 'Import existing content and historical completion records, with the version mapping documented so historical evidence stays defensible.' },
      { n: 5, name: 'Launch', days: 'Weeks 18–22', body: 'Population by population, with the compliance report validated against the old system before the old one is retired.' },
      { n: 6, name: 'Operate', days: 'Ongoing', body: 'Content refresh cadence, completion monitoring, and an annual review of whether the assessments still evidence anything.' },
    ],
    deliverables: [
      'Learning platform with authoring, versioning and SCORM/xAPI support',
      'Rule-based assignment engine with recurrence and escalation',
      'Audit-grade completion evidence, exportable',
      'Accessible learner experience verified against WCAG 2.2 AA',
      'Migrated content and historical completion records with a documented mapping',
      'Administrator and manager training',
    ],
    outcomes: [
      'Completion evidence that survives an audit sample',
      'Mandatory training completed inside the window without an escalation campaign',
      'Content versioning that keeps historical evidence defensible',
      'A learner experience that works on a phone at 10pm',
      'Assignment that happens automatically when someone joins or moves',
    ],
    stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'S3-compatible storage', 'Kubernetes'],
    timeline: '5–7 months.',
    teamShape: 'A delivery lead, two or three engineers, a product designer, and an accessibility reviewer.',
    engagement: 'Phased delivery, population by population.',
    faqs: [
      { q: 'Can you import our existing SCORM content?', a: 'Yes, SCORM 1.2, SCORM 2004 and xAPI. We validate each package during migration, because legacy SCORM frequently depends on behaviour that modern browsers no longer permit, and finding that out at launch is expensive.' },
      { q: 'How do you make mandatory training less unpleasant?', a: 'Shorter modules, resumable on mobile, honest time estimates, and assessments that test something worth testing. Most of the pain is structural: a 45-minute module that cannot be paused, assigned with a two-week deadline, is a scheduling problem dressed as a learning problem.' },
      { q: 'What evidence does an auditor actually need?', a: 'Who was required to complete what, by when, whether they did, which version of the content, and what assessment they passed. The version link is the one most platforms lose, and it is the one that matters when content changed mid-window.' },
      { q: 'Can we use it for customer or partner training?', a: 'Yes, separate populations with their own branding, catalogues and certification. Several clients run internal compliance and external partner certification from the same platform.' },
    ],
    related: ['custom-software', 'hrm', 'grc-compliance', 'web-application-development'],
    expert: 'marcus-reid',
    tier: 'O',
  },

  {
    slug: 'qa-automation',
    pillar: 'software',
    name: 'QA & Test Automation',
    icon: TestTubeDiagonal,
    outcome: 'A suite people trust enough to block a release on.',
    credibility: {
      figure: 'Under 0.5% flake',
      context: 'on the suites we maintain, measured as reruns that pass without a code change',
    },
    intro:
      'The question for a test suite is not how many tests it has or what its coverage percentage is. It is whether anyone believes a red build. A suite with 4,000 tests and a 6% flake rate teaches a team to rerun rather than to investigate, and at that point it has negative value: it costs CI minutes, it delays releases, and it conceals the real failures inside the noise. We build suites that are trusted (deterministic, isolated test data, resilient selectors, and a quarantine process for anything that flakes twice) and we delete tests that assert implementation detail rather than behaviour.',
    cardLine: 'Deterministic end-to-end suites with a flake budget and a quarantine process.',
    included: [
      { title: 'Test strategy', body: 'What to test at which level, and explicitly what not to automate. A strategy that says "automate everything" is not a strategy.' },
      { title: 'End-to-end automation', body: 'Playwright or Cypress against the critical journeys, with role-based test accounts and data created per test rather than shared.' },
      { title: 'Flake elimination', body: 'Resilient selectors, no fixed waits, isolated data, and a quarantine that removes a twice-flaking test from the gate within a day.' },
      { title: 'CI integration', body: 'Parallelised, sharded, with traces and video on failure so a red build is diagnosable from the artefact rather than reproducible only locally.' },
      { title: 'Accessibility and visual testing', body: 'axe-core in the pipeline, and visual regression on the component library where it earns its maintenance cost.' },
      { title: 'Performance and load', body: 'Realistic load profiles derived from production traffic rather than from a round number someone picked.' },
    ],
    phases: [
      { n: 1, name: 'Assess', days: 'Week 1', body: 'Measure the existing suite: runtime, flake rate, and what it actually covers versus what it claims to. Most suites are slower and less trusted than the team believes.' },
      { n: 2, name: 'Strategy', days: 'Week 2', body: 'Agree the test pyramid, the critical journeys, the flake budget and the quarantine rule. Write down what will not be automated.' },
      { n: 3, name: 'Foundations', days: 'Weeks 2–5', body: 'Test data factories, authentication helpers, selector conventions and the CI harness. Fixing the foundation before adding tests is what makes the suite maintainable.' },
      { n: 4, name: 'Critical journeys', days: 'Weeks 4–10', body: 'Automate the journeys the business depends on, one at a time, each stable for a fortnight before the next starts.' },
      { n: 5, name: 'Gate', days: 'Week 10', body: 'Turn on the gate once flake is inside budget. A gate turned on too early teaches the team to ignore it, and that lesson is hard to unteach.' },
      { n: 6, name: 'Maintain', days: 'Ongoing', body: 'Weekly flake review, quarterly suite pruning, and runtime kept inside the agreed budget.' },
    ],
    deliverables: [
      'Written test strategy including what is deliberately not automated',
      'End-to-end suite covering the critical journeys, with isolated test data',
      'CI configuration with parallelisation, sharding and failure artefacts',
      'Flake dashboard and a quarantine process with a service level',
      'Accessibility checks wired into the pipeline',
      'Load test profiles derived from production traffic',
    ],
    outcomes: [
      'A red build that gets investigated rather than rerun',
      'Flake inside a budget everyone agreed to',
      'Failures diagnosable from the CI artefact',
      'Test data that cannot collide between parallel runs',
      'A suite that gets pruned, so its runtime does not grow without limit',
    ],
    stack: ['Playwright', 'Vitest', 'Pytest', 'k6', 'axe-core', 'GitHub Actions'],
    timeline: '10 weeks to a trusted gate, then maintenance.',
    teamShape: 'A test automation lead and one or two engineers, embedded with your delivery team.',
    engagement: 'Project to establish the suite, then an embedded day per sprint.',
    faqs: [
      { q: 'What coverage percentage should we target?', a: 'None in particular. Coverage measures which lines executed, not whether behaviour is correct, and a team optimising for the number writes tests that assert implementation detail. Measure instead whether the critical journeys are covered, whether a red build is believed, and whether defects escape to production.' },
      { q: 'Playwright or Cypress?', a: 'Playwright for most new work, genuine multi-browser support, better parallelism, and a trace viewer that makes a CI failure diagnosable. Cypress is a reasonable choice if your team already knows it well; migrating a working suite for its own sake rarely pays.' },
      { q: 'How do you actually fix flake?', a: 'Four causes cover almost all of it: shared test data, fixed waits, selectors coupled to styling, and genuine application race conditions. The fourth is the valuable one, a flaky test is sometimes reporting a real intermittent bug, and quarantining it without investigating is how that bug reaches production.' },
      { q: 'Should QA sit in our team or yours?', a: 'Yours. We embed, build the suite with your engineers, and hand it over. A separate QA team that receives finished work and reports defects back has a feedback loop measured in days, and the cost of a defect scales with how long it takes to hear about it.' },
    ],
    related: ['web-application-development', 'custom-software', 'devsecops', 'platform-engineering'],
    expert: 'marcus-reid',
    tier: 'R',
  },
]

/* ========================================================================== *
 * THE JOIN - the page that justifies the company (PART 8.5)
 * ========================================================================== */

const join: Service[] = [
  {
    slug: 'devsecops',
    pillar: 'join',
    name: 'Secure SDLC',
    short: 'Secure SDLC',
    icon: GitBranch,
    outcome: 'We build it and we break it. The findings land in our own sprint backlog.',
    credibility: {
      figure: '9 days median',
      context: 'from a security finding being confirmed to the fix being in production, on joint engagements',
    },
    intro:
      'The standard arrangement is that a development firm builds your software for forty weeks and a security firm tests it in week forty-one. Everything that test finds is now expensive, because the architecture is set, the team is rolling off, and a finding that requires a design change arrives after the design is load-bearing. Both firms behaved correctly and the outcome is still bad. Our two practices run against each other continuously instead: our testers review the design before it is built, read the code as it is written, and raise findings into the same backlog our engineers work from. The number that matters is the nine days between a finding being confirmed and the fix being live, and it is only possible because there is no handover in the middle.',
    cardLine: 'One firm, two practices, one backlog. The seam between build and break, removed.',
    included: [
      { title: 'Threat model at design time', body: 'Before the first sprint. The cheapest security finding is an architecture decision, and the most expensive one is the same decision discovered in week forty.' },
      { title: 'Secure design review at each decision', body: 'Our testers review architectural decision records as they are written, not the finished system.' },
      { title: 'Security in the pipeline', body: 'SAST, DAST, SCA and secret scanning tuned to a signal-to-noise ratio the delivery team accepts, with an agreed finding budget.' },
      { title: 'Continuous testing during the build', body: 'Not one test at the end. Testers work against each major feature as it lands, while changing it is still cheap.' },
      { title: 'Pre-release penetration test', body: 'A full test before go-live by a lead tester who did not write the code, with the report issued to you unedited.' },
      { title: 'Monitoring and retest', body: 'Detections written for the system we built, and a retest cadence after launch. The loop does not stop at release.' },
    ],
    phases: [
      { n: 1, name: 'Threat model', days: 'Before sprint 1', body: 'Security and engineering in one room with the architecture. Output is a threat model and a ranked list of the controls worth building, owned by the engineers.' },
      { n: 2, name: 'Secure design review', days: 'Per architectural decision', body: 'Each decision record gets a security read. Disagreements get resolved in the record, so the reasoning survives the people.' },
      { n: 3, name: 'Secure code review', days: 'Continuous', body: 'Security engineers review pull requests touching authentication, authorisation, cryptography and data access. Comments, not a separate report.' },
      { n: 4, name: 'Pipeline gates', days: 'From sprint 1', body: 'SAST, DAST, SCA and secret scanning, tuned and gated against the agreed budget. Findings become tickets in the same backlog as features.' },
      { n: 5, name: 'Pre-release test', days: 'Final 4 weeks', body: 'Full penetration test by an independent lead tester. Report unedited to you. Criticals block the release.' },
      { n: 6, name: 'Monitor and retest', days: 'Post-launch', body: 'Detections for the system as built, a 30-day retest, and a cadence thereafter. The threat model is updated from what the testing found.' },
    ],
    deliverables: [
      'Threat model in your repository, authored by the engineers who own the components',
      'Security review comments in the pull requests, not in a separate document',
      'Tuned pipeline with an agreed finding budget and the rationale recorded',
      'Independent pre-release penetration test report, issued unedited',
      'Detections written for the system as built, in your source control',
      'Cycle-time evidence: finding confirmed to fix in production, per finding',
    ],
    outcomes: [
      'Security findings that arrive while they are still cheap to fix',
      'No week-forty-one surprise that invalidates an architectural decision',
      'One backlog, one set of priorities, one team accountable',
      'SOC 2, ISO 27001 and PCI readiness as a by-product of the process',
      'Measured cycle time from finding to fix, published to you monthly',
    ],
    frameworks: ['NIST SSDF (SP 800-218)', 'OWASP SAMM 2.0', 'OWASP ASVS 4.0', 'SLSA v1.0'],
    timeline: 'Runs for the life of the build. The threat model happens before sprint one.',
    teamShape: 'Your delivery squad plus a named security engineer at 20–30% allocation, and an independent lead tester for the pre-release test.',
    engagement: 'An overlay on any build engagement, or a programme applied to an existing in-house delivery team.',
    faqs: [
      { q: 'Is it a conflict of interest to test your own build?', a: 'It would be if the same person did both, so they do not. The pre-release test is led by a tester who has not contributed code, the report comes to you unedited, and a third reviewer signs it. We will also support an independent third-party test and share the threat model with them, our commercial interest in a clean report is exactly why your structural scepticism is correct.' },
      { q: 'What does this cost compared with building then testing?', a: 'The security allocation is roughly 8 to 12% of the build cost. Against it: the findings arrive when they cost a sprint rather than a redesign, there is no handover and re-learning period, and compliance evidence comes out of the process rather than out of a separate exercise. On the engagements where we have both numbers, integrated has been cheaper in total, but we would rather show you the two case studies than assert it.' },
      { q: 'Can you apply this to our in-house team?', a: 'Yes, and it is a common engagement. The security practice embeds with your delivery team, the gates and the backlog are yours, and the goal is that your engineers own the model within two quarters. We bring the testers; you keep the capability.' },
      { q: 'What if a critical finding appears a week before launch?', a: 'It blocks the launch, and that is agreed in writing before the engagement starts, so the conversation happens when nobody is under pressure. In practice continuous review means late criticals are rare, the point of the model is to move findings earlier, and the cycle-time number is how you check that it is working.' },
      { q: 'Does this replace a penetration test?',  a: 'No, it contains one, and adds the continuous work around it. If you only want the point-in-time measurement, buy the test on its own; it is a legitimate purchase. This is for building a system that passes it.' },
      { q: 'How do you prove the cycle-time claim?', a: 'Every finding is timestamped at confirmation and at the deploy that fixed it, both drawn from your own tracker and your own pipeline rather than from ours. The monthly report shows the distribution, not just the median, because the tail is where the interesting cases are.' },
      { q: 'What compliance evidence does this generate?', a: 'Secure development policy evidence for SOC 2 CC8.1, ISO 27001 Annex A 8.25 to 8.31, and PCI DSS Requirement 6. Because the evidence is generated by the process rather than assembled for the audit, it tends to survive sampling.' },
    ],
    related: ['application-security', 'custom-software', 'penetration-testing', 'platform-engineering'],
    expert: 'sofia-marek',
    caseStudy: 'healthtech-secure-sdlc',
    tier: 'E',
  },

  {
    slug: 'engagement-models',
    pillar: 'join',
    name: 'Engagement Models',
    icon: Workflow,
    outcome: 'How a security retainer and a delivery retainer actually differ, stated plainly.',
    credibility: { figure: '4 models', context: 'and we will tell you which one you do not need' },
    intro:
      'Security retainers and software retainers are both called retainers and they behave nothing alike. A security retainer buys reserved capacity against an unpredictable need, you hope not to use the incident hours. A delivery retainer buys a standing team against a predictable need, if you do not use the capacity, you have wasted it. Blurring the two is how a client ends up paying for a dedicated squad to handle incidents that happen twice a year, or expecting an incident retainer to absorb a six-month build. This page exists so the distinction is clear before the commercial conversation, not during it.',
    cardLine: 'Projects, programmes, retainers and embedded teams, and which of them you do not need.',
    included: [
      { title: 'Fixed-scope project', body: 'A bounded piece of work with a defined output: a penetration test, a cloud review, a discovery phase. Fixed price where the scope is genuinely knowable.' },
      { title: 'Programme', body: 'Multi-phase work with a defined destination, a certification, a platform uplift, a system replacement. Priced by phase, reviewed monthly.' },
      { title: 'Security retainer', body: 'Reserved capacity: testing days each quarter, incident hours, and advisory access. Priced on availability, because availability is what you are buying.' },
      { title: 'Embedded team', body: 'A standing squad on a quarterly commitment, working in your process, in your repository, in your stand-up.' },
    ],
    phases: [
      { n: 1, name: 'Scoping call', days: '60 minutes', body: 'A technical conversation, not a qualification script. We establish what you are trying to achieve and what constrains it.' },
      { n: 2, name: 'Proposal', days: '3–5 days', body: 'Scope, exclusions, timeline, team shape and price. Exclusions are stated in the body, not in an appendix.' },
      { n: 3, name: 'Contracting', days: '1–2 weeks', body: 'Master services agreement plus a statement of work. We will work under your paper. NDA before the scoping call if you prefer.' },
      { n: 4, name: 'Mobilisation', days: '1–3 weeks', body: 'Named team, kick-off, access provisioning, and the communication cadence agreed in writing.' },
    ],
    deliverables: [
      'A written scope with explicit exclusions',
      'A named team with named individuals, not roles',
      'An agreed communication cadence and escalation path',
      'Monthly commercial review on anything time-and-materials',
    ],
    outcomes: [
      'The right commercial shape for the actual need',
      'No surprise about what was excluded',
      'A named escalation path agreed before it is needed',
    ],
    timeline: 'Two to four weeks from first call to mobilised, faster for retainer clients.',
    teamShape: 'Varies by model, each proposal names the individuals.',
    engagement: 'All four, and we will tell you which one is wrong for you.',
    faqs: [
      { q: 'Can we start with one test and expand?', a: 'Most clients do, and it is the sensible order. A single test tells you whether you want to work with us before either side commits to a programme.' },
      { q: 'Do you work fixed price?', a: 'For bounded work with a knowable scope, yes, tests, reviews, discovery phases. For a build, time and materials against a prioritised backlog with a cap and a monthly review, because a fixed price for an undesigned build is priced for the worst case and then spent defending the scope boundary.' },
      { q: 'What does an incident retainer actually reserve?', a: 'Hours, a response time, pre-agreed rates, a pre-signed NDA, and a team that has already read your architecture. The last of those is the one that saves the most time in hour one, and it is the one you cannot buy during an incident.' },
      { q: 'Can we buy security and software on one agreement?', a: 'Yes, and it is the common case. One master services agreement, separate statements of work per engagement, one account team. The pre-release test is still signed by someone independent of the build.' },
    ],
    related: ['devsecops', 'penetration-testing', 'custom-software', 'managed-detection-response'],
    expert: 'claire-benoit',
    tier: 'R',
  },
]

export const services: Service[] = [...security, ...software, ...join]

export const servicesBySlug: Record<string, Service> = bySlug(services)

export const pillars = {
  security: {
    slug: 'cybersecurity',
    name: 'Cybersecurity',
    theme: 'theme-dark' as const,
    line: 'Testing, assurance, detection and response, by people who also ship production software.',
    body: 'Our testers are not career report-writers. They have shipped systems, which is why their findings arrive with a fix an engineer will accept rather than a recommendation an engineer has to translate.',
    services: security,
  },
  software: {
    slug: 'software-development',
    name: 'Software Development',
    theme: 'theme-light' as const,
    line: 'Products, platforms and business systems built to survive an audit and a handover.',
    body: 'Our engineers work next to a security practice that will attack what they build. That changes how authorisation, audit logging and secrets get designed, before the first commit rather than after the first report.',
    services: software,
  },
} as const

export function serviceHref(slug: string) {
  return `/services/${slug}`
}
