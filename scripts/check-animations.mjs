#!/usr/bin/env node
/**
 * CI GUARD - a CSS Module may not reference a keyframe it does not own.
 *
 * THE BUG THIS EXISTS TO PREVENT, which shipped and was live:
 *
 * CSS Modules scope `@keyframes` names locally, and they ALSO rewrite the
 * animation-name references that point at them. So this, inside a .module.css:
 *
 *     .stage[data-lit='true'] { animation: slideUpMoreAndFade 300ms both; }
 *
 * compiles to:
 *
 *     .diagram_stage__XG1eN[data-lit=true] {
 *       animation: diagram_slideUpMoreAndFade__mGg8K 300ms both;
 *     }
 *
 * and `@keyframes diagram_slideUpMoreAndFade__mGg8K` does not exist, because
 * the keyframes were defined in app/globals.css. The animation silently does
 * not run. There is no console error, no build warning and no visual clue in
 * the source.
 *
 * That is survivable for a decorative fade. It was NOT survivable here, because
 * these rules pair with a hidden start state:
 *
 *     .figure[data-animate='true'] .stage { opacity: 0; }
 *
 * The start state is plain CSS and applies. The animation that was supposed to
 * undo it never runs. Result: the element is permanently invisible.
 *
 * Found on /services/devsecops, where the entire Secure SDLC pipeline diagram
 * rendered at opacity 0 - correct geometry, correct data-lit attributes,
 * nothing on screen. 29 references across three modules were affected, which
 * also blanked the product consoles and the delivery charts.
 *
 * THE RULE: inside a *.module.css, every animation-name must be defined by
 * @keyframes in THAT SAME FILE.
 *
 * `:global(name)` would be the tidier fix and it is NOT available here: this
 * toolchain fails the build with "Double colon" when a colon-prefixed function
 * appears in a declaration value. Tried and reverted on 2026-11-07. So the
 * shared keyframes are copied into each module that needs them, with a comment
 * pointing back at globals.css.
 *
 *   node scripts/check-animations.mjs
 *   node scripts/check-animations.mjs --verbose
 *
 * Exits 1 on any violation.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const verbose = process.argv.includes('--verbose')

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
    } else if (e.name.endsWith('.module.css')) {
      out.push(p)
    }
  }
  return out
}

/** Longhand and shorthand both carry the name; the shorthand mixes it with
 *  durations, easings and fill modes, so everything that is NOT a bare custom
 *  identifier has to be filtered out. */
const ANIMATION_DECL = /animation(?:-name)?\s*:\s*([^;}]+)/g

const CSS_WIDE = new Set(['initial', 'inherit', 'unset', 'revert', 'revert-layer'])
const ANIMATION_KEYWORDS = new Set([
  'none', 'normal', 'reverse', 'alternate', 'alternate-reverse',
  'forwards', 'backwards', 'both', 'infinite', 'running', 'paused',
  'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out',
  'step-start', 'step-end', 'auto',
])

const files = walk(resolve(ROOT, 'app')).concat(walk(resolve(ROOT, 'components')))
const violations = []
let declarationsChecked = 0

for (const abs of files) {
  const file = relative(ROOT, abs).replace(/\\/g, '/')
  const src = readFileSync(abs, 'utf8')
  const lines = src.split('\n')

  const localKeyframes = new Set(
    [...src.matchAll(/@keyframes\s+([A-Za-z_][A-Za-z0-9_-]*)/g)].map((m) => m[1]),
  )

  for (const m of src.matchAll(ANIMATION_DECL)) {
    declarationsChecked += 1
    // Strip the parts that can never be a name: :global(...) is already an
    // explicit, correct reference, and var()/calc()/cubic-bezier()/steps()
    // carry commas and identifiers that would otherwise look like names.
    const value = m[1]
      .replace(/:global\([^)]*\)/g, ' ')
      .replace(/(?:var|calc|cubic-bezier|steps|linear)\s*\([^)]*\)/g, ' ')

    for (const tok of value.split(/[,\s]+/)) {
      const name = tok.trim()
      if (!name) continue
      if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(name)) continue // 300ms, .3s, 0, %
      if (ANIMATION_KEYWORDS.has(name) || CSS_WIDE.has(name)) continue
      if (localKeyframes.has(name)) continue

      const line = src.slice(0, m.index).split('\n').length
      violations.push({
        file,
        line,
        name,
        text: (lines[line - 1] ?? '').trim().slice(0, 110),
      })
    }
  }
}

const label = 'CSS Module keyframe-reference guard'
console.log(`\n${label}`)
console.log('─'.repeat(72))
console.log(`scanned: ${files.length} *.module.css files, ${declarationsChecked} animation declarations`)

if (violations.length > 0) {
  console.log('')
  const byFile = new Map()
  for (const v of violations) {
    if (!byFile.has(v.file)) byFile.set(v.file, [])
    byFile.get(v.file).push(v)
  }
  for (const [file, list] of byFile) {
    console.log(`!! ${file} — ${list.length}`)
    for (const v of list) {
      console.log(`   ${v.line}: references "${v.name}", which this module does not define`)
      console.log(`      ${v.text}`)
    }
  }
  console.log('')
  console.log('─'.repeat(72))
  console.log(`FAIL — ${violations.length} animation reference(s) point at a keyframe the module does not own.`)
  console.log('')
  console.log('CSS Modules rewrite the name to a local hash, so the animation silently')
  console.log('never runs. Where the rule also sets a hidden start state (opacity: 0,')
  console.log('stroke-dashoffset) the element is then permanently invisible.')
  console.log('')
  console.log('Fix: copy the @keyframes block into this module.')
  console.log('')
  console.log('NOT `animation: :global(name)` — this toolchain rejects a double colon')
  console.log('inside a declaration value and the build fails. Verified 2026-11-07.')
  console.log('The copies in the modules carry a comment pointing back at globals.css.')
  process.exit(1)
}

if (verbose) {
  for (const f of files) console.log(`  ok ${relative(ROOT, f).replace(/\\/g, '/')}`)
}
console.log('─'.repeat(72))
console.log('PASS — every module animation resolves to a keyframe that exists.')
