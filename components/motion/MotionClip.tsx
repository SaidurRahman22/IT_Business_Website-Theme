'use client'

/**
 * MOTION CLIP - a short product/process clip with a visible, three-state control.
 *
 * ---------------------------------------------------------------------------
 * THE CONTROL IS THREE-STATE, NOT TWO
 * ---------------------------------------------------------------------------
 *   playing -> pause glyph  -> "Pause <description>"
 *   paused  -> play glyph   -> "Play <description>"
 *   ended   -> replay glyph -> "Replay <description>"
 * The live `aria-label` is swapped on every state change, and all three
 * candidate strings are published on the button as `data-aria-playing`,
 * `data-aria-paused` and `data-aria-ended` so the mapping is inspectable
 * without reading the component.
 *
 * ---------------------------------------------------------------------------
 * DESCRIPTION IS REQUIRED AND MUST BE A SENTENCE
 * ---------------------------------------------------------------------------
 * `description` is a required prop, and the props type additionally rejects the
 * empty string at compile time: when the literal `''` is passed, `D` infers as
 * `''` and the intersected branch demands a property nobody can supply, so the
 * call fails to type-check. An alt-less clip is an unusable clip.
 *
 * ---------------------------------------------------------------------------
 * LOADING
 * ---------------------------------------------------------------------------
 * `preload="none"` plus a poster; the sources carry `data-src` and are promoted
 * to `src` on intersection, so nothing downloads until the clip is nearly in
 * view. Between intersection and `canplay` the poster carries a hairline
 * indeterminate indicator on the same 40x40 geometry as the progress ring -
 * never a spinner, which over a dark field reads as broken. Poster to video is
 * the signature defocus cross-fade, not a flat dissolve.
 *
 * ---------------------------------------------------------------------------
 * THERE ARE NO VIDEO FILES YET
 * ---------------------------------------------------------------------------
 * If every source 404s the poster stays; if the poster 404s too, the component
 * renders `ClipPlaceholder` rather than a broken black box. The auto-advance
 * clock falls back to wall time so a carousel still advances while
 * `public/clips/` is empty.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { ClipPlaceholder } from './ClipPlaceholder'
import styles from './clip.module.css'

/* ========================================================================== *
 * RING GEOMETRY - one source of truth, shared by the progress ring and the
 * loading indicator. 2 * pi * 19.5 = 122.52211..., which is the 122.522 in the
 * published markup; derived here rather than typed in, so a radius change can
 * never silently desynchronise the dash.
 * ========================================================================== */

export const RING_R = 19.5
export const RING_C = 2 * Math.PI * RING_R
const RING_C_ATTR = RING_C.toFixed(3)

export type ClipState = 'playing' | 'paused' | 'ended'

const CONTROL_VERB: Record<ClipState, string> = {
  playing: 'Pause',
  paused: 'Play',
  ended: 'Replay',
}

/* ========================================================================== *
 * REDUCED MOTION
 * ========================================================================== */

/** `false` on the server and on the first client render, so hydration matches. */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduce
}

/* ========================================================================== *
 * PROPS
 * ========================================================================== */

type EmptyDescriptionError = {
  /** A clip description must be one complete sentence describing what a
   *  sighted viewer sees. The empty string is not one. */
  'envenox/error: MotionClip description must not be empty': never
}

type MotionClipBaseProps = {
  /** Clip slug. Resolves `/clips/<name>.webm`, `.mp4` and `<name>-poster.webp`. */
  name: string
  /** `loop` is for ambient clips only. An explanatory clip must end so the
   *  control can reach its `ended` state and the viewer can stop reading it. */
  loop?: boolean
  /** Carousel-driven. Only the active clip plays; the rest pause and rewind. */
  active?: boolean
  /** Show and run the auto-advance progress ring. */
  autoAdvance?: boolean
  /** Freeze auto-advance without pausing playback (carousel hover / focus). */
  holdAdvance?: boolean
  /** Fired when the clip ends, or when the fallback clock completes. */
  onComplete?: () => void
  /** Wall-clock length used when there is no playable media. */
  fallbackSeconds?: number
  /** Visible caption under the frame. */
  caption?: string
  /** CSS `aspect-ratio` value for the frame. */
  aspect?: string
  /** Intended runtime, passed through to the placeholder. */
  seconds?: string
  /** Override the resolved poster URL. */
  poster?: string
  /** Override the resolved WebM URL. */
  webm?: string
  /** Override the resolved MP4 URL. */
  mp4?: string
  className?: string
}

