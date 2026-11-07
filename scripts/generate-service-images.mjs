#!/usr/bin/env node
/**
 * Generate a banner image for each service page using Cloudflare Workers AI.
 *
 * WHY THIS EXISTS
 *
 * The service pages carry no imagery at all: measured 2026-11-07, 0 <img> in
 * <main> across all 18 of them, on pages running 12,021px to 17,430px tall.
 * The fix is a banner per service. The question is where the images come from.
 *
 * Stock was considered and rejected for the sub-service pages. The usable
 * near-monochrome candidates on Unsplash are overwhelmingly flat concrete and
 * plaster textures: measured mean saturation 0.000 to 0.080, which is exactly
 * the tonal discipline this site wants, and they depict nothing. A grey texture
 * behind "Penetration Testing" identifies no service and carries no
 * information. That is decoration, and DESIGN-RESEARCH.md's anti-pattern list
 * exists to stop precisely that.
 *
 * Generated imagery solves it properly: each prompt below is art-directed to
 * this site's palette (near-black ground, one red accent, no people, no text)
 * AND to its specific service, so the picture earns its place.
 *
 * WHAT IS MISSING: ONE PERMISSION SCOPE.
 *
 * Three generation paths were tested on 2026-11-07 and all three are blocked:
 *   - hf-images MCP ........ free-tier quota exhausted
 *   - gpt-image-2 .......... no OPENAI_API_KEY (probe reports has_api_key:false)
 *   - Cloudflare Workers AI  token lacks the scope, API returns code 10000
 *
 * The Cloudflare one is the only path the account owner can unblock directly.
 * Preferred, because it keeps the deploy token narrow: create a SEPARATE token
 * with one permission, Account -> Workers AI -> Read, and record it in
 * .secrets/cloudflare.md under a heading that names Workers AI:
 *
 *     ## Workers AI Token
 *     ```
 *     <the new token>
 *     ```
 *
 * or export CF_AI_TOKEN. Failing both, the script falls back to the first token
 * in that file, which works if you instead edit the existing deploy token and
 * add the same Workers AI -> Read permission to it.
 *
 * COST. Workers AI allows 10,000 neurons per UTC day at no charge. There is no
 * monthly allowance and no rollover; the counter resets at 00:00 UTC.
 *
 * flux-1-schnell bills 4.80 neurons per 512x512 tile, plus 9.60 neurons per
 * tile PER STEP. A 1024x1024 output is 4 tiles, so at 8 steps:
 *     4 * 4.80  +  4 * 8 * 9.60  =  326.4 neurons
 * That is ONLY 30 IMAGES PER DAY on the free allowance, not 104. Verified
 * against the dashboard: 30 images read 9.79k of 10k.
 * Overage, on a paid plan, is $0.011 per 1,000 neurons, so a 20-image set is
 * about 7 cents. On the free plan there is no overage: calls simply fail.
 *
 *   node scripts/generate-service-images.mjs            # all services
 *   node scripts/generate-service-images.mjs vciso erp  # named, by slug
 *   node scripts/generate-service-images.mjs --dry-run  # print prompts only
 *
 * Output: public/img/services/<slug>.webp, cropped to 16:9 from the square the
 * model returns. The uncropped original goes to .work/service-images-raw/,
 * outside public/ so it is never deployed.
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ACCOUNT_ID = '01e31f4fe3b3891a62a2bee09b76285f'
const MODEL = '@cf/black-forest-labs/flux-1-schnell'
const OUT_DIR = resolve(ROOT, 'public/img/services')
/* The uncropped original is kept so a different crop can be taken later without
   spending another generation, but it is NOT an asset. Writing it beside the
   webp put 9.4MB of source JPEG into public/ and therefore into the deploy, for
   a set whose actual payload is 712KB. It lives outside public/ for that reason. */
const RAW_DIR = resolve(ROOT, '.work/service-images-raw')
const STEPS = 8 // the documented maximum for this model

