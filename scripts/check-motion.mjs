#!/usr/bin/env node
/**
 * CI GUARD - the motion and colour contract, enforced structurally.
 *
 * PART 3.1 of the brief says "use nothing else", and the four rules that produce
 * most of the perceived quality are all negative: default to one easing, default
 * to one duration, never animate past 32px, never scale a button on hover. A
 * rule stated in a document is followed until someone is in a hurry. This script
 * is the version that holds.
 *
 *   node scripts/check-motion.mjs
 *   node scripts/check-motion.mjs --verbose   # list every passing file too
 *
 * Exits 1 on any violation.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const verbose = process.argv.includes('--verbose')

/* ------------------------------------------------------------------ *
 * Files to scan
 * ------------------------------------------------------------------ */
function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    const p = resolve(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next' || e.name.startsWith('.')) continue
      walk(p, out)
    } else if (/\.(tsx?|css)$/.test(e.name)) {
      out.push(p)
    }
  }
  return out
}

const files = ['app', 'components', 'lib'].flatMap((d) => walk(resolve(ROOT, d)))

/* ------------------------------------------------------------------ *
 * The allow-list. Each entry states WHY, because an unexplained
 * exemption becomes a precedent.
 * ------------------------------------------------------------------ */
const ALLOW = {
  // globals.css IS the token definition - it is where the literals live.
  'app/globals.css': ['hex', 'bezier', 'duration', 'distance'],
  // The keyframe library legitimately declares the 32px entrance distance.
  // `--meta` colours cannot resolve a CSS variable: browser UI reads the raw value.
  'app/layout.tsx': ['hex'],
  // The error and 404 boundaries are styled with raw tokens on purpose, so that a
  // failure in the component layer cannot take the failure page down with it.
  'app/error.tsx': ['hex'],
  'app/not-found.tsx': ['hex'],
  // Rendered to a raster by next/og at build time; a social card cannot read
  // a CSS custom property, and Satori does not implement them.
  'app/opengraph-image.tsx': ['hex'],
  // The brand mark is the one place the palette is drawn rather than referenced.
  'app/icon.svg': ['hex'],
  // The hero scene reads EVERY colour it draws from a CSS custom property at
  // init (tokenColor(host, '--accent-300', ...)), which is the behaviour this
  // rule exists to enforce. The four literals are the FALLBACKS for those
  // lookups and they cannot themselves be variables: three.js `new Color()`
  // takes a parsed colour, not a `var()`, and getComputedStyle returns an empty
  // string when a token has been renamed. Without a literal there, a renamed
  // token silently paints the whole scene black.
  //
  // ('components/hero/matcap.ts' and 'components/hero/hero-scene.ts' held this
  // slot before. Both were deleted when the abstract icosahedron hero was
  // replaced; their entries were exempting files that no longer exist.)
  'components/hero/network-scene.ts': ['hex'],
  // The scrim is a specified literal rgba gradient (PART 4.1).
  // 'duration': two continuous AMBIENT loops - the field's 38s drift and the
  // scroll cue's 2.4s sweep. Neither is a UI transition between two states,
  // so the three transition tokens do not describe them; globals.css sets the
  // same precedent itself with `grain 8s` and `marquee 46s`.
  'components/hero/hero.module.css': ['hex', 'distance', 'duration'],
  // Fixture data carries severity colour mapping for the product consoles.
  'lib/product-fixtures.ts': ['hex'],
  // The apple.com-measured control background is a specified literal (PART 5.2).
  // `duration`: the indeterminate loading ring spins at a rate the brief does
  // not specify ("a subtle indeterminate indicator"). It is not a UI transition
  // between two states, so the three transition tokens do not describe it.
  'components/motion/clip.module.css': ['hex', 'duration'],
  // The styleguide's token table IS the palette, rendered as swatches with their
  // literal values and computed contrast ratios. Referencing a variable here
  // would defeat the entire purpose of the page.
  'app/styleguide/tokens.ts': ['hex'],
  // The styleguide computes each token's contrast ratio against BOTH theme
  // grounds and labels the pass/fail. Those two grounds must be literal values:
  // a contrast function takes colours, and a CSS custom property resolves to
  // whichever theme the element happens to sit in - which is the one thing
  // this page exists to compare across.
  'app/styleguide/page.tsx': ['hex'],
}

