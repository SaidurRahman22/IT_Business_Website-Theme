import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock, Mail, PhoneCall, Plug } from 'lucide-react'

import { contactIntro, contactRoutes, whatHappensNext } from '@/lib/contact'
import { contactsFor } from '@/lib/people'
import { site } from '@/lib/site'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { Breadcrumbs, JsonLd, breadcrumbList } from '../contact/_shared/seo'
import { ContactStyles, PersonRow } from '../contact/_shared/contact-ui'
import { EnquiryForm } from '../contact/_shared/EnquiryForm'

export const metadata: Metadata = {
  title: 'Book a call',
  description: contactIntro.lead.slice(0, 300),
  alternates: { canonical: '/book-a-call' },
}

/**
 * /book-a-call - the calendar route.
 *
 * NO SCHEDULING PROVIDER IS CONFIGURED. There is no Calendly, no Cal.com, no
 * HubSpot meetings link in this project, and inventing one would ship a button
 * that goes nowhere.
 *
 * So the slot where the embed will live is rendered as an HONEST, LABELLED
 * PLACEHOLDER: it says what will appear there, says why it is not there yet,
 * and puts the three working alternatives - a real form, a real mailbox and a
 * real phone number - immediately beside it rather than underneath an empty
 * iframe. What it deliberately does NOT do is draw a fake month grid. A
 * convincing mock calendar on a page a buyer is trying to book through is worse
 * than no calendar at all.
 *
 * Everything on this page is server-rendered. With scripting off the form still
 * submits, the mailto still opens, the number still dials.
 */

const enquiryRoute = contactRoutes[0]
const incidentRoute = contactRoutes.find((r) => r.urgency === 'emergency')

/**
 * A mailto that is a working booking affordance on its own: subject and body
 * are pre-filled with the three things scheduling actually needs, so a sender
 * with no form and no phone still has a complete first message.
 */
