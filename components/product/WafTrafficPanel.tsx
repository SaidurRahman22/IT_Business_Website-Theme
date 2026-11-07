/**
 * WafTrafficPanel - stylised view of the hosted WAF traffic console.
 *
 * Server Component. No charting library: the chart is inline SVG built from
 * `WAF_BUCKETS` by the helpers below. A charting dependency for 24 points is
 * 40 kB to draw two polylines.
 *
 * DUAL SCALE, DECLARED. Allowed traffic peaks at ~12k per 5-minute bucket;
 * blocked peaks at ~1.9k. Plotted on one scale the blocked series would be a
 * flat line along the axis, which would be honest but useless. They are plotted
 * on two scales and BOTH MAXIMA ARE PRINTED on the chart, because an undeclared
 * dual axis is how charts lie.
 *
 * ACCESSIBILITY. The figure is `role="img"` with `<title>` and `<desc>`, and
 * every one of the 24 buckets is also in a visually-hidden `<table>` - so the
 * data is reachable, not merely described. The chart itself is `aria-hidden`
 * for AT, since the table is the accessible representation.
 */

import { Globe, Network, ShieldBan } from 'lucide-react'
import {
  BLOCKED_REQUEST,
  CAPTIONS,
  ESTATE,
  WAF_BUCKETS,
  WAF_RULES,
  WAF_TOTALS,
} from '@/lib/product-fixtures'
import { SeverityBadge, enterDelay, sevClass } from './Severity'
import { Reveal } from '@/components/ui/Reveal'
import s from './product.module.css'

/* ----------------------------------------------------------- chart maths --- */

/**
 * User-space chart box, scaled UNIFORMLY (no `preserveAspectRatio="none"`).
 *
 * The aspect is authored wide - 1200x150 - so that uniform scaling still yields
 * a console strip rather than a tall panel: at a ~1150px container the scale
 * factor is ~0.96 and the chart renders ~143px high.
 *
 * Uniform scaling is not a stylistic preference here, it is a correctness
 * requirement, for two independent reasons:
 *   1. a non-uniform stretch misrepresents the SLOPE of a line chart - squashing
 *      720 user units into 1150px flattens the 14:05 spike by a third;
 *   2. stroke-dasharray would stop meaning what the maths says it means, which
 *      is what made the first version of this line stop drawing in mid-air.
 */
const CHART = { w: 1200, h: 150, padX: 2, padTop: 10, padBottom: 2 } as const

const PLOT_H = CHART.h - CHART.padTop - CHART.padBottom
const PLOT_W = CHART.w - CHART.padX * 2

/** Each series gets a headroom factor so the peak does not touch the ceiling. */
const ALLOWED_MAX = Math.max(...WAF_BUCKETS.map((b) => b.allowed)) * 1.08
const BLOCKED_MAX = Math.max(...WAF_BUCKETS.map((b) => b.blocked)) * 1.12

const xAt = (i: number) =>
  CHART.padX + (WAF_BUCKETS.length === 1 ? 0 : (i * PLOT_W) / (WAF_BUCKETS.length - 1))

const yAt = (value: number, max: number) =>
  CHART.padTop + PLOT_H - (value / max) * PLOT_H

const round = (n: number) => Math.round(n * 100) / 100

const linePath = (pick: (i: number) => number, max: number) =>
  WAF_BUCKETS.map(
    (_, i) => `${i === 0 ? 'M' : 'L'}${round(xAt(i))} ${round(yAt(pick(i), max))}`,
  ).join(' ')

const allowedLine = linePath((i) => WAF_BUCKETS[i]!.allowed, ALLOWED_MAX)
const blockedLine = linePath((i) => WAF_BUCKETS[i]!.blocked, BLOCKED_MAX)

/** Close the allowed line down to the baseline to make it an area. */
const allowedArea = `${allowedLine} L${round(xAt(WAF_BUCKETS.length - 1))} ${round(
  CHART.padTop + PLOT_H,
)} L${round(xAt(0))} ${round(CHART.padTop + PLOT_H)} Z`

