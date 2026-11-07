'use client'

import { useEffect, useState } from 'react'

/**
 * The walkable index.
 *
 * SERVER HTML FIRST: this renders a complete, ordinary anchor list on the
 * server. Scripting adds one thing - `aria-current="true"` on whichever section
 * is in view - and nothing else. With JavaScript off the rail is still sticky
 * (CSS), every anchor still works, and the only thing missing is the highlight.
 * The disclaimer rides in the rail because the rail is the page's sticky chrome
 * and the stamp has to be visible wherever the reader is.
 *
 * MOTION: the active state is a colour change and a hairline marker colour
 * change. Nothing moves, nothing scales, so there is nothing for
 * prefers-reduced-motion to suppress.
 */

const CSS = `
.rail { position: static; }
@media (min-width: 1024px) {
  .rail {
    position: sticky;
    top: calc(var(--nav-h) + var(--s6));
    align-self: start;
  }
}
.rail__stamp {
  display: block;
  font-size: var(--text-xs);
  line-height: 1.5;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent);
  padding-bottom: var(--s3);
  margin-bottom: var(--s3);
  border-bottom: 1px solid var(--border);
}
.rail__key { margin: 0 0 var(--s3); }
.rail__list { list-style: none; margin: 0; padding: 0; }
.rail__item + .rail__item { margin-top: 1px; }
.rail__link {
  display: flex;
  gap: var(--s3);
  align-items: baseline;
  padding: var(--s2) var(--s3);
  border-left: 1px solid var(--border);
  color: var(--muted);
  font-size: var(--text-sm);
  line-height: 1.35;
  text-decoration: none;
  /* Colour only. */
  transition:
    color var(--dur-micro) var(--ease-out),
    border-color var(--dur-micro) var(--ease-out),
    background-color var(--dur-micro) var(--ease-out);
}
.rail__link:hover { color: var(--fg); border-left-color: var(--border-strong); background-color: var(--surface); }
.rail__link[aria-current='true'] { color: var(--fg); border-left-color: var(--accent); }
.rail__n { flex: none; font-size: var(--text-xs); color: var(--muted); font-variant-numeric: tabular-nums; }
.rail__link[aria-current='true'] .rail__n { color: var(--accent); }
.rail__pages { display: block; font-size: var(--text-xs); color: var(--muted); }

@media print {
  .rail { display: none; }
}
`

export type IndexEntry = { n: number; id: string; title: string; pages: string }

export function SectionIndex({
  entries,
  stamp,
  ariaLabel,
  id,
}: {
  entries: readonly IndexEntry[]
  /** Repeated in the sticky chrome: "Sample report - illustrative". */
  stamp: string
  ariaLabel: string
  id?: string
}) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return

    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const sectionId = record.target.getAttribute('data-section-id')
          if (!sectionId) continue
          if (record.isIntersecting) visible.add(sectionId)
          else visible.delete(sectionId)
        }
        // The first entry in document order that is currently in view.
        const next = entries.find((entry) => visible.has(entry.id))
        if (next) setActiveId(next.id)
      },
      // Discount the fixed nav at the top and the bottom two thirds of the
      // viewport, so "active" means "at the top of the reading area".
      { rootMargin: '-96px 0px -66% 0px', threshold: 0 },
    )

    const targets = entries
      .map((entry) => document.getElementById(`section-${entry.id}`))
      .filter((node): node is HTMLElement => node !== null)

    for (const target of targets) observer.observe(target)
    return () => observer.disconnect()
  }, [entries])

  return (
    <>
      <style href="envenox-report-rail" precedence="default">
        {CSS}
      </style>
      <nav className="rail" aria-label={ariaLabel} id={id}>
        <span className="rail__stamp u-mono">{stamp}</span>
        <p className="u-eyebrow rail__key">Sections</p>
        <ol className="rail__list">
          {entries.map((entry) => (
            <li className="rail__item" key={entry.id}>
              <a
                href={`#section-${entry.id}`}
                className="rail__link"
                aria-current={activeId === entry.id ? 'true' : undefined}
              >
                <span className="rail__n u-mono">{String(entry.n).padStart(2, '0')}</span>
                <span>
                  {entry.title}
                  <span className="rail__pages u-mono">{entry.pages}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

export default SectionIndex
