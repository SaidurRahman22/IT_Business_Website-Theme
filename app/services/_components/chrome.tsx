/**
 * Shared chrome for every route under /services.
 *
 * SCOPE: this folder is private (Next.js `_` prefix) and is owned by the
 * services routes alone. Nothing here duplicates a component in
 * `components/**` - these are page-level compositions of them.
 *
 * MOTION: colour-only transitions, tokens only. There is no hover transform,
 * scale or lift anywhere in this stylesheet; grep it.
 *
 * STYLE DELIVERY: one `<style href precedence>` element, deduped by React
 * across every component that renders `<ServicesStyles />`. That keeps the CSS
 * in the server-rendered HTML - no runtime class generation, nothing to hydrate.
 */

import Link from 'next/link'
import type { ReactNode } from 'react'

/* ========================================================================== *
 * THE STYLESHEET
 * ========================================================================== */

const CSS = `
/* ---------- page-level type ---------- */
.sv-h1 {
  font-size: clamp(2rem, 6.4vw, 3.75rem);
  margin: 0;
  max-width: 20ch;
}
.sv-h1--long { max-width: 24ch; font-size: clamp(1.875rem, 5.6vw, 3rem); }
.sv-sub {
  margin: var(--s4) 0 0;
  font-size: var(--text-lg);
  color: var(--muted-strong);
  max-width: 54ch;
}
.sv-lede {
  margin: var(--s6) 0 0;
  color: var(--muted-strong);
  max-width: 68ch;
}
.sv-h2 {
  font-size: clamp(1.5rem, 3.6vw, 2.25rem);
  margin: 0;
  max-width: 24ch;
}
.sv-h3 {
  font-size: var(--text-xl);
  margin: 0;
}
.sv-note {
  margin: var(--s3) 0 0;
  font-size: var(--text-sm);
  color: var(--muted);
  max-width: 68ch;
}

/* ---------- section head ---------- */
.sv-head { margin-bottom: var(--s12); }
.sv-head__rule { height: 1px; background-color: var(--border); margin-bottom: var(--s6); }
.sv-head__eyebrow { margin: 0 0 var(--s3); }
.sv-head__lede { margin: var(--s4) 0 0; color: var(--muted-strong); max-width: 68ch; }

/* ---------- hero ---------- */
/* ---------- service hero ----------
   One column below 64rem, two above it. The aside column is capped at 24rem
   so the main column keeps a readable measure rather than stretching: a
   headline that runs the full 1280px is harder to read, not better used. */
.sv-hero { display: grid; gap: var(--s12); }
.sv-hero__main { min-width: 0; }
.sv-hero__aside { min-width: 0; }
@media (min-width: 64rem) {
  .sv-hero {
    grid-template-columns: minmax(0, 1fr) minmax(0, 24rem);
    gap: var(--s16);
    align-items: start;
  }
}
/* In its own column the stat is the column, so it drops the measure cap and
   the top margin it needed when it sat inside a stack of paragraphs. */
.sv-hero__aside .sv-cred { max-width: none; margin-top: 0; }

/* The banner sits above the stat, not below it: the picture identifies the
   service at a glance and the figure is the evidence that follows. Same
   treatment as .hp-pillar__media on the homepage, including the grade, so the
   two surfaces do not read as two different image systems. */
.sv-hero__media { margin: 0 0 var(--s6); align-self: start; }
.sv-hero__media img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  /* One accent on a near-neutral ground. These are photographic, so the same
     measured desaturation the homepage uses keeps them inside the palette
     instead of introducing a second colour temperature. */
  filter: saturate(0.42) contrast(1.05);
}
.sv-hero__caption {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--muted);
  letter-spacing: 0.02em;
  margin: var(--s3) 0 0;
}

.sv-hero__eyebrow { margin: 0 0 var(--s4); }
.sv-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s3);
  margin-top: var(--s8);
}
.sv-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s2) var(--s6);
  margin: var(--s6) 0 0;
  padding: 0;
  list-style: none;
  font-size: var(--text-sm);
  color: var(--muted);
}

/* ---------- credibility stat (first paragraph, PART 8.3) ---------- */
.sv-cred {
  margin: var(--s8) 0 0;
  padding: var(--s6);
  border: 1px solid var(--border);
  border-left: 2px solid var(--accent);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  max-width: 68ch;
}
.sv-cred__figure {
  display: block;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug);
  color: var(--fg);
}
.sv-cred__context { display: block; margin-top: var(--s2); color: var(--muted-strong); }

/* ---------- grids ---------- */
.sv-grid { display: grid; gap: var(--s6); list-style: none; margin: 0; padding: 0; }
@media (min-width: 680px) { .sv-grid--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 680px) { .sv-grid--3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1000px) { .sv-grid--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.sv-grid > li { min-width: 0; }

/* Two columns of prose: the heading rail and the body. */
.sv-rail { display: grid; gap: var(--s8); }
@media (min-width: 900px) {
  .sv-rail { grid-template-columns: minmax(0, 7fr) minmax(0, 12fr); gap: var(--s16); }
}
.sv-rail__aside { min-width: 0; }
.sv-rail__body { min-width: 0; }

/* ---------- jump nav ---------- */
.sv-jump {
  position: sticky;
  top: var(--nav-h);
  z-index: 20;
  background-color: color-mix(in oklab, var(--bg) 94%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}
.sv-jump__inner {
  display: flex;
  gap: var(--s1);
  overflow-x: auto;
  scrollbar-width: thin;
  padding-block: var(--s2);
  -webkit-overflow-scrolling: touch;
}
.sv-jump__link {
  flex: none;
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding-inline: var(--s3);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--muted-strong);
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--dur-micro) var(--ease-out), background-color var(--dur-micro) var(--ease-out);
}
.sv-jump__link:hover { color: var(--fg); background-color: var(--surface); }

/* ---------- service card ---------- */
.sv-card { display: flex; flex-direction: column; height: 100%; gap: var(--s4); }
.sv-card__top { display: flex; align-items: flex-start; gap: var(--s3); }
.sv-card__icon { flex: none; color: var(--accent); margin-top: 2px; }
.sv-card__name { font-size: var(--text-lg); margin: 0; }
.sv-card__line { margin: 0; color: var(--muted-strong); }
.sv-card__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--s2);
  font-size: var(--text-sm);
  color: var(--muted);
}
.sv-card__list li { display: flex; gap: var(--s2); }
.sv-card__tick { flex: none; margin-top: 3px; color: var(--accent); }
.sv-card__cta {
  margin: auto 0 0;
  padding-top: var(--s4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--muted-strong);
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
}

/* ---------- plain link list ---------- */
.sv-links { display: grid; gap: 0; list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border); }
.sv-links > li { border-bottom: 1px solid var(--border); }
.sv-links__a {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: baseline;
  gap: var(--s4);
  padding: var(--s4) 0;
  min-height: 44px;
  text-decoration: none;
  color: var(--fg);
  transition: color var(--dur-micro) var(--ease-out);
}
.sv-links__a:hover { color: var(--accent); }
.sv-links__label { font-weight: 500; }
.sv-links__blurb { display: block; margin-top: var(--s1); font-size: var(--text-sm); color: var(--muted); font-weight: 400; }
.sv-links__arrow { flex: none; color: var(--muted); align-self: center; }

/* ---------- numbered methodology ---------- */
.sv-phases { list-style: none; margin: 0; padding: 0; counter-reset: none; }
.sv-phase {
  display: grid;
  gap: var(--s2);
  padding: var(--s6) 0;
  border-top: 1px solid var(--border);
}
@media (min-width: 760px) {
  .sv-phase { grid-template-columns: 3.5rem minmax(0, 14rem) minmax(0, 1fr); gap: var(--s6); align-items: start; }
}
.sv-phase__n { font-size: var(--text-sm); color: var(--muted); }
.sv-phase__name { font-size: var(--text-lg); margin: 0; font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif; font-weight: 500; }
.sv-phase__when { display: block; margin-top: var(--s1); font-size: var(--text-xs); color: var(--muted); letter-spacing: 0.04em; text-transform: uppercase; }
.sv-phase__body { margin: 0; color: var(--muted-strong); }

/* ---------- console exhibits ----------
   One stacked band per placement. The gap is large on purpose: two dense
   consoles with 24px between them read as one confused screenshot. */
.sv-consoles { display: grid; gap: var(--s24); }

/* ---------- phase card stack ----------
   The stack primitive manages the sticky behaviour; this only sets the rhythm
   above it and the two type roles inside a card. */
.sv-phaseStack { margin-top: var(--s16); }
.sv-phaseWhen {
  margin: 0 0 var(--s3);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}
.sv-phaseBody { margin: 0; color: var(--muted-strong); line-height: var(--leading-normal); }

/* The artefact stack sits under the deliverables heading in the rail aside.
   Capped so it never outgrows a 7fr column on a wide viewport. */
.sv-deliverableArt { margin-top: var(--s8); max-width: 30rem; }

/* ---------- deliverables / outcomes ---------- */
.sv-ticks { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s4); }
.sv-ticks > li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: var(--s3); color: var(--muted-strong); }
.sv-ticks__mark { flex: none; margin-top: 4px; color: var(--accent); }

/* ---------- chips (frameworks, stack, certifications) ---------- */
.sv-chips { display: flex; flex-wrap: wrap; gap: var(--s2); list-style: none; margin: 0; padding: 0; }
/*
 * Local override, not an edit to Badge.tsx. Badge sets white-space: nowrap,
 * which is right for a severity word ("Critical") and wrong for "AWS
 * Well-Architected Security Pillar" inside a 288px content box: a nowrap item
 * cannot shrink, so flex-wrap does not save it and the layout blows out at
 * 320px. Measured in headless Chromium at 320px, which is how the two real
 * offenders on this tree were found.
 *
 * Scoped to the five containers in which these routes render a Badge, so it
 * can never reach a severity badge elsewhere on the site - those live in the
 * product UI and must stay on one line.
 */
.sv-chips .badge,
.sv-card .badge,
.sv-note .badge,
.sv-seam__cta .badge,
.sv-hero__meta .badge { white-space: normal; text-align: left; }

/* ---------- accreditation strip ---------- */
.sv-accred { display: grid; gap: var(--s4); list-style: none; margin: 0; padding: 0; }
@media (min-width: 680px) { .sv-accred { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1000px) { .sv-accred { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.sv-accred__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--s3);
  padding: var(--s4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  min-width: 0;
}
.sv-accred__icon { flex: none; margin-top: 2px; color: var(--accent); }
.sv-accred__label { font-size: var(--text-sm); font-weight: 500; color: var(--fg); overflow-wrap: anywhere; }
.sv-accred__issuer { display: block; margin-top: var(--s1); font-size: var(--text-xs); color: var(--muted); }

/* ---------- expert ---------- */
.sv-expert { display: grid; gap: var(--s6); }
@media (min-width: 760px) { .sv-expert { grid-template-columns: auto minmax(0, 1fr); gap: var(--s8); } }
.sv-expert__name { margin: 0; font-size: var(--text-xl); }
.sv-expert__role { margin: var(--s1) 0 0; color: var(--accent); font-size: var(--text-sm); }
.sv-expert__bio { margin: var(--s4) 0 0; color: var(--muted-strong); max-width: 60ch; }
.sv-expert__certs-label { margin: var(--s6) 0 var(--s2); }

/* ---------- case study ---------- */
.sv-metrics { display: grid; gap: var(--s6); list-style: none; margin: 0; padding: 0; }
@media (min-width: 680px) { .sv-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s8); } }
.sv-metric__value {
  display: block;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug);
  overflow-wrap: anywhere;
}
.sv-metric__label { display: block; margin-top: var(--s2); color: var(--muted-strong); font-size: var(--text-sm); }
.sv-metric__note { display: block; margin-top: var(--s1); color: var(--muted); font-size: var(--text-xs); }

.sv-quote { margin: 0; }
.sv-quote__text {
  margin: 0;
  font-size: var(--text-lg);
  line-height: var(--leading-snug);
  color: var(--fg);
  max-width: 52ch;
}
.sv-quote__by { display: block; margin-top: var(--s4); font-size: var(--text-sm); color: var(--muted); font-style: normal; }
.sv-quote__mark { color: var(--muted); margin-bottom: var(--s3); }

/* ---------- definition grid (timeline / team / engagement) ---------- */
.sv-defs { margin: 0; display: grid; gap: 0; }
.sv-def { padding: var(--s6) 0; border-top: 1px solid var(--border); display: grid; gap: var(--s2); }
@media (min-width: 760px) { .sv-def { grid-template-columns: minmax(0, 12rem) minmax(0, 1fr); gap: var(--s6); } }
.sv-def__term { font-size: var(--text-sm); color: var(--muted); margin: 0; letter-spacing: 0.04em; text-transform: uppercase; }
.sv-def__desc { margin: 0; color: var(--muted-strong); }

/* ---------- the seam ---------- */
.sv-seam { display: grid; gap: var(--s6); align-items: stretch; }
@media (min-width: 980px) {
  .sv-seam { grid-template-columns: minmax(0, 1fr) minmax(0, 1.12fr) minmax(0, 1fr); gap: var(--s4); align-items: stretch; }
}
.sv-seam__col { display: flex; flex-direction: column; gap: var(--s4); height: 100%; }
.sv-seam__centre { border-color: var(--accent); }
.sv-seam__kicker { margin: 0 0 var(--s3); }
.sv-seam__name { margin: 0; font-size: var(--text-xl); }
.sv-seam__line { margin: var(--s3) 0 0; color: var(--muted-strong); }
.sv-seam__body { margin: var(--s4) 0 0; color: var(--muted); font-size: var(--text-sm); }
.sv-seam__cta { margin: auto 0 0; padding-top: var(--s6); }

/* ---------- contrast pair (engagement models) ---------- */
.sv-contrast { display: grid; gap: var(--s6); }
@media (min-width: 900px) { .sv-contrast { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s8); } }
.sv-contrast__head { display: flex; align-items: center; gap: var(--s3); margin-bottom: var(--s4); }
.sv-contrast__icon { flex: none; color: var(--accent); }
.sv-contrast__h { margin: 0; font-size: var(--text-lg); }
.sv-contrast__rows { margin: 0; display: grid; }
.sv-contrast__row { padding: var(--s4) 0; border-top: 1px solid var(--border); }
.sv-contrast__term { margin: 0; font-size: var(--text-xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.sv-contrast__desc { margin: var(--s2) 0 0; color: var(--muted-strong); }

/* ---------- form ---------- */
.sv-form { display: grid; gap: var(--s6); max-width: 44rem; }
.sv-field { display: grid; gap: var(--s2); min-width: 0; }
.sv-field--check { grid-template-columns: auto minmax(0, 1fr); align-items: start; column-gap: var(--s3); }
.sv-label { font-size: var(--text-sm); font-weight: 500; color: var(--fg); }
.sv-req { color: var(--accent); margin-left: 2px; }
.sv-help { font-size: var(--text-xs); color: var(--muted); margin: 0; }
.sv-input,
.sv-select,
.sv-textarea {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: var(--s3) var(--s4);
  background-color: var(--bg);
  color: var(--fg);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  font: inherit;
  font-size: var(--text-base);
  transition: border-color var(--dur-micro) var(--ease-out), background-color var(--dur-micro) var(--ease-out);
}
.sv-textarea { min-height: 7.5rem; resize: vertical; line-height: var(--leading-normal); }
.sv-input:hover, .sv-select:hover, .sv-textarea:hover { border-color: var(--fg); }
.sv-input::placeholder, .sv-textarea::placeholder { color: var(--muted); }
.sv-check { width: 20px; height: 20px; margin: 2px 0 0; accent-color: var(--accent); flex: none; }
.sv-form__actions { display: flex; flex-wrap: wrap; gap: var(--s4); align-items: center; }
.sv-form__sla { margin: 0; font-size: var(--text-sm); color: var(--muted); }
/*
 * VALIDATION SUMMARY - revealed by :target, so it needs neither JavaScript nor
 * a searchParams read on the page.
 *
 * Reading ?enquiry= would have been the obvious way to show this, and it was
 * the first implementation. It is wrong: a page that reads searchParams opts
 * out of static generation, which would have made all sixteen service pages
 * dynamically rendered to display a message a visitor almost never sees. The
 * server action redirects to #enquiry-incomplete or #enquiry-email instead;
 * the browser scrolls to the matching block and :target reveals it. Static
 * generation survives, and so does the message.
 *
 * The common case never reaches here at all: the "required" attribute is
 * native constraint validation, which browsers enforce with scripting off.
 * The server check exists for a crafted POST, not a forgotten field.
 *
 * No --signal-* colour: Badge.tsx states severity colour is the one place in
 * the codebase those tokens appear, and a form error is not a severity rating.
 */
.sv-form__error {
  display: none;
  padding: var(--s4);
  border: 1px solid var(--border-strong);
  border-left: 2px solid var(--fg);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  scroll-margin-top: calc(var(--nav-h) + var(--s8));
}
.sv-form__error:target { display: block; }
.sv-form__error p { margin: 0; color: var(--fg); font-size: var(--text-sm); }

/*
 * A box that declares its own palette inside a band of another palette.
 * <Card> sets \`color: inherit\`, so a bare theme-* class on it would re-colour
 * the surface and leave the text behind; this sets both. Used on
 * /services/engagement-models, where the security retainer and the delivery
 * retainer sit side by side in the palette of their own act - the commercial
 * contrast made visible rather than described.
 */
.sv-theme-box {
  background-color: var(--bg);
  color: var(--fg);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: var(--s8);
  min-width: 0;
}

/* ---------- misc ---------- */
.sv-cta-band { display: grid; gap: var(--s6); }
@media (min-width: 900px) { .sv-cta-band { grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: var(--s12); } }
.sv-cta-band__actions { display: flex; flex-wrap: wrap; gap: var(--s3); }

.sv-hotline {
  display: grid;
  gap: var(--s4);
  padding: var(--s8);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  background-color: var(--surface);
}
.sv-hotline__num {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: clamp(1.375rem, 4.5vw, 1.75rem);
  font-weight: 500;
  color: var(--fg);
  text-decoration: none;
  overflow-wrap: anywhere;
  transition: color var(--dur-micro) var(--ease-out);
}
.sv-hotline__num:hover { color: var(--accent); }

.sv-stub {
  display: grid;
  gap: var(--s4);
  padding: var(--s8);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background-color: var(--surface);
  max-width: 44rem;
}
.sv-prose-measure { max-width: 68ch; }
.sv-sr {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
`

