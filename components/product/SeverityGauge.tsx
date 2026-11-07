/**
 * SeverityGauge - SVG arc gauge plus the severity breakdown behind it.
 *
 * Server Component. Pure SVG, no charting library.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * THE ARC MATHS (derived, not guessed)
 *
 *   viewBox        0 0 128 128
 *   centre         cx = 64, cy = 64
 *   radius         r  = 54          (leaves 10px for a 9px stroke + 0.5 bleed)
 *   CIRCUMFERENCE  C  = 2 × π × r
 *                     = 2 × π × 54
 *                     = 339.29200658769764  user units
 *
 * The value arc is a real `<path>` whose geometry STOPS at the value, rather
 * than a full circle masked by a dash gap. Its own length is therefore
 *
 *   L = fraction × C = 0.8180540919 × 339.29200658769764 = 277.5676…
 *
 * which lets the stock `drawStroke` keyframe from globals.css animate it
 * exactly, with no bespoke keyframe:
 *
 *   stroke-dasharray : L L        → one dash of L, then a gap of L
 *   --dash           : L          → drawStroke runs dashoffset L → 0
 *
 *   at offset L  the dash occupies [−L, 0) - entirely before the path origin -
 *                and the gap covers all L units of path. Nothing renders.
 *   at offset 0  the dash covers [0, L) - the whole path. Fully rendered.
 *
 * `transform="rotate(-90 64 64)"` turns SVG's 0° (3 o'clock) into 12 o'clock,
 * so the arc fills clockwise from the top.
 *
 * It draws ONCE on reveal, via `animation … both`. Never on hover.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * ACCESSIBILITY. The `<svg>` is `role="img"` with an `aria-label` that states
 * the whole finding in words, and every number in the graphic is ALSO rendered
 * as text beside it - the percentage, both counts, and the full per-severity
 * breakdown with counts and shares. Nothing here depends on the graphic.
 */

import { ChartPie } from 'lucide-react'
import {
  CAPTIONS,
  ESTATE,
  GAUGE,
  SEVERITY_DISTRIBUTION,
  SEVERITY_LABEL,
  SEVERITY_TOTAL,
} from '@/lib/product-fixtures'
import { SeverityBadge, enterDelay, sevClass } from './Severity'
import { Reveal } from '@/components/ui/Reveal'
import s from './product.module.css'

/* ------------------------------------------------------------ arc maths --- */

const CX = 64
const CY = 64
const R = 54
/** C = 2πr = 339.29200658769764 user units. See the header comment. */
const CIRCUMFERENCE = 2 * Math.PI * R

const round = (n: number) => Math.round(n * 1000) / 1000

/** Polar → Cartesian in SVG's y-down space. 0° is 3 o'clock, before rotation. */
function polar(deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180
  return [round(CX + R * Math.cos(rad)), round(CY + R * Math.sin(rad))]
}

/**
 * Arc path for a fraction of a full turn, clockwise from 0°.
 * Clamped below 1 so a 100% value never degenerates into a zero-length arc
 * (start point == end point, which SVG renders as nothing at all).
 */
function arcPath(fraction: number): string {
  const f = Math.min(Math.max(fraction, 0), 0.9999)
  const sweep = f * 360
  const [x0, y0] = polar(0)
  const [x1, y1] = polar(sweep)
  const largeArc = sweep > 180 ? 1 : 0
  return `M${x0} ${y0} A${R} ${R} 0 ${largeArc} 1 ${x1} ${y1}`
}

const FRACTION = GAUGE.autoClosed / GAUGE.total
const ARC_LENGTH = FRACTION * CIRCUMFERENCE
const PERCENT = (FRACTION * 100).toFixed(2)

const fmt = (n: number) => n.toLocaleString('en-GB')
const share = (n: number) => ((n / SEVERITY_TOTAL) * 100).toFixed(2)

/* -------------------------------------------------------------------------- */

export interface SeverityGaugeProps {
  /** REQUIRED. Pass `CAPTIONS.gauge` for the house default. */
  caption: string
  className?: string
}

