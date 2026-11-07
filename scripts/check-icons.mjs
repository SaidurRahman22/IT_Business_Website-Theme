#!/usr/bin/env node
/**
 * CI GUARD - every Lucide icon name used in the codebase must resolve.
 *
 * Lucide has renamed many icons and most model training data predates the
 * renames, so an agent or a developer writing `<ShieldAlert />` from memory
 * produces either a build error or, worse, a silently missing icon.
 *
 * This checks the real export surface of the installed `lucide-react` package
 * rather than a remembered list, so it is correct for whatever version is in
 * node_modules. No network call, no API key, works offline and in CI.
 *
 *   node scripts/check-icons.mjs
 *   node scripts/check-icons.mjs --suggest   # also print nearest-name suggestions
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const suggest = process.argv.includes('--suggest')

/* ------------------------------------------------------------------ *
 * 1. The real export surface of the installed lucide-react
 * ------------------------------------------------------------------ */
function installedIconNames() {
  const pkgDir = resolve(ROOT, 'node_modules', 'lucide-react')
  if (!existsSync(pkgDir)) {
    console.error('lucide-react is not installed — cannot verify icon names. Install deps first.')
    process.exit(2)
  }

  // The per-icon ESM directory is the most reliable source: one folder per icon,
  // named in kebab-case, which is exactly what the registry is keyed on.
  const iconDirs = [
    resolve(pkgDir, 'dist', 'esm', 'icons'),
    resolve(pkgDir, 'dist', 'cjs', 'icons'),
    resolve(pkgDir, 'icons'),
  ]
  for (const dir of iconDirs) {
    if (!existsSync(dir)) continue
    const names = readdirSync(dir)
      .filter((f) => /\.(m?js|d\.ts)$/.test(f))
      .map((f) => f.replace(/\.(m?js|d\.ts)$/, ''))
      .filter((n) => n && !n.startsWith('index'))
    if (names.length > 100) return new Set(names)
  }

  // Fallback: read the declaration bundle and harvest declared exports.
  const dts = ['dist/lucide-react.d.ts', 'dist/types/lucide-react.d.ts']
    .map((p) => resolve(pkgDir, p))
    .find(existsSync)
  if (dts) {
    const src = readFileSync(dts, 'utf8')
    const names = [...src.matchAll(/declare const ([A-Z][A-Za-z0-9]*)\s*:/g)].map((m) => toKebab(m[1]))
    if (names.length > 100) return new Set(names)
  }

  console.error('Could not locate lucide-react icon list in node_modules — layout changed?')
  process.exit(2)
}

const toKebab = (pascal) =>
  pascal
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // Lucide hyphenates before a trailing digit: Building2 → building-2,
    // FileCode2 → file-code-2. Without this the guard reports a false failure.
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase()

/* ------------------------------------------------------------------ *
 * 2. Every name imported from lucide-react anywhere in the source
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
    } else if (/\.tsx?$/.test(e.name)) {
      out.push(p)
    }
  }
  return out
}

const files = ['app', 'components', 'lib'].flatMap((d) => walk(resolve(ROOT, d)))

const used = new Map() // pascalName -> Set<file>
const starImports = []

for (const f of files) {
  const src = readFileSync(f, 'utf8')

  // `import * as Icons from 'lucide-react'` ships the entire set - a hard fail.
  if (/import\s+\*\s+as\s+\w+\s+from\s+['"]lucide-react['"]/.test(src)) {
    starImports.push(relative(ROOT, f))
  }

  // Named imports, possibly multi-line, possibly aliased.
  // `[^{}]*?` rather than `[\s\S]*?`: an import specifier list cannot contain
  // braces, and the lazy any-character form swallowed everything between an
  // EARLIER import and this one. A file opening with `import { Fragment } from
  // 'react'` and importing from lucide-react further down reported `Fragment`
  // as an unresolved icon - a false failure that blames the wrong file.
  for (const m of src.matchAll(/import\s*\{([^{}]*?)\}\s*from\s*['"]lucide-react['"]/g)) {
    for (const raw of m[1].split(',')) {
      const name = raw.trim().split(/\s+as\s+/)[0].trim()
      if (!name || name === 'type' || !/^[A-Z]/.test(name)) continue
      // Skip exported type names that are not icons.
      if (name === 'LucideIcon' || name === 'LucideProps' || name === 'IconNode') continue
      if (!used.has(name)) used.set(name, new Set())
      used.get(name).add(relative(ROOT, f))
    }
  }
}

/* ------------------------------------------------------------------ *
 * 3. Compare
 * ------------------------------------------------------------------ */
