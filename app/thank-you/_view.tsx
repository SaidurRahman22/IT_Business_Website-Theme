'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CircleAlert, FileText, Mail, PhoneCall } from 'lucide-react'

import { thankYou } from '@/lib/contact'
import { legalDocsBySlug } from '@/lib/legal'
import { site } from '@/lib/site'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { JsonLd, breadcrumbList } from '../contact/_shared/seo'

/**
 * /thank-you - the page that hands over a NEXT ASSET.
 *
 * `thankYou.nextAsset` is the sample report: the document the sender would
 * actually be buying. Ending the journey here with "we'll be in touch" wastes
 * the one moment when someone has just demonstrated intent.
 *
 * It also repeats the incident hotline, because the situation can change
 * between sending a form and reading this page - and in that case the correct
 * action is to stop waiting for a reply and call.
 *
 * MULTIPLE SENDERS LAND HERE
 *   · the enquiry form             → ?from=enquiry
 *   · the vulnerability report     → ?from=report-issue
 *   · the footer newsletter form   → ?from=newsletter&status=…
 *     (app/api/newsletter/route.ts, owned by another agent, 303s to here)
 *
 * A newsletter submit that FAILED validation must not render as "Received. A
 * person has it." - so every status the newsletter route can emit is handled
 * explicitly below, and anything unrecognised falls back to the enquiry case.
 */

type RawParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? '') : (v ?? ''))

type Outcome = {
  eyebrow: string
  heading: string
  body: string
  /** Hand over the next asset, or offer a way back to fix the problem. */
  tone: 'received' | 'problem'
  /** Extra lines rendered under the body. */
  detail?: string[]
}

const vdp = legalDocsBySlug['vulnerability-disclosure']
const vdpCommitments = vdp?.sections.find((s) => s.heading === 'What we commit to')?.list ?? []

function outcomeFor(params: RawParams): Outcome {
  const from = first(params.from)
  const status = first(params.status)

  if (from === 'newsletter') {
    switch (status) {
      case 'pending-double-opt-in':
        return {
          eyebrow: 'Newsletter',
          heading: 'Confirm the address and you are on the list.',
          body: 'Nothing is stored until you confirm. The lawful basis for this list is consent, and a single click on a form is not evidence of it, so there is a confirmation step, and no subscription exists until you complete it.',
          tone: 'received',
        }
      case 'invalid':
        return {
          eyebrow: 'Newsletter',
          heading: 'That address did not look right.',
          body: 'Nothing was recorded. Check for a missing dot or a stray space and send it again from the footer of any page.',
          tone: 'problem',
        }
      case 'consent-required':
        return {
          eyebrow: 'Newsletter',
          heading: 'The consent box was not ticked.',
          body: 'An unticked box is not consent, so nothing was recorded. Tick it and send the form again.',
          tone: 'problem',
        }
      case 'error':
      default:
        return {
          eyebrow: 'Newsletter',
          heading: 'That did not go through.',
          body: `Nothing was recorded, and the fault is ours rather than yours. Try again, or email ${site.contact.email} and a person will add you by hand.`,
          tone: 'problem',
        }
    }
  }

  if (from === 'report-issue') {
    return {
      eyebrow: 'Vulnerability report',
      heading: 'Received. A person will acknowledge it.',
      body: 'Acknowledgement within one business day, from a person, and a triage decision within five business days with the reasoning. You will not have to chase us for either.',
      tone: 'received',
      detail: vdpCommitments,
    }
  }

  return {
    eyebrow: 'Enquiry',
    heading: thankYou.heading,
    body: thankYou.body,
    tone: 'received',
  }
}


const CSS = `
.ty__next { margin-top: var(--s12); }
.ty__next-grid { display: grid; gap: var(--s4); }
@media (min-width: 768px) { .ty__next-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.ty__next-grid > * { display: grid; }
.ty__next-grid .card { height: 100%; }
.ty__asset-label { margin: var(--s3) 0 0; font-size: var(--text-xl); font-weight: 600; color: var(--fg); }
.ty__asset-note { margin: var(--s2) 0 var(--s6); color: var(--muted); font-size: var(--text-sm); max-width: 44ch; }
.ty__detail { margin: var(--s8) 0 0; padding-left: var(--s4); color: var(--muted-strong); font-size: var(--text-sm); max-width: 64ch; }
.ty__detail li + li { margin-top: var(--s2); }
.ty__incident {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--s2) var(--s4);
  margin-top: var(--s12);
  padding: var(--s4) var(--s6);
  border: 2px solid var(--fg);
  border-radius: var(--radius-md);
  background-color: var(--surface);
}
.ty__incident p { margin: 0; color: var(--muted-strong); font-size: var(--text-sm); }
.ty__incident a {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  color: var(--fg);
  white-space: nowrap;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color var(--dur-base) var(--ease-out);
}
.ty__incident a:hover { color: var(--accent); }
`

