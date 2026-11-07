/**
 * EdrFleetView - stylised view of the managed EDR fleet console.
 *
 * Server Component. No client JavaScript at all.
 *
 * Two halves, which is how an EDR console actually works:
 *   1. the FLEET - 48 of 1,284 monitored endpoints as dense status tiles, with
 *      a legend that carries the counts as text;
 *   2. the DETECTION - one endpoint opened up: the process tree that fired,
 *      command lines truncated with the full text on hover AND focus, hashes in
 *      mono, and the containment action with its timestamp, the analyst who
 *      authorised it, and the mandate they authorised it under.
 *
 * The containment block is the part that matters. "We detected it" is a
 * product claim. "K. Osei isolated NWL-WS-2290 at 13:54:02 UTC, 1 m 43 s after
 * detection, under MSA-4471 Schedule 3 §2.4, having first taken a memory image"
 * is a service claim, and a service is what is being sold.
 */

import { CornerDownRight, Cpu, Laptop, LockOpen, ShieldBan } from 'lucide-react'
import {
  CAPTIONS,
  CONTAINMENT,
  ENDPOINTS,
  ENDPOINT_STATUS_LABEL,
  ENDPOINT_STATUS_SEVERITY,
  ESTATE,
  FLEET_SUMMARY,
  PROCESS_TREE,
  type Endpoint,
  type EndpointStatus,
  type ProcessNode,
} from '@/lib/product-fixtures'
import { SeverityBadge, enterDelay, sevClass } from './Severity'
import { Reveal } from '@/components/ui/Reveal'
import s from './product.module.css'

/** Legend order: worst first, so the eye lands on the exceptions. */
const STATUS_ORDER: readonly EndpointStatus[] = [
  'detection',
  'isolated',
  'stale-telemetry',
  'healthy',
]

export interface EdrFleetViewProps {
  /** REQUIRED. Pass `CAPTIONS.edr` for the house default. */
  caption: string
  className?: string
}

export function EdrFleetView({ caption, className }: EdrFleetViewProps) {
  const resolvedCaption = caption.trim() || CAPTIONS.edr

  return (
    <Reveal as="figure" className={[s.figure, className].filter(Boolean).join(' ')}>
      <div className={s.console}>
        <div className={s.titlebar}>
          <span className={s.titleGroup}>
            <Laptop size={13} className={s.titleIcon} aria-hidden="true" />
            <span className={s.title}>Managed EDR, Fleet</span>
            <span className={s.tenant}>
              {ESTATE.tenant} · <span className="u-mono">{ESTATE.estate}</span>
            </span>
          </span>
          <span className={s.titleSpacer} />
          <span className={s.titleMeta}>
            <span className="u-mono u-tnum">{FLEET_SUMMARY.shown}</span> of{' '}
            <span className="u-mono u-tnum">{FLEET_SUMMARY.monitored.toLocaleString('en-GB')}</span>{' '}
            endpoints
          </span>
        </div>

        <div className={s.toolbar}>
          <span className={s.count}>
            Filter <span className="u-mono">subnet:{ESTATE.subnets.server}</span> +{' '}
            <span className="u-mono">{ESTATE.subnets.client}</span>
          </span>
          <span className={s.titleSpacer} />
          <span className={s.chipRow}>
            {STATUS_ORDER.map((status) => (
              <span key={status} className={s.legendItem}>
                <SeverityBadge
                  severity={ENDPOINT_STATUS_SEVERITY[status]}
                  label={ENDPOINT_STATUS_LABEL[status]}
                  srPrefix="Status"
                />
                <span className={`${s.chipCount} u-mono u-tnum`}>
                  {FLEET_SUMMARY.byStatus[status]}
                </span>
              </span>
            ))}
          </span>
        </div>

        {/* A scrollable region needs an accessible name and a tab stop, or a
            keyboard user cannot reach the endpoints that have scrolled away. */}
        <div
          className={`${s.scroller} ${s.fleetScroll}`}
          role="group"
          aria-label="Monitored endpoints, scrolls vertically"
          tabIndex={0}
        >
          <ul className={s.tileGrid} aria-label="Endpoint fleet status">
            {ENDPOINTS.map((ep, i) => (
              <EndpointTile key={ep.host} endpoint={ep} index={i} />
            ))}
          </ul>
        </div>

        <DetectionPanel />

        <div className={s.statusbar}>
          <span className={s.statusItem}>
            <Cpu size={11} aria-hidden="true" />
            Agent <span className="u-mono">enxagent 6.4.2</span> on{' '}
            <span className={`${s.statusStrong} u-mono u-tnum`}>
              {ENDPOINTS.filter((e) => e.agent === 'enxagent 6.4.2').length}
            </span>{' '}
            of {FLEET_SUMMARY.shown}
          </span>
          <span className={s.statusItem}>
            Telemetry gap threshold <span className="u-mono">4 h</span>
          </span>
          <span className={s.statusSpacer} />
          <span className={s.statusItem}>
            Containment mandate <span className={s.statusStrong}>contain-first</span>
          </span>
        </div>
      </div>
      <figcaption className={s.caption}>{resolvedCaption}</figcaption>
    </Reveal>
  )
}

/* -------------------------------------------------------------------------- */