/** Emits the services stylesheet. Rendering it more than once is free. */
export function ServicesStyles() {
  return (
    <style href="envenox-services" precedence="default">
      {CSS}
    </style>
  )
}

/* ========================================================================== *
 * SMALL COMPOSITIONS
 * ========================================================================== */

export function SectionHead({
  eyebrow,
  title,
  lede,
  id,
  rule = true,
  level = 2,
}: {
  eyebrow?: string
  title: string
  lede?: ReactNode
  id?: string
  rule?: boolean
  level?: 2 | 3
}) {
  const H = `h${level}` as 'h2'
  return (
    <div className="sv-head">
      {rule ? <div className="sv-head__rule" aria-hidden="true" /> : null}
      {eyebrow ? <p className="u-eyebrow sv-head__eyebrow">{eyebrow}</p> : null}
      <H id={id} className="sv-h2">
        {title}
      </H>
      {lede ? <p className="sv-head__lede">{lede}</p> : null}
    </div>
  )
}

/** The credibility stat. On a service page this sits in the first paragraph. */
export function Credibility({ figure, context }: { figure: string; context: string }) {
  return (
    <p className="sv-cred">
      <strong className="sv-cred__figure">{figure}</strong>
      <span className="sv-cred__context">{context}</span>
    </p>
  )
}