const allowed = (file, rule) => (ALLOW[file.replace(/\\/g, '/')] ?? []).includes(rule)

/* ------------------------------------------------------------------ *
 * Rules
 * ------------------------------------------------------------------ */
const violations = []

function flag(file, rule, line, text, why) {
  violations.push({ file, rule, line, text: text.trim().slice(0, 140), why })
}

/**
 * Which lines are inside a comment.
 *
 * A single-line heuristic is not enough: the codebase documents its reasoning in
 * multi-line `/* … *​/` blocks, and those blocks quote the very literals and
 * property names the rules forbid - `--border-strong is #c9c2b3 on bone`, for
 * example. Flagging prose that EXPLAINS a rule as a violation OF that rule
 * teaches people to stop writing the explanation, which is the opposite of what
 * the guard is for.
 *
 * Returns a boolean per line, tracking `/* … *​/` and `<!-- … -->` across lines.
 */
function commentMask(lines) {
  const mask = new Array(lines.length).fill(false)
  let inBlock = false
  let inHtml = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const t = line.trim()

    if (inBlock || inHtml) {
      mask[i] = true
      if (inBlock && line.includes('*/')) inBlock = false
      if (inHtml && line.includes('-->')) inHtml = false
      continue
    }

    if (t.startsWith('//') || t.startsWith('#')) {
      mask[i] = true
      continue
    }

    // A block that opens and closes on the same line only masks the line when
    // there is nothing but comment on it; otherwise real code may follow.
    const opensBlock = line.includes('/*') && !line.includes('*/')
    const opensHtml = line.includes('<!--') && !line.includes('-->')
    if (opensBlock || opensHtml) {
      mask[i] = t.startsWith('/*') || t.startsWith('<!--')
      inBlock = opensBlock
      inHtml = opensHtml
      continue
    }

    mask[i] = /^\s*(\/\*.*\*\/|<!--.*-->)\s*$/.test(line)
  }

  return mask
}

