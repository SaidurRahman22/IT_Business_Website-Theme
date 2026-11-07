import { TriangleAlert } from 'lucide-react'
import type { LegalDoc } from '@/lib/legal'

/**
 * Presentation for the legal documents.
 *
 * THE DRAFT BANNER IS THE POINT OF THIS FILE.
 *
 * Three of the five documents carry `needsLegalReview: true`. A privacy notice
 * published as if it were final describes processing the company may not
 * actually do, which is inaccurate in the most literal sense and is worse than
 * publishing no page at all. So the banner is not a footnote and not small
 * print: it is above the document, full width, 2px bordered, with its own
 * heading, and it is the first thing after the title.
 *
 * It uses --fg and --surface rather than --signal-critical. The semantic
 * palette belongs to product UI and severity labels (components/ui/Badge.tsx);
 * a red band here would be the loudest non-severity use of severity colour on
 * the site. Weight, border and placement carry it instead.
 */

const CSS = `
.lg-draft {
  margin-top: var(--s8);
  padding: var(--s6);
  border: 2px solid var(--fg);
  border-radius: var(--radius-md);
  background-color: var(--surface);
}
@media (min-width: 768px) { .lg-draft { padding: var(--s6) var(--s8); } }
.lg-draft__head {
  display: flex;
  align-items: center;
  gap: var(--s3);
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
}
.lg-draft__head svg { flex: none; }
.lg-draft p { margin: var(--s3) 0 0; color: var(--muted-strong); max-width: 70ch; }
.lg-draft p + p { margin-top: var(--s2); }
.lg-draft strong { color: var(--fg); font-weight: 600; }

/* ---- the document frame ---- */
.lg-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s2) var(--s6);
  margin: var(--s8) 0 0;
  padding-top: var(--s4);
  border-top: 1px solid var(--border);
  font-size: var(--text-sm);
  color: var(--muted);
}
.lg-meta dt {
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.lg-meta dd {
  margin: var(--s1) 0 0;
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--fg);
  font-variant-numeric: tabular-nums;
}

.lg-body { display: grid; gap: var(--s12); }
@media (min-width: 1000px) {
  .lg-body { grid-template-columns: 240px minmax(0, 1fr); gap: var(--s16); align-items: start; }
}
.lg-toc { position: sticky; top: calc(var(--nav-h) + var(--s6)); align-self: start; }
.lg-toc h2 {
  margin: 0 0 var(--s4);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.lg-toc ol { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s2); counter-reset: toc; }
.lg-toc li { counter-increment: toc; }
.lg-toc a {
  display: grid;
  grid-template-columns: 2.2em minmax(0, 1fr);
  gap: var(--s2);
  font-size: var(--text-sm);
  line-height: 1.4;
  color: var(--muted);
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-out);
}
.lg-toc a::before {
  content: counter(toc, decimal-leading-zero);
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--border-strong);
}
.lg-toc a:hover { color: var(--fg); }

/* ---- the index ---- */
.lg-index { list-style: none; margin: var(--s12) 0 0; padding: 0; display: grid; gap: 0; }
.lg-index > li { border-top: 1px solid var(--border); }
.lg-index > li:last-child { border-bottom: 1px solid var(--border); }
.lg-index a {
  display: grid;
  gap: var(--s2);
  padding: var(--s6) 0;
  text-decoration: none;
  color: inherit;
  transition: background-color var(--dur-base) var(--ease-out);
}
.lg-index a:hover { background-color: var(--surface); }
.lg-index__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s3);
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
}
.lg-index__summary { margin: 0; color: var(--muted); max-width: 72ch; }
.lg-index__date {
  margin: 0;
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.lg-flag {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  border: 1px solid var(--fg);
  border-radius: var(--radius-sm);
  padding: 2px var(--s2);
  font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--fg);
  white-space: nowrap;
}

/* ---- sibling documents ---- */
.lg-siblings { list-style: none; margin: var(--s8) 0 0; padding: 0; display: grid; gap: var(--s4); }
@media (min-width: 768px) { .lg-siblings { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.lg-siblings > li { display: grid; }
.lg-siblings .card { height: 100%; }
`

export function LegalStyles() {
  return (
    <style href="envenox-legal" precedence="default">
      {CSS}
    </style>
  )
}

/** "What we commit to" → "what-we-commit-to". Stable across rebuilds. */
export function anchorFor(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * The draft banner. Rendered only where `needsLegalReview` is true - which, as
 * `lib/legal.ts` stands, is exactly `privacy`, `cookies` and `terms`.
 * `vulnerability-disclosure` and `accessibility` are statements about how this
 * company behaves rather than regulated text, and are publishable as written.
 */
export function DraftBanner({ doc }: { doc: LegalDoc }) {
  if (!doc.needsLegalReview) return null
  return (
    <div className="lg-draft" role="note" aria-labelledby="lg-draft-head">
      <p className="lg-draft__head" id="lg-draft-head">
        <TriangleAlert size={22} aria-hidden="true" />
        Draft, not reviewed by counsel
      </p>
      <p>
        <strong>Do not rely on this document.</strong> It is a structurally complete draft written
        to be reviewed, not publishable text. It has not been checked against this company’s actual
        processing activities, its Record of Processing Activities, or the jurisdictions it
        operates in.
      </p>
      <p>
        It is published in this state deliberately rather than hidden, so that the gap is visible to
        anyone who needs to know about it. If you need the position that will actually bind us, ask
        for it at hello@envenox.com and we will tell you where the review has got to.
      </p>
    </div>
  )
}

/** The badge used beside a draft document's title in lists. */
export function DraftFlag() {
  return (
    <span className="lg-flag">
      <TriangleAlert size={12} aria-hidden="true" />
      Draft, not reviewed by counsel
    </span>
  )
}
