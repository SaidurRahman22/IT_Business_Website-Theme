import type { HTMLAttributes, ReactNode } from 'react'

/**
 * Badge - small label.
 *
 * `variant="severity"` is the ONE place in the entire site where --signal-*
 * colours appear. They are semantic, never brand chrome: no signal colour in a
 * heading, a button, a nav, a logo or a section background.
 *
 * ACCESSIBILITY: severity is NEVER conveyed by colour alone. The badge always
 * renders the severity word ("Critical", "High", …) as text, so a colourblind
 * reader, a screen reader and a monochrome printout all get the same
 * information. There is deliberately no icon-only or dot-only mode.
 */

export type BadgeVariant = 'neutral' | 'brand' | 'severity'

/**
 * Deliberately named BadgeSeverity, not Severity.
 *
 * `lib/product-fixtures.ts` already exports a structurally identical `Severity`
 * union and its own `SEVERITY_LABEL`, for the product-UI mocks. A page that
 * renders both a mock SOC queue and a Badge would otherwise have two clashing
 * imports of the same name. The unions are assignable in both directions, so
 * `<Badge severity={alert.severity} />` works without a cast - and Badge stays a
 * primitive with no dependency on a 32KB fixture module.
 */
export type BadgeSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export const BADGE_SEVERITY_LABEL: Record<BadgeSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Informational',
}

const CSS = `
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  border: 1px solid var(--badge-border, var(--border));
  border-radius: var(--radius-sm);
  background-color: var(--badge-bg, transparent);
  color: var(--badge-fg, var(--muted-strong));
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.04em;
  line-height: 1;
  padding: var(--s1) var(--s2);
  /* normal + balance, NOT nowrap. Three separate pages overflowed 320px because
     a badge held arbitrary data, "3 weeks review, 14 weeks remediation",
     "AWS Solutions Architect Professional", a credibility sentence, and an
     unbreakable chip wider than its card pushes the whole grid track past the
     viewport. A badge is a label primitive, but callers legitimately put
     variable-length data in one, and the component should survive that rather
     than require every caller to override it. Severity badges keep nowrap
     below: "Critical" is two syllables and must never break. */
  white-space: normal;
  text-wrap: balance;
}
.badge--severity {
  white-space: nowrap;
}
.badge--sm { font-size: var(--text-xs); padding: 2px var(--s2); }
.badge--md { padding: var(--s1) var(--s3); }

.badge--neutral {
  --badge-bg: var(--surface);
  --badge-fg: var(--muted-strong);
  --badge-border: var(--border);
}
.badge--brand {
  --badge-bg: color-mix(in oklab, var(--accent) 12%, transparent);
  --badge-fg: var(--accent);
  --badge-border: color-mix(in oklab, var(--accent) 38%, transparent);
}

/* --- the only --signal-* usage in the codebase --- */
.badge--severity {
  --badge-bg: color-mix(in oklab, var(--sig) 14%, transparent);
  --badge-fg: var(--sig);
  --badge-border: color-mix(in oklab, var(--sig) 42%, transparent);
  font-variant-numeric: tabular-nums;
}
.badge--severity .badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--sig);
  flex: none;
}
.badge--critical { --sig: var(--signal-critical); }
.badge--high { --sig: var(--signal-high); }
.badge--medium { --sig: var(--signal-medium); }
.badge--low { --sig: var(--signal-low); }
.badge--info { --sig: var(--signal-info); }
`

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  children?: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  /** Required when variant is "severity". Renders its word as text. */
  severity?: BadgeSeverity
  /** Replace the default severity word, e.g. "Critical · CVSS 9.8". */
  label?: string
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  severity,
  label,
  className = '',
  ...rest
}: BadgeProps) {
  const isSeverity = variant === 'severity' && !!severity

  const cn = [
    'badge',
    `badge--${size}`,
    `badge--${variant}`,
    isSeverity ? `badge--${severity}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Text is mandatory. Colour is the redundant channel, never the only one.
  const text = children ?? label ?? (severity ? BADGE_SEVERITY_LABEL[severity] : null)

  return (
    <>
      <style href="envenox-badge" precedence="default">
        {CSS}
      </style>
      <span className={cn} {...rest}>
        {isSeverity ? <span className="badge__dot" aria-hidden="true" /> : null}
        {text}
      </span>
    </>
  )
}

export default Badge