for (const abs of files) {
  const file = relative(ROOT, abs).replace(/\\/g, '/')
  if (file.startsWith('scripts/')) continue
  const src = readFileSync(abs, 'utf8')
  const lines = src.split('\n')
  const inComment = commentMask(lines)

  /* --- 1. No hover transform / scale / lift ------------------------ */
  // Find each :hover / :focus-within block and check its declarations.
  // Rotation is explicitly permitted (a chevron is not a lift), so transforms
  // that are purely rotate() pass.
  // The rule constrains the HOVERED element, not its descendants. A tooltip or a
  // dropdown revealed by a parent's :hover legitimately enters with a --d-tooltip
  // (2px) or --d-panel (5px) translate - that is in the vocabulary. So only flag
  // a selector whose :hover/:focus-within is its LAST component; a descendant or
  // child combinator after it means the transform lands on something else.
  const hoverBlock = /([^{};]*(?::hover|:focus-within)[^{};]*)\{([^}]*)\}/g
  for (const m of src.matchAll(hoverBlock)) {
    const selector = m[1]
    const targetsDescendant = selector
      .split(',')
      .some((s) => /(?::hover|:focus-within)[^,]*[\s>+~][^,\s>+~]/.test(s.trim()))
    if (targetsDescendant) continue
    const body = m[2]
    const bad = /(?:^|[\s;])(transform|translate|scale)\s*:/.exec(body)
    if (bad) {
      const decl = /transform\s*:\s*([^;]+)/.exec(body)?.[1] ?? ''
      const rotateOnly = /^\s*rotate[XYZ]?\([^)]*\)\s*$/.test(decl)
      if (!rotateOnly) {
        const line = src.slice(0, m.index).split('\n').length
        flag(file, 'hover-transform', line, m[0], 'hover is a colour shift — never a transform, scale or lift')
      }
    }
    if (/box-shadow\s*:/.test(body) && /\d+px\s+\d*\.?\d*px/.test(body)) {
      const line = src.slice(0, m.index).split('\n').length
      flag(file, 'hover-lift', line, m[0], 'a hover shadow reads as a lift; use border-color instead')
    }
  }

  /* --- 2. No transition on layout properties ----------------------- */
  // The Radix accordion height animation is measured and permitted, and lives
  // in globals.css as collapseDown/collapseUp - a keyframe, not a transition.
  for (const [i, line] of lines.entries()) {
    if (inComment[i]) continue
    const t = /transition[^:]*:\s*([^;]+)/.exec(line)
    if (t && /(^|[\s,(])(width|height|top|left|right|bottom|margin|padding)\b/.test(t[1])) {
      if (!allowed(file, 'layout-transition')) {
        flag(file, 'layout-transition', i + 1, line, 'only animate opacity, transform, filter, clip-path, mask-position')
      }
    }
  }

  /* --- 3. No invented easings -------------------------------------- */
  const KNOWN_BEZIERS = [
    'cubic-bezier(0, 0, .2, 1)',
    'cubic-bezier(0, 0, 0.2, 1)',
    'cubic-bezier(.4, 0, .2, 1)',
    'cubic-bezier(0.4, 0, 0.2, 1)',
    'cubic-bezier(0, 0, .6, 1)',
    'cubic-bezier(0, 0, 0.6, 1)',
    'cubic-bezier(.76, 0, .24, 1)',
    'cubic-bezier(0.76, 0, 0.24, 1)',
  ].map((s) => s.replace(/\s+/g, ''))

  for (const [i, line] of lines.entries()) {
    if (inComment[i] || allowed(file, 'bezier')) continue
    for (const m of line.matchAll(/cubic-bezier\([^)]*\)/g)) {
      if (!KNOWN_BEZIERS.includes(m[0].replace(/\s+/g, ''))) {
        flag(file, 'invented-easing', i + 1, line, 'use --ease-out / --ease-in-out / --ease-theme / --ease-carousel')
      }
    }
    // `ease`, `ease-in`, `ease-in-out`, `linear` as a transition timing function.
    // `linear` is legitimate for the marquee and for a progress ring.
    const tf = /(?:transition|animation)(?:-timing-function)?\s*:[^;]*?\b(ease-in-out|ease-in|ease-out|ease)\b/.exec(line)
    if (tf && !/var\(--ease-/.test(line)) {
      flag(file, 'invented-easing', i + 1, line, `keyword "${tf[1]}" is not in the vocabulary — use a token`)
    }
  }

  /* --- 4. No invented durations ------------------------------------ */
  // Permitted literals: the three tokens' own values, plus the two measured
  // exceptions the brief states (0.6s carousel slide, 0.4s clip cross-fade),
  // plus 8s for the grain and the reduced-motion 0.01ms collapse.
  const OK_DURATIONS = new Set(['0.15s', '.15s', '150ms', '0.3s', '.3s', '300ms', '0.5s', '.5s', '500ms', '0.6s', '.6s', '600ms', '0.4s', '.4s', '400ms', '8s', '0.01ms', '46s', '42s', '0s'])
  for (const [i, line] of lines.entries()) {
    if (inComment[i] || allowed(file, 'duration')) continue
    if (!/(transition|animation)/.test(line)) continue
    // `animation-delay` is a stagger offset, not a duration. The vocabulary
    // constrains how long motion LASTS; the 60ms stagger (capped at 5 items,
    // so 0/60/120/180/240ms) is a separate, specified rule.
    if (/animation-delay\s*:/.test(line) || /transition-delay\s*:/.test(line)) continue
    if (/var\(--dur-/.test(line) || /var\(--marquee-dur/.test(line)) continue
    for (const m of line.matchAll(/(?<![\w-])(\d*\.?\d+)(ms|s)(?![\w-])/g)) {
      const val = `${m[1]}${m[2]}`
      if (!OK_DURATIONS.has(val)) {
        flag(file, 'invented-duration', i + 1, line, `${val} is not a token — use --dur-micro / --dur-base / --dur-scene`)
      }
    }
  }

  /* --- 5. No animated distance over 32px --------------------------- */
  // Inside @keyframes and in translate/transform declarations.
  for (const [i, line] of lines.entries()) {
    if (inComment[i] || allowed(file, 'distance')) continue
    if (!/(translate|transform)\s*:|translateY?\(|translateX\(/.test(line)) continue
    for (const m of line.matchAll(/(-?\d*\.?\d+)px/g)) {
      const px = Math.abs(parseFloat(m[1]))
      if (px > 32) {
        flag(file, 'distance-over-32', i + 1, line, `${px}px exceeds the 32px ceiling (--d-entrance is the largest)`)
      }
    }
  }

  /* --- 6. No hardcoded colour literals in UI ----------------------- */
  if (!allowed(file, 'hex')) {
    for (const [i, line] of lines.entries()) {
      if (inComment[i]) continue
      // Skip lines that are plainly data rather than styling.
      if (/^\s*(\/\/|\*)/.test(line)) continue
      for (const m of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        // A mask gradient legitimately uses #000 as a luminance stop, not a colour.
        if (/mask/.test(line) && /^#0{3,6}$/.test(m[0])) continue
        flag(file, 'hardcoded-colour', i + 1, line, `${m[0]} — consume a theme variable instead`)
      }
    }
  }

  /* --- 7. Tailwind palette utilities ------------------------------- */
  for (const [i, line] of lines.entries()) {
    if (inComment[i]) continue
    const m = /\b(?:text|bg|border|ring|fill|stroke|from|to|via)-(?:slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|\d00)\b/.exec(line)
    if (m) {
      flag(file, 'tailwind-palette', i + 1, line, `${m[0]} — the palette is the theme variables, not Tailwind's`)
    }
  }

  /* --- 8. Namespace icon import (also covered by check-icons) ------ */
  if (/import\s+\*\s+as\s+\w+\s+from\s+['"]lucide-react['"]/.test(src)) {
    flag(file, 'icon-namespace-import', 1, 'import * as … from "lucide-react"', 'ships the entire icon set')
  }
}

/* ------------------------------------------------------------------ *
 * Report
 * ------------------------------------------------------------------ */
console.log('\nMotion & colour contract guard')
console.log('─'.repeat(72))
console.log(`scanned: ${files.length} files in app/, components/, lib/`)

if (verbose) {
  const dirty = new Set(violations.map((v) => v.file))
  for (const f of files.map((f) => relative(ROOT, f).replace(/\\/g, '/'))) {
    if (!dirty.has(f)) console.log(`  ok ${f}`)
  }
}

if (!violations.length) {
  console.log('─'.repeat(72))
  console.log('PASS — no hover transforms, no invented tokens, no distance over 32px,')
  console.log('       no hardcoded colours outside the documented exemptions.\n')
  process.exit(0)
}

const byRule = violations.reduce((acc, v) => {
  ;(acc[v.rule] ??= []).push(v)
  return acc
}, {})

for (const [rule, items] of Object.entries(byRule)) {
  console.log(`\n!! ${rule} — ${items.length}`)
  console.log(`   ${items[0].why}`)
  for (const v of items.slice(0, 12)) {
    console.log(`     ${v.file}:${v.line}`)
    console.log(`        ${v.text}`)
  }
  if (items.length > 12) console.log(`     … and ${items.length - 12} more`)
}

console.log('\n' + '─'.repeat(72))
console.log(`FAIL — ${violations.length} violation${violations.length === 1 ? '' : 's'} of the motion & colour contract.`)
console.log('An exemption belongs in the ALLOW map in this file, with a stated reason.\n')
process.exit(1)
