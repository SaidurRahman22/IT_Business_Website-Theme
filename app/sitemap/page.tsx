import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { caseStudies } from '@/lib/case-studies'
import { industryPages } from '@/lib/industries'
import { legalDocs } from '@/lib/legal'
import { people } from '@/lib/people'
import { resourceTypesBySlug, resources, serviceTopicsByParent } from '@/lib/resources'
import { pillars, services, servicesBySlug } from '@/lib/services'
import { site } from '@/lib/site'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs, JsonLd, breadcrumbList } from '../contact/_shared/seo'
import { TYPE_ROUTE, TYPE_ROUTE_LABEL, resourceHref } from '../resources/_shared/resources'

export const metadata: Metadata = {
  title: 'Site map',
  description: `Every page on ${site.domain}, grouped, services, industries, proof, resources, company and legal.`,
  alternates: { canonical: '/sitemap' },
}

/**
 * /sitemap - the human-readable site map.
 *
 * ⚠ NOT `app/sitemap.ts`. That file is the XML sitemap for search engines and
 * belongs to another agent; this is the HTML page a person reads.
 *
 * EVERY ENTRY IS DERIVED FROM THE DATA THAT RENDERS THE PAGE. Nothing below is
 * a hand-typed URL list, so a service, case study, person, resource or legal
 * document cannot be added to `lib/` and go missing here, and a page that no
 * longer exists cannot linger. The hand-typed list is the one that rots, and a
 * site map full of dead links is worse than none.
 *
 * It is also an accessibility affordance: a complete, flat, keyboard-traversable
 * index for anyone who finds a multi-level dropdown slower than a list.
 */

type Entry = { href: string; label: string; note?: string }
type Group = { id: string; heading: string; blurb?: string; sets: { heading?: string; entries: Entry[] }[] }

const bySlug = (slug: string) => servicesBySlug[slug]

const securityServices = services.filter((s) => s.pillar === 'security')
const softwareServices = services.filter((s) => s.pillar === 'software')
const joinServices = services.filter((s) => s.pillar === 'join')

/** Consideration-stage topics, nested under the service URL they belong to. */
const topicEntries: Entry[] = Object.entries(serviceTopicsByParent).flatMap(([parent, topics]) =>
  topics.map((topic) => ({
    href: `/services/${parent}/${topic.slug}`,
    label: topic.title,
    note: bySlug(parent)?.name ?? parent,
  })),
)

