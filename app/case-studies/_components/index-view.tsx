'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Marquee, type MarqueeItem } from '@/components/ui/Marquee'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { StatBar } from '@/components/ui/StatBar'
import { caseStudies, caseStudyCorpus, caseStudyFacets } from '@/lib/case-studies'
import type { CaseStudy } from '@/lib/case-studies'
import { clients, testimonials } from '@/lib/proof'
import { servicesBySlug } from '@/lib/services'
import { headlineStats, site } from '@/lib/site'
import { CaseStudyCard, NamedContactsCta, ProofStyles, TestimonialRail } from './proof'

/**
 * The case study index body.
 *
 * WHAT CHANGED, AND WHAT IT COST
 *
 * This page was built so that filtering worked with scripting disabled: every
 * facet was a real <a href> carrying search params, read on the server, with no
 * state and nothing to hydrate. A static export has no server to read those
 * params on, and the four facets plus pagination produce several hundred
 * combinations, which is far too many to prerender as individual files.
 *
 * So filtering now happens in the browser, and this is a real regression against
 * the original design. It is mitigated rather than hidden:
 *
 * - The static HTML carries the real, unfiltered first page of results - the
 *   same set the server used to render for an unfiltered request, PAGE_SIZE
 *   included. With scripting disabled a visitor sees real case studies rather
 *   than an empty list, and a crawler indexes them from the file. Results beyond
 *   page 1 need scripting, exactly as `?page=2` previously needed a server.
 * - The facets are still real <a href> links carrying the same search params, so
 *   every filtered view keeps its own shareable, bookmarkable URL.
 * - Only the narrowing is lost without scripting, never the content.
 *
 * The single-facet views could be restored as prerendered routes the way
 * /resources/type/[type] was, if no-JS filtering is wanted back.
 */

const PAGE_SIZE = 4

const CSS = `
/* ---------------- hero ---------------- */
.csi-hero__figure {
  display: flex;
  align-items: baseline;
  gap: var(--s4);
  flex-wrap: wrap;
  margin: var(--s4) 0 0;
}
.csi-hero__count {
  margin: 0;
  font-size: var(--text-4xl);
  line-height: 1;
  letter-spacing: var(--tracking-tight);
}
@media (min-width: 768px) { .csi-hero__count { font-size: var(--text-5xl); } }
.csi-hero__note { margin: 0; font-size: var(--text-sm); color: var(--muted); }
.csi-hero__lead { margin: var(--s6) 0 0; color: var(--muted-strong); max-width: 56ch; }

/* ---------------- filters ---------------- */
.filters { display: grid; gap: var(--s6); }
.filters__group { display: grid; gap: var(--s3); }
.filters__row { display: flex; flex-wrap: wrap; gap: var(--s2); list-style: none; margin: 0; padding: 0; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  min-height: 32px;
  padding: var(--s1) var(--s3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: var(--muted-strong);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.2;
  text-decoration: none;
  /* Colour only - no lift, no scale. */
  transition:
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    color var(--dur-base) var(--ease-out);
}
.chip:hover { background-color: var(--surface); border-color: var(--border-strong); color: var(--fg); }
.chip[aria-current='true'] {
  background-color: color-mix(in oklab, var(--accent) 14%, transparent);
  border-color: color-mix(in oklab, var(--accent) 42%, transparent);
  color: var(--accent);
}
.chip__x { flex: none; }

/* ---------------- results header ---------------- */
.results-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s4);
  margin-top: var(--s12);
  padding-top: var(--s4);
  border-top: 1px solid var(--border);
}
.results-count { margin: 0; font-size: var(--text-sm); color: var(--muted-strong); }
.results-count strong { color: var(--fg); font-weight: 600; }
.results-clear {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  min-height: 32px;
  font-size: var(--text-sm);
  color: var(--muted);
  text-decoration: none;
  transition: color var(--dur-micro) var(--ease-out);
}
.results-clear:hover { color: var(--fg); }

.csi-empty { margin: var(--s8) 0 0; color: var(--muted-strong); }

/* ---------------- grids ---------------- */
.csi-grid { display: grid; gap: var(--s6); list-style: none; margin: var(--s8) 0 0; padding: 0; }
@media (min-width: 768px) { .csi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1100px) { .csi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.csi-featured { display: grid; gap: var(--s6); list-style: none; margin: var(--s8) 0 0; padding: 0; }
@media (min-width: 900px) { .csi-featured { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.csi-more { display: flex; justify-content: center; margin-top: var(--s12); }

.csi-wall__head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: var(--s4); margin-bottom: var(--s6); }
.csi-stats { margin-top: var(--s16); }
`

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  return v && v.length > 0 ? v : undefined
}

type Query = {
  service?: string
  industry?: string
  location?: string
  type?: string
  page?: string
}

