import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarClock, Mail, PhoneCall } from 'lucide-react'

import { contactIntro, contactReassurance, contactRoutes, whatHappensNext } from '@/lib/contact'
import { contactsFor } from '@/lib/people'
import { site } from '@/lib/site'
import { Section } from '@/components/ui/Section'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { Breadcrumbs, JsonLd, breadcrumbList } from '../contact/_shared/seo'
import { ContactStyles, PersonRow } from '../contact/_shared/contact-ui'
import { EnquiryForm } from '../contact/_shared/EnquiryForm'

export const metadata: Metadata = {
  title: 'Get started',
  description: contactIntro.lead.slice(0, 300),
  alternates: { canonical: '/get-started' },
}

/**
 * /get-started - the route the competitor research flagged.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * One competitor's `/get-started` page contains NO FORM AT ALL in its served
 * HTML. The element is injected by JavaScript, so their money page is empty to
 * a crawler, to a link preview, to reader mode, to a corporate proxy that
 * strips scripts, and to anyone whose bundle request simply failed.
 *
 * This page is the opposite claim, and it is checkable rather than asserted:
 *
 *   curl -s http://localhost:3000/get-started | grep -o '<form[^>]*'
 *   curl -s http://localhost:3000/get-started | grep -c 'Business email'
 *
 * The <form>, all seven labels, all fourteen service options, the consent
 * checkbox and the POST target are in the first byte of markup. There is no
 * Client Component anywhere in this tree.
 * ──────────────────────────────────────────────────────────────────────────
 */

const incidentRoute = contactRoutes.find((r) => r.urgency === 'emergency')
const enquiryRoute = contactRoutes[0]

const CSS = `
.gs { display: grid; gap: var(--s12); }
@media (min-width: 1000px) {
  .gs { grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); gap: var(--s16); align-items: start; }
}
.gs__aside { display: grid; gap: var(--s8); align-content: start; }
.gs__aside h2 { margin: 0; font-size: var(--text-3xl); max-width: 16ch; }
.gs__lead { margin: 0; color: var(--muted-strong); max-width: 48ch; }
.gs__links { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s3); font-size: var(--text-sm); }
.gs__links li { display: flex; align-items: center; gap: var(--s2); min-width: 0; }
.gs__links svg { flex: none; color: var(--muted); }
.gs__promise { margin: 0; padding-top: var(--s4); border-top: 1px solid var(--border); font-size: var(--text-sm); color: var(--muted); max-width: 44ch; }
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
export default async function GetStartedPage() {
  const params: Record<string, string | string[] | undefined> = {}
  const leads = contactsFor('new-enquiry')

  return (
    <>
      <style href="envenox-getstarted" precedence="default">
        {CSS}
      </style>
      <ContactStyles />
      <JsonLd data={breadcrumbList([{ name: 'Get started', path: '/get-started' }])} />

      {/* ---- 1. the form, immediately. No hero between a buyer and the form. ---- */}
      <Section theme="dark" grain offsetNav id="enquiry-form" aria-labelledby="gs-h1">
        <Breadcrumbs trail={[{ name: 'Get started', path: '/get-started' }]} />

        <div className="gs" style={{ marginTop: 'var(--s12)' }}>
          <div className="gs__aside">
            <div>
              <p className="u-eyebrow">{contactIntro.eyebrow}</p>
              <h1
                id="gs-h1"
                style={{ fontSize: 'clamp(2rem, 4.6vw, 3rem)', marginTop: 'var(--s4)', maxWidth: '16ch' }}
              >
                {contactIntro.heading}
              </h1>
            </div>

            <p className="gs__lead">{contactIntro.lead}</p>

            <ul className="gs__links">
              <li>
                <Mail size={16} aria-hidden="true" />
                <a className="u-link" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </li>
              <li>
                <PhoneCall size={16} aria-hidden="true" />
                <a className="u-link u-tnum" href={`tel:${site.contact.switchboard.replace(/\s/g, '')}`}>
                  {site.contact.switchboard}
                </a>
              </li>
              <li>
                <CalendarClock size={16} aria-hidden="true" />
                <Link className="u-link" href="/book-a-call">
                  Book directly in a calendar
                </Link>
              </li>
            </ul>

            <p className="gs__promise">{enquiryRoute.sla}</p>
          </div>

          <div style={{ minWidth: 0 }}>
            <EnquiryForm
              returnPath="/get-started"
              params={params}
              submitLabel={enquiryRoute.action.label}
            />
          </div>
        </div>

        {/* The incident route is outside the form element above, a plain tel:
            anchor, no submission, no modal. */}
        {incidentRoute ? (
          <a className="ir-strip" href={incidentRoute.action.href}>
            <span className="ir-strip__label u-mono">{incidentRoute.label}</span>
            <span className="ir-strip__num u-tnum">{incidentRoute.action.label}</span>
            <span className="ir-strip__sla">{incidentRoute.sla}</span>
          </a>
        ) : null}
      </Section>

      {/* ---- 2. what happens next ---- */}
      <Section theme="light" aria-labelledby="gs-next-h2">
        <h2 id="gs-next-h2" style={{ fontSize: 'var(--text-2xl)' }}>
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

      {/* ---- 3. who reads it ---- */}
      {leads.length > 0 ? (
        <Section theme="deep" tight aria-labelledby="gs-people-h2">
          <h2 id="gs-people-h2" style={{ fontSize: 'var(--text-2xl)' }}>
            Who you will speak to
          </h2>
          <RevealGroup as="ul" className="people-list" style={{ marginTop: 'var(--s8)' }}>
            {leads.map((person) => (
              <Reveal as="li" key={person.slug}>
                <PersonRow person={person} />
              </Reveal>
            ))}
          </RevealGroup>
        </Section>
      ) : null}

      {/* ---- 4. reassurance ---- */}
      <Section theme="dark" grain aria-labelledby="gs-reassure-h2">
        <h2 id="gs-reassure-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          NDA, data and our own posture
        </h2>
        <RevealGroup as="dl" className="reassure">
          {contactReassurance.map((item) => (
            <Reveal as="div" key={item.label} className="reassure__row">
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </Reveal>
          ))}
        </RevealGroup>
      </Section>
    </>
  )
}
