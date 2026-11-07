import { Fragment } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CalendarCheck } from 'lucide-react'

import { legalDocs, legalDocsBySlug } from '@/lib/legal'
import { site } from '@/lib/site'
import { Card, CardLink } from '@/components/ui/Card'
import { Prose } from '@/components/ui/Prose'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs, JsonLd, ORGANIZATION_REF, breadcrumbList } from '../../contact/_shared/seo'
import { DraftBanner, DraftFlag, LegalStyles, anchorFor } from '../_shared/legal-ui'

/**
 * /legal/[slug] - the five documents in lib/legal.ts.
 *
 * `needsLegalReview` drives a loud, unmissable banner above the document.
 * As lib/legal.ts stands that is `privacy`, `cookies` and `terms`.
 * `vulnerability-disclosure` and `accessibility` are statements about how this
 * company behaves rather than regulated text, and carry no banner.
 *
 * `lastUpdated` is rendered as a dated, machine-readable <time> next to the
 * title, not buried at the foot. A legal page without a visible date tells a
 * reader nothing about whether it describes the company they are dealing with.
 */

export const dynamicParams = false

export function generateStaticParams() {
  return legalDocs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = legalDocsBySlug[slug]
  if (!doc) return { title: 'Legal' }

  return {
    title: doc.title,
    description: doc.summary,
    alternates: { canonical: `/legal/${doc.slug}` },
    openGraph: {
      title: `${doc.title} · ${site.name}`,
      description: doc.summary,
      url: `/legal/${doc.slug}`,
      type: 'article',
      modifiedTime: doc.lastUpdated,
    },
  }
}

/**
 * `public/.well-known/security.txt` publishes
 * `…/legal/vulnerability-disclosure#acknowledgements`. lib/legal.ts has no
 * section by that name, so without this the published fragment would resolve to
 * nothing. The commitments section is where credit is promised, so the anchor
 * is attached there.
 *
 * ⚠ REPORTED, NOT HIDDEN: a real acknowledgements list - the researchers who
 * have reported - does not exist yet. It belongs in lib/legal.ts as its own
 * section once there is one.
 */
const EXTRA_ANCHORS: Record<string, Record<string, string>> = {
  'vulnerability-disclosure': { 'What we commit to': 'acknowledgements' },
}

export default async function LegalDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const doc = legalDocsBySlug[slug]
  if (!doc) notFound()

  const siblings = legalDocs.filter((d) => d.slug !== doc.slug)
  const extras = EXTRA_ANCHORS[doc.slug] ?? {}

  return (
    <>
      <LegalStyles />
      <JsonLd
        data={breadcrumbList([
          { name: 'Legal', path: '/legal' },
          { name: doc.title, path: `/legal/${doc.slug}` },
        ])}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: doc.title,
          description: doc.summary,
          url: `${site.url}/legal/${doc.slug}`,
          dateModified: doc.lastUpdated,
          inLanguage: 'en-GB',
          isPartOf: { '@id': `${site.url}/#website` },
          publisher: ORGANIZATION_REF,
        }}
      />

      {/* ---- title, date, and the draft banner ---- */}
      <Section theme="dark" grain offsetNav tight aria-labelledby="legal-h1">
        <Breadcrumbs
          trail={[
            { name: 'Legal', path: '/legal' },
            { name: doc.title, path: `/legal/${doc.slug}` },
          ]}
        />

        <p className="u-eyebrow" style={{ marginTop: 'var(--s8)' }}>
          Legal
        </p>
        <h1
          id="legal-h1"
          style={{ fontSize: 'clamp(2rem, 4.8vw, 3rem)', marginTop: 'var(--s4)', maxWidth: '20ch' }}
        >
          {doc.title}
        </h1>
        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {doc.summary}
        </p>

        <dl className="lg-meta">
          <div>
            <dt>
              <CalendarCheck
                size={12}
                aria-hidden="true"
                style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: 'var(--s1)' }}
              />
              Last updated
            </dt>
            <dd>
              <time dateTime={doc.lastUpdated}>{doc.lastUpdated}</time>
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{doc.needsLegalReview ? 'Draft, pending review' : 'Published'}</dd>
          </div>
          <div>
            <dt>Applies to</dt>
            <dd>{site.domain}</dd>
          </div>
        </dl>

        <DraftBanner doc={doc} />
      </Section>

      {/* ---- the document ---- */}
      <Section theme="light" aria-label="Document text">
        <div className="lg-body">
          <nav className="lg-toc" aria-labelledby="legal-toc-h">
            <h2 id="legal-toc-h">In this document</h2>
            <ol>
              {doc.sections.map((s) => (
                <li key={s.heading}>
                  <a href={`#${anchorFor(s.heading)}`}>
                    <span>{s.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <Prose wide>
            {doc.sections.map((s) => (
              <Fragment key={s.heading}>
                {extras[s.heading] ? (
                  // A target for the fragment published in security.txt.
                  <span id={extras[s.heading]} />
                ) : null}
                <h2 id={anchorFor(s.heading)}>{s.heading}</h2>
                {s.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
                {s.list?.length ? (
                  <ul>
                    {s.list.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </Fragment>
            ))}
          </Prose>
        </div>
      </Section>

      {/* ---- the other documents ---- */}
      <Section theme="deep" tight aria-labelledby="legal-more-h2">
        <h2 id="legal-more-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          The other documents
        </h2>
        <ul className="lg-siblings">
          {siblings.map((other) => (
            <li key={other.slug}>
              <Card as="div" padding="md">
                <p className="lg-index__title" style={{ fontSize: 'var(--text-lg)' }}>
                  <CardLink href={`/legal/${other.slug}`}>{other.title}</CardLink>
                  {other.needsLegalReview ? <DraftFlag /> : null}
                </p>
                <p className="lg-index__summary" style={{ marginTop: 'var(--s2)', fontSize: 'var(--text-sm)' }}>
                  {other.summary}
                </p>
                <p className="lg-index__date" style={{ marginTop: 'var(--s3)' }}>
                  Last updated <time dateTime={other.lastUpdated}>{other.lastUpdated}</time>
                </p>
              </Card>
            </li>
          ))}
        </ul>

        <p style={{ marginTop: 'var(--s8)' }}>
          <Link className="u-link" href="/legal" style={{ color: 'var(--fg)' }}>
            All legal and system pages
          </Link>{' '}
          <ArrowRight size={14} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-2px' }} />
        </p>
      </Section>
    </>
  )
}
