/**
 * `/sample-report` - "Anatomy of a report".
 *
 * The highest-leverage page on the site, and almost nobody builds it. A services
 * buyer is buying a document and a team; the document is the product, so show
 * the document. This de-risks the single biggest unknown in buying a security
 * engagement - what actually lands in your inbox.
 *
 * Every excerpt below is written for a fictional client and must be labelled
 * "Sample report - illustrative" wherever it appears.
 */

export const sampleReportIntro = {
  eyebrow: 'Anatomy of a report',
  heading: 'See exactly what lands in your inbox',
  lead: 'A penetration test is a document and a conversation. You are asked to buy both before seeing either. This is the whole structure of an Envenox report, section by section, with a real finding written out in full, redacted, for a fictional client, and otherwise exactly as it would be delivered.',
  cta: 'Walk the report',
  disclaimer:
    'Sample report, illustrative. The client, the hostnames and the finding are fictional. The structure, the severity model, the remediation format and the tone are what you receive.',
  stats: [
    { value: '6', label: 'documents in a standard delivery' },
    { value: '2 pages', label: 'executive summary, written for a board' },
    { value: '30 days', label: 'retest included, with a per-finding verified status' },
  ],
}

export type ReportSection = {
  n: number
  id: string
  title: string
  /** What is in it. */
  what: string
  /** Why it is in it - the part competitors omit. */
  why: string
  /** A redacted excerpt rendered in the document frame. */
  excerpt?: { kind: 'prose' | 'table' | 'code' | 'list'; content: string[] }
  pages: string
}