function EndpointTile({ endpoint, index }: { endpoint: Endpoint; index: number }) {
  const severity = ENDPOINT_STATUS_SEVERITY[endpoint.status]
  const exceptional = endpoint.status !== 'healthy'

  return (
    <li
      className={`${s.tile} ${sevClass[severity]} ${exceptional ? s.tileFlagged : ''}`}
      style={enterDelay(index)}
    >
      <span className={s.tileHost}>
        <span className="u-mono" title={`${endpoint.host}, ${endpoint.ip}, ${endpoint.os}`}>
          {endpoint.host}
        </span>
      </span>
      <span className={s.tileMeta}>
        {/* Status as TEXT on every tile, not just as a coloured mark. */}
        <span className={exceptional ? s.tileStatusFlagged : s.muted}>
          {ENDPOINT_STATUS_LABEL[endpoint.status]}
        </span>
        <span className={`${s.muted} u-mono u-tnum`}>{endpoint.lastSeen}</span>
      </span>
    </li>
  )
}

/* -------------------------------------------------------------------------- */

function DetectionPanel() {
  return (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <SeverityBadge severity="critical" srPrefix="Severity" />
        <span className={s.panelTitle}>
          <span className="u-mono">{CONTAINMENT.host}</span>, rundll32 spawned from PowerShell
          with network callout
        </span>
        <span className={s.titleSpacer} />
        <span className={s.titleMeta}>
          <span className="u-mono">ENX-88188</span> ·{' '}
          <span className="u-mono">T1218.011</span>{' '}
          <span className={s.muted}>System Binary Proxy Execution: Rundll32</span>
        </span>
      </div>

      <div className={s.panelBody}>
        <div>
          <p className={s.sectionLabel}>Process tree</p>
          <ul className={s.tree}>
            <ProcessBranch node={PROCESS_TREE} depth={0} index={0} />
          </ul>
          <p className={`${s.caption} ${s.treeFootnote}`}>
            Command lines are truncated to one line. The full string is shown on hover and on
            keyboard focus; SHA-256 digests are truncated to the first 16 hex characters, as the
            console renders them.
          </p>
        </div>

        <div className={s.verdict}>
          <span className={s.verdictHead}>
            <span className={s.verdictLabel}>
              <ShieldBan size={11} aria-hidden="true" /> Containment executed
            </span>
            <span className="u-mono u-tnum">
              {CONTAINMENT.date} {CONTAINMENT.at} UTC
            </span>
            <span className={s.noteAnalyst}>
              {CONTAINMENT.authorisedBy}, {CONTAINMENT.role}
            </span>
          </span>

          <p className={s.panelProse}>
            <strong className={s.strong}>{CONTAINMENT.action}</strong> on{' '}
            <span className="u-mono">{CONTAINMENT.host}</span>, {CONTAINMENT.elapsed}.{' '}
            {CONTAINMENT.mandate}.
          </p>

          <div>
            <p className={s.sectionLabel}>Artefacts captured before isolation</p>
            <dl className={s.kv}>
              {CONTAINMENT.artefacts.map((a) => (
                <div key={a.label} className={s.kvRow}>
                  <dt className={s.kvKey}>{a.label}</dt>
                  <dd className={`${s.kvVal} ${a.mono ? 'u-mono' : ''}`}>{a.value}</dd>
                </div>
              ))}
              <div className={s.kvRow}>
                <dt className={s.kvKey}>Isolation lifted</dt>
                <dd className={s.kvVal}>
                  {CONTAINMENT.reversedAt ?? (
                    <span className={s.muted}>
                      <LockOpen size={11} aria-hidden="true" /> Not yet, host stays isolated
                      pending client rebuild
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function ProcessBranch({
  node,
  depth,
  index,
}: {
  node: ProcessNode
  depth: number
  index: number
}) {
  const sev = node.severity

  return (
    <li
      className={`${s.treeNode} ${sev ? sevClass[sev] : ''}`}
      style={enterDelay(index + depth)}
    >
      <div className={`${s.treeRow} ${sev ? s.treeRowFlagged : ''}`}>
        <span className={s.treeGlyph} aria-hidden="true">
          {depth > 0 ? <CornerDownRight size={12} /> : <Cpu size={12} />}
        </span>

        <span className={s.treeName}>
          <span className="u-mono">{node.name}</span>
          <span className={`${s.muted} u-mono u-tnum`}>pid {node.pid}</span>
          {sev ? <SeverityBadge severity={sev} srPrefix="Severity" /> : null}
        </span>

        <span className={s.treeFacts}>
          <span className={s.treeFact}>
            <span className={s.muted}>sha256</span>{' '}
            <span className="u-mono">{node.sha256}…</span>
          </span>
          <span className={s.treeFact}>
            <span className={s.muted}>signer</span> {node.signer}
          </span>
        </span>

        {/* Truncated command line. The CLIPPING IS VISUAL ONLY, the trigger
            already contains the whole string, so assistive tech reads it in
            full and the tooltip is a sighted-reader affordance, marked
            aria-hidden to avoid announcing the same command line twice. The
            trigger is focusable so the tooltip opens from the keyboard too. */}
        <span className={s.tipWrap}>
          <span className={`${s.tipTrigger} u-mono`} tabIndex={0}>
            {node.cmdline}
          </span>
          <span className={`${s.tip} u-mono`} aria-hidden="true">
            {node.cmdline}
          </span>
        </span>
      </div>

      {node.children?.length ? (
        <ul className={s.tree}>
          {node.children.map((child, i) => (
            <ProcessBranch key={child.pid} node={child} depth={depth + 1} index={index + i + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
