'use client'

// Keep the lucide-react import FIRST and braced - house convention, and
// scripts/check-icons.mjs harvests named imports from this file.
import { RotateCcw } from 'lucide-react'

import { useCallback, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

/**
 * The styleguide's ONE client component.
 *
 * A CSS animation that has already played is indistinguishable from one that
 * never ran, so every motion token and every keyframe needs a replay. Replay is
 * a remount: bumping `runKey` gives the target a new React key, React replaces
 * the node, and the animation starts from frame zero. That is more reliable
 * than toggling a class, which needs a forced reflow between remove and add.
 *
 * Everything this takes is plain serialisable data, so the page around it stays
 * a Server Component and only these controls ship JavaScript.
 *
 * WITH JAVASCRIPT OFF the Replay buttons are inert, which is correct and is
 * stated on the page: each target still renders in its resting (post-animation)
 * state, so the page reads as a static reference rather than as a broken one.
 * Under `prefers-reduced-motion: reduce` globals.css clamps every animation to
 * 0.01ms, so pressing Replay jumps straight to the end state - also correct,
 * and also stated.
 */

/* ========================================================================== *
 * TYPES - all plain data, crossing the server/client boundary
 * ========================================================================== */

export type DemoShape =
  | 'block'
  | 'strip'
  | 'track'
  | 'mask'
  | 'stroke'
  | 'ring'
  | 'caret'
  | 'collapse'
  | 'grain'

export type AnimSpec = {
  id: string
  /** The @keyframes name from app/globals.css. */
  keyframe: string
  /** A --dur-* token reference. */
  duration: string
  /** A --ease-* token reference, or `linear` / `steps(...)` where the keyframe
   *  is specified that way in globals.css. */
  easing: string
  animationFillMode?: 'both' | 'forwards' | 'backwards' | 'none'
  iterationCount?: string
  shape?: DemoShape
  /** Row label - the keyframe or token name. */
  label: string
  /** What it is for, or what to watch. */
  note?: string
  /** Custom properties a keyframe needs, e.g. `--dash` or `--gap`. */
  vars?: Record<string, string>
  /** Loops forever - no replay button, because it never stops. */
  continuous?: boolean
  /** Ends off-screen or invisible on purpose. */
  endsHidden?: boolean
}

const CSS = `
.sgd { display: grid; gap: var(--s2); }

.sgd-row {
  display: grid;
  gap: var(--s4);
  align-items: center;
  grid-template-columns: minmax(0, 1fr);
  border-top: 1px solid var(--border);
  padding: var(--s4) 0;
}
@media (min-width: 860px) {
  .sgd-row { grid-template-columns: 15rem minmax(0, 1fr) 7rem; gap: var(--s6); }
}

.sgd-row__meta { min-width: 0; }
.sgd-row__name {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--fg);
  margin: 0;
  word-break: break-word;
}
.sgd-row__note { font-size: var(--text-xs); color: var(--muted); margin: var(--s1) 0 0; }

/* The lane the target travels in. Fixed height so a 32px move cannot resize
   the row and reflow the page while it plays. */
.sgd-lane {
  position: relative;
  min-height: 72px;
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: var(--radius-md);
  background-color: var(--surface);
  padding: var(--s3);
}

.sgd-replay {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s2);
  min-height: 32px;
  padding-inline: var(--s3);
  appearance: none;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--muted-strong);
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  /* Colour only - no transform, no scale, no lift. */
  transition: background-color var(--dur-micro) var(--ease-out),
    border-color var(--dur-micro) var(--ease-out), color var(--dur-micro) var(--ease-out);
}
.sgd-replay:hover { background-color: var(--bg); border-color: var(--fg); color: var(--fg); }
.sgd-replay[disabled] { opacity: 0.45; cursor: not-allowed; }
.sgd-replay[disabled]:hover { background-color: transparent; border-color: var(--border-strong); color: var(--muted-strong); }

.sgd-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s4);
  flex-wrap: wrap;
  margin-bottom: var(--s2);
}
.sgd-head h3 { font-size: var(--text-lg); margin: 0; }
.sgd-head p { font-size: var(--text-xs); color: var(--muted); margin: 0; max-width: 54ch; }

/* ---- target shapes ---- */
.sgd-block {
  display: grid;
  place-items: center;
  width: 88px;
  height: 40px;
  flex: none;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  background-color: var(--bg);
  color: var(--fg);
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
}

.sgd-strip {
  display: inline-block;
  overflow: hidden;
  height: 1.5em;
  line-height: 1.5em;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-xl);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--fg);
}
.sgd-strip > span { display: inline-block; }

.sgd-track { display: flex; gap: var(--gap, var(--s6)); flex: none; }
.sgd-track span {
  flex: none;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: var(--s1) var(--s3);
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--muted-strong);
  white-space: nowrap;
}

.sgd-mask {
  width: 100%;
  max-width: 320px;
  height: 40px;
  border-radius: var(--radius-sm);
  background-color: var(--accent);
  mask-image: linear-gradient(75deg, transparent 30%, #000 50%, transparent 70%);
  -webkit-mask-image: linear-gradient(75deg, transparent 30%, #000 50%, transparent 70%);
  mask-size: 220% 100%;
  -webkit-mask-size: 220% 100%;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
}

.sgd-svg { width: 100%; max-width: 320px; height: 48px; color: var(--accent); }
.sgd-svg path { stroke-dasharray: var(--dash); }

.sgd-ring {
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  border-top-color: var(--accent);
}

.sgd-caret {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-sm);
  color: var(--fg);
}
.sgd-caret i { display: inline-block; width: 8px; height: 1.1em; background-color: var(--accent); font-style: normal; }

.sgd-collapse { overflow: hidden; width: 100%; max-width: 320px; }
.sgd-collapse > div {
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background-color: var(--bg);
  padding: var(--s3);
  font-size: var(--text-xs);
  color: var(--muted-strong);
  height: 72px;
}

.sgd-grain {
  position: relative;
  width: 128px;
  height: 72px;
  flex: none;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background-color: var(--bg);
  overflow: hidden;
}
.sgd-grain > span {
  position: absolute;
  inset: 0;
  background-image: url("/img/noise.png");
  background-size: 128px 128px;
  opacity: 0.4;
}
`

/* ========================================================================== *
 * TARGET
 * ========================================================================== */

function animStyle(spec: AnimSpec): CSSProperties {
  return {
    animationName: spec.keyframe,
    animationDuration: spec.duration,
    animationTimingFunction: spec.easing,
    animationFillMode: spec.animationFillMode ?? 'both',
    animationIterationCount: spec.iterationCount ?? '1',
    ...(spec.vars as CSSProperties | undefined),
  } as CSSProperties
}

/** Renders the demo target with the animation on whichever node needs it. */
function Target({ spec }: { spec: AnimSpec }) {
  const style = animStyle(spec)
  const shape = spec.shape ?? 'block'

  switch (shape) {
    case 'strip':
      return (
        <span className="sgd-strip">
          <span style={style}>240</span>
        </span>
      )

    case 'track':
      return (
        <div className="sgd-track" style={style}>
          {['NORTHGATE', 'LUMEN', 'VERITY', 'ALDERCROSS', 'NORTHGATE', 'LUMEN', 'VERITY', 'ALDERCROSS'].map(
            (t, i) => (
              <span key={`${t}-${i}`}>{t}</span>
            ),
          )}
        </div>
      )

    case 'mask':
      return <div className="sgd-mask" style={style} />

    case 'stroke':
      return (
        <svg className="sgd-svg" viewBox="0 0 320 48" fill="none" aria-hidden="true" focusable="false">
          <path
            d="M4 40 H96 C120 40 120 8 144 8 H316"
            stroke="currentColor"
            strokeWidth="1.5"
            style={style}
          />
        </svg>
      )

    case 'ring':
      return <div className="sgd-ring" style={style} />

    case 'caret':
      return (
        <span className="sgd-caret">
          <span>$ trustgraph --org o-7f2a</span>
          <i style={style} aria-hidden="true" />
        </span>
      )

    case 'collapse':
      return (
        <div className="sgd-collapse" style={style}>
          <div>Radix measures the panel height into --radix-accordion-content-height.</div>
        </div>
      )

    case 'grain':
      return (
        <div className="sgd-grain">
          <span style={style} />
        </div>
      )

    case 'block':
    default:
      return (
        <div className="sgd-block" style={style}>
          {spec.keyframe.slice(0, 7)}
        </div>
      )
  }
}

/* ========================================================================== *
 * ROW
 * ========================================================================== */

function Row({ spec, runKey, onReplay }: { spec: AnimSpec; runKey: number; onReplay: () => void }) {
  return (
    <div className="sgd-row">
      <div className="sgd-row__meta">
        <p className="sgd-row__name">{spec.label}</p>
        {spec.note ? <p className="sgd-row__note">{spec.note}</p> : null}
        {spec.endsHidden ? (
          <p className="sgd-row__note">Rests in its end state, hidden or off-position. Replay to see it.</p>
        ) : null}
      </div>

      <div className="sgd-lane">
        {/* The remount is the replay. */}
        <Target key={runKey} spec={spec} />
      </div>

      <div>
        {spec.continuous ? (
          <p className="sgd-row__note">Loops, no replay.</p>
        ) : (
          <button type="button" className="sgd-replay" onClick={onReplay}>
            <RotateCcw size={14} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            Replay
          </button>
        )}
      </div>
    </div>
  )
}

/* ========================================================================== *
 * LAB
 * ========================================================================== */

export type AnimLabProps = {
  title: string
  description?: string
  specs: AnimSpec[]
  /** Accessible name for the group. */
  ariaLabel?: string
}

export function AnimLab({ title, description, specs, ariaLabel }: AnimLabProps) {
  const [runs, setRuns] = useState<Record<string, number>>({})
  const [all, setAll] = useState(0)

  const replay = useCallback((id: string) => {
    setRuns((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }))
  }, [])

  const replayAll = useCallback(() => {
    setAll((n) => n + 1)
    setRuns({})
  }, [])

  const replayable = specs.some((s) => !s.continuous)

  return (
    <>
      <style href="envenox-styleguide-demos" precedence="default">
        {CSS}
      </style>

      <section className="sgd" aria-label={ariaLabel ?? title}>
        <div className="sgd-head">
          <div>
            <h3>{title}</h3>
            {description ? <p>{description}</p> : null}
          </div>
          {replayable ? (
            <button type="button" className="sgd-replay" onClick={replayAll}>
              <RotateCcw size={14} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
              Replay all
            </button>
          ) : null}
        </div>

        {specs.map((spec) => (
          <Row
            key={spec.id}
            spec={spec}
            runKey={all * 1000 + (runs[spec.id] ?? 0)}
            onReplay={() => replay(spec.id)}
          />
        ))}
      </section>
    </>
  )
}

