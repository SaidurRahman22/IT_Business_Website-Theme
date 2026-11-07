/**
 * JSON-LD helpers shared by the conversion, legal, system and resource routes.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * WHY THIS LIVES UNDER `app/contact/`
 * `components/**` and `lib/**` are owned by other agents on this build, so a
 * shared helper cannot be added there. `_shared` is an App Router private
 * folder, so it produces no route. RECOMMENDATION: relocate this file to
 * `lib/seo.ts` (or `components/seo/JsonLd.tsx`) once the component-layer owner
 * can accept it, and update the five import sites.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * `app/layout.tsx` already emits Organization + WebSite sitewide. Nothing here
 * re-emits either. BreadcrumbList, Article, Person and ContactPage are
 * additive and safe to stack alongside them.
 */

import { site } from '@/lib/site'

export type Crumb = {
  name: string
  /** Absolute path, e.g. `/resources/identity-path-analysis`. */
  path: string
}

/**
 * One <script type="application/ld+json">.
 *
 * `<` is escaped so a string inside the payload can never terminate the script
 * element early. Same guard as the one in app/layout.tsx.
 */
export function JsonLd({ data, id }: { data: unknown; id?: string }) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

/**
 * BreadcrumbList. Always starts at Home, so callers pass only the trail below
 * it: `breadcrumbList([{ name: 'Resources', path: '/resources' }, …])`.
 */
export function breadcrumbList(trail: Crumb[]) {
  const items: Crumb[] = [{ name: 'Home', path: '/' }, ...trail]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path === '/' ? '' : crumb.path}`,
    })),
  }
}

/** The Organization node every other node on the site points at. */
export const ORGANIZATION_REF = { '@id': `${site.url}/#organization` } as const

/**
 * A visible breadcrumb trail to sit alongside the structured data. Markup only
 * - an ordered list of real anchors, with the current page as plain text.
 */
const CSS = `
.crumbs { font-size: var(--text-sm); color: var(--muted); }
.crumbs ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s2);
  list-style: none;
  margin: 0;
  padding: 0;
}
.crumbs li { display: flex; align-items: center; gap: var(--s2); min-width: 0; }
.crumbs a { color: var(--muted); text-decoration: none; }
.crumbs a:hover { color: var(--fg); }
.crumbs__sep { color: var(--border-strong); }
.crumbs [aria-current='page'] { color: var(--muted-strong); }
`

export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const items: Crumb[] = [{ name: 'Home', path: '/' }, ...trail]
  return (
    <>
      <style href="envenox-crumbs" precedence="default">
        {CSS}
      </style>
      <nav className="crumbs" aria-label="Breadcrumb">
        <ol>
          {items.map((crumb, i) => {
            const last = i === items.length - 1
            return (
              <li key={crumb.path}>
                {i > 0 ? (
                  <span className="crumbs__sep" aria-hidden="true">
                    /
                  </span>
                ) : null}
                {last ? (
                  <span aria-current="page">{crumb.name}</span>
                ) : (
                  <a className="u-link" href={crumb.path}>
                    {crumb.name}
                  </a>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
