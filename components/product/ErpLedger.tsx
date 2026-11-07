/**
 * ErpLedger - stylised view of a month-end close in the ERP we built.
 *
 * Server Component. No client JavaScript.
 *
 * WHY A CLOSE AND NOT A DASHBOARD
 * Finance software is judged on one event a month, and the event is the close.
 * A screen of charts says nothing; a period with its trial balance, its
 * reconciliation state per line, its variance against a tolerance agreed in
 * advance, and the names of the three people who signed it says everything.
 * The ledger below balances to the penny - £7,306,619.29 on each side - and
 * the variance is £0.00 against a £500.00 tolerance, which is a number you can
 * check rather than a claim you have to accept.
 *
 * SEGREGATION OF DUTIES IS SHOWN FIRING, NOT ASSERTED.
 * Step 2 of the approval chain is a REFUSED self-approval: the preparer tried
 * to approve her own period at 17:44:51 and control FIN-SOD-02 stopped her. A
 * control nobody ever sees fire is a policy. The attempt is written to the
 * audit log rather than discarded, which is the part an auditor actually tests.
 *
 * AND THE SECURITY ARGUMENT, INSIDE A FINANCE CONSOLE.
 * Control FIN-SOD-04 - purchase orders over £10,000.00 need a second approver -
 * is annotated "enforced in the API, not only in the interface", because the
 * most serious finding from our own pre-go-live test was that the threshold
 * had existed in the interface alone. That finding is ticket NWL-4437 on the
 * sprint board, closed on 2026-09-18.
 *
 * ACCESSIBILITY. Reconciliation state is never colour alone: each line renders
 * a SeverityBadge, which is a distinct shape plus the word. Every line with a
 * note has the note written out in full beneath the ledger, so a state that
 * matters is never only a tint in a 16-row table.
 */

import { Ban, Check, Clock, Lock, Scale, UserCheck } from 'lucide-react'
import {
  CLOSE,
  CLOSE_APPROVALS,
  CLOSE_CONTROLS,
  CAPTIONS,
  LEDGER_LINES,
  RECON_STATE_LABEL,
  RECON_STATE_SEVERITY,
  type ApprovalStep,
  type LedgerLine,
} from '@/lib/product-fixtures'
import { SeverityBadge, enterDelay, sevClass } from './Severity'
import { Reveal } from '@/components/ui/Reveal'
import s from './product.module.css'
import d from './delivery.module.css'

const NOTED_LINES = LEDGER_LINES.filter((line) => line.note)
const BLOCKED_STEPS = CLOSE_APPROVALS.filter((step) => step.state === 'blocked').length

export interface ErpLedgerProps {
  /** REQUIRED. Pass `CAPTIONS.erp` for the house default. */
  caption: string
  className?: string
}

