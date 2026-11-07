/**
 * SprintBoard - stylised view of the delivery board, sprint 34, day 8 of 10.
 *
 * Server Component. No client JavaScript.
 *
 * THIS IS THE ARGUMENT, DRAWN.
 * Five of the fifteen tickets on this board came from the security practice.
 * They are not in a separate swimlane, a separate project or a separate tool:
 * they have ticket IDs from the same sequence, story points from the same
 * refinement, and they sit in the same four columns as the features. The claim
 * "security findings enter the same backlog as features, with the same sprint
 * commitment" is the kind of sentence every firm writes. A board where you can
 * count them is the version you can check.
 *
 * Each security ticket also prints its ORIGIN - "Finding ENX-FND-0217 ·
 * continuous review, 2026-10-13", "Threat model control 07". Provenance is what
 * separates a security label from a security process.
 *
 * WHY THE BOARD SCROLLS RATHER THAN REFLOWS
 * Four columns that collapse into one stacked list at 390px is not a board, it
 * is a list of tickets - and the whole point of the picture is the columns. So
 * the board keeps its columns at a 16.5rem minimum and scrolls horizontally
 * inside its own scroller, which is what every real board does on a phone. The
 * scroller carries an accessible name and a tab stop so a keyboard user can
 * reach the later columns.
 *
 * ACCESSIBILITY. Severity is never colour alone: a security ticket renders a
 * SeverityBadge (distinct shape plus the word) as well as the tinted rail. The
 * sentence under the board states the count in prose, so the "four of fifteen"
 * fact does not depend on seeing the tint.
 */

import { CircleDot, Tag, Users } from 'lucide-react'
import {
  CAPTIONS,
  ESTATE,
  SECURITY_TICKET_COUNT,
  SPRINT,
  TICKETS,
  TICKET_COLUMNS,
  TICKET_COLUMN_LABEL,
  type Ticket,
  type TicketColumn,
} from '@/lib/product-fixtures'
import { SeverityBadge, enterDelay, sevClass } from './Severity'
import { Reveal } from '@/components/ui/Reveal'
import s from './product.module.css'
import d from './delivery.module.css'

const byColumn = (column: TicketColumn) => TICKETS.filter((t) => t.column === column)
const pointsIn = (column: TicketColumn) =>
  byColumn(column).reduce((total, t) => total + t.points, 0)

export interface SprintBoardProps {
  /** REQUIRED. Pass `CAPTIONS.sprint` for the house default. */
  caption: string
  className?: string
}

