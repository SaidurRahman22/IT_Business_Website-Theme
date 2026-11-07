import type { HTMLAttributes } from 'react'

/**
 * AvatarPlaceholder - stands in for a portrait that does not exist yet.
 *
 * It must read as OBVIOUSLY a placeholder. No illustrated face, no generated
 * likeness, no stock photo: initials on a flat two-stop gradient, nothing
 * more. A realistic face here would be a fabricated person on a page that
 * claims to name real staff.
 *
 * The hue is derived from the name so a given person keeps the same tile on
 * every page and across rebuilds - stable, not random.
 *
 * This is the ONLY place in the codebase allowed to compute a colour outside
 * the theme variables, because the hue is data, not design.
 */

/** Stable 0–359 hue from the name. */
export function hueFromName(name: string): number {
  return [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360
}

/** "Priya Raghunathan" → "PR". Falls back to the first glyph. */
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const CSS = `
.avatar-ph {
  display: grid;
  place-items: center;
  flex: none;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  color: var(--paper-50);
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
  user-select: none;
  overflow: hidden;
}
.avatar-ph--round { border-radius: 50%; }
`

export type AvatarPlaceholderProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'role'> & {
  /** The person's name. Drives the initials AND the hue. */
  name: string
  /** Box size in px. */
  size?: number
  /** Circular instead of the house 8px radius. */
  round?: boolean
}

export function AvatarPlaceholder({
  name,
  size = 48,
  round = false,
  className = '',
  style,
  ...rest
}: AvatarPlaceholderProps) {
  const hue = hueFromName(name)
  const initials = initialsFromName(name)

  return (
    <>
      <style href="envenox-avatar-placeholder" precedence="default">
        {CSS}
      </style>
      <div
        role="img"
        aria-label={`Placeholder portrait for ${name}`}
        className={['avatar-ph', round ? 'avatar-ph--round' : '', className].filter(Boolean).join(' ')}
        style={{
          width: size,
          height: size,
          fontSize: Math.max(10, Math.round(size * 0.34)),
          backgroundImage: `linear-gradient(135deg, hsl(${hue} 18% 22%), hsl(${hue} 22% 14%))`,
          ...style,
        }}
        {...rest}
      >
        <span aria-hidden="true">{initials}</span>
      </div>
    </>
  )
}

export default AvatarPlaceholder
