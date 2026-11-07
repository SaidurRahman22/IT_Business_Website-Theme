import type { CSSProperties, HTMLAttributes, JSX, ReactNode } from 'react'

/**
 * Section - the page is a stack of these.
 *
 * A section declares a theme class, which defines --bg --surface --fg --muted
 * --muted-strong --border --border-strong --accent --accent-fg for everything
 * inside it. Children consume those variables and never name a colour.
 *
 * `.transition-theme` is always applied, so a section whose theme changes
 * cross-fades on --dur-scene --ease-theme instead of snapping.
 *
 * `data-theme-section` is the hook the nav reads to re-colour itself in sync
 * with whatever is behind it (see components/nav/Nav.tsx). Rendering a themed
 * band WITHOUT <Section> means the nav cannot follow it.
 */

const CSS = `
.sec {
  position: relative;
  background-color: var(--bg);
  color: var(--fg);
}
/* Grain sits at z-index 1 with pointer-events none; content rides above it. */
.sec > .u-container,
.sec > .sec__bleed { position: relative; z-index: 2; }
`

export type SectionTheme = 'dark' | 'light' | 'deep'

export type SectionProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children?: ReactNode
  /** Which palette this band declares. Defaults to dark. */
  theme?: SectionTheme
  /** Animated film grain. Non-negotiable for large dark fields (PART 2.4). */
  grain?: boolean
  /** `.u-section-tight` instead of `.u-section`. */
  tight?: boolean
  /** Adds the 72px nav height to the top padding. Use on any page whose first
   *  section is NOT a full-bleed hero sitting under the transparent nav. */
  offsetNav?: boolean
  /** Skip the inner `.u-container` - the child manages its own gutters. */
  bleed?: boolean
  /** Extra classes on the inner `.u-container`. */
  innerClassName?: string
  as?: keyof JSX.IntrinsicElements
}

export function Section({
  children,
  theme = 'dark',
  grain = false,
  tight = false,
  offsetNav = false,
  bleed = false,
  className = '',
  innerClassName = '',
  as = 'section',
  style,
  ...rest
}: SectionProps) {
  const Tag = as as 'section'

  const cn = [
    'sec',
    `theme-${theme}`,
    'transition-theme',
    tight ? 'u-section-tight' : 'u-section',
    grain ? 'grain' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const merged: CSSProperties | undefined = offsetNav
    ? ({ ...style, paddingTop: 'calc(var(--nav-h) + var(--s16))' } as CSSProperties)
    : style

  return (
    <>
      <style href="envenox-section" precedence="default">
        {CSS}
      </style>
      <Tag className={cn} data-theme-section={theme} style={merged} {...rest}>
        {bleed ? (
          <div className={['sec__bleed', innerClassName].filter(Boolean).join(' ')}>{children}</div>
        ) : (
          <div className={['u-container', innerClassName].filter(Boolean).join(' ')}>{children}</div>
        )}
      </Tag>
    </>
  )
}

export default Section
