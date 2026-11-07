/**
 * DeliveryPipeline - stylised view of one CI/CD run.
 *
 * Server Component. No client JavaScript anywhere in this subtree.
 *
 * WHY THE RUN FAILS
 * A pipeline screenshot where all fourteen stages are green is a marketing
 * mock, because the interesting thing a pipeline does is stop. Run 2184 stops
 * at stage 11 of 14, on an integration test that asserts the reporting summary
 * refuses a cross-tenant read - the same tenant predicate whose absence let
 * ENX-88214 enumerate 1,106 records in the SIEM console. The three stages after
 * it are `skipped`, with the gate that skipped them printed, because a pipeline
 * that shows a failure but still claims a deploy is not telling the truth.
 *
 * WHY THE FOUR METRICS CARRY A BASIS LINE
 * "Deploy frequency: high" is a poster. A delivery metric is only checkable
 * with its window, its denominator and the percentile it was taken at, so each
 * of the four renders the figure, the thing it measures and the population it
 * was measured across - the same rule SlaPanel obeys for availability.
 *
 * ACCESSIBILITY. Status is never colour alone: every stage renders a
 * SeverityBadge, which is a distinct shape plus the word ("Passed", "Failed",
 * "Warning", "Skipped"). The failing log line is tinted AND says FAIL in its
 * own text. The log is a horizontally scrollable region with an accessible
 * name, reachable from the keyboard.
 */

import { Clock, GitBranch, GitCommitHorizontal, Package, Terminal, Workflow } from 'lucide-react'
import {
  CAPTIONS,
  DELIVERY_METRICS,
  ESTATE,
  PIPELINE,
  PIPELINE_LOG,
  PIPELINE_STAGES,
  RUN_STATUS_LABEL,
  RUN_STATUS_SEVERITY,
  type PipelineStage,
} from '@/lib/product-fixtures'
import { SeverityBadge, enterDelay, sevClass } from './Severity'
import { Reveal } from '@/components/ui/Reveal'
import s from './product.module.css'
import d from './delivery.module.css'

const FAILED_INDEX = PIPELINE_STAGES.findIndex((stage) => stage.status === 'failed')
const FAILED_STAGE = PIPELINE_STAGES[FAILED_INDEX]
const PASSED = PIPELINE_STAGES.filter((stage) => stage.status === 'passed').length
const SKIPPED = PIPELINE_STAGES.filter((stage) => stage.status === 'skipped').length

export interface DeliveryPipelineProps {
  /**
   * REQUIRED, so it cannot be dropped by accident. Pass `CAPTIONS.pipeline` for
   * the house default; an all-whitespace value falls back to it rather than
   * rendering an unlabelled mock of somebody else's product.
   */
  caption: string
  className?: string
}

