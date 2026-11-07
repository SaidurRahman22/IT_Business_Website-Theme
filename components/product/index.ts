/**
 * Stylised product-UI component set.
 *
 * These five components stand in for screenshots of third-party security
 * platforms Envenox operates but does not own - managed SIEM, EDR, hosted WAF.
 * They are drawn in HTML/CSS/SVG rather than captured, because screenshotting a
 * vendor console and presenting it as our own is a trademark, licence and
 * credibility problem; and because a DOM component stays sharp at any zoom,
 * renders correctly in all three palettes, and can be recorded for motion clips.
 *
 * ALL FIVE take a REQUIRED `caption` prop. Pass the matching default from
 * `CAPTIONS` unless the surrounding copy needs something more specific:
 *
 *   import { SocAlertQueue } from '@/components/product'
 *   import { CAPTIONS } from '@/lib/product-fixtures'
 *
 *   <SocAlertQueue caption={CAPTIONS.soc} />
 *
 * Every figure renders complete and legible with JavaScript disabled and under
 * `prefers-reduced-motion: reduce`. The only client component in the subtree is
 * `SceneRunner`, reached only via `<SocAlertQueue autoplay />`, which is off by
 * default.
 */

export { SocAlertQueue, type SocAlertQueueProps } from './SocAlertQueue'
export { EdrFleetView, type EdrFleetViewProps } from './EdrFleetView'
export { WafTrafficPanel, type WafTrafficPanelProps } from './WafTrafficPanel'
export { SeverityGauge, type SeverityGaugeProps } from './SeverityGauge'
export { SlaPanel, type SlaPanelProps } from './SlaPanel'

/* --------------------------------------------------------------------------
 * SOFTWARE DELIVERY - the five consoles that show what the firm actually does
 *
 * The set above is five SECURITY surfaces. A company that leads with software
 * development and has only SIEM, EDR and WAF screens to show is arguing against
 * itself, so these five show the build: a CI/CD run, the sprint board, a pull
 * request under review, post-release health, and a month-end close in an ERP we
 * built. Same frame (`product.module.css`), same caption discipline, same
 * density, same severity kit - plus `delivery.module.css` for the layouts the
 * security consoles have no use for.
 *
 * They share the security set's fixture estate on purpose: one tenant, one
 * afternoon, cross-referenced. The integration test that fails in the pipeline
 * is the same tenant predicate the SIEM saw abused; the pull request that fixes
 * it is a ticket on the board; the rollback on the release panel is another.
 * ------------------------------------------------------------------------- */

export { DeliveryPipeline, type DeliveryPipelineProps } from './DeliveryPipeline'
export { SprintBoard, type SprintBoardProps } from './SprintBoard'
export { CodeReviewPanel, type CodeReviewPanelProps } from './CodeReviewPanel'
export { ReleaseHealth, type ReleaseHealthProps } from './ReleaseHealth'
export { ErpLedger, type ErpLedgerProps } from './ErpLedger'

/** Shared severity rendering - exported so sibling product UI stays consistent. */
export { SeverityBadge, sevClass, enterDelay, type SeverityBadgeProps } from './Severity'
export { SceneRunner, type SceneRunnerProps } from './SceneRunner'
