import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Lock, MapPin, Layers } from 'lucide-react'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardLink } from '@/components/ui/Card'
import { contactIntro } from '@/lib/contact'
import { contactsFor } from '@/lib/people'
import { servicesBySlug } from '@/lib/services'
import { site } from '@/lib/site'
import type { CaseStudy, Metric } from '@/lib/case-studies'
import type { Testimonial } from '@/lib/proof'

/**
 * Proof-surface building blocks shared by /case-studies, /case-studies/[slug],
 * /customers and /certifications.
 *
 * REPORTED CONSTRAINT: these would belong in `components/ui/`, which another
 * agent owns. They live under a private `_components` folder inside the route
 * that uses them most so nothing outside this brief's four directories is
 * touched. `_`-prefixed folders are not routed by the App Router.
 *
 * MOTION: every hover state below is a colour shift. No transform, no scale,
 * no lift, anywhere in this file.
 */

const CSS = `
/* ---------------- metric trio - ABOVE THE FOLD ---------------- */
.metrics {
  display: grid;
  gap: var(--s8);
  list-style: none;
  margin: 0;
  padding: 0;
}
@media (min-width: 768px) {
  .metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s6); }
}
/* Stacked variant, for a metric trio that sits in a narrow column beside the
   headline rather than in a full-width row under it. */
.metrics--stack { gap: var(--s4); }
@media (min-width: 768px) { .metrics--stack { grid-template-columns: minmax(0, 1fr); } }
.metrics--stack .metric__value { font-size: var(--text-2xl); }
.metrics--stack .metric__note { margin-top: var(--s1); padding-top: 0; border-top: 0; max-width: 42ch; }
/* The key runs inline with its note in the stacked variant - one line saved per
   metric is what keeps all three on the first screen. */
.metrics--stack .metric__note-key { display: inline; margin-bottom: 0; }
.metrics--stack .metric__note-key::after { content: ', '; }
.metric {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  min-width: 0;
  border-top: 1px solid var(--border-strong);
  padding-top: var(--s4);
}
.metric__value {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
  margin: 0;
  overflow-wrap: break-word;
}
@media (min-width: 768px) {
  .metric__value { font-size: var(--text-3xl); }
}
.metric__label {
  margin: 0;
  color: var(--muted-strong);
  font-size: var(--text-sm);
  line-height: 1.4;
  max-width: 34ch;
}
.metric__note {
  margin: var(--s2) 0 0;
  padding-top: var(--s2);
  border-top: 1px solid var(--border);
  font-size: var(--text-xs);
  line-height: 1.5;
  color: var(--muted);
  max-width: 36ch;
}
.metric__note-key {
  display: block;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 2px;
}

/* ---------------- NDA block ---------------- */
.nda {
  display: flex;
  align-items: flex-start;
  gap: var(--s3);
  border: 1px solid color-mix(in oklab, var(--accent) 38%, transparent);
  background-color: color-mix(in oklab, var(--accent) 10%, transparent);
  border-radius: var(--radius-md);
  padding: var(--s3) var(--s4);
}
.nda__icon { color: var(--accent); flex: none; margin-top: 2px; }
.nda__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.nda__kicker {
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}
.nda__name {
  margin: 0;
  color: var(--fg);
  font-size: var(--text-sm);
  line-height: 1.4;
}
.nda__note { margin: 0; font-size: var(--text-xs); color: var(--muted); line-height: 1.5; }

/* ---------------- dual-pillar marker ---------------- */
.dual {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: var(--s2) var(--s3);
  color: var(--fg);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.02em;
  text-decoration: none;
  transition:
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    color var(--dur-base) var(--ease-out);
}
.dual:hover { background-color: var(--surface); border-color: var(--fg); }
.dual__icon { color: var(--accent); flex: none; }

/* ---------------- case study card ---------------- */
.cs-card { display: flex; flex-direction: column; gap: var(--s4); height: 100%; }
.cs-card__top { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s2); }
.cs-card__client {
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--muted-strong);
}
.cs-card__headline {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 500;
  line-height: var(--leading-snug);
  color: var(--fg);
}
.cs-card__headline a { color: inherit; text-decoration: none; }
.cs-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--s2) var(--s4);
  font-size: var(--text-xs);
  color: var(--muted);
  margin: 0;
}
.cs-card__meta span { display: inline-flex; align-items: center; gap: var(--s1); }
.cs-card__tags { display: flex; flex-wrap: wrap; gap: var(--s2); list-style: none; margin: 0; padding: 0; }
.cs-card__metric {
  margin-top: auto;
  padding-top: var(--s4);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--s1);
}
.cs-card__metric-value {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: 1.1;
  color: var(--fg);
  margin: 0;
  overflow-wrap: break-word;
}
.cs-card__metric-label { margin: 0; font-size: var(--text-xs); color: var(--muted); line-height: 1.45; }

/* ---------------- testimonial rail ---------------- */
.trail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(min(84vw, 320px), 1fr);
  gap: var(--s4);
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  list-style: none;
  margin: 0;
  padding: 0 0 var(--s4);
  scrollbar-width: thin;
}
@media (min-width: 768px) {
  .trail { grid-auto-columns: minmax(0, 420px); gap: var(--s6); }
}
.trail > li { scroll-snap-align: start; min-width: 0; }
.trail__card { display: flex; flex-direction: column; gap: var(--s4); height: 100%; }
.trail__quote {
  margin: 0;
  color: var(--fg);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}
@media (min-width: 768px) {
  .trail__quote { font-size: var(--text-lg); line-height: var(--leading-snug); }
}
.trail__who { display: flex; align-items: center; gap: var(--s3); margin-top: auto; }
.trail__name { margin: 0; font-size: var(--text-sm); font-weight: 500; color: var(--fg); }
.trail__role { margin: 0; font-size: var(--text-xs); color: var(--muted); }
.trail__hint { margin: var(--s3) 0 0; font-size: var(--text-xs); color: var(--muted); }

/* ---------------- named-humans CTA ---------------- */
.humans { display: grid; gap: var(--s8); }
@media (min-width: 900px) { .humans { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--s16); align-items: start; } }
.humans__people { display: grid; gap: var(--s4); list-style: none; margin: 0; padding: 0; }
.human { display: flex; align-items: center; gap: var(--s4); }
.human__name {
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--fg);
}
.human__role { margin: 0; font-size: var(--text-sm); color: var(--muted); }
.humans__actions { display: flex; flex-wrap: wrap; gap: var(--s3); margin-top: var(--s6); }
.humans__sla { margin: var(--s4) 0 0; font-size: var(--text-sm); color: var(--muted); max-width: 46ch; }
`

