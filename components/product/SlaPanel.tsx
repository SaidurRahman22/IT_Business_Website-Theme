/**
 * SlaPanel - stylised view of the service-level report.
 *
 * Server Component. No client JavaScript.
 *
 * WHY THERE IS NO ROUND THREE-NINES FIGURE HERE
 * A round uptime figure is a marketing number: it is what you write when you
 * have not measured. A real availability report carries three things this panel
 * renders together - the figure to the precision it was actually measured to
 * (99.982%), the window it was measured over (1–31 October 2026, 744 h), and
 * the minutes that were lost (8 m 03 s). The third is what makes the first
 * checkable, and the month strip below shows exactly which two days they fell on.
 *
 * WHY PERCENTILES, NOT AN AVERAGE
 * A mean response time is a tell. It hides the tail, and the tail is the whole
 * product: nobody is harmed by the median alert, they are harmed by the p99
 * one. So p50, p95 and p99 are reported for acknowledgement and again for
 * containment, each with the thing it actually measures named beside it.
 */

import { Clock, Hourglass, ShieldCheck, Timer } from 'lucide-react'
import {
  CAPTIONS,
  DAY_STATE_LABEL,
  DAY_STATE_SEVERITY,
  ESTATE,
  SLA_CONTAINMENT,
  SLA_DAYS,
  SLA_PERCENTILES,
  SLA_TICKETS,
  SLA_UPTIME,
  SLA_WINDOW,
  type DayCell,
  type SlaMetric,
} from '@/lib/product-fixtures'
import { SeverityBadge, enterDelay, sevClass } from './Severity'
import { Reveal } from '@/components/ui/Reveal'
import s from './product.module.css'

/** Exceptions, named in prose so the strip is never the only record of them. */
const EXCEPTIONS = SLA_DAYS.filter((d) => d.state !== 'full')

export interface SlaPanelProps {
  /** REQUIRED. Pass `CAPTIONS.sla` for the house default. */
  caption: string
  className?: string
}

