/**
 * STYLEGUIDE TOKEN TABLE - the values from app/globals.css, transcribed once,
 * plus the WCAG contrast maths used to grade them.
 *
 * WHY A TRANSCRIPTION AND NOT A RUNTIME READ
 * ------------------------------------------
 * `getComputedStyle` would read the live values, but only in the browser, which
 * would make the entire colour section a client component that renders empty in
 * the server HTML - exactly the failure mode this project forbids for numbers.
 * Every ratio on the styleguide is therefore computed on the server from the
 * literal token values and ships as text.
 *
 * THE COST OF THAT CHOICE, STATED PLAINLY: this file can drift from
 * globals.css. It is the one place in the codebase allowed to repeat a hex
 * literal, and it must be updated whenever a palette token changes. The
 * swatches render `var(--token)` as their background, NOT the hex below, so a
 * drift shows up as a swatch that disagrees with its own printed hex - which is
 * the regression this page exists to catch.
 */

/* ========================================================================== *
 * WCAG CONTRAST
 * ========================================================================== */

export type Rgb = { r: number; g: number; b: number }

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const channel = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG 2.1 contrast ratio, 1–21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** "6.42" - two decimals, truncated rather than rounded up, so a 4.498 never
 *  prints as "4.50" next to a PASS. */
export function formatRatio(n: number): string {
  return (Math.floor(n * 100) / 100).toFixed(2)
}

/* ========================================================================== *
 * RAW PALETTE - the values every theme token aliases
 * ========================================================================== */

export type RawToken = { name: string; value: string; group: string }

export const RAW_TOKENS: RawToken[] = [
  { name: '--ink-900', value: '#0a0d13', group: 'Neutrals, ink' },
  { name: '--ink-800', value: '#131823', group: 'Neutrals, ink' },
  { name: '--ink-700', value: '#1e2533', group: 'Neutrals, ink' },
  { name: '--ink-600', value: '#2b3446', group: 'Neutrals, ink' },
  { name: '--ink-500', value: '#4a5468', group: 'Neutrals, ink' },
  { name: '--paper-50', value: '#f7f5f1', group: 'Neutrals, paper' },
  { name: '--paper-100', value: '#ede9e1', group: 'Neutrals, paper' },
  { name: '--paper-200', value: '#ddd7cb', group: 'Neutrals, paper' },
  { name: '--paper-300', value: '#c9c2b3', group: 'Neutrals, paper' },
  { name: '--paper-600', value: '#5a6172', group: 'Neutrals, paper' },
  { name: '--accent-300', value: '#9aa5ff', group: 'Brand accent' },
  { name: '--accent-500', value: '#5b6cff', group: 'Brand accent' },
  { name: '--accent-600', value: '#4452d8', group: 'Brand accent' },
  { name: '--signal-critical', value: '#e5484d', group: 'Signal, product UI and severity only' },
  { name: '--signal-high', value: '#f76808', group: 'Signal, product UI and severity only' },
  { name: '--signal-medium', value: '#f5a524', group: 'Signal, product UI and severity only' },
  { name: '--signal-low', value: '#3e9b4f', group: 'Signal, product UI and severity only' },
  { name: '--signal-info', value: '#0091ff', group: 'Signal, product UI and severity only' },
]

/* ========================================================================== *
 * THEME TOKENS
 * ========================================================================== */

/**
 * What the token is FOR. A ratio below 4.5:1 is a defect on a `text` token and
 * entirely correct on a `hairline` one - grading every token against the same
 * threshold without saying which is which produces a wall of red that teaches a
 * reviewer to ignore the page.
 */
export type TokenRole = 'text' | 'large-text' | 'surface' | 'hairline' | 'inverse'

export const ROLE_LABEL: Record<TokenRole, string> = {
  text: 'Body text, needs 4.5:1',
  'large-text': 'Large text / UI accent, needs 3:1',
  surface: 'Surface fill, no text threshold',
  hairline: 'Hairline / non-text, needs 3:1 only where it carries meaning',
  inverse: 'Text ON the accent, measured against --accent, not --bg',
}

export type ThemeToken = {
  name: string
  value: string
  /** The raw token it aliases in globals.css. */
  alias: string
  role: TokenRole
  note?: string
  /** Measure against this instead of the theme background. */
  against?: 'accent'
}

export type ThemeSpec = {
  key: 'light' | 'dark' | 'deep'
  className: string
  label: string
  /** Why this palette exists. */
  note: string
  bg: string
  accent: string
  tokens: ThemeToken[]
}

