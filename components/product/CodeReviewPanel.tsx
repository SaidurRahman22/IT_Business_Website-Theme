/**
 * CodeReviewPanel - stylised view of pull request 482, the fix for NWL-4471.
 *
 * Server Component. No client JavaScript.
 *
 * WHY A PULL REQUEST AND NOT A REPORT
 * This is the same finding as ENX-FND-0217 and the same failure as stage 11 of
 * run 2184, arriving in the third form it can take: a comment on a line of
 * code, written by the security engineer, inside the sprint, where the person
 * who will change it is already reading. The thread below is three comments
 * long and the second one raises a follow-up ticket - which is the difference
 * between a finding that gets fixed and a finding that gets fixed properly.
 *
 * MONO THROUGHOUT. Every identifier, path, SHA, timestamp and line number in
 * this component is set in `.u-mono`, because a diff rendered in a proportional
 * face is a picture of a diff rather than a diff.
 *
 * ACCESSIBILITY OF THE DIFF
 * Added and removed lines carry THREE cues - the `+` / `-` glyph in the gutter,
 * a 2px rail, and a tint - so the diff survives greyscale and colour-blindness.
 * The diff is a `<table>`-shaped grid with a visually-hidden column header per
 * line type, and the anchored line is named in the thread's own text as well as
 * marked with an accent rail: the anchor is never conveyed by the rail alone.
 * The diff scroller is keyboard reachable and named.
 */

import { Check, FileCode, GitPullRequest, MessageSquare, Minus } from 'lucide-react'
import {
  CAPTIONS,
  ESTATE,
  PR_CHECKS,
  PR_DIFF,
  PR_REVIEWERS,
  PR_THREAD,
  PULL_REQUEST,
  RUN_STATUS_LABEL,
  RUN_STATUS_SEVERITY,
  type DiffLine,
} from '@/lib/product-fixtures'
import { SeverityBadge, enterDelay, sevClass } from './Severity'
import { Reveal } from '@/components/ui/Reveal'
import s from './product.module.css'
import d from './delivery.module.css'

const REVIEW_STATE_LABEL = {
  approved: 'Approved',
  commented: 'Commented',
  awaiting: 'Awaiting review',
} as const

const REVIEW_STATE_SEVERITY = {
  approved: 'low',
  commented: 'info',
  awaiting: 'medium',
} as const

const HUNK_ADDED = PR_DIFF.filter((line) => line.kind === 'added').length
const HUNK_REMOVED = PR_DIFF.filter((line) => line.kind === 'removed').length

export interface CodeReviewPanelProps {
  /** REQUIRED. Pass `CAPTIONS.review` for the house default. */
  caption: string
  className?: string
}

