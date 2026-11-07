import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, NotebookPen } from 'lucide-react'

import { peopleBySlug } from '@/lib/people'
import { resourceTypesBySlug, resources, type Resource } from '@/lib/resources'
import { servicesBySlug } from '@/lib/services'
import { site } from '@/lib/site'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardLink } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs, JsonLd, ORGANIZATION_REF, breadcrumbList } from '../../contact/_shared/seo'
import {
  ResourceStyles,
  TYPE_ROUTE,
  TYPE_ROUTE_LABEL,
  formatDate,
  resourceHref,
  typeIcon,
} from './resources'

/**
 * The detail page for one resource, shared by /blog/[slug], /research/[slug],
 * /tools/[slug], /methodologies/[slug] and /resources/[slug].
 *
 * ──────────────────────────────────────────────────────────────────────────
 * EVERY RESOURCE IN lib/resources.ts IS `pending: true`.
 *
 * None of the twelve artefacts exists yet. So this page renders what is real -
 * the title, the genuine specific abstract, the named author, the date, the
 * topics, the services it supports - and then says plainly that the piece is
 * being written.
 *
 * It does NOT generate an article body. It does not pad with lorem ipsum (a CI
 * guard hard-fails on that string, and rightly). It does not fake a word count.
 * A page that says exactly what it is and what it will contain is better than
 * fabricated content, and on a site selling security judgement it is the only
 * honest option available.
 *
 * `robots.index` is tied to `pending`, so each page starts unindexed and
 * becomes indexable the moment the artefact lands - no second edit needed.
 * ──────────────────────────────────────────────────────────────────────────
 */

/** What is missing, per type. Used only to describe the artefact accurately. */
function pendingLine(type: string): string {
  switch (type) {
    case 'tool':
      return 'The repository is not public yet.'
    case 'methodology':
    case 'datasheet':
    case 'guide':
      return 'The document is not published yet.'
    case 'webinar':
      return 'The recording is not posted yet.'
    default:
      return 'This piece is still being written.'
  }
}

export function resourceMetadata(resource: Resource): Metadata {
  const href = resourceHref(resource)
  const author = peopleBySlug[resource.author]
  return {
    title: resource.title,
    description: resource.blurb.slice(0, 300),
    alternates: { canonical: href },
    keywords: resource.topics,
    authors: author ? [{ name: author.name, url: `${site.url}/about/leadership/${author.slug}` }] : undefined,
    openGraph: {
      type: 'article',
      title: resource.title,
      description: resource.blurb.slice(0, 300),
      url: href,
      publishedTime: resource.published,
      modifiedTime: resource.updated ?? resource.published,
      authors: author ? [author.name] : undefined,
      tags: resource.topics,
    },
    // Thin by definition while the artefact does not exist. Flips to indexable
    // automatically when `pending` becomes false in lib/resources.ts.
    robots: resource.pending ? { index: false, follow: true } : { index: true, follow: true },
  }
}

