/**
 * ReleaseHealth - stylised view of what happened after the code shipped.
 *
 * Server Component. No charting library: both plots are inline SVG built from
 * `DEPLOY_DAYS` by the helpers below. A charting dependency for 28 points is
 * 40 kB to draw fourteen rectangles and one polyline.
 *
 * THERE IS NO AVERAGE LATENCY ON THIS PANEL, ANYWHERE.
 * A mean response time is a tell. It hides the tail, and the tail is the
 * product: nobody is harmed by the median request, they are harmed by the p99
 * one. So every route reports p50, p95 and p99, and the one route whose p99 is
 * 4.1 seconds carries the ticket number that exists because of it - NWL-4495,
 * which is on the sprint board, in the same sprint, pointed.
 *
 * ROLLBACKS ARE MARKED, NOT OMITTED.
 * Two releases in the window were rolled back. Both are drawn on the error-rate
 * plot as a marker, and both are written out underneath with the cause, the
 * time to restore and the ticket - because a release-health panel with no
 * rollbacks on it is either a very short window or a lie. The 2026-10-12 event
 * is ticket NWL-4489, which is `In progress` on the board.
 *
 * DUAL PLOT, SEPARATE SCALES, BOTH DECLARED. Deploys per day and 5xx share an
 * x-axis but nothing else, so they are drawn as two plots side by side rather
 * than as one chart with a hidden second axis. An undeclared dual axis is how
 * charts lie.
 *
 * ACCESSIBILITY. Both plots are `aria-hidden`; the accessible representation is
 * the visually-hidden table below them, which carries all 14 days of both
 * series. That is reachable data rather than a described picture. Weekends are
 * drawn at a lower tint AND named in the table, so "the gaps are weekends"
 * never depends on the tint.
 */

import { Activity, Clock, Rocket, Undo2 } from 'lucide-react'
import {
  CAPTIONS,
  DEPLOY_DAYS,
  ESTATE,
  LATENCY_ROWS,
  RELEASE_WINDOW,
  ROLLBACKS,
  type LatencyRow,
} from '@/lib/product-fixtures'
import { SeverityBadge, enterDelay, sevClass } from './Severity'
import { Reveal } from '@/components/ui/Reveal'
import s from './product.module.css'
import d from './delivery.module.css'

/* ----------------------------------------------------------- chart maths --- */

/**
 * User-space plot box, scaled UNIFORMLY (no `preserveAspectRatio="none"`).
 * Authored wide - 600x160 - so uniform scaling still yields a console strip at
 * the half-width each plot gets inside the console.
 *
 * Uniform scaling is a correctness requirement, not a preference: a non-uniform
 * stretch misrepresents the SLOPE of the error line, and it would also break
 * the stroke-dasharray maths below, which is measured in user units.
 */
const PLOT = { w: 600, h: 160, padX: 4, padTop: 10, padBottom: 4 } as const
const INNER_H = PLOT.h - PLOT.padTop - PLOT.padBottom
const INNER_W = PLOT.w - PLOT.padX * 2
const N = DEPLOY_DAYS.length

const DEPLOY_MAX = Math.max(...DEPLOY_DAYS.map((day) => day.deploys)) * 1.1
const ERROR_MAX = Math.max(...DEPLOY_DAYS.map((day) => day.errorPct)) * 1.15

const SLOT = INNER_W / N
const BAR_W = SLOT * 0.62

const round = (n: number) => Math.round(n * 100) / 100

/** Bar x, left edge - bars sit in the middle of their slot. */
const barX = (i: number) => round(PLOT.padX + i * SLOT + (SLOT - BAR_W) / 2)
const barY = (value: number) => round(PLOT.padTop + INNER_H - (value / DEPLOY_MAX) * INNER_H)
const barH = (value: number) => Math.max(round((value / DEPLOY_MAX) * INNER_H), 1)

/** Line x - points sit at slot centres so the two plots align on the same days. */
const lineX = (i: number) => round(PLOT.padX + i * SLOT + SLOT / 2)
const lineY = (value: number) => round(PLOT.padTop + INNER_H - (value / ERROR_MAX) * INNER_H)

const errorLine = DEPLOY_DAYS.map(
  (day, i) => `${i === 0 ? 'M' : 'L'}${lineX(i)} ${lineY(day.errorPct)}`,
).join(' ')

