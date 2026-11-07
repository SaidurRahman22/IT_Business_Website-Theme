'use client'

/**
 * SECURE SDLC PIPELINE - the second scroll-driven moment on the site.
 * SVG + stroke-dash. No WebGL. See PART 8.5.
 *
 * ---------------------------------------------------------------------------
 * THE ARGUMENT THE DIAGRAM MAKES
 * ---------------------------------------------------------------------------
 * Seven stages across two lanes. The lane says which squad owns the stage; the
 * caption under each node says what artefact it produces. The stages alternate
 * lanes, so every one of the six transitions is a crossing - six hand-offs and
 * zero hand-overs, which is the whole commercial point. The seventh stage
 * returns to the first; that return path is drawn differently from the spine
 * because closing the loop is the claim no competitor diagram makes.
 *
 * ---------------------------------------------------------------------------
 * RENDER CONTRACT - JS-OFF AND REDUCED-MOTION ARE THE DEFAULT, NOT A FALLBACK
 * ---------------------------------------------------------------------------
 * The un-animated state IS the finished state: every node is lit and every
 * path is fully stroked with no dash at all. JS opts *into* starting from zero
 * by setting `data-animate="true"` on the <figure> in a layout effect, and it
 * declines to do so under `prefers-reduced-motion: reduce`. Nothing is ever
 * left invisible waiting for a script.
 *
 * ---------------------------------------------------------------------------
 * GEOMETRY AND THE DASH ARITHMETIC
 * ---------------------------------------------------------------------------
 * viewBox 1200 x 470. Seven nodes, PAD_X 96 each side, so
 *   step = (1200 - 2 * 96) / 6 = 168
 *   node x = 96, 264, 432, 600, 768, 936, 1104
 * 96 rather than something tighter because the outermost captions are centred
 * on the outermost nodes, and they need half a caption of clearance at each
 * end of the viewBox.
 * Lanes: security y = 150, dev y = 260 (gap 110). Node radius 19, with a 4u
 * stub so a spine edge starts and ends clear of the discs it joins.
 *
 * SPINE EDGE (identical for all six - they are congruent, only mirrored):
 *   horizontal  = (x1 - R - STUB) - (x0 + R + STUB) - 2*CORNER
 *               = 168 - 46 - 32                                   =  90
 *   vertical    = 110 - 2*CORNER = 110 - 32                       =  78
 *   two quarter arcs, r = 16   = 2 * (pi/2) * 16 = 16*pi          =  50.26548
 *                                                           TOTAL = 218.26548
 *
 * RETURN PATH (stage 7 -> stage 1, routed under the whole diagram):
 *   riser down  = 380 - (150 + 19 + 4) = 380 - 173                = 207
 *   horizontal  = (1104 - 40) - (96 + 40) = 1064 - 136            = 928
 *   riser up    = 380 - 173                                       = 207
 *   two quarter arcs, r = 40   = 2 * (pi/2) * 40 = 40*pi          = 125.66371
 *                                                           TOTAL = 1467.66371
 *
 * Those constants ship as the inline `--dash` so the very first painted frame
 * is correct, and `getTotalLength()` refines them at mount so a browser that
 * flattens arcs slightly differently still lands exactly on zero. A guessed
 * dash length is what produces the visible snap at the end of a draw.
 */