const BOOKING_MAILTO = (() => {
  const subject = 'Scoping call: three times that suit me'
  const body = [
    'Three times that suit me (with your time zone):',
    '1.',
    '2.',
    '3.',
    '',
    'What I am trying to achieve:',
    '',
    'What constrains it (deadline, audit date, budget, team):',
    '',
  ].join('\n')
  return `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
})()

const CSS = `
.bk { display: grid; gap: var(--s8); }
@media (min-width: 960px) { .bk { grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: var(--s12); } }

/* The slot where a scheduling embed will go. Labelled as empty, on purpose. */
.bk__slot {
  display: grid;
  align-content: center;
  justify-items: start;
  gap: var(--s4);
  min-height: 320px;
  padding: var(--s8);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  background-color: var(--surface);
}
.bk__slot-head {
  display: flex;
  align-items: center;
  gap: var(--s3);
  flex-wrap: wrap;
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--fg);
}
.bk__slot p { margin: 0; color: var(--muted); font-size: var(--text-sm); max-width: 52ch; line-height: 1.55; }
.bk__slot dl { margin: 0; display: grid; gap: var(--s2); font-size: var(--text-sm); }
.bk__slot dt { color: var(--muted); font-size: var(--text-xs); letter-spacing: 0.12em; text-transform: uppercase; }
.bk__slot dd { margin: 0; color: var(--muted-strong); }

.bk__alts { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s4); align-content: start; }
.bk__alts > li { display: grid; }
.bk__alts .card { height: 100%; }
.bk__alt-head {
  display: flex;
  align-items: center;
  gap: var(--s2);
  margin: 0 0 var(--s2);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--fg);
}
.bk__alt-head svg { flex: none; color: var(--muted); }
.bk__alt-note { margin: 0 0 var(--s4); color: var(--muted); font-size: var(--text-sm); max-width: 44ch; }
.bk__alt-value {
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-lg);
  font-weight: 600;
  overflow-wrap: anywhere;
}
.bk__alt-value a { color: var(--fg); text-decoration: none; transition: color var(--dur-base) var(--ease-out); }
.bk__alt-value a:hover { color: var(--accent); }
`

/**
 * STATIC EXPORT: this page no longer reads searchParams.
 *
 * The `?err=...&f_...=` round-trip existed so a Server Action could bounce a
 * failed submit back here carrying the errors and the typed values. Static
 * export has no Server Actions, so nothing can produce those params any more;
 * the form validates in the browser via `required`/`type` instead. Passing an
 * empty object keeps the shared form components' signatures unchanged.
 */
export default async function BookACallPage() {
  const params: Record<string, string | string[] | undefined> = {}
  const hosts = contactsFor('new-enquiry')

  return (
    <>
      <style href="envenox-book" precedence="default">
        {CSS}
      </style>
      <ContactStyles />
      <JsonLd data={breadcrumbList([{ name: 'Book a call', path: '/book-a-call' }])} />

      {/* ---- 1. the offer ---- */}
      <Section theme="dark" grain offsetNav aria-labelledby="bk-h1">
        <Breadcrumbs trail={[{ name: 'Book a call', path: '/book-a-call' }]} />

        <p className="u-eyebrow" style={{ marginTop: 'var(--s8)' }}>
          {contactIntro.eyebrow}
        </p>
        <h1
          id="bk-h1"
          style={{ fontSize: 'clamp(2.25rem, 5.4vw, 4rem)', marginTop: 'var(--s4)', maxWidth: '18ch' }}
        >
          {contactIntro.heading}
        </h1>
        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {contactIntro.lead}
        </p>

        {incidentRoute ? (
          <a className="ir-strip" href={incidentRoute.action.href}>
            <span className="ir-strip__label u-mono">{incidentRoute.label}</span>
            <span className="ir-strip__num u-tnum">{incidentRoute.action.label}</span>
            <span className="ir-strip__sla">{incidentRoute.sla}</span>
          </a>
        ) : null}
      </Section>

      {/* ---- 2. the calendar slot, honestly empty, with the alternatives ---- */}
      <Section theme="deep" aria-labelledby="bk-slot-h2">
        <h2 id="bk-slot-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          Pick a time
        </h2>

        <div className="bk" style={{ marginTop: 'var(--s8)' }}>
          <div className="bk__slot">
            <p className="bk__slot-head">
              <Plug size={20} aria-hidden="true" />
              No scheduling provider is connected yet
              <Badge variant="neutral">Pending</Badge>
            </p>
            <p>
              A live calendar belongs in this panel, showing the practice lead’s real
              availability. It is not here because no scheduling account has been connected to
              this site, and a booking button that opens nothing is worse than a page that admits
              it. The three routes on the right all work today, and all three reach a person.
            </p>
            <dl>
              <dt>What will appear here</dt>
              <dd>
                60-minute slots in your time zone, with the name of the person who will be on the
                call shown before you book.
              </dd>
              <dt>Until then</dt>
              <dd>{enquiryRoute.sla}</dd>
            </dl>
          </div>

          <ul className="bk__alts">
            <Reveal as="li">
              <Card as="div" padding="md">
                <p className="bk__alt-head">
                  <Mail size={16} aria-hidden="true" />
                  Send three times that suit you
                </p>
                <p className="bk__alt-note">
                  Opens your mail client with the subject and the three-slot structure already
                  written. No form, no account, no JavaScript.
                </p>
                <Button href={BOOKING_MAILTO} variant="primary" size="md">
                  Email {site.contact.email}
                </Button>
              </Card>
            </Reveal>

            <Reveal as="li">
              <Card as="div" padding="md">
                <p className="bk__alt-head">
                  <PhoneCall size={16} aria-hidden="true" />
                  Call the switchboard
                </p>
                <p className="bk__alt-note">Office hours, London. Ask for the practice lead by name.</p>
                <p className="bk__alt-value u-tnum">
                  <a href={`tel:${site.contact.switchboard.replace(/\s/g, '')}`}>
                    {site.contact.switchboard}
                  </a>
                </p>
              </Card>
            </Reveal>

            <Reveal as="li">
              <Card as="div" padding="md">
                <p className="bk__alt-head">
                  <CalendarClock size={16} aria-hidden="true" />
                  Use the form below
                </p>
                <p className="bk__alt-note">
                  Tell us when suits in the message field and we will send an invitation rather
                  than making you pick from ours.
                </p>
                <Button href="#enquiry-form" variant="secondary" size="md">
                  Go to the form
                </Button>
              </Card>
            </Reveal>
          </ul>
        </div>
      </Section>

      {/* ---- 3. what the call is ---- */}
      <Section theme="dark" grain aria-labelledby="bk-next-h2">
        <h2 id="bk-next-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          What happens next
        </h2>
        <RevealGroup as="ol" className="steps">
          {whatHappensNext.map((step) => (
            <Reveal as="li" key={step.n} className="steps__item">
              <span className="steps__n u-mono u-tnum" aria-hidden="true">
                {String(step.n).padStart(2, '0')}
              </span>
              <h3 className="steps__name">{step.name}</h3>
              <p className="steps__body">{step.body}</p>
            </Reveal>
          ))}
        </RevealGroup>
      </Section>

      {/* ---- 4. who hosts it ---- */}
      {hosts.length > 0 ? (
        <Section theme="deep" tight aria-labelledby="bk-hosts-h2">
          <h2 id="bk-hosts-h2" style={{ fontSize: 'var(--text-2xl)' }}>
            Who you will speak to
          </h2>
          <RevealGroup as="ul" className="people-list" style={{ marginTop: 'var(--s8)' }}>
            {hosts.map((person) => (
              <Reveal as="li" key={person.slug}>
                <PersonRow person={person} />
              </Reveal>
            ))}
          </RevealGroup>
        </Section>
      ) : null}

      {/* ---- 5. the working form ---- */}
      <Section theme="light" id="enquiry-form" aria-labelledby="bk-form-h2">
        <h2 id="bk-form-h2" style={{ fontSize: 'var(--text-2xl)', maxWidth: '20ch' }}>
          Request a scoping call
        </h2>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--s3)', maxWidth: '52ch' }}>
          Put the times that suit you in the message field. A named engineer replies within one
          business day.
        </p>
        <div style={{ maxWidth: '760px', marginTop: 'var(--s8)' }}>
          <EnquiryForm
            returnPath="/book-a-call"
            params={params}
            submitLabel="Request a scoping call"
          />
        </div>
        <p style={{ marginTop: 'var(--s8)', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
          Would rather not book anything yet?{' '}
          <Link className="u-link" href="/sample-report" style={{ color: 'var(--fg)' }}>
            Walk a sample report
          </Link>{' '}
         . It is the document you would be buying.
        </p>
      </Section>
    </>
  )
}