function hrefFor(query: Query, patch: Partial<Query>): string {
  const next: Query = { ...query, ...patch }
  const params = new URLSearchParams()
  for (const key of ['service', 'industry', 'location', 'type', 'page'] as const) {
    const value = next[key]
    if (value) params.set(key, value)
  }
  const qs = params.toString()
  return `/case-studies${qs ? `?${qs}` : ''}#results`
}

function matches(study: CaseStudy, query: Query): boolean {
  if (query.service && !study.services.includes(query.service)) return false
  if (query.industry && study.industry !== query.industry) return false
  if (query.location && study.country !== query.location) return false
  if (query.type && study.engagementType !== query.type) return false
  return true
}

const serviceLabel = (slug: string) => servicesBySlug[slug]?.short ?? servicesBySlug[slug]?.name ?? slug

type Facet = { key: keyof Omit<Query, 'page'>; legend: string; values: readonly string[]; label: (v: string) => string }

const FACETS: Facet[] = [
  { key: 'service', legend: 'Service', values: caseStudyFacets.service, label: serviceLabel },
  { key: 'industry', legend: 'Industry', values: caseStudyFacets.industry, label: (v) => v },
  { key: 'location', legend: 'Location', values: caseStudyFacets.country, label: (v) => v },
  { key: 'type', legend: 'Engagement type', values: caseStudyFacets.engagementType, label: (v) => v },
]

