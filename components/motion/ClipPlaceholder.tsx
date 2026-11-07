/**
 * CLIP PLACEHOLDER - an on-brand slate for a clip that has not been shot yet.
 *
 * `public/clips/` is empty. Pages need to be assembled, reviewed and signed off
 * before the clips exist, so this stands in for one - and it is built to be
 * impossible to mistake for finished content: hatched field, dashed edge, and a
 * mono caption that names the file, the intended runtime and the fact that it
 * is not produced. It is the thing you look at and immediately know is missing.
 *
 * No hooks, no effects. Renders identically with JavaScript disabled.
 */

import { Clapperboard } from 'lucide-react'
import type { CSSProperties } from 'react'
import styles from './clip.module.css'

export type ClipPlaceholderProps = {
  /** The clip slug, e.g. `threat-model-session`. Shown as the filename. */
  name: string
  /** What the finished clip will show. One complete sentence. */
  description?: string
  /** Intended runtime, e.g. `8 s`. The house range is 6–12 s. */
  seconds?: string
  /** CSS `aspect-ratio` value. Matches MotionClip's default. */
  aspect?: string
  /** Why the slate is showing - "not yet produced" vs "source unavailable". */
  reason?: string
  className?: string
}

export function ClipPlaceholder({
  name,
  description,
  seconds = '6–12 s',
  aspect = '16 / 9',
  reason = 'clip not yet produced',
  className,
}: ClipPlaceholderProps) {
  return (
    <div
      className={[styles.placeholder, className].filter(Boolean).join(' ')}
      style={{ ['--clip-aspect']: aspect } as CSSProperties}
    >
      <div className={styles.placeholderFrame}>
        <div className={styles.placeholderHatch} aria-hidden="true" />
        <div className={styles.placeholderBody}>
          <p className={`u-mono ${styles.placeholderFlag}`}>
            <Clapperboard className={styles.placeholderIcon} aria-hidden="true" focusable="false" />
            {reason}
          </p>
          <p className={`u-mono ${styles.placeholderName}`}>/clips/{name}.webm</p>
          <dl className={styles.placeholderSpec}>
            <div className={styles.placeholderSpecRow}>
              <dt>Runtime</dt>
              <dd className="u-mono">{seconds}</dd>
            </div>
            <div className={styles.placeholderSpecRow}>
              <dt>Shows</dt>
              <dd>{description ?? 'Not yet written.'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default ClipPlaceholder
