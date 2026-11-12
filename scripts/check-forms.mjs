/**
 * Compares the form-worker's field whitelist against the `name` attributes the
 * site actually renders.
 *
 * WHY THIS EXISTS: the Worker's FORMS table was originally written from memory
 * of what the forms contained. Two of the three were wrong. /report-issue
 * required a field called `message` while the form renders `summary`, so every
 * vulnerability report was rejected. The enquiry form rendered `country` and
 * `interest`, which the Worker did not list, so those answers were silently
 * dropped from the email that did arrive.
 *
 * Both failures are invisible from either side alone. The site looks correct,
 * the Worker looks correct, and only the pair is wrong. That is what this
 * check is for.
 *
 * Usage:  node scripts/check-forms.mjs
 * Reads:  form-worker/src/index.ts  and  out/<page>.html
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const WORKER_SRC = join(ROOT, 'form-worker', 'src', 'index.ts')
const OUT = join(ROOT, 'out')

/** Fields that exist for plumbing and are never expected in the email body. */
const PLUMBING = new Set(['form', 'website', '_return'])

/**
 * Which built page carries which form, and the class that identifies it.
 *
 * Every page carries the footer newsletter form as well as its own, and both
 * post to the Worker. Without a per-form class the newsletter's fields bleed
 * into the enquiry check and report as dropped fields that are not dropped.
 */
const PAGES = [
  { form: 'enquiry', file: 'contact.html', selector: 'class="frm"' },
  { form: 'report-issue', file: 'report-issue.html', selector: 'class="frm"' },
  { form: 'newsletter', file: 'index.html', selector: 'foot__form' },
]

function fail(msg) {
  console.error(`\x1b[31mFAIL\x1b[0m ${msg}`)
  process.exitCode = 1
}

/** Pull the FORMS literal out of the Worker source. */
function readWorkerSpec() {
  const src = readFileSync(WORKER_SRC, 'utf8')
  const block = src.match(/const FORMS[^=]*=\s*\{([\s\S]*?)\n\}/)
  if (!block) throw new Error('could not locate the FORMS table in the Worker source')

  const spec = {}
  const entry = /'?([a-z-]+)'?:\s*\{\s*required:\s*\[([^\]]*)\],\s*fields:\s*\[([^\]]*)\]/g
  let m
  while ((m = entry.exec(block[1])) !== null) {
    const list = (s) =>
      s
        .split(',')
        .map((x) => x.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    spec[m[1]] = { required: list(m[2]), fields: list(m[3]) }
  }
  return spec
}

/** Pull the rendered field names out of one built page. */
function readRenderedFields(file, selector) {
  const path = join(OUT, file)
  if (!existsSync(path)) return null
  let html = readFileSync(path, 'utf8')

  if (selector) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const scoped = html.match(new RegExp(`<form[^>]*${escaped}[\\s\\S]*?</form>`))
    if (!scoped) return null
    html = scoped[0]
  } else {
    // Only forms that actually post to the Worker.
    const forms = [...html.matchAll(/<form[^>]*forms\.envenox\.com[\s\S]*?<\/form>/g)]
    if (forms.length === 0) return null
    html = forms.map((f) => f[0]).join('\n')
  }

  const fields = new Map()
  for (const m of html.matchAll(/<(input|textarea|select)\b[^>]*>/g)) {
    const tag = m[0]
    const name = tag.match(/name="([^"]+)"/)?.[1]
    if (!name) continue
    fields.set(name, { required: /\brequired\b/.test(tag) })
  }
  return fields
}

const spec = readWorkerSpec()
console.log(`Checking ${Object.keys(spec).length} form(s) in the Worker against built HTML\n`)

if (!existsSync(OUT)) {
  fail('out/ does not exist. Run `npm run build` first.')
  process.exit(1)
}

for (const { form, file, selector } of PAGES) {
  const s = spec[form]
  if (!s) {
    fail(`${form}: the Worker has no entry for this form`)
    continue
  }
  const rendered = readRenderedFields(file, selector)
  if (!rendered) {
    fail(`${form}: no form found in out/${file}`)
    continue
  }

  const renderedNames = [...rendered.keys()].filter((n) => !PLUMBING.has(n))

  // 1. Every field the Worker REQUIRES must actually be rendered. If not, the
  //    form can never be submitted successfully by anyone.
  const missing = s.required.filter((f) => !rendered.has(f))
  // 2. Every rendered field should be in the Worker's list, or its value is
  //    accepted and then silently discarded.
  const dropped = renderedNames.filter((n) => !s.fields.includes(n))
  // 3. A field the Worker lists but the page does not render is dead config.
  const absent = s.fields.filter((f) => !rendered.has(f))

  if (missing.length === 0 && dropped.length === 0 && absent.length === 0) {
    console.log(`\x1b[32mPASS\x1b[0m ${form} (${renderedNames.length} fields)`)
    continue
  }
  if (missing.length) fail(`${form}: Worker REQUIRES [${missing}] which the page never renders. Every submission is rejected.`)
  if (dropped.length) fail(`${form}: page renders [${dropped}] which the Worker drops. Submissions arrive incomplete.`)
  if (absent.length) console.warn(`\x1b[33mWARN\x1b[0m ${form}: Worker lists [${absent}] which the page does not render (dead config)`)
}

if (process.exitCode === 1) {
  console.error('\nForm contract mismatch. Fix form-worker/src/index.ts or the form markup.')
} else {
  console.log('\nForm contract holds.')
}
