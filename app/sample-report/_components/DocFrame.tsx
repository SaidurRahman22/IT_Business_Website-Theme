import { Badge, type BadgeSeverity } from '@/components/ui/Badge'
import type { ReportSection } from '@/lib/sample-report'

/**
 * The document frame.
 *
 * An excerpt from a deliverable must look like a page of that deliverable, not
 * like a blockquote. So: a paper sheet with a running header carrying the
 * illustrative stamp and the page marker, a hairline rule, and the body set the
 * way the report sets it. The sheet declares `.theme-light` so every colour
 * inside it is still a theme variable - a paper page inside a dark band, with
 * no hex anywhere.
 *
 * FOUR EXCERPT KINDS, FOUR TREATMENTS:
 *   prose  report body type on a measured line length
 *   table  `label|value` pairs as a real <table> with <th scope="row">
 *   code   `.u-mono`, whitespace preserved, horizontal scroll inside a masked
 *          container, and a <pre> that is keyboard-reachable - a scroll region
 *          only a mouse can reach is an accessibility failure, so the <pre>
 *          carries tabindex=0 plus an accessible name
 *   list   a real <ul>; the `IN SCOPE` / `NOT TESTED` / `DEVIATION` prefixes are
 *          rendered as labels, not as shouting
 */

const CSS = `
.doc {
  margin: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--bg);
  color: var(--fg);
  overflow: hidden;
}

.doc__chrome {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--s2) var(--s4);
  padding: var(--s3) var(--s4);
  border-bottom: 1px solid var(--border);
  background-color: var(--surface);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.doc__stamp { display: inline-flex; align-items: center; gap: var(--s2); color: var(--muted); }
.doc__stamp::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--accent);
  flex: none;
}
.doc__pages { color: var(--muted); white-space: nowrap; }

.doc__sheet { padding: var(--s6) var(--s4); }
@media (min-width: 768px) { .doc__sheet { padding: var(--s8); } }
/* Code and table excerpts run to the frame edge so the masked scroll edges sit
   on the frame itself; their inner padding is restored below. */
.doc__sheet--flush { padding-inline: 0; }

/* ---------------- prose ---------------- */
.doc__prose { max-width: 66ch; }
.doc__prose p {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--fg);
}
@media (min-width: 768px) { .doc__prose p { font-size: var(--text-base); } }
.doc__prose p + p { margin-top: var(--s4); }

/* ---------------- table ---------------- */
.doc__scroll {
  position: relative;
  /* Masked edges signal that the content continues past the frame. */
  mask-image: linear-gradient(90deg, transparent 0, #000 var(--s4), #000 calc(100% - var(--s4)), transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 var(--s4), #000 calc(100% - var(--s4)), transparent 100%);
}
.doc__scroll > * {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  padding-inline: var(--s4);
}
@media (min-width: 768px) { .doc__scroll > * { padding-inline: var(--s8); } }
.doc__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
  text-align: left;
}
.doc__table caption {
  caption-side: top;
  text-align: left;
  padding-bottom: var(--s3);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.doc__table th,
.doc__table td {
  padding: var(--s3) var(--s4) var(--s3) 0;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  line-height: 1.5;
}
.doc__table tr:last-child th,
.doc__table tr:last-child td { border-bottom: 0; }
.doc__table th[scope='row'] {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--muted-strong);
  white-space: nowrap;
  padding-right: var(--s6);
}
.doc__table td { color: var(--fg); }

/* ---------------- code ---------------- */
.doc__pre {
  margin: 0;
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-variant-ligatures: none;
  font-size: var(--text-xs);
  line-height: 1.65;
  color: var(--fg);
  white-space: pre;
  tab-size: 2;
}
@media (min-width: 900px) { .doc__pre { font-size: var(--text-sm); } }
.doc__pre:focus-visible { outline-offset: -2px; }

/* ---------------- the refusal block ---------------- */
.doc__refusal {
  margin: var(--s6) var(--s4) 0;
  max-width: 72ch;
  border: 1px solid var(--border-strong);
  border-left: 3px solid var(--accent);
  border-radius: var(--radius-sm);
  background-color: var(--surface);
  padding: var(--s4);
}
.doc__refusal-key {
  display: block;
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--accent);
  margin-bottom: var(--s3);
}
.doc__refusal-body {
  margin: 0;
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-variant-ligatures: none;
  font-size: var(--text-xs);
  line-height: 1.7;
  color: var(--fg);
  max-width: 68ch;
}
@media (min-width: 900px) { .doc__refusal-body { font-size: var(--text-sm); } }
@media (min-width: 768px) {
  .doc__refusal { margin-inline: var(--s8); }
}

/* ---------------- list ---------------- */
.doc__list { list-style: none; margin: 0; padding: 0; max-width: 72ch; }
.doc__list > li { border-top: 1px solid var(--border); padding-block: var(--s4); }
.doc__list > li:first-child { border-top: 0; padding-top: 0; }
.doc__list > li:last-child { padding-bottom: 0; }
.doc__tag {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin-bottom: var(--s2);
  padding: 2px var(--s2);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--muted-strong);
  text-transform: none;
}
.doc__list-body { margin: 0; font-size: var(--text-sm); line-height: 1.65; color: var(--fg); }

/* ---------------- print ---------------- */
@media print {
  .doc { break-inside: avoid; border-color: currentColor; }
  .doc__scroll { mask-image: none; -webkit-mask-image: none; }
  .doc__scroll > * { overflow: visible; }
  .doc__pre { white-space: pre-wrap; }
}
`