/* ---------------------------------------------------------------------------
 * THE ART DIRECTION, shared by every prompt.
 *
 * It is deliberately strict. The failure mode of generated imagery on a
 * security site is the hooded figure and the glowing blue padlock; Ambala IT
 * uses both, and DESIGN-RESEARCH.md records why that reads as a stock purchase
 * rather than as expertise.
 *
 * NOTE ON NEGATIVES: flux-1-schnell accepts only prompt, steps and seed. It has
 * no negative_prompt input, so the exclusions have to ride inside the prompt
 * itself, and they have to be phrased as things that ARE true of the frame
 * ("unpeopled", "bare of lettering") rather than as a banned list, because a
 * diffusion model reading "no padlock" still sees the word padlock.
 * ------------------------------------------------------------------------- */
const STYLE_DARK =
  'Editorial technology photograph. Near-black charcoal ground, cool neutral ' +
  'white key light raking across the subject, one small warm red indicator as ' +
  'the only colour anywhere in frame. Very high contrast, deep shadow, shallow ' +
  'depth of field, fine film grain. Architectural, precise, calm rather than ' +
  'dramatic. The frame is unpeopled and bare of any lettering, signage or ' +
  'screen. Muted and desaturated throughout.'

/*
 * The light variant exists because STYLE_DARK has a failure mode, found by
 * running it: a dark subject on a near-black ground plus "deep shadow" returns
 * a black rectangle. Measured 2026-11-07, five of fourteen came back at mean
 * luminance 1 to 17 out of 255, invisible on any band. The two that worked
 * (stacked paper, a drafting sheet) both had a large PALE surface of their own.
 *
 * So subjects with no pale surface get this instead. A mix is right anyway:
 * the site alternates theme-dark and theme-light bands, and the existing
 * practice-build / practice-security pair is already one idea at inverted value.
 */
const STYLE_LIGHT =
  'Editorial technology photograph. Pale bone-white and light grey ground, ' +
  'bright even diffused daylight, one small warm red element as the only ' +
  'colour anywhere in frame. Crisp high detail, clean negative space, shallow ' +
  'depth of field, fine film grain. Architectural, precise, calm rather than ' +
  'dramatic. The frame is unpeopled and bare of any lettering, signage or ' +
  'screen. Muted and desaturated throughout.'

/** Subjects with no pale surface of their own; these use STYLE_LIGHT. */
const LIGHT = new Set([
  'cybersecurity',
  'software-development',
  'devsecops',
  'platform-engineering',
  'lms',
  'red-teaming',
  'managed-detection-response',
  'web-application-development',
  'incident-response',
])

/** One subject per service. The subject is the service, not "security". */
const SUBJECTS = {
  'penetration-testing':
    'a single hairline crack running through an otherwise flawless machined steel plate, extreme macro',
  'application-security':
    'tightly stacked layers of laser-cut sheet metal seen edge-on, each layer slightly offset',
  'cloud-security':
    'a dense fibre-optic patch panel inside a dark rack, hundreds of cables dressed in ordered parallel curves',
  'red-teaming':
    'a heavy steel security door standing very slightly ajar in a pale concrete wall, a narrow sliver of darkness visible through the gap, soft directional daylight, crisp shadow',
  'managed-detection-response':
    'the front face of a pale server rack filling the frame, dense ordered grid of identical indicator lenses, exactly one of them glowing red',
  'incident-response':
    'a pale enamelled wall panel with a single red emergency pull handle behind clean glass, bright clinical light, crisp shadow',
  'custom-software':
    'an exploded view of precision machined components suspended in dark space, perfectly aligned',
  erp: 'a vast ordered grid of identical dark storage drawers, receding, one drawer open',
  crm: 'interlocking brass gears in a dark mechanism, macro, one tooth catching red light',
  'web-application-development':
    'a pale modernist facade of repeating glass and concrete panels, flat bright overcast light, crisp geometric structural grid',
  'qa-automation':
    'a row of identical calibration weights on a dark bench, one isolated under a spotlight',
  // Rewritten 2026-11-07. The first version ("a desk lamp over a dark drafting
  // table") stacked a dark subject on a dark ground and returned a frame of
  // mean luminance 4/255, invisible on this site's dark bands. A subject needs
  // a large pale surface of its own to read against the near-black ground.
  vciso:
    'a pale architect drafting sheet filling the frame, seen from directly overhead, crisp ruled construction lines across it, one red pencil lying diagonally',
  'grc-compliance':
    'the edges of densely stacked paper seen from the side, macro, one page marked with a red tab',
  hrm: 'a wall of identical dark lockers, one standing slightly proud of the others',
  // The two pillar pages and the four remaining services, added 2026-11-07.
  // All six use STYLE_LIGHT: by this point the light variant had produced a
  // readable frame on every attempt, and the dark one had failed five times.
  cybersecurity:
    'a massive circular vault door mechanism set into a pale concrete wall, precise concentric steel rings, bright even daylight',
  'software-development':
    'precision steel measuring tools arranged in an exact row on a pale bench, overhead daylight, one red handle among them',
  devsecops:
    'a long pale industrial conveyor carrying identical machined parts beneath inspection lights, receding in strict perspective',
  'platform-engineering':
    'a pale poured-concrete structural column grid in bright daylight, identical bays receding in strict repetition',
  lms: 'a head-on wall of identical pale book spines in exact rows, bright even light, one spine banded in red',
  'engagement-models':
    'three identical mid-grey card folders fanned across a dark grey desk surface, strong directional light, crisp shadows, one marked with a small red tab',
}

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const status = args.includes('--status')
const only = args.filter((a) => !a.startsWith('--'))

