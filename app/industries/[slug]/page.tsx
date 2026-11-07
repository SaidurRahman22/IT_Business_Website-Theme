// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ArrowRight, Minus, MoveRight, TriangleAlert } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardLink } from '@/components/ui/Card'
import { Faq } from '@/components/ui/Faq'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { site } from '@/lib/site'
import { contactIntro } from '@/lib/contact'
import { industryPages, industryPagesBySlug, type IndustryPage } from '@/lib/industries'
import { industries as industryFrameworks } from '@/lib/proof'
import { servicesBySlug, pillars, type Pillar } from '@/lib/services'
import { caseStudiesBySlug } from '@/lib/case-studies'
import styles from '../industries.module.css'
import { RegulatoryMatrix } from '../_components/RegulatoryMatrix'

/**
 * /industries/[slug] - one sector.
 *
 * THE TEST THIS LAYOUT HAS TO PASS
 * The copy in lib/industries.ts could not be retitled for another sector
 * without rewriting it. The layout's job is not to undo that:
 *
 *   - `demands` and `bite` are rendered as two DIFFERENT KINDS of statement,
 *     not as a paragraph and its caption. The bite is what the regulation
 *     actually does in practice; it gets its own surface and larger type,
 *     because it is the part a compliance lead has not read on four other
 *     sites this week.
 *   - `services` is grouped BY PILLAR with a counted summary line, so the
 *     cross-pillar mix - the reason this firm has two practices - is visible
 *     rather than being a flat list a reader has to decode.
 *   - `failureModes` are numbered and sector-specific; they are not framed as
 *     generic "challenges".
 *
 * Nothing on this page is written here. Every sentence comes from lib/.
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
  return industryPages.map((industry) => ({ slug: industry.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const industry = industryPagesBySlug[slug]
  if (!industry) return { title: 'Industry not found', robots: { index: false, follow: true } }

  return {
    title: industry.name,
    description: industry.pressure,
    alternates: { canonical: `/industries/${industry.slug}` },
    openGraph: {
      title: `${industry.name} · ${site.name}`,
      description: industry.pressure,
      url: `/industries/${industry.slug}`,
    },
  }
}

// Keyed by plain string: `industries` in lib/proof.ts is `as const`, so inferring
// the Map key gives a literal union, while `IndustryPage.slug` is `string`.
// The widening belongs here at the boundary, not in the data.
const frameworksBySlug = new Map<string, readonly string[]>(
  industryFrameworks.map((i) => [i.slug, i.frameworks]),
)

/** Pillar display order, and the one name per pillar from lib/services.ts. */
const PILLAR_ORDER: Pillar[] = ['security', 'software', 'join']

const PILLAR_META: Record<Pillar, { name: string; line: string }> = {
  security: { name: pillars.security.name, line: pillars.security.line },
  software: { name: pillars.software.name, line: pillars.software.line },
  join: { name: 'Where both practices meet', line: site.methodology.oneLine },
}

function groupServicesByPillar(slugs: readonly string[]) {
  const resolved = slugs.map((slug) => servicesBySlug[slug]).filter(Boolean)
  return PILLAR_ORDER.map((pillar) => ({
    pillar,
    meta: PILLAR_META[pillar],
    services: resolved.filter((service) => service.pillar === pillar),
  })).filter((group) => group.services.length > 0)
}

/** The counted mix, assembled from the data rather than asserted. */
function mixSentence(groups: ReturnType<typeof groupServicesByPillar>) {
  if (groups.length < 2) return null
  const total = groups.reduce((n, group) => n + group.services.length, 0)
  const parts = groups.map((group) => `${group.services.length} ${group.meta.name}`)
  return `${total} services, ${parts.join(' · ')}`
}

function breadcrumbJsonLd(industry: IndustryPage) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
      { '@type': 'ListItem', position: 2, name: 'Industries', item: `${site.url}/industries` },
      {
        '@type': 'ListItem',
        position: 3,
        name: industry.name,
        item: `${site.url}/industries/${industry.slug}`,
      },
    ],
  }
}

