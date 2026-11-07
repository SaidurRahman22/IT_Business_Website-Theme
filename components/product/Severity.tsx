/**
 * SeverityBadge - the single place severity is rendered.
 *
 * Four of the five product components show severity. Centralising it here is
 * not DRY for its own sake: it means the rule "severity is never conveyed by
 * colour alone" is enforced in ONE file rather than asserted in four. The badge
 * always renders, in this order:
 *
 *   1. a shape  - square / circle / diamond / ring / bar, distinct per level,
 *                 so the level survives greyscale and colour-blindness;
 *   2. the word - "Critical", "High", …, in --fg rather than --signal-*,
 *                 because several signal hues fall below 4.5:1 as text on the
 *                 light palette. The hue lives in the fill, border and shape;
 *   3. the hue  - a 14% tint of --signal-* behind it.
 *
 * `--signal-critical` … `--signal-info` appear ONLY in these product
 * components and nowhere else on the site.
 */

import type { Severity } from '@/lib/product-fixtures'
import { SEVERITY_LABEL } from '@/lib/product-fixtures'
import s from './product.module.css'

/** Maps a severity onto the class that sets `--sev`. */
export const sevClass: Record<Severity, string> = {
  critical: s.sevCritical,
  high: s.sevHigh,
  medium: s.sevMedium,
  low: s.sevLow,
  info: s.sevInfo,
}

export interface SeverityBadgeProps {
  severity: Severity
  /** Overrides the word, for reused palettes (endpoint status, day state). */
  label?: string
  /** Prefix read only by assistive tech, e.g. "Severity". */
  srPrefix?: string
  className?: string
}

export function SeverityBadge({ severity, label, srPrefix, className }: SeverityBadgeProps) {
  return (
    <span className={[s.sevBadge, sevClass[severity], className].filter(Boolean).join(' ')}>
      <span className={s.sevMark} aria-hidden="true" />
      {srPrefix ? <span className={s.srOnly}>{srPrefix}: </span> : null}
      {label ?? SEVERITY_LABEL[severity]}
    </span>
  )
}

/**
 * Stagger helper. 60 ms per row, CAPPED AT 5 - rows 6+ share row 5's delay, so
 * a 14-row queue finishes entering in 240 ms rather than 780 ms.
 */
export function enterDelay(index: number): React.CSSProperties {
  return { '--enter-delay': `${Math.min(index, 4) * 60}ms` } as React.CSSProperties
}