export function ProofStyles() {
  return (
    <style href="envenox-proof-surfaces" precedence="default">
      {CSS}
    </style>
  )
}

/* ------------------------------------------------------------------ *
 * Metric trio
 * ------------------------------------------------------------------ */

export function MetricTrio({
  metrics,
  ariaLabel,
  stack = false,
}: {
  metrics: readonly Metric[]
  ariaLabel: string
  /** One per row - for a trio in a narrow column beside the headline. */
  stack?: boolean
}) {
  return (
    <>
      <ProofStyles />
      <ul className={stack ? 'metrics metrics--stack' : 'metrics'} aria-label={ariaLabel}>
        {metrics.map((m) => (
          <li className="metric" key={m.label}>
            <p className="metric__value u-tnum">{m.value}</p>
            <p className="metric__label">{m.label}</p>
            {m.note ? (
              <p className="metric__note u-mono">
                <span className="metric__note-key">Measurement window</span>
                {m.note}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  )
}

/* ------------------------------------------------------------------ *
 * NDA badge
 * ------------------------------------------------------------------ */

export function NdaBlock({ anonymisedAs, note }: { anonymisedAs: string; note?: string }) {
  return (
    <>
      <ProofStyles />
      <div className="nda">
        <Lock className="nda__icon" size={18} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
        <div className="nda__body">
          <span className="nda__kicker u-mono">Named under NDA</span>
          <p className="nda__name">{anonymisedAs}</p>
          {note ? <p className="nda__note">{note}</p> : null}
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Dual-pillar marker - security AND software from one firm
 * ------------------------------------------------------------------ */

export function DualPillarMarker({ className = '' }: { className?: string }) {
  return (
    <>
      <ProofStyles />
      <Link href="/services/devsecops" className={['dual', className].filter(Boolean).join(' ')}>
        <Layers className="dual__icon" size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
        <span>Both pillars, security and software</span>
        <ArrowUpRight size={14} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
      </Link>
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Client-or-NDA label
 * ------------------------------------------------------------------ */

export function clientLabel(study: CaseStudy): string {
  return study.client ?? study.anonymisedAs ?? 'Client not named'
}

/* ------------------------------------------------------------------ *
 * Case study card
 * ------------------------------------------------------------------ */

/**
 * Renders as a <div>. Wrap it in `<Reveal as="li">` inside a `<RevealGroup>` so
 * the list item IS the revealed element and the CSS stagger applies - a card
 * that is not itself `[data-reveal]` would sit inside a RevealGroup doing
 * nothing at all.
 */
export function CaseStudyCard({ study }: { study: CaseStudy }) {
  const headlineMetric = study.metrics[0]

  return (
    <>
      <ProofStyles />
      <Card padding="lg" className="cs-card">
        <div className="cs-card__top">
          <p className="cs-card__client">{clientLabel(study)}</p>
          {study.nda ? <Badge variant="brand">Under NDA</Badge> : null}
        </div>

        <h3 className="cs-card__headline">
          <CardLink href={`/case-studies/${study.slug}`}>{study.headline}</CardLink>
        </h3>

        <p className="cs-card__meta">
          <span>{study.industry}</span>
          <span>
            <MapPin size={13} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
            {study.country}
          </span>
          <span>{study.engagementType}</span>
        </p>

        <ul className="cs-card__tags" aria-label={`Services used on ${clientLabel(study)}`}>
          {study.services.map((slug) => (
            <li key={slug}>
              <Badge variant="neutral">{servicesBySlug[slug]?.short ?? servicesBySlug[slug]?.name ?? slug}</Badge>
            </li>
          ))}
        </ul>

        <div className="cs-card__metric">
          <p className="cs-card__metric-value u-tnum">{headlineMetric.value}</p>
          <p className="cs-card__metric-label">{headlineMetric.label}</p>
        </div>
      </Card>
    </>
  )
}

/* ------------------------------------------------------------------ *
 * Testimonial rail - scroll-snap, works with scripting off
 * ------------------------------------------------------------------ */

export function TestimonialRail({
  items,
  ariaLabel,
}: {
  items: readonly Testimonial[]
  ariaLabel: string
}) {
  return (
    <>
      <ProofStyles />
      <ul className="trail" aria-label={ariaLabel} tabIndex={0}>
        {items.map((t) => (
          <li key={t.name + t.company}>
            <Card padding="lg" className="trail__card">
              <blockquote className="trail__quote">{t.text}</blockquote>
              <div className="trail__who">
                <AvatarPlaceholder name={t.name} size={40} />
                <div>
                  <p className="trail__name">{t.name}</p>
                  <p className="trail__role">{t.company}</p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
      <p className="trail__hint">Scroll the row, or use the arrow keys once it has focus.</p>
    </>
  )
}

/* ------------------------------------------------------------------ *
 * CTA with named human beings
 * ------------------------------------------------------------------ */

export function NamedContactsCta({
  id,
  children,
}: {
  /** Supplied when the surrounding <Section> is labelled by this heading. */
  id?: string
  children?: React.ReactNode
}) {
  const contacts = contactsFor('new-enquiry')

  return (
    <>
      <ProofStyles />
      <div className="humans">
        <div>
          <p className="u-eyebrow">{contactIntro.eyebrow}</p>
          <h2 id={id} style={{ fontSize: 'var(--text-3xl)', margin: 'var(--s3) 0 0' }}>
            {contactIntro.heading}
          </h2>
          <p style={{ color: 'var(--muted-strong)', maxWidth: '52ch', marginTop: 'var(--s4)' }}>
            {contactIntro.lead}
          </p>
          <div className="humans__actions">
            <Button href={site.primaryCta.href} variant="primary" size="lg" iconRight={<ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />}>
              {site.primaryCta.label}
            </Button>
            {children}
          </div>
          <p className="humans__sla">{site.contact.responseSla}</p>
        </div>

        <ul className="humans__people" aria-label="Who replies to a new enquiry">
          {contacts.map((p) => (
            <li className="human" key={p.slug}>
              <AvatarPlaceholder name={p.name} size={48} />
              <div>
                <p className="human__name">{p.name}</p>
                <p className="human__role">{p.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