/**
 * The banner that identifies a service at a glance, or nothing when that slug
 * has no image. Renders nothing rather than a placeholder: a broken or generic
 * frame is worse than the absence.
 *
 * alt="" because the picture is atmospheric, not informative. The h1 beside it
 * already names the service, so an alt would make a screen reader say it twice.
 *
 * The caption is not decoration. These are generated images, not photographs of
 * Envenox work, and a vault door beside a page selling security invites exactly
 * the reading that it is ours. The caption says what it is rather than leaving
 * the implication standing, which is the rule the homepage pillars already
 * follow with their stock credits.
 */
export function ServiceBanner({ src }: { src: string | null }) {
  if (!src) return null
  return (
    <figure className="sv-hero__media">
      {/* Above the fold on every service page, so it is deliberately not lazy. */}
      <img src={src} alt="" width={1024} height={576} decoding="async" />
      <figcaption className="sv-hero__caption">Illustrative · generated</figcaption>
    </figure>
  )
}

/** A hairline list of links. `blurb` is the buyer-facing line under the label. */
export function LinkList({
  items,
  ariaLabel,
}: {
  items: readonly { href: string; label: string; blurb?: string; external?: boolean }[]
  ariaLabel: string
}) {
  return (
    <ul className="sv-links" aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={item.href + item.label}>
          {item.href.startsWith('/') ? (
            <Link className="sv-links__a" href={item.href}>
              <span className="sv-links__label">
                {item.label}
                {item.blurb ? <span className="sv-links__blurb">{item.blurb}</span> : null}
              </span>
              <ArrowGlyph />
            </Link>
          ) : (
            <a className="sv-links__a" href={item.href}>
              <span className="sv-links__label">
                {item.label}
                {item.blurb ? <span className="sv-links__blurb">{item.blurb}</span> : null}
              </span>
              <ArrowGlyph />
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}

/* A plain SVG chevron rather than a Lucide import, so LinkList stays dependency
   free and the guard in scripts/check-icons.mjs has nothing to resolve here. */
function ArrowGlyph() {
  return (
    <svg
      className="sv-links__arrow"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

export default ServicesStyles
