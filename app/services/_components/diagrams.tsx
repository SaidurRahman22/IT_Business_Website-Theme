/**
 * ROUTE-PRIVATE DIAGRAMS for /services/**.
 *
 * WHY THESE EXIST
 * Seventeen service pages had no visual at all. The brief for the pages that
 * have no product surface to show is explicit: the visual is the PROCESS and
 * the DELIVERABLE. Not a shield, not a padlock, not a vector of floating
 * documents. So all three diagrams below are drawn from the service's own data
 * in `lib/services.ts` and would be wrong for any other service.
 *
 *   <EngagementTimeline>  the engagement's SHAPE - every phase as a bar on a
 *                         real axis, placed from the phase's own `days` string,
 *                         with the deliverable that drops out of it.
 *   <DeliverablesStack>   what physically lands in the client's inbox, drawn as
 *                         stacked document edges carrying their real names.
 *   <ScopeBoundary>       the scope map for a testing service: `included` inside
 *                         the boundary, the service's own stated exclusions
 *                         outside it.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * ACCESSIBILITY CONTRACT - the same one SecureSdlcPipeline holds
 * ──────────────────────────────────────────────────────────────────────────
 * Every `<svg>` is `role="img"` with an `aria-label` that states the whole
 * finding in words, AND the same information is rendered as real DOM text. For
 * the timeline the DOM text is an ordered schedule list which IS the diagram
 * below 860px and stays in the accessibility tree above it. For the stack and
 * the boundary the DOM text sits beside the graphic at every width.
 *
 * NO JAVASCRIPT. All three are Server Components with no client boundary, no
 * observer and no state. They render finished with scripting off and they do
 * not animate, so `prefers-reduced-motion` changes nothing about them.
 *
 * NO INVENTED DATA. Where the data does not say something, the diagram says
 * nothing. A phase with no parseable schedule is drawn as a standing row with
 * its own words on it, not given a plausible-looking bar.
 */

import type { ReactNode } from 'react'
import type { Faq, Phase, Service } from '@/lib/services'

/* ========================================================================== *
 * 1. SCHEDULE PARSING
 *
 * `Phase.days` is prose, but it is prose with a grammar. Across all 17 services
 * it takes six shapes, and each one is handled below. Anything that matches
 * none of them becomes a STANDING row - drawn across the whole track with its
 * raw words on it - rather than being given an invented position.
 * ========================================================================== */

/** One day is the base unit; everything converts into it. */
const UNIT_DAYS: Record<string, number> = {
  minute: 1 / (24 * 60),
  hour: 1 / 24,
  day: 1,
  week: 7,
  sprint: 14,
  month: 30,
}

const UNIT_RE = 'minute|hour|day|week|sprint|month'

export type Stage = 'before' | 'window' | 'after' | 'standing'

export const STAGE_LABEL: Record<Stage, string> = {
  before: 'Before the window opens',
  window: 'Inside the engagement window',
  after: 'After the report',
  standing: 'Runs throughout, no fixed window',
}

type Placed = {
  phase: Phase
  stage: Stage
  /** Days from kick-off. Null on a standing row. */
  start: number | null
  end: number | null
  /** True where `days` stated a duration we could read, rather than our guess. */
  stated: boolean
  /** Open-ended: "Week 38+", "Month 12+". */
  open: boolean
  /** Deliverable matched to this phase, or null. */
  artefact: string | null
}

/** Strip the leading qualifier so "Final 4 weeks" parses as "4 weeks". */
function normalise(raw: string): string {
  return raw.trim().replace(/^(final|first|last)\s+/i, '')
}

/**
 * Does this service number its units from zero?
 *
 * /services/incident-response uses "Hour 0" and "Hours 1–6" in the same array.
 * "Day 1" elsewhere means the first day. Reading one convention into the other
 * puts the first phase of an incident a full hour late, so the convention is
 * decided per unit, per service, from the data.
 */
function zeroBasedUnits(phases: readonly Phase[]): Set<string> {
  const zero = new Set<string>()
  for (const p of phases) {
    const m = new RegExp(`^(${UNIT_RE})s?\\s+0\\b`, 'i').exec(normalise(p.days ?? ''))
    if (m) zero.add(m[1].toLowerCase())
  }
  return zero
}

/**
 * Place every phase on a day axis.
 *
 * Order matters: "3–5 days before start" has to be read as a pre-roll before
 * the bare-duration rule gets to it, and "Within 30 days" has to be read as a
 * post-report commitment before the same rule claims it as a sequential span.
 */