/**
 * LIGHT FIRST, deliberately. The light theme is where these systems fail:
 * a muted grey chosen on a dark field and reused on a warm bone background is
 * the single most common contrast defect, so it is graded before anything else.
 */
export const THEMES: ThemeSpec[] = [
  {
    key: 'light',
    className: 'theme-light',
    label: 'theme-light',
    note: 'The software-craft act. Warm bone #F7F5F1, deliberately not clinical white.',
    bg: '#f7f5f1',
    accent: '#5b6cff',
    tokens: [
      { name: '--bg', value: '#f7f5f1', alias: 'var(--paper-50)', role: 'surface', note: 'The field everything else is measured against.' },
      { name: '--surface', value: '#ede9e1', alias: 'var(--paper-100)', role: 'surface', note: 'Cards, chips, inset panels.' },
      { name: '--fg', value: '#0a0d13', alias: 'var(--ink-900)', role: 'text' },
      { name: '--muted', value: '#5a6172', alias: 'var(--paper-600)', role: 'text', note: 'Secondary body copy. Carries real content, so it is held to 4.5:1.' },
      { name: '--muted-strong', value: '#131823', alias: 'var(--ink-800)', role: 'text' },
      { name: '--border', value: '#ddd7cb', alias: 'var(--paper-200)', role: 'hairline', note: 'Decorative hairline. Never the only channel for meaning.' },
      { name: '--border-strong', value: '#c9c2b3', alias: 'var(--paper-300)', role: 'hairline' },
      { name: '--accent', value: '#5b6cff', alias: 'var(--accent-500)', role: 'large-text', note: 'Primary button fill and focus ring.' },
      { name: '--accent-fg', value: '#f7f5f1', alias: 'var(--paper-50)', role: 'inverse', against: 'accent' },
    ],
  },
  {
    key: 'dark',
    className: 'theme-dark',
    label: 'theme-dark',
    note: 'The security act. The page opens here and the hero never leaves it.',
    bg: '#0a0d13',
    accent: '#9aa5ff',
    tokens: [
      { name: '--bg', value: '#0a0d13', alias: 'var(--ink-900)', role: 'surface' },
      { name: '--surface', value: '#131823', alias: 'var(--ink-800)', role: 'surface' },
      { name: '--fg', value: '#f7f5f1', alias: 'var(--paper-50)', role: 'text' },
      { name: '--muted', value: '#8a93a6', alias: 'literal, raised from --ink-500', role: 'text', note: '--ink-500 (#4A5468) measures 3.0:1 here and FAILS AA. The dark theme therefore defines --muted as a literal rather than aliasing the neutral ramp. This is the system’s one knowingly off-ramp value and it exists to pass contrast.' },
      { name: '--muted-strong', value: '#ddd7cb', alias: 'var(--paper-200)', role: 'text' },
      { name: '--border', value: '#1e2533', alias: 'var(--ink-700)', role: 'hairline' },
      { name: '--border-strong', value: '#2b3446', alias: 'var(--ink-600)', role: 'hairline' },
      { name: '--accent', value: '#9aa5ff', alias: 'var(--accent-300)', role: 'large-text' },
      { name: '--accent-fg', value: '#0a0d13', alias: 'var(--ink-900)', role: 'inverse', against: 'accent' },
    ],
  },
  {
    key: 'deep',
    className: 'theme-deep',
    label: 'theme-deep',
    note: 'The seam and the closing band. One stop lighter than dark, so an inset plate reads as inset.',
    bg: '#131823',
    accent: '#9aa5ff',
    tokens: [
      { name: '--bg', value: '#131823', alias: 'var(--ink-800)', role: 'surface' },
      { name: '--surface', value: '#1e2533', alias: 'var(--ink-700)', role: 'surface' },
      { name: '--fg', value: '#f7f5f1', alias: 'var(--paper-50)', role: 'text' },
      { name: '--muted', value: '#8a93a6', alias: 'literal', role: 'text', note: 'Same literal as theme-dark, measured against the lighter --ink-800 field.' },
      { name: '--muted-strong', value: '#ddd7cb', alias: 'var(--paper-200)', role: 'text' },
      { name: '--border', value: '#2b3446', alias: 'var(--ink-600)', role: 'hairline', note: 'Stepped up from --ink-700. At --ink-700 it was identical to --surface, so a 14-row console on an elevated field rendered as one unbroken slab.' },
      { name: '--border-strong', value: '#3b465c', alias: 'literal: one stop above --ink-600', role: 'hairline', note: 'A literal because the ink ramp jumps from #2B3446 to #4A5468, and #4A5468 reads as a drawn line rather than a hairline on this field.' },
      { name: '--accent', value: '#9aa5ff', alias: 'var(--accent-300)', role: 'large-text' },
      { name: '--accent-fg', value: '#0a0d13', alias: 'var(--ink-900)', role: 'inverse', against: 'accent' },
    ],
  },
]

