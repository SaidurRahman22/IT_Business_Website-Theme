import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, CircleAlert, Printer } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Faq } from '@/components/ui/Faq'
import { Section } from '@/components/ui/Section'
import { Stat } from '@/components/ui/Stat'
import { reportFaqs, reportSections, sampleReportIntro } from '@/lib/sample-report'
import { site } from '@/lib/site'
import { NamedContactsCta, ProofStyles } from '../case-studies/_components/proof'
import { DocFrame, DocFrameStyles } from './_components/DocFrame'
import { SectionIndex } from './_components/SectionIndex'

/**
 * `/sample-report` - "Anatomy of a report".
 *
 * The highest-leverage page on the site and the one almost nobody builds. A
 * services buyer is asked to commit to a document they have never seen; this
 * page shows the document. Three things carry it:
 *
 *   1. Every excerpt sits in a DOCUMENT FRAME - a paper sheet with a running
 *      header, not a blockquote. See _components/DocFrame.tsx.
 *   2. Section 6 is a full finding, and the "WHAT WE WOULD NOT DO" block is
 *      pulled out of the excerpt into its own panel. A vendor stating what it
 *      would refuse to do is the most persuasive thing on the page.
 *   3. The disclaimer is visible in the body AND repeated in the sticky chrome,
 *      in the rail and at the top of the mobile strip, because an illustrative
 *      document that is only labelled once gets screenshotted without the label.
 *
 * ChapterOpener is used ONCE here. That is the third and final instance of the
 * sitewide ration of three; the reserved slot named in the component's own
 * header is "/about or the sample report walkthrough", and this is it.
 */

const CANONICAL = `${site.url}/sample-report`

export const metadata: Metadata = {
  title: 'Sample report, anatomy of a penetration test report',
  description: sampleReportIntro.lead.slice(0, 300),
  alternates: { canonical: '/sample-report' },
  openGraph: {
    type: 'article',
    title: `${sampleReportIntro.heading} · ${site.name}`,
    description: sampleReportIntro.disclaimer,
    url: CANONICAL,
  },
  twitter: {
    card: 'summary_large_image',
    title: sampleReportIntro.heading,
    description: sampleReportIntro.disclaimer,
  },
}

const CSS = `
/* ---------------- hero ---------------- */
.sr-stats {
  display: grid;
  gap: var(--s6);
  list-style: none;
  margin: var(--s12) 0 0;
  padding: 0;
}
@media (min-width: 640px) { .sr-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s8); } }
.sr-stats > li { min-width: 0; }

.sr-disclaimer {
  display: flex;
  align-items: flex-start;
  gap: var(--s3);
  margin-top: var(--s12);
  max-width: 68ch;
  border: 1px solid color-mix(in oklab, var(--accent) 40%, transparent);
  background-color: color-mix(in oklab, var(--accent) 10%, transparent);
  border-radius: var(--radius-md);
  padding: var(--s4);
}
.sr-disclaimer__icon { color: var(--accent); flex: none; margin-top: 3px; }
.sr-disclaimer p { margin: 0; font-size: var(--text-sm); line-height: 1.6; color: var(--fg); }

.sr-actions { display: flex; flex-wrap: wrap; gap: var(--s3); margin-top: var(--s8); }
.sr-print { margin: var(--s4) 0 0; font-size: var(--text-xs); color: var(--muted); display: inline-flex; align-items: center; gap: var(--s2); }

/* ---------------- sticky strip (narrow viewports) ---------------- */
.sr-strip {
  position: sticky;
  top: var(--nav-h);
  z-index: 20;
  margin-inline: calc(var(--gutter) * -1);
  margin-bottom: var(--s8);
  padding: var(--s2) var(--gutter);
  background-color: var(--bg);
  border-bottom: 1px solid var(--border);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}
@media (min-width: 1024px) { .sr-strip { display: none; } }

/* ---------------- layout ---------------- */
.sr-layout { display: grid; gap: var(--s12); }
@media (min-width: 1024px) {
  .sr-layout { grid-template-columns: minmax(0, 16rem) minmax(0, 1fr); gap: var(--s16); align-items: start; }
}
.sr-body { display: grid; gap: var(--s20); min-width: 0; }

/* ---------------- one report section ---------------- */
.sr-section { scroll-margin-top: calc(var(--nav-h) + var(--s8)); min-width: 0; }
.sr-section__n {
  margin: 0 0 var(--s2);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.sr-section__title {
  margin: 0;
  font-size: var(--text-xl);
  line-height: var(--leading-snug);
}
@media (min-width: 768px) { .sr-section__title { font-size: var(--text-2xl); } }
.sr-section[data-feature='true'] .sr-section__title { font-size: var(--text-2xl); }
@media (min-width: 768px) {
  .sr-section[data-feature='true'] .sr-section__title { font-size: var(--text-3xl); }
}

.sr-qa { margin: var(--s6) 0 0; max-width: 68ch; }
.sr-qa dt {
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.sr-qa dd { margin: var(--s2) 0 0; color: var(--muted-strong); line-height: var(--leading-normal); font-size: var(--text-sm); }
@media (min-width: 768px) { .sr-qa dd { font-size: var(--text-base); } }
.sr-qa dd + dt { margin-top: var(--s6); }

.sr-frame { margin-top: var(--s8); }

.sr-foot { margin-top: var(--s20); padding-top: var(--s6); border-top: 1px solid var(--border); }
.sr-foot p { margin: 0; font-size: var(--text-sm); color: var(--muted); }

/* ---------------- print ---------------- */
@media print {
  .sr-layout { display: block; }
  .sr-body { display: block; }
  .sr-section { break-inside: auto; break-after: auto; margin-bottom: 24pt; }
  .sr-section__head { break-after: avoid; }
  .sr-disclaimer { border: 1pt solid currentColor; }
  .sr-actions { display: none; }
}
`

