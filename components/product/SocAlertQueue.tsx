/**
 * SocAlertQueue - stylised view of the managed SIEM alert queue.
 *
 * Server Component. The only client code in this subtree is `SceneRunner`, and
 * only when `autoplay` is set.
 *
 * DENSITY IS THE POINT. 14 rows at a 38px rhythm, hairline dividers, a toolbar
 * with a result count and filter chips, a status bar. Four big cards with lots
 * of whitespace would read as a marketing mock, because it would be one.
 *
 * THE DETAIL DRAWER is what separates this from a notification list: the
 * selected alert carries its evidence, three timestamped triage notes and the
 * analyst's written conclusion. A notification tells you something happened.
 * A triage record tells you what an analyst decided and why.
 *
 * STEPS (for screen-recording - see `SceneRunner`)
 *   0  baseline queue, detail drawer showing evidence only
 *   1  a new alert arrives at the top of the queue
 *   2  the analyst's triage notes appear
 *   3  the conclusion and containment appear          <- default, the complete state
 */

import { Funnel, Search, ShieldCheck, Clock } from 'lucide-react'
import {
  ALERTS,
  ALERT_FILTERS,
  ALERT_STATE_LABEL,
  CAPTIONS,
  ESTATE,
  INCOMING_ALERT,
  type Alert,
} from '@/lib/product-fixtures'
import { SceneRunner } from './SceneRunner'
import { SeverityBadge, enterDelay, sevClass } from './Severity'
import { Reveal } from '@/components/ui/Reveal'
import s from './product.module.css'

const STEP_LABELS = [
  'Queue at 14:29 UTC',
  'New alert received',
  'Analyst triage recorded',
  'Containment executed',
] as const

export interface SocAlertQueueProps {
  /**
   * REQUIRED, so it cannot be dropped by accident. Pass `CAPTIONS.soc` for the
   * house default; an all-whitespace value falls back to it rather than
   * rendering an unlabelled mock of someone else's product.
   */
  caption: string
  /** Which beat of the sequence to render. Default 3 = the complete state. */
  step?: 0 | 1 | 2 | 3
  /** Advance the beats on a timer. OFF by default. */
  autoplay?: boolean
  className?: string
}

export function SocAlertQueue({
  caption,
  step = 3,
  autoplay = false,
  className,
}: SocAlertQueueProps) {
  const resolvedCaption = caption.trim() || CAPTIONS.soc

  /** The one row that opens the drawer. */
  const selected = ALERTS.find((a) => a.detail)
  const openCount = ALERTS.filter((a) => a.state !== 'contained').length

  const body = (
    <>
      <div className={s.titlebar}>
        <span className={s.titleGroup}>
          <ShieldCheck size={13} className={s.titleIcon} aria-hidden="true" />
          <span className={s.title}>Managed SIEM, Alert queue</span>
          <span className={s.tenant}>
            {ESTATE.tenant} · <span className="u-mono">{ESTATE.tenantRef}</span>
          </span>
        </span>
        <span className={s.titleSpacer} />
        <span className={s.titleMeta}>
          <Clock size={11} aria-hidden="true" />
          <span className="u-mono u-tnum">{ESTATE.window.label}</span>
        </span>
      </div>

      <div className={s.toolbar}>
        <span className={s.count}>
          <span className={`${s.countNum} u-mono u-tnum`}>{ALERTS.length}</span> of{' '}
          <span className="u-mono u-tnum">2,847</span> alerts
        </span>
        <span className={s.search}>
          <Search size={11} aria-hidden="true" />
          <span className="u-mono">severity:&gt;=medium estate:{ESTATE.estate}</span>
        </span>
        <span className={s.chipRow}>
          <Funnel size={11} className={s.titleIcon} aria-hidden="true" />
          {ALERT_FILTERS.map((f) => (
            <span
              key={f.label}
              className={`${s.chip} ${f.active ? s.chipActive : ''}`}
              /* Representation of a filter chip, not a working control - so it
                 is not a <button> and makes no keyboard promise it can't keep. */
            >
              {f.label}
              <span className={`${s.chipCount} u-mono u-tnum`}>{f.count}</span>
            </span>
          ))}
        </span>
      </div>

      {/* A scrollable region needs an accessible name and a tab stop, or a
          keyboard user cannot reach what has scrolled out of view. */}
      <div
        className={`${s.scroller} ${s.queueScroll}`}
        role="group"
        aria-label="Managed SIEM alert queue, scrolls horizontally"
        tabIndex={0}
      >
        <div className={s.table} role="table" aria-label="Managed SIEM alert queue">
          <div className={s.head} role="row">
            <span className={s.headCell} role="columnheader">
              Severity
            </span>
            <span className={s.headCell} role="columnheader">
              Time (UTC)
            </span>
            <span className={s.headCell} role="columnheader">
              Asset
            </span>
            <span className={s.headCell} role="columnheader">
              Detection
            </span>
            <span className={s.headCell} role="columnheader">
              Technique
            </span>
            <span className={s.headCell} role="columnheader">
              Assignee
            </span>
            <span className={s.headCell} role="columnheader">
              State
            </span>
          </div>

          {/* Beat 1: the alert that arrives. Present in the DOM at every beat;
              CSS hides it at beat 0. With JS off it is simply shown. */}
          <AlertRow alert={INCOMING_ALERT} index={0} className={s.step1} arriving />

          {ALERTS.map((alert, i) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              index={i + 1}
              selected={alert.id === selected?.id}
            />
          ))}
        </div>
      </div>

      {selected?.detail ? <DetailDrawer alert={selected} /> : null}

      <div className={s.statusbar}>
        <span className={s.statusItem}>
          <span className={s.statusStrong}>{openCount}</span> open
        </span>
        <span className={s.statusItem}>
          Log sources{' '}
          <span className={`${s.statusStrong} u-mono u-tnum`}>
            {ESTATE.coverage.logSourcesHealthy}/{ESTATE.coverage.logSourcesTotal}
          </span>{' '}
          healthy
        </span>
        <span className={s.statusItem}>
          <span className="u-mono u-tnum">{ESTATE.coverage.eventsPerDay}</span> events/day
        </span>
        <span className={s.statusSpacer} />
        <span className={s.statusItem}>
          Incident <span className="u-mono">{ESTATE.incident.id}</span> · commander{' '}
          <span className={s.statusStrong}>{ESTATE.incident.commander}</span>
        </span>
      </div>
    </>
  )

  return (
    <Reveal as="figure" className={[s.figure, className].filter(Boolean).join(' ')}>
      {autoplay ? (
        <SceneRunner
          initialStep={step}
          steps={STEP_LABELS.length}
          stepLabels={STEP_LABELS}
          className={s.console}
        >
          {body}
        </SceneRunner>
      ) : (
        <div className={s.console} data-scene={step}>
          {body}
        </div>
      )}
      <figcaption className={s.caption}>{resolvedCaption}</figcaption>
    </Reveal>
  )
}