/* ========================================================================== *
 * TYPE, SPACE, RADIUS
 * ========================================================================== */

export const TYPE_SCALE = [
  { name: '--text-xs', rem: '0.75rem', px: 12 },
  { name: '--text-sm', rem: '0.875rem', px: 14 },
  { name: '--text-base', rem: '1rem', px: 16 },
  { name: '--text-lg', rem: '1.125rem', px: 18 },
  { name: '--text-xl', rem: '1.375rem', px: 22 },
  { name: '--text-2xl', rem: '1.75rem', px: 28 },
  { name: '--text-3xl', rem: '2.25rem', px: 36 },
  { name: '--text-4xl', rem: '3rem', px: 48 },
  { name: '--text-5xl', rem: '4rem', px: 64 },
  { name: '--text-6xl', rem: '5.5rem', px: 88 },
] as const

export const FONT_FAMILIES = [
  {
    key: 'inter-tight',
    label: 'Inter Tight',
    use: 'Every heading. 500/600/700.',
    css: 'var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif',
  },
  {
    key: 'inter',
    label: 'Inter',
    use: 'Body copy. 400/500.',
    css: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
  },
  {
    key: 'instrument-serif',
    label: 'Instrument Serif',
    use: 'ChapterOpener only: three instances sitewide.',
    css: 'var(--font-instrument-serif), ui-serif, Georgia, serif',
  },
  {
    key: 'jetbrains-mono',
    label: 'JetBrains Mono',
    use: 'IDs, timestamps, CVEs, certificate numbers. Nothing else.',
    css: 'var(--font-jetbrains-mono), ui-monospace, "SF Mono", Menlo, monospace',
  },
] as const

export const SPACING_SCALE = [
  { name: '--s1', px: 4 },
  { name: '--s2', px: 8 },
  { name: '--s3', px: 12 },
  { name: '--s4', px: 16 },
  { name: '--s6', px: 24 },
  { name: '--s8', px: 32 },
  { name: '--s12', px: 48 },
  { name: '--s16', px: 64 },
  { name: '--s20', px: 80 },
  { name: '--s24', px: 96 },
  { name: '--s32', px: 128 },
] as const

export const RADIUS_SCALE = [
  { name: '--radius-sm', px: 4, use: 'Badges, chips, inline marks.' },
  { name: '--radius-md', px: 8, use: 'Buttons, inputs, marquee items.' },
  { name: '--radius-lg', px: 16, use: 'Cards, figures, quote plates.' },
  { name: '--radius-xl', px: 24, use: 'Full-width plates, the seam block.' },
] as const

/* ========================================================================== *
 * MOTION
 * ========================================================================== */

export const EASINGS = [
  { name: '--ease-out', curve: 'cubic-bezier(0, 0, 0.2, 1)', use: 'THE DEFAULT, about 60% of all motion.' },
  { name: '--ease-in-out', curve: 'cubic-bezier(0.4, 0, 0.2, 1)', use: 'Positional moves and indicators.' },
  { name: '--ease-theme', curve: 'cubic-bezier(0, 0, 0.6, 1)', use: 'Palette changes only.' },
  { name: '--ease-carousel', curve: 'cubic-bezier(0.76, 0, 0.24, 1)', use: 'Large slide transitions only.' },
] as const

export const DURATIONS = [
  { name: '--dur-micro', value: '0.15s', use: 'Hover, focus, toggles.' },
  { name: '--dur-base', value: '0.3s', use: 'THE HOUSE TEMPO.' },
  { name: '--dur-scene', value: '0.5s', use: 'Theme changes and media cross-fades.' },
  {
    name: '--dur-carousel',
    value: '0.6s',
    use: 'Large slide transitions only, the measured partner of --ease-carousel, and the system ceiling. Nothing anywhere runs longer except the hero, which is scroll-bound rather than timed.',
  },
] as const

export const DISTANCES = [
  { name: '--d-tooltip', px: 2, use: 'slideUpAndFade / slideDownAndFade.' },
  { name: '--d-panel', px: 5, use: 'Tab and panel state machine.' },
  { name: '--d-content', px: 10, use: 'slideUpMoreAndFade, every scroll reveal.' },
  { name: '--d-entrance', px: 32, use: 'assetEnter / assetExit. The ceiling. Nothing moves further.' },
] as const
