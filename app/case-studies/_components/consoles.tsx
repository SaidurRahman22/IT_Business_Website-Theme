/**
 * WHICH PRODUCT CONSOLE BELONGS ON WHICH CASE STUDY.
 *
 * A console is placed only where the study's own subject matter supports it.
 * Three of the six carry one; three do not, and are left without rather than
 * given the nearest thing in the set:
 *
 *   manufacturing-erp-replacement   an ERP migration and a pre-go-live review.
 *                                   None of the five consoles is honest about
 *                                   either, so it carries its charts instead.
 *   saas-cloud-identity-review      identity-graph analysis in AWS. The EDR
 *                                   fleet view is about endpoints and would be
 *                                   a different engagement.
 *   public-sector-iso-27001         a certification programme. There is no
 *                                   console for an auditor's sample.
 *
 * Captions are written per study rather than taken from `CAPTIONS`, and every
 * one repeats that the data is illustrative - these are drawn stand-ins for
 * platforms Envenox operates and does not own, not screenshots of a client
 * estate.
 */

import type { ReactNode } from 'react'
import { SeverityGauge, SlaPanel, SocAlertQueue } from '@/components/product'

export type StudyConsole = {
  key: string
  eyebrow: string
  title: string
  body: string
  node: ReactNode
}

const BY_STUDY: Record<string, StudyConsole[]> = {
  'fintech-payment-platform': [
    {
      key: 'gauge',
      eyebrow: 'The metric the board now reads',
      title: 'A distribution, not a finding count',
      body: 'Classifying four years of findings by root cause rather than by severity is what turned twenty-three recurring classes into four. This is the shape of the view that replaced the count, severity spread on one side, the share resolved before review on the other.',
      node: (
        <SeverityGauge caption="Representative view of a quarterly findings distribution of the kind reported on this retainer. Illustrative data, not this client's estate." />
      ),
    },
  ],

  'healthtech-secure-sdlc': [
    {
      key: 'gauge',
      eyebrow: 'The pre-release test, as a distribution',
      title: 'Zero critical is a distribution, not an assertion',
      body: 'An independent tester who had not written a line of the code ran a full test in the final four weeks and reported unedited. A severity distribution is how a claim of no criticals stops being a sentence and becomes something a reader can check.',
      node: (
        <SeverityGauge caption="Representative view of a pre-release severity distribution of the kind this engagement produced. Illustrative data, not this client's estate." />
      ),
    },
  ],

  'logistics-mdr-rollout': [
    {
      key: 'soc',
      eyebrow: 'What replaced the forwarded alert',
      title: 'A conclusion with the triage attached',
      body: 'The previous service produced sixty to ninety notifications a week and left the investigation with a two-person team. What arrives now is a worked record: the evidence, the timestamped triage notes and the analyst’s conclusion.',
      node: (
        <SocAlertQueue caption="Representative view of the managed SIEM console of the kind this client's analysts work in. Illustrative data, not this client's estate." />
      ),
    },
    {
      key: 'sla',
      eyebrow: 'The service level, reported honestly',
      title: 'Four minutes against a fifteen-minute commitment',
      body: 'Time to human contact rather than time to forwarding, with the months that missed still on the page. A report with no misses on it over a year is a report nobody is reading.',
      node: (
        <SlaPanel caption="Representative view of the monthly service-level report issued on a retainer of this shape. Illustrative data, not this client's estate." />
      ),
    },
  ],
}

export function studyConsoles(slug: string): StudyConsole[] {
  return BY_STUDY[slug] ?? []
}