const registry = installedIconNames()

/** The renames that catch people out. Reported as a hint, not a rewrite. */
const KNOWN_RENAMES = {
  'shield-alert': 'shield-exclamation-point',
  'circle-alert': 'circle-exclamation-point',
  'alert-circle': 'circle-exclamation-point',
  'triangle-alert': 'triangle-exclamation-point',
  'alert-triangle': 'triangle-exclamation-point',
  'octagon-alert': 'octagon-exclamation-point',
  'help-circle': 'circle-question-mark',
  'building-2': 'building-complex',
  fingerprint: 'fingerprint-pattern',
  filter: 'funnel',
  unlock: 'lock-open',
  history: 'clock-arrow-up',
  'pie-chart': 'chart-pie',
  'bar-chart': 'chart-bar',
  'bar-chart-3': 'chart-bar',
  'line-chart': 'chart-line',
  sidebar: 'panel-left',
}

/** Lucide carries no brand marks - they were removed over trademark concerns. */
const BRAND_NAMES = new Set(['linkedin', 'github', 'twitter', 'x', 'facebook', 'youtube', 'slack', 'instagram'])

const distance = (a, b) => {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) m[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return m[a.length][b.length]
}

const broken = []
for (const [pascal, where] of used) {
  const kebab = toKebab(pascal)
  if (registry.has(kebab)) continue

  let hint = ''
  if (KNOWN_RENAMES[kebab] && registry.has(KNOWN_RENAMES[kebab])) {
    hint = `renamed → use "${KNOWN_RENAMES[kebab]}"`
  } else if (BRAND_NAMES.has(kebab)) {
    hint = 'Lucide has NO brand icons — use simple-icons for brand marks'
  } else if (suggest) {
    const near = [...registry]
      .map((n) => [n, distance(kebab, n)])
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([n]) => n)
    hint = `nearest: ${near.join(', ')}`
  } else {
    hint = 're-run with --suggest for nearest names'
  }
  broken.push({ pascal, kebab, where: [...where], hint })
}

/* ------------------------------------------------------------------ *
 * 4. Report
 * ------------------------------------------------------------------ */
console.log('\nLucide icon guard')
console.log('─'.repeat(72))
console.log(`registry: ${registry.size} icons in the installed lucide-react`)
console.log(`used:     ${used.size} distinct icon names across ${files.length} source files`)

if (starImports.length) {
  console.log('\n!! namespace imports — these ship the ENTIRE icon set:')
  for (const f of starImports) console.log(`     ${f}`)
  console.log('     use named imports: import { Shield, Radar } from \'lucide-react\'')
}

if (broken.length) {
  console.log(`\n!! ${broken.length} unresolved icon name${broken.length === 1 ? '' : 's'}:`)
  for (const b of broken) {
    console.log(`     <${b.pascal} />  (${b.kebab})  — ${b.hint}`)
    console.log(`        in: ${b.where.join(', ')}`)
  }
}

console.log('─'.repeat(72))
if (!broken.length && !starImports.length) {
  console.log('PASS — every icon name resolves and no namespace imports.\n')
  process.exit(0)
}
console.log('FAIL — never ship a broken import, and never invent an icon name.\n')
process.exit(1)