/**
 * Prefer a dedicated Workers AI token so the deploy token can stay narrow.
 * Order: CF_AI_TOKEN env -> a Workers AI section in .secrets -> first token.
 */
function readToken() {
  if (process.env.CF_AI_TOKEN) return process.env.CF_AI_TOKEN.trim()

  const file = resolve(ROOT, '.secrets/cloudflare.md')
  if (!existsSync(file)) {
    console.error('No .secrets/cloudflare.md and no CF_AI_TOKEN. The token is not in the repo.')
    process.exit(1)
  }

  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  const isToken = (s) => /^[A-Za-z0-9_-]{30,}$/.test(s)

  // A heading that mentions Workers AI claims the next token that follows it.
  let claimed = false
  for (const line of lines) {
    const t = line.trim()
    if (/^#{1,6}\s/.test(t)) claimed = /workers\s*ai/i.test(t)
    else if (claimed && isToken(t)) return t
  }
  for (const line of lines) {
    const t = line.trim()
    if (isToken(t)) return t
  }
  console.error('No API token line found in .secrets/cloudflare.md.')
  process.exit(1)
}

function promptFor(slug) {
  return `${SUBJECTS[slug]}. ${LIGHT.has(slug) ? STYLE_LIGHT : STYLE_DARK}`
}

/* ---------------------------------------------------------------------------
 * THE FREE-TIER BUDGET GUARD
 *
 * Workers AI allows 10,000 neurons per UTC day at no charge. There is no
 * monthly cap and no rollover: the counter resets at 00:00 UTC and anything
 * unused that day is simply gone.
 *
 * flux-1-schnell bills per 512x512 tile plus per diffusion step, so one
 * 1024x1024 image (4 tiles) at 8 steps is:
 *     4 * 4.80  +  8 * 9.60  =  96 neurons
 * which puts the free ceiling at 104 images per day.
 *
 * This ledger counts every successful generation against a self-imposed
 * budget that stops short of the real ceiling, so a runaway loop or a careless
 * rerun cannot wander into paid territory. A run that would cross the budget
 * refuses to start rather than stopping halfway through.
 * ------------------------------------------------------------------------- */
const NEURONS_PER_TILE = 4.8
const NEURONS_PER_STEP = 9.6
const TILES = 4 // 1024x1024 output = 4 tiles of 512x512
/* The step charge is per tile PER STEP, not per step. Getting this wrong
 * understated the cost by 3.4x: the script claimed 96 neurons an image and a
 * 104-image day, while Cloudflare's own counter read 9.79k of 10k after 30
 * images. 326.4 x 30 = 9,792, which matches the dashboard exactly.
 * Reconciled against the dashboard on 2026-11-07. Do not "simplify" this back. */
const NEURONS_PER_IMAGE = TILES * NEURONS_PER_TILE + TILES * STEPS * NEURONS_PER_STEP
const FREE_DAILY_NEURONS = 10000
const BUDGET = Number(process.env.CF_AI_DAILY_BUDGET ?? 8000) // 80% of free = 24 images
const LEDGER = resolve(ROOT, '.work/workers-ai-usage.json')

const utcDay = () => new Date().toISOString().slice(0, 10)

function readLedger() {
  try {
    const l = JSON.parse(readFileSync(LEDGER, 'utf8'))
    if (l.day === utcDay()) return l
  } catch {
    /* no ledger yet, or last run was a different UTC day: start clean */
  }
  return { day: utcDay(), neurons: 0, images: 0 }
}

function writeLedger(l) {
  mkdirSync(dirname(LEDGER), { recursive: true })
  writeFileSync(LEDGER, JSON.stringify(l, null, 2))
}

async function generate(slug, token) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${MODEL}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      // prompt + steps is the ENTIRE accepted schema. Verified against the live
      // API on 2026-11-07: width, height and negative_prompt are undocumented
      // and rejected, and so is seed, even though the docs' own curl example
      // passes one ("Additional or unevaluated properties '/seed' not allowed").
      // Output is therefore not reproducible; a rerun gives a different image.
      body: JSON.stringify({ prompt: promptFor(slug), steps: STEPS }),
    },
  )

  const data = await res.json().catch(() => ({}))
  const image = data?.result?.image
  if (!image) {
    const code = data?.errors?.[0]?.code
    const message = data?.errors?.[0]?.message ?? JSON.stringify(data).slice(0, 300)
    if (code === 10000 || res.status === 403) {
      throw new Error(
        'Authentication error (10000). The token is valid but has no Workers AI scope.\n' +
          '  Fix: dash.cloudflare.com/profile/api-tokens -> Create Token -> Custom token\n' +
          '       Permissions: Account | Workers AI | Read, then record it in .secrets\n' +
          '       under a "## Workers AI Token" heading, or export CF_AI_TOKEN.',
      )
    }
    throw new Error(`HTTP ${res.status}: ${message}`)
  }
  return Buffer.from(image, 'base64')
}

