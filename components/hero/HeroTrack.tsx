import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { hero as heroCopy } from '@/lib/homepage'
import { site } from '@/lib/site'
import { NetworkCanvas } from './NetworkCanvas'
import s from './hero.module.css'

/**
 * The hero.
 *
 * Server Component. The headline, lede and both CTAs are in the served HTML at
 * full contrast before any JavaScript runs, and they do not move afterwards.
 *
 * WHAT CHANGED AND WHY
 *
 * This hero previously did two things that have been removed.
 *
 * 1. It split the headline into per-word spans and staggered them in, then
 *    re-weighted them as you scrolled. Animating a headline delays the one
 *    thing a visitor came to read, and splitting it meant the accessible name
 *    had to be reassembled with aria-label while the visible words were hidden
 *    from assistive technology. The headline is now plain text.
 *
 * 2. It pinned a 280vh track with a sticky stage. That pin was also the cause of
 *    the nav overlap: the stage stuck at top:0 underneath a fixed 72px nav and
 *    centred its content over the full viewport, so below ~790px of viewport
 *    height the headline sat behind the nav links, and reserving the nav height
 *    merely moved the casualty to the CTAs, which were then clipped by
 *    overflow:hidden. Removing the pin removes the whole class of bug.
 *
 * Motion now lives in one place: the WebGL network behind the type. It is the
 * subject rendered literally - hosts, links, traffic, and traffic being stopped
 * - rather than a decorative effect, and it is additive: NetworkCanvas mounts
 * nothing under reduced motion or WebGL failure and the hero still reads.
 */

export type HeroCta = { label: string; href: string }

export type HeroTrackProps = {
  eyebrow?: string | null
  /** The full headline as one string. Used verbatim when no beats are given. */
  headline?: string
  /** Display lines. `serif` is set in the display italic for emphasis. */
  beats?: readonly { lead: string; serif: string; tail?: string }[]
  subhead?: string
  primaryCta?: HeroCta | null
  secondaryCta?: HeroCta | null
  /** Accepted for call-site compatibility. */
  fallbackAlt?: string
  id?: string
}

export function HeroTrack({
  eyebrow = heroCopy.eyebrow,
  headline = heroCopy.headline,
  beats = heroCopy.beats,
  subhead = heroCopy.subhead,
  primaryCta = heroCopy.primary,
  secondaryCta = heroCopy.secondary,
  id = 'hero',
}: HeroTrackProps) {
  const lines = beats?.length ? beats : [{ lead: headline, serif: '', tail: '' }]

  return (
    <section
      className={`${s.hero} theme-dark grain transition-theme`}
      aria-labelledby={`${id}-heading`}
    >
      <div className={s.stage}>
        {/* Decorative, aria-hidden, and never required. Order matters: the
            canvas sits above the static field so the field acts as its backdrop
            and as the visible layer when WebGL does not start. */}
        <div className={s.field} aria-hidden="true" />
        <NetworkCanvas className={s.canvas} />
        <div className={s.horizon} aria-hidden="true" />

        <div className={`${s.copy} u-container`}>
          {eyebrow ? <p className={`${s.eyebrow} u-eyebrow`}>{eyebrow}</p> : null}

          {/* One heading, one text node per line, no per-word spans. A screen
              reader reads the sentence; there is no aria-label to keep in sync
              with the visible copy because the visible copy IS the name. */}
          <h1 id={`${id}-heading`} className={s.headline}>
            {lines.map((b, i) => (
              <span className={s.line} key={i}>
                {b.lead}
                {b.lead && b.serif ? ' ' : null}
                {b.serif ? <em className={s.serif}>{b.serif}</em> : null}
                {b.tail ? ` ${b.tail}` : null}
              </span>
            ))}
          </h1>

          {subhead ? <p className={s.subhead}>{subhead}</p> : null}

          <div className={s.actions}>
            {primaryCta ? (
              <Button
                href={primaryCta.href}
                variant="primary"
                size="lg"
                iconRight={
                  <ArrowRight size={20} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                }
              >
                {primaryCta.label}
              </Button>
            ) : null}
            {secondaryCta ? (
              <Button href={secondaryCta.href} variant="secondary" size="lg">
                {secondaryCta.label}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* The incident route is a hard requirement at every width, and the hero
          is the one full-bleed section where the nav's own copy can be missed. */}
      <p className="u-sr-only">
        Experiencing a breach? Call {site.contact.irHotline}, answered 24/7.
      </p>
    </section>
  )
}
