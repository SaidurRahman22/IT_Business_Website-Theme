import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * Button - the one button in the system.
 *
 * MOTION CONTRACT (PART 3, non-negotiable):
 *   Hover is a background-color / border-color shift. Nothing else.
 *   No transform, no scale, no translate, no lift, no shadow bloom, ever.
 *   --dur-base --ease-out, and only on the colour properties.
 *
 * COLOUR CONTRACT (PART 2):
 *   Every colour is a theme variable or a color-mix of theme variables, so a
 *   button re-colours with the section it sits in. No hex anywhere.
 *
 * `danger-quiet` deliberately carries NO --signal-* colour. Severity red is
 * reserved for <Badge severity>, and the spec forbids signal colours in
 * buttons. A destructive action earns attention here through restraint - a
 * hairline border and lowered emphasis - not through a red fill.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger-quiet'
export type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonBase = {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  /** Decorative leading node - pass an icon with aria-hidden. */
  iconLeft?: ReactNode
  /** Decorative trailing node - pass an icon with aria-hidden. */
  iconRight?: ReactNode
  fullWidth?: boolean
  className?: string
}

type ButtonAsAnchor = ButtonBase &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> & { href: string }

type ButtonAsButton = ButtonBase &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & { href?: undefined }

export type ButtonProps = ButtonAsAnchor | ButtonAsButton

const CSS = `
.btn {
  --btn-bg: transparent;
  --btn-bg-hover: transparent;
  --btn-fg: var(--fg);
  --btn-border: transparent;
  --btn-border-hover: transparent;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--s2);
  border: 1px solid var(--btn-border);
  border-radius: var(--radius-md);
  background-color: var(--btn-bg);
  color: var(--btn-fg);
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  /* Kills the ~300ms synthetic click delay on touch without disabling zoom. */
  touch-action: manipulation;
  /* ONLY colour transitions. A transform here would break the house rule. */
  transition:
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    color var(--dur-base) var(--ease-out);
}
.btn:hover {
  background-color: var(--btn-bg-hover);
  border-color: var(--btn-border-hover);
  /* Falls back to the resting label colour, so no existing variant changes.
     A variant whose hover fill moves far in lightness needs to move its label
     too, or the hover state quietly fails contrast while the resting state
     passes, which is the kind of thing an audit on static screenshots misses. */
  color: var(--btn-fg-hover, var(--btn-fg));
}
/* PRESS FEEDBACK.
   There was none anywhere on this site: measured 2026-11-07, zero ":active"
   rules in the whole project. Every control had hover and focus and nothing
   on press. On a touch screen hover does not exist at all, so a tap returned
   no confirmation whatsoever until the page changed under the reader.

   This is a colour step, not a transform, because the transition above is
   deliberately colour-only. Each variant declares how far the press moves;
   the fallback chain means a variant that declares nothing simply reuses its
   hover values rather than dropping the declaration entirely. That chain is
   load-bearing: an undefined custom property invalidates the WHOLE
   declaration silently, so "var(--btn-bg-active)" alone would kill the
   background on every button that did not define it.

   --dur-micro, not --dur-base: a press must register instantly. Easing a
   press over the same duration as a hover reads as lag, not as polish. */
.btn:active {
  background-color: var(--btn-bg-active, var(--btn-bg-hover));
  border-color: var(--btn-border-active, var(--btn-border-hover));
  color: var(--btn-fg-hover, var(--btn-fg));
  transition-duration: var(--dur-micro);
}

.btn[aria-disabled='true'],
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
/* A disabled control must not appear to respond to a press either. */
.btn[aria-disabled='true']:active,
.btn:disabled:active {
  background-color: var(--btn-bg);
  border-color: var(--btn-border);
  color: var(--btn-fg);
}
.btn[aria-disabled='true']:hover,
.btn:disabled:hover {
  background-color: var(--btn-bg);
  border-color: var(--btn-border);
}

/* ---- sizes. md and lg clear the 44x44 touch target. ---- */
.btn--sm { min-height: 32px; padding-inline: var(--s3); font-size: var(--text-sm); }
.btn--md { min-height: 44px; min-width: 44px; padding-inline: var(--s4); font-size: var(--text-sm); }
.btn--lg { min-height: 52px; min-width: 52px; padding-inline: var(--s6); font-size: var(--text-base); }

.btn--full { width: 100%; }

/* ---- variants ---- */
.btn--primary {
  --btn-bg: var(--accent);
  --btn-fg: var(--accent-fg);
  --btn-bg-hover: color-mix(in oklab, var(--accent) 82%, var(--fg) 18%);
  --btn-bg-active: color-mix(in oklab, var(--accent) 68%, var(--fg) 32%);
  --btn-border: var(--accent);
  --btn-border-hover: color-mix(in oklab, var(--accent) 82%, var(--fg) 18%);
  --btn-border-active: color-mix(in oklab, var(--accent) 68%, var(--fg) 32%);
}
.theme-light .btn--primary {
  /* On paper, --accent is the DARK copper (#A5111E) because it has to pass
     4.5:1 as link TEXT. As a large filled surface that same value reads muddy
     brown, which is not what the brand is. A fill has a different contrast
     problem from text: the requirement is on the LABEL against the fill, and
     ink on vibrant copper measures 6.9:1, comfortably clear. So the fill gets
     the real brand copper and the label goes dark. Links and the focus ring
     keep --accent and stay legible. */
  --btn-bg: var(--accent-500);
  --btn-fg: var(--ink-900);
  --btn-bg-hover: var(--accent-600);
  --btn-bg-active: color-mix(in oklab, var(--accent-600) 84%, var(--ink-900) 16%);
  --btn-fg-hover: var(--paper-50);
  --btn-border: var(--accent-500);
  --btn-border-hover: var(--accent-600);
  --btn-border-active: color-mix(in oklab, var(--accent-600) 84%, var(--ink-900) 16%);
}
.btn--secondary {
  --btn-fg: var(--fg);
  --btn-border: var(--border-strong);
  --btn-bg-hover: var(--surface);
  --btn-bg-active: color-mix(in oklab, var(--surface) 88%, var(--fg) 12%);
  --btn-border-hover: var(--fg);
}
.btn--ghost {
  --btn-fg: var(--muted-strong);
  --btn-bg-hover: var(--surface);
  --btn-bg-active: color-mix(in oklab, var(--surface) 88%, var(--fg) 12%);
  --btn-border-hover: var(--border);
}
.btn--ghost:hover { color: var(--fg); }
.btn--danger-quiet {
  --btn-fg: var(--muted-strong);
  --btn-border: var(--border-strong);
  --btn-bg-hover: var(--surface);
  --btn-bg-active: color-mix(in oklab, var(--surface) 88%, var(--fg) 12%);
  --btn-border-hover: var(--muted-strong);
}
.btn--danger-quiet:hover { color: var(--fg); }

.btn__icon { display: inline-flex; flex: none; }
`