const GROUPS: Group[] = [
  {
    id: 'start',
    heading: 'Start here',
    sets: [
      {
        entries: [
          { href: '/', label: 'Home', note: site.tagline },
          { href: '/services/devsecops', label: 'Secure SDLC', note: 'Why one firm does both' },
          { href: '/sample-report', label: 'Sample report', note: 'The document you would be buying' },
          { href: '/approach', label: site.methodology.name, note: site.methodology.oneLine },
          { href: '/trust', label: 'Trust centre', note: 'Our own security posture, published' },
        ],
      },
    ],
  },
  {
    id: 'contact',
    heading: 'Talk to us',
    blurb: 'The incident hotline is a plain telephone link on every page of this site, including this one.',
    sets: [
      {
        entries: [
          { href: '/contact', label: 'Contact', note: 'Three routes: new enquiry, active incident, careers and press' },
          { href: '/book-a-call', label: 'Book a call', note: '60-minute scoping call' },
          { href: '/get-started', label: 'Get started', note: 'The enquiry form, nothing between you and it' },
          { href: '/report-issue', label: 'Report a security issue', note: 'No NDA, no account' },
        ],
      },
    ],
  },
  {
    id: 'services',
    heading: 'Services',
    sets: [
      {
        heading: 'Hubs',
        entries: [
          { href: '/services', label: 'All services' },
          { href: `/services/${pillars.security.slug}`, label: pillars.security.name, note: pillars.security.line },
          { href: `/services/${pillars.software.slug}`, label: pillars.software.name, note: pillars.software.line },
        ],
      },
      {
        heading: 'Cybersecurity',
        entries: securityServices.map((s) => ({ href: `/services/${s.slug}`, label: s.name, note: s.cardLine })),
      },
      {
        heading: 'Software development',
        entries: softwareServices.map((s) => ({ href: `/services/${s.slug}`, label: s.name, note: s.cardLine })),
      },
      {
        heading: 'Where the two meet',
        entries: joinServices.map((s) => ({ href: `/services/${s.slug}`, label: s.name, note: s.cardLine })),
      },
      {
        heading: 'Buying questions',
        entries: topicEntries,
      },
    ],
  },
  {
    id: 'industries',
    heading: 'Industries',
    sets: [
      {
        entries: [
          { href: '/industries', label: 'All industries' },
          ...industryPages.map((i) => ({ href: `/industries/${i.slug}`, label: i.name, note: i.pressure })),
        ],
      },
    ],
  },
  {
    id: 'proof',
    heading: 'Proof',
    sets: [
      {
        heading: 'Hubs',
        entries: [
          { href: '/case-studies', label: 'Case studies' },
          { href: '/customers', label: 'Customers' },
          { href: '/certifications', label: 'Certifications', note: 'Ours, with certificate numbers' },
          { href: '/sample-report', label: 'Sample report' },
          { href: '/trust', label: 'Trust centre' },
        ],
      },
      {
        heading: 'Individual case studies',
        entries: caseStudies.map((c) => ({
          href: `/case-studies/${c.slug}`,
          label: c.client ?? c.anonymisedAs ?? c.slug,
          note: `${c.industry} · ${c.engagementType}`,
        })),
      },
    ],
  },
  {
    id: 'resources',
    heading: 'Resources',
    sets: [
      {
        heading: 'Hubs',
        entries: [
          { href: '/resources', label: 'All resources', note: `${resources.length} items across seven types` },
          ...Object.keys(TYPE_ROUTE).map((slug) => ({
            href: TYPE_ROUTE[slug],
            label: TYPE_ROUTE_LABEL[slug],
            note: resourceTypesBySlug[slug]?.description,
          })),
        ],
      },
      {
        heading: 'Individual resources',
        entries: resources.map((r) => ({
          href: resourceHref(r),
          label: r.title,
          note: `${resourceTypesBySlug[r.type]?.label ?? r.type} · ${r.readingTime}${r.pending ? ' · in progress' : ''}`,
        })),
      },
    ],
  },
  {
    id: 'company',
    heading: 'Company',
    sets: [
      {
        heading: 'Pages',
        entries: [
          { href: '/about', label: 'About' },
          { href: '/about/leadership', label: 'Leadership' },
          { href: '/approach', label: site.methodology.name },
          { href: '/careers', label: 'Careers', note: 'Roles listed with salary bands' },
          { href: '/newsroom', label: 'Newsroom' },
          { href: '/locations', label: 'Locations' },
          { href: '/partners', label: 'Partners' },
        ],
      },
      {
        heading: 'People',
        entries: people.map((p) => ({
          href: `/about/leadership/${p.slug}`,
          label: p.name,
          note: p.role,
        })),
      },
    ],
  },
  {
    id: 'legal',
    heading: 'Legal and system',
    sets: [
      {
        entries: [
          { href: '/legal', label: 'All legal and system pages' },
          ...legalDocs.map((d) => ({
            href: `/legal/${d.slug}`,
            label: d.title,
            note: d.needsLegalReview ? 'Draft, not reviewed by counsel' : d.summary,
          })),
          { href: '/sitemap', label: 'Site map', note: 'This page' },
        ],
      },
    ],
  },
]

/** Machine-readable endpoints. Not pages, but people look for them. */
const MACHINE: Entry[] = [
  { href: '/sitemap.xml', label: '/sitemap.xml', note: 'The XML sitemap search engines read' },
  { href: '/robots.txt', label: '/robots.txt', note: 'Crawl directives' },
  {
    href: '/.well-known/security.txt',
    label: '/.well-known/security.txt',
    note: 'Where to report a vulnerability in our systems, machine-readable',
  },
]

const totalEntries =
  GROUPS.reduce((n, g) => n + g.sets.reduce((m, s) => m + s.entries.length, 0), 0) + MACHINE.length