export function ResourceDetail({ resource }: { resource: Resource }) {
  const type = resourceTypesBySlug[resource.type]
  const author = peopleBySlug[resource.author]
  const href = resourceHref(resource)
  const listingPath = TYPE_ROUTE[resource.type] ?? '/resources'
  const listingLabel = TYPE_ROUTE_LABEL[resource.type] ?? 'Resources'

  const relatedServices = resource.services
    .map((slug) => servicesBySlug[slug])
    .filter((s) => s !== undefined)

  const sameType = resources
    .filter((r) => r.type === resource.type && r.slug !== resource.slug)
    .slice(0, 2)

  const personId = author ? `${site.url}/about/leadership/${author.slug}#person` : undefined

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Article',
      '@id': `${site.url}${href}#article`,
      headline: resource.title,
      description: resource.blurb,
      url: `${site.url}${href}`,
      datePublished: resource.published,
      dateModified: resource.updated ?? resource.published,
      inLanguage: 'en-GB',
      keywords: resource.topics.join(', '),
      articleSection: type?.label ?? resource.type,
      // Honest in the structured data too: the artefact is not finished.
      ...(resource.pending ? { creativeWorkStatus: 'In progress' } : {}),
      ...(personId ? { author: { '@id': personId } } : {}),
      publisher: ORGANIZATION_REF,
      isPartOf: { '@id': `${site.url}/#website` },
    },
  ]

  if (author && personId) {
    graph.push({
      '@type': 'Person',
      '@id': personId,
      name: author.name,
      jobTitle: author.role,
      url: `${site.url}/about/leadership/${author.slug}`,
      worksFor: ORGANIZATION_REF,
      ...(author.certifications?.length ? { hasCredential: author.certifications } : {}),
      ...(author.linkedin ? { sameAs: [author.linkedin] } : {}),
    })
  }

  return (
    <>
      <ResourceStyles />
      <JsonLd
        data={breadcrumbList([
          { name: 'Resources', path: '/resources' },
          { name: listingLabel, path: listingPath },
          { name: resource.title, path: href },
        ])}
      />
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />

      {/* ---- title, abstract, provenance ---- */}
      <Section theme="dark" grain offsetNav aria-labelledby="rd-h1">
        <Breadcrumbs
          trail={[
            { name: 'Resources', path: '/resources' },
            { name: listingLabel, path: listingPath },
            { name: resource.title, path: href },
          ]}
        />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s2)', marginTop: 'var(--s8)' }}>
          <Badge variant="neutral">
            {typeIcon(resource.type, 12)}
            {type?.label ?? resource.type}
          </Badge>
          {resource.featured ? <Badge variant="brand">Featured</Badge> : null}
          {resource.pending ? <Badge variant="neutral">In progress</Badge> : null}
        </div>

        <h1
          id="rd-h1"
          style={{ fontSize: 'clamp(1.75rem, 4.4vw, 3rem)', marginTop: 'var(--s4)', maxWidth: '22ch' }}
        >
          {resource.title}
        </h1>

        {/* The blurb is a real, specific abstract written for this piece.
            Rendered as the lead, unaltered. */}
        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {resource.blurb}
        </p>

        <dl className="rd__meta">
          <div>
            <dt>Written by</dt>
            <dd>
              {author ? (
                <span className="rd__author">
                  <AvatarPlaceholder name={author.name} size={40} round />
                  <span>
                    <Link href={`/about/leadership/${author.slug}`}>{author.name}</Link>
                    <span>{author.role}</span>
                  </span>
                </span>
              ) : (
                resource.author
              )}
            </dd>
          </div>
          <div>
            <dt>Published</dt>
            <dd>
              <time dateTime={resource.published}>{formatDate(resource.published)}</time>
            </dd>
          </div>
          {resource.updated ? (
            <div>
              <dt>Updated</dt>
              <dd>
                <time dateTime={resource.updated}>{formatDate(resource.updated)}</time>
              </dd>
            </div>
          ) : null}
          <div>
            <dt>Format</dt>
            <dd>{resource.readingTime}</dd>
          </div>
        </dl>

        <ul className="rd__tags">
          {resource.topics.map((topic) => (
            <li key={topic}>
              <Badge variant="neutral">{topic}</Badge>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---- the honest state of the artefact ---- */}
      <Section theme="light" aria-labelledby="rd-state-h2">
        {resource.pending ? (
          <div className="rd__pending">
            <p className="rd__pending-head" id="rd-state-h2">
              <NotebookPen size={22} aria-hidden="true" />
              {pendingLine(resource.type)}
            </p>
            <p>
              The abstract above is not a summary of something written elsewhere. It is the
              specific claim this piece will make, published before the piece exists so you can
              judge whether it is worth your time. What is not here is the body: the data, the
              method and the worked examples.
            </p>
            <p>
              We are not filling this page with generated prose in the meantime. A page of
              plausible text under a real engineer’s name is worse than an empty one, and on a site
              arguing that you should trust our judgement it would be an odd place to start.
            </p>
            <ul>
              <li>
                The author is named above and is a real member of staff, ask them about it
                directly and they will tell you what they would have written.
              </li>
              <li>
                {type?.cta ?? 'Open'} will become the live link on this page the moment the
                artefact lands. The URL will not change.
              </li>
            </ul>

            <div className="rd__actions">
              <Button href="/contact" variant="primary" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
                Ask us about this directly
              </Button>
              <Button href={listingPath} variant="secondary">
                All {listingLabel.toLowerCase()}
              </Button>
            </div>
          </div>
        ) : (
          <p id="rd-state-h2" style={{ color: 'var(--muted)' }}>
            {type?.cta ?? 'Open'}, {resource.readingTime}.
          </p>
        )}
      </Section>

      {/* ---- what this supports ---- */}
      {relatedServices.length > 0 ? (
        <Section theme="deep" tight aria-labelledby="rd-services-h2">
          <h2 id="rd-services-h2" style={{ fontSize: 'var(--text-2xl)' }}>
            The work this comes from
          </h2>
          <ul className="rd__related">
            {relatedServices.map((service) => (
              <li key={service.slug}>
                <Card as="div" padding="md">
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>
                    <CardLink href={`/services/${service.slug}`}>{service.name}</CardLink>
                  </h3>
                  <p style={{ margin: 'var(--s2) 0 0', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                    {service.cardLine}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* ---- more of the same type ---- */}
      {sameType.length > 0 ? (
        <Section theme="dark" grain tight aria-labelledby="rd-more-h2">
          <h2 id="rd-more-h2" style={{ fontSize: 'var(--text-2xl)' }}>
            More {listingLabel.toLowerCase()}
          </h2>
          <ul className="rd__related">
            {sameType.map((other) => (
              <li key={other.slug}>
                <Card as="div" padding="md">
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>
                    <CardLink href={resourceHref(other)}>{other.title}</CardLink>
                  </h3>
                  <p style={{ margin: 'var(--s2) 0 0', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
                    {other.readingTime} · {formatDate(other.published)}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  )
}