const errorArea = `${errorLine} L${lineX(N - 1)} ${round(PLOT.padTop + INNER_H)} L${lineX(
  0,
)} ${round(PLOT.padTop + INNER_H)} Z`

/**
 * Stroke-draw normalisation. `drawStroke` in globals.css animates
 * stroke-dashoffset from `var(--dash)` to 0, so the dash pattern must be one
 * dash of the path's length L followed by a gap of L: at offset L nothing
 * renders, at offset 0 the dash covers the path exactly.
 *
 * L is SUMMED FROM THE PATH'S OWN SEGMENTS in user units, because
 * `getTotalLength()` needs a DOM and this component never reaches the client.
 * That sum is only true while the viewBox scales uniformly and the stroke
 * scales with it - hence no `preserveAspectRatio="none"` and no
 * `vector-effect: non-scaling-stroke` on the line below.
 */
const errorLength = DEPLOY_DAYS.reduce((total, day, i) => {
  if (i === 0) return 0
  const dx = lineX(i) - lineX(i - 1)
  const dy = lineY(day.errorPct) - lineY(DEPLOY_DAYS[i - 1]!.errorPct)
  return total + Math.hypot(dx, dy)
}, 0)

const DEPLOY_PEAK = Math.max(...DEPLOY_DAYS.map((day) => day.deploys))
const ERROR_PEAK = Math.max(...DEPLOY_DAYS.map((day) => day.errorPct))
const WEEKEND_DAYS = DEPLOY_DAYS.filter((day) => day.weekend).length

/* -------------------------------------------------------------------------- */

export interface ReleaseHealthProps {
  /** REQUIRED. Pass `CAPTIONS.release` for the house default. */
  caption: string
  className?: string
}