/* -------------------------------------------------------------------------- */

function AlertRow({
  alert,
  index,
  selected = false,
  arriving = false,
  className,
}: {
  alert: Alert
  index: number
  selected?: boolean
  arriving?: boolean
  className?: string
}) {
  const cls = [
    s.row,
    s.rowHover,
    selected ? s.rowSelected : '',
    arriving ? s.rowArriving : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const open = alert.state !== 'contained'

  return (
    <div className={cls} role="row" style={enterDelay(index)}>
      <span className={`${s.cell} ${s.railCell} ${sevClass[alert.severity]}`} role="cell">
        <SeverityBadge severity={alert.severity} srPrefix="Severity" />
      </span>
      <span className={`${s.cell} u-mono u-tnum`} role="cell">
        {alert.at}
      </span>
      <span className={s.cell} role="cell">
        <span className="u-mono">{alert.asset}</span>
      </span>
      <span className={s.cell} role="cell">
        <span className={s.cellTruncate} title={alert.detection}>
          {alert.detection}
        </span>
      </span>
      <span className={s.cell} role="cell">
        <span className="u-mono" title={alert.technique.name}>
          {alert.technique.id}
        </span>
        <span className={s.srOnly}>, {alert.technique.name}</span>
      </span>
      <span className={s.cell} role="cell">
        {alert.assignee === '—' ? (
          <span className={s.muted}>
            Unassigned<span className={s.srOnly}> analyst</span>
          </span>
        ) : (
          alert.assignee
        )}
      </span>
      <span className={s.cell} role="cell">
        <span className={s.state}>
          <span
            className={`${s.stateDot} ${open ? s.stateDotOpen : ''}`}
            aria-hidden="true"
          />
          {ALERT_STATE_LABEL[alert.state]}
          {selected ? <span className={s.srOnly}>, shown in the detail pane below</span> : null}
        </span>
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function DetailDrawer({ alert }: { alert: Alert }) {
  const d = alert.detail
  if (!d) return null

  return (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <SeverityBadge severity={alert.severity} srPrefix="Severity" />
        <span className={s.panelTitle}>
          <span className="u-mono">{alert.id}</span>, {alert.detection}
        </span>
        <span className={s.titleSpacer} />
        <span className={s.titleMeta}>
          <span className="u-mono">{alert.rule}</span> ·{' '}
          <span className="u-mono">{alert.technique.id}</span>{' '}
          <span className={s.muted}>{alert.technique.name}</span>
        </span>
      </div>

      <div className={s.panelBody}>
        <p className={s.panelProse}>{d.summary}</p>

        <div>
          <p className={s.sectionLabel}>Evidence</p>
          <dl className={s.kv}>
            {d.evidence.map((e) => (
              <div key={e.label} className={s.kvRow}>
                <dt className={s.kvKey}>{e.label}</dt>
                <dd className={`${s.kvVal} ${e.mono ? 'u-mono' : ''}`}>{e.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Beat 2 */}
        <div className={s.step2}>
          <p className={s.sectionLabel}>Triage notes</p>
          <ol className={s.notes}>
            {d.notes.map((n, i) => (
              <li key={n.at} className={s.note} style={enterDelay(i)}>
                <span className={s.noteMeta}>
                  <span className="u-mono u-tnum">{n.at} UTC</span>
                  <span className={s.noteAnalyst}>{n.analyst}</span>
                </span>
                <p className={s.noteBody}>{n.body}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Beat 3 */}
        <div className={s.step3}>
          <div className={s.verdict}>
            <span className={s.verdictHead}>
              <span className={s.verdictLabel}>Analyst conclusion</span>
              <span className="u-mono u-tnum">{d.conclusion.at} UTC</span>
              <span className={s.noteAnalyst}>{d.conclusion.analyst}</span>
              <span className={s.muted}>
                Incident <span className="u-mono">{d.conclusion.incident}</span>
              </span>
            </span>
            <p className={s.panelProse}>
              <strong className={s.strong}>{d.conclusion.verdict}</strong>
            </p>
            <p className={s.panelProse}>{d.conclusion.action}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