export const reportSections: ReportSection[] = [
  {
    n: 1,
    id: 'cover',
    title: 'Cover and document control',
    pages: 'p. 1',
    what: 'Client, engagement reference, test window, report version, classification, the lead tester by name, and the reviewer who signed it.',
    why: 'Version and classification sound like bureaucracy until a report is three months old and someone is arguing about whether a finding was closed. The named reviewer matters more: it is the commitment that someone other than the author read this before it reached you.',
    excerpt: {
      kind: 'table',
      content: [
        'Client|Meridian Clinical Systems Ltd',
        'Engagement|ENX-2026-0418, Web application and API penetration test',
        'Test window|2026-04-13 to 2026-04-24 (8 testing days)',
        'Environment|Production, with a staged out-of-hours window for destructive checks',
        'Report version|1.2, reissued 2026-05-26 with retest status',
        'Classification|Confidential, Meridian and Envenox only',
        'Lead tester|I. Haque (OSCP, CREST CRT)',
        'Technical reviewer|S. Marek (OSWE, CISSP)',
      ],
    },
  },
  {
    n: 2,
    id: 'executive-summary',
    title: 'Executive summary',
    pages: 'pp. 2–3',
    what: 'Two pages. The risk narrative in plain language, the three decisions that need a decision-maker, and a severity distribution. No CVSS vectors, no request/response pairs, no tool names.',
    why: 'Written for a board, which means it must survive being read by someone who will never open the technical body. The failure mode is an executive summary that is a shortened technical report, it satisfies nobody, because the technical reader skips it and the executive reader cannot act on it.',
    excerpt: {
      kind: 'prose',
      content: [
        'Two of the eleven findings in this report would allow one Meridian customer to read another customer’s patient records. Neither requires a software vulnerability in the conventional sense; both follow from authorisation being decided in more places than any single engineer can enumerate. We consider this the material finding of the engagement and it is the subject of ENX-0418-01 and ENX-0418-02.',
        'The remaining nine findings are the ordinary result of a system built at pace and are individually unremarkable. We would not delay a release for any of them.',
        'Three decisions need an owner. First, whether the reporting view described in ENX-0418-01 is retired or rewritten, rewriting it is roughly a sprint, retiring it affects four customers who use the export. Second, whether the clinician impersonation feature (ENX-0418-04) keeps its current single-approval design, which we think will not survive an Information Commissioner enquiry. Third, whether authorisation consolidation is funded now as a piece of work, or absorbed into feature delivery, which in our experience means it does not happen.',
      ],
    },
  },
  {
    n: 3,
    id: 'scope',
    title: 'Scope, approach and explicit exclusions',
    pages: 'pp. 4–5',
    what: 'What was tested, from what position, with which roles and credentials, during which window, and an explicit list of what was not tested and why.',
    why: 'The exclusions are the honest part and they belong in the body, not in an appendix. A report that implies coverage it did not have is worse than a shorter report: it becomes the document someone points at after an incident to argue the area was assessed.',
    excerpt: {
      kind: 'list',
      content: [
        'IN SCOPE, app.meridianclinical.io (3 roles: clinician, practice-admin, support), api.meridianclinical.io (REST, 94 endpoints from the OpenAPI document plus 7 found that were not in it), the tenant isolation boundary, and the SSO integration with Entra ID.',
        'NOT TESTED, Denial of service, which proves little and risks much on a clinical system. Social engineering of Meridian staff, which belongs in a red team with different rules of engagement. The mobile application, which is a separate scope. Third-party integrations beyond the authentication boundary. The underlying AWS account configuration, which was reviewed separately under ENX-2026-0402.',
        'DEVIATION, The out-of-hours window on 2026-04-18 was cancelled at Meridian’s request following an unrelated production incident. Two destructive checks on the export pipeline were therefore not performed. This is stated here rather than silently omitted.',
      ],
    },
  },
  {
    n: 4,
    id: 'severity',
    title: 'The severity model, with the working shown',
    pages: 'p. 6',
    what: 'CVSS v4.0 base score, plus an environmental adjustment, plus the reasoning for the adjustment in one sentence per finding.',
    why: 'Severity is where most reports lose an argument. A bare "High" invites a client to reclassify it as accepted risk, and a bare CVSS vector invites the opposite, treating a theoretically-high finding as urgent when the exploit path does not exist in this deployment. Showing the adjustment means you can disagree with us precisely rather than generally, and an auditor can see that the number was reasoned rather than assigned.',
    excerpt: {
      kind: 'prose',
      content: [
        'We adjust base scores up as well as down. ENX-0418-01 has a CVSS v4.0 base of 8.1; we report it as Critical because the affected data is special category health data under UK GDPR Article 9 and the exploit requires only a valid login from any tenant, which in Meridian’s case means any of 1,340 clinician accounts. ENX-0418-07 has a base of 7.5 and we report it as Medium, because the vulnerable endpoint is unreachable from the internet in Meridian’s network topology and requires a foothold the other findings do not provide.',
      ],
    },
  },
  {
    n: 5,
    id: 'findings-index',
    title: 'Findings index',
    pages: 'p. 7',
    what: 'Every finding on one page: ID, title, severity, affected component, and retest status.',
    why: 'This is the page that gets photographed and put in a slide. It is also the page a programme manager works from for the next six weeks, so it carries the retest column from version 1.2 onward rather than requiring a second document.',
    excerpt: {
      kind: 'table',
      content: [
        'ENX-0418-01|Cross-tenant patient record disclosure via reporting view|Critical|reporting-api|Fixed, verified 2026-05-22',
        'ENX-0418-02|Broken object-level authorisation on episode export|Critical|export-worker|Fixed, verified 2026-05-22',
        'ENX-0418-03|Audit log writable by application role|High|core-api|Fixed, verified 2026-05-23',
        'ENX-0418-04|Clinician impersonation lacks second-person approval|High|support-console|Open, accepted with compensating control, review 2026-11',
        'ENX-0418-05|Session not invalidated on password change|Medium|identity|Fixed, verified 2026-05-22',
        'ENX-0418-06|Undocumented API endpoints outside the OpenAPI contract|Medium|api-gateway|Fixed, verified 2026-05-23',
        'ENX-0418-07|Deserialisation of untrusted data in legacy import|Medium|import-legacy|Open, scheduled, sprint 2026-24',
      ],
    },
  },
  {
    n: 6,
    id: 'finding',
    title: 'A finding, written out in full',
    pages: 'pp. 8–11 (one finding)',
    what: 'Summary, affected component, CVSS vector and adjustment, prerequisites, reproduction path, raw request and response evidence, impact in the client’s own terms, and a remediation written for the person who owns the code.',
    why: 'This is the unit of the report and it is where a test is won or lost. The remediation section is the one we are judged on: it must be a change we would accept in code review, not a recommendation the client has to translate. "Implement proper authorisation checks" is not remediation.',
    excerpt: {
      kind: 'code',
      content: [
        'ENX-0418-01  Cross-tenant patient record disclosure via reporting view',
        'Severity    Critical (CVSS v4.0 base 8.1, adjusted up, see §4)',
        'Component   reporting-api @ 4f2a9c1 · view public.v_episode_summary',
        'Prereq      Any authenticated clinician or practice-admin account, any tenant',
        '',
        'REPRODUCTION',
        '1. Authenticate as clinician@tenant-a.example and capture the session cookie.',
        '2. GET /reporting/v2/episode-summary?from=2026-01-01&to=2026-04-01',
        '3. Observe 2,847 rows returned. 2,106 belong to tenant-b and tenant-c.',
        '',
        'ROOT CAUSE',
        'The view public.v_episode_summary joins episode and patient without a tenant',
        'predicate. The predicate lives in the single caller added alongside the view in',
        '2021 (reporting-api/src/queries/exportEpisodes.ts:88). A second caller added in',
        '2023 (reporting-api/src/routes/episodeSummary.ts:41) queries the same view with',
        'no predicate and has been in production for 19 months.',
        '',
        'REMEDIATION , in priority order',
        '1. Immediate: add the tenant predicate at episodeSummary.ts:41. One line, deploys',
        '   today, closes the exposure.',
        '2. Structural: move the predicate into the view itself as a security barrier view,',
        '   or replace it with a table-valued function taking tenant_id as a required',
        '   argument. The second caller was able to be written because the view permitted',
        '   it, a fix at the call site leaves the next caller able to make the same mistake.',
        '3. Preventive: enable row-level security on episode and patient with a policy keyed',
        '   on the session tenant. This is the change that makes the bug class unwriteable,',
        '   and it is the one we would push for. Expect roughly a sprint, mostly in testing.',
        '',
        'WHAT WE WOULD NOT DO',
        'Adding a tenant check in the reporting-api middleware. It looks like a fix, it',
        'passes a retest, and it leaves the view exploitable from the export worker, which',
        'does not pass through that middleware.',
      ],
    },
  },
  {
    n: 7,
    id: 'remediation',
    title: 'Remediation guidance and ordering',
    pages: 'pp. 12–13',
    what: 'The findings grouped by root cause rather than by severity, with a suggested order and a rough effort estimate per group.',
    why: 'Eleven findings ranked by severity gives you eleven tickets. The same eleven grouped by cause often gives you four pieces of work, and the order matters because fixing the structural cause closes findings that have not been found yet. This section is why a programme beats a sequence of tests.',
    excerpt: {
      kind: 'prose',
      content: [
        'Findings 01, 02 and 06 are one problem: authorisation is decided at the call site, so each new caller is a new opportunity. Findings 03 and 05 are a second: state changes that should be irreversible or invalidating are implemented as ordinary writes. Finding 04 is a design decision, not a defect, and needs a decision-maker rather than an engineer. Finding 07 is isolated and genuinely just needs fixing.',
      ],
    },
  },
  {
    n: 8,
    id: 'retest',
    title: 'Retest report',
    pages: 'reissued report, v1.2',
    what: 'Every finding retested within 30 days, with a verified status per finding. Anything still open is reopened with fresh evidence, not with the original screenshot.',
    why: 'A report without a retest ages into a document about the past. Reissuing the same report with a status column, rather than sending a separate retest letter, means there is one current document, which is what an auditor, a customer and your own team all need.',
  },
  {
    n: 9,
    id: 'attestation',
    title: 'Attestation letter',
    pages: 'separate 1-page document',
    what: 'A one-page signed letter stating that the engagement took place, over what window, against what scope, by a named accredited firm, with no finding detail.',
    why: 'This is the document you send to a customer, an auditor or an insurer. It exists so you are not forced to choose between redacting a technical report by hand and disclosing more than you want to.',
  },
  {
    n: 10,
    id: 'appendices',
    title: 'Appendices',
    pages: 'pp. 14+',
    what: 'Methodology and standards mapping (OWASP ASVS 4.0, WSTG, PTES), the tool inventory, and, on request, the raw tooling output, clearly labelled as unverified.',
    why: 'Raw scanner output belongs in an appendix and nowhere else. Mixing confirmed findings with unverified tool noise in the body is how a severity model loses its meaning, and it is the single clearest tell that a report is a lightly edited scanner export.',
  },
]