export default function SampleReportPage() {
  const entries = reportSections.map((section) => ({
    n: section.n,
    id: section.id,
    title: section.title,
    pages: section.pages,
  }))

  const stamp = 'Sample report, illustrative'
  const firstSection = reportSections[0]

  return (
    <>
      <style href="envenox-sample-report" precedence="default">
        {CSS}
      </style>
      <ProofStyles />
      <DocFrameStyles />

      {/* ---------- hero ---------- */}
      <Section theme="dark" grain offsetNav aria-labelledby="sr-title">
        {/* Deliberately NOT ChapterOpener. Instrument Serif is rationed to three
            chapter-opener moments sitewide and four pages had claimed one. This
            one has the weakest claim: it is a page title, not a serif line
            opening a chapter mid-narrative. The three that keep it are the
            homepage problem framing, /approach's authored serif moment, and
            /services/devsecops, the page that justifies the company. */}
        <p className="u-eyebrow">{sampleReportIntro.eyebrow}</p>
        <h1
          id="sr-title"
          style={{ fontSize: 'clamp(var(--text-3xl), 5vw, var(--text-5xl))', marginTop: 'var(--s4)', maxWidth: '18ch' }}
        >
          {sampleReportIntro.heading}
        </h1>
        <p
          className="u-measure"
          style={{ marginTop: 'var(--s6)', fontSize: 'var(--text-lg)', color: 'var(--muted-strong)' }}
        >
          {sampleReportIntro.lead}
        </p>

        <ul className="sr-stats" aria-label="What a standard delivery contains">
          {sampleReportIntro.stats.map((stat) => (
            <Stat key={stat.label} as="li" value={stat.value} label={stat.label} size="sm" provenance="none" />
          ))}
        </ul>

        <aside className="sr-disclaimer" aria-label="Disclaimer">
          <CircleAlert
            className="sr-disclaimer__icon"
            size={18}
            strokeWidth={1.75}
            absoluteStrokeWidth
            aria-hidden="true"
          />
          <p>{sampleReportIntro.disclaimer}</p>
        </aside>

        <div className="sr-actions">
          <Button
            href={`#section-${firstSection.id}`}
            variant="primary"
            size="lg"
            iconRight={<ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />}
          >
            {sampleReportIntro.cta}
          </Button>
          <Button href={site.secondaryCta.href} variant="secondary" size="lg">
            {site.secondaryCta.label}
          </Button>
        </div>
        <p className="sr-print">
          <Printer size={14} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
          This page is laid out to print.
        </p>
      </Section>

      {/* ---------- the walkthrough ---------- */}
      <Section theme="deep" id="report-body" aria-labelledby="sr-walk">
        <p className="sr-strip u-mono no-print" aria-hidden="true">
          {stamp}
        </p>

        <h2 id="sr-walk" className="u-eyebrow" style={{ marginBottom: 'var(--s8)' }}>
          The report, section by section
        </h2>

        <div className="sr-layout">
          <SectionIndex
            entries={entries}
            stamp={stamp}
            ariaLabel="Report sections"
            id="report-index"
          />

          <div className="sr-body">
            {reportSections.map((section) => (
              <article
                className="sr-section"
                id={`section-${section.id}`}
                data-section-id={section.id}
                data-feature={section.id === 'finding' ? 'true' : undefined}
                key={section.id}
                aria-labelledby={`title-${section.id}`}
              >
                <header className="sr-section__head">
                  <p className="sr-section__n u-mono u-tnum">
                    Section {String(section.n).padStart(2, '0')} · {section.pages}
                  </p>
                  <h3 id={`title-${section.id}`} className="sr-section__title">
                    {section.title}
                  </h3>
                </header>

                <dl className="sr-qa">
                  <dt>What is in it</dt>
                  <dd>{section.what}</dd>
                  <dt>Why it is in it</dt>
                  <dd>{section.why}</dd>
                </dl>

                {section.excerpt ? (
                  <div className="sr-frame">
                    <DocFrame section={section} stamp={stamp} />
                  </div>
                ) : null}
              </article>
            ))}

            <div className="sr-foot">
              <p>{sampleReportIntro.disclaimer}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- questions ---------- */}
      <Section theme="dark" aria-labelledby="sr-faq">
        <h2 id="sr-faq" style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--s8)' }}>
          Common questions
        </h2>
        <Faq items={reportFaqs} headingLevel={3} />
        <p style={{ marginTop: 'var(--s8)', fontSize: 'var(--text-sm)' }}>
          <Link href="/services/penetration-testing" className="u-link">
            How a penetration test is scoped and run
          </Link>
          {' · '}
          <Link href="/trust" className="u-link">
            What we do with your evidence afterwards
          </Link>
        </p>
      </Section>

      {/* ---------- CTA ---------- */}
      <Section theme="light" aria-labelledby="sr-cta">
        <NamedContactsCta id="sr-cta" />
      </Section>
    </>
  )
}
