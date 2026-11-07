// Keep the lucide-react import FIRST and braced - scripts/check-icons.mjs reads
// named imports out of this file and the house convention is to lead with them.
import { ArrowRight, ArrowUpRight, BadgeCheck, Handshake, Lock, Star } from 'lucide-react'

import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { HeroTrack } from '@/components/hero/HeroTrack'
import { AdversaryLoop } from '@/components/story/AdversaryLoop'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardLink } from '@/components/ui/Card'
import { ChapterOpener } from '@/components/ui/ChapterOpener'
import { Marquee } from '@/components/ui/Marquee'
import { Prose } from '@/components/ui/Prose'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { Stat } from '@/components/ui/Stat'
import { StatBar } from '@/components/ui/StatBar'

import { caseStudies } from '@/lib/case-studies'
import { CAPTIONS } from '@/lib/product-fixtures'
import {
  closingCta,
  credentialsRow,
  hero,
  insightsTeaser,
  methodologyTeaser,
  problem,
  split,
} from '@/lib/homepage'
import {
  certifications,
  clients,
  industries,
  partners,
  reviewBadges,
} from '@/lib/proof'
import { pillars, servicesBySlug } from '@/lib/services'
import { headlineStats, site, teamCredentials } from '@/lib/site'

/* ==========================================================================
 * HOMEPAGE
 *
 * Assembly only. Every sentence on this page comes from lib/homepage.ts,
 * lib/site.ts, lib/proof.ts, lib/services.ts or lib/case-studies.ts. The only
 * strings authored here are structural labels ("Services", "Industries",
 * "Under NDA", "Source") and accessible names.
 *
 * THEME CHOREOGRAPHY - the palette is the argument, not decoration:
 *   hero · clients · problem · the split intro + Software development → theme-dark
 *   the Security practice pillar                                      → theme-light
 *   the seam (Secure SDLC)                                            → theme-deep
 *   what the work looks like, part one                                → theme-dark
 *   what the work looks like, part two                                → theme-deep
 *   services · proof · case study                                     → theme-light
 *   the Adversary Loop · credentials · industries                     → theme-dark
 *   insights                                                          → theme-light
 *   closing                                                           → theme-deep
 * The dark→light move lands BETWEEN the two pillars - that movement is the two
 * businesses. Each band is a <Section>, which carries its theme class plus
 * .transition-theme and the data-theme-section hook the nav re-colours from.
 *
 * ARTEFACTS - the page used to run twelve sections with no visual artefact in
 * any of them, which for a firm whose claim is craft is an argument it refuses
 * to show. There are now nine product consoles on it, every one of them a
 * Server Component drawn in HTML/CSS/SVG rather than a screenshot, every one
 * carrying an honest caption, and all nine sharing one fictional tenant so
 * they read as one company's systems rather than nine mood boards. Each sits
 * in <Console> below; read that component's comment for why.
 *
 * NUMBERS: every figure on this page is server-rendered text. <Stat> and
 * <StatBar> ship the final value in the first byte of HTML and animate FROM it;
 * the case-study metrics and the nine-day figure are plain text nodes. Nothing
 * counts up from zero, so a crawler, a link preview and a no-JS reader all see
 * "240+", "9 days" and "0 critical, 2 high".
 *
 * JSON-LD: app/layout.tsx already emits Organization + WebSite sitewide, so
 * this page deliberately emits neither. Re-declaring them would give the
 * document two @id-colliding graphs.
 *
 * NOT BUILT HERE, DELIBERATELY: the `router` block in lib/homepage.ts (the
 * section order in the brief is fixed and does not include it) and
 * <SecureSdlcPipeline> (its own docstring reserves it as the second
 * scroll-driven moment on the site, on /services/devsecops).
 * ========================================================================== */

export const metadata: Metadata = {
  title: { absolute: `${site.name}, ${site.tagline}` },
  description: hero.subhead,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: hero.headline,
    description: hero.subhead,
    url: site.url,
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: hero.headline,
    description: hero.subhead,
  },
}

/* -------------------------------------------------------------------------- *
 * Page-local layout. Same `<style href precedence>` pattern every component in
 * components/ui uses, so it hoists once and dedupes. Every colour is a theme
 * variable; every space, radius, duration and easing is a token. No hover
 * transform, scale or lift anywhere - hover is a colour shift.
 * -------------------------------------------------------------------------- */