export function SeverityGauge({ caption, className }: SeverityGaugeProps) {
  const resolvedCaption = caption.trim() || CAPTIONS.gauge

  const ariaLabel =
    `${PERCENT}% of signal, ${fmt(GAUGE.autoClosed)} of ${fmt(GAUGE.total)} alerts, was ` +
    `closed by correlation and suppression content before analyst review, over the ${GAUGE.window}. ` +
    `The remaining ${fmt(GAUGE.reviewed)} alerts were read by a human analyst.`

  return (
    <Reveal as="figure" className={[s.figure, className].filter(Boolean).join(' ')}>
      <div className={s.console}>
        <div className={s.titlebar}>
          <span className={s.titleGroup}>
            <ChartPie size={13} className={s.titleIcon} aria-hidden="true" />
            <span className={s.title}>Managed SIEM, Signal breakdown</span>
            <span className={s.tenant}>
              {ESTATE.tenant} · <span className="u-mono">{ESTATE.tenantRef}</span>
            </span>
          </span>
          <span className={s.titleSpacer} />
          <span className={s.titleMeta}>
            <span className="u-mono u-tnum">{GAUGE.window}</span>
          </span>
        </div>

        <div className={s.gaugeLayout}>
          {/* ------------------------------------------------------ gauge --- */}
          <div className={s.gaugeCell}>
            <div className={s.gaugeStack}>
              <svg className={s.gauge} viewBox="0 0 128 128" role="img" aria-label={ariaLabel}>
                <g transform={`rotate(-90 ${CX} ${CY})`}>
                  <circle className={s.gaugeTrack} cx={CX} cy={CY} r={R} />
                  <path
                    className={s.gaugeArc}
                    d={arcPath(FRACTION)}
                    style={
                      {
                        '--dash': `${round(ARC_LENGTH)}`,
                        strokeDasharray: `${round(ARC_LENGTH)} ${round(ARC_LENGTH)}`,
                      } as React.CSSProperties
                    }
                  />
                </g>
              </svg>

              {/* Every number in the graphic, repeated as real text. */}
              <div className={s.gaugeReadout} aria-hidden="true">
                <span className={`${s.gaugeValue} u-mono u-tnum`}>{PERCENT}%</span>
                <span className={s.gaugeUnit}>closed by content</span>
              </div>
            </div>

            <dl className={s.gaugeFacts}>
              <div className={s.kvRow}>
                <dt className={s.gaugeFactKey}>Closed before review</dt>
                <dd className={`${s.gaugeFactVal} u-mono u-tnum`}>{fmt(GAUGE.autoClosed)}</dd>
              </div>
              <div className={s.kvRow}>
                <dt className={s.gaugeFactKey}>Read by an analyst</dt>
                <dd className={`${s.gaugeFactVal} u-mono u-tnum`}>{fmt(GAUGE.reviewed)}</dd>
              </div>
              <div className={s.kvRow}>
                <dt className={s.gaugeFactKey}>Total signal</dt>
                <dd className={`${s.gaugeFactVal} u-mono u-tnum`}>{fmt(GAUGE.total)}</dd>
              </div>
            </dl>
          </div>

          {/* -------------------------------------------------- breakdown --- */}
          <div className={s.breakdownCell}>
            <p className={s.sectionLabel}>By severity, {GAUGE.window}</p>
            <div className={s.breakdown} role="table" aria-label="Alert count by severity">
              <div className={s.head} role="row">
                <span className={s.headCell} role="columnheader">
                  Severity
                </span>
                <span className={`${s.headCell} ${s.headCellRight}`} role="columnheader">
                  Alerts
                </span>
                <span className={`${s.headCell} ${s.headCellRight}`} role="columnheader">
                  Share
                </span>
                <span className={s.headCell} role="columnheader">
                  <span className={s.srOnly}>Proportion, drawn</span>
                </span>
              </div>

              {SEVERITY_DISTRIBUTION.map((d, i) => (
                <div
                  className={`${s.row} ${s.rowHover} ${sevClass[d.severity]}`}
                  role="row"
                  key={d.severity}
                  style={enterDelay(i)}
                >
                  <span className={`${s.cell} ${s.railCell}`} role="cell">
                    <SeverityBadge severity={d.severity} srPrefix="Severity" />
                  </span>
                  <span className={`${s.cell} ${s.cellRight} u-mono u-tnum`} role="cell">
                    {fmt(d.count)}
                  </span>
                  <span className={`${s.cell} ${s.cellRight} u-mono u-tnum`} role="cell">
                    {share(d.count)}%
                  </span>
                  <span className={s.cell} role="cell">
                    {/* Decoration only, the count and share above are the data.
                        Width is a STATIC inline value; it is never animated. */}
                    <span className={s.barTrack} aria-hidden="true">
                      <span
                        className={s.barFill}
                        style={{ width: `${Math.max(Number(share(d.count)), 0.6)}%` }}
                      />
                    </span>
                  </span>
                </div>
              ))}
            </div>

            <p className={s.caption}>
              Shares are rounded to two decimal places and therefore sum to{' '}
              <span className="u-mono u-tnum">100.01%</span>, not{' '}
              <span className="u-mono u-tnum">100.00%</span>. Counts are exact:{' '}
              {SEVERITY_DISTRIBUTION.map((d) => `${d.count} ${SEVERITY_LABEL[d.severity]}`).join(
                ', ',
              )}
              .
            </p>
          </div>
        </div>

        <div className={s.statusbar}>
          <span className={s.statusItem}>
            Correlation rules <span className="u-mono u-tnum">1,412</span> active
          </span>
          <span className={s.statusItem}>
            Suppressions <span className="u-mono u-tnum">287</span> · reviewed monthly
          </span>
          <span className={s.statusSpacer} />
          <span className={s.statusItem}>
            Content release <span className="u-mono">2026.10.2</span>
          </span>
        </div>
      </div>
      <figcaption className={s.caption}>{resolvedCaption}</figcaption>
    </Reveal>
  )
}
