// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ArrowRight, ArrowUpRight, Minus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardLink, CardAbove } from '@/components/ui/Card'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { site, teamCredentials } from '@/lib/site'
import { contactIntro } from '@/lib/contact'
import { people, type Person } from '@/lib/people'
import styles from '../about.module.css'

/**
 * /about/leadership.
 *
 * PORTRAITS: every record is `isPlaceholder: true` and `headshot: null`, so
 * every tile is <AvatarPlaceholder> - initials on a flat two-stop gradient,
 * and obviously not a photograph. A stock or generated face would look
 * finished, which is exactly how it survives review and ships; the initials
 * tile is deliberately unfinished so it cannot. There is a visible note on
 * each profile saying the photograph is outstanding.
 *
 * CERTIFICATIONS: rendered for every person who holds them, which in this
 * data set is every security lead plus the two software leads. Counted
 * credentials beat adjectives, so they are badges beside the name rather than
 * a line inside the bio.
 *
 * LINKEDIN: a text link with a visible label. simple-icons@15.15.0 ships no
 * LinkedIn glyph (trademark removal) and Lucide ships no brand marks at all,
 * so there is no icon to reach for - and a labelled link is better for a
 * screen reader anyway. It sits in <CardAbove> so it stays clickable over the
 * stretched profile link.
 */

export const metadata: Metadata = {
  title: 'Leadership',
  description:
    'The people who would lead your engagement, which practice each one runs, and the certifications each security lead holds.',
  alternates: { canonical: '/about/leadership' },
  openGraph: { title: `Leadership · ${site.name}`, url: '/about/leadership' },
}

/** Structural group labels. The pillar names come from the data; these are
 *  the headings that name each group, nothing more. */
const PILLAR_GROUPS: { pillar: Person['pillar']; heading: string }[] = [
  { pillar: 'company', heading: 'Company' },
  { pillar: 'security', heading: 'Security practice' },
  { pillar: 'software', heading: 'Software practice' },
]

function PersonTile({ person }: { person: Person }) {
  return (
    <Card padding="lg" as="article" style={{ height: '100%' }}>
      <div className={styles.personCardInner}>
        <div className={styles.personTop}>
          <AvatarPlaceholder name={person.name} size={64} />
          <div style={{ minWidth: 0 }}>
            <h3 className={styles.personName}>
              <CardLink href={`/about/leadership/${person.slug}`}>{person.name}</CardLink>
            </h3>
            <p className={styles.personRole}>{person.role}</p>
          </div>
        </div>

        <p className={styles.personBio}>{person.bio}</p>

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

        {person.linkedin ? (
          <CardAbove>
            <p className={styles.personLinks}>
              <a
                className="u-link"
                href={person.linkedin}
                rel="noopener noreferrer"
                target="_blank"
                style={{ color: 'var(--muted-strong)' }}
              >
                {`${person.name} on LinkedIn`}
                <ArrowUpRight
                  size={14}
                  aria-hidden="true"
                  style={{ display: 'inline-block', verticalAlign: '-2px', marginLeft: '4px' }}
                />
              </a>
            </p>
          </CardAbove>
        ) : null}
      </div>
    </Card>
  )
}

export default function LeadershipPage() {
  const credentialLine = teamCredentials
    .map((credential) => `${credential.count} ${credential.label}`)
    .join(' · ')

  return (
    <>
      <Section theme="dark" grain offsetNav aria-labelledby="leadership-title">
        <nav aria-label="Breadcrumb">
          <ol
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'var(--s2)',
              listStyle: 'none',
              margin: '0 0 var(--s6)',
              padding: 0,
              fontSize: 'var(--text-sm)',
              color: 'var(--muted)',
            }}
          >
            <li>
              <Link className="u-link" href="/about" style={{ color: 'var(--muted-strong)' }}>
                About
              </Link>
            </li>
            <li aria-hidden="true">
              <Minus size={12} />
            </li>
            <li aria-current="page">Leadership</li>
          </ol>
        </nav>

        <h1
          id="leadership-title"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', maxWidth: '18ch' }}
        >
          The people who would lead the work
        </h1>

        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {site.contact.responseSla}
        </p>

        <p className={`u-mono`} style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--s8)' }}>
          {credentialLine}
        </p>
      </Section>

      <Section theme="light" aria-labelledby="leadership-groups-heading">
        <h2 id="leadership-groups-heading" className={styles.srOnly}>
          Leadership by practice
        </h2>

        {PILLAR_GROUPS.map((group) => {
          const members = people.filter((person) => person.pillar === group.pillar)
          if (members.length === 0) return null

          return (
            <div className={styles.pillarBlock} key={group.pillar}>
              <div className={styles.pillarHead}>
                <h3 className={styles.pillarName} id={`group-${group.pillar}`}>
                  {group.heading}
                </h3>
                <span className={`u-mono ${styles.pillarCount}`}>
                  {`${members.length} ${members.length === 1 ? 'person' : 'people'}`}
                </span>
              </div>

              <RevealGroup
                as="ul"
                className={styles.peopleGrid}
                aria-labelledby={`group-${group.pillar}`}
              >
                {members.map((person) => (
                  <Reveal as="li" key={person.slug}>
                    <PersonTile person={person} />
                  </Reveal>
                ))}
              </RevealGroup>
            </div>
          )
        })}

        <p style={{ marginTop: 'var(--s16)', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
          Portraits are placeholders. A photograph of each person replaces them before launch.
        </p>
      </Section>

      <Section theme="deep" tight>
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
          <Button href="/approach" variant="secondary" size="lg">
            {site.methodology.name}
          </Button>
        </div>
      </Section>
    </>
  )
}