export function DeliveryPipeline({ caption, className }: DeliveryPipelineProps) {
  const resolvedCaption = caption.trim() || CAPTIONS.pipeline

  return (
    <Reveal as="figure" className={[s.figure, className].filter(Boolean).join(' ')}>
      <div className={s.console}>
        <div className={s.titlebar}>
          <span className={s.titleGroup}>
            <Workflow size={13} className={s.titleIcon} aria-hidden="true" />
            <span className={s.title}>Delivery pipeline, run {PIPELINE.run}</span>
            <span className={s.tenant}>
              <span className="u-mono">{PIPELINE.repo}</span> · {ESTATE.tenant}
            </span>
          </span>
          <span className={s.titleSpacer} />
          <span className={s.titleMeta}>
            <Clock size={11} aria-hidden="true" />
            <span className="u-mono u-tnum">
              {PIPELINE.date} {PIPELINE.startedAt}–{PIPELINE.finishedAt} UTC
            </span>
          </span>
        </div>

        {/* ------------------------------------------------- what triggered it --- */}
        <div className={d.commitBar}>
          <span className={s.state}>
            <GitCommitHorizontal size={12} className={s.titleIcon} aria-hidden="true" />
            <span className="u-mono">{PIPELINE.commit}</span>
          </span>
          <span className={s.state}>
            <GitBranch size={12} className={s.titleIcon} aria-hidden="true" />
            <span className="u-mono">{PIPELINE.branch}</span>
          </span>
          <span className={d.commitMsg}>{PIPELINE.message}</span>
          <span className={s.titleSpacer} />
          <span className={s.muted}>
            {PIPELINE.trigger} by {PIPELINE.author}
          </span>
        </div>

        <dl className={d.facts}>
          <Fact
            index={0}
            label="Run result"
            value={
              <SeverityBadge
                severity={RUN_STATUS_SEVERITY[PIPELINE.status]}
                label={`${RUN_STATUS_LABEL[PIPELINE.status]} at stage ${FAILED_INDEX + 1} of ${PIPELINE_STAGES.length}`}
                srPrefix="Run result"
                className={sevClass[RUN_STATUS_SEVERITY[PIPELINE.status]]}
              />
            }
          />
          <Fact
            index={1}
            label="Queued, then ran"
            value={
              <span className="u-mono u-tnum">
                {PIPELINE.queuedFor} queued · {PIPELINE.wallClock} wall clock
              </span>
            }
          />
          <Fact
            index={2}
            label="Runner"
            value={
              <span className="u-mono">
                {PIPELINE.runner} · {PIPELINE.runnerIp}
              </span>
            }
          />
          <Fact
            index={3}
            label="Artefact"
            value={
              <span className="u-mono">
                {PIPELINE.artefactSize} · {PIPELINE.artefact}
              </span>
            }
          />
        </dl>

        <div className={s.toolbar}>
          <span className={s.count}>
            <span className={`${s.countNum} u-mono u-tnum`}>{PIPELINE_STAGES.length}</span> stages ·{' '}
            <span className="u-mono u-tnum">{PASSED}</span> passed,{' '}
            <span className="u-mono u-tnum">1</span> failed,{' '}
            <span className="u-mono u-tnum">{SKIPPED}</span> skipped
          </span>
          <span className={s.titleSpacer} />
          <span className={s.search}>
            <Package size={11} aria-hidden="true" />
            <span className="u-mono">{PIPELINE.artefactDigest}</span>
          </span>
        </div>

        {/* -------------------------------------------------------- the stages --- */}
        {/* The stage grid is wider than a phone, so the scroller needs an
            accessible name and a tab stop, a scrollable region a keyboard
            user cannot focus is a region they cannot read the right of. */}
        <div
          className={`${s.scroller} ${d.stageScroll}`}
          role="group"
          aria-label={`Pipeline stages for run ${PIPELINE.run}, scrolls horizontally`}
          tabIndex={0}
        >
          <div
            className={`${s.table} ${d.stageTable}`}
            role="table"
            aria-label={`Pipeline stages for run ${PIPELINE.run}`}
          >
            <div className={s.head} role="row">
              <span className={s.headCell} role="columnheader">
                Stage
              </span>
              <span className={s.headCell} role="columnheader">
                Result
              </span>
              <span className={`${s.headCell} ${s.headCellRight}`} role="columnheader">
                Duration
              </span>
              <span className={s.headCell} role="columnheader">
                Ran
              </span>
              <span className={s.headCell} role="columnheader">
                Detail
              </span>
            </div>

            {PIPELINE_STAGES.map((stage, i) => (
              <StageRow key={stage.name} stage={stage} index={i} />
            ))}
          </div>
        </div>

        {/* ---------------------------------------------- the failing stage log --- */}
        {FAILED_STAGE ? (
          <div className={s.panel}>
            <div className={s.panelHead}>
              <SeverityBadge
                severity={RUN_STATUS_SEVERITY.failed}
                label={RUN_STATUS_LABEL.failed}
                srPrefix="Stage result"
                className={sevClass[RUN_STATUS_SEVERITY.failed]}
              />
              <span className={s.panelTitle}>
                Stage {FAILED_INDEX + 1}, {FAILED_STAGE.name}
              </span>
              <span className={s.titleSpacer} />
              <span className={s.titleMeta}>
                <Terminal size={11} aria-hidden="true" />
                <span className="u-mono">{FAILED_STAGE.tool}</span>
                <span className="u-mono u-tnum">{FAILED_STAGE.duration}</span>
              </span>
            </div>

            <div className={d.logPanel}>
              <p className={s.panelProse}>
                The assertion below is the authorisation contract for{' '}
                <span className="u-mono">/v2/consignments/summary</span>. It is the same predicate
                whose absence let a replayed session read{' '}
                <span className="u-mono u-tnum">1,106</span> records in the detection console, and
                it is caught here, in nine minutes, rather than in a report after the architecture
                has become load-bearing.
              </p>

              {/* A scrollable region needs a name and a tab stop, or a keyboard
                  user cannot reach the right-hand side of a wide log line. */}
              <div
                className={`${d.log} ${sevClass.critical} u-mono`}
                role="group"
                aria-label={`Log output from the ${FAILED_STAGE.name} stage`}
                tabIndex={0}
              >
                {PIPELINE_LOG.map((line, i) => (
                  <span
                    key={`${i}-${line.text}`}
                    className={[
                      d.logLine,
                      line.kind === 'fail' ? d.logFail : '',
                      line.kind === 'focus' ? d.logFocus : '',
                      line.kind === 'muted' ? d.logMuted : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {line.text || ' '}
                  </span>
                ))}
              </div>

              <p className={s.caption}>
                Stages 12 to 14 did not run. The deploy gate requires integration to pass, and the
                production promotion additionally requires a change record —{' '}
                <span className="u-mono">{PIPELINE.change}</span>.
              </p>
            </div>
          </div>
        ) : null}

        {/* --------------------------------------------- the four delivery metrics --- */}
        <div className={d.metricStrip}>
          {DELIVERY_METRICS.map((metric, i) => (
            <div key={metric.label} className={d.metric} style={enterDelay(i)}>
              <span className={`${d.metricValue} u-mono u-tnum`}>{metric.value}</span>
              <span className={d.metricLabel}>{metric.label}</span>
              <span className={d.metricBasis}>{metric.basis}</span>
            </div>
          ))}
        </div>

        <div className={s.statusbar}>
          <span className={s.statusItem}>
            Head <span className="u-mono">{PIPELINE.commitFull.slice(0, 12)}</span>
          </span>
          <span className={s.statusItem}>
            Pipeline <span className={s.statusStrong}>{PIPELINE.pipeline}</span>
          </span>
          <span className={s.statusSpacer} />
          <span className={s.statusItem}>
            Fix on <span className="u-mono">fix/consignment-tenant-predicate</span>, merged{' '}
            <span className="u-mono u-tnum">14:33:18 UTC</span>
          </span>
        </div>
      </div>
      <figcaption className={s.caption}>{resolvedCaption}</figcaption>
    </Reveal>
  )
}

/* -------------------------------------------------------------------------- */

function Fact({
  label,
  value,
  index,
}: {
  label: string
  value: React.ReactNode
  index: number
}) {
  return (
    <div className={d.fact} style={enterDelay(index)}>
      <dt className={d.factKey}>{label}</dt>
      <dd className={d.factVal} style={{ margin: 0 }}>
        {value}
      </dd>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function StageRow({ stage, index }: { stage: PipelineStage; index: number }) {
  const severity = RUN_STATUS_SEVERITY[stage.status]
  const failed = stage.status === 'failed'

  return (
    <div
      className={`${s.row} ${s.rowHover} ${failed ? s.rowSelected : ''}`}
      role="row"
      style={enterDelay(index)}
    >
      <span className={`${s.cell} ${s.railCell} ${sevClass[severity]}`} role="cell">
        <span className={`${d.stageIndex} u-mono u-tnum`} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className={s.strong}>{stage.name}</span>
        {failed ? <span className={s.srOnly}>, shown in the log pane below</span> : null}
      </span>
      <span className={`${s.cell} ${sevClass[severity]}`} role="cell">
        <SeverityBadge
          severity={severity}
          label={RUN_STATUS_LABEL[stage.status]}
          srPrefix="Result"
        />
      </span>
      <span className={`${s.cell} ${s.cellRight} u-mono u-tnum`} role="cell">
        {stage.duration}
      </span>
      <span className={`${s.cell} u-mono`} role="cell">
        <span className={s.cellTruncate} title={stage.tool}>
          {stage.tool}
        </span>
      </span>
      <span className={`${s.cell} ${s.muted}`} role="cell">
        <span className={s.cellTruncate} title={stage.detail}>
          {stage.detail}
        </span>
      </span>
    </div>
  )
}