/**
 * The model returns a square. Banners are 16:9.
 *
 * A centre crop is wrong here: the model does not reliably centre its subject,
 * and the first run proved it. The vciso frame put a lamp at the top and a
 * desk at the bottom with nothing between them, so a centre crop returned 4KB
 * of pure black. sharp's attention strategy picks the highest-entropy band
 * instead, which keeps the subject.
 *
 * sharp ships with Next; if it is ever absent we keep the raw file and say so
 * rather than failing the run.
 */
async function toBanner(raw, out) {
  let sharp
  try {
    ;({ default: sharp } = await import('sharp'))
  } catch {
    return null
  }
  const { width = 1024 } = await sharp(raw).metadata()
  const h = Math.round(width * (9 / 16))
  await sharp(raw)
    .resize(width, h, { fit: 'cover', position: sharp.strategy.attention })
    .webp({ quality: 82 })
    .toFile(out)

  // Quality gate: a banner that is nearly all black or nearly all white is
  // invisible against this site's dark and light bands. Flag it rather than
  // letting it reach a page, where it reads as a broken image.
  const stats = await sharp(out).stats()
  const mean = stats.channels.slice(0, 3).reduce((a, c) => a + c.mean, 0) / 3
  const sat = Math.max(...stats.channels.slice(0, 3).map((c) => c.mean)) -
    Math.min(...stats.channels.slice(0, 3).map((c) => c.mean))
  const warn =
    mean < 18 ? 'TOO DARK' : mean > 238 ? 'TOO BRIGHT' : sat > 40 ? 'TOO COLOURED' : null
  return { dims: `${width}x${h}`, mean: Math.round(mean), warn }
}