const CSS = `
.hp-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.hp-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s6);
  flex-wrap: wrap;
}

.hp-h2 { font-size: var(--text-2xl); margin: 0; max-width: 26ch; }
@media (min-width: 768px) { .hp-h2 { font-size: var(--text-3xl); } }
.hp-h2--wide { max-width: 34ch; }

.hp-lede { color: var(--muted-strong); max-width: 62ch; margin: var(--s6) 0 0; }
.hp-note { color: var(--muted); font-size: var(--text-sm); max-width: 62ch; margin: 0; }

.hp-stack > * + * { margin-top: var(--s12); }
.hp-stack-tight > * + * { margin-top: var(--s6); }

.hp-link {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  color: var(--fg);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-out);
}
.hp-link:hover { color: var(--muted-strong); }

.hp-actions { display: flex; flex-wrap: wrap; gap: var(--s3); }

/* ---- logo wall ---- */
.hp-logos__head { margin-bottom: var(--s6); }

/* ---- problem ---- */
.hp-problem { display: grid; gap: var(--s12); }
@media (min-width: 1024px) {
  .hp-problem { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--s16); }
}
.hp-evidence { border-left: 1px solid var(--accent); padding-left: var(--s6); }
.hp-evidence__figure {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: var(--tracking-tight);
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.hp-evidence__label { color: var(--muted); font-size: var(--text-sm); margin: var(--s2) 0 var(--s4); max-width: 42ch; }

/* ---- the console wrapper ----
   EVERY console on this page sits in one of these, and the three declarations
   that matter are not cosmetic:

   position: relative, the containing block. The .u-sr-only utility and the
   product components' own .srOnly are position: absolute, and every
   [data-reveal] element carries a non-none translate, which makes THAT element
   their containing block. An absolutely positioned element is only clipped by an
   ancestor's overflow when that ancestor is in its containing-block chain, so
   without this, visually-hidden text inside a 1,000px-wide console table
   escapes the scroller, lands off to the right, and silently gives the whole
   page a horizontal scrollbar. That has cost one real 930px overflow at 390px
   on this codebase already; globals.css documents it at .u-sr-only.

   overflow-x: auto, the safety net. The consoles shrink to their container and
   scroll their own tables internally, so this rarely bites; when a future
   console does out-measure its column, it scrolls here rather than widening
   the document.

   min-width: 0, a grid/flex item defaults to min-width: auto and refuses to
   shrink below its min-content width, which would push the pillar grid wider
   than the viewport before overflow-x ever got a chance to apply. */
.hp-console {
  position: relative;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  min-width: 0;
  max-width: 100%;
  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
}
.hp-console:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 4px;
  border-radius: var(--radius-md);
}

/* ---- a pillar that carries its artefact beside its copy ---- */
.hp-pillar2 { display: grid; gap: var(--s8); align-items: start; }
.hp-pillar2 > * { min-width: 0; }
@media (min-width: 1100px) {
  .hp-pillar2 { grid-template-columns: minmax(0, 24rem) minmax(0, 1fr); gap: var(--s12); }
}

/* ---- the pillar's image ----
   WHY THERE IS AN IMAGE HERE AT ALL. The right-hand column of .hp-pillar2 used
   to hold a product console. When the homepage was cut from 16 bands to 11 the
   console went with it and nothing replaced it, so at >=1100px the copy sat in
   a 24rem gutter beside roughly 770px of empty band - visible in both pillars
   and in the seam between them.

   The fix is NOT to widen the measure. .hp-pillar__body is capped at 62ch,
   which is already the top of the comfortable range; letting it run the full
   band would make the paragraph harder to read, not the layout better. The
   column needs something in it, and the two pillars are the one place on the
   page where an image can carry meaning rather than fill space: the thing we
   build, and the thing we take apart.

   align-self: start keeps the image pinned to the top of the row so the two
   columns share a baseline instead of the image floating mid-row when the copy
   is taller than it. */
.hp-pillar__media { margin: 0; align-self: start; }
.hp-pillar__media img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  /* The palette is one accent on a near-neutral ground, and these are
     photographic. A measured desaturation keeps them inside it rather than
     introducing a second colour temperature beside the only accent the page
     has. It is a grade, not a filter effect: contrast is barely touched. */
  filter: saturate(0.42) contrast(1.05);
}
.hp-pillar__caption {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--muted);
  letter-spacing: 0.02em;
  margin: var(--s3) 0 0;
}
/* Below the two-column breakpoint the image is a wide band above the copy; a
   4:3 crop at full width on a phone eats most of a screen for atmosphere. */
@media (max-width: 1099px) {
  .hp-pillar__media img { aspect-ratio: 16 / 9; }
}

/* ---- the work band ---- */
.hp-work { display: grid; gap: var(--s20); }
@media (min-width: 768px) { .hp-work { gap: var(--s24); } }
.hp-work__intro { max-width: 68ch; }
.hp-work__prose { display: grid; gap: var(--s4); }
.hp-work__prose p { color: var(--muted-strong); margin: 0; max-width: 68ch; }
.hp-work__tabs { display: grid; gap: var(--s6); }

/* ---- the two pillars ---- */
.hp-pillar { display: grid; gap: var(--s8); }
@media (min-width: 900px) {
  .hp-pillar {
    grid-template-columns: 6rem minmax(0, 1fr) minmax(0, 17rem);
    gap: var(--s12);
    align-items: start;
  }
}
.hp-pillar__index {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-sm);
  color: var(--muted);
  margin: 0;
}
.hp-pillar__name { font-size: var(--text-2xl); margin: 0; }
@media (min-width: 768px) { .hp-pillar__name { font-size: var(--text-3xl); } }
.hp-pillar__line { color: var(--muted); margin: var(--s3) 0 0; }
.hp-pillar__body { color: var(--muted-strong); margin: var(--s6) 0 0; max-width: 62ch; }
.hp-pillar__proof { border-top: 1px solid var(--border); padding-top: var(--s6); }

/* ---- the seam. The heaviest block on the page after the hero. ---- */
.hp-join {
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xl);
  background-color: var(--surface);
  padding: var(--s8);
  display: grid;
  gap: var(--s12);
}
@media (min-width: 900px) {
  .hp-join {
    padding: var(--s16);
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: var(--s16);
    align-items: center;
  }
}
.hp-join__heading { font-size: var(--text-3xl); margin: var(--s4) 0 0; }
@media (min-width: 768px) { .hp-join__heading { font-size: var(--text-4xl); } }
.hp-join__body { color: var(--muted-strong); margin: var(--s6) 0 var(--s8); max-width: 54ch; }
.hp-join__figure {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-4xl);
  font-weight: 600;
  line-height: 1.02;
  letter-spacing: var(--tracking-tight);
  font-variant-numeric: tabular-nums;
  margin: 0;
}
@media (min-width: 768px) { .hp-join__figure { font-size: var(--text-5xl); } }
.hp-join__figure-label { color: var(--muted); font-size: var(--text-sm); margin: var(--s4) 0 0; max-width: 34ch; }
.hp-seam { display: block; width: 100%; height: auto; color: var(--border-strong); }
.hp-seam__labels {
  display: flex;
  justify-content: space-between;
  gap: var(--s4);
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--muted);
}

/* ---- card grids ---- */
.hp-grid { display: grid; gap: var(--s4); list-style: none; margin: 0; padding: 0; }
@media (min-width: 640px) { .hp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .hp-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.hp-card { display: flex; flex-direction: column; height: 100%; gap: var(--s3); }
.hp-card__icon { color: var(--muted); }
.hp-card__title { font-size: var(--text-lg); margin: 0; }
.hp-card__line { color: var(--muted); font-size: var(--text-sm); margin: 0; }
.hp-card__foot {
  margin-top: auto;
  padding-top: var(--s4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  font-size: var(--text-xs);
  color: var(--muted);
}

/* ---- featured case study ---- */
.hp-case { display: grid; gap: var(--s12); }
@media (min-width: 1024px) {
  .hp-case { grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: var(--s16); align-items: start; }
}
.hp-case__meta { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s3); }
.hp-case__anon {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--muted);
}
.hp-case__headline { font-size: var(--text-2xl); margin: var(--s6) 0 0; max-width: 30ch; }
@media (min-width: 768px) { .hp-case__headline { font-size: var(--text-3xl); } }

.hp-metrics { display: grid; gap: var(--s6); list-style: none; margin: var(--s12) 0 0; padding: 0; }
@media (min-width: 640px) { .hp-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; } }
.hp-metric { border-top: 1px solid var(--border); padding-top: var(--s4); }
@media (min-width: 640px) {
  .hp-metric { padding: var(--s4) var(--s6) 0 0; }
  .hp-metric + .hp-metric { border-left: 1px solid var(--border); padding-left: var(--s6); }
}
.hp-metric__value {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: var(--tracking-tight);
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.hp-metric__label { color: var(--muted-strong); font-size: var(--text-sm); margin: var(--s2) 0 0; }
.hp-metric__note { color: var(--muted); font-size: var(--text-xs); margin: var(--s2) 0 0; }

.hp-quote {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background-color: var(--surface);
  padding: var(--s8);
}
.hp-quote blockquote {
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-lg);
  font-weight: 500;
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
}
.hp-quote figcaption { margin-top: var(--s6); font-size: var(--text-sm); color: var(--muted); }
.hp-quote figcaption b { display: block; color: var(--fg); font-weight: 500; }

/* ---- the Adversary Loop ----
   Lives in components/story/AdversaryLoop.tsx, which carries its own CSS and
   its own layout. Nothing is needed here. */

/* ---- credentials ---- */
.hp-creds { display: grid; gap: var(--s12); }
.hp-cred-counts { display: flex; flex-wrap: wrap; gap: var(--s6) var(--s12); list-style: none; margin: 0; padding: 0; }
.hp-cred-count { display: flex; align-items: baseline; gap: var(--s2); }
.hp-cred-count__n {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1;
  letter-spacing: var(--tracking-tight);
  font-variant-numeric: tabular-nums;
}
.hp-cred-count__l { font-size: var(--text-sm); color: var(--muted); }

.hp-sub { font-size: var(--text-sm); font-weight: 500; color: var(--fg); margin: 0 0 var(--s4); }
.hp-chips { display: flex; flex-wrap: wrap; gap: var(--s2); list-style: none; margin: 0; padding: 0; }
.hp-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background-color: var(--surface);
  color: var(--muted-strong);
  padding: var(--s2) var(--s3);
  font-size: var(--text-xs);
  line-height: 1.3;
  max-width: 100%;
  text-decoration: none;
  /* Colour only. */
  transition: border-color var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}
a.hp-chip:hover { border-color: var(--border-strong); color: var(--fg); }
.hp-chip__mark { flex: none; color: var(--muted); }

.hp-reviews { display: grid; gap: var(--s8); }
@media (min-width: 768px) { .hp-reviews { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s12); } }
.hp-review {
  display: flex;
  align-items: center;
  gap: var(--s3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  padding: var(--s3) var(--s4);
  color: var(--muted-strong);
  font-size: var(--text-sm);
  text-decoration: none;
  transition: border-color var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}
.hp-review:hover { border-color: var(--border-strong); color: var(--fg); }
.hp-review__score {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--fg);
  line-height: 1;
}

/* ---- industries ---- */
.hp-ind__name { font-size: var(--text-lg); margin: 0 0 var(--s2); }
.hp-ind__pressure { color: var(--muted); font-size: var(--text-sm); margin: 0 0 var(--s4); }

/* ---- closing ---- */
.hp-cta { display: grid; gap: var(--s12); }
@media (min-width: 1024px) {
  .hp-cta { grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: var(--s16); align-items: start; }
}
.hp-reassure { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s4); }
.hp-reassure li {
  display: flex;
  gap: var(--s3);
  color: var(--muted);
  font-size: var(--text-sm);
  line-height: 1.5;
}
.hp-reassure li::before {
  content: '';
  flex: none;
  width: 6px;
  height: 1px;
  margin-top: 0.7em;
  background-color: var(--border-strong);
}
`

