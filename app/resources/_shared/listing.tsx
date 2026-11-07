import Link from 'next/link'

import { resourceTypesBySlug, resources } from '@/lib/resources'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs, JsonLd, breadcrumbList } from '../../contact/_shared/seo'
import {
  ResourceGrid,
  ResourceStyles,
  TYPE_ROUTE,
  TYPE_ROUTE_LABEL,
  sortResources,
  typeIcon,
} from './resources'

/**
 * The shared listing for /blog, /research, /tools and /methodologies.
 *
 * Each is a filtered view over the same `resources` array, so a resource added
 * to lib/resources.ts appears in its listing, in the hub, and at its detail URL
 * without any route being touched.
 *
 * The cross-navigation row is real links with `aria-current`, not a tab widget:
 * every view is its own URL, works with scripting off, and can be linked to.
 */

export function TypeListing({ type: typeSlug }: { type: string }) {
  const type = resourceTypesBySlug[typeSlug]
  const path = TYPE_ROUTE[typeSlug] ?? '/resources'
  const label = TYPE_ROUTE_LABEL[typeSlug] ?? type?.plural ?? 'Resources'
  const list = sortResources(resources.filter((r) => r.type === typeSlug))
  const pending = list.filter((r) => r.pending).length

  return (
    <>
      <ResourceStyles />
      <JsonLd
        data={breadcrumbList([
          { name: 'Resources', path: '/resources' },
          { name: label, path },
        ])}
      />

      <Section theme="dark" grain offsetNav aria-labelledby="rl-h1">
        <Breadcrumbs
          trail={[
            { name: 'Resources', path: '/resources' },
            { name: label, path },
          ]}
        />

        <p className="u-eyebrow" style={{ marginTop: 'var(--s8)' }}>
          Resources
        </p>
        <h1
          id="rl-h1"
          style={{ fontSize: 'clamp(2.25rem, 5.4vw, 4rem)', marginTop: 'var(--s4)', maxWidth: '18ch' }}
        >
          {label}
        </h1>
        {type ? (
          <p
            className="u-measure"
            style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
          >
            {type.description}
          </p>
        ) : null}

        {/* Cross-navigation. Real links, one URL per view. */}
        <div className="rf">
          <nav aria-label="Resource types">
            <ul className="rf__list">
              <li>
                <Link className="rf__chip" href="/resources">
                  All resources
                  <span className="rf__count">{resources.length}</span>
                </Link>
              </li>
              {Object.keys(TYPE_ROUTE).map((slug) => {
                const count = resources.filter((r) => r.type === slug).length
                return (
                  <li key={slug}>
                    <Link
                      className="rf__chip"
                      href={TYPE_ROUTE[slug]}
                      aria-current={slug === typeSlug ? 'true' : undefined}
                    >
                      {typeIcon(slug)}
                      {TYPE_ROUTE_LABEL[slug]}
                      <span className="rf__count">{count}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <p className="rf__status" role="status">
            <span>
              Showing <strong>{list.length}</strong> of <strong>{list.length}</strong>{' '}
              {list.length === 1 ? 'item' : 'items'}
              {pending > 0 ? (
                <>
                  {' '}
                 , <strong>{pending}</strong> still being written, and each one says so on its own
                  page.
                </>
              ) : (
                '.'
              )}
            </span>
          </p>
        </div>

        <ResourceGrid resources={list} />
      </Section>
    </>
  )
}
