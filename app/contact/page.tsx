import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CalendarClock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react'

import { contactIntro, contactReassurance, contactRoutes, whatHappensNext, type ContactRoute } from '@/lib/contact'
import { contactsFor, type Person } from '@/lib/people'
import { site } from '@/lib/site'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { CopyButton } from '@/components/ui/CopyButton'
import { Breadcrumbs, JsonLd, ORGANIZATION_REF, breadcrumbList } from './_shared/seo'
import { EnquiryForm } from './_shared/EnquiryForm'
import { ContactStyles, RouteCard, PersonRow } from './_shared/contact-ui'

export const metadata: Metadata = {
  title: contactIntro.heading,
  description: contactIntro.lead.slice(0, 300),
  alternates: { canonical: '/contact' },
  openGraph: {
    title: `${contactIntro.heading} · ${site.name}`,
    description: contactIntro.lead.slice(0, 300),
    url: '/contact',
  },
}

/**
 * /contact - the money page.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * THE TWO HARD REQUIREMENTS
 *
 * 1. THE FORM EXISTS IN SERVED HTML. Every label, every option, the submit
 *    button and the server action's POST target are in the first byte of
 *    markup. A competitor's `/get-started` injects its form with JavaScript,
 *    so their money page is empty to anything that does not execute it.
 *    Verify: `curl -s http://localhost:3000/contact | grep -c '<form'`.
 *
 * 2. THE ACTIVE INCIDENT ROUTE IS NOT BEHIND A FORM. It is a plain `tel:`
 *    anchor, outside every <form> on the page, in no modal, requiring no
 *    interaction to reveal. It appears twice by design - once as a strip above
 *    the fold and once as the first and widest route card - because somebody in
 *    hour one of a breach should not be scrolling, and should certainly not be
 *    choosing a service interest from a dropdown.
 *
 *    Its urgency is carried by placement, width, border weight and the size of
 *    the number. NOT by --signal-critical: the semantic colours belong to
 *    product UI and severity labels (components/ui/Badge.tsx), and a red page
 *    chrome here would devalue them everywhere else.
 * ──────────────────────────────────────────────────────────────────────────
 */

const incidentRoute = contactRoutes.find((r) => r.urgency === 'emergency')
const standardRoutes = contactRoutes.filter((r) => r.urgency !== 'emergency')

/** The named humans for a given route id, deduplicated. */
function peopleForRoute(route: ContactRoute): Person[] {
  const groups =
    route.id === 'careers'
      ? [...contactsFor('careers'), ...contactsFor('press')]
      : route.id === 'incident'
        ? contactsFor('incident')
        : contactsFor('new-enquiry')
  const seen = new Set<string>()
  return groups.filter((p) => (seen.has(p.slug) ? false : (seen.add(p.slug), true)))
}

/**
 * STATIC EXPORT: this page no longer reads searchParams.
 *
 * The `?err=...&f_...=` round-trip existed so a Server Action could bounce a
 * failed submit back here carrying the errors and the typed values. Static
 * export has no Server Actions, so nothing can produce those params any more;
 * the form validates in the browser via `required`/`type` instead. Passing an
 * empty object keeps the shared form components' signatures unchanged.
 */
