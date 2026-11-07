/**
 * ROUTE-PRIVATE CHARTS for /case-studies/**.
 *
 * A case study carries three metrics and an engagement timeline, and until now
 * both were typeset as text and nothing else. The two components here draw
 * them - from the study's OWN numbers, parsed out of the strings in
 * `lib/case-studies.ts`, never from a shape invented to look good.
 *
 *   <MetricChart>    the three metrics, each drawn in the form its own number
 *                    actually takes: a before/after pair, a share, a severity
 *                    split, a value against a stated target or tolerance, or -
 *                    where the number is a single count - no chart at all,
 *                    because one number is not a chart.
 *   <EngagementBand> `timeline` as a real band. Segments whose length is stated
 *                    as a duration are laid end to end and scaled; segments
 *                    stated as a position ("month 11") are drawn as milestones
 *                    on the same axis. The distinction is read from the string:
 *                    a number BEFORE the unit is a duration, a number AFTER it
 *                    is a date.
 *
 * ACCESSIBILITY. Every `<svg>` is `role="img"` with an `aria-label` stating the
 * finding in words, and every number drawn is also rendered as DOM text beside
 * the graphic at every width. Nothing here needs JavaScript and nothing here
 * animates, so reduced motion changes nothing.
 *
 * HONESTY RULES, enforced in code rather than remembered:
 *   - two bars are only drawn to one scale when both sides are in the same
 *     unit, or both are durations and can be converted exactly;
 *   - a bar never renders at zero width, so a tiny value stays visible - and
 *     the exact figure is printed on it, so the minimum width cannot mislead;
 *   - a metric the parser cannot read is typeset, not guessed at.
 */

import type { CaseStudy, Metric } from '@/lib/case-studies'

/* ========================================================================== *
 * 1. READING A METRIC
 * ========================================================================== */

/** Minutes per unit - the common base for any duration comparison. */
const MINUTES: Record<string, number> = {
  sec: 1 / 60,
  second: 1 / 60,
  min: 1,
  minute: 1,
  hr: 60,
  hour: 60,
  day: 1440,
  week: 10080,
  sprint: 20160,
  month: 43800,
  year: 525600,
}

const DURATION_RE = '(?:sec|second|min|minute|hr|hour|day|week|sprint|month|year)'

type Figure = {
  /** Exactly as the data writes it. This is what gets printed. */
  raw: string
  /** Numeric part, or null where there is not one. */
  n: number | null
  /** Lower-case singular unit word, or null. */
  unit: string | null
}

function readFigure(raw: string): Figure {
  const text = raw.trim()
  const m = /(-?[\d][\d,]*(?:\.\d+)?)\s*([a-z%]+)?/i.exec(text)
  if (!m) return { raw: text, n: null, unit: null }
  const n = Number(m[1].replace(/,/g, ''))
  const unit = m[2] ? m[2].toLowerCase().replace(/s$/, '') : null
  return { raw: text, n: Number.isFinite(n) ? n : null, unit }
}

/** Both figures on one scale, or null where putting them on one would lie. */
function comparable(a: Figure, b: Figure): { a: number; b: number } | null {
  if (a.n === null || b.n === null) return null
  const au = a.unit
  const bu = b.unit
  if (au === bu) return { a: a.n, b: b.n }
  if (au && bu && MINUTES[au] && MINUTES[bu]) {
    return { a: a.n * MINUTES[au], b: b.n * MINUTES[bu] }
  }
  // One side carries a unit and the other does not ("1,840 → 210" style counts
  // where only one side repeats the noun). Same dimension, so same scale.
  if (!au || !bu) return { a: a.n, b: b.n }
  return null
}

type Shape =
  | { kind: 'pair'; from: Figure; to: Figure; scale: { a: number; b: number } | null }
  | { kind: 'share'; pct: number }
  | { kind: 'severity'; parts: { n: number; sev: string }[] }
  | { kind: 'target'; value: Figure; target: Figure; lowerIsBetter: boolean }
  | { kind: 'zeroOf'; of: number; ofLabel: string }
  | { kind: 'point'; figure: Figure }