export function SlaPanel({ caption, className }: SlaPanelProps) {
  const resolvedCaption = caption.trim() || CAPTIONS.sla

  return (
    <Reveal as="figure" className={[s.figure, className].filter(Boolean).join(' ')}>
      <div className={s.console}>
        <div className={s.titlebar}>
          <span className={s.titleGroup}>
            <ShieldCheck size={13} className={s.titleIcon} aria-hidden="true" />
            <span className={s.title}>Service level, Monthly report</span>
            <span className={s.tenant}>
              {ESTATE.tenant} · <span className="u-mono">{ESTATE.tenantRef}</span>
            </span>
          </span>
          <span className={s.titleSpacer} />
          <span className={s.titleMeta}>
            <Clock size={11} aria-hidden="true" />
            <span className="u-mono u-tnum">{SLA_WINDOW.label}</span>
          </span>
        </div>

        {/* ------------------------------------------------------- uptime --- */}
        <div className={s.slaHeadline}>
          <div className={s.slaFigure}>
            <span className={`${s.slaValue} u-mono u-tnum`}>{SLA_UPTIME.value}</span>
            <span className={s.slaLabel}>Edge availability</span>
            <span className={s.slaBasis}>{SLA_UPTIME.basis}</span>
          </div>

          <dl className={s.slaAgainst}>
            <div className={s.kvRow}>
              <dt className={s.kvKey}>Contractual target</dt>
              <dd className={`${s.kvVal} u-mono u-tnum`}>{SLA_UPTIME.target}</dd>
            </div>
            <div className={s.kvRow}>
              <dt className={s.kvKey}>Availability lost</dt>
              <dd className={`${s.kvVal} u-mono u-tnum`}>
                {SLA_UPTIME.minutesLost} of {SLA_WINDOW.minutes.toLocaleString('en-GB')} min
              </dd>
            </div>
            <div className={s.kvRow}>
              <dt className={s.kvKey}>Measurement</dt>
              <dd className={s.kvVal}>6 external probes, 30 s interval, 2-of-6 failure quorum</dd>
            </div>
            <div className={s.kvRow}>
              <dt className={s.kvKey}>Credits due</dt>
              <dd className={s.kvVal}>None, target met</dd>
            </div>
          </dl>
        </div>

        {/* -------------------------------------------------- percentiles --- */}
        <div className={s.slaGrid}>
          <PercentileBlock
            icon={<Timer size={11} aria-hidden="true" />}
            title="Alert acknowledgement"
            metrics={SLA_PERCENTILES}
            note="Time from detection to a named analyst picking the alert up. Critical and High only; Medium and below are batched into the daily review."
          />
          <PercentileBlock
            icon={<Hourglass size={11} aria-hidden="true" />}
            title="Containment"
            metrics={SLA_CONTAINMENT}
            note={`Time from detection to a containment action executing. Critical only. Measured across 31 containments in ${SLA_WINDOW.label}.`}
          />
        </div>

        {/* ------------------------------------------------------ tickets --- */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Ticket states</span>
            <span className={s.titleSpacer} />
            <span className={s.titleMeta}>
              Open figures as at <span className="u-mono u-tnum">{ESTATE.window.label}</span>
            </span>
          </div>
          <div className={s.scrollerUnmasked}>
            <div
              className={`${s.table} ${s.ticketTable}`}
              role="table"
              aria-label="Ticket states"
            >
              <div className={s.head} role="row">
                <span className={s.headCell} role="columnheader">
                  State
                </span>
                <span className={`${s.headCell} ${s.headCellRight}`} role="columnheader">
                  Tickets
                </span>
                <span className={s.headCell} role="columnheader">
                  Note
                </span>
              </div>
              {SLA_TICKETS.map((t, i) => (
                <div
                  className={`${s.row} ${s.rowHover}`}
                  role="row"
                  key={t.state}
                  style={enterDelay(i)}
                >
                  <span className={s.cell} role="cell">
                    {t.state}
                  </span>
                  <span className={`${s.cell} ${s.cellRight} u-mono u-tnum`} role="cell">
                    {t.count}
                  </span>
                  <span className={`${s.cell} ${s.muted}`} role="cell">
                    <span className={s.cellTruncate} title={t.note}>
                      {t.note}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --------------------------------------------------- day strip --- */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Daily availability, October 2026</span>
            <span className={s.titleSpacer} />
            <span className={s.chipRow}>
              {(['full', 'degraded', 'maintenance'] as const).map((state) => (
                <span key={state} className={s.legendItem}>
                  <SeverityBadge
                    severity={DAY_STATE_SEVERITY[state]}
                    label={DAY_STATE_LABEL[state]}
                    srPrefix="Day state"
                  />
                  <span className={`${s.chipCount} u-mono u-tnum`}>
                    {SLA_DAYS.filter((d) => d.state === state).length}
                  </span>
                </span>
              ))}
            </span>
          </div>

          <div className={s.panelBody}>
            <ol className={s.dayStrip} aria-label="Availability by day, October 2026">
              {SLA_DAYS.map((d, i) => (
                <DayBox key={d.day} cell={d} index={i} />
              ))}
            </ol>

            {/*
              The strip encodes day state with colour AND with a distinct fill
              treatment, but a 31-cell strip is still a poor place to read an
              exception from. So every non-full day is also written out in
              prose below, which is the record, not the decoration.
            */}
            <div>
              <p className={s.sectionLabel}>Exceptions in the window</p>
              <ul className={s.exceptionList}>
                {EXCEPTIONS.map((d, i) => (
                  <li key={d.day} className={s.exception} style={enterDelay(i)}>
                    <SeverityBadge
                      severity={DAY_STATE_SEVERITY[d.state]}
                      label={DAY_STATE_LABEL[d.state]}
                      srPrefix="Day state"
                    />
                    <span className="u-mono u-tnum">
                      {d.day} Oct 2026
                    </span>
                    <span className={s.muted}>{d.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className={s.statusbar}>
          <span className={s.statusItem}>
            Report generated <span className="u-mono u-tnum">2026-11-01 09:00 UTC</span>
          </span>
          <span className={s.statusItem}>
            Signed off <span className={s.statusStrong}>M. Thorne</span>, service delivery
          </span>
          <span className={s.statusSpacer} />
          <span className={s.statusItem}>
            Next review <span className="u-mono u-tnum">2026-11-12</span>
          </span>
        </div>
      </div>
      <figcaption className={s.caption}>{resolvedCaption}</figcaption>
    </Reveal>
  )
}

/* -------------------------------------------------------------------------- */

function PercentileBlock({
  icon,
  title,
  metrics,
  note,
}: {
  icon: React.ReactNode
  title: string
  metrics: readonly SlaMetric[]
  note: string
}) {
  return (
    <div className={s.slaBlock}>
      <p className={s.sectionLabel}>
        {icon} {title}
      </p>
      <div className={s.pctRow}>
        {metrics.map((m, i) => (
          <div key={m.label} className={s.pct} style={enterDelay(i)}>
            <span className={`${s.pctKey} u-mono`}>{m.label}</span>
            <span className={`${s.pctVal} u-mono u-tnum`}>{m.value}</span>
          </div>
        ))}
      </div>
      <p className={s.caption}>{note}</p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function DayBox({ cell, index }: { cell: DayCell; index: number }) {
  const severity = DAY_STATE_SEVERITY[cell.state]
  const stateClass =
    cell.state === 'full'
      ? s.dayFull
      : cell.state === 'degraded'
        ? s.dayDegraded
        : s.dayMaintenance

  return (
    <li
      className={`${s.day} ${sevClass[severity]} ${stateClass}`}
      style={enterDelay(index)}
      /* Visible on hover for sighted readers; the srOnly text below carries the
         same information for everyone else. */
      title={`${cell.day} October 2026, ${DAY_STATE_LABEL[cell.state]}${
        cell.note ? `, ${cell.note}` : ''
      }`}
    >
      <span className={`${s.dayNum} u-mono u-tnum`} aria-hidden="true">
        {cell.day}
      </span>
      <span className={s.srOnly}>
        {cell.day} October 2026: {DAY_STATE_LABEL[cell.state]}
        {cell.note ? `, ${cell.note}` : ''}
      </span>
    </li>
  )
}
