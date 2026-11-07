/**
 * WHICH PRODUCT CONSOLE BELONGS ON WHICH SERVICE PAGE.
 *
 * The five components in `components/product/` were built and then never
 * placed. They are not decoration and they are not interchangeable: each one
 * illustrates a specific claim, so each appears only on the page that makes
 * that claim, with a caption written for that page rather than the house
 * default from `CAPTIONS`.
 *
 * The rule applied below: a console goes on a page only if the page's own copy
 * in `lib/services.ts` asserts the thing the console shows.
 * /services/red-teaming and /services/grc-compliance get none, because none of
 * the five is honest about what those engagements produce - a diagram is the
 * right answer there, and that is what they get.
 *
 * Every console is a Server Component that renders complete with scripting off.
 * `autoplay` is never set from here: an animation that starts itself on a page
 * a buyer is reading is a distraction, and the component defaults to the
 * finished state.
 */

import type { ReactNode } from 'react'
import {
  EdrFleetView,
  SeverityGauge,
  SlaPanel,
  SocAlertQueue,
  WafTrafficPanel,
} from '@/components/product'

export type ConsolePlacement = {
  /** Stable key for React. */
  key: string
  eyebrow: string
  /** The claim this console is evidence for. */
  title: string
  body: string
  node: ReactNode
}

/**
 * Captions are deliberately NOT the `CAPTIONS` defaults. Each states what this
 * page is showing and repeats the illustrative-data disclosure, because a
 * stylised console without that sentence is a screenshot claim.
 */
const CONSOLES: Record<string, ConsolePlacement[]> = {
  'managed-detection-response': [
    {
      key: 'soc',
      eyebrow: 'What you actually receive',
      title: 'A conclusion with evidence, not a notification',
      body: 'The queue, the selected alert, its evidence, three timestamped triage notes and the analyst’s written conclusion. A notification tells you something happened; a triage record tells you what an analyst decided and why.',
      node: (
        <SocAlertQueue caption="Representative view of the managed SIEM console at the point an analyst has recorded a conclusion and containment. Illustrative data, not a client estate." />
      ),
    },
    {
      key: 'gauge',
      eyebrow: 'Why the queue stays readable',
      title: 'Most of the signal never reaches a human',
      body: 'Correlation and suppression content closes the bulk of a day’s alerts before analyst review. The share that is read by a person is the number that decides whether a service level means anything.',
      node: (
        <SeverityGauge caption="Representative view of a 24-hour signal breakdown and the severity distribution behind it. Illustrative data, not a client estate." />
      ),
    },
    {
      key: 'sla',
      eyebrow: 'The service level, measured',
      title: 'Time to human contact, not time to forwarding',
      body: 'A service level measured on how fast an alert was forwarded rewards forwarding. This is the monthly report shape we commit to instead: contact, containment and the misses, with the misses still on the page.',
      node: (
        <SlaPanel caption="Representative view of the monthly service-level report. Illustrative data, not a client estate." />
      ),
    },
  ],

  'incident-response': [
    {
      key: 'soc',
      eyebrow: 'Hour one, as it looks',
      title: 'A live incident, before the conclusion exists',
      body: 'The queue at the moment a new alert lands and triage has not yet been written. This is the state a retainer buys a team that has already read your architecture into, the hour where knowing the estate is worth more than any tool.',
      node: (
        <SocAlertQueue
          step={1}
          caption="Representative view of the managed SIEM console at the moment a new alert arrives, before triage is recorded. Illustrative data, not a client estate."
        />
      ),
    },
    {
      key: 'sla',
      eyebrow: 'What the retainer reserves',
      title: 'A response time with the misses still on it',
      body: 'Hours, a response time, pre-agreed rates and a pre-signed NDA. The monthly report shape below is what that commitment looks like when it is reported honestly rather than summarised to a single green tick.',
      node: (
        <SlaPanel caption="Representative view of the monthly service-level report against an incident-response commitment. Illustrative data, not a client estate." />
      ),
    },
  ],

  'cloud-security': [
    {
      key: 'edr',
      eyebrow: 'Coverage, not configuration',
      title: 'A fleet view that reports delivery, not green ticks',
      body: 'The single most common gap we find is a source that is configured and not arriving. A console that shows configured status will show it green for years; this one reports per-host agent state and last check-in, which is the thing that is actually true.',
      node: (
        <EdrFleetView caption="Representative view of the managed EDR fleet console used during a cloud and endpoint coverage review. Illustrative data, not a client estate." />
      ),
    },
  ],

  'penetration-testing': [
    {
      key: 'gauge',
      eyebrow: 'What a report looks like as a distribution',
      title: 'The severity spread, with the working shown',
      body: 'Severity uses CVSS v4.0 base plus an environmental adjustment we show our working for. A distribution is how you tell a test that found things from a test that reprinted a scanner’s opinion of them.',
      node: (
        <SeverityGauge caption="Representative view of a findings distribution by severity, with the share of signal resolved before review. Illustrative data, not a client engagement." />
      ),
    },
  ],

  'application-security': [
    {
      key: 'gauge',
      eyebrow: 'The gate, as a number',
      title: 'A finding budget needs a distribution behind it',
      body: 'A gate that fires on everything gets routed around, so the threshold is agreed against the real distribution by severity and by reachability. This is the shape that conversation starts from.',
      node: (
        <SeverityGauge caption="Representative view of a pipeline findings distribution by severity and the share closed before review. Illustrative data, not a client estate." />
      ),
    },
  ],

  'web-application-development': [
    {
      key: 'waf',
      eyebrow: 'What ships in front of it',
      title: 'The edge, from the day it goes live',
      body: 'An application we build sits behind a managed edge from launch, not after the first incident. Blocked traffic by rule and by origin is the view that tells you whether a rule is working or merely enabled.',
      node: (
        <WafTrafficPanel caption="Representative view of the hosted WAF traffic panel in front of a delivered application. Illustrative data, not a client estate." />
      ),
    },
  ],

  'platform-engineering': [
    {
      key: 'waf',
      eyebrow: 'The edge you inherit',
      title: 'Traffic, blocks and origin health on one surface',
      body: 'Platform work is judged on what an engineer can see at three in the morning. Request volume, blocked share by rule and origin status belong in one place, because correlating them across three tools is how an outage gets long.',
      node: (
        <WafTrafficPanel caption="Representative view of the hosted WAF traffic panel on a delivered platform. Illustrative data, not a client estate." />
      ),
    },
    {
      key: 'sla',
      eyebrow: 'Service level objectives',
      title: 'The objective, and the month it was missed',
      body: 'Service level objectives are defined with the business and reported with the misses left in. A report with no misses on it over twelve months is a report nobody is reading.',
      node: (
        <SlaPanel caption="Representative view of a monthly service-level report against platform objectives. Illustrative data, not a client estate." />
      ),
    },
  ],
}

export function consolesFor(slug: string): ConsolePlacement[] {
  return CONSOLES[slug] ?? []
}