export function ErpLedger({ caption, className }: ErpLedgerProps) {
  const resolvedCaption = caption.trim() || CAPTIONS.erp

  return (
    <Reveal as="figure" className={[s.figure, className].filter(Boolean).join(' ')}>
      <div className={s.console}>
        <div className={s.titlebar}>
          <span className={s.titleGroup}>
            <Scale size={13} className={s.titleIcon} aria-hidden="true" />
            <span className={s.title}>Month-end close, {CLOSE.period}</span>
            <span className={s.tenant}>
              {CLOSE.entity} · <span className="u-mono">{CLOSE.entityRef}</span>
            </span>
          </span>
          <span className={s.titleSpacer} />
          <span className={s.titleMeta}>
            <Lock size={11} aria-hidden="true" />
            <span className="u-mono">{CLOSE.periodRef}</span>
            <span>locked</span>
            <span className="u-mono u-tnum">{CLOSE.approvedAt}</span>
          </span>
        </div>

        <dl className={d.facts}>
          <Fact
            index={0}
            label="Variance at close"
            value={
              <span className={`${d.factStrong} u-mono u-tnum`}>{CLOSE.variance}</span>
            }
            sub={`Against a tolerance of ${CLOSE.tolerance}, agreed before the first rehearsal`}
          />
          <Fact
            index={1}
            label="Close duration"
            value={<span className={`${d.factStrong} u-mono u-tnum`}>{CLOSE.closeDays}</span>}
            sub={`${CLOSE.priorCloseDays} on the system this one replaced`}
          />
          <Fact
            index={2}
            label="Journals"
            value={
              <span className="u-mono u-tnum">
                {CLOSE.journalsPosted} posted · {CLOSE.journalsOnHold} on hold
              </span>
            }
            sub={`Ledger ${CLOSE.ledger}, ${CLOSE.currency}. ${CLOSE.fx}.`}
          />
          <Fact
            index={3}
            label="Trial balance"
            value={
              <span className="u-mono u-tnum">
                Dr {CLOSE.debitTotal} · Cr {CLOSE.creditTotal}
              </span>
            }
            sub={`Frozen ${CLOSE.openedAt}, approved ${CLOSE.approvedAt}`}
          />
        </dl>

        <div className={s.toolbar}>
          <span className={s.count}>
            <span className={`${s.countNum} u-mono u-tnum`}>{LEDGER_LINES.length}</span> ledger
            lines ·{' '}
            <span className="u-mono u-tnum">
              {LEDGER_LINES.filter((l) => l.state === 'awaiting').length}
            </span>{' '}
            awaiting evidence
          </span>
          <span className={s.titleSpacer} />
          <span className={s.search}>
            <Clock size={11} aria-hidden="true" />
            <span className="u-mono">period:{CLOSE.periodRef} status:approved</span>
          </span>
        </div>

        {/* --------------------------------------------------------- the ledger --- */}
        <div
          className={`${s.scroller} ${d.ledgerScroll}`}
          role="group"
          aria-label={`Trial balance for ${CLOSE.period}, scrolls horizontally`}
          tabIndex={0}
        >
          <div
            className={`${s.table} ${d.ledgerTable}`}
            role="table"
            aria-label={`General ledger trial balance, ${CLOSE.period}`}
          >
            <div className={s.head} role="row">
              <span className={s.headCell} role="columnheader">
                Account
              </span>
              <span className={s.headCell} role="columnheader">
                Name
              </span>
              <span className={`${s.headCell} ${s.headCellRight}`} role="columnheader">
                Debit
              </span>
              <span className={`${s.headCell} ${s.headCellRight}`} role="columnheader">
                Credit
              </span>
              <span className={s.headCell} role="columnheader">
                Source
              </span>
              <span className={s.headCell} role="columnheader">
                Reconciliation
              </span>
            </div>

            {LEDGER_LINES.map((line, i) => (
              <LedgerRow key={line.account} line={line} index={i} />
            ))}

            {/* The row the whole table exists to produce. */}
            <div className={s.row} role="row">
              <span className={`${s.cell} ${d.totalCell} u-mono`} role="cell">
                —
              </span>
              <span className={`${s.cell} ${d.totalCell}`} role="cell">
                Trial balance
              </span>
              <span className={`${s.cell} ${s.cellRight} ${d.totalCell} u-mono u-tnum`} role="cell">
                {CLOSE.debitTotal}
              </span>
              <span className={`${s.cell} ${s.cellRight} ${d.totalCell} u-mono u-tnum`} role="cell">
                {CLOSE.creditTotal}
              </span>
              <span className={`${s.cell} ${d.totalCell} u-mono u-tnum`} role="cell">
                {CLOSE.variance}
              </span>
              <span className={`${s.cell} ${d.totalCell}`} role="cell">
                Balanced
              </span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------- notes on three lines --- */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Lines carrying a note</span>
            <span className={s.titleSpacer} />
            <span className={s.titleMeta}>
              <span className="u-mono u-tnum">{NOTED_LINES.length}</span> of{' '}
              <span className="u-mono u-tnum">{LEDGER_LINES.length}</span>
            </span>
          </div>
          <div className={s.panelBody}>
            {/* A 16-row table is a poor place to read an exception from, so the
                lines that carry one are written out. This is the record; the
                tint in the table is the locator. */}
            <ul className={d.noteList}>
              {NOTED_LINES.map((line, i) => (
                <li
                  key={line.account}
                  className={`${d.noteRow} ${sevClass[RECON_STATE_SEVERITY[line.state]]}`}
                  style={enterDelay(i)}
                >
                  <SeverityBadge
                    severity={RECON_STATE_SEVERITY[line.state]}
                    label={RECON_STATE_LABEL[line.state]}
                    srPrefix="Reconciliation"
                  />
                  <span className="u-mono u-tnum">{line.account}</span>
                  <span className={s.strong}>{line.name}</span>
                  <span className={d.noteText}>{line.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ------------------------------------------------- the approval chain --- */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <UserCheck size={12} className={s.titleIcon} aria-hidden="true" />
            <span className={s.panelTitle}>Approval chain</span>
            <span className={s.titleSpacer} />
            <span className={s.titleMeta}>
              <span className="u-mono u-tnum">{BLOCKED_STEPS}</span> attempt refused by
              segregation of duties
            </span>
          </div>
          <div className={s.panelBody}>
            <ol className={d.chain}>
              {CLOSE_APPROVALS.map((step, i) => (
                <ChainStep key={step.step} step={step} index={i} />
              ))}
            </ol>
          </div>
        </div>

        {/* ------------------------------------------------------- the controls --- */}
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Controls exercised in this period</span>
            <span className={s.titleSpacer} />
            <span className={s.titleMeta}>
              <span className="u-mono u-tnum">
                {CLOSE_CONTROLS.filter((c) => c.state === 'enforced').length}
              </span>{' '}
              enforced ·{' '}
              <span className="u-mono u-tnum">
                {CLOSE_CONTROLS.filter((c) => c.state === 'exception').length}
              </span>{' '}
              carrying an exception
            </span>
          </div>
          <div
            className={s.scrollerUnmasked}
            role="group"
            aria-label="Controls exercised in this period, scrolls horizontally"
            tabIndex={0}
          >
            <div
              className={`${s.table} ${d.controlTable}`}
              role="table"
              aria-label="Controls exercised in this period"
            >
              <div className={s.head} role="row">
                <span className={s.headCell} role="columnheader">
                  Control
                </span>
                <span className={s.headCell} role="columnheader">
                  What it enforces
                </span>
                <span className={s.headCell} role="columnheader">
                  State
                </span>
                <span className={s.headCell} role="columnheader">
                  Evidence this period
                </span>
              </div>
              {CLOSE_CONTROLS.map((control, i) => {
                const severity = control.state === 'exception' ? 'medium' : 'low'
                return (
                  <div
                    className={`${s.row} ${s.rowHover}`}
                    role="row"
                    key={control.ref}
                    style={enterDelay(i)}
                  >
                    <span
                      className={`${s.cell} ${s.railCell} ${sevClass[severity]} u-mono`}
                      role="cell"
                    >
                      {control.ref}
                    </span>
                    <span className={s.cell} role="cell">
                      <span className={s.cellTruncate} title={control.name}>
                        {control.name}
                      </span>
                    </span>
                    <span className={`${s.cell} ${sevClass[severity]}`} role="cell">
                      <SeverityBadge
                        severity={severity}
                        label={control.state === 'exception' ? 'Exception' : 'Enforced'}
                        srPrefix="Control state"
                      />
                    </span>
                    <span className={`${s.cell} ${s.muted}`} role="cell">
                      <span className={s.cellTruncate} title={control.note}>
                        {control.note}
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className={s.panelBody}>
            <p className={s.panelProse}>
              <span className="u-mono">FIN-SOD-04</span> is annotated &ldquo;enforced in the API,
              not only in the interface&rdquo; because that is precisely what our own pre-go-live
              test found: the purchase-order approval threshold existed in the interface alone, so
              a requisitioner could have approved their own order with a crafted request. It is
              ticket <span className="u-mono">NWL-4437</span> on the delivery board, closed on{' '}
              <span className="u-mono u-tnum">2026-09-18</span>, a finance control, found by the
              security practice, fixed by the engineers who built it, in the same sprint cadence as
              everything else.
            </p>
          </div>
        </div>

        <div className={s.statusbar}>
          <span className={s.statusItem}>
            Prepared <span className={s.statusStrong}>H. Ndiaye</span>
          </span>
          <span className={s.statusItem}>
            Reviewed <span className={s.statusStrong}>P. Lindqvist</span>
          </span>
          <span className={s.statusItem}>
            Approved <span className={s.statusStrong}>J. Abara</span>
          </span>
          <span className={s.statusSpacer} />
          <span className={s.statusItem}>
            Reopening <span className="u-mono">{CLOSE.periodRef}</span> needs two Finance Director
            approvals
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
  sub,
  index,
}: {
  label: string
  value: React.ReactNode
  sub?: string
  index: number
}) {
  return (
    <div className={d.fact} style={enterDelay(index)}>
      <dt className={d.factKey}>{label}</dt>
      <dd className={d.factVal} style={{ margin: 0 }}>
        {value}
        {sub ? (
          <>
            <br />
            <span className={d.metricBasis}>{sub}</span>
          </>
        ) : null}
      </dd>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function LedgerRow({ line, index }: { line: LedgerLine; index: number }) {
  const severity = RECON_STATE_SEVERITY[line.state]

  return (
    <div className={`${s.row} ${s.rowHover}`} role="row" style={enterDelay(index)}>
      <span className={`${s.cell} ${s.railCell} ${sevClass[severity]} u-mono u-tnum`} role="cell">
        {line.account}
      </span>
      <span className={s.cell} role="cell">
        <span className={s.cellTruncate} title={line.name}>
          {line.name}
        </span>
      </span>
      <span className={`${s.cell} ${s.cellRight} u-mono u-tnum`} role="cell">
        {line.debit}
      </span>
      <span className={`${s.cell} ${s.cellRight} u-mono u-tnum`} role="cell">
        {line.credit}
      </span>
      <span className={`${s.cell} ${s.muted}`} role="cell">
        <span className={s.cellTruncate} title={line.source}>
          {line.source}
        </span>
      </span>
      <span className={`${s.cell} ${sevClass[severity]}`} role="cell">
        <SeverityBadge
          severity={severity}
          label={RECON_STATE_LABEL[line.state]}
          srPrefix="Reconciliation"
        />
        {line.note ? <span className={s.srOnly}>, note below the ledger</span> : null}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function ChainStep({ step, index }: { step: ApprovalStep; index: number }) {
  const blocked = step.state === 'blocked'

  return (
    <li
      className={[d.chainStep, blocked ? d.chainBlocked : '', blocked ? sevClass.high : '']
        .filter(Boolean)
        .join(' ')}
      style={enterDelay(index)}
    >
      <span className={d.chainMark} aria-hidden="true">
        {blocked ? <Ban size={12} /> : <Check size={12} />}
      </span>
      <span className={d.chainBody}>
        <span className={d.chainTop}>
          <span className={d.chainAction}>{step.action}</span>
          {blocked ? <SeverityBadge severity="high" label="Refused" srPrefix="Outcome" /> : null}
          <span className={s.muted}>
            <span className="u-mono">{step.name}</span> · {step.role}
          </span>
          <span className={`${s.muted} u-mono u-tnum`}>{step.at}</span>
          {step.control ? (
            <span className={`${d.label} u-mono`}>control {step.control}</span>
          ) : null}
        </span>
        {step.note ? <span className={d.chainNote}>{step.note}</span> : null}
      </span>
    </li>
  )
}
