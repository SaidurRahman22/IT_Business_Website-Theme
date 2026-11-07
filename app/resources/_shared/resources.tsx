import { ArrowRight, Download, FileText, FlaskConical, Play, Terminal, Wrench } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { peopleBySlug } from '@/lib/people'
import {
  resourceTypesBySlug,
  type Resource,
  type ResourceType,
} from '@/lib/resources'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Badge } from '@/components/ui/Badge'
import { Card, CardLink } from '@/components/ui/Card'

/**
 * Shared presentation for the resources hub and its four filtered views.
 *
 * THE VERB-MATCHED CTA
 *   Every card's call to action comes from `resourceTypes[].cta` - "Read
 *   methodology", "Download datasheet", "Watch webinar", "View tool". Not
 *   "Learn more" on all twelve. The consistency reads as competence; its
 *   absence reads as a template, and a buyer notices the second one without
 *   being able to say why.
 *
 * NO-JAVASCRIPT FILTERING
 *   The type filter is a row of real <a href="/resources/type/…"> links,
 *   server-side from searchParams. No state, no client component, no hydration
 *   dependency - and every filtered view is a linkable, shareable, crawlable
 *   URL rather than a transient UI state.
 */

/* ------------------------------------------------------------------ *
 * Routing
 * ------------------------------------------------------------------ */

/**
 * The four types that have their own listing route. Everything else (guides,
 * webinars, datasheets) lives under /resources/<slug>, so no resource is ever
 * reachable from the hub without a detail page to land on.
 */
export const TYPE_ROUTE: Record<string, string> = {
  insight: '/blog',
  research: '/research',
  tool: '/tools',
  methodology: '/methodologies',
}

export const TYPE_ROUTE_LABEL: Record<string, string> = {
  insight: 'Insights',
  research: 'Research & Labs',
  tool: 'Open-source tools',
  methodology: 'Methodologies',
}

/** Canonical detail URL for a resource. */
export function resourceHref(resource: Resource): string {
  return `${TYPE_ROUTE[resource.type] ?? '/resources'}/${resource.slug}`
}

/** Icon per type. Decorative - the type's word is always rendered as text. */
export function typeIcon(type: string, size = 14): ReactNode {
  const props = { size, 'aria-hidden': true as const }
  switch (type) {
    case 'research':
      return <FlaskConical {...props} />
    case 'methodology':
      return <FileText {...props} />
    case 'tool':
      return <Terminal {...props} />
    case 'datasheet':
      return <Download {...props} />
    case 'webinar':
      return <Play {...props} />
    case 'guide':
      return <Wrench {...props} />
    default:
      return <FileText {...props} />
  }
}

/** 2026-09-18 → 18 Sep 2026. Server-rendered, so the locale cannot drift. */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/* ------------------------------------------------------------------ *
 * Styles
 * ------------------------------------------------------------------ */

const CSS = `
/* ---- the filter bar ---- */
.rf { display: grid; gap: var(--s4); margin-top: var(--s8); }
.rf__list { display: flex; flex-wrap: wrap; gap: var(--s2); list-style: none; margin: 0; padding: 0; }
.rf__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  min-height: 36px;
  padding: var(--s2) var(--s4);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1;
  color: var(--muted-strong);
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    color var(--dur-base) var(--ease-out);
}
.rf__chip:hover { color: var(--fg); background-color: var(--surface); border-color: var(--fg); }
.rf__chip[aria-current='true'] {
  background-color: var(--fg);
  border-color: var(--fg);
  color: var(--bg);
}
.rf__chip[aria-current='true']:hover { background-color: var(--fg); color: var(--bg); }
.rf__count {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
}
.rf__status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s2) var(--s4);
  margin: 0;
  padding-top: var(--s4);
  border-top: 1px solid var(--border);
  font-size: var(--text-sm);
  color: var(--muted);
}
.rf__status strong { color: var(--fg); font-weight: 600; font-variant-numeric: tabular-nums; }
.rf__clear {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  color: var(--muted-strong);
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-out);
}
.rf__clear:hover { color: var(--fg); }

/* ---- the grid ---- */
.rgrid { list-style: none; margin: var(--s8) 0 0; padding: 0; display: grid; gap: var(--s4); }
@media (min-width: 720px) { .rgrid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1100px) { .rgrid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.rgrid > li { display: grid; min-width: 0; }
.rgrid .card { height: 100%; display: grid; grid-template-rows: auto auto 1fr auto; gap: var(--s3); }

.rc__top { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s2); }
.rc__meta {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--muted);
}
.rc__title {
  margin: 0;
  font-size: var(--text-lg);
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
}
.rc__title a { color: var(--fg); }
.rc__blurb {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.55;
  color: var(--muted);
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rc__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  padding-top: var(--s4);
  border-top: 1px solid var(--border);
}
.rc__author { display: flex; align-items: center; gap: var(--s2); min-width: 0; font-size: var(--text-xs); color: var(--muted); }
.rc__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fg);
  white-space: nowrap;
}
.rc__cta svg { flex: none; }

/* ---- empty state ---- */
.rempty {
  margin-top: var(--s8);
  padding: var(--s12) var(--s6);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
  color: var(--muted);
}
.rempty p { margin: 0 auto; max-width: 48ch; }
.rempty p + p { margin-top: var(--s4); }

/* ---- detail page ---- */
.rd__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s4) var(--s8);
  margin: var(--s8) 0 0;
  padding-top: var(--s6);
  border-top: 1px solid var(--border);
}
.rd__meta dt {
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.rd__meta dd { margin: var(--s2) 0 0; color: var(--fg); font-size: var(--text-sm); }
.rd__author { display: flex; align-items: center; gap: var(--s3); }
.rd__author a { color: var(--fg); text-decoration: none; }
.rd__author a:hover { color: var(--accent); }
.rd__author span { display: block; font-size: var(--text-xs); color: var(--muted); }

.rd__pending {
  margin-top: var(--s8);
  padding: var(--s8);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  background-color: var(--surface);
}
.rd__pending-head {
  display: flex;
  align-items: center;
  gap: var(--s3);
  flex-wrap: wrap;
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
}
.rd__pending p { margin: var(--s4) 0 0; color: var(--muted-strong); max-width: 64ch; }
.rd__pending ul { margin: var(--s4) 0 0; padding-left: var(--s4); color: var(--muted); font-size: var(--text-sm); max-width: 64ch; }
.rd__pending li + li { margin-top: var(--s2); }
.rd__actions { display: flex; flex-wrap: wrap; gap: var(--s4); margin-top: var(--s8); }

.rd__tags { display: flex; flex-wrap: wrap; gap: var(--s2); margin: var(--s4) 0 0; padding: 0; list-style: none; }
.rd__related { list-style: none; margin: var(--s8) 0 0; padding: 0; display: grid; gap: var(--s4); }
@media (min-width: 768px) { .rd__related { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.rd__related > li { display: grid; }
.rd__related .card { height: 100%; }
`

