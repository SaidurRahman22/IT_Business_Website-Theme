// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ArrowRight, ArrowUpRight, Minus, MoveRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { site } from '@/lib/site'
import { contactRoutes } from '@/lib/contact'
import { people, peopleBySlug, type Person } from '@/lib/people'
import { services } from '@/lib/services'
import styles from '../../about.module.css'

/**
 * /about/leadership/[slug] - one person.
 *
 * Emits Person JSON-LD. Deliberately NO `image` property: `headshot` is null
 * for every record, and pointing schema.org at a generated initials tile would
 * be asserting a portrait that does not exist. The avatar is rendered for
 * humans, with a visible note that it is a placeholder.
 *
 * `hasCredential` carries the certifications as
 * EducationalOccupationalCredential entries, which is the correct type for a
 * professional certification and is how OSCP, CISSP and CREST CRT become
 * machine-readable rather than decorative.
 */

type Params = { slug: string }

/**
 * SECURITY, not performance. The slug is used as a key into a lookup map, and
 * the page's only guard is `if (!record) notFound()`. This flag makes Next
 * answer an unknown slug with its own 404 before any of that runs.
 *
 * The maps are also prototype-safe now (see lib/lookup.ts), so this is the
 * outer of two layers. Both are deliberate: removing either one leaves the
 * other carrying the whole guarantee.
 */
export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return people.map((person) => ({ slug: person.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const person = peopleBySlug[slug]
  if (!person) return { title: 'Person not found', robots: { index: false, follow: true } }

  return {
    title: `${person.name}, ${person.role}`,
    description: person.bio,
    alternates: { canonical: `/about/leadership/${person.slug}` },
    openGraph: {
      type: 'profile',
      title: `${person.name} · ${site.name}`,
      description: person.bio,
      url: `/about/leadership/${person.slug}`,
    },
  }
}

const PILLAR_LABEL: Record<Person['pillar'], string> = {
  security: 'Security practice',
  software: 'Software practice',
  company: 'Company',
}

function personJsonLd(person: Person) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${site.url}/about/leadership/${person.slug}#person`,
    name: person.name,
    jobTitle: person.role,
    description: person.bio,
    url: `${site.url}/about/leadership/${person.slug}`,
    worksFor: { '@id': `${site.url}/#organization` },
    ...(person.linkedin ? { sameAs: [person.linkedin] } : {}),
    ...(person.certifications?.length
      ? {
          hasCredential: person.certifications.map((certification) => ({
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'certification',
            name: certification,
          })),
        }
      : {}),
  }
}

function breadcrumbJsonLd(person: Person) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'About', item: `${site.url}/about` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Leadership',
        item: `${site.url}/about/leadership`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: person.name,
        item: `${site.url}/about/leadership/${person.slug}`,
      },
    ],
  }
}

