/**
 * COMPARISON TABLE - "two vendors vs. one partner", for /services/devsecops.
 *
 * A real <table> with a real <caption>, real <th scope="col"> and real
 * <th scope="row">. No JavaScript: this is a server component.
 *
 * At narrow widths the table becomes a card stack, which is done with display
 * changes on the table elements - and changing `display` on a table is exactly
 * what removes `table`, `row` and `cell` from the accessibility tree. So the
 * native roles are *also* declared explicitly in the markup at every width,
 * and every data cell carries `data-label` plus a rendered mono label, so the
 * header association survives the layout change visually as well as
 * programmatically. The table never overflows; it is never scrolled sideways.
 */

import { ShieldCheck, Users } from 'lucide-react'
import styles from './diagram.module.css'

export type ComparisonRow = {
  /** The row header - the thing being compared. */
  label: string
  /** The two-vendor answer. */
  split: string
  /** The one-partner answer. */
  joined: string
}

export type ComparisonTableProps = {
  /** The <caption>. States what the table is for, in a sentence. */
  caption?: string
  /** Heading for the two-vendor column. */
  splitHeading?: string
  /** Heading for the one-partner column. */
  joinedHeading?: string
  rows?: readonly ComparisonRow[]
  /** Footnote under the table - sourcing, caveats. */
  note?: string
  className?: string
}

export const comparisonRows: readonly ComparisonRow[] = [
  {
    label: 'Hand-off cost',
    split:
      'A full re-learning period, paid twice. The testers meet the architecture for the first time in week forty-one, and the engineers who could answer their questions have rolled off the account.',
    joined:
      'None to pay. The tester who runs the pre-release test read the first decision record in week two, and has been in the stand-up ever since.',
  },
  {
    label: 'Remediation lead time',
    split:
      'Weeks. A finding is written into one firm’s report, triaged in a meeting, re-estimated into another firm’s backlog, then scheduled against a roadmap that was agreed before the finding existed.',
    joined:
      'Nine days median, from a finding being confirmed to the fix being live, measured in your tracker and your pipeline, not ours, and reported monthly as a distribution rather than a headline.',
  },
  {
    label: 'Who is accountable when it breaks',
    split:
      'Both firms, which in practice means neither. The builder points at the specification, the tester points at the build, and you hold two contracts that each exclude the other’s work.',
    joined:
      'One contract, one backlog, one named engineering lead. The pre-release test is still signed by a tester who contributed no code, and the report comes to you unedited.',
  },
]

export function ComparisonTable({
  caption = 'What changes when the people who test the system share a backlog with the people who build it. The left column is the standard arrangement; nobody in it behaves badly, and the outcome is still worse.',
  splitHeading = 'Two vendors',
  joinedHeading = 'One partner',
  rows = comparisonRows,
  note = 'The nine-day median is drawn from joint engagements where we hold both the confirmation timestamp and the deploy timestamp. Engagements where we cannot see both are excluded rather than estimated.',
  className,
}: ComparisonTableProps) {
  return (
    <div className={[styles.tableWrap, className].filter(Boolean).join(' ')}>
      <table className={styles.table} role="table">
        <caption className={styles.tableCaption}>{caption}</caption>
        <thead>
          <tr role="row">
            <th scope="col" role="columnheader" className={styles.colHead} data-col="label">
              <span className={styles.srOnly}>Compared on</span>
            </th>
            <th scope="col" role="columnheader" className={styles.colHead} data-col="split">
              <span className={styles.colHeadInner}>
                <Users className={styles.colHeadIcon} aria-hidden="true" focusable="false" />
                {splitHeading}
              </span>
            </th>
            <th scope="col" role="columnheader" className={styles.colHead} data-col="joined">
              <span className={styles.colHeadInner}>
                <ShieldCheck className={styles.colHeadIcon} aria-hidden="true" focusable="false" />
                {joinedHeading}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} role="row" className={styles.row}>
              <th scope="row" role="rowheader" className={styles.rowHead}>
                {row.label}
              </th>
              <td role="cell" className={styles.cell} data-col="split" data-label={splitHeading}>
                <span className={styles.cellLabel} aria-hidden="true">
                  {splitHeading}
                </span>
                {row.split}
              </td>
              <td role="cell" className={styles.cell} data-col="joined" data-label={joinedHeading}>
                <span className={styles.cellLabel} aria-hidden="true">
                  {joinedHeading}
                </span>
                {row.joined}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {note ? <p className={styles.tableNote}>{note}</p> : null}
    </div>
  )
}

export default ComparisonTable
