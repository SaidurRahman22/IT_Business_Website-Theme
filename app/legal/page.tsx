import type { Metadata } from 'next'
import Link from 'next/link'
import { Bug, ListTree, ShieldCheck } from 'lucide-react'

import { legalDocs } from '@/lib/legal'
import { site } from '@/lib/site'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { Breadcrumbs, JsonLd, breadcrumbList } from '../contact/_shared/seo'
import { DraftFlag, LegalStyles } from './_shared/legal-ui'

export const metadata: Metadata = {
  title: 'Legal and system pages',
  description:
    'Privacy, cookies, terms, accessibility and vulnerability disclosure, with the review status of each stated rather than implied.',
  alternates: { canonical: '/legal' },
}

/**
 * /legal - the index.
 *
 * It states the review status of every document on the list rather than
 * presenting five equally finished pages. Three of the five are drafts; a
 * reader deciding whether to rely on one should be able to see that before
 * opening it, not after.
 */

const drafts = legalDocs.filter((d) => d.needsLegalReview)
const published = legalDocs.filter((d) => !d.needsLegalReview)

export default function LegalIndexPage() {
  return (
    <>
      <LegalStyles />
      <JsonLd data={breadcrumbList([{ name: 'Legal', path: '/legal' }])} />

      <Section theme="dark" grain offsetNav aria-labelledby="legal-index-h1">
        <Breadcrumbs trail={[{ name: 'Legal', path: '/legal' }]} />

        <p className="u-eyebrow" style={{ marginTop: 'var(--s8)' }}>
          Legal and system pages
        </p>
        <h1
          id="legal-index-h1"
          style={{ fontSize: 'clamp(2.25rem, 5.4vw, 4rem)', marginTop: 'var(--s4)', maxWidth: '18ch' }}
        >
          Five documents, and which of them you can rely on
        </h1>
        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {published.length} are published as written. {drafts.length} are structurally complete
          drafts awaiting review by counsel, and each one says so at the top of the page rather
          than in small print at the bottom. Publishing a draft privacy notice as if it were final
          describes someone else’s data processing, which is inaccurate in the most literal sense.
        </p>

        <ul className="lg-index">
          {legalDocs.map((doc) => (
            <li key={doc.slug}>
              <Link href={`/legal/${doc.slug}`}>
                <p className="lg-index__title">
                  {doc.title}
                  {doc.needsLegalReview ? <DraftFlag /> : null}
                </p>
                <p className="lg-index__summary">{doc.summary}</p>
                <p className="lg-index__date">
                  Last updated <time dateTime={doc.lastUpdated}>{doc.lastUpdated}</time>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section theme="deep" tight aria-labelledby="legal-related-h2">
        <h2 id="legal-related-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          Related
        </h2>
        <ul className="lg-siblings">
          <li>
            <Card as="div" padding="md">
              <p className="lg-index__title" style={{ fontSize: 'var(--text-lg)' }}>
                <Bug size={18} aria-hidden="true" />
                <Link className="u-link" href="/report-issue">
                  Report a security issue
                </Link>
              </p>
              <p className="lg-index__summary" style={{ marginTop: 'var(--s2)', fontSize: 'var(--text-sm)' }}>
                The intake form, the direct mailbox and the commitments, summarised from the
                disclosure policy. No NDA, no account.
              </p>
            </Card>
          </li>
          <li>
            <Card as="div" padding="md">
              <p className="lg-index__title" style={{ fontSize: 'var(--text-lg)' }}>
                <ShieldCheck size={18} aria-hidden="true" />
                <Link className="u-link" href="/trust">
                  Trust centre
                </Link>
              </p>
              <p className="lg-index__summary" style={{ marginTop: 'var(--s2)', fontSize: 'var(--text-sm)' }}>
                Our own security posture, the sub-processor list and where data is held —
                published rather than described on request.
              </p>
            </Card>
          </li>
          <li>
            <Card as="div" padding="md">
              <p className="lg-index__title" style={{ fontSize: 'var(--text-lg)' }}>
                <ListTree size={18} aria-hidden="true" />
                <Link className="u-link" href="/sitemap">
                  Site map
                </Link>
              </p>
              <p className="lg-index__summary" style={{ marginTop: 'var(--s2)', fontSize: 'var(--text-sm)' }}>
                Every page on {site.domain} in one list, grouped, for when the navigation is not
                the fastest way to find something.
              </p>
            </Card>
          </li>
        </ul>
      </Section>
    </>
  )
}