export function SprintBoard({ caption, className }: SprintBoardProps) {
  const resolvedCaption = caption.trim() || CAPTIONS.sprint

  return (
    <Reveal as="figure" className={[s.figure, className].filter(Boolean).join(' ')}>
      <div className={s.console}>
        <div className={s.titlebar}>
          <span className={s.titleGroup}>
            <CircleDot size={13} className={s.titleIcon} aria-hidden="true" />
            <span className={s.title}>
              {SPRINT.board}, sprint {SPRINT.number}
            </span>
            <span className={s.tenant}>
              {ESTATE.tenant} · <span className="u-mono">{ESTATE.tenantRef}</span>
            </span>
          </span>
          <span className={s.titleSpacer} />
          <span className={s.titleMeta}>
            <span className="u-mono u-tnum">
              {SPRINT.from} → {SPRINT.to}
            </span>
            <span>· {SPRINT.dayOf}</span>
          </span>
        </div>

        <div className={s.toolbar}>
          <span className={s.count}>
            <span className={`${s.countNum} u-mono u-tnum`}>{TICKETS.length}</span> tickets ·{' '}
            <span className="u-mono u-tnum">{SPRINT.completed}</span> of{' '}
            <span className="u-mono u-tnum">{SPRINT.committed}</span> points complete
          </span>
          <span className={s.chipRow}>
            <Tag size={11} className={s.titleIcon} aria-hidden="true" />
            <span className={`${s.chip} ${s.chipActive}`}>
              Raised by the security practice
              <span className={`${s.chipCount} u-mono u-tnum`}>{SECURITY_TICKET_COUNT}</span>
            </span>
            <span className={s.chip}>
              Forecast at close
              <span className={`${s.chipCount} u-mono u-tnum`}>{SPRINT.forecast}</span>
            </span>
            <span className={s.chip}>
              Carrying to sprint {SPRINT.number + 1}
              <span className={`${s.chipCount} u-mono u-tnum`}>{SPRINT.carrying}</span>
            </span>
          </span>
        </div>

        {/* ---------------------------------------------------------- the board --- */}
        <div
          className={`${s.scrollerUnmasked} ${d.boardScroll}`}
          role="group"
          aria-label={`Sprint ${SPRINT.number} board: four columns, scrolls horizontally`}
          tabIndex={0}
        >
          <div className={d.board}>
            {TICKET_COLUMNS.map((column) => {
              const tickets = byColumn(column)
              return (
                <section
                  key={column}
                  className={d.boardCol}
                  aria-label={`${TICKET_COLUMN_LABEL[column]}, ${tickets.length} tickets, ${pointsIn(column)} points`}
                >
                  <header className={d.colHead}>
                    <span className={d.colName}>{TICKET_COLUMN_LABEL[column]}</span>
                    <span className={`${d.colCount} u-mono u-tnum`}>{tickets.length}</span>
                    <span className={`${d.colPoints} u-mono u-tnum`}>{pointsIn(column)} pts</span>
                  </header>
                  <ul className={d.colList}>
                    {tickets.map((ticket, i) => (
                      <TicketCard key={ticket.id} ticket={ticket} index={i} />
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        </div>

        {/* ------------------------------------------- the sentence that is the point --- */}
        <div className={s.panel}>
          <div className={s.panelBody}>
            <div className={s.verdict}>
              <span className={s.verdictHead}>
                <span className={s.verdictLabel}>Why this board is the argument</span>
              </span>
              <p className={s.panelProse}>
                <strong className={s.strong}>
                  {SECURITY_TICKET_COUNT} of the {TICKETS.length} tickets here were raised by the
                  security practice.
                </strong>{' '}
                They carry IDs from the same sequence, points from the same refinement and a place
                in the same four columns as the features beside them. There is no security backlog
                to deprioritise, because there is no security backlog, and each one prints where it
                came from, so the provenance is checkable rather than asserted.
              </p>
              <p className={s.panelProse}>
                {SPRINT.ceremony}. Day 8 of 10, with{' '}
                <span className="u-mono u-tnum">{SPRINT.completed}</span> of{' '}
                <span className="u-mono u-tnum">{SPRINT.committed}</span> points done and{' '}
                <span className="u-mono u-tnum">{SPRINT.carrying}</span> forecast to carry. A sprint
                that lands exactly on its commitment every time is a sprint whose numbers are
                decoration.
              </p>
            </div>
          </div>
        </div>

        <div className={s.statusbar}>
          <span className={s.statusItem}>
            <Users size={11} aria-hidden="true" />
            {SPRINT.team}
          </span>
          <span className={s.statusSpacer} />
          <span className={s.statusItem}>
            Board key <span className="u-mono">{SPRINT.key}</span>
          </span>
        </div>
      </div>
      <figcaption className={s.caption}>{resolvedCaption}</figcaption>
    </Reveal>
  )
}

/* -------------------------------------------------------------------------- */

function TicketCard({ ticket, index }: { ticket: Ticket; index: number }) {
  const security = ticket.severity !== undefined

  return (
    <li
      className={[d.card, security ? d.cardSec : '', security ? sevClass[ticket.severity!] : '']
        .filter(Boolean)
        .join(' ')}
      style={enterDelay(index)}
    >
      <span className={d.cardTop}>
        <span className={`${d.cardId} u-mono`}>{ticket.id}</span>
        {security ? (
          <SeverityBadge severity={ticket.severity!} srPrefix="Security finding severity" />
        ) : null}
        <span className={`${d.cardPts} u-mono u-tnum`}>
          {ticket.points}
          <span className={s.srOnly}> story points</span>
        </span>
      </span>

      <p className={d.cardTitle}>{ticket.title}</p>

      <span className={d.cardFoot}>
        <span>{ticket.assignee === '—' ? 'Unassigned' : ticket.assignee}</span>
        {ticket.labels.map((label) => (
          <span
            key={label}
            className={[d.label, label === 'security' ? d.labelSec : ''].filter(Boolean).join(' ')}
          >
            {label}
          </span>
        ))}
      </span>

      {ticket.origin ? <span className={d.cardOrigin}>{ticket.origin}</span> : null}
      {ticket.note ? <span className={d.cardNote}>{ticket.note}</span> : null}
    </li>
  )
}