function FilterGroup({ facet, query }: { facet: Facet; query: Query }) {
  const active = query[facet.key]
  const legendId = `filter-${facet.key}`

  return (
    <div className="filters__group" role="group" aria-labelledby={legendId}>
      <p id={legendId} className="u-eyebrow">
        {facet.legend}
      </p>
      <ul className="filters__row">
        <li>
          <Link
            href={hrefFor(query, { [facet.key]: undefined, page: undefined } as Partial<Query>)}
            className="chip"
            aria-current={active ? undefined : 'true'}
          >
            All
          </Link>
        </li>
        {facet.values.map((value) => {
          const isActive = active === value
          return (
            <li key={value}>
              <Link
                href={hrefFor(query, {
                  [facet.key]: isActive ? undefined : value,
                  page: undefined,
                } as Partial<Query>)}
                className="chip"
                aria-current={isActive ? 'true' : undefined}
              >
                {facet.label(value)}
                {isActive ? (
                  <X className="chip__x" size={12} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * The rendered index for a given set of facets.
 *
 * Takes `sp` as a prop and calls no hooks, so it can be PRERENDERED. page.tsx
 * renders it with empty facets as the Suspense fallback, which is what puts the
 * complete, unfiltered list of case studies into the static HTML for crawlers
 * and for visitors with scripting disabled.
 */
export function CaseStudiesIndexBody({ sp }: { sp: SearchParams }) {

  const query: Query = {
    service: first(sp.service),
    industry: first(sp.industry),
    location: first(sp.location),
    type: first(sp.type),
    page: first(sp.page),
  }

  // Unknown facet values are dropped rather than returning an empty page for a
  // hand-typed or stale URL.
  if (query.service && !caseStudyFacets.service.includes(query.service)) query.service = undefined
  if (query.industry && !caseStudyFacets.industry.includes(query.industry)) query.industry = undefined
  if (query.location && !caseStudyFacets.country.includes(query.location)) query.location = undefined
  // `engagementType` is a literal union array, so widen before the membership test.
  if (query.type && !(caseStudyFacets.engagementType as readonly string[]).includes(query.type))
    query.type = undefined

  const filtered = caseStudies.filter((study) => matches(study, query))
  const filterCount = [query.service, query.industry, query.location, query.type].filter(Boolean).length
  const isFiltered = filterCount > 0

  const pageNumber = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1)
  const shown = filtered.slice(0, pageNumber * PAGE_SIZE)
  const hasMore = shown.length < filtered.length

  const featured = caseStudies.filter((study) => study.featured).slice(0, 3)

  const wall: MarqueeItem[] = clients.map((client) => ({
    label: client.label,
    meta: client.industry,
  }))

  const activeChips: { key: keyof Omit<Query, 'page'>; legend: string; value: string; label: string }[] = FACETS
    .filter((facet) => Boolean(query[facet.key]))
    .map((facet) => {
      const value = query[facet.key] as string
      return { key: facet.key, legend: facet.legend, value, label: facet.label(value) }
    })

  return (
    <>
      <style href="envenox-case-studies-index" precedence="default">
        {CSS}
      </style>
      <ProofStyles />

      {/* ---------- hero, with the corpus number ---------- */}
      <Section theme="dark" grain offsetNav aria-labelledby="csi-title">
        <p className="u-eyebrow">Proof</p>
        <div className="csi-hero__figure">
          <h1 id="csi-title" className="csi-hero__count u-tnum">
            {caseStudyCorpus.total} stories
          </h1>
          <p className="csi-hero__note u-mono">
            {caseStudyCorpus.published} published in full on this site
          </p>
        </div>
        <p className="csi-hero__lead">{site.positioning}</p>
      </Section>

      {/* ---------- client logo wall + stats bar ---------- */}
      <Section theme="deep" bleed tight aria-labelledby="csi-clients">
        <div className="u-container">
          <div className="csi-wall__head">
            <h2 id="csi-clients" className="u-eyebrow">
              Selected clients
            </h2>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
              <Link href="/customers" className="u-link">
                Who we work with, tiered by what each client has agreed to
              </Link>
            </p>
          </div>
        </div>

        <Marquee items={wall} ariaLabel="Selected clients" duration="58s" />

        <div className="u-container csi-stats">
          <StatBar stats={headlineStats} ariaLabel="Envenox at a glance" columns={4} size="md" />
        </div>
      </Section>

      {/* ---------- filters → featured → grid → load more ---------- */}
      <Section theme="dark" id="results" aria-labelledby="csi-filters">
        <h2 id="csi-filters" className="u-eyebrow" style={{ marginBottom: 'var(--s6)' }}>
          Filter the work
        </h2>

        <div className="filters">
          {FACETS.map((facet) => (
            <FilterGroup key={facet.key} facet={facet} query={query} />
          ))}
        </div>

        <div className="results-head">
          <p className="results-count" role="status">
            <strong className="u-tnum">{filtered.length}</strong>
            {filtered.length === 1 ? ' story' : ' stories'}
            {isFiltered ? (
              <>
                {' matching '}
                {activeChips.map((chip, index) => (
                  <span key={chip.key}>
                    {index > 0 ? ' · ' : ''}
                    <span className="u-mono">
                      {chip.legend}: {chip.label}
                    </span>
                  </span>
                ))}
              </>
            ) : null}
          </p>

          {isFiltered ? (
            <Link href="/case-studies#results" className="results-clear">
              <X size={14} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
              Clear {filterCount === 1 ? 'filter' : 'all filters'}
            </Link>
          ) : null}
        </div>

        {/* Featured is an editorial pick across the whole corpus, so it is
            suppressed while a filter is active rather than silently ignoring
            the filter the visitor just set. */}
        {!isFiltered ? (
          <>
            <h3 className="u-eyebrow" style={{ marginTop: 'var(--s12)' }}>
              Featured
            </h3>
            <RevealGroup as="ul" className="csi-featured">
              {featured.map((study) => (
                <Reveal as="li" key={study.slug}>
                  <CaseStudyCard study={study} />
                </Reveal>
              ))}
            </RevealGroup>
            <h3 className="u-eyebrow" style={{ marginTop: 'var(--s24)' }}>
              All stories
            </h3>
          </>
        ) : null}

        {shown.length > 0 ? (
          <RevealGroup as="ul" className="csi-grid">
            {shown.map((study) => (
              <Reveal as="li" key={study.slug}>
                <CaseStudyCard study={study} />
              </Reveal>
            ))}
          </RevealGroup>
        ) : (
          <p className="csi-empty">
            Nothing matches that combination.{' '}
            <Link href="/case-studies#results" className="u-link">
              Clear the filters
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="u-link">
              ask us directly
            </Link>
            .
          </p>
        )}

        {hasMore ? (
          <div className="csi-more">
            <Button
              href={hrefFor(query, { page: String(pageNumber + 1) })}
              variant="secondary"
              size="lg"
              iconLeft={<Plus size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />}
            >
              Load more, showing {shown.length} of {filtered.length}
            </Button>
          </div>
        ) : null}
      </Section>

      {/* ---------- testimonial carousel ---------- */}
      <Section theme="deep" aria-labelledby="csi-voices">
        <h2 id="csi-voices" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--s8)' }}>
          In their words
        </h2>
        <Reveal>
          <TestimonialRail items={testimonials} ariaLabel="Client testimonials" />
        </Reveal>
      </Section>

      {/* ---------- CTA, with named human beings ---------- */}
      <Section theme="light" aria-labelledby="csi-cta">
        <NamedContactsCta id="csi-cta">
          <Button
            href="/sample-report"
            variant="secondary"
            size="lg"
            iconRight={<ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />}
          >
            Walk the report
          </Button>
        </NamedContactsCta>
      </Section>
    </>
  )
}

/**
 * The live, URL-driven index.
 *
 * useSearchParams() suspends during prerender, so this component contributes
 * nothing to the static HTML - CaseStudiesIndexBody, rendered as the Suspense
 * fallback, is what ships in the file. This takes over on hydration and applies
 * whatever facets the URL carries.
 */
export function CaseStudiesIndexView() {
  const read = useSearchParams()
  return <CaseStudiesIndexBody sp={Object.fromEntries(read.entries())} />
}