export function ReleaseHealth({ caption, className }: ReleaseHealthProps) {
  const resolvedCaption = caption.trim() || CAPTIONS.release

  return (
    <Reveal as="figure" className={[s.figure, className].filter(Boolean).join(' ')}>
      <div className={s.console}>
        <div className={s.titlebar}>
          <span className={s.titleGroup}>
            <Activity size={13} className={s.titleIcon} aria-hidden="true" />
            <span className={s.title}>Release health, {RELEASE_WINDOW.service}</span>
            <span className={s.tenant}>
              {RELEASE_WINDOW.environment} · {ESTATE.tenant}
            </span>
          </span>
          <span className={s.titleSpacer} />
          <span className={s.titleMeta}>
            <Clock size={11} aria-hidden="true" />
            <span className="u-mono u-tnum">{RELEASE_WINDOW.label}</span>
          </span>
        </div>

        <div className={s.toolbar}>
          <span className={s.count}>
            <span className={`${s.countNum} u-mono u-tnum`}>{RELEASE_WINDOW.deploys}</span>{' '}
            production deploys · median{' '}
            <span className="u-mono u-tnum">{RELEASE_WINDOW.medianPerDay}</span> a day
          </span>
          <span className={s.titleSpacer} />
          <span className={s.search}>
            <Rocket size={11} aria-hidden="true" />
            <span className="u-mono">{RELEASE_WINDOW.current}</span>
          </span>
        </div>

        {/* ------------------------------------------------------- the two plots --- */}
        <div className={d.chartPair}>
          <div className={d.chartCell}>
            <span className={d.chartHead}>
              <span className={d.chartTitle}>Production deploys per day</span>
              <span className={s.titleSpacer} />
              <span className="u-mono u-tnum">peak {DEPLOY_PEAK}</span>
            </span>
            <svg
              className={d.plot}
              viewBox={`0 0 ${PLOT.w} ${PLOT.h}`}
              aria-hidden="true"
              focusable="false"
            >
              {DEPLOY_DAYS.map((day, i) => (
                <rect
                  key={day.date}
                  className={[
                    day.rollback ? d.barRollback : day.weekend ? d.barWeekend : d.bar,
                    day.rollback ? sevClass.high : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  x={barX(i)}
                  y={barY(day.deploys)}
                  width={round(BAR_W)}
                  height={barH(day.deploys)}
                  style={enterDelay(i)}
                />
              ))}
            </svg>
            <span className={d.scaleRow}>
              <span className={d.scaleKey}>
                <span className={d.keySwatch} aria-hidden="true" />
                Working day
              </span>
              <span className={d.scaleKey}>
                <span className={`${d.keySwatch} ${d.keySwatchWeekend}`} aria-hidden="true" />
                Weekend ({WEEKEND_DAYS} of {N})
              </span>
              <span className={`${d.scaleKey} ${sevClass.high}`}>
                <span className={`${d.keySwatch} ${d.keySwatchSev}`} aria-hidden="true" />
                Day with a rollback ({ROLLBACKS.length})
              </span>
            </span>
            <span className={d.axis}>
              <span className="u-mono u-tnum">{DEPLOY_DAYS[0]!.at}</span>
              <span className="u-mono u-tnum">{DEPLOY_DAYS[N - 1]!.at}</span>
            </span>
          </div>

          <div className={`${d.chartCell} ${sevClass.high}`}>
            <span className={d.chartHead}>
              <span className={d.chartTitle}>Server errors, share of requests</span>
              <span className={s.titleSpacer} />
              <span className="u-mono u-tnum">peak {ERROR_PEAK.toFixed(2)}%</span>
            </span>
            <svg
              className={d.plot}
              viewBox={`0 0 ${PLOT.w} ${PLOT.h}`}
              aria-hidden="true"
              focusable="false"
            >
              <path className={d.errArea} d={errorArea} />
              <path
                className={d.errLine}
                d={errorLine}
                strokeDasharray={`${round(errorLength)} ${round(errorLength)}`}
                style={{ ['--dash' as string]: round(errorLength) }}
              />
              {/* Rollback markers: a dashed vertical at each day a release was
                  withdrawn. The events are also written out in full below, so
                  the marker is a locator rather than the record. */}
              {DEPLOY_DAYS.map((day, i) =>
                day.rollback ? (
                  <line
                    key={day.date}
                    className={d.markerLine}
                    x1={lineX(i)}
                    x2={lineX(i)}
                    y1={PLOT.padTop}
                    y2={PLOT.padTop + INNER_H}
                  />
                ) : null,
              )}
            </svg>
            <span className={d.scaleRow}>
              <span className={d.scaleKey}>
                <span className={d.keyRule} aria-hidden="true" />
                5xx as a share of all requests, daily
              </span>
              <span className={d.scaleKey}>Scale 0 to {(ERROR_MAX * 1).toFixed(2)}%</span>
            </span>
            <span className={d.axis}>
              <span className="u-mono u-tnum">{DEPLOY_DAYS[0]!.at}</span>
              <span className="u-mono u-tnum">{DEPLOY_DAYS[N - 1]!.at}</span>
            </span>
          </div>
        </div>

        {/* The accessible representation of both plots: the data, not a
            description of it. Visually hidden, inside a positioned scroller so
            it cannot escape and widen the page. */}
        <div className={d.srHost}>
          <table className={s.srOnly}>
            <caption>
              Production deploys and server-error share by day, {RELEASE_WINDOW.label}
            </caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Deploys</th>
                <th scope="col">Server errors, share of requests</th>
                <th scope="col">Day type</th>
              </tr>
            </thead>
            <tbody>
              {DEPLOY_DAYS.map((day) => (
                <tr key={day.date}>
                  <th scope="row">{day.date}</th>
                  <td>{day.deploys}</td>
                  <td>{day.errorPct.toFixed(2)}%</td>
                  <td>
                    {day.weekend ? 'Weekend' : 'Working day'}
                    {day.rollback ? ', release rolled back' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ----------------------------------------------------- latency by route --- */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Latency by route, p50, p95, p99</span>
            <span className={s.titleSpacer} />
            <span className={s.titleMeta}>
              <span>{RELEASE_WINDOW.slo}</span>
              <span>· error budget {RELEASE_WINDOW.errorBudget}</span>
            </span>
          </div>

          <div
            className={`${s.scrollerUnmasked} ${d.latScroll}`}
            role="group"
            aria-label="Latency percentiles by route, scrolls horizontally"
            tabIndex={0}
          >
            <div
              className={`${s.table} ${d.latTable}`}
              role="table"
              aria-label="Latency percentiles by route"
            >
              <div className={s.head} role="row">
                <span className={s.headCell} role="columnheader">
                  Method
                </span>
                <span className={s.headCell} role="columnheader">
                  Route
                </span>
                <span className={`${s.headCell} ${s.headCellRight}`} role="columnheader">
                  p50
                </span>
                <span className={`${s.headCell} ${s.headCellRight}`} role="columnheader">
                  p95
                </span>
                <span className={`${s.headCell} ${s.headCellRight}`} role="columnheader">
                  p99
                </span>
                <span className={`${s.headCell} ${s.headCellRight}`} role="columnheader">
                  Req / min
                </span>
                <span className={s.headCell} role="columnheader">
                  Note
                </span>
              </div>
              {LATENCY_ROWS.map((row, i) => (
                <LatencyTableRow key={row.route} row={row} index={i} />
              ))}
            </div>
          </div>

          <div className={s.panelBody}>
            <p className={s.panelProse}>
              No mean appears on this panel. A mean latency hides the tail, and the tail is the
              product, the <span className="u-mono">4,112 ms</span> p99 on{' '}
              <span className="u-mono">/v2/consignments/summary</span> is invisible in an average
              that a <span className="u-mono">14,480</span>-requests-a-minute tracking endpoint
              dominates. It is also why <span className="u-mono">NWL-4495</span> is pointed into
              the current sprint rather than noted in a quarterly review.
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------- the rollbacks --- */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <Undo2 size={12} className={s.titleIcon} aria-hidden="true" />
            <span className={s.panelTitle}>Releases withdrawn in the window</span>
            <span className={s.titleSpacer} />
            <span className={s.titleMeta}>
              <span className="u-mono u-tnum">{ROLLBACKS.length}</span> of{' '}
              <span className="u-mono u-tnum">{RELEASE_WINDOW.deploys}</span> deploys
            </span>
          </div>
          <div className={s.panelBody}>
            <ul className={d.noteList}>
              {ROLLBACKS.map((event, i) => (
                <li
                  key={event.release}
                  className={`${d.noteRow} ${sevClass[event.severity]}`}
                  style={enterDelay(i)}
                >
                  <SeverityBadge severity={event.severity} srPrefix="Impact" />
                  <span className="u-mono u-tnum">
                    {event.date} {event.at} UTC
                  </span>
                  <span className={s.strong}>
                    release <span className="u-mono">{event.release}</span> →{' '}
                    <span className="u-mono">{event.rolledBackTo}</span>
                  </span>
                  <span className="u-mono u-tnum">restored in {event.restoredIn}</span>
                  <span className="u-mono">{event.ticket}</span>
                  <span className={d.noteText}>{event.cause}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={s.statusbar}>
          <span className={s.statusItem}>
            Service <span className="u-mono">{RELEASE_WINDOW.service}</span>
          </span>
          <span className={s.statusItem}>
            Change record <span className="u-mono">{ESTATE.incident.change}</span>
          </span>
          <span className={s.statusSpacer} />
          <span className={s.statusItem}>
            Percentiles over{' '}
            <span className="u-mono u-tnum">{RELEASE_WINDOW.label}</span>, 1-minute buckets
          </span>
        </div>
      </div>
      <figcaption className={s.caption}>{resolvedCaption}</figcaption>
    </Reveal>
  )
}

/* -------------------------------------------------------------------------- */

function LatencyTableRow({ row, index }: { row: LatencyRow; index: number }) {
  const flagged = row.severity !== undefined

  return (
    <div
      className={`${s.row} ${s.rowHover} ${flagged ? sevClass[row.severity!] : ''}`}
      role="row"
      style={enterDelay(index)}
    >
      <span className={`${s.cell} ${s.railCell} u-mono`} role="cell">
        {row.method}
      </span>
      <span className={`${s.cell} u-mono`} role="cell">
        <span className={s.cellTruncate} title={row.route}>
          {row.route}
        </span>
      </span>
      <span className={`${s.cell} ${s.cellRight} u-mono u-tnum`} role="cell">
        {row.p50}
      </span>
      <span className={`${s.cell} ${s.cellRight} u-mono u-tnum`} role="cell">
        {row.p95}
      </span>
      <span className={`${s.cell} ${s.cellRight} u-mono u-tnum`} role="cell">
        {row.p99}
      </span>
      <span className={`${s.cell} ${s.cellRight} u-mono u-tnum`} role="cell">
        {row.rpm}
      </span>
      <span className={s.cell} role="cell">
        {flagged ? (
          <>
            <SeverityBadge severity={row.severity!} srPrefix="Tail latency" />
            <span className="u-mono">{row.ticket}</span>
          </>
        ) : (
          <span className={s.muted}>Within budget</span>
        )}
      </span>
    </div>
  )
}