/* -------------------------------------------------------------------------- *
 * DATA SELECTION
 * -------------------------------------------------------------------------- */

/** 6 cards, 3 per pillar, so the grid itself restates the dual structure. */
const SERVICE_GRID = [
  'penetration-testing',
  'application-security',
  'managed-detection-response',
  'custom-software',
  'platform-engineering',
  'web-application-development',
] as const

/**
 * The featured study: the one that is both `featured` and `dualPillar`, because
 * the homepage argument is the join. Falls through to any featured study, then
 * to the first, so the section can never render empty.
 */
const featuredCase =
  caseStudies.find((c) => c.featured && c.dualPillar) ??
  caseStudies.find((c) => c.featured) ??
  caseStudies[0]

const softwareReviews = reviewBadges.filter((b) => b.pillar === 'software')
const securityReviews = reviewBadges.filter((b) => b.pillar === 'security')

const pillarName = (pillar: 'security' | 'software' | 'join') =>
  pillar === 'software' ? pillars.software.name : pillars.security.name

/* -------------------------------------------------------------------------- *
 * CONSOLE WRAPPER
 *
 * Every product console on this page goes through here. It does three jobs,
 * and the CSS block above explains why each one is load-bearing rather than
 * decorative: it is the containing block that stops visually-hidden text
 * escaping and widening the document; it is the horizontal scroller of last
 * resort; and it is a named, focusable region, because a scrollable area a
 * keyboard user cannot focus is an area they cannot read the right-hand side
 * of. The consoles also scroll their own tables internally and name those
 * scrollers too, so in practice this outer one rarely has anything to scroll -
 * it is the backstop, and it costs one tab stop per console to have it.
 * -------------------------------------------------------------------------- */
