/**
 * Industry pages.
 *
 * The test of an industry page is whether it could be retitled for a different
 * sector without changing the body. If it could, it is a services page with a
 * sector word pasted on, and a buyer in that sector can tell within a paragraph.
 *
 * Each entry below names the regulation that is actually biting, the failure
 * modes specific to that sector, and services drawn from BOTH pillars.
 */

import { bySlug } from './lookup'

export type IndustryPage = {
  slug: string
  name: string
  /** The specific regulatory or threat pressure, in one sentence. */
  pressure: string
  intro: string
  /** The regulatory map - what applies, and what it actually demands. */
  regulatory: { name: string; demands: string; bite: string }[]
  /** Threats and failure modes specific to this sector. */
  failureModes: { title: string; body: string }[]
  /** Service slugs, drawn from both pillars. */
  services: string[]
  /** Sector-specific credibility. */
  credibility: string[]
  caseStudies: string[]
  faqs: { q: string; a: string }[]
}

export const industryPages: IndustryPage[] = [
  {
    slug: 'financial-services',
    name: 'Financial Services',
    pressure:
      'DORA is in force, your card scheme audit samples remediation evidence, and the PRA expects you to have tested a severe but plausible scenario rather than described one.',
    intro:
      'Financial services is the sector where security obligations stopped being documentary. DORA requires threat-led penetration testing and a register of every ICT third party. The PRA expects impact tolerances you have actually tested against. PCI DSS 4.0 moved a large block of requirements from "best practice" to mandatory in April 2025. None of these is satisfied by a policy, and all of them generate evidence your engineering team has to produce.',
    regulatory: [
      {
        name: 'DORA',
        demands: 'ICT risk management, incident reporting on a 4-hour initial clock for major incidents, a third-party register, and threat-led penetration testing for significant entities.',
        bite: 'The TLPT requirement has independence criteria for the threat intelligence provider and the tester. In some engagements that means we can be one or the other, not both, and we will tell you which during scoping rather than after.',
      },
      {
        name: 'PCI DSS 4.0',
        demands: 'Segmentation testing, authenticated internal scanning, targeted risk analyses per requirement, and client-side script integrity monitoring for payment pages.',
        bite: 'Requirement 6.4.3 and 11.6.1, the payment-page script requirements, catch most organisations out, because they are about third-party JavaScript on a page the organisation does not think of as in scope.',
      },
      {
        name: 'PRA SS2/21 and operational resilience',
        demands: 'Important business services identified, impact tolerances set, and scenario testing against severe but plausible disruption.',
        bite: 'Self-assessment must show testing, not planning. A continuity plan nobody has executed is a hypothesis, and that is exactly the distinction a supervisor probes.',
      },
      {
        name: 'FCA SYSC 13 / Consumer Duty',
        demands: 'Operational risk management, and demonstrating that outcomes for customers survive a disruption.',
        bite: 'Links security directly to customer outcome, so an availability incident becomes a conduct question as well as a technical one.',
      },
    ],
    failureModes: [
      {
        title: 'Authorisation decided in too many places',
        body: 'Multi-tenant platforms in this sector accumulate authorisation checks at the call site. Every new caller is a new chance to omit one, and the exploit needs no vulnerability, just a legitimate login from any tenant. This is the single most common critical we report in financial services.',
      },
      {
        title: 'Payment-page third-party scripts',
        body: 'A tag manager with four marketing scripts on a page that takes card details. Nobody owns the inventory, PCI DSS 4.0 requires integrity monitoring of exactly this, and a Magecart-style skimmer is invisible to your server-side monitoring by construction.',
      },
      {
        title: 'The ICT third-party register nobody maintains',
        body: 'DORA wants a register with contractual detail, exit plans and concentration risk. Most are assembled once for the first submission and immediately start decaying, because no process adds to them when engineering adds a vendor.',
      },
      {
        title: 'Batch windows that cannot move',
        body: 'Payment runs and reconciliation jobs create periods where nothing may change, which concentrates all deployment into narrow windows and makes rollback the riskiest operation of the week. It is a delivery problem that becomes a security problem, because urgent patches queue behind it.',
      },
    ],
    services: ['penetration-testing', 'red-teaming', 'application-security', 'grc-compliance', 'managed-detection-response', 'incident-response', 'custom-software', 'platform-engineering'],
    credibility: [
      'PCI DSS Qualified Security Assessor company',
      'TIBER-EU and CBEST-aligned red team methodology',
      'Testers with time served inside financial services security operations, not only in consultancy',
      'Evidence packs written to be submitted to a supervisor, not to be translated first',
    ],
    caseStudies: ['fintech-payment-platform', 'saas-cloud-identity-review'],
    faqs: [
      { q: 'Can you perform a formal DORA TLPT?', a: 'Our methodology aligns with TIBER-EU and DORA TLPT. Formal TLPT has independence criteria for the threat intelligence provider and the tester, and for some engagements that means we act as one and not the other. We establish which during scoping and state it in the proposal, because discovering it afterwards invalidates the exercise.' },
      { q: 'Do you work inside a change freeze?', a: 'Yes, and we plan around it rather than asking for an exception. Testing windows are agreed against your freeze calendar, destructive checks go in an out-of-hours window with a stop-word, and we would rather lose a day of testing than be the reason a payment run is late.' },
      { q: 'Our regulator asked for evidence of remediation, not just testing.', a: 'That is the shift, and it is why our reports are reissued with a per-finding verified status after retest rather than sending a separate retest letter. One current document, with a status column, is what survives a sample.' },
    ],
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    pressure:
      'Patient data is special category data, clinical safety is a regulated discipline, and the DSPT asks whether your audit log can be tampered with.',
    intro:
      'Healthcare systems fail in a specific way: the security control and the clinical workflow pull against each other, and the workflow wins, because a clinician in a hurry will route around anything that costs them thirty seconds. A break-glass access path that is used routinely is not a break-glass path. An impersonation feature that support genuinely needs, built without a second-person approval, is the precise shape of control an Information Commissioner enquiry asks about first.',
    regulatory: [
      {
        name: 'NHS Data Security and Protection Toolkit',
        demands: 'Annual self-assessment across ten data security standards, with evidence.',
        bite: 'The audit-log evidence question is the one that catches systems out: can the application write to its own audit log? If yes, the log is not tamper-resistant, and retrofitting an append-only log across eleven services is a six-week job.',
      },
      {
        name: 'DCB0129 / DCB0160',
        demands: 'Clinical risk management for health software, a clinical safety case, a hazard log, and a named Clinical Safety Officer.',
        bite: 'This is a clinical discipline, not a security one, and it has to be running from design. A security finding with clinical impact belongs in the hazard log as well as the findings register.',
      },
      {
        name: 'UK GDPR Article 9',
        demands: 'Health data is special category: an Article 9 condition on top of a lawful basis, a DPIA, and access restricted to those who need it.',
        bite: 'Field-level access control and read-auditing. Most health systems audit writes and logins but not record views, which means they cannot answer the question a regulator asks first.',
      },
      {
        name: 'HIPAA (US-facing)',
        demands: 'Security Rule safeguards, Business Associate Agreements, breach notification within 60 days.',
        bite: 'Relevant the moment a US customer appears, and it arrives alongside a SOC 2 Type II expectation rather than instead of one.',
      },
    ],
    failureModes: [
      {
        title: 'Break-glass that is used every day',
        body: 'Emergency access exists for good clinical reasons. When it becomes the routine path because the normal path is slow, you have an unmonitored administrative role with a reassuring name. The fix is a workflow fix, not an access-control fix.',
      },
      {
        title: 'Impersonation without a second person',
        body: 'Support needs to see what the clinician sees. Built without a second-person approval and a distinct audit event, it is an unlogged read of any patient record by any support agent.',
      },
      {
        title: 'Application-writable audit logs',
        body: 'The log records who clicked save but not what changed, and the application role can modify it. Cheap to fix before eleven services depend on it, expensive afterwards.',
      },
      {
        title: 'Integration estates with no inventory',
        body: 'HL7 and FHIR interfaces accumulated over a decade, several with hardcoded credentials, one still running because a single clinic uses it on Tuesdays. Nobody can safely turn any of them off.',
      },
    ],
    services: ['penetration-testing', 'application-security', 'devsecops', 'grc-compliance', 'cloud-security', 'custom-software', 'hrm', 'lms'],
    credibility: [
      'Engineers who have delivered against DCB0129 alongside a named Clinical Safety Officer',
      'DSPT evidence experience, including the audit-log and access-review questions',
      'DPIA authoring for special category data, with field-level classification',
      'Background-checked staff under BS 7858 for engagements touching patient data',
    ],
    caseStudies: ['healthtech-secure-sdlc'],
    faqs: [
      { q: 'Will you test a live clinical system?', a: 'Only with clinical sign-off, a stop-word that halts everything immediately, and a window agreed with the people responsible for patient safety. Where the clinical risk is not acceptable we test a staging environment and say so plainly in the report rather than implying coverage we did not have.' },
      { q: 'Can you work alongside our Clinical Safety Officer?', a: 'Yes, and we expect to. A security finding with clinical impact belongs in the hazard log as well as the findings register, and the two documents have different audiences and different governance.' },
      { q: 'Do we need a DPIA before you start?', a: 'For a build, yes, it shapes the data model and it is cheaper before the model exists. For a test, we work under your existing DPIA and will tell you if the engagement takes you outside it.' },
    ],
  },
  {
    slug: 'saas',
    name: 'SaaS & Technology',
    pressure:
      'Enterprise procurement now treats SOC 2 Type I as a staging post, and your largest prospect wants a penetration test report before the pilot, not after it.',
    intro:
      'For a SaaS company, security stopped being a cost centre the moment it became a gate on the pipeline. The pattern is consistent: a large prospect sends a 200-question security questionnaire, asks for a current penetration test report and a SOC 2 Type II, and the deal stalls for a quarter while engineering produces evidence nobody had been accumulating. The work is not hard. It is just impossible to do quickly, which is why it has to start before the deal that needs it.',
    regulatory: [
      {
        name: 'SOC 2 Type II',
        demands: 'Controls designed and operating effectively over an observation window of three to twelve months.',
        bite: 'The window cannot be compressed. Type I is a point-in-time design opinion and increasingly fails to clear enterprise procurement on its own, so the practical path is Type II with a three-month initial window, extended to twelve.',
      },
      {
        name: 'ISO/IEC 27001:2022',
        demands: 'A certified ISMS, with a scope statement, a Statement of Applicability and a risk process that is used.',
        bite: 'Overlaps SOC 2 by roughly 70% at control level. Map controls once to a common register and the second certification costs far less than the first.',
      },
      {
        name: 'Customer contractual security terms',
        demands: 'Often stricter than any framework: specific notification windows, audit rights, named sub-processors, data residency.',
        bite: 'These are negotiated by sales and inherited by engineering. The notification window is the one to read, a 24-hour contractual commitment requires an operational capability, not a clause.',
      },
    ],
    failureModes: [
      {
        title: 'Tenant isolation decided per endpoint',
        body: 'The most expensive finding class in multi-tenant SaaS, and the one that ends a deal rather than delaying it. It is a structural problem: when the predicate lives at the call site, every new caller is a new opportunity to omit it.',
      },
      {
        title: 'CI identity with a path to production data',
        body: 'A repository-level secret used by both the pull-request workflow and the deploy workflow, a trust policy with no branch condition, and a deployment role carrying a permission granted for a one-off restore in 2023. Four locally-reasonable decisions, one path from any contributor to the customer database.',
      },
      {
        title: 'The questionnaire answered four different ways',
        body: 'Four people have answered the same security questionnaire from four different mental models. The inconsistency is what a diligent reviewer notices, and it costs more trust than any individual answer.',
      },
      {
        title: 'A CSPM backlog nobody can start',
        body: '1,800 findings ranked by vendor severity, triaged twice and abandoned twice. The list is not wrong, it is unusable, nothing in it tells a team of nineteen what to do on Monday.',
      },
    ],
    services: ['penetration-testing', 'application-security', 'cloud-security', 'grc-compliance', 'devsecops', 'platform-engineering', 'web-application-development', 'qa-automation'],
    credibility: [
      'SOC 2 and ISO 27001 programmes taken to certificate, not just to readiness',
      'Attestation letters written to be sent to your customers without redaction',
      'Reachability-filtered cloud findings: 1,840 reduced to 210 on one estate, same day',
      'Our own SOC 2 Type II report available under NDA, which is the honest version of recommending one',
    ],
    caseStudies: ['saas-cloud-identity-review', 'fintech-payment-platform'],
    faqs: [
      { q: 'Our biggest prospect wants a pen test report next month.', a: 'Achievable for a focused scope: two to four weeks to start, five to fifteen testing days, report three days after. What is not achievable in a month is a SOC 2 Type II, because the observation window is the window. If both are being asked for, start the Type II now and lead with the test.' },
      { q: 'Can we share your report with customers?', a: 'That is what the attestation letter is for: one page, signed, stating the engagement, the window and the scope, with no finding detail. The executive summary is also written to be shareable. For the full technical report we will help you decide what to redact.' },
      { q: 'How do we stop answering the same questionnaire from scratch?', a: 'One source of truth, maintained by the person accountable for security rather than by whoever has capacity. Our vCISO engagements usually absorb this entirely, which also stops engineers being pulled off the roadmap to write answers.' },
    ],
  },
  {
    slug: 'logistics',
    name: 'Logistics & Manufacturing',
    pressure:
      'NIS2 brings a 24-hour early-warning obligation and personal management accountability, and your customs systems cannot go offline to accommodate either.',
    intro:
      'Logistics and manufacturing share a problem that pure-IT sectors do not: operational technology sits next to information technology, the OT was commissioned on a ten-to-twenty-year horizon, and the systems that must not stop are the ones least able to be patched. Add a customs or WMS platform where an hour of downtime has a direct, countable cost, and the security programme has to work around availability rather than assuming it can borrow some.',
    regulatory: [
      {
        name: 'NIS2',
        demands: 'Risk management measures, supply chain security, an early warning within 24 hours of becoming aware of a significant incident, and management bodies that can be held personally liable.',
        bite: 'Twenty-four hours is an operational capability, not a policy. It requires someone able to make a notification decision at 3am, and that is a rota question before it is a compliance question.',
      },
      {
        name: 'IEC 62443',
        demands: 'Zones and conduits, security levels per zone, and a documented OT security programme.',
        bite: 'Most estates have no zone model at all, the OT network is flat and reachable from an engineering workstation on the corporate domain.',
      },
      {
        name: 'Customs and trade systems',
        demands: 'Authorised Economic Operator status carries security and record-keeping requirements with real audit consequences.',
        bite: 'Losing AEO status is a commercial event, not a compliance event, so the availability of the declaration system becomes a security requirement in its own right.',
      },
    ],
    failureModes: [
      {
        title: 'A flat OT network one hop from the corporate domain',
        body: 'An engineering workstation joined to the corporate domain, with a route to the PLC network and no segmentation in between. Ransomware that reaches the corporate domain reaches production, and the production systems are the ones that cannot be restored from a clean image in an afternoon.',
      },
      {
        title: 'Identity monitoring that stops at the endpoint',
        body: 'EDR and firewall logs ingested, identity provider sign-in logs not. A session-token replay from a stolen cookie produces no signal anywhere, no password, no MFA prompt, no agent involvement. We have demonstrated exactly this against a live estate.',
      },
      {
        title: 'Log sources that are green but dead',
        body: 'The dashboard shows configured status, not delivery. On one estate, 22 of 71 configured sources had never delivered an event and four more had stopped after a platform upgrade two years earlier.',
      },
      {
        title: 'Supplier portals with shared credentials',
        body: 'Hauliers, customs agents and warehouse operators sharing one login per company, often unchanged for years, usually with more access than the role needs.',
      },
    ],
    services: ['managed-detection-response', 'incident-response', 'penetration-testing', 'cloud-security', 'grc-compliance', 'custom-software', 'erp', 'platform-engineering'],
    credibility: [
      'Detection content validated by real technique execution against live telemetry, not by rule review',
      'OT-aware testing with availability as a first-order constraint and a stop-word that halts everything',
      'ERP replacements delivered with full parallel-run periods rather than big-bang cutovers',
      'Nine-person 24/7 analyst rota, rota depth is the continuity control that matters',
    ],
    caseStudies: ['logistics-mdr-rollout', 'manufacturing-erp-replacement'],
    faqs: [
      { q: 'We cannot take the warehouse system offline to be tested.', a: 'Then we do not take it offline. Testing is scoped around availability: read-only and passive techniques against production, active testing against a representative staging environment, and an out-of-hours window with a stop-word for anything with a risk of impact. The report states exactly which category each finding came from.' },
      { q: 'Can you monitor OT as well as IT?', a: 'We monitor the IT/OT boundary, the engineering workstations and the identity layer, which is where intrusions into OT estates are almost always visible first. Deep protocol inspection inside the OT network needs a specialist OT monitoring platform, and we will say so rather than claiming coverage we do not have.' },
      { q: 'NIS2 gives us 24 hours. Is that realistic?', a: 'It is realistic with a rota and a pre-agreed decision-maker, and unrealistic without one. The notification decision cannot wait for a complete picture, which means someone must be authorised to notify on partial information. That authority is the deliverable, and it has to exist before the incident.' },
    ],
  },
  {
    slug: 'public-sector',
    name: 'Public Sector',
    pressure:
      'A Cyber Assessment Framework return is due, your certification scope was drawn around the whole organisation, and the evidence is being collected by hand.',
    intro:
      'Public sector security programmes rarely fail for lack of effort. They fail for scope: a certification scoped around an entire organisation rather than the service that actually needs the certificate, which multiplies every control by every business unit and turns a nine-month programme into a two-year one with no certificate at the end. The second failure is evidence collected manually, which makes every surveillance audit a company-wide fire drill.',
    regulatory: [
      {
        name: 'NCSC Cyber Assessment Framework',
        demands: 'Outcome-based assessment across four objectives, with contributing outcomes assessed as achieved, partially achieved or not achieved.',
        bite: 'Outcome-based, so a control that exists but does not achieve the outcome scores as partially achieved. You cannot document your way past it.',
      },
      {
        name: 'Cyber Essentials Plus',
        demands: 'Five technical controls, independently audited rather than self-assessed.',
        bite: 'Annual and hands-on. The audit tests the controls rather than reading about them, which is why it is worth more than the basic certification.',
      },
      {
        name: 'Government Functional Standard GovS 007',
        demands: 'Security as a management function, with named accountability.',
        bite: 'Ties the programme to an accountable individual, which in practice means the programme needs a leadership voice rather than only a delivery team.',
      },
      {
        name: 'UK GDPR',
        demands: 'Lawful basis, DPIAs for high-risk processing, subject access within one month.',
        bite: 'Subject access at public-sector volume is an engineering problem. Self-service discharges most of it; a manual process does not scale and quietly breaches the deadline.',
      },
    ],
    failureModes: [
      {
        title: 'Scope drawn around the organisation, not the service',
        body: 'The single most expensive early decision. Redrawing one scope took four days and undid two years of a stalled certification attempt, reducing 142 applicable controls to 61.',
      },
      {
        title: 'A risk register of uniform mediums',
        body: 'Every risk scored medium, every treatment "accepted", every owner the same person. It is a visible symptom of a methodology that produces no distribution, and an auditor reads it in a minute.',
      },
      {
        title: 'Backups monitored, restores never tested',
        body: 'A nightly job reporting success for nineteen months, producing a dump that excluded a schema added in 2023 because the script enumerated schemas from a list written in 2019. The service could not start from it.',
      },
      {
        title: 'Legacy systems nobody can decommission',
        body: 'A system out of support, holding data with a statutory retention period, used by one team for one quarterly process. Turning it off requires a decision nobody is empowered to make.',
      },
    ],
    services: ['grc-compliance', 'vciso', 'penetration-testing', 'cloud-security', 'custom-software', 'web-application-development', 'platform-engineering'],
    credibility: [
      'ISO 27001 certifications achieved first time with zero major non-conformities',
      'Scope redrawing as a first move rather than a late correction',
      'Evidence automation: 86% of control evidence collected from systems already in operation',
      'Accessibility to WCAG 2.2 AA as a build default, not a late audit',
    ],
    caseStudies: ['public-sector-iso-27001'],
    faqs: [
      { q: 'Our certification attempt has stalled. Can it be rescued?', a: 'Usually, and usually the first move is the scope. If the scope was drawn around the whole organisation, redrawing it around the service that needs the certificate is days of work and often undoes years of stall. We will tell you in the first week whether that is your problem.' },
      { q: 'Can you work through a framework procurement?', a: 'Yes. We will also tell you plainly if a framework lot is the wrong vehicle for the work, which happens more often with programme engagements than with discrete testing.' },
      { q: 'Does accessibility come as standard?', a: 'WCAG 2.2 AA is the baseline on everything we build, with axe-core as a CI gate and manual screen-reader passes on critical journeys. It is an acceptance criterion per story rather than an audit at the end, because retrofitting costs several times more.' },
    ],
  },
  {
    slug: 'retail',
    name: 'Retail & Payments',
    pressure:
      'Cardholder data scope grows quietly, PCI DSS 4.0 now mandates client-side script integrity, and there is a peak-season window where nothing may change.',
    intro:
      'Retail security has a seasonal shape no other sector shares: a change freeze that is commercially non-negotiable, falling exactly when attack volume is highest and when any incident has its maximum cost. Everything has to be ready before it starts, and whatever is found during it has to be handled without deploying. The second problem is scope creep in the cardholder data environment, it expands through ordinary product decisions that nobody flags as a PCI event.',
    regulatory: [
      {
        name: 'PCI DSS 4.0',
        demands: 'Segmentation testing, authenticated internal scanning, targeted risk analyses, and integrity monitoring of scripts on payment pages.',
        bite: 'Requirements 6.4.3 and 11.6.1 are the ones that catch retailers: third-party JavaScript on the payment page, loaded via a tag manager nobody treats as in scope.',
      },
      {
        name: 'UK GDPR',
        demands: 'Lawful basis for marketing, consent for cookies, and loyalty data handled proportionately.',
        bite: 'Loyalty schemes accumulate behavioural profiles well beyond what the stated purpose supports, and that is a data minimisation question before it is a security one.',
      },
      {
        name: 'Scheme rules',
        demands: 'Acquirer and scheme requirements that frequently exceed PCI DSS, with commercial consequences for non-compliance.',
        bite: 'Enforced commercially rather than through regulation, which means the consequence arrives faster than a regulatory one.',
      },
    ],
    failureModes: [
      {
        title: 'Payment-page scripts with no owner',
        body: 'Four marketing tags on the page that takes card details, added at different times by different teams, with no inventory. A skimmer injected into any of them is invisible to server-side monitoring by construction. PCI DSS 4.0 mandates monitoring this precisely because it kept happening.',
      },
      {
        title: 'Cardholder data scope that grew without a decision',
        body: 'A new feature stores a truncated PAN "for support convenience", a log captures a full one in an error path, and a reporting database now holds both. Each step was a product decision; none was recognised as a PCI event.',
      },
      {
        title: 'The freeze as a security liability',
        body: 'An eight-week window where nothing deploys, during which a critical vulnerability in a dependency is disclosed. The decision between an unpatched peak and an out-of-cycle deployment has to be pre-made, with named authority, before the freeze starts.',
      },
      {
        title: 'Seasonal staff with permanent access',
        body: 'Accounts created for peak and never disabled, often with store-manager privileges. They are the quietest persistent foothold in the sector and an access review in January finds them every year.',
      },
    ],
    services: ['penetration-testing', 'application-security', 'grc-compliance', 'managed-detection-response', 'cloud-security', 'web-application-development', 'crm', 'platform-engineering'],
    credibility: [
      'PCI DSS Qualified Security Assessor company',
      'Segmentation testing and scope-reduction work that lowers the cost of the next assessment',
      'Load testing against profiles derived from your real peak traffic, not a round number',
      'Pre-freeze hardening engagements scheduled around the commercial calendar',
    ],
    caseStudies: ['fintech-payment-platform'],
    faqs: [
      { q: 'Can you test before peak without risking peak?', a: 'That is the normal shape of the engagement: hardening and testing concluded before the freeze, with the retest inside it if needed, and a pre-agreed exception path for a critical found during the freeze. The exception path is the important part and it has to be agreed when nobody is under pressure.' },
      { q: 'How do we reduce PCI scope?', a: 'Tokenise early, keep the payment page thin, and move the card-data flow to a hosted field or an iframe so your application never receives a PAN. Segmentation then shrinks the assessed estate. Scope reduction is usually cheaper than compliance at the current scope, and it keeps paying every year.' },
      { q: 'Do you handle the script integrity requirement?', a: 'Yes, inventory first, because most organisations do not have one, then a policy for what may load on a payment page, then integrity monitoring and alerting. The inventory alone often removes two or three scripts nobody could justify.' },
    ],
  },
]

export const industryPagesBySlug: Record<string, IndustryPage> = bySlug(industryPages)