/**
 * Stroke-draw normalisation for the blocked line.
 *
 * `drawStroke` in globals.css animates stroke-dashoffset from `var(--dash)` to
 * 0, so the dash pattern must be exactly one dash of the path's length L
 * followed by a gap of L. At offset L the dash sits entirely before the path
 * origin and the gap covers all L units of path, so nothing renders; at offset
 * 0 the dash covers the path exactly. That is the draw.
 *
 * L IS SUMMED FROM THE PATH'S OWN SEGMENTS, in user units - `getTotalLength()`
 * needs a DOM and this component never reaches the client.
 *
 * That sum is only the truth while the viewBox scales UNIFORMLY and the stroke
 * scales with it. Two things would silently break it, and both were in the first
 * version of this chart:
 *   - `preserveAspectRatio="none"`, which stretched the geometry ~1.6x
 *     horizontally while leaving the authored length unchanged;
 *   - `vector-effect: non-scaling-stroke`, which measures dashes against the
 *     RENDERED path rather than the authored one.
 * Together they left the dash covering ~62% of the drawn line, so the series
 * stopped in mid-air at desktop width. `pathLength` does not rescue the
 * combination either: Chromium normalises in user space and then measures in
 * screen space, which reproduces the same 62%. Hence uniform scaling above, and
 * no non-scaling-stroke on the lines below.
 */
const blockedLength = WAF_BUCKETS.reduce((total, _, i) => {
  if (i === 0) return 0
  const dx = xAt(i) - xAt(i - 1)
  const dy =
    yAt(WAF_BUCKETS[i]!.blocked, BLOCKED_MAX) - yAt(WAF_BUCKETS[i - 1]!.blocked, BLOCKED_MAX)
  return total + Math.hypot(dx, dy)
}, 0)

const fmt = (n: number) => n.toLocaleString('en-GB')

/* -------------------------------------------------------------------------- */

export interface WafTrafficPanelProps {
  /** REQUIRED. Pass `CAPTIONS.waf` for the house default. */
  caption: string
  className?: string
}