export function placePhases(phases: readonly Phase[], deliverables: readonly string[]): Placed[] {
  const zero = zeroBasedUnits(phases)
  const artefacts = matchArtefacts(phases, deliverables)

  const out: Placed[] = []
  /** Running end of the last phase that landed on the axis. */
  let cursor = 0
  /** End of the last phase INSIDE the window - what "after" is measured from. */
  let windowEnd = 0

  phases.forEach((phase, i) => {
    const raw = normalise(phase.days ?? '')
    const artefact = artefacts[i] ?? null
    const push = (p: Omit<Placed, 'phase' | 'artefact'>) => {
      out.push({ ...p, phase, artefact })
      if (p.start !== null && p.end !== null) {
        cursor = Math.max(cursor, p.end)
        if (p.stage === 'window') windowEnd = Math.max(windowEnd, p.end)
      }
    }

    if (!raw) {
      push({ stage: 'standing', start: null, end: null, stated: false, open: false })
      return
    }

    /* --- a. a pre-roll: "3–5 days before start", "Before sprint 1" -------- */
    if (/\bbefore\b/i.test(raw)) {
      const span = readSpan(raw)
      // No stated magnitude ("Before sprint 1") → one week of lead-in, drawn
      // dashed and flagged `stated: false` so the caption can say so.
      const len = span ? span.max : 7
      push({ stage: 'before', start: -len, end: 0, stated: Boolean(span), open: false })
      return
    }

    /* --- b. a post-report commitment: "Within 30 days" -------------------- */
    const within = new RegExp(`^within\\s+(\\d+)\\s*(${UNIT_RE})s?`, 'i').exec(raw)
    if (within) {
      const len = Number(within[1]) * UNIT_DAYS[within[2].toLowerCase()]
      push({ stage: 'after', start: windowEnd, end: windowEnd + len, stated: true, open: false })
      return
    }

    /* --- c. an absolute position: "Weeks 5–10", "Day 1", "Month 12+" ------ */
    const abs = new RegExp(
      `^(${UNIT_RE})s?\\s+(\\d+)(?:\\s*[–—-]\\s*(\\d+))?\\s*(\\+)?`,
      'i',
    ).exec(raw)
    if (abs) {
      const unit = abs[1].toLowerCase()
      const u = UNIT_DAYS[unit]
      const a = Number(abs[2])
      const b = abs[3] ? Number(abs[3]) : a
      const isZero = zero.has(unit)
      const start = isZero ? a * u : (a - 1) * u
      const end = isZero ? (b + 1) * u : b * u
      push({ stage: 'window', start, end, stated: true, open: Boolean(abs[4]) })
      return
    }

    /* --- d. a bare duration: "3–5 days", "1–2 weeks", "60 minutes" -------- */
    const span = readSpan(raw)
    if (span) {
      push({ stage: 'window', start: cursor, end: cursor + span.max, stated: true, open: false })
      return
    }

    /* --- e. everything else: "Ongoing", "Quarterly", "Launch week" -------- */
    push({ stage: 'standing', start: null, end: null, stated: false, open: false })
  })

  return out
}

/** "3–5 days" → { min: 3, max: 5 } in days. Null where there is no duration. */
function readSpan(raw: string): { min: number; max: number } | null {
  const m = new RegExp(`(\\d+)(?:\\s*[–—-]\\s*(\\d+))?\\s*(${UNIT_RE})s?`, 'i').exec(raw)
  if (!m) return null
  const u = UNIT_DAYS[m[3].toLowerCase()]
  const a = Number(m[1]) * u
  const b = m[2] ? Number(m[2]) * u : a
  return { min: Math.min(a, b), max: Math.max(a, b) }
}

/* ========================================================================== *
 * 2. WHICH DELIVERABLE DROPS OUT OF WHICH PHASE
 *
 * `lib/services.ts` has no phase→deliverable edge, and inventing one would be
 * exactly the kind of plausible-looking fiction this diagram exists to avoid.
 * So the edge is DERIVED, strictly: a deliverable belongs to a phase only when
 * it shares a distinctive stem with that phase's NAME - not its body, which is
 * loose enough to match almost anything. Each deliverable is claimed at most
 * once, and a phase with no match shows nothing.
 *
 * On /services/penetration-testing this produces: Reporting → the technical
 * report, Debrief → the 90-minute debrief, Retest → the retest report. Scoping,
 * reconnaissance and manual testing produce no listed artefact, which is true -
 * their outputs are interim and the service does not list them.
 * ========================================================================== */