function classes(variant: ButtonVariant, size: ButtonSize, fullWidth: boolean, extra: string) {
  return ['btn', `btn--${variant}`, `btn--${size}`, fullWidth ? 'btn--full' : '', extra]
    .filter(Boolean)
    .join(' ')
}

export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    size = 'md',
    iconLeft,
    iconRight,
    fullWidth = false,
    className = '',
  } = props

  const inner = (
    <>
      {iconLeft ? <span className="btn__icon">{iconLeft}</span> : null}
      <span>{children}</span>
      {iconRight ? <span className="btn__icon">{iconRight}</span> : null}
    </>
  )

  const sheet = (
    <style href="envenox-button" precedence="default">
      {CSS}
    </style>
  )

  const cn = classes(variant, size, fullWidth, className)

  if (typeof props.href === 'string') {
    const {
      href,
      children: _c,
      variant: _v,
      size: _s,
      iconLeft: _il,
      iconRight: _ir,
      fullWidth: _f,
      className: _cn,
      ...anchorProps
    } = props as ButtonAsAnchor

    // In-app paths get next/link (prefetch + client nav). It still emits a real
    // <a href> in the server HTML, so the no-JS path is unaffected.
    // tel:, mailto:, #hash and absolute URLs stay plain anchors.
    const internal = href.startsWith('/')

    if (internal) {
      return (
        <>
          {sheet}
          <Link href={href} className={cn} {...anchorProps}>
            {inner}
          </Link>
        </>
      )
    }
    return (
      <>
        {sheet}
        <a href={href} className={cn} {...anchorProps}>
          {inner}
        </a>
      </>
    )
  }

  const {
    children: _c,
    variant: _v,
    size: _s,
    iconLeft: _il,
    iconRight: _ir,
    fullWidth: _f,
    className: _cn,
    href: _h,
    type = 'button',
    ...buttonProps
  } = props as ButtonAsButton

  return (
    <>
      {sheet}
      <button type={type} className={cn} {...buttonProps}>
        {inner}
      </button>
    </>
  )
}

export default Button
