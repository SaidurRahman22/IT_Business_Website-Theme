// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ArrowRight, Clock, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { site } from '@/lib/site'
import { contactIntro } from '@/lib/contact'
import { certifications } from '@/lib/proof'
import { trustSections } from '@/lib/trust'
import styles from './locations.module.css'

/**
 * /locations.
 *
 * Three things a services buyer actually reads this page for: who the legal
 * entity is, where their data will sit, and what time zone the people are in.
 * All three are answered from existing data:
 *
 *   - entity        site.legalName
 *   - residency     the `your-data` section of lib/trust.ts, verbatim
 *   - scope         the ISO/IEC 27001 certificate scope in lib/proof.ts, which
 *                   names both cities
 *
 * TIME ZONE is NOT in lib/. The IANA zone and UTC offset for each city are
 * derived facts about the city, not claims about the business, so they are
 * declared below with the derivation stated rather than silently invented.
 * `lib/` has no per-office function data either - nothing says what work each
 * office does beyond the certificate scope that covers both - so this page
 * renders the scope that exists rather than a split it cannot evidence. That
 * gap is reported to the coordinator.
 */

export const metadata: Metadata = {
  title: 'Locations',
  description: `${site.legalName} offices in ${site.offices.map((o) => o.city).join(' and ')}, the legal entity, data residency and local time zones.`,
  alternates: { canonical: '/locations' },
  openGraph: { title: `Locations · ${site.name}`, url: '/locations' },
}

/**
 * Time-zone facts about each city. Derived from the city, not from lib/ - a
 * city's IANA zone is a fact, not a commitment, and it is the thing a buyer
 * with a 24/7 expectation needs before anything else on this page.
 */
const ZONES: Record<string, { iana: string; utc: string }> = {
  London: { iana: 'Europe/London', utc: 'UTC+00:00 / +01:00' },
  Dhaka: { iana: 'Asia/Dhaka', utc: 'UTC+06:00' },
}

const iso27001 = certifications.find((certification) => certification.slug === 'iso-27001')
const yourData = trustSections.find((section) => section.id === 'your-data')
const residencyRows = (yourData?.rows ?? []).filter((row) =>
  ['Residency', 'Isolation', 'Encryption', 'Retention'].includes(row.label),
)

export default function LocationsPage() {
  return (
    <>
      <Section theme="dark" grain offsetNav aria-labelledby="locations-title">
        <p className="u-eyebrow">Locations</p>

        <h1
          id="locations-title"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', maxWidth: '18ch', marginTop: 'var(--s4)' }}
        >
          Where we are, and where your data sits
        </h1>

        <div className={styles.entity}>
          <p className={styles.entityLabel}>Contracting entity</p>
          <p className={styles.entityValue}>{site.legalName}</p>
          {iso27001 ? (
            <p className={styles.entityScope}>
              {`ISO/IEC 27001:2022 scope, ${iso27001.scope}`}
            </p>
          ) : null}
        </div>
      </Section>

      <Section theme="light" aria-labelledby="offices-heading">
        <h2 id="offices-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '18ch' }}>
          {`${site.offices.length} offices`}
        </h2>

        <RevealGroup as="ul" className={styles.officeGrid}>
          {site.offices.map((office) => {
            const zone = ZONES[office.city]
            return (
              <Reveal as="li" key={office.city} className={styles.office}>
                <div className={styles.officeHead}>
                  <h3 className={styles.officeCity}>{office.city}</h3>
                  <Badge variant="neutral">{office.primary ? 'Primary office' : 'Office'}</Badge>
                </div>

                <dl className={styles.facts}>
                  <div className={styles.factRow}>
                    <dt className={styles.factLabel}>
                      <MapPin
                        size={13}
                        aria-hidden="true"
                        style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: '6px' }}
                      />
                      Address
                    </dt>
                    <dd className={styles.factValue}>
                      {office.line}
                      <br />
                      {office.country}
                    </dd>
                  </div>

                  {zone ? (
                    <div className={styles.factRow}>
                      <dt className={styles.factLabel}>
                        <Clock
                          size={13}
                          aria-hidden="true"
                          style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: '6px' }}
                        />
                        Time zone
                      </dt>
                      <dd className={`u-mono ${styles.factValue}`}>
                        {zone.iana}
                        <br />
                        {zone.utc}
                      </dd>
                    </div>
                  ) : null}

                  {iso27001 ? (
                    <div className={styles.factRow}>
                      <dt className={styles.factLabel}>Certified scope</dt>
                      <dd className={styles.factValue} style={{ color: 'var(--muted-strong)' }}>
                        {iso27001.scope}
                      </dd>
                    </div>
                  ) : null}

                  {office.primary ? (
                    <div className={styles.factRow}>
                      <dt className={styles.factLabel}>Switchboard</dt>
                      <dd className={`u-mono ${styles.factValue}`}>
                        <a className="u-link" href={`tel:${site.contact.switchboard.replace(/\s/g, '')}`}>
                          {site.contact.switchboard}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </Reveal>
            )
          })}
        </RevealGroup>
      </Section>

      {/* ---------------------------------------------------------------- *
       * DATA RESIDENCY - the rows that decide this, verbatim from /trust
       * ---------------------------------------------------------------- */}
      <Section theme="deep" aria-labelledby="residency-heading">
        <h2 id="residency-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '20ch' }}>
          Which region holds your evidence
        </h2>
        {yourData ? (
          <p
            className="u-measure"
            style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
          >
            {yourData.summary}
          </p>
        ) : null}

        <dl className={styles.residency}>
          {residencyRows.map((row) => (
            <div className={styles.residencyRow} key={row.label}>
              <dt className={styles.residencyLabel}>{row.label}</dt>
              <dd className={styles.residencyValue}>
                {row.value}
                {row.note ? <span className={styles.residencyNote}>{row.note}</span> : null}
              </dd>
            </div>
          ))}
        </dl>

        <p style={{ marginTop: 'var(--s8)' }}>
          <Link className="u-link" href="/trust" style={{ color: 'var(--fg)' }}>
            The full trust centre, sub-processors, background checks and our own posture
          </Link>
        </p>
      </Section>

      <Section theme="light" tight>
        <h2 style={{ fontSize: 'var(--text-2xl)', maxWidth: '24ch' }}>{contactIntro.heading}</h2>
        <p className="u-measure" style={{ color: 'var(--muted)', marginTop: 'var(--s4)' }}>
          {site.contact.responseSla}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s3)', marginTop: 'var(--s8)' }}>
          <Button
            href={site.primaryCta.href}
            variant="primary"
            size="lg"
            iconRight={<ArrowRight size={18} aria-hidden="true" />}
          >
            {site.primaryCta.label}
          </Button>
          <Button href={site.contact.irHotlineHref} variant="secondary" size="lg" className="u-mono">
            {site.contact.irHotline}
          </Button>
        </div>
        <p style={{ marginTop: 'var(--s4)', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
          {site.contact.irHotlineCommitment}
        </p>
      </Section>
    </>
  )
}
