// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ArrowRight, ArrowUpRight, MapPin, MoveRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardLink } from '@/components/ui/Card'
import { StatBar } from '@/components/ui/StatBar'
import { Marquee } from '@/components/ui/Marquee'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { site, headlineStats, teamCredentials } from '@/lib/site'
import { contactIntro, contactRoutes } from '@/lib/contact'
import { trustSections } from '@/lib/trust'
import { pillars } from '@/lib/services'
import { people, type Person } from '@/lib/people'
import { certifications, clients, reviewBadges } from '@/lib/proof'
import { loopStages } from '@/lib/approach'
import styles from './about.module.css'

/**
 * /about.
 *
 * ===========================================================================
 * THE TIMELINE SECTION IS DELIBERATELY ABSENT
 * ===========================================================================
 * The brief asked for milestones, and then asked for the honest alternative if
 * there were none. There are none. `lib/` holds exactly one date-shaped fact
 * about the company's history: `headlineStats` carries "11 years operating",
 * sourced to the Companies House incorporation record and dated 2026-01-01.
 * One number is not a timeline, and the only way to produce five milestones
 * from it would be to invent four. A fabricated founding story on the About
 * page of a firm selling trust is the fastest credibility loss available, and
 * it is exactly the kind of thing a journalist checks first.
 *
 * So the honest derived fact is rendered where it belongs - inside the stats
 * band, with its source and `asOf` attached by <Stat> - and there is no
 * timeline band. This is reported back to the coordinator rather than being
 * quietly dropped.
 *
 * Everything else on this page is copy that already existed in lib/. The
 * two-practice story is `site.positioning`, `site.boilerplate` and the two
 * `pillars` entries from lib/services.ts; there is no founding myth because
 * none was written.
 */

export const metadata: Metadata = {
  title: 'About',
  description: site.positioning,
  alternates: { canonical: '/about' },
  openGraph: {
    title: `About · ${site.name}`,
    description: site.positioning,
    url: '/about',
  },
}

/** Two people per pillar, in a fixed pillar order. Deterministic, and it
 *  previews both practices and the company rather than one of the three. */
const PREVIEW_ORDER: Person['pillar'][] = ['company', 'security', 'software']
const leadershipPreview = PREVIEW_ORDER.flatMap((pillar) =>
  people.filter((person) => person.pillar === pillar).slice(0, 2),
)

/** "14 OSCP · 6 CISSP · 4 CREST CRT · … · 38 engineers" - assembled from the
 *  data, not typed out, so it cannot drift from the credential grid above it. */
const headcount = headlineStats.find((stat) => stat.label.includes('engineers'))

/** Quoted from lib/, never retyped - see the note at the "Joining us" panel. */
const salaryCommitment = (
  contactRoutes.find((route) => route.id === 'careers')?.body ?? ''
).split(/(?<=\.)\s+/)[0]
const backgroundChecks = trustSections.find((section) => section.id === 'people')?.summary
const credentialLine = [
  ...teamCredentials.map((credential) => `${credential.count} ${credential.label}`),
  headcount ? `${headcount.display} ${headcount.label}` : null,
]
  .filter(Boolean)
  .join(' · ')