export function DocFrameStyles() {
  return (
    <style href="envenox-doc-frame" precedence="default">
      {CSS}
    </style>
  )
}

const SEVERITY_WORDS: Record<string, BadgeSeverity> = {
  Critical: 'critical',
  High: 'high',
  Medium: 'medium',
  Low: 'low',
  Informational: 'info',
}

/** The line that opens the refusal block in section 6's excerpt. */
const REFUSAL_MARKER = 'WHAT WE WOULD NOT DO'

/** `IN SCOPE - …` → ['IN SCOPE', '…']. Only an all-caps prefix counts. */
function splitLabelled(line: string): [string, string] | null {
  const index = line.indexOf(', ')
  if (index <= 0) return null
  const head = line.slice(0, index)
  if (!/^[A-Z][A-Z ]*$/.test(head)) return null
  return [head, line.slice(index + 3)]
}

function Cell({ value }: { value: string }) {
  const severity = SEVERITY_WORDS[value]
  if (severity) return <Badge variant="severity" severity={severity} />
  return <>{value}</>
}

function Excerpt({ section }: { section: ReportSection }) {
  const excerpt = section.excerpt
  if (!excerpt) return null

  if (excerpt.kind === 'prose') {
    return (
      <div className="doc__prose">
        {excerpt.content.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>
    )
  }

  if (excerpt.kind === 'table') {
    const rows = excerpt.content.map((row) => row.split('|'))
    return (
      <div className="doc__scroll">
        <div>
          <table className="doc__table">
            <caption>
              {section.title}, sample report, illustrative
            </caption>
            <tbody>
              {rows.map((cells) => (
                <tr key={cells[0]}>
                  <th scope="row">{cells[0]}</th>
                  {cells.slice(1).map((cell, index) => (
                    <td key={`${cells[0]}-${index}`}>
                      <Cell value={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (excerpt.kind === 'code') {
    const markerAt = excerpt.content.indexOf(REFUSAL_MARKER)
    const hasRefusal = markerAt >= 0
    const body = hasRefusal ? excerpt.content.slice(0, markerAt) : excerpt.content
    // Drop the blank separator line that preceded the marker.
    while (body.length > 0 && body[body.length - 1] === '') body.pop()
    const refusal = hasRefusal ? excerpt.content.slice(markerAt + 1) : []

    return (
      <>
        <div className="doc__scroll">
          <pre
            className="doc__pre u-mono"
            tabIndex={0}
            role="region"
            aria-label={`${section.title}, report excerpt, horizontally scrollable`}
          >
            {body.join('\n')}
          </pre>
        </div>

        {hasRefusal ? (
          <div className="doc__refusal">
            <span className="doc__refusal-key u-mono">{REFUSAL_MARKER}</span>
            {/* The excerpt hard-wraps at the report's column width. On a page
                that reflows, those breaks become orphans, joining restores the
                paragraph without altering a word of it. */}
            <p className="doc__refusal-body">{refusal.join(' ')}</p>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <ul className="doc__list">
      {excerpt.content.map((item) => {
        const labelled = splitLabelled(item)
        return (
          <li key={item.slice(0, 32)}>
            {labelled ? (
              <>
                <span className="doc__tag">{labelled[0]}</span>
                <p className="doc__list-body">{labelled[1]}</p>
              </>
            ) : (
              <p className="doc__list-body">{item}</p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function DocFrame({ section, stamp }: { section: ReportSection; stamp: string }) {
  if (!section.excerpt) return null
  const flush = section.excerpt.kind === 'code' || section.excerpt.kind === 'table'

  return (
    <>
      <DocFrameStyles />
      <figure className="doc theme-light transition-theme">
        <div className="doc__chrome">
          <span className="doc__stamp u-mono">{stamp}</span>
          <span className="doc__pages u-mono">{section.pages}</span>
        </div>
        <div className={flush ? 'doc__sheet doc__sheet--flush' : 'doc__sheet'}>
          <Excerpt section={section} />
        </div>
      </figure>
    </>
  )
}

export default DocFrame