export const reportFaqs = [
  {
    q: 'Is this a real report?',
    a: 'The structure, severity model, remediation format and tone are exactly what you receive. The client, the hostnames and the findings are fictional, written for this page so we could show a full finding without redacting it into uselessness. Every page of this walkthrough is labelled illustrative.',
  },
  {
    q: 'How long is a real report?',
    a: 'For an eight-day web and API test, typically 30 to 45 pages including appendices. Length is a function of finding count, not of effort, a clean test produces a short report and that is a good outcome, not a shortfall. We do not pad.',
  },
  {
    q: 'Can we get it in a format other than PDF?',
    a: 'Yes. The findings register ships as CSV and JSON keyed for direct import into Jira, Linear or ServiceNow, so nobody retypes a finding. Some clients take only the register and the executive summary and never open the PDF, which is a perfectly reasonable way to work.',
  },
  {
    q: 'Who writes it?',
    a: 'The tester who found the issues, reviewed and signed by a second senior tester who did not work the engagement. Not a technical author, and not an account manager. The debrief call is with the same person, which is why they write it knowing they will have to defend it.',
  },
  {
    q: 'What if we disagree with a severity?',
    a: 'Argue it at the debrief. We show the environmental adjustment and the reasoning precisely so the disagreement can be specific. We change severities when the argument is good and we record that we did, with the reason, a severity quietly lowered after a client objection is worse than no severity model at all.',
  },
  {
    q: 'Will you help us fix the findings?',
    a: 'We will tell you exactly what to change, and our engineering practice can do the work as a separate engagement. What we will not do is have the same person fix and then retest their own work, because that retest means nothing.',
  },
]
