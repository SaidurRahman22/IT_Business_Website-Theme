import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { resourceTypes, resources } from '@/lib/resources'
import { site } from '@/lib/site'
import { Card, CardLink } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs, JsonLd, ORGANIZATION_REF, breadcrumbList } from '../../contact/_shared/seo'
import {
  ResourceGrid,
  ResourceStyles,
  TYPE_ROUTE,
  TYPE_ROUTE_LABEL,
  TypeFilterBar,
  resourceHref,
  sortResources,
  typeIcon,
} from './resources'

/**
 * /resources - the hub.
 *
 * FILTERS THAT WORK WITHOUT JAVASCRIPT
 *   `?type=research` is a real link, read server-side from searchParams and
 *   validated against the real type list. There is no state, no client
 *   component and nothing to hydrate: every filtered view is its own URL, so it
 *   can be linked, bookmarked, shared and crawled. A visible result count and a
 *   "Clear filter" link complete the control - a filter that silently returns
 *   nothing is indistinguishable from a broken page.
 *
 * VERB-MATCHED CTAs
 *   Every card's call to action is `resourceTypes[].cta`: "Read methodology",
 *   "Download datasheet", "Watch webinar", "View tool". Never "Learn more"
 *   twelve times.
 */

/**
 * The /resources hub body, shared by the unfiltered hub and every filtered view.
 *
 * STATIC EXPORT: filtering used to read `?type=` from searchParams server-side,
 * which a static export cannot do. Each filtered view is now its own prerendered
 * route - /resources/type/research rather than /resources?type=research - so the
 * property the original design cared about is preserved and in fact improved:
 * every view is still a real, linkable, bookmarkable, crawlable URL that works
 * with scripting disabled, and search engines treat a path as a distinct page
 * where they routinely fold query-string variants into one.
 */
export const HUB_DESCRIPTION =
  'Research, methodologies, open-source tools, guides and recorded sessions, the things a buyer reads to decide whether we know what we are talking about.'

export function ResourcesHubView({ active }: { active: string | null }) {

  const options = resourceTypes.map((t) => ({
    slug: t.slug,
    label: t.plural,
    count: resources.filter((r) => r.type === t.slug).length,
  }))

  const filtered = sortResources(
    active ? resources.filter((r) => r.type === active) : [...resources],
  )

  return (
    <>
      <ResourceStyles />
      <JsonLd data={breadcrumbList([{ name: 'Resources', path: '/resources' }])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Resources',
          description: HUB_DESCRIPTION,
          url: `${site.url}/resources`,
          isPartOf: { '@id': `${site.url}/#website` },
          publisher: ORGANIZATION_REF,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: filtered.length,
            itemListElement: filtered.map((resource, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: resource.title,
              url: `${site.url}${resourceHref(resource)}`,
            })),
          },
        }}
      />

      {/* ---- hub ---- */}
      <Section theme="dark" grain offsetNav aria-labelledby="res-h1">
        <Breadcrumbs trail={[{ name: 'Resources', path: '/resources' }]} />

        <p className="u-eyebrow" style={{ marginTop: 'var(--s8)' }}>
          Resources
        </p>
        <h1
          id="res-h1"
          style={{ fontSize: 'clamp(2.25rem, 5.4vw, 4rem)', marginTop: 'var(--s4)', maxWidth: '18ch' }}
        >
          What we publish, and what we publish it for
        </h1>
        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          Findings from our own engagements with the data and the method attached, the
          methodologies we run so you can hold us to them, and the tools we built because we kept
          needing them. One thing on this site sits behind a form, and it is marked as such.
        </p>

        <TypeFilterBar
          basePath="/resources"
          options={options}
          active={active}
          shown={filtered.length}
          total={resources.length}
        />

        <ResourceGrid resources={filtered} />
      </Section>

      {/* ---- what each type is ---- */}
      <Section theme="deep" aria-labelledby="res-types-h2">
        <h2 id="res-types-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          The seven kinds of thing here
        </h2>
        <ul className="rgrid" style={{ marginTop: 'var(--s8)' }}>
          {resourceTypes.map((type) => {
            const count = resources.filter((r) => r.type === type.slug).length
            const href = TYPE_ROUTE[type.slug] ?? `/resources/type/${type.slug}`
            return (
              <li key={type.slug}>
                <Card as="div" padding="md">
                  <h3 className="rc__title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)' }}>
                    {typeIcon(type.slug, 16)}
                    <CardLink href={href}>{TYPE_ROUTE_LABEL[type.slug] ?? type.plural}</CardLink>
                  </h3>
                  <p className="rc__blurb">{type.description}</p>
                  <div className="rc__foot">
                    <span className="rc__meta">
                      {count} {count === 1 ? 'item' : 'items'}
                      {type.gated ? ' · behind a form' : ''}
                    </span>
                    <span className="rc__cta">
                      {type.cta}
                      <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>

        <p style={{ marginTop: 'var(--s8)', color: 'var(--muted)' }}>
          Buying questions (pricing, scoping, which thing to buy first) sit inside the service
          tree rather than here.{' '}
          <Link className="u-link" href="/services" style={{ color: 'var(--fg)' }}>
            Start at services
          </Link>
          .
        </p>
      </Section>
    </>
  )
}
