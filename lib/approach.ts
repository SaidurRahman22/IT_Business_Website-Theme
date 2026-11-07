/**
 * `/approach` - The Adversary Loop.
 *
 * Competitors all have a proprietary noun for how they work - "3/3/3 method",
 * "ValuePath", "Concierge Delivery Model". The noun gives sales something to
 * name and gives a buyer something to remember. This is ours.
 *
 * The test of a named methodology is whether it describes something specific
 * enough to be wrong. "We put the customer first" is not a method.
 */

export const approachIntro = {
  eyebrow: 'Our method',
  name: 'The Adversary Loop',
  headline: 'Threat models shape the build. The build gets attacked. The attack rewrites the threat model.',
  lead: 'Most engineering methods describe how work flows from a requirement to a release. Ours describes how work flows back, from what an attacker found, into what gets designed next. That return path is the only part of this that is unusual, and it is the part that requires both practices to be in one firm.',
  serifMoment:
    'A method is only worth naming if it can be wrong.',
}

export type LoopStage = {
  n: number
  name: string
  oneLine: string
  what: string[]
  owns: string
  artefact: string
  /** What goes wrong when this stage is skipped - the part that makes it checkable. */
  failureIfSkipped: string
}

export const loopStages: LoopStage[] = [
  {
    n: 1,
    name: 'Model',
    oneLine: 'Before the first sprint, with the people who will own the components.',
    what: [
      'STRIDE against the real architecture, run as a workshop per bounded context rather than as a document produced for you.',
      'The engineers author it. We facilitate, argue, and write down the disagreements. A threat model authored by a consultant is read once and never updated, because nobody in the building feels responsible for it.',
      'Output is short: a document in your repository and a ranked list of the controls worth building, each with an owner.',
    ],
    owns: 'Security engineer facilitates · your engineers author',
    artefact: 'Threat model in your repository',
    failureIfSkipped:
      'The three findings that change an architecture arrive in month ten instead of week one. On one engagement those three were an application-writable audit log, an encryption key in the same account as the application, and an impersonation feature with no second-person approval. Each cost roughly a sprint in week one. The audit log alone would have been a six-week retrofit by month ten, because eleven services would have been writing to it.',
  },
  {
    n: 2,
    name: 'Build',
    oneLine: 'Ordinary good delivery, with security reading the decisions as they are made.',
    what: [
      'Two-week sprints, trunk-based development, continuous deployment to staging from day one, a clickable demo every fortnight.',
      'Every architectural decision record gets a security read before it is accepted. Disagreements are resolved in the record, so the reasoning outlives the people who had the argument.',
      'A security engineer at 20–30% allocation reviews every pull request touching authentication, authorisation, cryptography or sensitive data access. Comments in the pull request, never a separate report.',
    ],
    owns: 'Delivery squad · security engineer at 20–30%',
    artefact: 'Decision records with security reads · review comments in the PRs',
    failureIfSkipped:
      'Security findings arrive as a document addressed to a team that has moved on. A finding in a pull request costs a conversation; the same finding in a report six months later costs a ticket, a re-familiarisation, a regression risk and an argument about severity.',
  },
  {
    n: 3,
    name: 'Attack',
    oneLine: 'Continuously during the build, then independently before release.',
    what: [
      'Testers work against each major feature as it lands, while changing it is still cheap. This is not a test at the end; it is the reason the test at the end is quiet.',
      'A full pre-release penetration test in the final weeks, led by a tester who has contributed no code, reported to you unedited, and signed by a third reviewer.',
      'Criticals block the release. That is agreed in writing before the engagement starts, so the conversation happens when nobody is under pressure.',
    ],
    owns: 'Independent lead tester · not the build team',
    artefact: 'Pre-release penetration test report, unedited',
    failureIfSkipped:
      'You are trusting the people who wrote the code to have been their own adversary. They cannot be, and the problem is not diligence. It is that an author cannot see the assumption they did not know they were making.',
  },
  {
    n: 4,
    name: 'Watch',
    oneLine: 'Detections written by people who have been reading this system for months.',
    what: [
      'Detection content written against the architecture as built, mapped to MITRE ATT&CK, version-controlled in your repository and reviewed like code.',
      'Validated by executing the techniques rather than by inspecting the rules. A detection that has never fired on a real technique is a hypothesis.',
      'Log sources validated for actual delivery, not configured status. On one engagement, 22 of 71 configured sources had never delivered a single event.',
    ],
    owns: 'Detection engineer · your platform team',
    artefact: 'Detection repository with test cases, yours to keep',
    failureIfSkipped:
      'Detections get written at handover by someone meeting the system for the first time, from a diagram. They cover the techniques a generic rule pack covers and miss the ones specific to how this system actually works.',
  },
  {
    n: 5,
    name: 'Rewrite',
    oneLine: 'What was found goes back into the model. This is the whole point.',
    what: [
      'Every finding and every incident is classified by root cause, not by severity, and the classification updates the threat model rather than closing a ticket.',
      'A class that recurs gets a structural fix (a typed helper, a lint rule, a default) not a third clearer warning. A rule that has failed twice has an enforcement problem, not a wording problem.',
      'The number we report is recurrence of finding classes between tests. It is the only metric that distinguishes a security programme from a sequence of security events.',
    ],
    owns: 'Both practices · reviewed with you quarterly',
    artefact: 'Updated threat model · class-recurrence chart',
    failureIfSkipped:
      'You get four annual reports containing substantially the same findings, and both teams are telling the truth about it: security can point at the reports, engineering can point at a backlog where every individual finding was closed. Closing instances of a bug class does nothing about the class.',
  },
]

