'use client'

/**
 * Reveal - scroll-triggered entrance for `[data-reveal]` (PART 3.3).
 *
 * The visual contract lives in globals.css:
 *   [data-reveal]                      → opacity 0, translate 0 10px
 *   [data-reveal][data-revealed=true]  → slideUpMoreAndFade, --dur-base, --ease-out
 *   .no-js [data-reveal]               → visible, no animation
 *   prefers-reduced-motion             → visible, no animation
 *
 * This file only flips the attribute. Three invariants it must hold:
 *
 *   1. ONE IntersectionObserver for the whole page. It is a module-level
 *      singleton with a registry, not one observer per component. A page with
 *      120 revealed cells still has exactly one observer.
 *   2. Reveals fire ONCE. The target is unobserved inside the callback, before
 *      anything else, so scrolling back up never replays an entrance.
 *   3. No extra wrapper. `as` lets the revealed element BE the grid cell, the
 *      list item or the section - a stray <div> would collapse a grid child.
 */

import { useCallback, type CSSProperties, type HTMLAttributes, type JSX, type ReactNode } from 'react'

/* ------------------------------------------------------------------ *
 * Stagger vocabulary - 60ms, capped at 5 items (PART 3.3).
 * The 6th and every later sibling share the 5th sibling's delay, so a long
 * list never turns into a slow cascade.
 * ------------------------------------------------------------------ */

export const REVEAL_STAGGER_MS = 60
export const REVEAL_STAGGER_CAP = 5

/** Delay in ms for the nth sibling, capped. `revealDelay(9) === revealDelay(4)`. */
export function revealDelay(index: number, baseDelay = 0): number {
  const step = Math.min(Math.max(index, 0), REVEAL_STAGGER_CAP - 1)
  return baseDelay + step * REVEAL_STAGGER_MS
}

/* ------------------------------------------------------------------ *
 * The single shared observer
 * ------------------------------------------------------------------ */

type RevealHandler = (el: Element) => void

/** Per-element handler. Absent → the default attribute flip. */
const registry = new Map<Element, RevealHandler | undefined>()
let sharedObserver: IntersectionObserver | null = null

function markRevealed(el: Element): void {
  ;(el as HTMLElement).dataset.revealed = 'true'
}

function getSharedObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined') return null
  if (!('IntersectionObserver' in window)) return null
  if (sharedObserver) return sharedObserver

  sharedObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        // Unobserve FIRST: fire once, never again on scroll-back.
        observer.unobserve(entry.target)
        const handler = registry.get(entry.target)
        registry.delete(entry.target)
        ;(handler ?? markRevealed)(entry.target)
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
  )
  return sharedObserver
}

/**
 * Register an element with the page's one observer. Returns a cleanup fn.
 *
 * Without IntersectionObserver support the handler runs immediately, so the
 * content is never left at opacity 0 - degrade to visible, never to blank.
 */
export function observeOnce(el: Element, handler?: RevealHandler): () => void {
  const observer = getSharedObserver()
  if (!observer) {
    ;(handler ?? markRevealed)(el)
    return () => {}
  }
  registry.set(el, handler)
  observer.observe(el)
  return () => {
    registry.delete(el)
    observer.unobserve(el)
  }
}

/* ------------------------------------------------------------------ *
 * <Reveal>
 * ------------------------------------------------------------------ */

export type RevealProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children?: ReactNode
  /**
   * Entrance delay in ms. Leave it unset inside a `RevealGroup` - the group
   * staggers in CSS. Setting it explicitly overrides the group, because an
   * inline custom property beats a stylesheet rule.
   */
  delay?: number
  /** The element this renders AS. Defaults to a div. */
  as?: keyof JSX.IntrinsicElements
}

export function Reveal({ children, delay, as = 'div', style, ...rest }: RevealProps) {
  // React 19 ref callbacks may return a cleanup function.
  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return
    if (node.dataset.revealed === 'true') return
    return observeOnce(node)
  }, [])

  const Tag = as as 'div'
  // Only write the inline variable when a delay was actually asked for, so a
  // RevealGroup's nth-child stagger is not silently overridden by 0ms.
  const merged =
    delay === undefined ? style : ({ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties)

  return (
    <Tag ref={ref} data-reveal="" style={merged} {...rest}>
      {children}
    </Tag>
  )
}

/* ------------------------------------------------------------------ *
 * <RevealGroup>
 * ------------------------------------------------------------------ */

/**
 * The stagger is CSS, not cloneElement.
 *
 * Inspecting children and cloning them with a `delay` prop looks tidier but is
 * unreliable across the server/client boundary: when a Server Component builds
 * `<Reveal>` elements, `child.type` is a client-reference module object, not
 * this file's `Reveal` function, so an identity check silently matches nothing
 * and the whole group lands at once. nth-child has no such failure mode, works
 * for children produced anywhere, and survives `.map()` over a data array.
 *
 * Capped at the 5th child: `:nth-child(n + 5)` catches the 5th and everything
 * after it, so a 40-item grid finishes entering in 240ms rather than 2.4s.
 */
const GROUP_CSS = `
.reveal-group > * { --reveal-delay: calc(var(--reveal-base, 0ms) + 0ms); }
.reveal-group > *:nth-child(2) { --reveal-delay: calc(var(--reveal-base, 0ms) + 60ms); }
.reveal-group > *:nth-child(3) { --reveal-delay: calc(var(--reveal-base, 0ms) + 120ms); }
.reveal-group > *:nth-child(4) { --reveal-delay: calc(var(--reveal-base, 0ms) + 180ms); }
.reveal-group > *:nth-child(n + 5) { --reveal-delay: calc(var(--reveal-base, 0ms) + 240ms); }
`

export type RevealGroupProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children?: ReactNode
  /** Added to every child's staggered delay, in ms. */
  baseDelay?: number
  /**
   * The element this renders AS - pass the grid/flex container itself so the
   * group IS the layout parent rather than an extra box inside it:
   *   <RevealGroup as="ul" className="grid grid-cols-3 gap-[var(--s6)]">
   */
  as?: keyof JSX.IntrinsicElements
}

/** Staggers its direct children by 60ms, capped at the 5th. */
export function RevealGroup({
  children,
  baseDelay = 0,
  as = 'div',
  className = '',
  style,
  ...rest
}: RevealGroupProps) {
  const Tag = as as 'div'
  const merged =
    baseDelay === 0 ? style : ({ ...style, '--reveal-base': `${baseDelay}ms` } as CSSProperties)

  return (
    <>
      <style href="envenox-reveal-group" precedence="default">
        {GROUP_CSS}
      </style>
      <Tag className={['reveal-group', className].filter(Boolean).join(' ')} style={merged} {...rest}>
        {children}
      </Tag>
    </>
  )
}
