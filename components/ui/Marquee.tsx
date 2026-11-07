import Link from 'next/link'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

/**
 * Marquee - the logo / credential wall.
 *
 * SPEC RULE: every mark carries a readable text label beside it, not just an
 * alt attribute. Unlabelled logo walls were a universal competitor failure -
 * a visitor who does not recognise the mark learns nothing, and a logo that
 * fails to load leaves a hole. The label is the content; the mark is decoration.
 *
 * LOOP: the children are duplicated ONCE inside a single `.marquee__track`.
 * The globals keyframe translates `calc(-50% - var(--gap) / 2)`, which is exact
 * for a track of 2N items with uniform gaps and NO trailing padding - so this
 * component raises specificity to zero out `.marquee__track`'s padding-right.
 * With that padding left in, the loop over-shifts by half a gap every cycle and
 * visibly jumps. globals.css is the contract and is not edited; this is a
 * local, documented override, not a redefinition.
 *
 * ACCESSIBILITY: the duplicated half is aria-hidden so a screen reader hears
 * each client once. Duplicated items never render anchors, because a focusable
 * element inside aria-hidden content is an accessibility error.
 *
 * MOTION: pauses on :hover AND :focus-within (globals). Under
 * prefers-reduced-motion the animation stops and the row becomes a horizontally
 * scrollable list (globals). Nothing here needs JavaScript.
 */

export type MarqueeItem = {
  /** The readable label. Required - this is the content, not a fallback. */
  label: string
  /** Optional mark. Pass a <BrandIcon>, an <Image> or an inline <svg>. */
  logo?: ReactNode
  /** Second line: sector, partner tier, certificate number. */
  meta?: string
  href?: string
}

const CSS = `
/* Zero the trailing padding so the globals keyframe lands exactly. */
.marquee__track.mq-track { padding-right: 0; list-style: none; margin: 0; padding-left: 0; }

.mq__item {
  display: flex;
  align-items: center;
  gap: var(--s3);
  flex: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  padding: var(--s3) var(--s4);
  min-height: 56px;
  transition: border-color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out);
}
.mq__item:hover { border-color: var(--border-strong); }

.mq__logo { display: inline-flex; flex: none; color: var(--muted-strong); }

.mq__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.mq__label {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.2;
  color: var(--fg);
  white-space: nowrap;
}
.mq__meta {
  font-size: var(--text-xs);
  line-height: 1.2;
  color: var(--muted);
  white-space: nowrap;
}
.mq__link { color: inherit; text-decoration: none; }
.mq__link:hover .mq__label { color: var(--fg); }
.mq__item-inner { display: flex; align-items: center; gap: var(--s3); min-width: 0; }

/* Reduced motion turns the rail into a scroller - give it breathing room. */
@media (prefers-reduced-motion: reduce) {
  .marquee__track.mq-track { padding-right: var(--gap); }
}
`

export type MarqueeProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  items: MarqueeItem[]
  /** Accessible name for the list, e.g. "Selected clients". Required. */
  ariaLabel: string
  /** Gap between items. Defaults to the 48px step. */
  gap?: string
  /** One full loop. Longer lists want a longer duration. */
  duration?: string
}

function ItemBody({ item }: { item: MarqueeItem }) {
  return (
    <>
      {item.logo ? (
        <span className="mq__logo" aria-hidden="true">
          {item.logo}
        </span>
      ) : null}
      <span className="mq__text">
        <span className="mq__label">{item.label}</span>
        {item.meta ? <span className="mq__meta">{item.meta}</span> : null}
      </span>
    </>
  )
}

export function Marquee({
  items,
  ariaLabel,
  gap = 'var(--s12)',
  duration = '46s',
  className = '',
  style,
  ...rest
}: MarqueeProps) {
  return (
    <>
      <style href="envenox-marquee" precedence="default">
        {CSS}
      </style>
      {/* tabIndex={0} is not optional. Under `prefers-reduced-motion: reduce`,
          globals.css turns `.marquee` into `overflow-x: auto`, a genuinely
          scrollable region. A scrollable region that cannot be focused cannot
          be scrolled by keyboard, so every client logo past the fold became
          unreachable for exactly the users who asked for less motion.

          It is unconditional because the condition is a media query and this is
          server-rendered: there is no JS to branch on, and getting it right
          without JS is the point. The cost is one extra tab stop; the
          alternative is a keyboard trap. `role="group"` plus the label gives
          that stop a name so it is not an unexplained focus ring. */}
      <div
        className={['marquee', className].filter(Boolean).join(' ')}
        style={{ ...style, '--gap': gap, '--marquee-dur': duration } as CSSProperties}
        tabIndex={0}
        role="group"
        aria-label={ariaLabel}
        {...rest}
      >
        <ul className="marquee__track mq-track" aria-label={ariaLabel}>
          {items.map((item) => (
            <li className="mq__item" key={`a-${item.label}`}>
              {item.href ? (
                item.href.startsWith('/') ? (
                  <Link href={item.href} className="mq__link mq__item-inner">
                    <ItemBody item={item} />
                  </Link>
                ) : (
                  <a href={item.href} className="mq__link mq__item-inner">
                    <ItemBody item={item} />
                  </a>
                )
              ) : (
                <ItemBody item={item} />
              )}
            </li>
          ))}

          {/* The seamless half. Hidden from assistive tech, never focusable. */}
          {items.map((item) => (
            <li className="mq__item" key={`b-${item.label}`} aria-hidden="true">
              <ItemBody item={item} />
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default Marquee