export default async function ContactPage() {
  const params: Record<string, string | string[] | undefined> = {}

  return (
    <>
      <JsonLd data={breadcrumbList([{ name: 'Contact', path: '/contact' }])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: contactIntro.heading,
          description: contactIntro.lead,
          url: `${site.url}/contact`,
          isPartOf: { '@id': `${site.url}/#website` },
          publisher: ORGANIZATION_REF,
          mainEntity: ORGANIZATION_REF,
        }}
      />
      <ContactStyles />

      {/* ---------------------------------------------------------------- *
       * 1 - The next step, named. Not "Contact us".
       * ---------------------------------------------------------------- */}
      <Section theme="dark" grain offsetNav aria-labelledby="contact-h1">
        <Breadcrumbs trail={[{ name: 'Contact', path: '/contact' }]} />

        <p className="u-eyebrow" style={{ marginTop: 'var(--s8)' }}>
          {contactIntro.eyebrow}
        </p>
        <h1
          id="contact-h1"
          style={{
            fontSize: 'clamp(2.25rem, 5.4vw, 4rem)',
            marginTop: 'var(--s4)',
            maxWidth: '18ch',
          }}
        >
          {contactIntro.heading}
        </h1>
        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {contactIntro.lead}
        </p>

        {/* The hotline, above the fold, as a plain anchor. */}
        {incidentRoute ? (
          <a className="ir-strip" href={incidentRoute.action.href}>
            <span className="ir-strip__label u-mono">{incidentRoute.label}</span>
            <span className="ir-strip__num u-tnum">{incidentRoute.action.label}</span>
            <span className="ir-strip__sla">{incidentRoute.sla}</span>
          </a>
        ) : null}
      </Section>

      {/* ---------------------------------------------------------------- *
       * 2 - Three explicit routes. The emergency one first and widest.
       * ---------------------------------------------------------------- */}
      <Section theme="deep" id="routes">
        {incidentRoute ? <RouteCard route={incidentRoute} people={peopleForRoute(incidentRoute)} /> : null}

        <RevealGroup as="div" className="routes-grid">
          {standardRoutes.map((route) => (
            <Reveal as="div" key={route.id} className="routes-grid__cell">
              <RouteCard route={route} people={peopleForRoute(route)} />
            </Reveal>
          ))}
        </RevealGroup>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 3 - The form. Server-rendered, server-validated, no JavaScript.
       * ---------------------------------------------------------------- */}
      <Section theme="light" id="enquiry-form" aria-labelledby="enquiry-h2">
        <div className="contact-split">
          <div>
            <h2 id="enquiry-h2" style={{ fontSize: 'var(--text-3xl)', maxWidth: '14ch' }}>
              {contactRoutes[0].action.label}
            </h2>
            <p className="contact-split__note">{contactRoutes[0].sla}</p>
            <ul className="contact-aside">
              <li>
                <Mail size={16} aria-hidden="true" />
                <a className="u-link" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
                {/* The mailto stays: it is right on a phone. This serves the
                    desktop reader, where mailto opens a client nobody has
                    configured and the address gets selected by hand instead. */}
                <CopyButton value={site.contact.email} label="email address" />
              </li>
              <li>
                <Phone size={16} aria-hidden="true" />
                <a className="u-link u-tnum" href={`tel:${site.contact.switchboard.replace(/\s/g, '')}`}>
                  {site.contact.switchboard}
                </a>
                <CopyButton value={site.contact.switchboard} label="phone number" />
              </li>
              <li>
                <CalendarClock size={16} aria-hidden="true" />
                <Link className="u-link" href="/book-a-call">
                  Book a 60-minute scoping call
                </Link>
              </li>
            </ul>
          </div>

          <div className="contact-split__form">
            <EnquiryForm
              returnPath="/contact"
              params={params}
              submitLabel={contactRoutes[0].action.label}
            />
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 4 - What happens next.
       * ---------------------------------------------------------------- */}
      <Section theme="deep" aria-labelledby="next-h2">
        <h2 id="next-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          What happens next
        </h2>
        <RevealGroup as="ol" className="steps" baseDelay={60}>
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

      {/* ---------------------------------------------------------------- *
       * 5 - Named humans.
       * ---------------------------------------------------------------- */}
      <Section theme="dark" grain aria-labelledby="people-h2">
        <h2 id="people-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          Who you will speak to
        </h2>
        <p className="u-measure" style={{ color: 'var(--muted)', marginTop: 'var(--s3)' }}>
          Named individuals, not roles. The reply comes from the practice lead for whatever you
          asked about.
        </p>

        <div className="people-groups">
          {contactRoutes.map((route) => {
            const group = peopleForRoute(route)
            if (group.length === 0) return null
            return (
              <section key={route.id} className="people-group" aria-labelledby={`people-${route.id}`}>
                <h3 id={`people-${route.id}`} className="u-eyebrow">
                  {route.label}
                </h3>
                <RevealGroup as="ul" className="people-list">
                  {group.map((person) => (
                    <Reveal as="li" key={person.slug}>
                      <PersonRow person={person} />
                    </Reveal>
                  ))}
                </RevealGroup>
              </section>
            )
          })}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 6 - Phone, email and calendar. Every alternative to the form.
       * ---------------------------------------------------------------- */}
      <Section theme="light" aria-labelledby="direct-h2">
        <h2 id="direct-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          Phone, email and calendar
        </h2>
        <RevealGroup as="ul" className="direct">
          <Reveal as="li">
            <Card as="div" padding="md">
              <p className="u-eyebrow">Incident hotline</p>
              <p className="direct__value">
                <a className="u-link u-tnum" href={site.contact.irHotlineHref}>
                  {site.contact.irHotline}
                </a>
              </p>
              <p className="direct__note">{site.contact.irHotlineCommitment}</p>
            </Card>
          </Reveal>
          <Reveal as="li">
            <Card as="div" padding="md">
              <p className="u-eyebrow">Switchboard</p>
              <p className="direct__value">
                <a className="u-link u-tnum" href={`tel:${site.contact.switchboard.replace(/\s/g, '')}`}>
                  {site.contact.switchboard}
                </a>
              </p>
              <p className="direct__note">Office hours, London.</p>
            </Card>
          </Reveal>
          <Reveal as="li">
            <Card as="div" padding="md">
              <p className="u-eyebrow">Email</p>
              <p className="direct__value">
                <a className="u-link" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </p>
              <p className="direct__note">{site.contact.responseSla}</p>
            </Card>
          </Reveal>
          <Reveal as="li">
            <Card as="div" padding="md">
              <p className="u-eyebrow">Calendar</p>
              <p className="direct__value">
                <Link className="u-link" href="/book-a-call">
                  Book a call
                </Link>
              </p>
              <p className="direct__note">
                Pick a slot, or tell us when suits and we will send an invitation.
              </p>
            </Card>
          </Reveal>
        </RevealGroup>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 7 - Offices and legal entity.
       * ---------------------------------------------------------------- */}
      <Section theme="deep" tight aria-labelledby="offices-h2">
        <h2 id="offices-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          Offices and legal entity
        </h2>
        <ul className="offices">
          {site.offices.map((office) => (
            <li key={office.city}>
              <p className="offices__city">
                <MapPin size={16} aria-hidden="true" />
                {office.city}, {office.country}
                {office.primary ? (
                  <>
                    {' '}
                    <Badge variant="neutral">Registered office</Badge>
                  </>
                ) : null}
              </p>
              <p className="offices__line">{office.line}</p>
            </li>
          ))}
          <li>
            <p className="offices__city">
              <Building2 size={16} aria-hidden="true" />
              Legal entity
            </p>
            <p className="offices__line">
              {site.legalName}, registered in England and Wales. Contracting entity on every
              statement of work.
            </p>
          </li>
        </ul>
      </Section>

      {/* ---------------------------------------------------------------- *
       * 8 - NDA, data and our own posture.
       * ---------------------------------------------------------------- */}
      <Section theme="dark" grain aria-labelledby="reassure-h2">
        <h2 id="reassure-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          <ShieldCheck size={22} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-3px', marginRight: 'var(--s2)' }} />
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
        <p style={{ marginTop: 'var(--s8)' }}>
          <Link className="u-link" href="/trust" style={{ color: 'var(--fg)' }}>
            Read our published security posture
          </Link>{' '}
          <ArrowRight size={14} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-2px' }} />
        </p>
      </Section>
    </>
  )
}
