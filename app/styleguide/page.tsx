// Keep the lucide-react import FIRST and braced - house convention, and
// scripts/check-icons.mjs harvests named imports from this file.
import { ArrowRight, Bug, Download } from 'lucide-react'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CSSProperties, ReactNode } from 'react'
import { siCloudflare, siGithub, siX } from 'simple-icons'

import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Badge, type BadgeSeverity } from '@/components/ui/Badge'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { Button } from '@/components/ui/Button'
import { Card, CardAbove, CardLink } from '@/components/ui/Card'
import { ChapterOpener } from '@/components/ui/ChapterOpener'
import { Faq } from '@/components/ui/Faq'
import { Marquee } from '@/components/ui/Marquee'
import { Prose } from '@/components/ui/Prose'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { Stat } from '@/components/ui/Stat'
import { StatBar } from '@/components/ui/StatBar'
import { Tabs } from '@/components/ui/Tabs'

import {
  EdrFleetView,
  SeverityBadge,
  SeverityGauge,
  SlaPanel,
  SocAlertQueue,
  WafTrafficPanel,
} from '@/components/product'
import { CAPTIONS, SEVERITY_ORDER } from '@/lib/product-fixtures'
import { headlineStats } from '@/lib/site'

import { AnimLab, RevealLab, type AnimSpec } from './Demos'
import {
  DISTANCES,
  DURATIONS,
  EASINGS,
  FONT_FAMILIES,
  RADIUS_SCALE,
  RAW_TOKENS,
  ROLE_LABEL,
  SPACING_SCALE,
  THEMES,
  TYPE_SCALE,
  contrastRatio,
  formatRatio,
  type ThemeSpec,
  type ThemeToken,
} from './tokens'

/* ==========================================================================
 * STYLEGUIDE - the Phase 1 deliverable.
 *
 * Every token and every component, rendered in every theme, so a design
 * regression is caught by looking at one page rather than by discovering it on
 * a service page in month four.
 *
 * This is an internal tool, not a page: `robots: { index: false }`, and it is
 * deliberately absent from the nav and the sitemap.
 *
 * CLIENT CODE: exactly one module, ./Demos.tsx, which owns the replay buttons.
 * Everything else here is a Server Component, so the whole reference renders in
 * the server HTML and reads correctly with JavaScript off.
 * ========================================================================== */

export const metadata: Metadata = {
  title: 'Styleguide',
  description:
    'Internal reference: every colour, type, space, radius and motion token, and every component, rendered in all three themes.',
  robots: { index: false },
}


/* -------------------------------------------------------------------------- *
 * PAGE CSS
 * -------------------------------------------------------------------------- */
const CSS = `
.sg-stack > * + * { margin-top: var(--s16); }
.sg-stack-md > * + * { margin-top: var(--s8); }
.sg-stack-sm > * + * { margin-top: var(--s4); }

.sg-h2 { font-size: var(--text-2xl); margin: 0; }
@media (min-width: 768px) { .sg-h2 { font-size: var(--text-3xl); } }
.sg-h3 { font-size: var(--text-lg); margin: 0; }
.sg-h4 { font-size: var(--text-base); font-weight: 500; margin: 0; }

.sg-note { font-size: var(--text-sm); color: var(--muted); max-width: 72ch; margin: 0; }
.sg-mono {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
}
.sg-label {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--muted);
  margin: 0;
}

.sg-toc { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s2); }
@media (min-width: 640px) { .sg-toc { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .sg-toc { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.sg-toc a {
  display: block;
  padding: var(--s3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--muted-strong);
  text-decoration: none;
  font-size: var(--text-sm);
  transition: border-color var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}
.sg-toc a:hover { border-color: var(--border-strong); color: var(--fg); }

/* ---- theme panes: the same markup under a different palette ---- */
.sg-duo, .sg-trio { display: grid; gap: var(--s4); }
@media (min-width: 900px) { .sg-duo { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1200px) { .sg-trio { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.sg-pane {
  background-color: var(--bg);
  color: var(--fg);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: var(--s6);
  min-width: 0;
}
.sg-pane__label {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--muted);
  margin: 0 0 var(--s6);
  padding-bottom: var(--s3);
  border-bottom: 1px solid var(--border);
}

/* ---- swatches ---- */
.sg-sw { list-style: none; margin: 0; padding: 0; }
.sg-sw > li {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: var(--s4);
  align-items: start;
  border-top: 1px solid var(--border);
  padding: var(--s4) 0;
}
.sg-chip {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
}
.sg-sw__name {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--fg);
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--s2) var(--s4);
  align-items: baseline;
}
.sg-sw__hex { color: var(--muted); text-transform: uppercase; }
.sg-sw__meta { font-size: var(--text-xs); color: var(--muted); margin: var(--s2) 0 0; max-width: 60ch; }
.sg-sw__grade { display: flex; flex-wrap: wrap; align-items: center; gap: var(--s2); margin-top: var(--s2); }
/* <Badge> is white-space: nowrap by design, so every verdict label is kept
   short and any qualifier rides beside it as ordinary wrapping text. */
.sg-sw__qualifier { font-size: var(--text-xs); color: var(--muted); }
.sg-sw__ratio {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  color: var(--fg);
  font-variant-numeric: tabular-nums;
}

/* ---- type ---- */
.sg-type { list-style: none; margin: 0; padding: 0; }
.sg-type > li { border-top: 1px solid var(--border); padding: var(--s4) 0; }
.sg-type__sample {
  margin: var(--s2) 0 0;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
  overflow-wrap: anywhere;
}

/* ---- rulers ---- */
.sg-ruler { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s3); }
.sg-ruler > li { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--s2); }
@media (min-width: 560px) {
  .sg-ruler > li { grid-template-columns: 9rem minmax(0, 1fr); gap: var(--s4); align-items: center; }
}
.sg-ruler__bar { height: 10px; border-radius: 2px; background-color: var(--accent); }

/* A demo table can out-measure a narrow pane; give it its own scroller rather
   than letting body { overflow-x: clip } silently cut a column off. */
.sg-scroll { overflow-x: auto; }

.sg-radii { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--s4); }
.sg-radii > li { width: 140px; }
.sg-radius {
  height: 72px;
  border: 1px solid var(--accent);
  background-color: var(--surface);
  margin-bottom: var(--s2);
}

/* ---- component shelves ---- */
.sg-set { display: flex; flex-wrap: wrap; gap: var(--s3); align-items: center; }
.sg-set--top { align-items: flex-start; }
.sg-shelf { border-top: 1px solid var(--border); padding-top: var(--s4); }

.sg-focus-ring {
  display: inline-block;
  padding: var(--s2) var(--s3);
  border-radius: 2px;
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  font-size: var(--text-sm);
}

.sg-callout {
  border-left: 1px solid var(--accent);
  padding-left: var(--s6);
  max-width: 72ch;
}
.sg-callout p { margin: 0; font-size: var(--text-sm); color: var(--muted-strong); }
.sg-callout p + p { margin-top: var(--s3); }

.sg-grid-2 { display: grid; gap: var(--s8); }
@media (min-width: 900px) { .sg-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`

/* -------------------------------------------------------------------------- *
 * SMALL SERVER HELPERS
 * -------------------------------------------------------------------------- */