const STOP = new Set([
  'the', 'and', 'with', 'from', 'that', 'this', 'your', 'our', 'for', 'into',
  'each', 'every', 'what', 'which', 'then', 'than', 'they', 'them', 'been',
  'will', 'have', 'also', 'where', 'while', 'their', 'after', 'before', 'over',
])

function stems(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOP.has(w))
        .map((w) => w.replace(/(ings|ing|ed|es|s)$/, '')),
    ),
  )
}

function matchArtefacts(
  phases: readonly Phase[],
  deliverables: readonly string[],
): (string | null)[] {
  const pool = deliverables.map((d) => ({ text: d, stems: new Set(stems(d)), taken: false }))
  return phases.map((phase) => {
    const want = stems(phase.name)
    let best: (typeof pool)[number] | null = null
    let bestScore = 0
    for (const candidate of pool) {
      if (candidate.taken) continue
      const score = want.reduce((n, s) => n + (candidate.stems.has(s) ? 1 : 0), 0)
      if (score > bestScore) {
        bestScore = score
        best = candidate
      }
    }
    if (!best || bestScore < 1) return null
    best.taken = true
    return shortTitle(best.text)
  })
}

/** The deliverable's name, without the sentence explaining it. */
export function shortTitle(text: string): string {
  const head = text.split(/\s+[—–-]\s+/)[0]
  return head.replace(/\.$/, '')
}

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

/* ========================================================================== *
 * 3. AXIS
 * ========================================================================== */

type Axis = { min: number; max: number; unit: string; unitDays: number; ticks: number[] }

function buildAxis(rows: Placed[]): Axis | null {
  const anchored = rows.filter((r) => r.start !== null && r.end !== null)
  if (anchored.length < 2) return null

  const min = Math.min(...anchored.map((r) => r.start as number))
  const max = Math.max(...anchored.map((r) => r.end as number))
  const span = max - min
  if (!(span > 0)) return null

  const [unit, unitDays] =
    span <= 2 ? ['hour', UNIT_DAYS.hour]
    : span <= 28 ? ['day', UNIT_DAYS.day]
    : span <= 240 ? ['week', UNIT_DAYS.week]
    : ['month', UNIT_DAYS.month]

  // Four to six ticks on a round multiple of the chosen unit.
  const rough = span / 5 / unitDays
  const step = [1, 2, 5, 10, 20, 50].find((s) => s >= rough) ?? 100
  const ticks: number[] = []
  const first = Math.ceil(min / unitDays / step) * step
  for (let t = first; t * unitDays <= max + 1e-6; t += step) ticks.push(t)

  return { min, max, unit, unitDays, ticks }
}

const fmtNum = (n: number) => (Math.abs(n - Math.round(n)) < 0.05 ? String(Math.round(n)) : n.toFixed(1))

/* ========================================================================== *
 * 4. THE ENGAGEMENT TIMELINE
 * ========================================================================== */

/* Geometry. One viewBox, one set of constants, everything derived from them. */
const VB_W = 1000
const GUTTER = 236 // phase number + name
const TRACK_X = GUTTER
const ART_X = 762 // deliverable column
const TRACK_W = ART_X - 24 - TRACK_X
const ROW_H = 30
const BAR_H = 15
const HEAD_H = 46

