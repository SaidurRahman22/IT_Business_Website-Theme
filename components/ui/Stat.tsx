'use client'

import { useEffect, useRef } from 'react'
import type { HTMLAttributes, JSX } from 'react'
import { observeOnce } from './Reveal'

/**
 * Stat - one capacity figure.
 *
 * THE HARD RULE: the final value is in the server-rendered HTML as text.
 * A crawler, a link preview, a reader-mode pass and a no-JS visitor all see
 * `240+`, never `0+` and never an empty node. This component is a Client
 * Component purely so the roller can run, but Next still renders it on the
 * server, so `<span class="stat__value">240</span>` ships in the first byte of
 * HTML. Nothing counts up from zero; the enhancement animates FROM the real
 * value that is already on the page.
 *
 * PROVENANCE: `source` and `asOf` render as a <details> affordance. A figure
 * with a citation reads as competence; a figure without one reads as marketing.
 *
 * ---------------------------------------------------------------------------
 * KNOWN CONSTRAINT (reported, not hidden): the sanctioned roller keyframes
 * `outUp` / `inFromBelow` translate by 100% of the strip height. At the figure
 * sizes a headline stat actually uses (--text-3xl and up) that is 40-70px,
 * which breaks the absolute "never animate a distance larger than 32px" rule.
 * The 32px ceiling is non-negotiable, so the roll is measured at mount and
 * suppressed whenever the strip exceeds 32px. In practice it plays at
 * size="sm" and is correctly, deliberately absent at "md" and "lg", where the
 * figure simply renders (and slides 10px if wrapped in <Reveal>). Deleting
 * motion to comply is the intended resolution of that conflict.
 * ---------------------------------------------------------------------------
 */

/** The 32px ceiling from the motion vocabulary (--d-entrance). */
const MAX_ANIMATED_DISTANCE_PX = 32

const CSS = `
.stat { display: flex; flex-direction: column; gap: var(--s2); min-width: 0; }

.stat__figure {
  display: flex;
  align-items: baseline;
  gap: 1px;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
  font-variant-numeric: tabular-nums;
}
.stat--sm .stat__figure { font-size: var(--text-xl); }
.stat--md .stat__figure { font-size: var(--text-3xl); }
.stat--lg .stat__figure { font-size: var(--text-4xl); }
@media (min-width: 768px) {
  .stat--lg .stat__figure { font-size: var(--text-5xl); }
}

/* The roll strip. overflow:hidden is what clips the sanctioned keyframe. */
.stat__roll { display: inline-block; overflow: hidden; vertical-align: bottom; }
.stat__value { display: inline-block; }
.stat__roll[data-rolled='true'] > .stat__value {
  animation: inFromBelow var(--dur-base) var(--ease-out);
}
.stat__suffix { color: var(--accent); }

.stat__label {
  color: var(--muted);
  font-size: var(--text-sm);
  line-height: 1.35;
  margin: 0;
  max-width: 28ch;
}

.stat__prov { font-size: var(--text-xs); color: var(--muted); }
.stat__prov > summary {
  cursor: pointer;
  list-style: none;
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  color: var(--muted);
  border-bottom: 1px dotted var(--border-strong);
  transition: color var(--dur-micro) var(--ease-out);
}
.stat__prov > summary::-webkit-details-marker { display: none; }
.stat__prov > summary:hover { color: var(--fg); }
.stat__prov > p {
  margin: var(--s2) 0 0;
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  line-height: 1.5;
  color: var(--muted);
  max-width: 34ch;
}
`

export type StatProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /** The figure, already formatted. Rendered as text server-side. */
  value: string
  /** "+", "%", "x" - rendered beside the figure, outside the roll strip. */
  suffix?: string
  label: string
  /** Where the number comes from. From `headlineStats[n].source`. */
  source?: string
  /** ISO date the figure was true. From `headlineStats[n].asOf`. */
  asOf?: string
  size?: 'sm' | 'md' | 'lg'
  /** Render the provenance as a title attribute instead of a <details>. */
  provenance?: 'details' | 'title' | 'none'
  as?: keyof JSX.IntrinsicElements
}

export function Stat({
  value,
  suffix,
  label,
  source,
  asOf,
  size = 'md',
  provenance = 'details',
  as = 'div',
  className = '',
  ...rest
}: StatProps) {
  const rollRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const strip = rollRef.current
    if (!strip) return

    // Skipped entirely under reduced motion - no roll, no observer.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const height = strip.getBoundingClientRect().height
    if (height === 0 || height > MAX_ANIMATED_DISTANCE_PX) return

    return observeOnce(strip, (el) => {
      ;(el as HTMLElement).dataset.rolled = 'true'
    })
  }, [])

  const Tag = as as 'div'
  const citation = source ? `${source}${asOf ? ` · as of ${asOf}` : ''}` : undefined

  return (
    <>
      <style href="envenox-stat" precedence="default">
        {CSS}
      </style>
      <Tag
        className={['stat', `stat--${size}`, className].filter(Boolean).join(' ')}
        title={provenance === 'title' ? citation : undefined}
        {...rest}
      >
        <p className="stat__figure u-tnum">
          <span className="stat__roll" ref={rollRef}>
            <span className="stat__value">{value}</span>
          </span>
          {suffix ? <span className="stat__suffix">{suffix}</span> : null}
        </p>
        <p className="stat__label">{label}</p>
        {citation && provenance === 'details' ? (
          <details className="stat__prov">
            <summary>Source</summary>
            <p>{citation}</p>
          </details>
        ) : null}
      </Tag>
    </>
  )
}

export default Stat