export default async function PersonPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const person = peopleBySlug[slug]
  if (!person) notFound()

  /** Services where this person is the named expert, from lib/services.ts. */
  const leads = services.filter((service) => service.expert === person.slug)

  /** Contact routes this person is the named contact for. */
  const routes = (person.contactRoutes ?? [])
    .map((id) => contactRoutes.find((route) => route.id === id))
    .filter((route): route is (typeof contactRoutes)[number] => Boolean(route))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([personJsonLd(person), breadcrumbJsonLd(person)]).replace(
            /</g,
            '\\u003c',
          ),
        }}
      />

      <Section theme="dark" grain offsetNav aria-labelledby="person-title">
        <nav aria-label="Breadcrumb">
          <ol
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'var(--s2)',
              listStyle: 'none',
              margin: '0 0 var(--s8)',
              padding: 0,
              fontSize: 'var(--text-sm)',
              color: 'var(--muted)',
            }}
          >
            <li>
              <Link className="u-link" href="/about/leadership" style={{ color: 'var(--muted-strong)' }}>
                Leadership
              </Link>
            </li>
            <li aria-hidden="true">
              <Minus size={12} />
            </li>
            <li aria-current="page">{person.name}</li>
          </ol>
        </nav>

        <div className={styles.profile}>
          <div>
            <AvatarPlaceholder name={person.name} size={140} />
            <p className={styles.profileNote}>
              Placeholder portrait. A photograph replaces it before launch.
            </p>
          </div>

          <div style={{ minWidth: 0 }}>
            <p className="u-eyebrow">{PILLAR_LABEL[person.pillar]}</p>

            <h1
              id="person-title"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginTop: 'var(--s3)' }}
            >
              {person.name}
            </h1>

            <p
              style={{
                color: 'var(--muted-strong)',
                fontSize: 'var(--text-lg)',
                marginTop: 'var(--s2)',
              }}
            >
              {person.role}
            </p>

            <p className="u-measure" style={{ color: 'var(--muted)', marginTop: 'var(--s6)' }}>
              {person.bio}
            </p>

            {person.certifications?.length ? (
              <>
                <h2 className="u-eyebrow" style={{ marginTop: 'var(--s8)' }}>
                  Certifications held
                </h2>
                <ul className={styles.certs} style={{ marginTop: 'var(--s3)' }}>
                  {person.certifications.map((certification) => (
                    <li key={certification}>
                      <Badge variant="neutral" size="md" className="u-mono">
                        {certification}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {person.linkedin ? (
              <p className={styles.personLinks} style={{ marginTop: 'var(--s8)' }}>
                <a
                  className="u-link"
                  href={person.linkedin}
                  rel="noopener noreferrer"
                  target="_blank"
                  style={{ color: 'var(--fg)' }}
                >
                  {`${person.name} on LinkedIn`}
                  <ArrowUpRight
                    size={14}
                    aria-hidden="true"
                    style={{ display: 'inline-block', verticalAlign: '-2px', marginLeft: '4px' }}
                  />
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </Section>

      {/* ---- what this person leads, resolved from lib/services.ts ---- */}
      {leads.length ? (
        <Section theme="light" aria-labelledby="leads-heading">
          <h2 id="leads-heading" style={{ fontSize: 'var(--text-2xl)', maxWidth: '24ch' }}>
            {`What ${person.name.split(' ')[0]} leads`}
          </h2>

          <RevealGroup as="ul" className={styles.hairList}>
            {leads.map((service) => (
              <Reveal as="li" key={service.slug} className={styles.hairRow}>
                <p className={styles.hairLabel}>
                  <Link className="u-link" href={`/services/${service.slug}`} style={{ color: 'var(--fg)' }}>
                    {service.name}
                  </Link>
                </p>
                <p className={styles.hairValue} style={{ color: 'var(--muted-strong)' }}>
                  {service.cardLine}
                </p>
              </Reveal>
            ))}
          </RevealGroup>
        </Section>
      ) : null}

      {/* ---- named contact routes ---- */}
      {routes.length ? (
        <Section theme="deep" aria-labelledby="routes-heading">
          <h2 id="routes-heading" style={{ fontSize: 'var(--text-2xl)', maxWidth: '26ch' }}>
            {`${person.name.split(' ')[0]} is the named contact for`}
          </h2>

          <ul className={styles.hairList}>
            {routes.map((route) => (
              <li className={styles.hairRow} key={route.id}>
                <p className={styles.hairLabel}>{route.label}</p>
                <span>
                  <p className={styles.hairValue}>{route.heading}</p>
                  <p
                    style={{
                      margin: 'var(--s2) 0 0',
                      color: 'var(--muted)',
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    {route.sla}
                  </p>
                  <p style={{ margin: 'var(--s3) 0 0' }}>
                    <a
                      className={`u-link ${route.action.kind === 'tel' || route.action.kind === 'email' ? 'u-mono' : ''}`}
                      href={route.action.href}
                      style={{ color: 'var(--fg)', display: 'inline-flex', alignItems: 'center', gap: 'var(--s2)' }}
                    >
                      {route.action.label}
                      <MoveRight size={14} aria-hidden="true" />
                    </a>
                  </p>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section theme="dark" tight>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s3)' }}>
          <Button
            href={site.primaryCta.href}
            variant="primary"
            size="lg"
            iconRight={<ArrowRight size={18} aria-hidden="true" />}
          >
            {site.primaryCta.label}
          </Button>
          <Button href="/about/leadership" variant="secondary" size="lg">
            All leadership
          </Button>
        </div>
      </Section>
    </>
  )
}