function Pane({
  theme,
  label,
  children,
}: {
  theme: 'dark' | 'light' | 'deep'
  label: string
  children: ReactNode
}) {
  return (
    <div className={`sg-pane theme-${theme} transition-theme`}>
      <p className="sg-pane__label">{label}</p>
      {children}
    </div>
  )
}

function Shelf({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="sg-shelf">
      <p className="sg-label" style={{ marginBottom: 'var(--s3)' }}>
        {label}
      </p>
      {children}
    </div>
  )
}

/**
 * The verdict, rendered through <Badge severity> - the one sanctioned home for
 * --signal-* colours. The word is always text, never colour alone.
 *
 * `advisory` exists because a red FAIL beside the words "needs 3:1 only where it
 * carries meaning" is self-contradictory: a 1.3:1 hairline is a defect when it
 * is the only channel for meaning and entirely correct when it is a decorative
 * edge. Those rows state the shortfall in informational blue and name the
 * condition, so the red badges on this page all mean the same thing - a text
 * colour that genuinely fails - and a reviewer does not learn to ignore them.
 */
function Verdict({
  pass,
  threshold,
  advisory = false,
  passWord = 'PASS',
  failWord = 'FAIL',
}: {
  pass: boolean
  threshold: string
  advisory?: boolean
  passWord?: string
  failWord?: string
}) {
  if (pass) {
    return (
      <Badge variant="severity" severity="low">
        {passWord} {threshold}
      </Badge>
    )
  }
  if (advisory) {
    // Short, because <Badge> is white-space: nowrap by design and a long label
    // cannot wrap - at 320px it would push straight out of its pane. The
    // qualifier lives in the role line beside it instead.
    return (
      <Badge variant="severity" severity="info">
        BELOW {threshold}
      </Badge>
    )
  }
  return (
    <Badge variant="severity" severity="critical">
      {failWord} {threshold}
    </Badge>
  )
}

function ThresholdFor(
  token: ThemeToken,
): { value: number; label: string; advisory: boolean } | null {
  switch (token.role) {
    case 'text':
    case 'inverse':
      return { value: 4.5, label: '4.5:1', advisory: false }
    case 'large-text':
      return { value: 3, label: '3:1', advisory: false }
    case 'hairline':
      return { value: 3, label: '3:1', advisory: true }
    default:
      return null
  }
}

