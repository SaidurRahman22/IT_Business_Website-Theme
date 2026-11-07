import type { SVGProps } from 'react'

/**
 * BrandIcon - renders a simple-icons glyph inside a 24x24 viewBox.
 *
 * WHY THIS EXISTS: Lucide ships NO brand marks (they were removed over
 * trademark concerns), so `import { Linkedin } from 'lucide-react'` does not
 * and will not resolve. Brand marks come from `simple-icons`:
 *
 *   import { siGithub } from 'simple-icons'
 *   <BrandIcon icon={siGithub} label="GitHub" />
 *
 * OPTICAL NORMALISATION: simple-icons are solid fills that bleed to all four
 * edges of the 24 box. Lucide glyphs are 1.75px strokes inset about 2 units.
 * Dropped in raw, a brand mark reads noticeably heavier and larger than the
 * Lucide icon next to it. The inner <g> scales the path to 0.82 and recentres
 * it, which lands the solid mark on roughly the same optical area as a Lucide
 * stroke glyph at the same `size`.
 *
 * ACCESSIBILITY: pass `label` for a standalone icon link (role="img" +
 * aria-label). Omit it when a visible text label sits beside the mark - the
 * icon is then aria-hidden and the text carries the name. Never both.
 */

/** The shape of a simple-icons export. Structurally compatible with SimpleIcon. */
export type BrandMark = {
  title: string
  path: string
}

const SCALE = 0.82
const OFFSET = (24 - 24 * SCALE) / 2 // 2.16

export type BrandIconProps = Omit<SVGProps<SVGSVGElement>, 'children' | 'viewBox'> & {
  icon: BrandMark
  /** Accessible name. Omit when a visible text label sits beside the mark. */
  label?: string
  /** Rendered box in px. House sizes: 16 inline, 20 default, 24 feature. */
  size?: number
}

export function BrandIcon({ icon, label, size = 20, className, ...rest }: BrandIconProps) {
  const labelled = typeof label === 'string' && label.length > 0

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? label : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      {...rest}
    >
      <g transform={`translate(${OFFSET} ${OFFSET}) scale(${SCALE})`}>
        <path d={icon.path} />
      </g>
    </svg>
  )
}

export default BrandIcon