export default function AboutPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- *
       * HERO - a position, not a founding date
       * ---------------------------------------------------------------- */}
      <Section theme="dark" grain offsetNav aria-labelledby="about-title">
        <p className="u-eyebrow">About {site.name}</p>

        <h1
          id="about-title"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', maxWidth: '18ch', marginTop: 'var(--s4)' }}
        >
          {site.tagline}
        </h1>

        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {site.positioning}
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * THE TWO-PRACTICE STORY
       * ---------------------------------------------------------------- */}
      <Section theme="light" aria-labelledby="practices-heading">
        <h2 id="practices-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '20ch' }}>
          Two practices, one firm
        </h2>

        <div className={styles.twoUp}>
          <div className={styles.practice}>
            <h3 className={styles.practiceName}>{pillars.security.name}</h3>
            <p className={styles.practiceLine}>{pillars.security.line}</p>
            <p className={styles.practiceBody}>{pillars.security.body}</p>
            <Link className={`u-link ${styles.practiceLink}`} href="/services/cybersecurity">
              {pillars.security.name}
              <MoveRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.practice}>
            <h3 className={styles.practiceName}>{pillars.software.name}</h3>
            <p className={styles.practiceLine}>{pillars.software.line}</p>
            <p className={styles.practiceBody}>{pillars.software.body}</p>
            <Link className={`u-link ${styles.practiceLink}`} href="/services/software-development">
              {pillars.software.name}
              <MoveRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <p className={styles.seam}>{site.boilerplate}</p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * CAPACITY + AGGREGATE CREDENTIALS
       * No timeline band: see the note at the top of this file.
       * ---------------------------------------------------------------- */}
      <Section theme="deep" aria-labelledby="capacity-heading">
        <h2 id="capacity-heading" className="u-eyebrow">
          Capacity, with its provenance
        </h2>
        <StatBar
          stats={headlineStats}
          ariaLabel={`${site.name} at a glance`}
          columns={4}
          size="md"
          provenance="details"
        />

        <h3 style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--s20)', maxWidth: '22ch' }}>
          Certifications held by the people, not the brochure
        </h3>
        <RevealGroup as="ul" className={styles.credGrid} aria-label="Team certifications held">
          {teamCredentials.map((credential) => (
            <Reveal as="li" key={credential.label} className={styles.credCell}>
              <span className={`u-mono u-tnum ${styles.credCount}`}>{credential.count}</span>
              <span className={styles.credLabel}>{credential.label}</span>
            </Reveal>
          ))}
        </RevealGroup>
        <p className={`u-mono ${styles.credLine}`}>{credentialLine}</p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * LEADERSHIP PREVIEW
       * ---------------------------------------------------------------- */}
      <Section theme="light" aria-labelledby="leadership-heading">
        <h2 id="leadership-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '20ch' }}>
          Who you would actually work with
        </h2>

        <RevealGroup as="ul" className={styles.peopleGrid}>
          {leadershipPreview.map((person) => (
            <Reveal as="li" key={person.slug}>
              <Card padding="lg" style={{ height: '100%' }}>
                <div className={styles.personCardInner}>
                  <div className={styles.personTop}>
                    <AvatarPlaceholder name={person.name} size={56} />
                    <div style={{ minWidth: 0 }}>
                      <h3 className={styles.personName}>
                        <CardLink href={`/about/leadership/${person.slug}`}>{person.name}</CardLink>
                      </h3>
                      <p className={styles.personRole}>{person.role}</p>
                    </div>
                  </div>
                  {person.certifications?.length ? (
                    <ul className={styles.certs} aria-label={`Certifications held by ${person.name}`}>
                      {person.certifications.map((certification) => (
                        <li key={certification}>
                          <Badge variant="neutral" className="u-mono">
                            {certification}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Card>
            </Reveal>
          ))}
        </RevealGroup>

        <p style={{ marginTop: 'var(--s8)' }}>
          <Link className="u-link" href="/about/leadership" style={{ color: 'var(--fg)' }}>
            {`All ${people.length}, with bios and the certifications each security lead holds`}
          </Link>
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * COMPANY CERTIFICATIONS AND ACCREDITATIONS
       * ---------------------------------------------------------------- */}
      <Section theme="dark" aria-labelledby="certifications-heading">
        <h2 id="certifications-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '20ch' }}>
          What the company itself is certified against
        </h2>

        <div
          className={styles.tableWrap}
          role="region"
          aria-labelledby="certifications-heading"
          tabIndex={0}
        >
          <table className={styles.certTable}>
            <caption className={styles.srOnly}>
              Certifications and accreditations held by {site.legalName}, with issuer, certificate
              number where one exists, and expiry.
            </caption>
            <thead>
              <tr>
                <th scope="col">Certification</th>
                <th scope="col">Issuer</th>
                <th scope="col">Certificate</th>
                <th scope="col">Expires</th>
              </tr>
            </thead>
            <tbody>
              {certifications.map((certification) => (
                <tr key={certification.slug}>
                  <th scope="row">
                    {certification.name}
                    <span className={styles.certScope}>{certification.scope}</span>
                  </th>
                  <td>{certification.issuer}</td>
                  <td className={`u-mono ${styles.certNum}`}>
                    {certification.certificateNumber ?? '—'}
                  </td>
                  <td className={`u-mono ${styles.certNum}`}>{certification.expires ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 'var(--s8)', display: 'flex', flexWrap: 'wrap', gap: 'var(--s4)' }}>
          <Link className="u-link" href="/certifications" style={{ color: 'var(--fg)' }}>
            Every certificate in full
          </Link>
          <Link className="u-link" href="/trust" style={{ color: 'var(--fg)' }}>
            Including the one we do not hold, and why
          </Link>
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * HOW WE WORK → /approach
       * ---------------------------------------------------------------- */}
      <Section theme="light" aria-labelledby="method-heading">
        <p className="u-eyebrow">Our method</p>
        <h2 id="method-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '20ch' }}>
          {site.methodology.name}
        </h2>
        <p
          className="u-measure"
          style={{ color: 'var(--fg)', fontSize: 'var(--text-lg)', marginTop: 'var(--s4)' }}
        >
          {site.methodology.oneLine}
        </p>

        <ol className={styles.loopPreview}>
          {loopStages.map((stage) => (
            <li className={styles.loopRow} key={stage.n}>
              <span className={`u-mono ${styles.loopNum}`} aria-hidden="true">
                {String(stage.n).padStart(2, '0')}
              </span>
              <span>
                <span className={styles.loopName}>{stage.name}</span>
                <span className={styles.loopLine}>{stage.oneLine}</span>
              </span>
            </li>
          ))}
        </ol>

        <p style={{ marginTop: 'var(--s8)' }}>
          <Button
            href="/approach"
            variant="secondary"
            size="md"
            iconRight={<ArrowRight size={16} aria-hidden="true" />}
          >
            {`${site.methodology.name} in full`}
          </Button>
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * CLIENTS - every mark carries its readable label
       * ---------------------------------------------------------------- */}
      <Section theme="deep" tight bleed aria-labelledby="clients-heading">
        <div className="u-container">
          <h2 id="clients-heading" className="u-eyebrow">
            Selected clients
          </h2>
        </div>
        <div style={{ marginTop: 'var(--s8)' }}>
          {/* tabIndex=0 is load-bearing, not decoration. globals.css turns
              `.marquee` into `overflow-x: auto` under
              `prefers-reduced-motion: reduce`, a genuinely scrollable region
             , but Marquee's root carries no tabindex, so a keyboard-only
              visitor with reduced motion on cannot scroll it and the clients
              past the fold are unreachable. Measured at 320px. Marquee
              spreads its rest props onto that element, so this is fixable
              from here; the component-level fix is reported to the
              coordinator because every other Marquee on the site has it too. */}
          <Marquee
            items={clients.map((client) => ({ label: client.label, meta: client.industry }))}
            ariaLabel="Selected clients"
            duration="52s"
            tabIndex={0}
          />
        </div>
        <div className="u-container" style={{ marginTop: 'var(--s8)' }}>
          <Link className="u-link" href="/customers" style={{ color: 'var(--fg)' }}>
            Who we work with, and what they say
          </Link>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * ANALYST AND REVIEW BADGES
       * ---------------------------------------------------------------- */}
      <Section theme="light" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading" style={{ fontSize: 'var(--text-2xl)', maxWidth: '24ch' }}>
          Third-party reviews, by pillar
        </h2>

        <RevealGroup as="ul" className={styles.badgeRow}>
          {reviewBadges.map((badge) => (
            <Reveal as="li" key={badge.source} className={styles.reviewCard}>
              <span className={`u-mono u-tnum ${styles.reviewScore}`}>{badge.score}</span>
              <p className={styles.reviewSource}>{badge.source}</p>
              <p className={styles.reviewMeta}>
                {`${badge.count} reviews · read on the ${badge.pillar} side`}
              </p>
              <a
                className={`u-link ${styles.reviewLink}`}
                href={badge.href}
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                {`${badge.source} profile`}
                <ArrowUpRight size={14} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-2px', marginLeft: '4px' }} />
              </a>
            </Reveal>
          ))}
        </RevealGroup>
      </Section>

      {/* ---------------------------------------------------------------- *
       * LOCATIONS + CAREERS
       * ---------------------------------------------------------------- */}
      <Section theme="deep" aria-labelledby="where-heading">
        <h2 id="where-heading" className={styles.srOnly}>
          Where we are, and joining us
        </h2>

        <div className={styles.splitPanels}>
          <div className={styles.panel}>
            <h3 className={styles.panelHeading}>Where we are</h3>
            <ul className={styles.officeList}>
              {site.offices.map((office) => (
                <li key={office.city}>
                  <span className={styles.officeCity}>
                    <MapPin
                      size={14}
                      aria-hidden="true"
                      style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: '6px' }}
                    />
                    {office.city}, {office.country}
                  </span>
                  <span className={styles.officeLine}>{office.line}</span>
                </li>
              ))}
            </ul>
            <p style={{ margin: 0 }}>
              <Link className="u-link" href="/locations" style={{ color: 'var(--fg)' }}>
                Offices, entity and data residency
              </Link>
            </p>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelHeading}>Joining us</h3>
            {/* Both lines are quoted from the data, not retyped: the first is
                the opening sentence of the careers route in lib/contact.ts,
                the second is the `people` summary from lib/trust.ts verbatim.
                Retyping either is how a commitment quietly becomes a weaker
                commitment. */}
            <p className={styles.panelBody}>{salaryCommitment}</p>
            {backgroundChecks ? (
              <p className={styles.panelBody}>{backgroundChecks}</p>
            ) : null}
            <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: 'var(--s4)' }}>
              <Link className="u-link" href="/careers" style={{ color: 'var(--fg)' }}>
                Careers
              </Link>
              <Link className="u-link" href="/trust" style={{ color: 'var(--fg)' }}>
                The background-check policy
              </Link>
            </p>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * CTA
       * ---------------------------------------------------------------- */}
      <Section theme="dark" tight>
        <h2 style={{ fontSize: 'var(--text-2xl)', maxWidth: '24ch' }}>{contactIntro.heading}</h2>
        <p className="u-measure" style={{ color: 'var(--muted)', marginTop: 'var(--s4)' }}>
          {contactIntro.lead}
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
          <Button href={site.secondaryCta.href} variant="secondary" size="lg">
            {site.secondaryCta.label}
          </Button>
        </div>
      </Section>
    </>
  )
}
