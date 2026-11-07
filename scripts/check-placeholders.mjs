#!/usr/bin/env node
/**
 * CI GUARD - fails a production build while unverified placeholder content remains.
 *
 * This script matters more than any individual placeholder asset. Without it the
 * placeholder ships, and that is the entire reason an initials avatar beats a
 * realistic generated face: a realistic face in a `headshot` field looks
 * finished, so it survives review.
 *
 * It reads the source as TEXT rather than importing it, so the guard has no
 * dependency on the bundler, on TypeScript, or on `lucide-react` resolving.
 *
 *   node scripts/check-placeholders.mjs            # report only, exit 0
 *   NODE_ENV=production node scripts/check-placeholders.mjs   # exit 1 on any hit
 *   node scripts/check-placeholders.mjs --strict   # exit 1 regardless of NODE_ENV
 *
 * Wire it into the production build:  "build": "node scripts/check-placeholders.mjs && next build"
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const strict = process.argv.includes('--strict') || process.env.NODE_ENV === 'production'

/** Each check names the file, the flag, and how to clear it. */
const CHECKS = [
  {
    file: 'lib/people.ts',
    pattern: /isPlaceholder:\s*true/g,
    nameFrom: /name:\s*'([^']+)'/g,
    what: 'placeholder portrait',
    clear: 'Upload a real photograph, set `headshot` to its path, set `isPlaceholder: false`.',
    blocking: true,
  },
  {
    file: 'lib/site.ts',
    pattern: /placeholder:\s*true/g,
    nameFrom: /label:\s*'([^']+)'/g,
    what: 'unverified headline stat',
    clear: 'Confirm the figure against its stated source, then remove `placeholder: true`.',
    blocking: true,
  },
  {
    file: 'lib/case-studies.ts',
    pattern: /needsSignOff:\s*true/g,
    nameFrom: /slug:\s*'([^']+)'/g,
    what: 'case study without written client sign-off',
    clear: 'Obtain written approval for the metrics AND the attributed quote, then remove `needsSignOff: true`.',
    blocking: true,
  },
  {
    file: 'lib/proof.ts',
    pattern: /placeholder:\s*true/g,
    nameFrom: /(?:name|label):\s*'([^']+)'/g,
    what: 'certification / partner / client / badge without verified detail',
    clear: 'Add the real certificate number and expiry, or confirm logo permission, then remove `placeholder: true`.',
    blocking: true,
  },
]

/** Hardcoded strings that must never reach production. */
const FORBIDDEN = [
  { re: /lorem ipsum/i, why: 'lorem ipsum in shipped content' },
  { re: /\bTODO:\s*icon\b/i, why: 'unresolved TODO: icon — a placeholder icon import' },
  { re: /99\.9%/, why: '"99.9%" — a round uptime figure reads as a marketing mock, not a measurement' },
  { re: /\bThreat [A-Z]\b/, why: '"Threat A" style generic naming in product-UI fixtures' },
  { re: /AdobeStock_\d+/, why: 'a stock photography filename — the single clearest competitor tell' },
  { re: /IMG_\d{4}\.(jpg|png)/i, why: 'an uncurated camera filename' },
]

const SCAN_GLOBS = ['app', 'components', 'lib', 'content']

let findings = 0
let forbidden = 0
const lines = []

for (const check of CHECKS) {
  const path = resolve(ROOT, check.file)
  if (!existsSync(path)) {
    lines.push(`  ?  ${check.file} — not found, check skipped (this is itself worth knowing)`)
    continue
  }
  const src = readFileSync(path, 'utf8')
  const hits = [...src.matchAll(check.pattern)].length
  if (!hits) {
    lines.push(`  ok ${check.file} — no ${check.what}s`)
    continue
  }
  findings += hits
  // Name the records so the message is actionable rather than a count.
  const names = [...src.matchAll(check.nameFrom)].map((m) => m[1])
  const sample = names.slice(0, 6).join(', ')
  lines.push(
    `  !! ${check.file} — ${hits} ${check.what}${hits === 1 ? '' : 's'}` +
      (sample ? `\n       records: ${sample}${names.length > 6 ? `, +${names.length - 6} more` : ''}` : '') +
      `\n       clear it: ${check.clear}`,
  )
}

/* ---- forbidden strings across the whole source tree ---- */
async function walk(dir) {
  const { readdir } = await import('node:fs/promises')
  const out = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    const p = resolve(dir, e.name)
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.next' || e.name.startsWith('.')) continue
      out.push(...(await walk(p)))
    } else if (/\.(tsx?|mjs|css|md)$/.test(e.name)) {
      out.push(p)
    }
  }
  return out
}

const files = (await Promise.all(SCAN_GLOBS.map((g) => walk(resolve(ROOT, g))))).flat()
for (const f of files) {
  // This guard file itself contains the patterns it looks for, by necessity.
  if (f.includes('check-placeholders')) continue
  let src = readFileSync(f, 'utf8')
  // Strip comments from code before the forbidden-string scan. These patterns
  // are the kind of thing a careful developer NAMES in a comment in order to
  // warn the next one off - "does not pad with lorem ipsum", "never 99.9%".
  // Flagging the warning as the violation it warns about teaches people to
  // delete the explanation, which is precisely backwards. Markdown is left
  // intact: there, prose is the content.
  if (/\.(tsx?|mjs|css)$/.test(f)) {
    src = src
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1')
  }
  for (const rule of FORBIDDEN) {
    if (rule.re.test(src)) {
      forbidden++
      lines.push(`  !! ${relative(ROOT, f)} — ${rule.why}`)
    }
  }
}

/* ---- report ---- */
const total = findings + forbidden
console.log('\nContent placeholder guard')
console.log('─'.repeat(72))
console.log(lines.join('\n'))
console.log('─'.repeat(72))

if (total === 0) {
  console.log('PASS — no placeholder or forbidden content found.\n')
  process.exit(0)
}

console.log(
  `${strict ? 'FAIL' : 'WARN'} — ${findings} placeholder record${findings === 1 ? '' : 's'}` +
    ` and ${forbidden} forbidden string${forbidden === 1 ? '' : 's'}.`,
)

if (strict) {
  console.log(
    '\nThis build is a production build, so this is a hard failure. Every item above\n' +
      'is content the client must supply or approve — see content/PLACEHOLDER-REGISTER.md.\n',
  )
  process.exit(1)
}

console.log(
  '\nNot a production build, so this is a warning. Run with NODE_ENV=production or\n' +
    '--strict to see it as the release gate it will be.\n',
)
process.exit(0)