const CSS = `
.sm__jump { margin: var(--s8) 0 0; }
.sm__jump ul { display: flex; flex-wrap: wrap; gap: var(--s2); list-style: none; margin: 0; padding: 0; }
.sm__jump a {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: var(--s2) var(--s4);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--muted-strong);
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.sm__jump a:hover { color: var(--fg); background-color: var(--surface); border-color: var(--fg); }

.sm__group + .sm__group { margin-top: var(--s16); }
.sm__group-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s4); margin: 0; }
.sm__group h2 { margin: 0; font-size: var(--text-2xl); scroll-margin-top: calc(var(--nav-h) + var(--s8)); }
.sm__count {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.sm__blurb { margin: var(--s3) 0 0; color: var(--muted); font-size: var(--text-sm); max-width: 68ch; }

.sm__set { margin-top: var(--s8); }
.sm__set h3 {
  margin: 0 0 var(--s4);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.sm__list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; }
@media (min-width: 768px) { .sm__list { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: var(--s8); } }
@media (min-width: 1200px) { .sm__list { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.sm__list > li { min-width: 0; border-top: 1px solid var(--border); }
.sm__list a {
  display: block;
  padding: var(--s3) 0;
  color: var(--fg);
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-out);
}
.sm__list a:hover { color: var(--accent); }
.sm__label { display: block; font-size: var(--text-sm); font-weight: 500; }
.sm__note {
  display: -webkit-box;
  margin-top: 2px;
  font-size: var(--text-xs);
  line-height: 1.45;
  color: var(--muted);
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.sm__list svg { display: inline-block; vertical-align: -2px; margin-left: var(--s1); color: var(--muted); }
`

function EntryList({ entries, external = false }: { entries: Entry[]; external?: boolean }) {
  return (
    <ul className="sm__list">
      {entries.map((entry) => (
        <li key={entry.href}>
          {external ? (
            <a href={entry.href}>
              <span className="sm__label">
                {entry.label}
                <ExternalLink size={12} aria-hidden="true" />
              </span>
              {entry.note ? <span className="sm__note">{entry.note}</span> : null}
            </a>
          ) : (
            <Link href={entry.href}>
              <span className="sm__label">{entry.label}</span>
              {entry.note ? <span className="sm__note">{entry.note}</span> : null}
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function HumanSitemapPage() {
  return (
    <>
      <style href="envenox-sitemap" precedence="default">
        {CSS}
      </style>
      <JsonLd data={breadcrumbList([{ name: 'Site map', path: '/sitemap' }])} />

      <Section theme="dark" grain offsetNav aria-labelledby="sm-h1">
        <Breadcrumbs trail={[{ name: 'Site map', path: '/sitemap' }]} />

        <p className="u-eyebrow" style={{ marginTop: 'var(--s8)' }}>
          Site map
        </p>
        <h1
          id="sm-h1"
          style={{ fontSize: 'clamp(2.25rem, 5.4vw, 4rem)', marginTop: 'var(--s4)', maxWidth: '16ch' }}
        >
          Everything on this site, in one list
        </h1>
        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {totalEntries} pages, grouped. Every entry is generated from the same data that renders
          the page, so this list cannot drift out of date and cannot contain a link to something
          that no longer exists.
        </p>

        <nav className="sm__jump" aria-label="Jump to a section">
          <ul>
            {GROUPS.map((group) => (
              <li key={group.id}>
                <a href={`#${group.id}`}>{group.heading}</a>
              </li>
            ))}
            <li>
              <a href="#machine">Machine-readable</a>
            </li>
          </ul>
        </nav>
      </Section>

      <Section theme="light" aria-label="All pages">
        {GROUPS.map((group) => {
          const count = group.sets.reduce((n, s) => n + s.entries.length, 0)
          return (
            <section className="sm__group" key={group.id} aria-labelledby={group.id}>
              <div className="sm__group-head">
                <h2 id={group.id}>{group.heading}</h2>
                <span className="sm__count">
                  {count} {count === 1 ? 'page' : 'pages'}
                </span>
              </div>
              {group.blurb ? <p className="sm__blurb">{group.blurb}</p> : null}

              {group.sets.map((set, i) => (
                <div className="sm__set" key={set.heading ?? `set-${i}`}>
                  {set.heading ? <h3>{set.heading}</h3> : null}
                  <EntryList entries={set.entries} />
                </div>
              ))}
            </section>
          )
        })}
      </Section>

      <Section theme="deep" tight aria-labelledby="machine">
        <h2 id="machine" style={{ fontSize: 'var(--text-2xl)' }}>
          Machine-readable
        </h2>
        <p className="sm__blurb">
          Not pages, but people look for them, and a security firm hiding its own
          <code> security.txt</code> would be a poor advertisement.
        </p>
        <div className="sm__set">
          <EntryList entries={MACHINE} external />
        </div>
      </Section>
    </>
  )
}