function SwatchList({ theme }: { theme: ThemeSpec }) {
  return (
    <ul className="sg-sw">
      {theme.tokens.map((token) => {
        const against = token.against === 'accent' ? theme.accent : theme.bg
        const ratio = contrastRatio(token.value, against)
        const threshold = ThresholdFor(token)
        return (
          <li key={token.name}>
            {/* The chip paints var(--token), NOT the hex printed beside it, so a
                drift between this file and globals.css shows up here. */}
            <span className="sg-chip" style={{ backgroundColor: `var(${token.name})` }} aria-hidden="true" />
            <div>
              <p className="sg-sw__name">
                <span>{token.name}</span>
                <span className="sg-sw__hex">{token.value}</span>
              </p>
              <p className="sg-sw__meta">
                aliases <code>{token.alias}</code> · {ROLE_LABEL[token.role]}
              </p>
              <div className="sg-sw__grade">
                <span className="sg-sw__ratio">
                  {formatRatio(ratio)}:1 vs {token.against === 'accent' ? '--accent' : '--bg'}
                </span>
                {threshold ? (
                  <>
                    <Verdict
                      pass={ratio >= threshold.value}
                      threshold={threshold.label}
                      advisory={threshold.advisory}
                    />
                    {threshold.advisory && ratio < threshold.value ? (
                      <span className="sg-sw__qualifier">decorative edges only</span>
                    ) : null}
                  </>
                ) : (
                  <Badge variant="neutral">no threshold</Badge>
                )}
              </div>
              {token.note ? <p className="sg-sw__meta">{token.note}</p> : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/* -------------------------------------------------------------------------- *
 * MOTION SPECS
 * -------------------------------------------------------------------------- */

const EASING_SPECS: AnimSpec[] = EASINGS.map((e) => ({
  id: `easing-${e.name}`,
  keyframe: 'assetEnter',
  duration: 'var(--dur-scene)',
  easing: `var(${e.name})`,
  label: e.name,
  note: `${e.curve}, ${e.use}`,
}))

/**
 * --dur-carousel is paired with --ease-carousel rather than the default,
 * because the two were measured together and exist for nothing else. Every
 * other row holds the easing constant so the duration is the only variable.
 */
const DURATION_SPECS: AnimSpec[] = DURATIONS.map((d) => ({
  id: `dur-${d.name}`,
  keyframe: 'assetEnter',
  duration: `var(${d.name})`,
  easing: d.name === '--dur-carousel' ? 'var(--ease-carousel)' : 'var(--ease-out)',
  label: d.name,
  note: `${d.value}, ${d.use}`,
}))

/** Every @keyframes block in app/globals.css. None added, none omitted. */
const KEYFRAME_SPECS: AnimSpec[] = [
  {
    id: 'kf-grain',
    keyframe: 'grain',
    duration: '8s',
    easing: 'steps(10)',
    iterationCount: 'infinite',
    shape: 'grain',
    continuous: true,
    label: 'grain',
    note: 'Animated film texture. Non-negotiable for large dark fields; opacity raised here so it is visible at all.',
  },
  {
    id: 'kf-fadeOutBlur',
    keyframe: 'fadeOutBlur',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    animationFillMode: 'forwards',
    endsHidden: true,
    label: 'fadeOutBlur',
    note: 'THE SIGNATURE MOVE. Content defocuses, never fades flat.',
  },
  {
    id: 'kf-fadeInBlur',
    keyframe: 'fadeInBlur',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    label: 'fadeInBlur',
    note: 'The inbound half of every media and asset swap.',
  },
  {
    id: 'kf-fadeInTabTranslate',
    keyframe: 'fadeInTabTranslate',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    label: 'fadeInTabTranslate',
    note: '5px (--d-panel). `visibility` animates alongside opacity, which is what keeps hidden panels out of the tab order.',
  },
  {
    id: 'kf-fadeOutTabTranslate',
    keyframe: 'fadeOutTabTranslate',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    animationFillMode: 'forwards',
    endsHidden: true,
    label: 'fadeOutTabTranslate',
    note: 'The outgoing panel. -5px.',
  },
  {
    id: 'kf-slideUpAndFade',
    keyframe: 'slideUpAndFade',
    duration: 'var(--dur-micro)',
    easing: 'var(--ease-out)',
    label: 'slideUpAndFade',
    note: '2px (--d-tooltip). Tooltips and inline hints.',
  },
  {
    id: 'kf-slideDownAndFade',
    keyframe: 'slideDownAndFade',
    duration: 'var(--dur-micro)',
    easing: 'var(--ease-out)',
    label: 'slideDownAndFade',
    note: '-2px. The mirror, for anything anchored above its trigger.',
  },
  {
    id: 'kf-slideUpMoreAndFade',
    keyframe: 'slideUpMoreAndFade',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    label: 'slideUpMoreAndFade',
    note: '10px (--d-content). Every scroll reveal on the site is this one.',
  },
  {
    id: 'kf-scaleIn',
    keyframe: 'scaleIn',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    label: 'scaleIn',
    note: 'rotateX(-10deg) scale(.9) → rest. Overlays only, the 3D hinge is a menu affordance, never a hover effect.',
  },
  {
    id: 'kf-scaleOut',
    keyframe: 'scaleOut',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    animationFillMode: 'forwards',
    endsHidden: true,
    label: 'scaleOut',
  },
  {
    id: 'kf-collapseDown',
    keyframe: 'collapseDown',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    shape: 'collapse',
    vars: { '--radix-accordion-content-height': '72px' },
    label: 'collapseDown',
    note: 'The ONE permitted height animation, because Radix measures the height for it.',
  },
  {
    id: 'kf-collapseUp',
    keyframe: 'collapseUp',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    animationFillMode: 'forwards',
    shape: 'collapse',
    vars: { '--radix-accordion-content-height': '72px' },
    endsHidden: true,
    label: 'collapseUp',
  },
  {
    id: 'kf-assetEnter',
    keyframe: 'assetEnter',
    duration: 'var(--dur-scene)',
    easing: 'var(--ease-out)',
    label: 'assetEnter',
    note: '32px (--d-entrance). The only 32px move in the system, and the ceiling for every animated distance.',
  },
  {
    id: 'kf-assetExit',
    keyframe: 'assetExit',
    duration: 'var(--dur-scene)',
    easing: 'var(--ease-out)',
    animationFillMode: 'forwards',
    endsHidden: true,
    label: 'assetExit',
    note: '-32px.',
  },
  {
    id: 'kf-outUp',
    keyframe: 'outUp',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    animationFillMode: 'forwards',
    shape: 'strip',
    endsHidden: true,
    label: 'outUp',
    note: 'Number roller, old value leaving. translateY(-100%) of the strip, which is why <Stat> suppresses the roll above 32px.',
  },
  {
    id: 'kf-inFromBelow',
    keyframe: 'inFromBelow',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    shape: 'strip',
    label: 'inFromBelow',
    note: 'Number roller, new value arriving. The value is already in the HTML; this animates FROM it.',
  },
  {
    id: 'kf-marquee',
    keyframe: 'marquee',
    duration: '12s',
    easing: 'linear',
    iterationCount: 'infinite',
    shape: 'track',
    vars: { '--gap': 'var(--s6)' },
    continuous: true,
    label: 'marquee',
    note: 'translate: calc(-50% - var(--gap) / 2). Exact only for a track of 2N items with no trailing padding.',
  },
  {
    id: 'kf-shine',
    keyframe: 'shine',
    duration: 'var(--dur-scene)',
    easing: 'var(--ease-out)',
    shape: 'mask',
    label: 'shine',
    note: 'Animates mask-position, so the shimmer needs no extra DOM.',
  },
  {
    id: 'kf-wipeOut',
    keyframe: 'wipeOut',
    duration: 'var(--dur-base)',
    easing: 'var(--ease-out)',
    animationFillMode: 'forwards',
    endsHidden: true,
    label: 'wipeOut',
    note: 'clip-path inset. A reveal that costs no layout.',
  },
  {
    id: 'kf-drawStroke',
    keyframe: 'drawStroke',
    duration: 'var(--dur-scene)',
    easing: 'var(--ease-out)',
    shape: 'stroke',
    vars: { '--dash': '400' },
    label: 'drawStroke',
    note: 'SVG stroke draw, the Secure SDLC pipeline. --dash must be the real path length or the draw snaps at the end.',
  },
  {
    id: 'kf-ringSpin',
    keyframe: 'ringSpin',
    duration: '0.9s',
    easing: 'linear',
    iterationCount: 'infinite',
    shape: 'ring',
    continuous: true,
    label: 'ringSpin',
    note: 'Indeterminate loading ring for the motion-clip loading state.',
  },
  {
    id: 'kf-caretBlink',
    keyframe: 'caretBlink',
    duration: '1s',
    easing: 'steps(1)',
    iterationCount: 'infinite',
    shape: 'caret',
    continuous: true,
    label: 'caretBlink',
    note: 'Terminal-style blocks only.',
  },
]

/* -------------------------------------------------------------------------- *
 * DEMO CONTENT
 * -------------------------------------------------------------------------- */

const TAB_ITEMS = [
  { value: 'project', label: 'Project', content: <p>Fixed scope, fixed window, a written exclusions list.</p> },
  { value: 'retainer', label: 'Retainer', content: <p>A standing allocation with a named lead and a monthly report.</p> },
  { value: 'embedded', label: 'Embedded team', content: <p>Our engineers in your stand-up, your tracker, your repo.</p> },
]

const FAQ_ITEMS = [
  { q: 'Does the accordion work without JavaScript?', a: 'Yes. Faq ships a static definition list of every question and answer, visible only while the no-js class survives on <html>.' },
  { q: 'Is the height animation a spec violation?', a: 'No. It is the single documented exception, because Radix measures the panel into --radix-accordion-content-height first.' },
]

const MARQUEE_ITEMS = [
  { label: 'Northgate Freight', meta: 'Logistics' },
  { label: 'GitHub', meta: 'With a mark', logo: <BrandIcon icon={siGithub} size={20} /> },
  { label: 'Cloudflare', meta: 'Services Partner', logo: <BrandIcon icon={siCloudflare} size={20} />, href: '/partners' },
  { label: 'X', meta: 'Linked item', logo: <BrandIcon icon={siX} size={20} />, href: 'https://x.com/envenox' },
  { label: 'Label only', meta: 'No mark at all. The label is the content' },
]

const SEVERITIES: BadgeSeverity[] = ['critical', 'high', 'medium', 'low', 'info']

/* -------------------------------------------------------------------------- *
 * BUTTON / BADGE / CARD / STAT SHELVES - one function, rendered per theme
 * -------------------------------------------------------------------------- */

function ButtonShelf() {
  return (
    <div className="sg-stack-md">
      <Shelf label="variant × size">
        <div className="sg-stack-sm">
          {(['primary', 'secondary', 'ghost', 'danger-quiet'] as const).map((variant) => (
            <div className="sg-set" key={variant}>
              <span className="sg-mono" style={{ color: 'var(--muted)', minWidth: '7rem' }}>
                {variant}
              </span>
              <Button variant={variant} size="sm">
                Small
              </Button>
              <Button variant={variant} size="md">
                Medium
              </Button>
              <Button variant={variant} size="lg">
                Large
              </Button>
            </div>
          ))}
        </div>
      </Shelf>

      <Shelf label="icons, as link and as button">
        <div className="sg-set">
          <Button
            href="/services"
            iconRight={<ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />}
          >
            Anchor, icon right
          </Button>
          <Button
            variant="secondary"
            iconLeft={<Download size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />}
          >
            Button, icon left
          </Button>
          <Button
            variant="ghost"
            iconLeft={<Bug size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />}
            iconRight={<ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />}
          >
            Both
          </Button>
        </div>
      </Shelf>

      <Shelf label="disabled, <button disabled> and <a aria-disabled>">
        <div className="sg-set">
          <Button variant="primary" disabled>
            Disabled button
          </Button>
          <Button variant="secondary" disabled>
            Disabled secondary
          </Button>
          <Button href="/services" aria-disabled="true">
            Disabled anchor
          </Button>
        </div>
      </Shelf>

      <Shelf label="fullWidth">
        <Button variant="primary" fullWidth>
          Full width
        </Button>
      </Shelf>
    </div>
  )
}

function BadgeShelf() {
  return (
    <div className="sg-stack-md">
      <Shelf label="neutral and brand, sm and md">
        <div className="sg-set">
          <Badge variant="neutral" size="sm">
            neutral sm
          </Badge>
          <Badge variant="neutral" size="md">
            neutral md
          </Badge>
          <Badge variant="brand" size="sm">
            brand sm
          </Badge>
          <Badge variant="brand" size="md">
            brand md
          </Badge>
        </div>
      </Shelf>

      <Shelf label="severity, the only --signal-* usage in the codebase">
        <div className="sg-set">
          {SEVERITIES.map((s) => (
            <Badge key={s} variant="severity" severity={s} />
          ))}
        </div>
      </Shelf>

      <Shelf label="severity with an overridden label">
        <div className="sg-set">
          <Badge variant="severity" severity="critical" label="Critical · CVSS 9.8" />
          <Badge variant="severity" severity="medium" size="md" label="Medium · 3 open" />
        </div>
      </Shelf>
    </div>
  )
}

function CardShelf() {
  return (
    <div className="sg-stack-md">
      <Shelf label="padding none / md / lg">
        <div className="sg-set sg-set--top">
          <Card padding="none" style={{ width: 160, height: 72 }} />
          <Card padding="md" style={{ width: 160 }}>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>padding md</p>
          </Card>
          <Card padding="lg" style={{ width: 160 }}>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>padding lg</p>
          </Card>
        </div>
      </Shelf>

      <Shelf label="flush (transparent) and interactive (forced hover affordance)">
        <div className="sg-set sg-set--top">
          <Card flush style={{ width: 160 }}>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>flush</p>
          </Card>
          <Card interactive style={{ width: 160 }}>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>interactive</p>
          </Card>
        </div>
      </Shelf>

      <Shelf label="CardLink (stretched anchor) + CardAbove (a second target)">
        <Card padding="lg" style={{ maxWidth: 420 }}>
          <h4 className="sg-h4">
            <CardLink href="/services/penetration-testing">Penetration Testing</CardLink>
          </h4>
          <p style={{ margin: 'var(--s2) 0 var(--s4)', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
            The whole surface is clickable, but the accessible name is only the anchor&apos;s own text.
          </p>
          <CardAbove>
            <Button variant="ghost" size="sm" href="/sample-report">
              Second target, above the overlay
            </Button>
          </CardAbove>
        </Card>
      </Shelf>
    </div>
  )
}

function StatShelf() {
  return (
    <div className="sg-stack-md">
      <Shelf label="size sm / md / lg, every figure is server-rendered text">
        <div className="sg-set sg-set--top" style={{ gap: 'var(--s12)' }}>
          <Stat value="240" suffix="+" label="engagements delivered" size="sm" provenance="none" />
          <Stat value="240" suffix="+" label="engagements delivered" size="md" provenance="none" />
          <Stat value="240" suffix="+" label="engagements delivered" size="lg" provenance="none" />
        </div>
      </Shelf>

      <Shelf label="provenance details / title / none">
        <div className="sg-set sg-set--top" style={{ gap: 'var(--s12)' }}>
          <Stat
            value="71"
            label="net promoter score"
            size="sm"
            source="Post-engagement survey, 94 responses"
            asOf="2026-09-30"
            provenance="details"
          />
          <Stat
            value="71"
            label="net promoter score"
            size="sm"
            source="Post-engagement survey, 94 responses"
            asOf="2026-09-30"
            provenance="title"
          />
          <Stat value="71" label="net promoter score" size="sm" provenance="none" />
        </div>
      </Shelf>

      <Shelf label="StatBar, columns 4, 3, 2">
        <div className="sg-stack-md">
          <StatBar stats={headlineStats} ariaLabel="Four columns" columns={4} size="md" />
          <StatBar stats={headlineStats.slice(0, 3)} ariaLabel="Three columns" columns={3} size="sm" />
          <StatBar stats={headlineStats.slice(0, 2)} ariaLabel="Two columns" columns={2} size="sm" />
        </div>
      </Shelf>
    </div>
  )
}

function AvatarShelf() {
  return (
    <div className="sg-stack-md">
      <Shelf label="sizes 32 / 48 / 64, square and round">
        <div className="sg-set">
          <AvatarPlaceholder name="Priya Raman" size={32} />
          <AvatarPlaceholder name="Priya Raman" size={48} />
          <AvatarPlaceholder name="Priya Raman" size={64} />
          <AvatarPlaceholder name="Daniel Okafor" size={48} round />
          <AvatarPlaceholder name="Sofia Marek" size={48} round />
        </div>
      </Shelf>
      <Shelf label="BrandIcon, labelled (role=img) and unlabelled (aria-hidden)">
        <div className="sg-set">
          <BrandIcon icon={siGithub} label="GitHub" size={24} />
          <BrandIcon icon={siX} label="X" size={24} />
          <BrandIcon icon={siCloudflare} size={24} />
          <span className="sg-mono" style={{ color: 'var(--muted)' }}>
            no siLinkedin in simple-icons 15.15.0, text chip only
          </span>
        </div>
      </Shelf>
    </div>
  )
}

/* -------------------------------------------------------------------------- *
 * PAGE
 * -------------------------------------------------------------------------- */

const TOC = [
  { href: '#colour', label: '1 · Colour tokens' },
  { href: '#type', label: '2 · Type scale' },
  { href: '#space', label: '3 · Space & radius' },
  { href: '#motion', label: '4 · Motion tokens' },
  { href: '#keyframes', label: '5 · Keyframe library' },
  { href: '#components', label: '6 · components/ui' },
  { href: '#product', label: '7 · components/product' },
  { href: '#reduced-motion', label: '8 · Reduced motion & no-JS' },
]

export default function StyleguidePage() {
  /**
   * NOT PUBLISHED. The `robots: { index: false }` above is a REQUEST to
   * crawlers, not an access control - anyone who knows the path still gets the
   * full internal token and component reference, including the client-side
   * <Demos> and SceneRunner bundles. The page is absent from sitemap.ts and was
   * absent from the robots.ts disallow list too, so nothing actually stopped it
   * being served.
   *
   * `next build` runs with NODE_ENV=production, so this resolves the route to a
   * 404 in any production build while leaving it fully available under
   * `next dev`, which is the only place it is useful.
   */
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <>
      <style href="envenox-styleguide" precedence="default">
        {CSS}
      </style>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <Section theme="dark" offsetNav aria-labelledby="sg-title">
        <div className="sg-stack-md">
          <p className="u-eyebrow">Internal · not indexed</p>
          <h1 id="sg-title" className="sg-h2">
            Styleguide
          </h1>
          <p className="sg-note">
            Every colour, type, space, radius and motion token, and every component, rendered in all
            three themes. This page is the design-regression test: if something here looks wrong,
            it is wrong everywhere.
          </p>
          <div className="sg-callout">
            <p>
              <strong>Reduced motion.</strong> Under{' '}
              <code className="sg-mono">prefers-reduced-motion: reduce</code> globals.css clamps
              every animation and transition to 0.01ms, stops the grain, stops the marquee and turns
              it into a horizontal scroller, and forces every{' '}
              <code className="sg-mono">[data-reveal]</code> to its end state. So this page becomes
              a complete static reference: the Replay buttons still work, but each target snaps to
              its finished frame instead of travelling. Nothing is hidden and nothing is missing —
              which is the point.
            </p>
            <p>
              <strong>No JavaScript.</strong> Everything except the Replay buttons is server
              rendered. With scripting off the buttons are inert and every target renders in its
              resting state; the accordion below falls back to a static definition list and the tab
              strip falls back to stacked, headed panels.
            </p>
          </div>
          <nav aria-label="Styleguide contents">
            <ul className="sg-toc">
              {TOC.map((t) => (
                <li key={t.href}>
                  <a href={t.href}>{t.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Section>

      {/* ── 1. COLOUR ──────────────────────────────────────────────────── */}
      <Section theme="dark" id="colour" aria-labelledby="sg-colour">
        <div className="sg-stack">
          <div className="sg-stack-sm">
            <h2 id="sg-colour" className="sg-h2">
              1 · Colour tokens
            </h2>
            <p className="sg-note">
              Every theme token, with its hex, the raw token it aliases, and its WCAG contrast ratio
              against that theme&apos;s background, computed in code from the token values and
              shipped as server-rendered text. Each is graded against the threshold its ROLE needs:
              4.5:1 for body text, 3:1 for large text, none at all for a surface fill, and 3:1 for a
              hairline but only where the hairline carries meaning, those rows state the shortfall
              in blue rather than red. So every red badge on this page means one thing, a text
              colour that genuinely fails, and a reviewer does not learn to ignore them.
            </p>
            <p className="sg-note">
              The light theme is first because the light theme is where these systems fail.
            </p>
            <div className="sg-callout">
              <p>
                <strong>
                  OPEN FINDING: one red badge below, and it is a real AA failure.
                </strong>{' '}
                In <code className="sg-mono">.theme-light</code>,{' '}
                <code className="sg-mono">--accent-fg</code> (#F7F5F1) on{' '}
                <code className="sg-mono">--accent</code> (#5B6CFF) measures{' '}
                <strong>3.83:1</strong> against a 4.5:1 requirement. That pair is the label on every
                primary button in every light band on the site, the Services and case-study CTAs on
                the homepage among them. It is not large text under WCAG: the largest button size
                sets its label at <code className="sg-mono">--text-base</code> (16px) weight 500,
                and the large-text allowance starts at 18.66px bold or 24px regular.
              </p>
              <p>
                The fix needs no new token. Swapping{' '}
                <code className="sg-mono">.theme-light</code>&apos;s{' '}
                <code className="sg-mono">--accent</code> from{' '}
                <code className="sg-mono">var(--accent-500)</code> to the existing{' '}
                <code className="sg-mono">var(--accent-600)</code> (#4452D8) takes the pair to
                5.59:1. Lightening <code className="sg-mono">--accent-fg</code> instead does not
                work: pure #FFFFFF on #5B6CFF is only 4.17:1, so the accent itself has to move.
                <code className="sg-mono">--accent</code> also drives the focus ring, which the same
                change improves. This belongs in{' '}
                <code className="sg-mono">app/globals.css</code>, which this page does not own, it
                is reported here rather than patched.
              </p>
            </div>
          </div>

          <div className="sg-duo">
            {THEMES.filter((t) => t.key !== 'deep').map((theme) => (
              <Pane key={theme.key} theme={theme.key} label={`.${theme.label}`}>
                <p className="sg-note" style={{ marginBottom: 'var(--s4)' }}>
                  {theme.note}
                </p>
                <SwatchList theme={theme} />
              </Pane>
            ))}
          </div>

          {THEMES.filter((t) => t.key === 'deep').map((theme) => (
            <Pane key={theme.key} theme={theme.key} label={`.${theme.label}`}>
              <p className="sg-note" style={{ marginBottom: 'var(--s4)' }}>
                {theme.note}
              </p>
              <SwatchList theme={theme} />
            </Pane>
          ))}

          {/* The raw ramp, measured against both field colours. */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Raw palette</h3>
            <p className="sg-note">
              The values every theme token aliases. Measured against both field colours so a
              reviewer can see which neutrals are usable as text on which theme. Signal colours
              appear in exactly one component —{' '}
              <code className="sg-mono">&lt;Badge variant=&quot;severity&quot;&gt;</code>, and
              never as brand chrome.
            </p>
            {Array.from(new Set(RAW_TOKENS.map((t) => t.group))).map((group) => (
              <div key={group}>
                <p className="sg-label" style={{ marginBottom: 'var(--s2)' }}>
                  {group}
                </p>
                <ul className="sg-sw">
                  {RAW_TOKENS.filter((t) => t.group === group).map((token) => {
                    const onLight = contrastRatio(token.value, '#f7f5f1')
                    const onDark = contrastRatio(token.value, '#0a0d13')
                    return (
                      <li key={token.name}>
                        <span
                          className="sg-chip"
                          style={{ backgroundColor: `var(${token.name})` }}
                          aria-hidden="true"
                        />
                        <div>
                          <p className="sg-sw__name">
                            <span>{token.name}</span>
                            <span className="sg-sw__hex">{token.value}</span>
                          </p>
                          <div className="sg-sw__grade">
                            <span className="sg-sw__ratio">{formatRatio(onLight)}:1 on light</span>
                            <Verdict
                              pass={onLight >= 4.5}
                              threshold="as text"
                              passWord="USABLE"
                              failWord="NOT USABLE"
                            />
                            <span className="sg-sw__ratio">{formatRatio(onDark)}:1 on dark</span>
                            <Verdict
                              pass={onDark >= 4.5}
                              threshold="as text"
                              passWord="USABLE"
                              failWord="NOT USABLE"
                            />
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 2. TYPE ────────────────────────────────────────────────────── */}
      <Section theme="light" id="type" aria-labelledby="sg-type">
        <div className="sg-stack">
          <div className="sg-stack-sm">
            <h2 id="sg-type" className="sg-h2">
              2 · Type scale
            </h2>
            <p className="sg-note">
              Ten sizes, four families. Set on the light field, which is where hinting and weight
              problems show first. Headings are Inter Tight at 600 with{' '}
              <code className="sg-mono">--tracking-tight</code>; body is Inter at 400; Instrument
              Serif appears only in <code className="sg-mono">ChapterOpener</code>; JetBrains Mono
              is for identifiers, timestamps, CVEs and certificate numbers and nothing else.
            </p>
          </div>

          <div className="sg-trio">
            {(['light', 'dark', 'deep'] as const).map((theme) => (
              <Pane key={theme} theme={theme} label={`.theme-${theme} · --text-2xl`}>
                <p style={{ margin: 0, fontSize: 'var(--text-2xl)', lineHeight: 'var(--leading-tight)', letterSpacing: 'var(--tracking-tight)' }}>
                  Secure SDLC 2026
                </p>
                <p style={{ margin: 'var(--s3) 0 0', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                  Secondary copy in --muted, at --text-sm.
                </p>
              </Pane>
            ))}
          </div>

          {FONT_FAMILIES.map((family) => (
            <div key={family.key} className="sg-stack-sm">
              <h3 className="sg-h3">{family.label}</h3>
              <p className="sg-note">{family.use}</p>
              <ul className="sg-type">
                {TYPE_SCALE.map((size) => (
                  <li key={`${family.key}-${size.name}`}>
                    <p className="sg-label">
                      {size.name} · {size.rem} · {size.px}px
                    </p>
                    <p
                      className="sg-type__sample"
                      style={{ fontFamily: family.css, fontSize: `var(${size.name})` } as CSSProperties}
                    >
                      Secure SDLC 2026
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. SPACE & RADIUS ──────────────────────────────────────────── */}
      <Section theme="dark" id="space" aria-labelledby="sg-space">
        <div className="sg-stack">
          <div className="sg-stack-sm">
            <h2 id="sg-space" className="sg-h2">
              3 · Space &amp; radius
            </h2>
            <p className="sg-note">
              Eleven spacing steps and four radii. Every bar below is drawn at{' '}
              <code className="sg-mono">width: var(--sN)</code>, so it measures the live token
              rather than a transcribed number.
            </p>
          </div>

          <div className="sg-grid-2">
            <div className="sg-stack-sm">
              <h3 className="sg-h3">Spacing</h3>
              <ul className="sg-ruler">
                {SPACING_SCALE.map((s) => (
                  <li key={s.name}>
                    <span className="sg-mono" style={{ color: 'var(--muted)' }}>
                      {s.name} · {s.px}px
                    </span>
                    <span
                      className="sg-ruler__bar"
                      style={{ width: `var(${s.name})` }}
                      aria-hidden="true"
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="sg-stack-sm">
              <h3 className="sg-h3">Radius</h3>
              <ul className="sg-radii">
                {RADIUS_SCALE.map((r) => (
                  <li key={r.name}>
                    <div
                      className="sg-radius"
                      style={{ borderRadius: `var(${r.name})` }}
                      aria-hidden="true"
                    />
                    <p className="sg-label">
                      {r.name} · {r.px}px
                    </p>
                    <p className="sg-note" style={{ fontSize: 'var(--text-xs)' }}>
                      {r.use}
                    </p>
                  </li>
                ))}
              </ul>

              <h3 className="sg-h3" style={{ marginTop: 'var(--s8)' }}>
                Animated distances
              </h3>
              <p className="sg-note">
                The complete vocabulary. Nothing on the site moves further than 32px, which is why
                the <code className="sg-mono">&lt;Stat&gt;</code> roller is suppressed above a 32px
                strip.
              </p>
              <ul className="sg-ruler">
                {DISTANCES.map((d) => (
                  <li key={d.name}>
                    <span className="sg-mono" style={{ color: 'var(--muted)' }}>
                      {d.name} · {d.px}px
                    </span>
                    <span
                      className="sg-ruler__bar"
                      style={{ width: `var(${d.name})`, minWidth: 2 }}
                      aria-hidden="true"
                    />
                  </li>
                ))}
              </ul>
              <ul className="sg-sw" style={{ marginTop: 'var(--s2)' }}>
                {DISTANCES.map((d) => (
                  <li key={`${d.name}-use`} style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
                    <p className="sg-note" style={{ fontSize: 'var(--text-xs)' }}>
                      <code className="sg-mono">{d.name}</code>, {d.use}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 4. MOTION TOKENS ───────────────────────────────────────────── */}
      <Section theme="dark" id="motion" aria-labelledby="sg-motion">
        <div className="sg-stack">
          <div className="sg-stack-sm">
            <h2 id="sg-motion" className="sg-h2">
              4 · Motion tokens
            </h2>
            <p className="sg-note">
              Four easings and three durations, the whole vocabulary. Every row below runs the same
              keyframe (<code className="sg-mono">assetEnter</code>, the 32px move) so the only
              variable is the token being demonstrated. Press Replay to watch the difference between{' '}
              <code className="sg-mono">--ease-out</code> and{' '}
              <code className="sg-mono">--ease-in-out</code>; it is real, and it is small, which is
              the design. <code className="sg-mono">--ease-carousel</code> is shown here at{' '}
              <code className="sg-mono">--dur-scene</code> so the four curves are directly
              comparable; in production it only ever runs at{' '}
              <code className="sg-mono">--dur-carousel</code>.
            </p>
          </div>

          <AnimLab
            title="Easings, all at --dur-scene"
            description="The duration is held at 0.5s so the curve shape is actually legible. In production --ease-out carries about 60% of all motion."
            specs={EASING_SPECS}
          />

          <AnimLab
            title="Durations"
            description="--dur-base is the house tempo. --dur-micro is hover and focus only. --dur-scene is reserved for theme changes and media cross-fades. --dur-carousel is shown on --ease-carousel rather than --ease-out, because the pair was measured together and exists for nothing else; every other row holds the easing constant."
            specs={DURATION_SPECS}
          />

          <RevealLab />
        </div>
      </Section>

      {/* ── 5. KEYFRAMES ───────────────────────────────────────────────── */}
      <Section theme="dark" id="keyframes" aria-labelledby="sg-keyframes">
        <div className="sg-stack">
          <div className="sg-stack-sm">
            <h2 id="sg-keyframes" className="sg-h2">
              5 · Keyframe library
            </h2>
            <p className="sg-note">
              Every <code className="sg-mono">@keyframes</code> block in{' '}
              <code className="sg-mono">app/globals.css</code>, demonstrated on the smallest target
              that makes it legible. None added, none omitted. Exit animations rest in their end
              state, hidden or off-position, on purpose, because that is what they do in
              production.
            </p>
          </div>

          <AnimLab
            title="All 22 keyframes"
            description="Each runs at its production duration and easing. Four of them loop forever and have no replay."
            specs={KEYFRAME_SPECS}
          />
        </div>
      </Section>

      {/* ── 6. COMPONENTS ──────────────────────────────────────────────── */}
      <Section theme="dark" id="components" aria-labelledby="sg-components">
        <div className="sg-stack">
          <div className="sg-stack-sm">
            <h2 id="sg-components" className="sg-h2">
              6 · components/ui
            </h2>
            <p className="sg-note">
              Every component, every variant, every state, in both themes side by side wherever the
              palette changes the answer. Hover any of them: the only thing that changes is colour.
              There is no transform, no scale and no lift on hover anywhere in this system.
            </p>
          </div>

          {/* --- focus-visible --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Focus-visible</h3>
            <p className="sg-note">
              <code className="sg-mono">:focus-visible</code> is{' '}
              <code className="sg-mono">2px solid var(--accent)</code> at{' '}
              <code className="sg-mono">2px</code> offset, set globally, so it re-colours with the
              section it lands in and never has to be re-declared per component. It cannot be forced
              from script without lying about the interaction that produced it, so{' '}
              <strong>press Tab</strong> and walk the controls below. The static sample shows the
              ring geometry.
            </p>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <div className="sg-set">
                    <span className="sg-focus-ring">Static ring sample</span>
                    <Button variant="secondary" size="sm">
                      Tab to me
                    </Button>
                    <a href="#components" className="u-link" style={{ color: 'var(--fg)' }}>
                      and me
                    </a>
                  </div>
                </Pane>
              ))}
            </div>
          </div>

          {/* --- Button --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Button</h3>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <ButtonShelf />
                </Pane>
              ))}
            </div>
          </div>

          {/* --- Badge --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Badge</h3>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <BadgeShelf />
                </Pane>
              ))}
            </div>
          </div>

          {/* --- Card --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Card</h3>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <CardShelf />
                </Pane>
              ))}
            </div>
          </div>

          {/* --- Stat / StatBar --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Stat &amp; StatBar</h3>
            <p className="sg-note">
              The roll plays at <code className="sg-mono">size=&quot;sm&quot;</code> and is
              deliberately absent at <code className="sg-mono">md</code> and{' '}
              <code className="sg-mono">lg</code>, because the sanctioned roller keyframes translate
              100% of the strip height and that exceeds 32px at those sizes. The 32px ceiling wins.
              Every figure is in the server HTML either way.
            </p>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <StatShelf />
                </Pane>
              ))}
            </div>
          </div>

          {/* --- Avatar / BrandIcon --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">AvatarPlaceholder &amp; BrandIcon</h3>
            <p className="sg-note">
              The avatar hue is derived from the name, so a person keeps the same tile across pages
              and rebuilds. It must read as obviously a placeholder, initials on a flat gradient,
              never a generated likeness.
            </p>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <AvatarShelf />
                </Pane>
              ))}
            </div>
          </div>

          {/* --- Marquee --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Marquee</h3>
            <p className="sg-note">
              Every mark carries a readable text label beside it. The label is the content, the
              mark is decoration. Pauses on hover and on focus-within. Under reduced motion it stops
              and becomes a horizontal scroller.
            </p>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <Marquee items={MARQUEE_ITEMS} ariaLabel={`Marquee sample, ${theme}`} duration="24s" />
                </Pane>
              ))}
            </div>
          </div>

          {/* --- ChapterOpener --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">ChapterOpener</h3>
            <div className="sg-callout">
              <p>
                <strong>Ration notice.</strong> Instrument Serif is allowed three appearances across
                the entire site and the audit is{' '}
                <code className="sg-mono">grep -rn &quot;ChapterOpener&quot; app components</code>,
                which will find this one. It is here because a styleguide that omits a component
                cannot catch a regression in it. Count this instance as the styleguide&apos;s, not as
                one of the three: this route is <code className="sg-mono">noindex</code>, is not in
                the nav and is not in the sitemap.
              </p>
            </div>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <ChapterOpener
                    as="p"
                    rule
                    eyebrow="eyebrow, optional"
                    note="One supporting sentence below, set in Inter, never a second serif line."
                  >
                    One editorial line, and then the page returns to Inter.
                  </ChapterOpener>
                </Pane>
              ))}
            </div>
          </div>

          {/* --- Tabs --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Tabs</h3>
            <p className="sg-note">
              All panels are force-mounted so the content ships in the server HTML; under{' '}
              <code className="sg-mono">.no-js</code> the strip hides and the panels stack behind
              their own headings.
            </p>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <Tabs items={TAB_ITEMS} ariaLabel={`Engagement models, ${theme}`} />
                </Pane>
              ))}
            </div>
          </div>

          {/* --- Faq --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Faq</h3>
            <p className="sg-note">
              <code className="sg-mono">jsonLd={'{false}'}</code> here. This is a demonstration, not
              a real FAQ, and a document may carry exactly one FAQPage.
            </p>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <Faq items={FAQ_ITEMS} jsonLd={false} headingLevel={4} />
                </Pane>
              ))}
            </div>
          </div>

          {/* --- Prose --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Prose</h3>
            <p className="sg-note">
              Styled by element, so MDX, a CMS payload and hand-written JSX land identically. 68ch
              measure unless <code className="sg-mono">wide</code>.
            </p>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <Prose wide>
                    <p className="prose__lead">
                      The lead paragraph is --text-lg in --fg. Everything after it is --muted-strong.
                    </p>
                    <h2>Heading two</h2>
                    <p>
                      Body copy with <a href="#components">a link</a>, <strong>strong</strong>,{' '}
                      <em>emphasis</em>, inline <code>trustgraph --org</code> and a{' '}
                      <small>small note</small>.
                    </p>
                    <h3>Heading three</h3>
                    <ul>
                      <li>Unordered items take a hairline dash, not a bullet.</li>
                      <li>
                        Nested:
                        <ul>
                          <li>second level</li>
                        </ul>
                      </li>
                    </ul>
                    <ol>
                      <li>Ordered items use tabular decimal markers.</li>
                      <li>Second.</li>
                    </ol>
                    <blockquote>
                      A pull quote sits on a hairline rule rather than in a tinted box.
                      <cite>Head of Platform Security</cite>
                    </blockquote>
                    <h4>Heading four</h4>
                    <pre>
                      <code>{`aws iam simulate-principal-policy \\
  --policy-source-arn "$ROLE"`}</code>
                    </pre>
                    <hr />
                    <div className="sg-scroll">
                    <table>
                      <caption style={{ textAlign: 'left' }}>Tabular figures</caption>
                      <thead>
                        <tr>
                          <th scope="col">Finding class</th>
                          <th scope="col">First test</th>
                          <th scope="col">Fourth test</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">Broken object-level auth</th>
                          <td>12</td>
                          <td>2</td>
                        </tr>
                        <tr>
                          <th scope="row">Missing tenant predicate</th>
                          <td>7</td>
                          <td>0</td>
                        </tr>
                      </tbody>
                    </table>
                    </div>
                    <figure>
                      <div
                        style={{
                          height: 64,
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      />
                      <figcaption>A figure caption, at --text-sm in --muted.</figcaption>
                    </figure>
                    <dl>
                      <dt>Definition term</dt>
                      <dd>Definition description.</dd>
                      <dt>Second term</dt>
                      <dd>Second description.</dd>
                    </dl>
                  </Prose>
                </Pane>
              ))}
            </div>
          </div>

          {/* --- Reveal / RevealGroup --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Reveal &amp; RevealGroup</h3>
            <p className="sg-note">
              The real components, live. They fire exactly once, the shared
              IntersectionObserver unobserves the target inside its own callback before anything
              else, so these six cells entered when you first scrolled past them and will not
              replay on scroll-back. That is the contract, not a limitation; the replayable copy is
              in <a href="#motion" className="u-link" style={{ color: 'var(--fg)' }}>section 4</a>.
              The stagger is CSS <code className="sg-mono">:nth-child</code> rather than
              cloneElement, so it survives a <code className="sg-mono">.map()</code> and the
              server/client boundary, and <code className="sg-mono">:nth-child(n + 5)</code> caps it
              at the fifth sibling.
            </p>
            <div className="sg-duo">
              {(['light', 'dark'] as const).map((theme) => (
                <Pane key={theme} theme={theme} label={`.theme-${theme}`}>
                  <RevealGroup as="ul" className="sg-set" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {['0ms', '60ms', '120ms', '180ms', '240ms', '240ms'].map((d, i) => (
                      <Reveal as="li" key={`${theme}-${d}-${i}`}>
                        <Badge variant="neutral" size="md">
                          {i + 1} · {d}
                        </Badge>
                      </Reveal>
                    ))}
                  </RevealGroup>
                </Pane>
              ))}
            </div>
          </div>

          {/* --- Section --- */}
          <div className="sg-stack-md">
            <h3 className="sg-h3">Section</h3>
            <p className="sg-note">
              Every band on this page is a <code className="sg-mono">&lt;Section&gt;</code>, which is
              why the nav re-colours as you scroll: it reads{' '}
              <code className="sg-mono">data-theme-section</code>, which only{' '}
              <code className="sg-mono">&lt;Section&gt;</code> emits. The three panes below are the
              three palettes; <code className="sg-mono">grain</code>,{' '}
              <code className="sg-mono">tight</code>, <code className="sg-mono">offsetNav</code> and{' '}
              <code className="sg-mono">bleed</code> are padding and texture switches, demonstrated
              by this page&apos;s own bands rather than duplicated here.
            </p>
            <div className="sg-trio">
              {THEMES.map((theme) => (
                <Pane key={theme.key} theme={theme.key} label={`.${theme.label}`}>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>{theme.note}</p>
                  <div className="sg-set" style={{ marginTop: 'var(--s4)' }}>
                    <Button variant="primary" size="sm">
                      Primary
                    </Button>
                    <Button variant="secondary" size="sm">
                      Secondary
                    </Button>
                    <Badge variant="brand">accent</Badge>
                  </div>
                </Pane>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 7. PRODUCT UI ──────────────────────────────────────────────── */}
      <Section theme="dark" id="product" aria-labelledby="sg-product">
        <div className="sg-stack">
          <div className="sg-stack-sm">
            <h2 id="sg-product" className="sg-h2">
              7 · components/product
            </h2>
            <p className="sg-note">
              The stylised product-UI set, drawn in HTML, CSS and SVG rather than screenshotted,
              because presenting a vendor console as our own is a trademark and credibility problem.
              These are the hardest things in the system to keep coherent, so all five are rendered
              in all three palettes. Every one carries a required{' '}
              <code className="sg-mono">caption</code> declaring the data as illustrative.
            </p>
          </div>

          <div className="sg-stack-md">
            <h3 className="sg-h3">SeverityBadge</h3>
            <p className="sg-note">
              The shared severity primitive the other four read from, so a &quot;High&quot; in the
              alert queue and a &quot;High&quot; in the gauge are the same object. Distinct from{' '}
              <code className="sg-mono">&lt;Badge variant=&quot;severity&quot;&gt;</code>, which is
              the marketing-side mark; both always render the severity word as text.
            </p>
            <div className="sg-trio">
              {THEMES.map((theme) => (
                <Pane key={theme.key} theme={theme.key} label={`.${theme.label}`}>
                  <div className="sg-set">
                    {SEVERITY_ORDER.map((s) => (
                      <SeverityBadge key={s} severity={s} srPrefix="Severity" />
                    ))}
                  </div>
                  <div className="sg-set" style={{ marginTop: 'var(--s4)' }}>
                    <SeverityBadge severity="low" label="Healthy" srPrefix="Endpoint status" />
                    <SeverityBadge severity="medium" label="Degraded" srPrefix="Day state" />
                  </div>
                </Pane>
              ))}
            </div>
          </div>

          <div className="sg-stack-md">
            <h3 className="sg-h3">SocAlertQueue, steps 0 → 3</h3>
            <p className="sg-note">
              Four beats of the same scene. Step 3 is the complete state and the default;{' '}
              <code className="sg-mono">autoplay</code> is off unless asked for, so nothing animates
              on load.
            </p>
            <div className="sg-duo">
              {([0, 1, 2, 3] as const).map((step) => (
                <Pane key={step} theme="dark" label={`step={${step}}`}>
                  <SocAlertQueue caption={CAPTIONS.soc} step={step} />
                </Pane>
              ))}
            </div>
          </div>

          <div className="sg-stack-md">
            <h3 className="sg-h3">SceneRunner, via SocAlertQueue autoplay</h3>
            <p className="sg-note">
              <code className="sg-mono">SceneRunner</code> is the only client component anywhere in
              the product subtree, and it is reachable only through{' '}
              <code className="sg-mono">&lt;SocAlertQueue autoplay /&gt;</code>, which is off by
              default. It advances the four beats on a timer. With JavaScript off it never runs and
              the figure renders at its complete state; under reduced motion it does not start. This
              is the one instance on the page that moves without being asked to.
            </p>
            <div className="sg-duo">
              <Pane theme="dark" label="autoplay, step advances on a timer">
                <SocAlertQueue caption={CAPTIONS.soc} autoplay />
              </Pane>
              <Pane theme="light" label="autoplay, light palette">
                <SocAlertQueue caption={CAPTIONS.soc} autoplay />
              </Pane>
            </div>
          </div>

          {[
            { key: 'soc', title: 'SocAlertQueue', node: <SocAlertQueue caption={CAPTIONS.soc} />, issue: null },
            { key: 'edr', title: 'EdrFleetView', node: <EdrFleetView caption={CAPTIONS.edr} />, issue: null },
            {
              key: 'waf',
              title: 'WafTrafficPanel',
              node: <WafTrafficPanel caption={CAPTIONS.waf} />,
              issue:
                'KNOWN DEFECT, surfaced by this page: the chart hardcodes id="waf-chart-title" and id="waf-chart-desc" on its <title> and <desc>, so the three instances below emit duplicate IDs and the aria-labelledby on instances two and three resolves to the first chart. Harmless on a real page, which renders one, and exactly the kind of thing a styleguide exists to find. The fix belongs in the component: derive both IDs from useId, or take an id prop.',
            },
            { key: 'gauge', title: 'SeverityGauge', node: <SeverityGauge caption={CAPTIONS.gauge} />, issue: null },
            { key: 'sla', title: 'SlaPanel', node: <SlaPanel caption={CAPTIONS.sla} />, issue: null },
          ].map((item) => (
            <div className="sg-stack-md" key={item.key}>
              <h3 className="sg-h3">{item.title}</h3>
              {item.issue ? (
                <div className="sg-callout">
                  <p>{item.issue}</p>
                </div>
              ) : null}
              <div className="sg-trio">
                {THEMES.map((theme) => (
                  <Pane key={theme.key} theme={theme.key} label={`.${theme.label}`}>
                    {item.node}
                  </Pane>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 8. REDUCED MOTION & NO-JS ──────────────────────────────────── */}
      <Section theme="deep" id="reduced-motion" tight aria-labelledby="sg-rm">
        <div className="sg-stack-md">
          <h2 id="sg-rm" className="sg-h2">
            8 · Reduced motion &amp; no-JavaScript
          </h2>
          <p className="sg-note">
            What changes under <code className="sg-mono">prefers-reduced-motion: reduce</code>, as
            declared in <code className="sg-mono">app/globals.css</code>:
          </p>
          <Prose wide>
            <ul>
              <li>
                Every animation and transition is clamped to 0.01ms and every iteration count to 1,
                so each target above snaps to its finished frame instead of travelling. The Replay
                buttons still work; there is simply nothing to watch.
              </li>
              <li>
                The grain texture stops moving. It does not disappear. The texture is part of the
                surface, only its drift is motion.
              </li>
              <li>
                The marquee stops, loses its edge mask and becomes a horizontally scrollable list,
                so every client label stays reachable.
              </li>
              <li>
                Every <code>[data-reveal]</code> is forced to opacity 1 and translate 0 with{' '}
                <code>!important</code>, so no content can be left waiting for an entrance that will
                never play.
              </li>
              <li>
                <code>scroll-behavior</code> drops to <code>auto</code>, so the contents links above
                jump rather than glide.
              </li>
              <li>
                The hero&apos;s WebGL layer and the Secure SDLC pipeline never opt in to animating at
                all, their markup renders already finished, so reduced motion is the default state
                and the animation is the opt-in.
              </li>
            </ul>
            <p>
              The same page with scripting disabled loses only the Replay buttons, the tab strip and
              the accordion triggers. Nothing that carries information is hidden behind any of them:
              the accordion ships a static definition list, the tabs force-mount every panel, and
              every number on the site, including all four on the homepage proof bar, is text in
              the server HTML rather than a count-up that renders as zero.
            </p>
          </Prose>
        </div>
      </Section>
    </>
  )
}