const SEVERITY_WORDS = ['critical', 'high', 'medium', 'low'] as const

/**
 * Decide what kind of chart this metric is, in a fixed order. The note is read
 * as well as the value, because several of these studies put the comparison
 * there: "6 days / median time from confirmation to production fix / Down from
 * 38 days at engagement start" is a before-and-after written across two fields.
 */
export function readMetric(metric: Metric): Shape {
  const value = metric.value.trim()
  const note = (metric.note ?? '').trim()

  /* a. an explicit before → after */
  const arrow = /^(.+?)\s*(?:→|->)\s*(.+)$/.exec(value)
  if (arrow) {
    const from = readFigure(arrow[1])
    const to = readFigure(arrow[2])
    return { kind: 'pair', from, to, scale: comparable(from, to) }
  }

  /* b. a severity split: "0 critical, 2 high" */
  const sevMatches = [...value.matchAll(/(\d+)\s*(critical|high|medium|low)\b/gi)]
  if (sevMatches.length > 0) {
    return {
      kind: 'severity',
      parts: sevMatches.map((m) => ({ n: Number(m[1]), sev: m[2].toLowerCase() })),
    }
  }

  /* c. a share of a whole */
  const pct = /^(\d+(?:\.\d+)?)\s*%$/.exec(value)
  if (pct) return { kind: 'share', pct: Number(pct[1]) }

  const figure = readFigure(value)

  /* d. a comparison the note carries: "Down from 38 days at engagement start" */
  const fromNote = new RegExp(`\\b(?:down|up)\\s+from\\s+([\\d][\\d,]*(?:\\.\\d+)?\\s*${DURATION_RE}s?)`, 'i').exec(note)
  if (fromNote) {
    const from = readFigure(fromNote[1])
    return { kind: 'pair', from, to: figure, scale: comparable(from, figure) }
  }

  /* e. a value against a tolerance or a contractual target, both stated */
  const tolerance = /\btolerance of\s*([£$€]?\s*[\d][\d,]*(?:\.\d+)?)/i.exec(note)
  if (tolerance) {
    const target = readFigure(tolerance[1].replace(/\s/g, ''))
    return { kind: 'target', value: figure, target, lowerIsBetter: true }
  }
  const against = new RegExp(`\\bagainst\\s+a\\s+([\\d][\\d,]*(?:\\.\\d+)?)[\\s-]*(${DURATION_RE})`, 'i').exec(note)
  if (against) {
    const target = readFigure(`${against[1]} ${against[2]}`)
    return { kind: 'target', value: figure, target, lowerIsBetter: true }
  }

  /* f. a zero measured across a stated population: "Across 71 findings …" */
  if (figure.n === 0) {
    const across = /\bacross\s+([\d][\d,]*)\s+([a-z][a-z ]*?)\b/i.exec(note)
    if (across) {
      const of = Number(across[1].replace(/,/g, ''))
      if (of > 1) return { kind: 'zeroOf', of, ofLabel: across[2].trim() }
    }
  }

  /* g. one number. One number is not a chart, and drawing it as one is the
        exact move this whole file exists to avoid. */
  return { kind: 'point', figure }
}

/* ========================================================================== *
 * 2. THE METRIC CHART
 * ========================================================================== */

const CW = 300 // chart viewBox width
const CH = 56 // chart viewBox height
const BAR = 13

const fmt = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 2 })

function barWidths(a: number, b: number): [number, number] {
  const max = Math.max(a, b, 1)
  return [Math.max(3, (a / max) * CW), Math.max(3, (b / max) * CW)]
}

/**
 * The figure printed against a bar.
 *
 * After the bar when it fits inside the chart; inside the bar, right-aligned
 * and in the ground colour, when it does not. Clamping it to the chart edge
 * instead - which is what this did first - prints a --muted-strong figure on
 * top of a --muted bar, and "9 days" on the full-width bar of a 9 days to 2
 * days comparison was the least legible thing on the page.
 *
 * 6.2 is the advance width of the mono face at 11px, measured.
 */