export default async function IndustryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const industry = industryPagesBySlug[slug]
  if (!industry) notFound()

  const frameworks = frameworksBySlug.get(industry.slug) ?? []
  const groups = groupServicesByPillar(industry.services)
  const mix = mixSentence(groups)
  const studies = industry.caseStudies
    .map((caseSlug) => caseStudiesBySlug[caseSlug])
    .filter(Boolean)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(industry)).replace(/</g, '\\u003c'),
        }}
      />

      {/* ---------------------------------------------------------------- *
       * HERO - the sector and the pressure that is specific to it
       * ---------------------------------------------------------------- */}
      <Section theme="dark" grain offsetNav aria-labelledby="industry-title">
        <nav aria-label="Breadcrumb">
          <ol className={styles.breadcrumb}>
            <li>
              <Link className="u-link" href="/industries">
                Industries
              </Link>
            </li>
            <li aria-hidden="true">
              <Minus size={12} />
            </li>
            <li aria-current="page">{industry.name}</li>
          </ol>
        </nav>

        <h1
          id="industry-title"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', maxWidth: '16ch' }}
        >
          {industry.name}
        </h1>

        <p className={styles.pressure}>{industry.pressure}</p>

        <p className="u-measure" style={{ color: 'var(--muted)', marginTop: 'var(--s8)' }}>
          {industry.intro}
        </p>

        {frameworks.length ? (
          <ul className={styles.chips} style={{ marginTop: 'var(--s8)' }} aria-label="Frameworks in scope">
            {frameworks.map((framework) => (
              <li key={framework}>
                <Badge variant="neutral" className="u-mono">
                  {framework}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </Section>

      {/* ---------------------------------------------------------------- *
       * THE REGULATORY MAP - demands and bite, kept distinct
       * ---------------------------------------------------------------- */}
      <Section theme="light" aria-labelledby="regulatory-heading">
        <h2 id="regulatory-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '20ch' }}>
          {`The regulatory map for ${industry.name}`}
        </h2>

        {/* THE MAP AS A MAP. Rows are the frameworks, columns are the kinds of
            obligation, and a mark is read from each framework's own two
            sentences below rather than from a control crosswalk nobody can
            inspect. It answers the question a compliance lead arrives with —
            which obligation keeps recurring across everything that applies to
            me, which a list of four paragraphs cannot. */}
        <div style={{ marginTop: 'var(--s12)' }}>
          <RegulatoryMatrix
            industryName={industry.name}
            regulatory={industry.regulatory}
            id="regulatory-matrix"
          />
        </div>

        <ul className={styles.regList}>
          {industry.regulatory.map((entry) => (
            <Reveal as="li" key={entry.name} className={styles.reg}>
              <h3 className={styles.regName}>{entry.name}</h3>

              <div className={styles.regPair}>
                <div className={styles.regBlock}>
                  <p className={styles.regLabel}>What it demands</p>
                  <p className={styles.regDemands}>{entry.demands}</p>
                </div>

                <div className={styles.regBite}>
                  <p className={styles.regBiteLabel}>
                    <TriangleAlert size={14} aria-hidden="true" />
                    Where it bites
                  </p>
                  <p className={styles.regBiteBody}>{entry.bite}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* ---------------------------------------------------------------- *
       * FAILURE MODES SPECIFIC TO THIS SECTOR
       * ---------------------------------------------------------------- */}
      <Section theme="deep" aria-labelledby="failures-heading">
        <h2 id="failures-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '22ch' }}>
          {`How ${industry.name} systems fail`}
        </h2>

        <RevealGroup as="ol" className={styles.failureList}>
          {industry.failureModes.map((mode, i) => (
            <Reveal as="li" key={mode.title} className={styles.failureItem}>
              <span className={`u-mono ${styles.failureNum}`} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className={styles.failureTitle}>{mode.title}</h3>
                <p className={styles.failureBody}>{mode.body}</p>
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </Section>

      {/* ---------------------------------------------------------------- *
       * SERVICES, GROUPED BY PILLAR
       * ---------------------------------------------------------------- */}
      <Section theme="light" aria-labelledby="services-heading">
        <h2 id="services-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '22ch' }}>
          What we bring to it
        </h2>
        {mix ? <p className={`u-mono ${styles.mixNote}`}>{mix}</p> : null}

        <div className={styles.pillarGrid}>
          {groups.map((group) => (
            <div
              key={group.pillar}
              className={[
                styles.pillarGroup,
                group.pillar === 'join' ? styles.pillarGroupJoin : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.pillarHead}>
                <h3 className={styles.pillarName}>{group.meta.name}</h3>
                <span className={`u-mono ${styles.pillarCount}`}>
                  {`${group.services.length} service${group.services.length === 1 ? '' : 's'}`}
                </span>
              </div>
              <p className={styles.pillarLine}>{group.meta.line}</p>

              <ul className={styles.serviceList}>
                {group.services.map((service) => (
                  <li key={service.slug} className={styles.serviceRow}>
                    <Link className={styles.serviceLink} href={`/services/${service.slug}`}>
                      <span className={styles.serviceName}>{service.name}</span>
                    </Link>
                    <span className={styles.serviceLine}>{service.cardLine}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * CASE STUDIES IN THIS INDUSTRY
       * ---------------------------------------------------------------- */}
      {studies.length ? (
        <Section theme="dark" aria-labelledby="cases-heading">
          <h2 id="cases-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '22ch' }}>
            {`${industry.name} work`}
          </h2>

          <RevealGroup as="ul" className={styles.caseList}>
            {studies.map((study) => (
              <Reveal as="li" key={study.slug}>
                <Card padding="lg" as="article" style={{ height: '100%' }}>
                  <ul className={styles.caseMeta}>
                    <li>
                      <Badge variant="neutral">{study.engagementType}</Badge>
                    </li>
                    <li>
                      <Badge variant="neutral">{study.engagementLength}</Badge>
                    </li>
                    {study.nda ? (
                      <li>
                        <Badge variant="neutral">Under NDA</Badge>
                      </li>
                    ) : null}
                  </ul>

                  <h3 className={styles.caseHeadline}>
                    <CardLink href={`/case-studies/${study.slug}`}>{study.headline}</CardLink>
                  </h3>

                  <dl className={styles.caseMetrics}>
                    {study.metrics.map((metric) => (
                      <div className={styles.caseMetric} key={metric.label}>
                        <dt className={`u-mono ${styles.caseMetricValue}`}>{metric.value}</dt>
                        <dd className={styles.caseMetricLabel}>{metric.label}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              </Reveal>
            ))}
          </RevealGroup>

          <p style={{ marginTop: 'var(--s8)' }}>
            <Link className="u-link" href="/case-studies" style={{ color: 'var(--fg)' }}>
              Every case study, filterable by sector and service
            </Link>
          </p>
        </Section>
      ) : null}

      {/* ---------------------------------------------------------------- *
       * SECTOR-SPECIFIC CREDIBILITY
       * ---------------------------------------------------------------- */}
      <Section theme="deep" aria-labelledby="credibility-heading">
        <h2 id="credibility-heading" style={{ fontSize: 'var(--text-2xl)', maxWidth: '24ch' }}>
          {`What is specific to ${industry.name}`}
        </h2>

        <RevealGroup as="ul" className={styles.credList}>
          {industry.credibility.map((item) => (
            <Reveal as="li" key={item} className={styles.credItem}>
              <span className={styles.credMark} aria-hidden="true">
                <MoveRight size={14} />
              </span>
              <span>{item}</span>
            </Reveal>
          ))}
        </RevealGroup>
      </Section>

      {/* ---------------------------------------------------------------- *
       * FAQ - the only FAQ block on this page, so it keeps the JSON-LD.
       * ---------------------------------------------------------------- */}
      <Section theme="light" aria-labelledby="industry-faq-heading">
        <h2
          id="industry-faq-heading"
          style={{ fontSize: 'var(--text-3xl)', maxWidth: '20ch', marginBottom: 'var(--s12)' }}
        >
          {`Questions from ${industry.name} buyers`}
        </h2>
        <Faq items={industry.faqs} headingLevel={3} />
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
          <Button href="/trust" variant="secondary" size="lg">
            Our own security posture
          </Button>
        </div>
      </Section>
    </>
  )
}