export const approachPrinciples = [
  {
    heading: 'The loop closes or it is not a loop',
    body: 'Four of these five stages exist, under other names, at most competent firms. The fifth is the one that requires a security practice and an engineering practice to share a backlog, a priority order and an accountable lead. Without stage five you have a pipeline with a security step in it, which is a better pipeline but not a different model.',
  },
  {
    heading: 'Independence is structural, not a promise',
    body: 'The obvious objection to one firm doing both is that we grade our own homework. We do not think a promise answers that, so the structure does: the pre-release test is led by someone who has written no code, the report reaches you unedited, a third reviewer signs it, and we will support an independent third-party test and hand them the threat model. Our commercial interest in a clean report is exactly why your scepticism is correct.',
  },
  {
    heading: 'The cheapest finding is a design decision',
    body: 'Cost of remediation rises roughly with how much has been built on top of the thing being changed. That is not a theory about software, it is arithmetic about dependencies. Everything in this method follows from taking it seriously, which mostly means moving work earlier and accepting that week one feels slower.',
  },
  {
    heading: 'A control that has never been executed is a hypothesis',
    body: 'Backups that have never been restored, rollbacks that have never been run, detections that have never fired, incident plans that have never been rehearsed. We test these rather than reviewing them, and on one engagement a backup job that had reported success for nineteen months produced a database from which the service could not start.',
  },
  {
    heading: 'We will tell you to buy less',
    body: 'A red team against an estate that has never had a penetration test will find the unauthenticated file upload, at red team rates, and teach you nothing about your detection because the engagement ended at the first open door. Certification scoped around a whole organisation when only one service needs the certificate costs years. We would rather lose the larger sale than deliver the engagement that was wrong.',
  },
]

export const approachFaqs = [
  {
    q: 'Does this only work if we buy both practices?',
    a: 'No, and most clients start with one. Stages one to three work on a build engagement alone; stages three to five work on a security engagement alone. The loop closes fully when both are in play, and we would rather say that plainly than pretend each half is the whole.',
  },
  {
    q: 'Can you apply this to our in-house team?',
    a: 'Yes, and it is a common engagement. Our security practice embeds with your delivery team, the gates and the backlog stay yours, and the goal is that your engineers own the model within two quarters. We bring the testers; you keep the capability.',
  },
  {
    q: 'What does the security allocation cost?',
    a: 'Roughly 8 to 12% of the build cost. Against it: findings arrive when they cost a sprint rather than a redesign, there is no handover and re-learning period, and compliance evidence comes out of the process rather than a separate exercise. On engagements where we have both numbers, integrated has been cheaper in total, but we would rather show you two case studies than assert it.',
  },
  {
    q: 'How do you prove the nine-day figure?',
    a: 'Every finding is timestamped at confirmation and at the deploy that fixed it, both drawn from your tracker and your pipeline rather than ours. The monthly report shows the distribution, not just the median, because the tail is where the interesting cases are.',
  },
  {
    q: 'Is this just DevSecOps with a different name?',
    a: 'It contains what DevSecOps usually means, security in the pipeline, shifted left. The difference is stage five and the fact that both practices are accountable to one delivery lead. Most DevSecOps programmes are a tooling change inside an engineering organisation that still buys its testing from outside, which leaves the handover exactly where it was.',
  },
]
