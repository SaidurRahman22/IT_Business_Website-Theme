import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowRight, Clock, Layers, MapPin, Quote, Users } from 'lucide-react'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Prose } from '@/components/ui/Prose'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { caseStudies, caseStudiesBySlug } from '@/lib/case-studies'
import { servicesBySlug } from '@/lib/services'
import { site } from '@/lib/site'
import {
  CaseStudyCard,
  DualPillarMarker,
  NamedContactsCta,
  NdaBlock,
  ProofStyles,
  clientLabel,
} from '../_components/proof'
import { EngagementBand, MetricChart } from '../_components/charts'
import { studyConsoles } from '../_components/consoles'

/**
 * The case study template.
 *
 * The weakest template class in the whole competitor sample - one competitor's
 * customer page carries a "Solution" heading, a video, and nothing else. The
 * fixed running order here is the answer to that, and the two sections that
 * carry it are the three metrics ABOVE THE FOLD and `technicalLayer`.
 *
 * Running order, in the DOM, in this order, always:
 *   metadata bar → headline → 3 metrics → challenge → approach (phased)
 *   → named quote → the technical layer → stack → team → timeline
 *   → related → CTA
 */

const CSS = `
.cs-breadcrumb { font-size: var(--text-xs); color: var(--muted); }
.cs-breadcrumb ol { display: flex; flex-wrap: wrap; gap: var(--s2); list-style: none; margin: 0; padding: 0; }
.cs-breadcrumb li { display: inline-flex; align-items: center; gap: var(--s2); }
.cs-breadcrumb li + li::before { content: '/'; color: var(--border-strong); }
.cs-breadcrumb a { color: var(--muted); text-decoration: none; }
.cs-breadcrumb a:hover { color: var(--fg); }
.cs-breadcrumb [aria-current='page'] { color: var(--muted-strong); }

/* ---------------- metadata bar ---------------- */
.cs-meta {
  display: grid;
  gap: var(--s6);
  margin-top: var(--s6);
  padding-block: var(--s4);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
@media (min-width: 480px) {
  .cs-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s6) var(--s8); }
}
@media (min-width: 768px) {
  .cs-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s6) var(--s12); }
}
@media (min-width: 1100px) {
  .cs-meta { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
.cs-meta__cell { display: flex; flex-direction: column; gap: var(--s2); min-width: 0; }
.cs-meta__key {
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.cs-meta__value { margin: 0; color: var(--fg); font-size: var(--text-sm); line-height: 1.45; }
.cs-meta__tags { display: flex; flex-wrap: wrap; gap: var(--s2); list-style: none; margin: 0; padding: 0; }
.cs-meta__tag-link { text-decoration: none; }
.cs-meta__nda { max-width: 46ch; flex: 1 1 24rem; min-width: 0; }
.cs-meta__markers {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s4);
  margin-bottom: var(--s6);
}

/* THE ABOVE-THE-FOLD CONTRACT.
   The three metrics sit beside the headline from 1024px up rather than under
   it, so they are on the first screen without shrinking the h1. DOM order is
   unchanged (metadata bar, headline, metrics) because that order is the
   template and a screen reader follows the DOM, not the grid. */
.cs-hero { display: grid; gap: var(--s12); margin-top: var(--s8); }
@media (min-width: 1024px) {
  .cs-hero {
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    gap: var(--s16);
    align-items: start;
  }
}
.cs-hero__main { min-width: 0; }
.cs-hero__results { min-width: 0; }

/* ---------------- headline ---------------- */
.cs-headline {
  margin: 0;
  font-size: var(--text-2xl);
  line-height: var(--leading-snug);
  max-width: 24ch;
}
@media (min-width: 768px) { .cs-headline { font-size: var(--text-3xl); max-width: 20ch; } }
@media (min-width: 1024px) { .cs-headline { font-size: var(--text-4xl); max-width: 16ch; } }

.cs-results__key { margin: 0 0 var(--s4); }

/* ---------------- two-column band ---------------- */
.cs-band { display: grid; gap: var(--s8); }
@media (min-width: 1024px) {
  .cs-band { grid-template-columns: minmax(0, 18rem) minmax(0, 1fr); gap: var(--s16); align-items: start; }
}
.cs-band__head { display: flex; flex-direction: column; gap: var(--s3); }
.cs-band__title { margin: 0; font-size: var(--text-2xl); }
.cs-band__hint { margin: 0; font-size: var(--text-sm); color: var(--muted); max-width: 34ch; }

/* ---------------- approach ---------------- */
.cs-phases { list-style: none; margin: 0; padding: 0; }
.cs-phases > li { border-top: 1px solid var(--border); padding-block: var(--s6); }
.cs-phases > li:last-child { border-bottom: 1px solid var(--border); }
.cs-phase { display: grid; gap: var(--s3); }
@media (min-width: 640px) { .cs-phase { grid-template-columns: 3rem minmax(0, 1fr); gap: var(--s4); } }
.cs-phase__n {
  font-size: var(--text-sm);
  color: var(--accent);
  letter-spacing: 0.06em;
  line-height: 1.6;
}
.cs-phase__name { margin: 0; font-size: var(--text-lg); font-weight: 500; line-height: var(--leading-snug); color: var(--fg); }
.cs-phase__body { margin: var(--s2) 0 0; color: var(--muted-strong); max-width: 68ch; }

/* ---------------- quote ---------------- */
.cs-quote { display: grid; gap: var(--s8); }
@media (min-width: 900px) { .cs-quote { grid-template-columns: 2.5rem minmax(0, 1fr); gap: var(--s8); align-items: start; } }
.cs-quote__mark { color: var(--border-strong); }
.cs-quote__text {
  margin: 0;
  font-size: var(--text-xl);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
  max-width: 28ch;
}
@media (min-width: 768px) { .cs-quote__text { font-size: var(--text-2xl); max-width: 26ch; } }
.cs-quote__attr { display: flex; align-items: center; gap: var(--s4); margin-top: var(--s8); }
.cs-quote__name { margin: 0; font-size: var(--text-base); font-weight: 500; color: var(--fg); }
.cs-quote__role { margin: 0; font-size: var(--text-sm); color: var(--muted); }

/* ---------------- engagement facts ---------------- */
.cs-facts { display: grid; gap: var(--s8); list-style: none; margin: 0; padding: 0; }
@media (min-width: 900px) { .cs-facts { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s12); } }
.cs-fact { display: flex; flex-direction: column; gap: var(--s3); min-width: 0; }
.cs-fact__key { display: inline-flex; align-items: center; gap: var(--s2); }
.cs-fact__body { margin: 0; color: var(--muted-strong); font-size: var(--text-sm); line-height: 1.55; }
.cs-fact__chips { display: flex; flex-wrap: wrap; gap: var(--s2); list-style: none; margin: 0; padding: 0; }
.cs-fact__timeline { margin: 0; font-size: var(--text-sm); line-height: 1.7; color: var(--muted-strong); overflow-wrap: break-word; }

/* ---------------- console exhibits ----------------
   One stacked band per placement, with the argument on the left and the drawn
   console on the right from 1000px. The gap between placements is large on
   purpose: two dense consoles 24px apart read as one confused screenshot. */
.cs-consoles { display: grid; gap: var(--s24); }
.cs-console { display: grid; gap: var(--s8); align-items: start; }
@media (min-width: 1000px) {
  .cs-console { grid-template-columns: minmax(0, 7fr) minmax(0, 12fr); gap: var(--s12); }
}
.cs-console__say { min-width: 0; }
.cs-console__title { margin: var(--s3) 0 0; font-size: var(--text-xl); }
.cs-console__body { margin: var(--s4) 0 0; color: var(--muted-strong); max-width: 48ch; }
.cs-console__art { min-width: 0; }

/* ---------------- related ---------------- */
.cs-related { display: grid; gap: var(--s6); list-style: none; margin: 0; padding: 0; }
@media (min-width: 768px) { .cs-related { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1100px) { .cs-related { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

@media print {
  .cs-meta, .cs-phases > li { break-inside: avoid; }
}
`

