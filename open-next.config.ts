import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

/**
 * OpenNext → Cloudflare Workers.
 *
 * WHY A WORKER AND NOT STATIC ASSETS: this app has three Server Actions
 * (`app/contact/_shared/actions.ts`, `app/services/_components/actions.ts`) and
 * a POST route handler (`app/api/newsletter/route.ts`). None of those survive
 * `output: 'export'`, so Workers Static Assets alone cannot serve this site.
 *
 * AN INCREMENTAL CACHE IS MANDATORY, EVEN WITH NO ISR.
 *
 * This file previously configured NO incremental cache at all, on the reasoning
 * that all 108 routes are prerendered at build time, nothing sets `revalidate`,
 * and therefore no cache state needs persisting. That reasoning was wrong, and
 * it took envenox.com down on 2026-11-06.
 *
 * OpenNext routes every response through its cache layer regardless of whether
 * ISR is in use, and performs the cache write inside `waitUntil()`. With no
 * incremental cache configured, that write never settles. The Worker's own log:
 *
 *   wallTime: 54966, cpuTime: 2, outcome: "canceled"
 *   "waitUntil() tasks did not complete within the allowed time after
 *    invocation end and have been cancelled."
 *
 * Two milliseconds of CPU and fifty-five seconds of wall clock per request. The
 * first request or two return 200, then pending invocations saturate the isolate
 * and every subsequent request hangs until Cloudflare cancels it. From outside
 * this presents as ERR_TIMED_OUT with no log entries, which is indistinguishable
 * from a DNS or certificate fault and sent the first diagnosis in that direction.
 *
 * staticAssetsIncrementalCache is the correct override for this site. It reads
 * prerendered entries back through the ASSETS binding and its `set()` is a
 * no-op that resolves immediately — so `waitUntil()` settles. Its own doc
 * comment states it is for applications that "do NOT want revalidation and ONLY
 * want to serve prerendered data", which is exactly this app. It provisions
 * nothing, so unlike r2IncrementalCache it cannot fail the deploy on a bucket
 * that was never created.
 *
 * IF ISR OR on-demand revalidation IS EVER ADDED, this override starts logging
 * failed writes and must be swapped for r2IncrementalCache together with an
 * `r2_buckets` binding and WORKER_SELF_REFERENCE.
 * See https://opennext.js.org/cloudflare/caching
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
})