import { useEffect, useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { RotateCcw } from 'lucide-react'
import type { Phase } from '@/lib/services'
import styles from './diagram.module.css'

/* ========================================================================== *
 * DATA
 * ========================================================================== */

export type PipelineLane = 'security' | 'dev'

export type PipelineStage = {
  /** 1-based position. */
  n: number
  /** Stable key. */
  id: string
  /** Full stage name - this is what the ordered list renders. */
  name: string
  /** `name` pre-wrapped for the SVG. One or two lines. */
  nameLines: readonly string[]
  /** Which squad owns it. Decides the lane the node sits in. */
  lane: PipelineLane
  /** Lane label, e.g. "Security squad". */
  owner: string
  /** The artefact the stage produces - the second lane of information. */
  artefact: string
  /** `artefact` pre-wrapped for the SVG. One or two lines. */
  artefactLines: readonly string[]
  /** When it happens, mirrored from the service phase `days`. */
  when: string
  /** One sentence, for the ordered list. */
  detail: string
}

const SECURITY = 'Security squad'
const DEV = 'Dev squad'

/**
 * The seven stages.
 *
 * Names and `when` values are taken verbatim from
 * `servicesBySlug['devsecops'].phases` in `lib/services.ts` so the diagram and
 * the page prose cannot drift. The service has six phases; the sixth,
 * "Monitor and retest", is drawn as two stages because the retest is the edge
 * that closes the loop and it needs its own node to be the thing the return
 * path leaves from.
 *
 * `lane` and `artefact` are the diagram's own two lanes - neither exists on
 * the `Phase` type.
 */
export const sdlcStages: readonly PipelineStage[] = [
  {
    n: 1,
    id: 'threat-model',
    name: 'Threat model',
    nameLines: ['Threat model'],
    lane: 'security',
    owner: SECURITY,
    artefact: 'a ranked control list',
    artefactLines: ['Ranked control list'],
    when: 'Before sprint 1',
    detail:
      'Security and engineering in one room with the architecture, before a line of it is built. The cheapest security finding is an architecture decision.',
  },
  {
    n: 2,
    id: 'secure-design-review',
    name: 'Secure design review',
    nameLines: ['Secure design', 'review'],
    lane: 'dev',
    owner: DEV,
    artefact: 'a signed decision record',
    artefactLines: ['Signed decision', 'record'],
    when: 'Per architectural decision',
    detail:
      'Engineers author the decision record and a security engineer reads it before it is built. Disagreements get resolved in the record, so the reasoning survives the people.',
  },
  {
    n: 3,
    id: 'secure-code-review',
    name: 'Secure code review',
    nameLines: ['Secure code', 'review'],
    lane: 'security',
    owner: SECURITY,
    artefact: 'comments on the pull request',
    artefactLines: ['Comments on the', 'pull request'],
    when: 'Continuous',
    detail:
      'Every pull request touching authentication, authorisation, cryptography or data access gets a security read. Comments in the PR, not a separate report nobody opens.',
  },
  {
    n: 4,
    id: 'pipeline-gates',
    name: 'Pipeline gates',
    nameLines: ['Pipeline gates'],
    lane: 'dev',
    owner: DEV,
    artefact: 'a tuned SAST, DAST and SCA gate with an agreed finding budget',
    artefactLines: ['Tuned SAST / DAST gate,', 'agreed finding budget'],
    when: 'From sprint 1',
    detail:
      'SAST, DAST, SCA and secret scanning in CI, tuned to a signal-to-noise ratio the delivery team actually accepts. Findings become tickets in the same backlog as features.',
  },
  {
    n: 5,
    id: 'pre-release-test',
    name: 'Pre-release test',
    nameLines: ['Pre-release', 'test'],
    lane: 'security',
    owner: SECURITY,
    artefact: 'an unedited penetration test report',
    artefactLines: ['Unedited pen', 'test report'],
    when: 'Final 4 weeks',
    detail:
      'A full penetration test led by someone who wrote none of the code, with the report issued to you unedited. Criticals block the release, and that is agreed in writing beforehand.',
  },
  {
    n: 6,
    id: 'monitoring',
    name: 'Monitoring',
    nameLines: ['Monitoring'],
    lane: 'dev',
    owner: DEV,
    artefact: 'detections in source control',
    artefactLines: ['Detections in', 'source control'],
    when: 'Post-launch',
    detail:
      'Detections written for the system as built, versioned in the same repository as the system they watch. Not a generic rule pack.',
  },
  {
    n: 7,
    id: 'retest',
    name: 'Retest',
    nameLines: ['Retest'],
    lane: 'security',
    owner: SECURITY,
    artefact: 'a delta report and a new threat model',
    artefactLines: ['Delta report, and', 'a new threat model'],
    when: 'Post-launch',
    detail:
      'Thirty days after launch, then on an agreed cadence. What the retest finds does not go in a backlog of its own, it rewrites stage one.',
  },
]

/**
 * Build the stage list from a service's `phases`, so a page that already has
 * `servicesBySlug['devsecops']` in hand can pass the canonical names through
 * without the client bundle importing the whole services table.
 *
 * Phase names and `days` win; the lane and artefact lanes come from
 * `sdlcStages`, which is the only place they are defined. The final phase is
 * expanded into the last two stages.
 */
export function stagesFromPhases(phases: readonly Phase[]): PipelineStage[] {
  return sdlcStages.map((stage, i) => {
    const phase = phases[Math.min(i, phases.length - 1)]
    if (!phase) return { ...stage }
    const isExpanded = i >= phases.length - 1 && phases.length < sdlcStages.length
    return {
      ...stage,
      name: isExpanded ? stage.name : phase.name,
      nameLines: isExpanded ? stage.nameLines : wrapName(phase.name),
      when: phase.days ?? stage.when,
      detail: isExpanded ? stage.detail : phase.body,
    }
  })
}

/** Split a stage name across at most two SVG lines at the kindest space. */
function wrapName(name: string): string[] {
  if (name.length <= 14) return [name]
  const words = name.split(' ')
  if (words.length < 2) return [name]
  let best = 1
  let bestDelta = Infinity
  for (let i = 1; i < words.length; i += 1) {
    const a = words.slice(0, i).join(' ').length
    const b = words.slice(i).join(' ').length
    const delta = Math.abs(a - b)
    if (delta < bestDelta) {
      bestDelta = delta
      best = i
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')]
}

/* ========================================================================== *
 * GEOMETRY
 * ========================================================================== */

const VB_W = 1200
const VB_H = 470
const PAD_X = 96
const LANE_Y: Record<PipelineLane, number> = { security: 150, dev: 260 }
const NODE_R = 19
const STUB = 4
const CORNER = 16
const CROSS_Y = (LANE_Y.security + LANE_Y.dev) / 2
const RETURN_Y = 420
const RETURN_R = 40

/** Exact length of one spine edge. See the arithmetic in the file header. */
const EDGE_LEN = 90 + 78 + 16 * Math.PI
/** Exact length of the return path. See the arithmetic in the file header. */
const RETURN_LEN = 207 + 928 + 207 + 40 * Math.PI

/** The breakpoint at which the horizontal diagram replaces the vertical list.
 *  Kept in lockstep with `diagram.module.css` - change both or neither. */
const WIDE_QUERY = '(min-width: 1100px)'

/** Custom properties are not in `CSSProperties`; a computed key keeps the
 *  assertion sound instead of relying on excess-property leniency. */
const dashVar = (len: number | string): CSSProperties => ({ ['--dash']: String(len) }) as CSSProperties

const nodeX = (i: number, count: number) =>
  count <= 1 ? VB_W / 2 : PAD_X + (i * (VB_W - 2 * PAD_X)) / (count - 1)

/** Orthogonal edge with rounded corners, node-edge to node-edge. */
function edgePath(x0: number, y0: number, x1: number, y1: number) {
  const sx = x0 + NODE_R + STUB
  const ex = x1 - NODE_R - STUB
  const mx = (x0 + x1) / 2
  const down = y1 > y0
  const c = down ? CORNER : -CORNER
  // Sweep flags: going down turns clockwise then anticlockwise; up is mirrored.
  const s1 = down ? 1 : 0
  const s2 = down ? 0 : 1
  return [
    `M ${sx} ${y0}`,
    `H ${mx - CORNER}`,
    `A ${CORNER} ${CORNER} 0 0 ${s1} ${mx} ${y0 + c}`,
    `V ${y1 - c}`,
    `A ${CORNER} ${CORNER} 0 0 ${s2} ${mx + CORNER} ${y1}`,
    `H ${ex}`,
  ].join(' ')
}

function returnPath(lastX: number, lastY: number, firstX: number, firstY: number) {
  const top = Math.max(lastY, firstY) + NODE_R + STUB
  return [
    `M ${lastX} ${top}`,
    `V ${RETURN_Y - RETURN_R}`,
    `A ${RETURN_R} ${RETURN_R} 0 0 1 ${lastX - RETURN_R} ${RETURN_Y}`,
    `H ${firstX + RETURN_R}`,
    `A ${RETURN_R} ${RETURN_R} 0 0 1 ${firstX} ${RETURN_Y - RETURN_R}`,
    `V ${top}`,
  ].join(' ')
}

/* ========================================================================== *
 * TEXT SLOTS - fixed bands so no label can collide with a node or the return
 * path. Security labels run upward from the node, dev labels run downward;
 * both read name, then owner, then artefact from the top down.
 * ========================================================================== */

const SLOT = {
  security: { nameLast: 55, nameStep: 21, owner: 84, artLast: 124, artStep: 17 },
  dev: { nameFirst: 300, nameStep: 21, owner: 347, artFirst: 371, artStep: 17 },
} as const

function nameYs(lane: PipelineLane, lines: readonly string[]) {
  if (lane === 'dev') {
    return lines.map((_, j) => SLOT.dev.nameFirst + j * SLOT.dev.nameStep)
  }
  const last = SLOT.security.nameLast
  return lines.map((_, j) => last - (lines.length - 1 - j) * SLOT.security.nameStep)
}

function artefactYs(lane: PipelineLane, lines: readonly string[]) {
  if (lane === 'dev') {
    return lines.map((_, j) => SLOT.dev.artFirst + j * SLOT.dev.artStep)
  }
  const last = SLOT.security.artLast
  return lines.map((_, j) => last - (lines.length - 1 - j) * SLOT.security.artStep)
}

/* ========================================================================== *
 * ACCESSIBLE DESCRIPTION
 * ========================================================================== */

const lcFirst = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s)

function buildAriaLabel(stages: readonly PipelineStage[]) {
  const first = stages[0]
  const last = stages[stages.length - 1]
  const crossings = stages.reduce(
    (acc, s, i) => (i > 0 && s.lane !== stages[i - 1].lane ? acc + 1 : acc),
    0,
  )
  const parts = [
    `Diagram: the secure software development lifecycle drawn as a closed loop of ${stages.length} stages across two lanes, a security squad lane and a dev squad lane.`,
    ...stages.map(
      (s) =>
        `Stage ${s.n}, ${s.name}, ${s.when.toLowerCase()}, owned by the ${s.owner.toLowerCase()}, producing ${lcFirst(s.artefact)}.`,
    ),
    `A return path runs from stage ${last.n}, ${last.name}, back to stage ${first.n}, ${first.name}: what the retest finds rewrites the threat model.`,
    `${crossings} of the ${stages.length - 1} stage-to-stage transitions cross between the two lanes. Each crossing is a hand-off inside one team, not a hand-over between two firms.`,
  ]
  return parts.join(' ')
}

/* ========================================================================== *
 * COMPONENT
 * ========================================================================== */

export type SecureSdlcPipelineProps = {
  /** Override the seven stages - e.g. with `stagesFromPhases(service.phases)`. */
  stages?: readonly PipelineStage[]
  /** Small uppercase label above the diagram. */
  eyebrow?: string
  /** One or two sentences under the eyebrow. */
  lede?: string
  id?: string
  className?: string
}

/** useLayoutEffect on the client, useEffect on the server render pass. The
 *  attribute has to land before the first paint or the finished state flashes
 *  for a frame before the draw starts. */
const useIsoLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : useEffect

export function SecureSdlcPipeline({
  stages = sdlcStages,
  eyebrow = 'The Adversary Loop, as a pipeline',
  lede = 'Seven stages, two squads, one backlog. Every stage changes lane, which means every transition is a hand-off inside one team rather than a hand-over between two firms, and the seventh stage returns to the first.',
  id,
  className,
}: SecureSdlcPipelineProps) {
  const rootRef = useRef<HTMLElement>(null)
  const count = stages.length

  useIsoLayoutEffect(() => {
    const root = rootRef.current
    if (!root || typeof window === 'undefined') return
    if (typeof window.matchMedia !== 'function') return

    // Reduced motion: never opt in. The markup already renders finished.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    root.setAttribute('data-animate', 'true')

    // Refine the shipped dash constants against the real flattened geometry.
    root.querySelectorAll<SVGPathElement>('path[data-dash]').forEach((p) => {
      if (typeof p.getTotalLength !== 'function') return
      const len = p.getTotalLength()
      if (Number.isFinite(len) && len > 0) {
        p.style.setProperty('--dash', String(Math.ceil(len)))
      }
    })

    if (typeof IntersectionObserver === 'undefined') {
      // No observer: light everything rather than leave it at zero.
      root.querySelectorAll('[data-stage-index]').forEach((n) => n.setAttribute('data-lit', 'true'))
      return
    }

    const wide = window.matchMedia(WIDE_QUERY)
    let io: IntersectionObserver | null = null

    const light = (index: string) => {
      root
        .querySelectorAll(`[data-stage-index="${index}"]`)
        .forEach((n) => n.setAttribute('data-lit', 'true'))
    }

    // ONE observer. Targets are whichever rendering is actually laid out -
    // the other is display:none and would never intersect anyway, but
    // selecting by breakpoint keeps the intent explicit.
    const wire = () => {
      io?.disconnect()
      io = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            obs.unobserve(entry.target) // fire once; never re-fire on scroll-back
            const index = entry.target.getAttribute('data-stage-index')
            if (index !== null) light(index)
          }
        },
        { threshold: 0.25, rootMargin: '0px 0px -10% 0px' },
      )
      const selector = wide.matches ? '[data-stage-g]' : '[data-stage-li]'
      root.querySelectorAll(selector).forEach((target) => {
        if (target.getAttribute('data-lit') !== 'true') io?.observe(target)
      })
    }

    wire()
    wide.addEventListener('change', wire)
    return () => {
      wide.removeEventListener('change', wire)
      io?.disconnect()
    }
  }, [count])

  const xs = stages.map((_, i) => nodeX(i, count))
  const ys = stages.map((s) => LANE_Y[s.lane])
  const firstX = xs[0]
  const lastX = xs[count - 1]

  return (
    <figure
      ref={rootRef}
      id={id}
      className={[styles.figure, className].filter(Boolean).join(' ')}
    >
      {/* THE CAPTION IS CONTAINED, THE DIAGRAM IS NOT.
          This component is used inside <Section bleed>, which deliberately
          removes the page container so the SVG can run the full width of the
          viewport. That is right for the drawing and wrong for everything
          else: without this wrapper the eyebrow, the lede and the legend all
          started at x=0, hard against the window edge, while the section
          heading directly above them sat at the container inset of 72px.
          Measured on the live page before this was added. */}
      <figcaption className={`u-container ${styles.caption}`}>
        <p className={`u-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
        <p className={`u-measure ${styles.lede}`}>{lede}</p>
        <ul className={styles.legend}>
          <li className={styles.legendItem} data-lane="security">
            <span className={styles.legendMark} aria-hidden="true" />
            {SECURITY}
          </li>
          <li className={styles.legendItem} data-lane="dev">
            <span className={styles.legendMark} aria-hidden="true" />
            {DEV}
          </li>
          <li className={styles.legendItem} data-lane="handoff">
            <span className={styles.legendMark} aria-hidden="true" />
            Lane change, a hand-off, not a hand-over
          </li>
        </ul>
      </figcaption>

      {/* ---------------- WIDE: the drawn pipeline ---------------- */}
      <svg
        className={styles.wire}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={buildAriaLabel(stages)}
      >
        {/* Lane rails, static furniture, never animated. */}
        <line className={styles.rail} x1={PAD_X - NODE_R} y1={LANE_Y.security} x2={lastX + NODE_R} y2={LANE_Y.security} />
        <line className={styles.rail} x1={PAD_X - NODE_R} y1={LANE_Y.dev} x2={lastX + NODE_R} y2={LANE_Y.dev} />

        {/* Spine edges, painted first so the discs sit over them. Each edge
            belongs to the stage it arrives at, so it draws as that stage lights. */}
        <g className={styles.edges}>
          {stages.slice(1).map((stage, i) => (
            <g key={stage.id} className={styles.edgeGroup} data-stage-index={i + 1}>
              <path
                className={styles.edge}
                data-dash=""
                style={dashVar(EDGE_LEN.toFixed(3))}
                d={edgePath(xs[i], ys[i], xs[i + 1], ys[i + 1])}
              />
              {stage.lane !== stages[i].lane ? (
                <path
                  className={styles.handoff}
                  d={`M ${(xs[i] + xs[i + 1]) / 2} ${CROSS_Y - 6} L ${(xs[i] + xs[i + 1]) / 2 + 6} ${CROSS_Y} L ${(xs[i] + xs[i + 1]) / 2} ${CROSS_Y + 6} L ${(xs[i] + xs[i + 1]) / 2 - 6} ${CROSS_Y} Z`}
                />
              ) : null}
            </g>
          ))}
        </g>

        {/* The return path. Drawn differently from the spine on purpose. */}
        <g className={styles.loopGroup} data-loop-g="" data-stage-index={count - 1}>
          <path
            className={styles.loop}
            data-dash=""
            style={dashVar(RETURN_LEN.toFixed(3))}
            d={returnPath(lastX, ys[count - 1], firstX, ys[0])}
          />
          <path
            className={styles.loopArrow}
            d={`M ${firstX - 7} ${ys[0] + NODE_R + STUB + 11} L ${firstX} ${ys[0] + NODE_R + STUB} L ${firstX + 7} ${ys[0] + NODE_R + STUB + 11}`}
          />
          <text className={styles.loopLabel} x={VB_W / 2} y={RETURN_Y + 24} textAnchor="middle">
            The loop closes
          </text>
        </g>

        {/* Nodes and their two lanes of caption. */}
        <g className={styles.nodes}>
          {stages.map((stage, i) => {
            const x = xs[i]
            const y = ys[i]
            const slot = stage.lane === 'dev' ? SLOT.dev : SLOT.security
            return (
              <g
                key={stage.id}
                className={styles.stage}
                data-stage-g=""
                data-stage-index={i}
                data-lane={stage.lane}
              >
                <circle className={styles.nodeDisc} cx={x} cy={y} r={NODE_R} />
                <circle className={styles.nodeRing} cx={x} cy={y} r={NODE_R} />
                <text className={styles.nodeNum} x={x} y={y + 5} textAnchor="middle">
                  {String(stage.n).padStart(2, '0')}
                </text>

                {stage.nameLines.slice(0, 2).map((line, j, arr) => (
                  <text
                    key={`${stage.id}-name-${j}`}
                    className={styles.stageName}
                    x={x}
                    y={nameYs(stage.lane, arr)[j]}
                    textAnchor="middle"
                  >
                    {line}
                  </text>
                ))}

                <text className={styles.stageOwner} x={x} y={slot.owner} textAnchor="middle">
                  {stage.owner}
                </text>

                {stage.artefactLines.slice(0, 2).map((line, j, arr) => (
                  <text
                    key={`${stage.id}-art-${j}`}
                    className={styles.stageArtefact}
                    x={x}
                    y={artefactYs(stage.lane, arr)[j]}
                    textAnchor="middle"
                  >
                    {line}
                  </text>
                ))}
              </g>
            )
          })}
        </g>
      </svg>

      {/* ---------------- THE CONTENT ITSELF ----------------
          A real ordered list. At narrow widths this IS the pipeline, stacked
          vertically with a drawn rail. At wide widths it is visually hidden
          and the SVG above carries the picture, but it stays in the DOM and
          in the accessibility tree at every width. */}
      <div className={styles.sequenceWrap}>
        {/* The loop, closed, at narrow widths: a bracket that encloses the
            whole sequence. Carries stage 7's index so it lands with the stage
            the return path leaves from. */}
        <span
          className={styles.loopBracket}
          data-stage-index={count - 1}
          aria-hidden="true"
        />
        <ol className={styles.sequence}>
        {stages.map((stage, i) => (
          <li
            key={stage.id}
            className={styles.step}
            data-stage-li=""
            data-stage-index={i}
            data-lane={stage.lane}
            data-crosses={i > 0 && stage.lane !== stages[i - 1].lane ? 'true' : undefined}
          >
            {i < count - 1 ? (
              // preserveAspectRatio="none" keeps the dash maths in viewBox
              // units whatever height the step ends up being: the x scale is
              // exactly 1, so the 1u stroke still renders as a hairline.
              <svg
                className={styles.stepRail}
                viewBox="0 0 2 100"
                preserveAspectRatio="none"
                aria-hidden="true"
                focusable="false"
              >
                <line
                  className={styles.stepRailLine}
                  style={dashVar(100)}
                  data-dash=""
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="100"
                />
              </svg>
            ) : null}

            <p className={styles.stepMeta}>
              <span className={`u-mono ${styles.stepNum}`} aria-hidden="true">
                {String(stage.n).padStart(2, '0')}
              </span>
              <span className={styles.stepOwner}>{stage.owner}</span>
              <span className={styles.stepWhen}>{stage.when}</span>
            </p>
            <p className={styles.stepName}>{stage.name}</p>
            <p className={styles.stepDetail}>{stage.detail}</p>
            <p className={styles.stepArtefact}>
              <span className={`u-mono ${styles.stepArtefactLabel}`}>Artefact</span>
              {/* The terse form, so the list and the drawn diagram say exactly
                  the same thing. `artefact` is the sentence form and belongs in
                  the SVG's aria-label, where a sentence is what is wanted. */}
              {stage.artefactLines.join(' ')}
            </p>
          </li>
        ))}
        </ol>
      </div>

      {/* WRAPPED, not classed. The callout needs the page inset, but
          .u-container sets padding-inline and max-width, and .loopNote is a
          bordered box with its own 72ch max-width - putting both on one
          element would push the gutter INSIDE the border and leave the two
          max-widths fighting over which applies. The wrapper does the
          inset, the <p> keeps its own box. */}
      <div className="u-container">
        <p className={styles.loopNote}>
          <RotateCcw className={styles.loopNoteIcon} aria-hidden="true" focusable="false" />
          <span>
            <strong className={styles.loopNoteStrong}>The loop closes.</strong> What the retest
            finds does not open a report of its own, it rewrites stage one, and the next pass
            through the pipeline is run against the threat model the last pass produced.
          </span>
        </p>
      </div>
    </figure>
  )
}

export default SecureSdlcPipeline
