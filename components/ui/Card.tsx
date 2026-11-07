import Link from 'next/link'
import type { AnchorHTMLAttributes, HTMLAttributes, JSX, ReactNode } from 'react'

/**
 * Card - hairline surface.
 *
 * MOTION CONTRACT: hover is a border-color shift plus a very small
 * background-color shift. NO lift, NO scale, NO translate, NO shadow.
 * --dur-base --ease-out on colour properties only.
 *
 * WHOLE-CARD LINK: use <CardLink>. It renders a real focusable anchor whose
 * text is the accessible name, and stretches a ::after overlay across the card
 * so the whole surface is clickable. This is the only correct pattern - an
 * <a> wrapped around the entire card swallows every nested link and reads the
 * whole card as one enormous link name.
 *
 *   <Card>
 *     <h3><CardLink href="/services/penetration-testing">Penetration Testing</CardLink></h3>
 *     <p>Web, mobile, network, cloud, API.</p>
 *   </Card>
 *
 * Hover state is driven by :has(.card__link), so a card containing a CardLink
 * lights up without the consumer having to say so. `interactive` forces it on
 * for cards whose affordance comes from something else.
 */

const CSS = `
.card {
  position: relative;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: inherit;
  transition:
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
}
.card--pad { padding: var(--s6); }
.card--pad-lg { padding: var(--s8); }
.card--flush { background-color: transparent; }

/* Hover: colour only. Anything that moves the card is a spec violation. */
.card[data-interactive='true']:hover,
.card:has(.card__link):hover,
.card:has(.card__link:focus-visible) {
  background-color: color-mix(in oklab, var(--surface) 88%, var(--fg) 12%);
  border-color: var(--border-strong);
}

/* Press. A card is the largest tap target on the site and had no pressed
   state at all, so on touch, where there is no hover, tapping one gave no
   acknowledgement until the next page painted. One step further than hover,
   in colour only, and faster, because a press must register immediately.
   :has(:active) rather than :active so the whole card responds when the
   stretched link inside it is the thing actually being pressed. */
.card[data-interactive='true']:active,
.card:has(.card__link:active) {
  background-color: color-mix(in oklab, var(--surface) 76%, var(--fg) 24%);
  border-color: var(--fg);
  transition-duration: var(--dur-micro);
}

/* The stretched link. The anchor's own text stays the accessible name. */
.card__link {
  color: inherit;
  text-decoration: none;
  outline-offset: 4px;
}
.card__link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  z-index: 1;
}
/* Anything that must stay clickable inside a stretched-link card. */
.card__above { position: relative; z-index: 2; }
`

export type CardProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children?: ReactNode
  as?: keyof JSX.IntrinsicElements
  /** Padding preset. `none` when the card hosts its own full-bleed media. */
  padding?: 'none' | 'md' | 'lg'
  /** Transparent surface - hairline border only. */
  flush?: boolean
  /** Force the hover affordance on a card with no CardLink. */
  interactive?: boolean
}

export function Card({
  children,
  as = 'div',
  padding = 'md',
  flush = false,
  interactive,
  className = '',
  ...rest
}: CardProps) {
  const Tag = as as 'div'
  const cn = [
    'card',
    padding === 'md' ? 'card--pad' : '',
    padding === 'lg' ? 'card--pad-lg' : '',
    flush ? 'card--flush' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <style href="envenox-card" precedence="default">
        {CSS}
      </style>
      <Tag className={cn} data-interactive={interactive ? 'true' : undefined} {...rest}>
        {children}
      </Tag>
    </>
  )
}

export type CardLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children: ReactNode
}

/** The focusable anchor that stretches over its nearest `.card`. */
export function CardLink({ href, children, className = '', ...rest }: CardLinkProps) {
  const cn = ['card__link', className].filter(Boolean).join(' ')
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={cn} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={cn} {...rest}>
      {children}
    </a>
  )
}

/**
 * Wrapper that lifts its children above the stretched-link overlay, for the
 * rare card that needs a second clickable thing (a tag filter, a secondary
 * link). Keep these rare - two targets in one card is usually a design smell.
 */
export function CardAbove({ children, className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['card__above', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}

export default Card