export const dynamicParams = false

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }))
}

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const study = caseStudiesBySlug[slug]
  if (!study) return { title: 'Case study not found', robots: { index: false, follow: true } }

  const description = study.challenge.slice(0, 300)

  return {
    title: study.headline,
    description,
    alternates: { canonical: `/case-studies/${study.slug}` },
    openGraph: {
      type: 'article',
      title: study.headline,
      description,
      url: `${site.url}/case-studies/${study.slug}`,
    },
    twitter: { card: 'summary_large_image', title: study.headline, description },
  }
}

/** JSON-LD that cannot break out of the script element. */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const study = caseStudiesBySlug[slug]
  if (!study) notFound()

  const label = clientLabel(study)
  const url = `${site.url}/case-studies/${study.slug}`
  const serviceNames = study.services.map((s) => servicesBySlug[s]?.name ?? s)
  const consoles = studyConsoles(study.slug)
  const related = study.related
    .map((s) => caseStudiesBySlug[s])
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: study.headline,
        description: study.challenge.slice(0, 300),
        articleSection: 'Case study',
        inLanguage: 'en-GB',
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        about: { '@type': 'Thing', name: study.industry },
        keywords: serviceNames.join(', '),
        isAccessibleForFree: true,
        publisher: { '@id': `${site.url}/#organization` },
        author: { '@id': `${site.url}/#organization` },
        citation: study.metrics.map((m) => `${m.value}, ${m.label}${m.note ? ` (${m.note})` : ''}`),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: site.url },
          { '@type': 'ListItem', position: 2, name: 'Case studies', item: `${site.url}/case-studies` },
          { '@type': 'ListItem', position: 3, name: study.headline, item: url },
        ],
      },
    ],
  }

  return (
    <>
      <style href="envenox-case-study-page" precedence="default">
        {CSS}
      </style>
      <ProofStyles />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      {/* ---------- 1. metadata bar → headline → three metrics, above the fold ---------- */}
      <Section theme="dark" grain offsetNav aria-labelledby="cs-headline">
        <nav className="cs-breadcrumb u-mono" aria-label="Breadcrumb">
          <ol>
            <li>
              <Link href="/">Envenox</Link>
            </li>
            <li>
              <Link href="/case-studies">Case studies</Link>
            </li>
            <li aria-current="page">{study.industry}</li>
          </ol>
        </nav>

        <div className="cs-meta">
          <div className="cs-meta__cell">
            <span className="cs-meta__key u-mono">Client</span>
            <p className="cs-meta__value">{label}</p>
          </div>
          <div className="cs-meta__cell">
            <span className="cs-meta__key u-mono">Industry</span>
            <p className="cs-meta__value">
              {study.industry} · {study.country}
            </p>
          </div>
          <div className="cs-meta__cell">
            <span className="cs-meta__key u-mono">Services used</span>
            <ul className="cs-meta__tags">
              {study.services.map((s) => {
                const svc = servicesBySlug[s]
                return (
                  <li key={s}>
                    {svc ? (
                      <Link href={`/services/${svc.slug}`} className="cs-meta__tag-link">
                        <Badge variant="neutral">{svc.short ?? svc.name}</Badge>
                      </Link>
                    ) : (
                      <Badge variant="neutral">{s}</Badge>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="cs-meta__cell">
            <span className="cs-meta__key u-mono">Engagement</span>
            <p className="cs-meta__value">
              {study.engagementLength} · {study.engagementType}
            </p>
          </div>
        </div>

        <div className="cs-hero">
          <div className="cs-hero__main">
            {study.client === null || study.dualPillar ? (
              <div className="cs-meta__markers">
                {study.client === null && study.anonymisedAs ? (
                  <div className="cs-meta__nda">
                    <NdaBlock
                      anonymisedAs={study.anonymisedAs}
                      note="Metrics, technical detail and the attributed quote are published with written client approval. The name is not."
                    />
                  </div>
                ) : null}
                {study.dualPillar ? <DualPillarMarker /> : null}
              </div>
            ) : null}

            <h1 id="cs-headline" className="cs-headline">
              {study.headline}
            </h1>
          </div>

          {/* The three metrics stay above the fold, and each is now DRAWN from
              its own figure as well as typeset: a before-and-after pair, a
              share, a severity split, a value against a stated commitment.
              Where a metric is a single count it is left as a number, because
              one number is not a chart. */}
          <div className="cs-hero__results">
            <p className="u-eyebrow cs-results__key">Results</p>
            <MetricChart study={study} stack />
          </div>
        </div>
      </Section>

      {/* ---------- 2. the challenge, then the approach in phases ---------- */}
      <Section theme="deep" aria-labelledby="cs-challenge">
        <div className="cs-band">
          <div className="cs-band__head">
            <h2 id="cs-challenge" className="cs-band__title">
              The challenge
            </h2>
          </div>
          <Prose>
            <p>{study.challenge}</p>
          </Prose>
        </div>

        <div className="cs-band" style={{ marginTop: 'var(--s24)' }}>
          <div className="cs-band__head">
            <p className="u-eyebrow">In {study.approach.length} phases</p>
            <h2 id="cs-approach" className="cs-band__title">
              The approach
            </h2>
          </div>
          <RevealGroup as="ol" className="cs-phases" aria-labelledby="cs-approach">
            {study.approach.map((phase) => (
              <Reveal as="li" key={phase.n}>
                <div className="cs-phase">
                  <p className="cs-phase__n u-mono u-tnum">
                    {String(phase.n).padStart(2, '0')}
                  </p>
                  <div>
                    <h3 className="cs-phase__name">{phase.name}</h3>
                    <p className="cs-phase__body">{phase.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* ---------- 3. the named client quote ---------- */}
      <Section theme="light" aria-label={`What ${study.quote.company} said`}>
        <figure className="cs-quote" style={{ margin: 0 }}>
          <Quote className="cs-quote__mark" size={32} strokeWidth={1.5} absoluteStrokeWidth aria-hidden="true" />
          <div>
            <blockquote className="cs-quote__text">{study.quote.text}</blockquote>
            <figcaption className="cs-quote__attr">
              <AvatarPlaceholder name={study.quote.name} size={56} />
              <div>
                <p className="cs-quote__name">{study.quote.name}</p>
                <p className="cs-quote__role">
                  {study.quote.role} · {study.quote.company}
                </p>
              </div>
            </figcaption>
          </div>
        </figure>
      </Section>

      {/* ---------- 4. THE TECHNICAL LAYER, the credibility. Never cut. ---------- */}
      <Section theme="dark" grain aria-labelledby="cs-technical">
        <div className="cs-band">
          <div className="cs-band__head">
            <h2 id="cs-technical" className="cs-band__title">
              The technical layer
            </h2>
            <p className="cs-band__hint">What we actually found or built.</p>
          </div>
          <Prose>
            <p>{study.technicalLayer}</p>
          </Prose>
        </div>
      </Section>

      {/* ---------- 4b. the consoles, where the subject matter supports one ---------- */}
      {consoles.length ? (
        <Section theme="light" aria-labelledby="cs-consoles">
          <h2 id="cs-consoles" className="cs-band__title" style={{ marginBottom: 'var(--s4)' }}>
            What the work looked like on screen
          </h2>
          <p className="cs-band__hint" style={{ maxWidth: '68ch', marginBottom: 'var(--s16)' }}>
            Drawn rather than screenshotted. These stand in for platforms we operate and do not
            own, so the data on them is illustrative, the density, the columns and the decisions
            recorded on them are the real ones.
          </p>
          <div className="cs-consoles">
            {consoles.map((placement) => (
              <div className="cs-console" key={placement.key}>
                <div className="cs-console__say">
                  <p className="u-eyebrow">{placement.eyebrow}</p>
                  <h3 className="cs-console__title">{placement.title}</h3>
                  <p className="cs-console__body">{placement.body}</p>
                </div>
                <div className="cs-console__art">{placement.node}</div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ---------- 5. the engagement in time ---------- */}
      <Section theme="dark" aria-labelledby="cs-timeline">
        <div className="cs-band">
          <div className="cs-band__head">
            <h2 id="cs-timeline" className="cs-band__title">
              The engagement in time
            </h2>
            <p className="cs-band__hint">
              {`${study.engagementLength} · ${study.engagementType}`}
            </p>
          </div>
          <EngagementBand study={study} />
        </div>
      </Section>

      {/* ---------- 6. tech and tools, team shape ---------- */}
      <Section theme="deep" tight aria-labelledby="cs-engagement">
        <h2 id="cs-engagement" className="u-eyebrow" style={{ marginBottom: 'var(--s8)' }}>
          The engagement
        </h2>
        <ul className="cs-facts">
          <li className="cs-fact">
            <h3 className="cs-fact__key u-eyebrow">
              <Layers size={14} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
              Tech and tools
            </h3>
            <ul className="cs-fact__chips" aria-label="Stack and tooling">
              {study.stack.map((item) => (
                <li key={item}>
                  <Badge variant="neutral">{item}</Badge>
                </li>
              ))}
            </ul>
          </li>
          <li className="cs-fact">
            <h3 className="cs-fact__key u-eyebrow">
              <Users size={14} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
              Team shape
            </h3>
            <p className="cs-fact__body">{study.team}</p>
          </li>
          <li className="cs-fact">
            <h3 className="cs-fact__key u-eyebrow">
              <Clock size={14} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
              Length and shape
            </h3>
            {/* The phase-by-phase timeline is drawn in full in the band above;
                repeating the raw string here would be the same sentence twice. */}
            <p className="cs-fact__body">
              {`${study.engagementLength} · ${study.engagementType} · ${study.approach.length} phases`}
            </p>
          </li>
        </ul>
      </Section>

      {/* ---------- 7. related case studies ---------- */}
      {related.length > 0 ? (
        <Section theme="dark" aria-labelledby="cs-related">
          <h2 id="cs-related" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--s8)' }}>
            Related case studies
          </h2>
          <RevealGroup as="ul" className="cs-related">
            {related.map((item) => (
              <Reveal as="li" key={item.slug}>
                <CaseStudyCard study={item} />
              </Reveal>
            ))}
          </RevealGroup>
          <p style={{ marginTop: 'var(--s8)' }}>
            <Link href="/case-studies" className="u-link">
              All case studies
            </Link>
            {' · '}
            <Link href="/sample-report" className="u-link">
              Walk a sample report
            </Link>
          </p>
        </Section>
      ) : null}

      {/* ---------- 8. CTA, with named human beings ---------- */}
      <Section theme="light" aria-labelledby="cs-cta">
        <NamedContactsCta id="cs-cta">
          <Button
            href="/sample-report"
            variant="secondary"
            size="lg"
            iconRight={<ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />}
          >
            Walk the report
          </Button>
          <Button href="/customers" variant="ghost" size="lg">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s2)' }}>
              <MapPin size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
              Who we work with
            </span>
          </Button>
        </NamedContactsCta>
      </Section>
    </>
  )
}