function Console({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="hp-console" role="group" aria-label={label} tabIndex={0}>
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- *
 * PAGE
 * -------------------------------------------------------------------------- */

export default function HomePage() {
  return (
    <>
      <style href="envenox-home" precedence="default">
        {CSS}
      </style>

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <HeroTrack
        eyebrow={hero.eyebrow}
        headline={hero.headline}
        subhead={hero.subhead}
        primaryCta={hero.primary}
        secondaryCta={hero.secondary}
        fallbackAlt={hero.fallbackAlt}
      />

      {/* ── 2. CLIENT LOGO STRIP, immediately, not three sections later ──
          No logo files exist yet, so the readable text label IS the treatment:
          a typographic wall rather than a row of grey boxes. Marquee renders
          the label as content and the (absent) mark as decoration. */}
      <Section theme="dark" tight bleed aria-labelledby="clients-heading">
        <div className="u-container hp-logos__head">
          <h2 id="clients-heading" className="u-eyebrow">
            Selected clients
          </h2>
        </div>
        <Marquee
          items={clients.map((c) => ({ label: c.label, meta: c.industry }))}
          ariaLabel="Selected clients"
          duration="64s"
        />
      </Section>


      {/* ── 4a. THE SPLIT, intro + the SOFTWARE pillar (split.pillars[0]),
              on the warm ground. ───────────────────────────────────────── */}
      <Section theme="dark" grain aria-labelledby="split-heading">
        <div className="hp-stack">
          <Reveal>
            <p className="u-eyebrow">{split.eyebrow}</p>
            <h2 id="split-heading" className="hp-h2 hp-h2--wide" style={{ marginTop: 'var(--s4)' }}>
              {split.heading}
            </h2>
          </Reveal>

          {/* The pillar carries its artefact beside its copy. Until this
              landed the page made two large claims about what the firm does
              and showed nothing either of them produces, which is the whole
              complaint.

              NOTE ON ORDER, because the comments here were stale and it cost
              a wrong placement before it was caught: split.pillars[0] is
              SOFTWARE DEVELOPMENT, not security. lib/homepage.ts puts software
              first on purpose, "It is the business; security is what makes
              the business trustworthy", and the old section headings here
              still described the previous, security-first order. So this,
              01 / 02, is the software pillar, and it gets the pipeline run. */}
          <Reveal className="hp-pillar2">
            <div>
              <p className="hp-pillar__index">01 / 02</p>
              <h3 className="hp-pillar__name" style={{ marginTop: 'var(--s3)' }}>
                {split.pillars[0].name}
              </h3>
              <p className="hp-pillar__line">{split.pillars[0].line}</p>
              <p className="hp-pillar__body">{split.pillars[0].body}</p>
              <div className="hp-pillar__proof" style={{ marginTop: 'var(--s8)' }}>
                <Stat
                  value={split.pillars[0].proof.figure}
                  label={split.pillars[0].proof.label}
                  size="md"
                  provenance="none"
                />
              </div>
              <div style={{ marginTop: 'var(--s8)' }}>
                <Button
                  href={split.pillars[0].href}
                  variant="secondary"
                  iconRight={
                    <ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                  }
                >
                  {split.pillars[0].name}
                </Button>
              </div>
            </div>

            {/* alt="" because the figure is atmospheric, not informative: the
                caption below it is real text and already says what it is, so an
                alt would make a screen reader hear the same thing twice.

                The caption is not decoration either. This band carries the line
                "27 of 31 systems we have built are now run by the client's own
                team"; a photograph of a rack next to that sentence invites the
                reading that the rack IS one of them. It is not, and the caption
                says so rather than leaving the implication standing. */}
            <figure className="hp-pillar__media">
              <img
                src="/img/practice-build.webp"
                alt=""
                width={1600}
                height={1200}
                loading="lazy"
                decoding="async"
              />
              <figcaption className="hp-pillar__caption">
                Illustrative, not client infrastructure · Kier in Sight Archives / Unsplash
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Section>

      {/* ── 4b. THE SPLIT, the SECURITY pillar (split.pillars[1]), on paper.
              The dark→light move lands between the two businesses. ───── */}
      <Section theme="light" aria-labelledby="pillar-security">
        <Reveal className="hp-pillar2">
          <div>
            <p className="hp-pillar__index">02 / 02</p>
            <h2 id="pillar-security" className="hp-pillar__name" style={{ marginTop: 'var(--s3)' }}>
              {split.pillars[1].name}
            </h2>
            <p className="hp-pillar__line">{split.pillars[1].line}</p>
            <p className="hp-pillar__body">{split.pillars[1].body}</p>
            <div className="hp-pillar__proof" style={{ marginTop: 'var(--s8)' }}>
              <Stat
                value={split.pillars[1].proof.figure}
                label={split.pillars[1].proof.label}
                size="md"
                provenance="none"
              />
            </div>
            <div style={{ marginTop: 'var(--s8)' }}>
              <Button
                href={split.pillars[1].href}
                variant="secondary"
                iconRight={
                  <ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                }
              >
                {split.pillars[1].name}
              </Button>
            </div>
          </div>

          {/* The pair is ONE idea, not two pictures. Both frames are a dense
              repeating orthogonal grid shot flat on; one is near-black, the
              other near-white. The page already moves from dark to light
              exactly here, between the two businesses, and the images carry
              that move rather than sitting beside it.

              A stock photograph of a server room was rejected for this slot
              even though it matched the subject better: it had another
              company's logo repeated across four racks, and putting a third
              party's branding on this page would read as a client or a
              partner. Nothing here is anyone's mark. */}
          <figure className="hp-pillar__media">
            <img
              src="/img/practice-security.webp"
              alt=""
              width={1600}
              height={1200}
              loading="lazy"
              decoding="async"
            />
            <figcaption className="hp-pillar__caption">
              Illustrative · bady abbas / Unsplash
            </figcaption>
          </figure>
        </Reveal>
      </Section>

      {/* ── 4c. THE SEAM, Secure SDLC. The thing the whole page builds
              toward. A deep band set between two light ones, so the block
              reads as an inset plate rather than another row. ─────────── */}
      <Section theme="deep" grain aria-labelledby="join-heading">
        <Reveal className="hp-join">
          <div>
            <p className="u-eyebrow">{split.join.eyebrow}</p>
            <h2 id="join-heading" className="hp-join__heading">
              {split.join.heading}
            </h2>
            <p className="hp-join__body">{split.join.body}</p>
            <div className="hp-actions">
              <Button
                href={split.join.href}
                variant="primary"
                size="lg"
                iconRight={
                  <ArrowRight size={18} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                }
              >
                {split.join.cta}
              </Button>
            </div>
          </div>

          <div>
            {/* Two lanes converging into one. Static, fully drawn with no
                JavaScript and nothing to animate under reduced motion. */}
            <div className="hp-seam__labels">
              <span>{split.pillars[0].name}</span>
              <span>{split.pillars[1].name}</span>
            </div>
            <svg
              className="hp-seam"
              viewBox="0 0 320 72"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M8 4 V28 C8 44 48 44 96 44 H224 C272 44 312 44 312 28 V4"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path d="M160 44 V68" stroke="currentColor" strokeWidth="1" />
            </svg>
            <p className="hp-join__figure u-tnum" style={{ marginTop: 'var(--s6)' }}>
              {split.join.figure}
            </p>
            <p className="hp-join__figure-label">{split.join.figureLabel}</p>
          </div>
        </Reveal>
      </Section>



      {/* ── 5. SERVICE PILLAR GRID: 6 cards, 3 per pillar ───────────────── */}
      <Section theme="light" aria-labelledby="services-heading">
        <div className="hp-stack">
          <div className="hp-head">
            <h2 id="services-heading" className="hp-h2">
              Services
            </h2>
            <Link className="hp-link u-link" href="/services">
              All services
              <ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            </Link>
          </div>

          <RevealGroup as="ul" className="hp-grid hp-grid--3">
            {SERVICE_GRID.map((slug) => {
              const service = servicesBySlug[slug]
              const Icon = service.icon
              return (
                <Reveal as="li" key={slug}>
                  <Card padding="lg" className="hp-card">
                    <Icon
                      className="hp-card__icon"
                      size={24}
                      strokeWidth={1.75}
                      absoluteStrokeWidth
                      aria-hidden="true"
                    />
                    <h3 className="hp-card__title">
                      <CardLink href={`/services/${service.slug}`}>{service.name}</CardLink>
                    </h3>
                    <p className="hp-card__line">{service.cardLine}</p>
                    <div className="hp-card__foot">
                      <Badge variant="neutral">{pillarName(service.pillar)}</Badge>
                      <ArrowUpRight
                        size={16}
                        strokeWidth={1.75}
                        absoluteStrokeWidth
                        aria-hidden="true"
                      />
                    </div>
                  </Card>
                </Reveal>
              )
            })}
          </RevealGroup>
        </div>
      </Section>

      {/* ── 6. PROOF BAR: 4 stats, every figure server-rendered, every
              figure carrying its source and as-of date in a <details>. ── */}
      <Section theme="light" tight aria-labelledby="proof-heading">
        <h2 id="proof-heading" className="hp-sr">
          Envenox at a glance
        </h2>
        <StatBar
          stats={headlineStats}
          ariaLabel="Envenox at a glance"
          columns={4}
          size="lg"
          provenance="details"
        />
      </Section>

      {/* ── 7. FEATURED CASE STUDY: one number, one named quote ─────────── */}
      <Section theme="light" aria-labelledby="case-heading">
        <div className="hp-case">
          <Reveal>
            <p className="u-eyebrow">Case study</p>
            <div className="hp-case__meta" style={{ marginTop: 'var(--s4)' }}>
              {featuredCase.nda ? (
                <Badge variant="neutral" size="md">
                  <Lock size={12} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                  Under NDA
                </Badge>
              ) : null}
              <span className="hp-case__anon">
                {featuredCase.client ?? featuredCase.anonymisedAs}
              </span>
            </div>

            <h2 id="case-heading" className="hp-case__headline">
              {featuredCase.headline}
            </h2>

            <ul className="hp-metrics">
              {featuredCase.metrics.map((m) => (
                <li className="hp-metric" key={m.label}>
                  <p className="hp-metric__value u-tnum">{m.value}</p>
                  <p className="hp-metric__label">{m.label}</p>
                  {m.note ? <p className="hp-metric__note">{m.note}</p> : null}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 'var(--s12)' }}>
              <Button
                href={`/case-studies/${featuredCase.slug}`}
                variant="secondary"
                iconRight={
                  <ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                }
              >
                Read the case study
              </Button>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <figure className="hp-quote">
              <blockquote>{featuredCase.quote.text}</blockquote>
              <figcaption>
                <b>{featuredCase.quote.role}</b>
                {featuredCase.quote.company}
              </figcaption>
            </figure>
          </Reveal>
        </div>

        {/* The artefact the study is actually about. Its third approach step
            is titled "One backlog", "security findings entered the same
            backlog as features, with the same refinement and the same sprint
            commitment. There was no security backlog to deprioritise, because
            there was no security backlog." Every firm can write that sentence.
            A board where you can count five security tickets sitting in the
            same four columns, with points from the same refinement and their
            provenance printed on the card, is the version you can check. */}
      </Section>

      {/* ── 8. HOW WE WORK, the five Adversary Loop steps ────────────────
              This was a <CardStack>: five sticky rounded boxes running 1,848px
              for 200 words, numbered 01 to 05 in a straight line. A straight
              line is the one shape this section cannot be, because the whole
              claim is that 05 feeds 01. <AdversaryLoop> draws the rail and the
              return path and carries its own CSS; see the note at the top of
              that file. */}
      <Section theme="dark" grain aria-labelledby="loop-heading">
        <AdversaryLoop
          eyebrow={methodologyTeaser.eyebrow}
          name={methodologyTeaser.name}
          line={methodologyTeaser.line}
          steps={methodologyTeaser.steps}
          returnPath={methodologyTeaser.returnPath}
          href={methodologyTeaser.href}
          cta={methodologyTeaser.cta}
          headingId="loop-heading"
        />
      </Section>

      {/* ── 9. CREDENTIALS ROW, aggregate counts, company certifications,
              partner tiers, and the review badges split by pillar ─────── */}
      <Section theme="dark" tight aria-labelledby="creds-heading">
        <div className="hp-creds">
          <div>
            <p className="u-eyebrow">{credentialsRow.eyebrow}</p>
            <h2 id="creds-heading" className="hp-h2" style={{ marginTop: 'var(--s4)' }}>
              {credentialsRow.heading}
            </h2>
          </div>

          {/* The aggregate counts. "14 OSCP · 6 CISSP · 4 CREST CRT", more
              persuasive than any adjective, and legible without JavaScript. */}
          <ul className="hp-cred-counts" aria-label="Certifications held across the practice">
            {teamCredentials.map((c) => (
              <li className="hp-cred-count" key={c.label}>
                <span className="hp-cred-count__n u-tnum">{c.count}</span>
                <span className="hp-cred-count__l">{c.label}</span>
              </li>
            ))}
          </ul>

          <div>
            <h3 className="hp-sub">Company certifications</h3>
            <ul className="hp-chips">
              {certifications.map((c) => (
                <li key={c.slug}>
                  <Link className="hp-chip" href={`${credentialsRow.href}#${c.slug}`}>
                    <BadgeCheck
                      className="hp-chip__mark"
                      size={14}
                      strokeWidth={1.75}
                      absoluteStrokeWidth
                      aria-hidden="true"
                    />
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="hp-sub">Partner tiers</h3>
            <ul className="hp-chips">
              {partners.map((p) => (
                <li key={p.name}>
                  <span className="hp-chip">
                    <Handshake
                      className="hp-chip__mark"
                      size={14}
                      strokeWidth={1.75}
                      absoluteStrokeWidth
                      aria-hidden="true"
                    />
                    {p.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Review badges differ by pillar and a hybrid firm needs both shown.
              The split is the point, so it is labelled rather than merged. */}
          <div className="hp-reviews">
            {[
              { heading: pillars.software.name, badges: softwareReviews },
              { heading: pillars.security.name, badges: securityReviews },
            ].map((group) => (
              <div key={group.heading}>
                <h3 className="hp-sub">{group.heading}</h3>
                <ul className="hp-chips" style={{ gap: 'var(--s3)' }}>
                  {group.badges.map((b) => (
                    <li key={b.source}>
                      <a
                        className="hp-review"
                        href={b.href}
                        rel="noopener nofollow"
                        target="_blank"
                      >
                        <Star
                          size={16}
                          strokeWidth={1.75}
                          absoluteStrokeWidth
                          aria-hidden="true"
                          style={{ color: 'var(--muted)' }}
                        />
                        <span className="hp-review__score u-tnum">{b.score}</span>
                        <span>{b.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="hp-stack-tight">
            <p className="hp-note">{credentialsRow.note}</p>
            <Link className="hp-link u-link" href={credentialsRow.href}>
              {credentialsRow.cta}
              <ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>


      {/* ── 11. INSIGHTS / RESEARCH TEASER: three cards ─────────────────── */}
      <Section theme="light" aria-labelledby="insights-heading">
        <div className="hp-stack">
          <div className="hp-head">
            <div>
              <p className="u-eyebrow">{insightsTeaser.eyebrow}</p>
              <h2 id="insights-heading" className="hp-h2" style={{ marginTop: 'var(--s4)' }}>
                {insightsTeaser.heading}
              </h2>
            </div>
            <Link className="hp-link u-link" href={insightsTeaser.href}>
              {insightsTeaser.cta}
              <ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            </Link>
          </div>

          <RevealGroup as="ul" className="hp-grid hp-grid--3">
            {insightsTeaser.items.map((item) => (
              <Reveal as="li" key={item.href}>
                <Card padding="lg" className="hp-card">
                  <Badge variant="brand">{item.kind}</Badge>
                  <h3 className="hp-card__title">
                    <CardLink href={item.href}>{item.title}</CardLink>
                  </h3>
                  <p className="hp-card__line">{item.blurb}</p>
                  <div className="hp-card__foot">
                    <span className="u-mono">{item.readingTime}</span>
                    <span>{item.cta}</span>
                  </div>
                </Card>
              </Reveal>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* ── 12. CLOSING CTA, a specific next step, not "contact us" ─────── */}
      <Section theme="deep" grain aria-labelledby="closing-heading">
        <div className="hp-cta">
          <Reveal>
            <p className="u-eyebrow">{closingCta.eyebrow}</p>
            <h2
              id="closing-heading"
              className="hp-h2 hp-h2--wide"
              style={{ marginTop: 'var(--s4)' }}
            >
              {closingCta.heading}
            </h2>
            <p className="hp-lede">{closingCta.body}</p>
            <div className="hp-actions" style={{ marginTop: 'var(--s8)' }}>
              <Button
                href={closingCta.primary.href}
                variant="primary"
                size="lg"
                iconRight={
                  <ArrowRight size={18} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                }
              >
                {closingCta.primary.label}
              </Button>
              <Button href={closingCta.secondary.href} variant="secondary" size="lg">
                {closingCta.secondary.label}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <ul className="hp-reassure">
              {closingCta.reassurance.map((line, i) => (
                <li key={line}>
                  <span>
                    {line}
                    {/* The hotline sentence gets the actual number beside it —
                        visible, tappable, never behind a form. */}
                    {i === closingCta.reassurance.length - 1 ? (
                      <>
                        {' '}
                        <a
                          className="u-link u-mono"
                          href={site.contact.irHotlineHref}
                          style={{ color: 'var(--fg)' }}
                        >
                          {site.contact.irHotline}
                        </a>
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>
    </>
  )
}