export function EngagementTimeline({
  service,
  id,
}: {
  service: Service
  id?: string
}) {
  const rows = placePhases(service.phases, service.deliverables)
  const axis = buildAxis(rows)
  const height = HEAD_H + rows.length * ROW_H + 26

  const x = (days: number) =>
    axis ? TRACK_X + ((days - axis.min) / (axis.max - axis.min)) * TRACK_W : TRACK_X

  const stageWord = (r: Placed) =>
    r.stage === 'standing' ? 'no fixed window' : STAGE_LABEL[r.stage].toLowerCase()

  const ariaLabel =
    `Engagement shape for ${service.name}: ${service.phases.length} phases. ` +
    rows
      .map(
        (r) =>
          `Phase ${r.phase.n}, ${r.phase.name}, ${r.phase.days ?? 'no stated schedule'}, ` +
          `${stageWord(r)}${r.artefact ? `, producing the ${r.artefact.toLowerCase()}` : ''}.`,
      )
      .join(' ')

  return (
    <>
      <DiagramStyles />
      <figure className="dg" id={id}>
        {/* ---------------- the drawn schedule, 860px and up ---------------- */}
        {axis ? (
          <svg
            className="dg-gantt"
            viewBox={`0 0 ${VB_W} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={ariaLabel}
          >
            {/* Axis: the unit is named, so a bar length means something. Set in
                the left gutter rather than over the track, where it would sit
                on top of the first tick label. */}
            <text className="dg-axisUnit" x={0} y={16}>
              {`${axis.unit}s from kick-off`}
            </text>
            {axis.ticks.map((t) => (
              <g key={t}>
                <line
                  className="dg-grid"
                  x1={x(t * axis.unitDays)}
                  y1={HEAD_H - 16}
                  x2={x(t * axis.unitDays)}
                  y2={HEAD_H + rows.length * ROW_H}
                />
                <text className="dg-tick" x={x(t * axis.unitDays)} y={HEAD_H - 22} textAnchor="middle">
                  {t}
                </text>
              </g>
            ))}
            {/* Kick-off. Day zero is the only moment both parties agree on. */}
            {axis.min <= 0 && axis.max >= 0 ? (
              <>
                <line
                  className="dg-zero"
                  x1={x(0)}
                  y1={HEAD_H - 16}
                  x2={x(0)}
                  y2={HEAD_H + rows.length * ROW_H + 6}
                />
                <text className="dg-zeroLabel" x={x(0)} y={HEAD_H + rows.length * ROW_H + 19} textAnchor="middle">
                  kick-off
                </text>
              </>
            ) : null}

            <text className="dg-colHead" x={ART_X} y={16}>
              Drops out
            </text>

            {rows.map((r, i) => {
              const y = HEAD_H + i * ROW_H
              const mid = y + ROW_H / 2
              const anchored = r.start !== null && r.end !== null
              const x0 = anchored ? x(r.start as number) : TRACK_X
              const x1 = anchored ? x(r.end as number) : TRACK_X + TRACK_W
              const w = Math.max(4, x1 - x0)
              const h = r.stage === 'after' ? 8 : BAR_H
              return (
                <g key={r.phase.n}>
                  <text className="dg-rowNum" x={0} y={mid + 4}>
                    {String(r.phase.n).padStart(2, '0')}
                  </text>
                  <text className="dg-rowName" x={34} y={mid + 4}>
                    {clip(r.phase.name, 28)}
                  </text>

                  {r.stage === 'standing' ? (
                    <>
                      <line className="dg-standing" x1={x0} y1={mid} x2={x1} y2={mid} />
                      <text className="dg-barLabel" x={x0 + 6} y={mid - 6}>
                        {clip(r.phase.days ?? '', 34)}
                      </text>
                    </>
                  ) : (
                    <>
                      <rect
                        className={`dg-bar dg-bar--${r.stage}${r.stated ? '' : ' dg-bar--unstated'}`}
                        x={x0}
                        y={mid - h / 2}
                        width={w}
                        height={h}
                        rx={2}
                      />
                      {r.open ? (
                        <path
                          className="dg-openTip"
                          d={`M ${x0 + w + 3} ${mid - 5} L ${x0 + w + 10} ${mid} L ${x0 + w + 3} ${mid + 5} Z`}
                        />
                      ) : null}
                      {/* WHERE THE DURATION LABEL GOES.
                          After the bar if it fits inside the track, before it
                          if not, and inside the bar only as a last resort. A
                          label clamped to the track edge instead would print
                          over the deliverable column, which is how "Within 30
                          days" and "Retest report within 30 days" ended up on
                          top of each other on /services/penetration-testing.
                          10 is the mono cap height at font-size 10; 5.9 is its
                          advance width, measured rather than guessed. */}
                      {(() => {
                        const text = clip(r.phase.days ?? '', 22)
                        const tw = text.length * 5.9
                        const gap = 8 + (r.open ? 10 : 0)
                        const trackEnd = TRACK_X + TRACK_W
                        if (x0 + w + gap + tw <= trackEnd) {
                          return (
                            <text className="dg-barLabel" x={x0 + w + gap} y={mid + 3}>
                              {text}
                            </text>
                          )
                        }
                        if (x0 - 8 - tw >= TRACK_X) {
                          return (
                            <text className="dg-barLabel" x={x0 - 8} y={mid + 3} textAnchor="end">
                              {text}
                            </text>
                          )
                        }
                        return (
                          <text className="dg-barLabel dg-barLabel--in" x={x0 + 6} y={mid + 3}>
                            {text}
                          </text>
                        )
                      })()}
                    </>
                  )}

                  {r.artefact ? (
                    <>
                      <line className="dg-leader" x1={ART_X - 14} y1={mid} x2={ART_X - 5} y2={mid} />
                      <rect className="dg-artMark" x={ART_X - 5} y={mid - 4} width={8} height={8} rx={1} />
                      <text className="dg-art" x={ART_X + 9} y={mid + 3}>
                        {clip(r.artefact, 30)}
                      </text>
                    </>
                  ) : (
                    <text className="dg-artNone" x={ART_X + 9} y={mid + 3}>
                      {'—'}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        ) : null}

        {/* ----------------------------------------------------------------
            THE SAME INFORMATION AS REAL DOM TEXT.

            Below 860px this IS the diagram, the drawn schedule is display:none
            and the page never grows a horizontal scrollbar, because there is
            nothing wide left to scroll. Above 860px it stays in the DOM and in
            the accessibility tree, clipped. The <figure> is position: relative
            so the clipped block cannot escape it: an absolutely positioned
            element is only clipped by an ancestor that is in its containing
            block chain, and that is the mistake that once widened a page by
            930px at 390px.
           ---------------------------------------------------------------- */}
        <div className="dg-ganttText">
          <ol className="dg-sched">
            {rows.map((r) => (
              <li className="dg-schedRow" key={r.phase.n} data-stage={r.stage}>
                <p className="dg-schedHead">
                  <span className="u-mono dg-schedNum">{String(r.phase.n).padStart(2, '0')}</span>
                  <span className="dg-schedName">{r.phase.name}</span>
                </p>
                <p className="dg-schedWhen u-mono">{r.phase.days ?? 'No stated schedule'}</p>
                <p className="dg-schedStage">{STAGE_LABEL[r.stage]}</p>
                <p className="dg-schedArt">
                  <span className="dg-schedArtKey">Drops out</span>
                  {r.artefact ?? 'Nothing the service lists separately'}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <figcaption className="dg-cap">
          <ul className="dg-legend">
            <li className="dg-legendItem" data-stage="before">
              <span className="dg-legendMark" aria-hidden="true" />
              Before the window opens
            </li>
            <li className="dg-legendItem" data-stage="window">
              <span className="dg-legendMark" aria-hidden="true" />
              Inside the engagement window
            </li>
            <li className="dg-legendItem" data-stage="after">
              <span className="dg-legendMark" aria-hidden="true" />
              After the report, a commitment, not an upsell
            </li>
            <li className="dg-legendItem" data-stage="standing">
              <span className="dg-legendMark" aria-hidden="true" />
              Standing work with no fixed window
            </li>
          </ul>
          <p className="dg-capNote">
            {`Every bar is positioned and sized from that phase’s own stated schedule, converted to a single ${axis?.unit ?? 'day'} axis and drawn to one scale. `}
            Nothing is rounded to make the picture tidier, and a phase whose schedule the service
            does not state &mdash; standing work, a quarterly cadence, anything open-ended &mdash;
            is drawn as a dotted row carrying its own words rather than handed a plausible-looking
            bar it never had.
          </p>
        </figcaption>
      </figure>
    </>
  )
}

/* ========================================================================== *
 * 5. THE DELIVERABLES STACK
 * ========================================================================== */

/** The format a deliverable physically arrives in, read from its own words. */
function formatTag(text: string): string {
  const t = text.toLowerCase()
  if (/\bcsv\b/.test(t) && /\bjson\b/.test(t)) return 'CSV + JSON'
  if (/\bcsv\b/.test(t)) return 'CSV'
  if (/\bjson\b/.test(t)) return 'JSON'
  if (/\bterraform\b|\bpull request|\brepositor/.test(t)) return 'In your repo'
  if (/\bletter\b|attestation/.test(t)) return 'Signed letter'
  if (/debrief|walkthrough|workshop|\bcall\b|\btour\b|session/.test(t)) return 'Live session'
  if (/dashboard|register|backlog|tracker|board/.test(t)) return 'Live register'
  if (/runbook|playbook|policy|procedure/.test(t)) return 'Operating doc'
  if (/summary/.test(t)) return 'Two-page summary'
  if (/report/.test(t)) return 'Written report'
  return 'Written document'
}

/* Geometry of the stack.
   SHEET_STEP is the height of the EDGE each sheet leaves showing, so it has to
   clear the number row and the title row; SHEET_H is what the last sheet, the
   only one not overlapped, shows in full. */
const SHEET_W = 470
const SHEET_H = 92
const SHEET_STEP = 46
const STACK_PAD = 18

export function DeliverablesStack({ service }: { service: Service }) {
  const items = service.deliverables.slice(0, 7)
  const height = STACK_PAD * 2 + (items.length - 1) * SHEET_STEP + SHEET_H
  const width = SHEET_W + STACK_PAD * 2 + (items.length - 1) * 5

  const ariaLabel =
    `What lands in your inbox on a ${service.name} engagement: ` +
    `${service.deliverables.length} deliverables. ` +
    items.map((d, i) => `${i + 1}, ${shortTitle(d)}, ${formatTag(d).toLowerCase()}.`).join(' ')

  return (
    <>
      <DiagramStyles />
      <figure className="dg dg-stackFig">
        <svg
          className="dg-stack"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMin meet"
          role="img"
          aria-label={ariaLabel}
        >
          {/* Painted FRONT TO BACK, sheet 01 first, each later sheet over the
              one before it. That is what leaves every sheet's top edge, with
              its number, its name and the form it arrives in, readable; the
              reverse order buries everything under sheet 01 and the stack
              becomes six blank rectangles. */}
          {items.map((text, i) => {
            const sx = STACK_PAD + i * 5
            const sy = STACK_PAD + i * SHEET_STEP
            return (
              <g key={text}>
                <rect className="dg-sheet" x={sx} y={sy} width={SHEET_W} height={SHEET_H} rx={6} />
                {/* The spine. The one accent mark on the sheet. */}
                <rect className="dg-sheetSpine" x={sx} y={sy} width={3} height={SHEET_H} />
                <text className="dg-sheetNum u-mono" x={sx + 18} y={sy + 20}>
                  {String(i + 1).padStart(2, '0')}
                </text>
                <text className="dg-sheetTag" x={sx + SHEET_W - 16} y={sy + 20} textAnchor="end">
                  {formatTag(text)}
                </text>
                <text className="dg-sheetTitle" x={sx + 18} y={sy + 38}>
                  {clip(shortTitle(text), 42)}
                </text>
                {/* The lower edge of the visible strip. On the last sheet, which
                    nothing overlaps, it reads as the rule under a document's
                    title block rather than as decoration. */}
                <line
                  className="dg-sheetRule"
                  x1={sx + 18}
                  y1={sy + SHEET_STEP - 2}
                  x2={sx + SHEET_W - 16}
                  y2={sy + SHEET_STEP - 2}
                />
              </g>
            )
          })}
        </svg>
        <figcaption className="dg-capNote dg-stackCap">
          {service.deliverables.length > items.length
            ? `The ${service.deliverables.length} artefacts of a ${service.name} engagement; the top ${items.length} are drawn. Every one is listed in full beside this.`
            : `All ${service.deliverables.length} artefacts of a ${service.name} engagement, drawn in the order they arrive. Each is listed in full beside this.`}
        </figcaption>
      </figure>
    </>
  )
}

/* ========================================================================== *
 * 6. THE SCOPE BOUNDARY
 *
 * For a testing service the map that matters is not a diagram of an attack -
 * it is where the line is. `included` sits inside the boundary; the service's
 * own stated exclusions, taken verbatim from the FAQ that states them, sit
 * outside it. Where a service states no exclusions the outer field is simply
 * not rendered, rather than filled with a guess.
 * ========================================================================== */

/** The service's own words on what it does not cover, if it has any. */
export function exclusionFaq(faqs: readonly Faq[]): Faq | null {
  return (
    faqs.find((f) => /not included|out of scope|exclusion|excluded|do you not/i.test(f.q)) ?? null
  )
}

export function ScopeBoundary({ service }: { service: Service }) {
  const excluded = exclusionFaq(service.faqs)

  return (
    <>
      <DiagramStyles />
      <figure className="dg dg-scope">
        <div className="dg-scopeIn">
          <p className="dg-scopeTag u-mono">
            Inside the boundary
            <span className="dg-scopeCount">{`${service.included.length} surfaces`}</span>
          </p>
          <ol className="dg-scopeGrid">
            {service.included.map((item, i) => (
              <li className="dg-scopeCell" key={item.title}>
                <span className="u-mono dg-scopeNum" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="dg-scopeName">{item.title}</h3>
                <p className="dg-scopeBody">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>

        {excluded ? (
          <aside className="dg-scopeOut" aria-label="Outside the boundary">
            <p className="dg-scopeTag dg-scopeTag--out u-mono">Outside the boundary</p>
            <h3 className="dg-scopeOutQ">{excluded.q}</h3>
            <p className="dg-scopeOutA">{excluded.a}</p>
          </aside>
        ) : null}
      </figure>
    </>
  )
}

/* ========================================================================== *
 * 7. SMALL SHARED PIECES
 * ========================================================================== */

/** A figure frame for a product console, with the argument it is making. */
export function ConsoleFrame({
  eyebrow,
  title,
  body,
  children,
}: {
  eyebrow: string
  title: string
  body: string
  children: ReactNode
}) {
  return (
    <>
      <DiagramStyles />
      <div className="dg-console">
        <div className="dg-consoleSay">
          <p className="u-eyebrow">{eyebrow}</p>
          <h3 className="dg-consoleTitle">{title}</h3>
          <p className="dg-consoleBody">{body}</p>
        </div>
        <div className="dg-consoleArt">{children}</div>
      </div>
    </>
  )
}

/* ========================================================================== *
 * 8. THE STYLESHEET
 *
 * One <style href precedence> element, deduped by React however many of these
 * components a page renders. Tokens only - the guard in scripts/check-motion.mjs
 * fails the build on a hex literal, an invented easing or an invented duration,
 * and there is no hover transform anywhere below.
 * ========================================================================== */

const DIAGRAM_CSS = `
.dg {
  /* POSITIONED ON PURPOSE. .dg-ganttText is clipped and absolutely positioned
     at wide widths; an absolutely positioned element is only clipped by an
     ancestor in its containing-block chain. Without this the clipped schedule
     escapes and widens the page. */
  position: relative;
  margin: 0;
  min-width: 0;
}

/* ---------------- the drawn schedule ---------------- */
.dg-gantt { display: none; width: 100%; height: auto; overflow: visible; }
@media (min-width: 860px) {
  .dg-gantt { display: block; }
}

.dg-axisUnit,
.dg-colHead {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: var(--muted);
}
.dg-tick {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 10px;
  fill: var(--muted);
}
.dg-grid { stroke: var(--border-strong); stroke-width: 1; }
.dg-zero { stroke: var(--accent); stroke-width: 1.5; }
.dg-zeroLabel {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  fill: var(--accent);
}

.dg-rowNum {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 11px;
  fill: var(--muted);
}
.dg-rowName { font-size: 13px; fill: var(--fg); }

/* Three stages, three SHAPES as well as three fills: a filled bar, a hollow
   dashed bar and a half-height bar. The information survives greyscale. */
.dg-bar { fill: var(--accent); stroke: none; }
.dg-bar--before { fill: none; stroke: var(--muted); stroke-width: 1.5; stroke-dasharray: 4 3; }
.dg-bar--after { fill: var(--muted-strong); }
.dg-bar--unstated { opacity: 0.55; }
.dg-openTip { fill: var(--accent); }
.dg-standing { stroke: var(--border-strong); stroke-width: 2; stroke-dasharray: 2 4; }

.dg-barLabel {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 10px;
  fill: var(--muted);
}
/* Printed on top of a filled bar: the bar's fill is --accent or
   --muted-strong, both of which are LIGHT in the dark palettes and DARK in the
   light one, so the text takes the ground colour rather than a fixed one. */
.dg-barLabel--in { fill: var(--bg); }
.dg-leader { stroke: var(--border-strong); stroke-width: 1; }
.dg-artMark { fill: var(--accent); }
.dg-art { font-size: 12px; fill: var(--muted-strong); }
/* "nothing drops out of this phase" is information, not furniture, so the
   dash takes a text neutral. --border-strong is a hairline value and renders
   as an almost-invisible mark in .theme-dark. */
.dg-artNone { font-size: 12px; fill: var(--muted); }

/* ---------------- the schedule as DOM text ---------------- */
.dg-sched { list-style: none; margin: 0; padding: 0; display: grid; }
.dg-schedRow {
  display: grid;
  gap: var(--s1);
  padding: var(--s4) 0;
  border-top: 1px solid var(--border);
  min-width: 0;
}
@media (min-width: 560px) {
  .dg-schedRow {
    grid-template-columns: minmax(0, 15rem) minmax(0, 1fr);
    column-gap: var(--s6);
    align-items: baseline;
  }
  .dg-schedHead { grid-row: span 3; }
}
.dg-schedHead { display: flex; gap: var(--s3); align-items: baseline; margin: 0; min-width: 0; }
.dg-schedNum { font-size: var(--text-xs); color: var(--accent); flex: none; }
.dg-schedName { font-weight: 500; color: var(--fg); }
.dg-schedWhen { margin: 0; font-size: var(--text-xs); color: var(--muted-strong); }
.dg-schedStage { margin: 0; font-size: var(--text-xs); color: var(--muted); }
.dg-schedArt { margin: 0; font-size: var(--text-sm); color: var(--muted-strong); }
.dg-schedArtKey {
  display: inline-block;
  margin-right: var(--s2);
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

@media (min-width: 860px) {
  .dg-ganttText {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
}

/* ---------------- caption and legend ---------------- */
.dg-cap { margin-top: var(--s6); }
.dg-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s3) var(--s6);
  list-style: none;
  margin: 0 0 var(--s4);
  padding: 0;
  font-size: var(--text-xs);
  color: var(--muted);
}
.dg-legendItem { display: inline-flex; align-items: center; gap: var(--s2); }
.dg-legendMark { width: 18px; height: 8px; border-radius: 2px; background-color: var(--accent); flex: none; }
.dg-legendItem[data-stage='before'] .dg-legendMark {
  background-color: transparent;
  border: 1px dashed var(--muted);
}
.dg-legendItem[data-stage='after'] .dg-legendMark { height: 4px; background-color: var(--muted-strong); }
.dg-legendItem[data-stage='standing'] .dg-legendMark {
  height: 2px;
  background-color: transparent;
  border-top: 2px dotted var(--border-strong);
}
.dg-capNote {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--muted);
  max-width: 74ch;
  line-height: 1.6;
}

/* ---------------- deliverables stack ---------------- */
.dg-stackFig { display: grid; gap: var(--s4); }
.dg-stack { width: 100%; height: auto; max-width: 34rem; }
.dg-sheet { fill: var(--surface); stroke: var(--border-strong); stroke-width: 1; }
.dg-sheetSpine { fill: var(--accent); }
.dg-sheetNum { font-size: 11px; letter-spacing: 0.1em; fill: var(--muted); }
.dg-sheetTag {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  fill: var(--muted);
}
.dg-sheetTitle { font-size: 15px; font-weight: 500; fill: var(--fg); }
.dg-sheetRule { stroke: var(--border-strong); stroke-width: 1; }
.dg-stackCap { max-width: 34rem; }

/* ---------------- scope boundary ---------------- */
.dg-scope { display: grid; gap: var(--s6); }
@media (min-width: 1000px) {
  .dg-scope { grid-template-columns: minmax(0, 1fr) minmax(0, 20rem); gap: var(--s8); align-items: start; }
}
.dg-scopeIn {
  border: 1px solid var(--accent);
  border-radius: var(--radius-lg);
  padding: var(--s6);
  min-width: 0;
}
@media (min-width: 768px) { .dg-scopeIn { padding: var(--s8); } }
.dg-scopeTag {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--s3);
  margin: 0 0 var(--s6);
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}
.dg-scopeCount { color: var(--muted); letter-spacing: 0.08em; }
.dg-scopeGrid { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s4); }
@media (min-width: 640px) { .dg-scopeGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.dg-scopeCell {
  min-width: 0;
  padding: var(--s4);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background-color: var(--surface);
}
.dg-scopeNum { display: block; font-size: var(--text-xs); color: var(--accent); margin-bottom: var(--s2); }
.dg-scopeName { margin: 0; font-size: var(--text-base); font-weight: 500; color: var(--fg); }
.dg-scopeBody { margin: var(--s2) 0 0; font-size: var(--text-sm); color: var(--muted); line-height: 1.55; }
.dg-scopeOut {
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  padding: var(--s6);
  min-width: 0;
}
.dg-scopeTag--out { color: var(--muted); }
.dg-scopeOutQ { margin: 0; font-size: var(--text-base); font-weight: 500; color: var(--muted-strong); }
.dg-scopeOutA { margin: var(--s3) 0 0; font-size: var(--text-sm); color: var(--muted); line-height: 1.6; }

/* ---------------- console frame ---------------- */
.dg-console { display: grid; gap: var(--s8); align-items: start; }
@media (min-width: 1000px) {
  .dg-console { grid-template-columns: minmax(0, 7fr) minmax(0, 12fr); gap: var(--s12); }
}
.dg-consoleSay { min-width: 0; }
.dg-consoleTitle { margin: var(--s3) 0 0; font-size: var(--text-xl); }
.dg-consoleBody { margin: var(--s4) 0 0; color: var(--muted-strong); max-width: 46ch; }
.dg-consoleArt { min-width: 0; }

@media print {
  .dg-gantt { display: none; }
  .dg-ganttText { position: static; width: auto; height: auto; margin: 0; clip-path: none; white-space: normal; }
}
`

export function DiagramStyles() {
  return (
    <style href="envenox-service-diagrams" precedence="default">
      {DIAGRAM_CSS}
    </style>
  )
}