export function ResourceStyles() {
  return (
    <style href="envenox-resources" precedence="default">
      {CSS}
    </style>
  )
}

/* ------------------------------------------------------------------ *
 * The filter bar - real links, read server-side
 * ------------------------------------------------------------------ */

export type FilterOption = { slug: string; label: string; count: number }

export function TypeFilterBar({
  basePath,
  options,
  active,
  shown,
  total,
  noun = 'resources',
}: {
  basePath: string
  options: FilterOption[]
  /** The active type slug, or null for "all". */
  active: string | null
  shown: number
  total: number
  noun?: string
}) {
  const activeOption = options.find((o) => o.slug === active)

  return (
    <div className="rf">
      <nav aria-label="Filter by type">
        <ul className="rf__list">
          <li>
            <Link
              className="rf__chip"
              href={basePath}
              aria-current={active === null ? 'true' : undefined}
            >
              All
              <span className="rf__count">{total}</span>
            </Link>
          </li>
          {options.map((option) => (
            <li key={option.slug}>
              <Link
                className="rf__chip"
                href={`${basePath}/type/${option.slug}`}
                aria-current={active === option.slug ? 'true' : undefined}
              >
                {typeIcon(option.slug)}
                {option.label}
                <span className="rf__count">{option.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* The result count is part of the control, not decoration: without it a
          filter that returns nothing is indistinguishable from a broken page. */}
      <p className="rf__status" role="status">
        <span>
          Showing <strong>{shown}</strong> of <strong>{total}</strong> {noun}
          {activeOption ? ` in ${activeOption.label.toLowerCase()}` : ''}.
        </span>
        {active !== null ? (
          <Link className="rf__clear u-link" href={basePath}>
            Clear filter
          </Link>
        ) : null}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * A resource card
 * ------------------------------------------------------------------ */

export function ResourceCard({ resource }: { resource: Resource }) {
  const type = resourceTypesBySlug[resource.type]
  const author = peopleBySlug[resource.author]

  return (
    <Card as="article" padding="md">
      <div className="rc__top">
        <Badge variant="neutral">
          {typeIcon(resource.type, 12)}
          {type?.label ?? resource.type}
        </Badge>
        {resource.featured ? <Badge variant="brand">Featured</Badge> : null}
        <span className="rc__meta">{resource.readingTime}</span>
      </div>

      <h3 className="rc__title">
        <CardLink href={resourceHref(resource)}>{resource.title}</CardLink>
      </h3>

      <p className="rc__blurb">{resource.blurb}</p>

      <div className="rc__foot">
        <span className="rc__author">
          {author ? (
            <>
              <AvatarPlaceholder name={author.name} size={24} round />
              {author.name}
            </>
          ) : (
            <>{resource.author}</>
          )}
          {' · '}
          <time dateTime={resource.published}>{formatDate(resource.published)}</time>
        </span>

        {/* The verb-matched CTA, straight from the type. Not a link of its own —
            the CardLink above already stretches over the whole surface, so a
            second anchor here would read as a second destination. */}
        <span className="rc__cta">
          {type?.cta ?? 'Open'}
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ *
 * The grid
 * ------------------------------------------------------------------ */

/** Featured first, then newest first. Stable across rebuilds. */
export function sortResources(list: Resource[]): Resource[] {
  return [...list].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return a.published < b.published ? 1 : a.published > b.published ? -1 : 0
  })
}

export function ResourceGrid({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) {
    return (
      <div className="rempty">
        <p>Nothing is published under that filter yet.</p>
        <p>
          <Link className="u-link" href="/resources">
            Clear the filter
          </Link>{' '}
          to see everything, or{' '}
          <Link className="u-link" href="/contact">
            ask us directly
          </Link>{' '}
         , if you want something written about, that is usually how it gets written.
        </p>
      </div>
    )
  }

  return (
    <ul className="rgrid">
      {resources.map((resource) => (
        <li key={resource.slug}>
          <ResourceCard resource={resource} />
        </li>
      ))}
    </ul>
  )
}

/** Read and validate `?type=` against the real type list. */
export function activeType(
  raw: string | string[] | undefined,
  allowed: ResourceType[],
): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return null
  return allowed.some((t) => t.slug === value) ? value : null
}