export function WafTrafficPanel({ caption, className }: WafTrafficPanelProps) {
  const resolvedCaption = caption.trim() || CAPTIONS.waf
  const peak = WAF_BUCKETS.reduce((a, b) => (b.blocked > a.blocked ? b : a), WAF_BUCKETS[0]!)

  return (
    <Reveal as="figure" className={[s.figure, className].filter(Boolean).join(' ')}>
      <div className={s.console}>
        <div className={s.titlebar}>
          <span className={s.titleGroup}>
            <Globe size={13} className={s.titleIcon} aria-hidden="true" />
            <span className={s.title}>Hosted WAF, Traffic</span>
            <span className={s.tenant}>
              {ESTATE.tenant} · <span className="u-mono">{WAF_TOTALS.origin}</span>
            </span>
          </span>
          <span className={s.titleSpacer} />
          <span className={s.titleMeta}>
            <span className="u-mono u-tnum">{ESTATE.window.label}</span> · 5 min buckets
          </span>
        </div>

        <div className={s.toolbar}>
          <span className={s.count}>
            <span className={`${s.countNum} u-mono u-tnum`}>{fmt(WAF_TOTALS.requests)}</span>{' '}
            requests
          </span>
          <span className={s.chipRow}>
            <span className={`${s.chip} ${s.chipAllowed}`}>
              <span className={s.keyLine} aria-hidden="true" />
              Allowed <span className={`${s.chipCount} u-mono u-tnum`}>
                {fmt(WAF_TOTALS.allowed)}
              </span>
            </span>
            <span className={`${s.chip} ${s.chipBlocked} ${s.sevCritical}`}>
              <span className={s.keyLineSev} aria-hidden="true" />
              Blocked{' '}
              <span className={`${s.chipCount} u-mono u-tnum`}>{fmt(WAF_TOTALS.blocked)}</span>
            </span>
            <span className={s.chip}>
              Block rate{' '}
              <span className={`${s.chipCount} u-mono u-tnum`}>{WAF_TOTALS.blockedPct}%</span>
            </span>
            <span className={s.chip}>
              p95 latency <span className={`${s.chipCount} u-mono`}>{WAF_TOTALS.p95Latency}</span>
            </span>
          </span>
        </div>

        {/* ---------------------------------------------------------- chart --- */}
        <div className={s.chartWrap}>
          <svg
            className={s.chart}
            viewBox={`0 0 ${CHART.w} ${CHART.h}`}
            role="img"
            aria-labelledby="waf-chart-title waf-chart-desc"
          >
            {/* Template string, not interpolated children: React requires a
                <title>'s children to collapse to a single text node. */}
            <title id="waf-chart-title">
              {`Allowed and blocked requests per five-minute bucket, ${ESTATE.window.label}`}
            </title>
            <desc id="waf-chart-desc">
              Allowed traffic holds between {fmt(Math.min(...WAF_BUCKETS.map((b) => b.allowed)))}{' '}
              and {fmt(Math.max(...WAF_BUCKETS.map((b) => b.allowed)))} requests per bucket. Blocked
              requests sit between 54 and 206 until 13:40, then rise through three bursts to a peak
              of {fmt(peak.blocked)} in the {peak.at} bucket before falling back to{' '}
              {fmt(WAF_BUCKETS[WAF_BUCKETS.length - 1]!.blocked)}. The two series use separate
              scales; the full figures are in the table that follows.
            </desc>

            <path className={s.areaAllowed} d={allowedArea} />
            <path className={s.lineAllowed} d={allowedLine} />
            <path
              className={`${s.lineBlocked} ${s.sevCritical}`}
              d={blockedLine}
              style={
                {
                  '--dash': `${round(blockedLength)}`,
                  strokeDasharray: `${round(blockedLength)} ${round(blockedLength)}`,
                } as React.CSSProperties
              }
            />
          </svg>

          {/* Both maxima declared, because an undeclared dual axis is a lie. */}
          <div className={s.chartScales} aria-hidden="true">
            <span className={s.chartScaleAllowed}>
              Allowed, peak <span className="u-mono u-tnum">{fmt(Math.max(...WAF_BUCKETS.map((b) => b.allowed)))}</span>/bucket
            </span>
            <span className={s.chartScaleBlocked}>
              Blocked, peak <span className="u-mono u-tnum">{fmt(peak.blocked)}</span>/bucket (separate scale)
            </span>
          </div>

          <div className={s.chartAxis} aria-hidden="true">
            <span className="u-mono u-tnum">{WAF_BUCKETS[0]!.at}</span>
            <span className="u-mono u-tnum">13:30</span>
            <span className="u-mono u-tnum">14:00</span>
            <span className="u-mono u-tnum">{WAF_BUCKETS[WAF_BUCKETS.length - 1]!.at}</span>
          </div>

          {/*
            The accessible representation: every bucket, not a summary.

            The visually-hidden class goes on a WRAPPER DIV, not on the <table>.
            Under `table-layout: auto` a table treats `width: 1px` as a floor,
            not a ceiling, so .srOnly cannot shrink it, it stayed 588px wide,
            invisible but still extending the document's scrollable area, which
            put a horizontal scrollbar on the whole PAGE at 390px. A div honours
            the width and clips the table inside it.
          */}
          <div className={s.srOnly}>
            <table>
              <caption>
                Allowed and blocked requests per five-minute bucket, {ESTATE.window.label}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Bucket start (UTC)</th>
                  <th scope="col">Allowed</th>
                  <th scope="col">Blocked</th>
                </tr>
              </thead>
              <tbody>
                {WAF_BUCKETS.map((b) => (
                  <tr key={b.at}>
                    <th scope="row">{b.at}</th>
                    <td>{fmt(b.allowed)}</td>
                    <td>{fmt(b.blocked)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ------------------------------------------------------ top rules --- */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Top rules by block count</span>
            <span className={s.titleSpacer} />
            <span className={s.titleMeta}>
              Ruleset <span className="u-mono">OWASP CRS 4.7</span> + 14 tenant rules
            </span>
          </div>

          <div className={s.scrollerUnmasked}>
            <div
              className={`${s.table} ${s.rulesTable}`}
              role="table"
              aria-label="Top WAF rules by block count"
            >
              <div className={s.head} role="row">
                <span className={s.headCell} role="columnheader">
                  Severity
                </span>
                <span className={s.headCell} role="columnheader">
                  Rule ID
                </span>
                <span className={s.headCell} role="columnheader">
                  Rule
                </span>
                <span className={s.headCell} role="columnheader">
                  Source
                </span>
                <span className={`${s.headCell} ${s.headCellRight}`} role="columnheader">
                  Blocked
                </span>
              </div>
              {WAF_RULES.map((r, i) => (
                <div className={`${s.row} ${s.rowHover}`} role="row" key={r.id} style={enterDelay(i)}>
                  <span className={`${s.cell} ${s.railCell} ${sevClass[r.severity]}`} role="cell">
                    <SeverityBadge severity={r.severity} srPrefix="Severity" />
                  </span>
                  <span className={`${s.cell} u-mono u-tnum`} role="cell">
                    {r.id}
                  </span>
                  <span className={s.cell} role="cell">
                    <span className={s.cellTruncate} title={r.name}>
                      {r.name}
                    </span>
                  </span>
                  <span className={`${s.cell} ${s.muted}`} role="cell">
                    {r.source}
                  </span>
                  <span className={`${s.cell} ${s.cellRight} u-mono u-tnum`} role="cell">
                    {fmt(r.blocked)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------------- one blocked request --- */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <SeverityBadge severity={BLOCKED_REQUEST.severity} srPrefix="Severity" />
            <span className={s.panelTitle}>
              <ShieldBan size={11} aria-hidden="true" /> Blocked request{' '}
              <span className="u-mono">{BLOCKED_REQUEST.id}</span>
            </span>
            <span className={s.titleSpacer} />
            <span className={s.titleMeta}>
              <span className="u-mono u-tnum">{BLOCKED_REQUEST.at} UTC</span>
            </span>
          </div>

          <div className={s.panelBody}>
            <p className={s.panelProse}>
              <strong className={s.strong}>{BLOCKED_REQUEST.action}.</strong> Rule{' '}
              <span className="u-mono">{BLOCKED_REQUEST.rule}</span> matched on token{' '}
              <span className="u-mono">{BLOCKED_REQUEST.matchedToken}</span> in the request body —
              the vector for <span className="u-mono">{BLOCKED_REQUEST.cve}</span>. Seen{' '}
              <span className="u-mono u-tnum">{fmt(BLOCKED_REQUEST.repeatCount)}</span> times from
              this source between{' '}
              <span className="u-mono u-tnum">{BLOCKED_REQUEST.firstSeen}</span> and{' '}
              <span className="u-mono u-tnum">{BLOCKED_REQUEST.lastSeen}</span> UTC.
            </p>

            <dl className={s.kv}>
              <div className={s.kvRow}>
                <dt className={s.kvKey}>Request</dt>
                <dd className={`${s.kvVal} u-mono`}>
                  {BLOCKED_REQUEST.method} {BLOCKED_REQUEST.path}
                </dd>
              </div>
              <div className={s.kvRow}>
                <dt className={s.kvKey}>Host</dt>
                <dd className={`${s.kvVal} u-mono`}>{BLOCKED_REQUEST.host}</dd>
              </div>
              <div className={s.kvRow}>
                <dt className={s.kvKey}>Source</dt>
                <dd className={`${s.kvVal} u-mono`}>
                  {BLOCKED_REQUEST.sourceIp} · {BLOCKED_REQUEST.sourceCountry}
                </dd>
              </div>
              <div className={s.kvRow}>
                <dt className={s.kvKey}>Source ASN</dt>
                <dd className={`${s.kvVal} u-mono`}>
                  <Network size={11} aria-hidden="true" /> {BLOCKED_REQUEST.sourceAsn}
                </dd>
              </div>
              <div className={s.kvRow}>
                <dt className={s.kvKey}>User agent</dt>
                <dd className={`${s.kvVal} u-mono`}>{BLOCKED_REQUEST.userAgent}</dd>
              </div>
              <div className={s.kvRow}>
                <dt className={s.kvKey}>Anomaly score</dt>
                <dd className={`${s.kvVal} u-mono u-tnum`}>
                  {BLOCKED_REQUEST.anomalyScore} (inbound threshold 5)
                </dd>
              </div>
            </dl>

            <div>
              <p className={s.sectionLabel}>Payload excerpt</p>
              {/*
                Rendered as text content, so React escapes it on output, there
                is no dangerouslySetInnerHTML anywhere in this subtree. The
                truncation is stated in the line beneath rather than left for
                the reader to infer from a trailing ellipsis.
              */}
              <pre
                className={s.payload}
                role="group"
                aria-label="Blocked request payload excerpt, scrolls"
                tabIndex={0}
              >
                <code className="u-mono">{BLOCKED_REQUEST.payloadExcerpt}</code>
              </pre>
              <p className={s.caption}>
                First <span className="u-mono u-tnum">{BLOCKED_REQUEST.payloadBytesShown}</span> of{' '}
                <span className="u-mono u-tnum">{fmt(BLOCKED_REQUEST.bodyBytes)}</span> bytes,
                base64 as received. Truncated for display; the full body is retained in the WAF
                event store for 90 days.
              </p>
            </div>
          </div>
        </div>

        <div className={s.statusbar}>
          <span className={s.statusItem}>
            Mode <span className={s.statusStrong}>Blocking</span>
          </span>
          <span className={s.statusItem}>
            Paranoia level <span className="u-mono">2</span>
          </span>
          <span className={s.statusItem}>
            False-positive exclusions <span className="u-mono u-tnum">38</span>
          </span>
          <span className={s.statusSpacer} />
          <span className={s.statusItem}>
            Last ruleset push <span className="u-mono u-tnum">2026-10-09 06:12 UTC</span>
          </span>
        </div>
      </div>
      <figcaption className={s.caption}>{resolvedCaption}</figcaption>
    </Reveal>
  )
}
