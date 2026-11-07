'use client'

/**
 * CLIP CAROUSEL - a set of MotionClips with one playing at a time.
 *
 * Radix Tabs sits underneath, so the keyboard semantics and the ARIA wiring are
 * the ones the platform expects: a real tablist, roving focus, arrow-key
 * navigation, `aria-selected`, `aria-controls` and `aria-labelledby` in both
 * directions. The panels are `forceMount`ed so all of them exist side by side
 * inside a translating track - which means the inactive ones need taking out of
 * the tab order and the accessibility tree by hand, hence `inert`.
 *
 * - Only the active clip plays. All others pause and rewind to 0.
 * - The track translates on X; clips cross-fade by defocusing, never by fading
 *   flat. That is the house signature for every media swap.
 * - Auto-advance pauses on :hover AND :focus-within, and is disabled outright
 *   under prefers-reduced-motion - manual controls only.
 * - With JavaScript off the track stops being a track: every clip stacks and
 *   stays readable, posters, captions and all.
 */

import { useCallback, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { MotionClip, usePrefersReducedMotion } from './MotionClip'
import styles from './clip.module.css'

export type ClipSpec = {
  /** Stable id - also the Radix tab value. */
  id: string
  /** Clip slug under /clips. */
  name: string
  /** REQUIRED. One complete sentence describing what the animation shows. */
  description: string
  /** Short label for the tab strip. */
  label: string
  /** Visible caption under the frame. */
  caption?: string
  /** Ambient clips only. A looping clip never ends, so it never advances. */
  loop?: boolean
  /** Intended runtime, for the placeholder slate. */
  seconds?: string
}

export type ClipCarouselProps = {
  clips: readonly ClipSpec[]
  /** Advance to the next clip when one ends. Ignored under reduced motion. */
  autoAdvance?: boolean
  /** Accessible name for the tab strip. */
  label?: string
  /** CSS `aspect-ratio` for every frame in the set. */
  aspect?: string
  id?: string
  className?: string
}

export function ClipCarousel({
  clips,
  autoAdvance = true,
  label = 'Choose a clip',
  aspect = '16 / 9',
  id,
  className,
}: ClipCarouselProps) {
  const reduce = usePrefersReducedMotion()
  const [value, setValue] = useState(clips[0]?.id ?? '')
  const [held, setHeld] = useState(false)

  const index = useMemo(() => {
    const i = clips.findIndex((clip) => clip.id === value)
    return i < 0 ? 0 : i
  }, [clips, value])

  // Reduced motion kills auto-advance entirely, not just its animation.
  const advancing = autoAdvance && !reduce && clips.length > 1

  const goNext = useCallback(() => {
    setValue((current) => {
      const i = clips.findIndex((clip) => clip.id === current)
      const next = clips[(i + 1) % clips.length]
      return next ? next.id : current
    })
  }, [clips])

  if (clips.length === 0) return null

  return (
    <Tabs.Root
      id={id}
      className={[styles.carousel, className].filter(Boolean).join(' ')}
      value={value}
      onValueChange={setValue}
      orientation="horizontal"
      // Hover and focus both hold the clock. The CSS :focus-within rule is a
      // belt for the visual state; this is what actually stops the advance.
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      data-held={held ? 'true' : 'false'}
    >
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{ ['--clip-index']: index } as CSSProperties}
        >
          {clips.map((clip) => {
            const isActive = clip.id === value
            return (
              <Tabs.Content
                key={clip.id}
                value={clip.id}
                forceMount
                className={styles.panel}
                tabIndex={isActive ? 0 : -1}
                inert={isActive ? undefined : true}
              >
                <MotionClip
                  name={clip.name}
                  description={clip.description}
                  caption={clip.caption}
                  seconds={clip.seconds}
                  loop={clip.loop}
                  aspect={aspect}
                  active={isActive}
                  autoAdvance={advancing && isActive && !clip.loop}
                  holdAdvance={held}
                  onComplete={goNext}
                />
              </Tabs.Content>
            )
          })}
        </div>
      </div>

      <Tabs.List className={styles.tabs} aria-label={label}>
        {clips.map((clip, i) => (
          <Tabs.Trigger key={clip.id} value={clip.id} className={styles.tab}>
            <span className={`u-mono ${styles.tabNum}`} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={styles.tabLabel}>{clip.label}</span>
            <span className={styles.tabRule} aria-hidden="true" />
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}

export default ClipCarousel