export function CodeReviewPanel({ caption, className }: CodeReviewPanelProps) {
  const resolvedCaption = caption.trim() || CAPTIONS.review

  return (
    <Reveal as="figure" className={[s.figure, className].filter(Boolean).join(' ')}>
      <div className={s.console}>
        <div className={s.titlebar}>
          <span className={s.titleGroup}>
            <GitPullRequest size={13} className={s.titleIcon} aria-hidden="true" />
            <span className={s.title}>Pull request {PULL_REQUEST.number}</span>
            <span className={s.tenant}>
              <span className="u-mono">{PULL_REQUEST.repo}</span> · {ESTATE.tenant}
            </span>
          </span>
          <span className={s.titleSpacer} />
          <span className={s.titleMeta}>
            <span className="u-mono">{PULL_REQUEST.branch}</span>
            <span>→</span>
            <span className="u-mono">{PULL_REQUEST.base}</span>
          </span>
        </div>

        <div className={d.commitBar}>
          <span className={d.commitMsg}>{PULL_REQUEST.title}</span>
          <span className={s.titleSpacer} />
          <span className={s.muted}>
            <span className="u-mono">{PULL_REQUEST.ticket}</span> · opened{' '}
            <span className="u-mono u-tnum">{PULL_REQUEST.openedAt}</span> by{' '}
            {PULL_REQUEST.author}
          </span>
        </div>

        <dl className={d.facts}>
          <Fact
            index={0}
            label="State"
            value={
              <SeverityBadge
                severity="low"
                label={PULL_REQUEST.state}
                srPrefix="Review state"
                className={sevClass.low}
              />
            }
          />
          <Fact
            index={1}
            label="Change"
            value={
              <span className="u-mono u-tnum">
                +{PULL_REQUEST.added} −{PULL_REQUEST.removed} across {PULL_REQUEST.filesChanged}{' '}
                files
              </span>
            }
          />
          <Fact
            index={2}
            label="Head"
            value={
              <span className="u-mono">
                {PULL_REQUEST.headSha} · {PULL_REQUEST.commits} commits
              </span>
            }
          />
          <Fact
            index={3}
            label="Merged"
            value={<span className="u-mono u-tnum">{PULL_REQUEST.mergedAt} UTC</span>}
          />
        </dl>

        {/* ----------------------------------------------- reviewers and checks --- */}
        <div className={d.prSplit}>
          <div className={d.prBlock}>
            <p className={s.sectionLabel}>Reviewers</p>
            <ul className={d.reviewerList}>
              {PR_REVIEWERS.map((reviewer, i) => (
                <li
                  key={reviewer.name}
                  className={`${d.reviewer} ${sevClass[REVIEW_STATE_SEVERITY[reviewer.state]]}`}
                  style={enterDelay(i)}
                >
                  <span className={d.reviewerName}>{reviewer.name}</span>
                  <SeverityBadge
                    severity={REVIEW_STATE_SEVERITY[reviewer.state]}
                    label={REVIEW_STATE_LABEL[reviewer.state]}
                    srPrefix="Review"
                  />
                  <span className={d.rowSpacer} />
                  <span className={s.muted}>{reviewer.role}</span>
                  {reviewer.at ? (
                    <span className={`${s.muted} u-mono u-tnum`}>{reviewer.at}</span>
                  ) : null}
                </li>
              ))}
            </ul>
            <p className={s.caption}>
              The security practice is a required reviewer on every path that touches
              authentication, authorisation, cryptography or tenant-scoped data. 64 routes carry an
              authorisation contract test; the branch protection rule names them.
            </p>
          </div>

          <div className={d.prBlock}>
            <p className={s.sectionLabel}>Checks</p>
            <ul className={d.checkList}>
              {PR_CHECKS.map((check, i) => (
                <li
                  key={check.name}
                  className={`${d.check} ${sevClass[RUN_STATUS_SEVERITY[check.status]]}`}
                  style={enterDelay(i)}
                >
                  <SeverityBadge
                    severity={RUN_STATUS_SEVERITY[check.status]}
                    label={RUN_STATUS_LABEL[check.status]}
                    srPrefix="Check"
                  />
                  <span className={`${d.checkName} u-mono`}>{check.name}</span>
                  <span className={d.rowSpacer} />
                  <span className={s.muted}>{check.detail}</span>
                  <span className={`${s.muted} u-mono u-tnum`}>{check.duration}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ----------------------------------------------------------- the diff --- */}
        <div className={d.diffHead}>
          <FileCode size={12} className={s.titleIcon} aria-hidden="true" />
          <span className={`${d.diffFile} u-mono`}>{PULL_REQUEST.file}</span>
          <span className={s.titleSpacer} />
          {/* Counted from the diff rather than written down, so the header
              cannot drift away from the lines underneath it. */}
          <span className="u-mono u-tnum">
            +{HUNK_ADDED} −{HUNK_REMOVED} in this hunk
          </span>
        </div>

        <div
          className={`${s.scrollerUnmasked} ${d.diffScroll}`}
          role="group"
          aria-label={`Unified diff of ${PULL_REQUEST.file}`}
          tabIndex={0}
        >
          {/* No visible header row. A real diff viewer has none, and a row of
              three visually-hidden column headers rendered a stray "#" on its
              own line above the hunk. The per-line role and the hidden word in
              each gutter cell ("Added line", "Removed line") carry the same
              information without inventing a header a diff does not have. */}
          <div className={`${d.diff} u-mono`} role="table" aria-label="Unified diff">
            {PR_DIFF.map((line, i) => (
              <DiffRow key={`${i}-${line.text}`} line={line} anchored={line.n === PR_THREAD.line} />
            ))}
          </div>
        </div>

        {/* --------------------------------------------------------- the thread --- */}
        <div className={d.thread}>
          <div className={d.threadHead}>
            <MessageSquare size={12} aria-hidden="true" />
            <span className={s.strong}>{PR_THREAD.comments.length} comments</span>
            <span>on line</span>
            <span className="u-mono u-tnum">{PR_THREAD.line}</span>
            <span className={`${d.threadAnchor} u-mono`}>{PR_THREAD.anchor}</span>
            <span className={s.titleSpacer} />
            <span className={s.state}>
              <Check size={11} aria-hidden="true" />
              Resolved by {PR_THREAD.resolvedBy} at{' '}
              <span className="u-mono u-tnum">{PR_THREAD.resolvedAt}</span>
            </span>
          </div>

          <ol className={d.comments}>
            {PR_THREAD.comments.map((comment, i) => (
              <li
                key={comment.at}
                className={[d.comment, i === 0 ? d.commentSecurity : ''].filter(Boolean).join(' ')}
                style={enterDelay(i)}
              >
                <span className={d.commentHead}>
                  <span className={d.commentAuthor}>{comment.author}</span>
                  <span>{comment.role}</span>
                  <span className="u-mono u-tnum">{comment.at} UTC</span>
                </span>
                <p className={d.commentBody}>{comment.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className={s.statusbar}>
          <span className={s.statusItem}>
            <Minus size={11} aria-hidden="true" aria-label="" />
            Branch protection: 2 approvals, 1 from the security practice
          </span>
          <span className={s.statusSpacer} />
          <span className={s.statusItem}>
            Follow-up <span className="u-mono">NWL-4488</span> raised before merge
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

const MARK: Record<DiffLine['kind'], string> = {
  added: '+',
  removed: '-',
  context: ' ',
  hunk: ' ',
}

const KIND_WORD: Record<DiffLine['kind'], string> = {
  added: 'Added line',
  removed: 'Removed line',
  context: 'Unchanged line',
  hunk: 'Hunk header',
}

function DiffRow({ line, anchored }: { line: DiffLine; anchored: boolean }) {
  const cls = [
    d.diffRow,
    line.kind === 'added' ? d.diffAdded : '',
    line.kind === 'removed' ? d.diffRemoved : '',
    line.kind === 'hunk' ? d.diffHunk : '',
    anchored ? d.diffAnchor : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cls} role="row">
      <span className={d.diffNum} role="cell">
        {line.n ?? ' '}
      </span>
      <span className={d.diffMark} role="cell">
        <span aria-hidden="true">{MARK[line.kind]}</span>
        <span className={s.srOnly}>
          {KIND_WORD[line.kind]}
          {anchored ? ', the line this review thread is anchored to' : ''}
        </span>
      </span>
      <span className={d.diffText} role="cell">
        {line.text || ' '}
      </span>
    </div>
  )
}
