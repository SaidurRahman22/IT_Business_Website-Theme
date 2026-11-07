'use client'

/**
 * SceneRunner - the ONLY client component in `components/product/`.
 *
 * WHAT IT IS FOR
 * These product-UI components are the source material for the site's motion
 * clips: they get screen-recorded. A recording needs a deterministic sequence
 * it can capture, so `SocAlertQueue` accepts `step` (render one frozen beat)
 * and `autoplay` (advance the beats on a timer). This component implements the
 * second one, and nothing else on the page animates on a loop.
 *
 * WHAT IT DELIBERATELY IS NOT
 * Not a perpetually animating dashboard. A console that never stops moving
 * reads as a screensaver and burns the reader's battery. So the runner:
 *   - is OFF by default (`autoplay` defaults to false);
 *   - never starts under `prefers-reduced-motion: reduce`;
 *   - stops when the console scrolls off-screen (IntersectionObserver);
 *   - stops when the tab is hidden (`visibilitychange`);
 *   - is pausable from a real, focusable button.
 *
 * It mutates ONE attribute - `data-scene` on the console frame. Every beat of
 * the sequence is already in the server-rendered DOM; CSS decides which beats
 * are shown. That is what keeps the whole queue a Server Component and keeps it
 * complete and legible with JavaScript disabled, where `data-scene` simply
 * stays at the server-rendered `step`.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import s from './product.module.css'

export interface SceneRunnerProps {
  /** Beat the server rendered. The runner restarts the sequence from 0. */
  initialStep: number
  /** Number of beats, so the runner knows where to loop. */
  steps: number
  /** Dwell per beat. Sedate on purpose - this is not a ticker. */
  intervalMs?: number
  /** Human names for each beat, announced in the control strip. */
  stepLabels: readonly string[]
  className?: string
  children: React.ReactNode
}

export function SceneRunner({
  initialStep,
  steps,
  intervalMs = 2_600,
  stepLabels,
  className,
  children,
}: SceneRunnerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)

  /** Start on the server's beat; the effect rewinds to 0 only if we may run. */
  const [scene, setScene] = useState(initialStep)
  const [paused, setPaused] = useState(false)
  const [onScreen, setOnScreen] = useState(false)
  const [reduced, setReduced] = useState(true)

  /* --- reduced motion. Default `true` so we never animate before we know. --- */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /* --- off-screen => stopped. Nothing animates where nobody is looking. --- */
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setOnScreen(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(entry?.isIntersecting ?? false),
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  /* --- hidden tab => stopped. --- */
  const [tabVisible, setTabVisible] = useState(true)
  useEffect(() => {
    const sync = () => setTabVisible(document.visibilityState === 'visible')
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  const running = !reduced && !paused && onScreen && tabVisible

  /* --- rewind once, when the sequence first becomes eligible to run. --- */
  const rewound = useRef(false)
  useEffect(() => {
    if (running && !rewound.current) {
      rewound.current = true
      setScene(0)
    }
  }, [running])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setScene((n) => (n + 1) % steps)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [running, steps, intervalMs])

  const toggle = useCallback(() => setPaused((p) => !p), [])

  return (
    <div ref={rootRef} className={className} data-scene={scene}>
      {children}

      <div className={s.statusbar}>
        <span className={s.statusItem}>
          <span className={s.muted}>Sequence</span>{' '}
          <span className={`${s.statusStrong} u-mono u-tnum`}>
            {scene + 1}/{steps}
          </span>
        </span>
        <span className={s.statusItem}>{stepLabels[scene] ?? ''}</span>
        <span className={s.statusSpacer} />
        <button
          type="button"
          className={s.liveBtn}
          onClick={toggle}
          aria-pressed={paused}
          /* The label says what the button DOES, not what the state is. */
          aria-label={paused ? 'Resume the demonstration sequence' : 'Pause the demonstration sequence'}
        >
          {paused ? <Play size={11} aria-hidden="true" /> : <Pause size={11} aria-hidden="true" />}
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </div>
  )
}