export type MotionClipProps<D extends string = string> = MotionClipBaseProps & {
  /** REQUIRED. One complete sentence describing what the animation shows. */
  description: D
} & (D extends '' ? EmptyDescriptionError : unknown)

/* ========================================================================== *
 * COMPONENT
 * ========================================================================== */

export function MotionClip<D extends string>(props: MotionClipProps<D>) {
  const {
    name,
    description,
    loop = false,
    active = true,
    autoAdvance = false,
    holdAdvance = false,
    onComplete,
    fallbackSeconds = 8,
    caption,
    aspect = '16 / 9',
    seconds,
    poster,
    webm,
    mp4,
    className,
  } = props as MotionClipBaseProps & { description: string }

  const posterUrl = poster ?? `/clips/${name}-poster.webp`
  const webmUrl = webm ?? `/clips/${name}.webm`
  const mp4Url = mp4 ?? `/clips/${name}.mp4`

  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)

  const [armed, setArmed] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [posterFailed, setPosterFailed] = useState(false)
  const [state, setState] = useState<ClipState>('paused')

  const reduce = usePrefersReducedMotion()

  const userPausedRef = useRef(false)
  const pendingCompleteRef = useRef(false)
  const holdRef = useRef(holdAdvance)
  holdRef.current = holdAdvance
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  if (process.env.NODE_ENV !== 'production' && loop && autoAdvance) {
    // `ended` never fires on a looping element, so the ring would fill and the
    // carousel would stall. Caught here rather than in a bug report.
    console.warn(
      `MotionClip "${name}": loop and autoAdvance are mutually exclusive, a looping clip never ends.`,
    )
  }

  /* -- paint the ring without re-rendering 60 times a second -- */
  const paintRing = useCallback((p: number) => {
    const circle = ringRef.current
    if (circle) circle.style.strokeDashoffset = String(RING_C * (1 - Math.min(1, Math.max(0, p))))
  }, [])

  /* -- arm on intersection: promote data-src -> src, then load() -- */
  useEffect(() => {
    if (armed) return
    const el = frameRef.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setArmed(true)
      return
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          obs.disconnect()
          setArmed(true)
        }
      },
      // "Nearly in view" - a screen-ish of lead time, so the cross-fade has
      // landed by the time the clip is actually looked at.
      { rootMargin: '200px 0px 200px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [armed])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !armed) return
    // The sources now carry src; load() runs resource selection for real.
    video.load()
  }, [armed])

  /* -- only the active clip plays; the rest pause and rewind -- */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!active) {
      video.pause()
      try {
        video.currentTime = 0
      } catch {
        /* no media loaded; nothing to rewind */
      }
      userPausedRef.current = false
      pendingCompleteRef.current = false
      setState('paused')
      paintRing(0)
      return
    }

    if (!ready || failed || reduce || userPausedRef.current) return
    void video.play().catch(() => {
      // Autoplay refused: the control is already sitting there showing Play.
      setState('paused')
    })
  }, [active, ready, failed, reduce, paintRing])

  /* -- progress ring -- */
  useEffect(() => {
    if (!autoAdvance || !active) {
      paintRing(0)
      return
    }
    let raf = 0
    let last = 0
    let elapsed = 0

    const tick = (ts: number) => {
      const video = videoRef.current
      if (last === 0) last = ts
      const dt = ts - last
      last = ts

      const duration = video?.duration ?? NaN
      if (video && ready && !failed && Number.isFinite(duration) && duration > 0) {
        // Media-backed: the ring reports the truth, so a pause or a seek shows.
        paintRing(video.currentTime / duration)
      } else {
        // No playable media. A wall clock keeps the carousel moving while
        // public/clips/ is empty, and freezes while advance is held.
        if (!holdRef.current) elapsed += dt
        const p = elapsed / (fallbackSeconds * 1000)
        paintRing(p)
        if (p >= 1) {
          elapsed = 0
          onCompleteRef.current?.()
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [autoAdvance, active, ready, failed, fallbackSeconds, paintRing])

  /* -- a completion that arrived while advance was held fires on release -- */
  useEffect(() => {
    if (holdAdvance || !pendingCompleteRef.current) return
    pendingCompleteRef.current = false
    onCompleteRef.current?.()
  }, [holdAdvance])

  /* -- the control -- */
  const handleControl = useCallback(() => {
    const video = videoRef.current
    // Not `disabled`: a disabled button leaves the tab order, so a keyboard
    // user can never reach it to hear why the clip is not playing. It stays
    // focusable, announces the reason, and does nothing.
    if (!video || failed) return
    if (state === 'playing') {
      userPausedRef.current = true
      video.pause()
      return
    }
    if (state === 'ended') {
      try {
        video.currentTime = 0
      } catch {
        /* ignore */
      }
    }
    userPausedRef.current = false
    void video.play().catch(() => setState('paused'))
  }, [state, failed])

  const handleEnded = useCallback(() => {
    setState('ended')
    paintRing(1)
    if (!autoAdvance) return
    if (holdRef.current) {
      pendingCompleteRef.current = true
      return
    }
    onCompleteRef.current?.()
  }, [autoAdvance, paintRing])

  /* ---------------------------------------------------------------------- *
   * Nothing playable and nothing to look at: show the slate, not a black box.
   * ---------------------------------------------------------------------- */
  if (failed && posterFailed) {
    return (
      <ClipPlaceholder
        name={name}
        description={description}
        seconds={seconds}
        aspect={aspect}
        reason="clip source unavailable"
        className={className}
      />
    )
  }

  const loading = armed && !ready && !failed
  const controlLabel = failed
    ? `Play ${description}, clip source unavailable`
    : `${CONTROL_VERB[state]} ${description}`

  return (
    <figure
      ref={frameRef}
      className={[styles.clip, className].filter(Boolean).join(' ')}
      style={{ ['--clip-aspect']: aspect } as CSSProperties}
      data-state={state}
      data-ready={ready ? 'true' : 'false'}
      data-armed={armed ? 'true' : 'false'}
      data-failed={failed ? 'true' : 'false'}
    >
      <div className={styles.frame}>
        {/* The poster is its own layer so it can defocus independently of the
            video. The attribute below stays on <video> as well, for the
            pre-hydration frame and for the native fallback path. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.poster}
          src={posterUrl}
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="lazy"
          draggable={false}
          onError={() => setPosterFailed(true)}
        />

        <video
          ref={videoRef}
          className={styles.video}
          muted
          playsInline
          preload="none"
          poster={posterUrl}
          loop={loop}
          aria-label={description}
          tabIndex={-1}
          onCanPlay={() => setReady(true)}
          onPlay={() => setState('playing')}
          onPause={(event) => {
            if (event.currentTarget.ended) return
            setState('paused')
          }}
          onEnded={handleEnded}
          onError={() => setFailed(true)}
        >
          <source
            data-src={webmUrl}
            src={armed ? webmUrl : undefined}
            type="video/webm"
            onError={() => setFailed(true)}
          />
          <source
            data-src={mp4Url}
            src={armed ? mp4Url : undefined}
            type="video/mp4"
            onError={() => setFailed(true)}
          />
        </video>

        <button
          type="button"
          className={styles.control}
          data-state={state}
          data-aria-playing={`Pause ${description}`}
          data-aria-paused={`Play ${description}`}
          data-aria-ended={`Replay ${description}`}
          aria-label={controlLabel}
          aria-disabled={failed ? 'true' : undefined}
          onClick={handleControl}
        >
          {state === 'playing' ? (
            <Pause className={styles.controlGlyph} aria-hidden="true" focusable="false" />
          ) : state === 'ended' ? (
            <RotateCcw className={styles.controlGlyph} aria-hidden="true" focusable="false" />
          ) : (
            <Play className={styles.controlGlyph} aria-hidden="true" focusable="false" />
          )}
        </button>

        <div className={styles.rings} aria-hidden="true">
          {autoAdvance ? (
            <svg
              className={styles.ring}
              viewBox="0 0 40 40"
              width="40"
              height="40"
              aria-hidden="true"
              focusable="false"
            >
              <circle className={styles.ringTrack} cx="20" cy="20" r={RING_R} fill="none" strokeWidth="1" />
              <circle
                ref={ringRef}
                className={styles.ringProgress}
                cx="20"
                cy="20"
                r={RING_R}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray={RING_C_ATTR}
                strokeDashoffset={RING_C_ATTR}
                transform="rotate(-90 20 20)"
              />
            </svg>
          ) : null}

          {loading ? (
            <svg
              className={styles.loadRing}
              viewBox="0 0 40 40"
              width="40"
              height="40"
              aria-hidden="true"
              focusable="false"
            >
              <circle className={styles.loadRingTrack} cx="20" cy="20" r={RING_R} fill="none" strokeWidth="1" />
              <circle
                className={styles.loadRingArc}
                cx="20"
                cy="20"
                r={RING_R}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeDasharray={`28 ${RING_C_ATTR}`}
              />
            </svg>
          ) : null}
        </div>

        {failed ? (
          <p className={`u-mono ${styles.frameNote}`}>source unavailable</p>
        ) : null}
      </div>

      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  )
}

export default MotionClip