function barFigure(text: string, barEnd: number, y: number, cls = 'mc-barText') {
  const width = text.length * 6.2
  if (barEnd + 7 + width <= CW) {
    return (
      <text className={cls} x={barEnd + 7} y={y}>
        {text}
      </text>
    )
  }
  return (
    <text className={`${cls} mc-barText--on`} x={Math.max(barEnd - 6, 6)} y={y} textAnchor="end">
      {text}
    </text>
  )
}

/**
 * "35 → 9" reads as a 74% reduction. Stated only when it is calculable.
 *
 * The decimal is not fussiness: 11 days → 40 minutes is a 99.7% reduction, and
 * rounding that to "100% lower" claims the figure reached zero, which it did
 * not. Anything in the last half-percent keeps a decimal place.
 */
function deltaSentence(a: number, b: number): string | null {
  if (!(a > 0) || !Number.isFinite(b)) return null
  if (a === b) return null
  const raw = Math.abs((b - a) / a) * 100
  if (!Number.isFinite(raw) || raw < 0.5) return null
  const pct = raw > 99 && raw < 100 ? raw.toFixed(1) : String(Math.round(raw))
  return b < a ? `${pct}% lower` : `${pct}% higher`
}

function MetricFigure({ metric, shape }: { metric: Metric; shape: Shape }) {
  switch (shape.kind) {
    case 'pair': {
      if (!shape.scale) {
        return (
          <p className="mc-nochart">
            Before and after are stated in different units, so they are not drawn to one scale.
          </p>
        )
      }
      const [wa, wb] = barWidths(shape.scale.a, shape.scale.b)
      const delta = deltaSentence(shape.scale.a, shape.scale.b)
      return (
        <svg
          className="mc-svg"
          viewBox={`0 0 ${CW} ${CH}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${metric.label}: ${shape.from.raw} before, ${shape.to.raw} after${delta ? `, ${delta}` : ''}. Both bars are drawn to one scale.`}
        >
          <rect className="mc-barFrom" x={0} y={6} width={wa} height={BAR} rx={2} />
          {barFigure(shape.from.raw, wa, 6 + BAR - 2)}
          <rect className="mc-barTo" x={0} y={33} width={wb} height={BAR} rx={2} />
          {barFigure(shape.to.raw, wb, 33 + BAR - 2, 'mc-barText mc-barText--to')}
        </svg>
      )
    }

    case 'share': {
      const w = Math.max(3, (shape.pct / 100) * CW)
      return (
        <svg
          className="mc-svg"
          viewBox={`0 0 ${CW} ${CH}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${metric.label}: ${shape.pct} per cent of the whole. The track is 100 per cent.`}
        >
          <rect className="mc-track" x={0} y={16} width={CW} height={BAR} rx={2} />
          <rect className="mc-fill" x={0} y={16} width={w} height={BAR} rx={2} />
          <line className="mc-rule" x1={0} y1={16 + BAR + 6} x2={CW} y2={16 + BAR + 6} />
          <text className="mc-axis" x={0} y={16 + BAR + 18}>
            0%
          </text>
          <text className="mc-axis" x={CW} y={16 + BAR + 18} textAnchor="end">
            100%
          </text>
          {barFigure(`${shape.pct}%`, w, 16 + BAR - 2)}
        </svg>
      )
    }

    case 'severity': {
      // Severity is NEVER colour alone: every chip prints the word and the
      // count, and the colour is one more cue on top of them.
      return (
        <ul className="mc-sev" aria-label={`${metric.label}, by severity`}>
          {shape.parts.map((p) => (
            <li className="mc-sevChip" data-sev={p.sev} key={p.sev}>
              <span className="mc-sevDot" aria-hidden="true" />
              <span className="mc-sevN u-tnum">{p.n}</span>
              <span className="mc-sevWord">{p.sev}</span>
            </li>
          ))}
        </ul>
      )
    }

    case 'target': {
      const scale = comparable(shape.value, shape.target)
      if (!scale || !(scale.b > 0)) {
        return <p className="mc-nochart">{`Measured against ${shape.target.raw}.`}</p>
      }
      const w = Math.max(3, Math.min(1, scale.a / scale.b) * CW)
      return (
        <svg
          className="mc-svg"
          viewBox={`0 0 ${CW} ${CH}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${metric.label}: ${shape.value.raw} against a stated ${shape.lowerIsBetter ? 'ceiling' : 'target'} of ${shape.target.raw}. The full track is the ${shape.lowerIsBetter ? 'ceiling' : 'target'}.`}
        >
          <rect className="mc-track" x={0} y={16} width={CW} height={BAR} rx={2} />
          <rect className="mc-fill" x={0} y={16} width={w} height={BAR} rx={2} />
          <line className="mc-limit" x1={CW - 1} y1={10} x2={CW - 1} y2={16 + BAR + 6} />
          {barFigure(shape.value.raw, w, 16 + BAR - 2)}
          <text className="mc-axis" x={CW} y={16 + BAR + 18} textAnchor="end">
            {`${shape.target.raw} committed`}
          </text>
        </svg>
      )
    }

    case 'zeroOf': {
      return (
        <svg
          className="mc-svg"
          viewBox={`0 0 ${CW} ${CH}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${metric.label}: none, out of ${fmt(shape.of)} ${shape.ofLabel}. The empty track is the whole population.`}
        >
          <rect className="mc-track mc-track--open" x={0} y={16} width={CW} height={BAR} rx={2} />
          <line className="mc-limit" x1={1} y1={10} x2={1} y2={16 + BAR + 6} />
          <text className="mc-axis" x={6} y={16 + BAR + 18}>
            0
          </text>
          <text className="mc-axis" x={CW} y={16 + BAR + 18} textAnchor="end">
            {`${fmt(shape.of)} ${shape.ofLabel}`}
          </text>
        </svg>
      )
    }

    default:
      // Deliberately not drawn. A lone count has no second value to sit against
      // and no whole to be a share of, so every chart of it would be a shape we
      // chose rather than a shape the number has.
      return (
        <p className="mc-nochart">
          One measured count, with nothing to measure it against &mdash; so it is set, not drawn.
        </p>
      )
  }
}