if (status) {
  const l = readLedger()
  const used = l.neurons
  console.log(
    `\nWorkers AI usage — UTC day ${l.day}\n${'─'.repeat(72)}\n` +
      `  generated today   ${l.images} images (${used} neurons)\n` +
      `  budget            ${BUDGET} neurons = ${Math.floor(BUDGET / NEURONS_PER_IMAGE)} images\n` +
      `  left in budget    ${Math.floor((BUDGET - used) / NEURONS_PER_IMAGE)} images\n` +
      `  free ceiling      ${FREE_DAILY_NEURONS} neurons = ${Math.floor(FREE_DAILY_NEURONS / NEURONS_PER_IMAGE)} images\n` +
      `  left before cost  ${Math.floor((FREE_DAILY_NEURONS - used) / NEURONS_PER_IMAGE)} images\n` +
      `  resets            00:00 UTC\n${'─'.repeat(72)}\n` +
      `Cloudflare's own counter: https://dash.cloudflare.com/${ACCOUNT_ID}/ai/workers-ai\n`,
  )
  process.exit(0)
}

const slugs = (only.length ? only : Object.keys(SUBJECTS)).filter((s) => {
  if (SUBJECTS[s]) return true
  console.error(`Unknown service slug: ${s}`)
  return false
})

console.log(`\nService banner generation — ${slugs.length} image(s)\n${'─'.repeat(72)}`)

if (dryRun) {
  for (const slug of slugs) console.log(`\n${slug}\n  ${promptFor(slug)}`)
  console.log(`\n${'─'.repeat(72)}\nDry run. Nothing generated, nothing written.`)
  process.exit(0)
}

const token = readToken()
mkdirSync(OUT_DIR, { recursive: true })

// Refuse a run that would cross the budget, rather than stopping halfway.
const ledger = readLedger()
const cost = slugs.length * NEURONS_PER_IMAGE
const remaining = BUDGET - ledger.neurons
console.log(
  `Budget: ${ledger.neurons} of ${BUDGET} neurons used today (UTC ${ledger.day}), ` +
    `${Math.floor(remaining / NEURONS_PER_IMAGE)} images left.\n` +
    `This run costs ${cost} neurons (${NEURONS_PER_IMAGE} each).`,
)
if (cost > remaining) {
  console.error(
    `\nREFUSED. This run needs ${cost} neurons but only ${remaining} remain in today's ` +
      `budget of ${BUDGET} (the free ceiling is ${FREE_DAILY_NEURONS}/day, resetting 00:00 UTC).\n` +
      `  Generate fewer slugs, wait for the reset, or raise CF_AI_DAILY_BUDGET deliberately.`,
  )
  process.exit(1)
}
console.log('─'.repeat(72))

let ok = 0
for (const slug of slugs) {
  try {
    const raw = await generate(slug, token)
    ledger.neurons += NEURONS_PER_IMAGE
    ledger.images += 1
    writeLedger(ledger)
    mkdirSync(RAW_DIR, { recursive: true })
    writeFileSync(resolve(RAW_DIR, `${slug}-raw.jpg`), raw)
    const r = await toBanner(raw, resolve(OUT_DIR, `${slug}.webp`))
    if (!r) console.log(`  ok  ${slug} -> ${slug}-raw.jpg (sharp absent, uncropped)`)
    else if (r.warn) console.log(`  ??  ${slug} -> ${slug}.webp (${r.dims}, mean ${r.mean}) ${r.warn} — review before use`)
    else console.log(`  ok  ${slug} -> ${slug}.webp (${r.dims}, mean ${r.mean})`)
    ok += 1
  } catch (err) {
    console.error(`  !!  ${slug}: ${err.message}`)
    // A scope problem affects every call; stop rather than print it 14 times.
    if (String(err.message).includes('10000')) break
  }
}
const left = Math.floor((BUDGET - ledger.neurons) / NEURONS_PER_IMAGE)
console.log(
  `${'─'.repeat(72)}\n${ok} of ${slugs.length} generated.\n` +
    `Today: ${ledger.images} images, ${ledger.neurons} neurons of ${BUDGET} budget ` +
    `(free ceiling ${FREE_DAILY_NEURONS}). ${left} images left before the budget stops you. ` +
    `Resets 00:00 UTC.`,
)
process.exit(ok === slugs.length ? 0 : 1)
