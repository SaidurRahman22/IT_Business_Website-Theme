// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { site } from '@/lib/site'
import { contactIntro } from '@/lib/contact'
import { industryPages } from '@/lib/industries'
import { industries as industryFrameworks } from '@/lib/proof'
import styles from './industries.module.css'

/**
 * /industries - the hub.
 *
 * A real index, not a landing page: every sector with the one sentence that
 * says what is actually pressing it, plus the frameworks that sector is
 * assessed against. There is no hub-level marketing copy in lib/ and none is
 * invented here - the sector `pressure` lines are the content.
 *
 * `frameworks` is joined from lib/proof.ts by slug. The two files hold
 * different halves of the same record and the hub is where both are useful.
 */

export const metadata: Metadata = {
  title: 'Industries',
  description:
    'Six sectors, each with the regulation that is actually biting, the failure modes specific to it, and services drawn from both practices.',
  alternates: { canonical: '/industries' },
  openGraph: { title: `Industries · ${site.name}`, url: '/industries' },
}

// Keyed by plain string: `industries` in lib/proof.ts is `as const`, so inferring
// the Map key gives a literal union, while `IndustryPage.slug` is `string`.
// The widening belongs here at the boundary, not in the data.
const frameworksBySlug = new Map<string, readonly string[]>(
  industryFrameworks.map((i) => [i.slug, i.frameworks]),
)

export default function IndustriesHubPage() {
  return (
    <>
      <Section theme="dark" grain offsetNav aria-labelledby="industries-title">
        <h1
          id="industries-title"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', maxWidth: '16ch', marginTop: 'var(--s4)' }}
        >
          Industries
        </h1>
        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {site.positioning}
        </p>
      </Section>

      <Section theme="light" aria-labelledby="sector-index-heading">
        <h2 id="sector-index-heading" className="u-eyebrow">
          {`${industryPages.length} sectors`}
        </h2>

        <RevealGroup as="ol" className={styles.hubList}>
          {industryPages.map((industry) => {
            const frameworks = frameworksBySlug.get(industry.slug) ?? []
            return (
              <Reveal as="li" key={industry.slug} className={styles.hubRow}>
                <h3 className={styles.hubName}>
                  <Link className={`u-link ${styles.serviceLink}`} href={`/industries/${industry.slug}`}>
                    {industry.name}
                  </Link>
                </h3>
                <div>
                  <p className={styles.hubPressure}>{industry.pressure}</p>
                  {frameworks.length ? (
                    <ul className={styles.chips} aria-label={`Frameworks relevant to ${industry.name}`}>
                      {frameworks.map((framework) => (
                        <li key={framework}>
                          <Badge variant="neutral" className="u-mono">
                            {framework}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Reveal>
            )
          })}
        </RevealGroup>
      </Section>

      <Section theme="deep" tight>
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
          <Button href="/approach" variant="secondary" size="lg">
            {site.methodology.name}
          </Button>
        </div>
      </Section>
    </>
  )
}