/**
 * The incident note names the hotline in prose. Render the sentence exactly as
 * written, with the number itself promoted to a real tel: anchor - a number
 * someone has to retype on a phone keypad at 2am is not an affordance.
 */
function IncidentNote() {
  const [before, after] = thankYou.incidentNote.split(site.contact.irHotline)
  return (
    <div className="ty__incident">
      <PhoneCall size={18} aria-hidden="true" style={{ flex: 'none', alignSelf: 'center' }} />
      <p>
        {before}
        <a className="u-tnum" href={site.contact.irHotlineHref}>
          {site.contact.irHotline}
        </a>
        {after ?? ''}
      </p>
    </div>
  )
}

/**
 * The rendered confirmation for a given set of params.
 *
 * Hook-free, so it can be PRERENDERED. page.tsx renders it with empty params as
 * the Suspense fallback, which is what puts the default confirmation copy, the
 * next asset and the incident hotline into thank-you.html rather than shipping
 * an empty shell.
 */
export function ThankYouBody({ params }: { params: RawParams }) {
  const outcome = outcomeFor(params)
  const received = outcome.tone === 'received'

  return (
    <>
      <style href="envenox-thankyou" precedence="default">
        {CSS}
      </style>
      <JsonLd data={breadcrumbList([{ name: 'Thank you', path: '/thank-you' }])} />

      <Section theme="dark" grain offsetNav aria-labelledby="ty-h1">
        <p className="u-eyebrow">{outcome.eyebrow}</p>

        <h1
          id="ty-h1"
          style={{ fontSize: 'clamp(2.25rem, 5.4vw, 4rem)', marginTop: 'var(--s4)', maxWidth: '18ch' }}
        >
          {received ? null : (
            <CircleAlert
              size={28}
              aria-hidden="true"
              style={{ display: 'inline-block', verticalAlign: '-4px', marginRight: 'var(--s3)' }}
            />
          )}
          {outcome.heading}
        </h1>

        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {outcome.body}
        </p>

        {outcome.detail?.length ? (
          <ul className="ty__detail">
            {outcome.detail.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}

        {/* ---- the next asset ---- */}
        <div className="ty__next">
          <div className="ty__next-grid">
            <div>
              <Card as="div" padding="lg">
                <p className="u-eyebrow">
                  <FileText size={14} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: 'var(--s2)' }} />
                  Read this next
                </p>
                <p className="ty__asset-label">{thankYou.nextAsset.label}</p>
                <p className="ty__asset-note">
                  The redacted deliverable, section by section, findings, severity reasoning,
                  remediation and the executive summary a board actually reads.
                </p>
                <Button
                  href={thankYou.nextAsset.href}
                  variant="primary"
                  iconRight={<ArrowRight size={16} aria-hidden="true" />}
                >
                  {thankYou.nextAsset.label}
                </Button>
              </Card>
            </div>

            <div>
              <Card as="div" padding="lg">
                <p className="u-eyebrow">
                  {received ? 'Or' : 'Go back'}
                </p>
                <p className="ty__asset-label">
                  {received ? thankYou.secondary.label : 'Send it again'}
                </p>
                <p className="ty__asset-note">
                  {received
                    ? 'The page that explains why one firm tests what it builds, and what changes when the testers and the engineers share a backlog.'
                    : `Nothing was recorded, so nothing needs undoing. If the form keeps failing, email ${site.contact.email}, a person reads that inbox.`}
                </p>
                <Button
                  href={received ? thankYou.secondary.href : '/contact#enquiry-form'}
                  variant="secondary"
                  iconLeft={received ? undefined : <Mail size={16} aria-hidden="true" />}
                  iconRight={received ? <ArrowRight size={16} aria-hidden="true" /> : undefined}
                >
                  {received ? thankYou.secondary.label : 'Back to the contact form'}
                </Button>
              </Card>
            </div>
          </div>
        </div>

        {/* ---- the hotline, repeated ---- */}
        <IncidentNote />

        <p style={{ marginTop: 'var(--s8)', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
          Everything on this site in one list:{' '}
          <Link className="u-link" href="/sitemap" style={{ color: 'var(--fg)' }}>
            site map
          </Link>
          .
        </p>
      </Section>
    </>
  )
}

/**
 * The live, URL-driven confirmation. useSearchParams() suspends during
 * prerender, so ThankYouBody in the fallback is what ships in the file; this
 * takes over on hydration and tailors the copy to ?from=/?status=.
 */
export function ThankYouView() {
  const read = useSearchParams()
  return <ThankYouBody params={Object.fromEntries(read.entries())} />
}