export function MetricChart({
  study,
  id,
  stack = false,
}: {
  study: CaseStudy
  id?: string
  /** One per row. For the narrow results column beside the headline. */
  stack?: boolean
}) {
  const shapes = study.metrics.map(readMetric)
  return (
    <>
      <ChartStyles />
      <ul
        className={stack ? 'mc mc--stack' : 'mc'}
        id={id}
        aria-label="The three measured results, each drawn from its own figures"
      >
        {study.metrics.map((metric, i) => (
          <li className="mc-row" key={metric.label}>
            <p className="mc-value u-tnum">{metric.value}</p>
            <p className="mc-label">{metric.label}</p>
            <div className="mc-art">
              <MetricFigure metric={metric} shape={shapes[i]} />
            </div>
            {metric.note ? (
              <p className="mc-note u-mono">
                <span className="mc-noteKey">Measurement window</span>
                {metric.note}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  )
}

/* ========================================================================== *
 * 3. THE ENGAGEMENT BAND
 * ========================================================================== */

/** Weeks per unit. A sprint is two weeks; a month is 30.4 days. */
const WEEKS: Record<string, number> = {
  day: 1 / 7,
  week: 1,
  sprint: 2,
  month: 4.345,
  year: 52,
}

const BAND_UNIT_RE = '(?:day|week|sprint|month|year)'

type Segment =
  | { kind: 'span'; name: string; raw: string; weeks: number }
  | { kind: 'mark'; name: string; raw: string; at: number }
  | { kind: 'open'; name: string; raw: string }

export function readTimeline(timeline: string): Segment[] {
  return timeline
    .split(/\s*[·|]\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw): Segment => {
      // A number BEFORE the unit is a duration: "build 32 weeks".
      const span = new RegExp(`^(.*?)\\s*([\\d]+(?:\\.\\d+)?)\\s*(${BAND_UNIT_RE})s?$`, 'i').exec(raw)
      if (span) {
        return {
          kind: 'span',
          name: span[1].trim() || raw,
          raw,
          weeks: Number(span[2]) * WEEKS[span[3].toLowerCase()],
        }
      }
      // A number AFTER the unit is a position: "launch month 11".
      const mark = new RegExp(`^(.*?)\\s*(${BAND_UNIT_RE})\\s+([\\d]+(?:\\.\\d+)?)\\+?$`, 'i').exec(raw)
      if (mark) {
        return {
          kind: 'mark',
          name: mark[1].trim() || raw,
          raw,
          at: Number(mark[3]) * WEEKS[mark[2].toLowerCase()],
        }
      }
      return { kind: 'open', name: raw, raw }
    })
}

const BW = 1000
const BAND_Y = 74
const BAND_H = 26

export function EngagementBand({ study, id }: { study: CaseStudy; id?: string }) {
  const segments = readTimeline(study.timeline)
  const spans = segments.filter((s): s is Extract<Segment, { kind: 'span' }> => s.kind === 'span')
  const marks = segments.filter((s): s is Extract<Segment, { kind: 'mark' }> => s.kind === 'mark')

  // Durations run end to end from week zero; milestones sit at their own week.
  let cursor = 0
  const laid = spans.map((s) => {
    const at = cursor
    cursor += s.weeks
    return { ...s, at }
  })
  const total = Math.max(cursor, ...marks.map((m) => m.at), 1)
  const canDraw = laid.length >= 2

  const x = (weeks: number) => (weeks / total) * BW
  const height = BAND_Y + BAND_H + 46

  const ariaLabel =
    `Engagement timeline for this study, ${Math.round(total)} weeks end to end. ` +
    segments
      .map((s) =>
        s.kind === 'span'
          ? `${s.name}, ${s.raw.replace(s.name, '').trim()}.`
          : s.kind === 'mark'
            ? `${s.name} at ${Math.round(s.at)} weeks.`
            : `${s.name}, no fixed window.`,
      )
      .join(' ')

  // Milestone labels alternate between two rows so adjacent weeks do not
  // overprint each other - "runbook week 6 · live week 7 · purple team week 8"
  // is three ticks inside 2% of the axis.
  const markRow = (i: number) => (i % 2 === 0 ? 20 : 40)

  return (
    <>
      <ChartStyles />
      <figure className="eb" id={id}>
        {canDraw ? (
          <svg
            className="eb-svg"
            viewBox={`0 0 ${BW} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={ariaLabel}
          >
            {/* The band itself: one segment per stated duration, to scale. */}
            {laid.map((s, i) => {
              const x0 = x(s.at)
              const w = Math.max(3, x(s.weeks))
              const label = s.name
              return (
                <g key={`${s.raw}-${i}`}>
                  <rect
                    className={i % 2 === 0 ? 'eb-seg' : 'eb-seg eb-seg--alt'}
                    x={x0}
                    y={BAND_Y}
                    width={w}
                    height={BAND_H}
                  />
                  {w > 92 ? (
                    <text className="eb-segLabel" x={x0 + 8} y={BAND_Y + 17}>
                      {label.length > Math.floor(w / 7) ? `${label.slice(0, Math.floor(w / 7) - 1)}…` : label}
                    </text>
                  ) : null}
                </g>
              )
            })}

            {/* Milestones. Not durations, single moments, drawn as ticks. */}
            {marks.map((m, i) => {
              const mx = Math.min(Math.max(x(m.at), 1), BW - 1)
              const ly = markRow(i)
              return (
                <g key={`${m.raw}-${i}`}>
                  <line className="eb-markLine" x1={mx} y1={ly + 4} x2={mx} y2={BAND_Y + BAND_H} />
                  <circle className="eb-markDot" cx={mx} cy={BAND_Y + BAND_H} r={3.5} />
                  <text
                    className="eb-markLabel"
                    x={mx < BW - 180 ? mx + 6 : mx - 6}
                    y={ly}
                    textAnchor={mx < BW - 180 ? 'start' : 'end'}
                  >
                    {m.name}
                  </text>
                </g>
              )
            })}

            {/* Axis in weeks, the unit every segment was converted into. */}
            <line className="eb-axis" x1={0} y1={BAND_Y + BAND_H + 12} x2={BW} y2={BAND_Y + BAND_H + 12} />
            <text className="eb-axisLabel" x={0} y={BAND_Y + BAND_H + 28}>
              week 0
            </text>
            <text className="eb-axisLabel" x={BW} y={BAND_Y + BAND_H + 28} textAnchor="end">
              {`week ${Math.round(total)}`}
            </text>
          </svg>
        ) : null}

        {/* The same information as DOM text, at every width. Below 760px this
            list IS the timeline and the drawn band is not rendered, so there is
            nothing wide enough to push the page sideways. */}
        <ol className="eb-list">
          {segments.map((s, i) => (
            <li className="eb-item" key={`${s.raw}-${i}`} data-kind={s.kind}>
              <span className="eb-itemName">{s.name}</span>
              <span className="eb-itemWhen u-mono">
                {s.kind === 'span'
                  ? s.raw.replace(s.name, '').trim()
                  : s.kind === 'mark'
                    ? s.raw.replace(s.name, '').trim()
                    : 'no fixed window'}
              </span>
            </li>
          ))}
        </ol>

        <figcaption className="eb-cap">
          Segment length is this engagement&rsquo;s own stated duration, converted to weeks and
          drawn to one scale. A stage stated as a date rather than a length &mdash;
          &ldquo;month&nbsp;11&rdquo; &mdash; is drawn as a milestone on the same axis instead of
          being given a width it never had, and a stage with no stated end is listed below rather
          than drawn, because an open commitment has no length to draw.
        </figcaption>
      </figure>
    </>
  )
}

/* ========================================================================== *
 * 4. STYLES
 * ========================================================================== */

const CHART_CSS = `
/* ---------------- metric chart ---------------- */
.mc { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s8); }
@media (min-width: 900px) {
  .mc { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s12); }
  /* The results column beside the headline is roughly 40% of the viewport, and
     a media query measures the viewport rather than that column, so the stack
     variant opts out of the three-up grid explicitly. */
  .mc--stack { grid-template-columns: minmax(0, 1fr); gap: var(--s8); }
}
.mc-row {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding-top: var(--s4);
  border-top: 1px solid var(--border-strong);
}
.mc-value {
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug);
  color: var(--fg);
  overflow-wrap: anywhere;
}
.mc-label { margin: 0; color: var(--muted-strong); font-size: var(--text-sm); line-height: 1.5; }
.mc-art { margin-top: var(--s3); min-width: 0; }
.mc-svg { width: 100%; height: auto; max-width: 22rem; overflow: visible; }
.mc-note { margin: var(--s3) 0 0; font-size: var(--text-xs); color: var(--muted); line-height: 1.55; }
.mc-noteKey {
  display: block;
  font-size: var(--text-xs);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  /* --muted, not --border-strong: in .theme-dark --border-strong is #343840
     against a #16181B surface, which is a hairline value and not a text value.
     This matches .metric__note-key in proof.tsx, which is the same label. */
  color: var(--muted);
  margin-bottom: var(--s1);
}
.mc-nochart { margin: 0; font-size: var(--text-xs); color: var(--muted); max-width: 34ch; line-height: 1.55; }

/* The "before" bar is DATA, so it takes a text-weight neutral rather than a
   hairline one, --border-strong is a 1px value and disappears as a 13px bar
   in .theme-dark. The track behind a share is FRAME, so it takes a diluted
   version of the same neutral and stays quiet under the accent fill. */
.mc-barFrom { fill: var(--muted); }
.mc-barTo { fill: var(--accent); }
.mc-track { fill: color-mix(in oklab, var(--muted) 42%, transparent); }
.mc-track--open {
  fill: none;
  stroke: var(--muted);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}
.mc-fill { fill: var(--accent); }
.mc-limit { stroke: var(--muted); stroke-width: 1.5; }
.mc-rule { stroke: var(--border-strong); stroke-width: 1; }
.mc-barText {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 11px;
  fill: var(--muted-strong);
}
.mc-barText--to { fill: var(--fg); }
/* Printed ON a filled bar rather than after it. --bg, because every bar fill
   here (--muted, --accent) is light in the dark palettes and dark in the light
   one, exactly inverse to the ground. */
.mc-barText--on { fill: var(--bg); }
.mc-axis {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 10px;
  fill: var(--muted);
}

/* Severity: colour is the third cue, after the count and the word. */
.mc-sev { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: var(--s2); }
.mc-sevChip {
  display: inline-flex;
  align-items: baseline;
  gap: var(--s2);
  padding: var(--s1) var(--s3);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  color: var(--muted-strong);
}
.mc-sevDot { width: 8px; height: 8px; border-radius: 50%; flex: none; align-self: center; background-color: var(--muted); }
.mc-sevChip[data-sev='critical'] .mc-sevDot { background-color: var(--signal-critical); }
.mc-sevChip[data-sev='high'] .mc-sevDot { background-color: var(--signal-high); }
.mc-sevChip[data-sev='medium'] .mc-sevDot { background-color: var(--signal-medium); }
.mc-sevChip[data-sev='low'] .mc-sevDot { background-color: var(--signal-low); }
.mc-sevN { font-family: var(--font-jetbrains-mono), ui-monospace, monospace; color: var(--fg); font-size: var(--text-sm); }
.mc-sevWord { text-transform: capitalize; }

/* ---------------- engagement band ---------------- */
.eb { position: relative; margin: 0; min-width: 0; }
.eb-svg { display: none; width: 100%; height: auto; overflow: visible; }
@media (min-width: 760px) {
  .eb-svg { display: block; }
}
.eb-seg { fill: var(--accent); }
.eb-seg--alt { fill: var(--muted-strong); }
.eb-segLabel { font-size: 12px; fill: var(--accent-fg); }
.eb-seg--alt + .eb-segLabel { fill: var(--bg); }
.eb-markLine { stroke: var(--border-strong); stroke-width: 1; stroke-dasharray: 2 3; }
.eb-markDot { fill: var(--fg); }
.eb-markLabel {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 11px;
  fill: var(--muted-strong);
}
.eb-axis { stroke: var(--border-strong); stroke-width: 1; }
.eb-axisLabel {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: 10px;
  fill: var(--muted);
}

.eb-list {
  list-style: none;
  margin: var(--s6) 0 0;
  padding: 0;
  display: grid;
  gap: 0;
  border-top: 1px solid var(--border);
}
@media (min-width: 760px) {
  .eb-list { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: var(--s12); }
}
.eb-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s3);
  padding: var(--s3) 0;
  border-bottom: 1px solid var(--border);
  min-width: 0;
  font-size: var(--text-sm);
}
.eb-itemName { color: var(--fg); min-width: 0; }
.eb-itemWhen { color: var(--muted); font-size: var(--text-xs); }
.eb-item[data-kind='mark'] .eb-itemName::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--fg);
  margin-right: var(--s2);
  vertical-align: 1px;
}
.eb-cap { margin: var(--s4) 0 0; font-size: var(--text-xs); color: var(--muted); max-width: 74ch; line-height: 1.6; }
`

export function ChartStyles() {
  return (
    <style href="envenox-case-charts" precedence="default">
      {CHART_CSS}
    </style>
  )
}