/* ========================================================================== *
 * REVEAL REPLAY - the scroll entrance, which by contract fires exactly once
 * ========================================================================== */

export type RevealLabProps = { children?: ReactNode }

/**
 * `<Reveal>` unobserves its target inside the IntersectionObserver callback, so
 * it genuinely cannot replay - that is the contract, not a limitation. This
 * reproduces the same declaration on a disposable target so a reviewer can
 * watch the entrance as many times as they like without weakening the real one.
 */
export function RevealLab() {
  const [run, setRun] = useState(0)

  const items = ['01', '02', '03', '04', '05', '06']

  return (
    <>
      <style href="envenox-styleguide-demos" precedence="default">
        {CSS}
      </style>
      <section className="sgd" aria-label="Scroll reveal stagger">
        <div className="sgd-head">
          <div>
            <h3>Reveal stagger: 60ms, capped at 5</h3>
            <p>
              slideUpMoreAndFade on --dur-base --ease-out. The sixth item and every later sibling
              share the fifth&apos;s delay, so a 40-cell grid finishes in 240ms rather than 2.4s.
              The real `&lt;Reveal&gt;` fires once and never on scroll-back; this copy is
              disposable so it can be replayed.
            </p>
          </div>
          <button type="button" className="sgd-replay" onClick={() => setRun((n) => n + 1)}>
            <RotateCcw size={14} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            Replay
          </button>
        </div>

        <div className="sgd-row">
          <div className="sgd-row__meta">
            <p className="sgd-row__name">slideUpMoreAndFade</p>
            <p className="sgd-row__note">Delays: 0 · 60 · 120 · 180 · 240 · 240ms</p>
          </div>
          <div className="sgd-lane" key={run}>
            <div className="sgd-track" style={{ ['--gap' as string]: 'var(--s2)' }}>
              {items.map((label, i) => (
                <span
                  key={label}
                  style={
                    {
                      animationName: 'slideUpMoreAndFade',
                      animationDuration: 'var(--dur-base)',
                      animationTimingFunction: 'var(--ease-out)',
                      animationFillMode: 'both',
                      animationDelay: `${Math.min(i, 4) * 60}ms`,
                    } as CSSProperties
                  }
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div />
        </div>
      </section>
    </>
  )
}
