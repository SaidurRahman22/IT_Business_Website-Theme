/**
 * Post-export cleanup for `output: 'export'`.
 *
 * WHY THIS EXISTS
 *
 * app/styleguide/page.tsx calls notFound() when NODE_ENV === 'production'. That
 * works: the exported file contains the not-found page, not the styleguide, so
 * nothing leaks. But a static file server cannot express "this file is a 404" -
 * Cloudflare serves out/styleguide.html with HTTP 200 and a "Page not found"
 * body, which is a soft 404. Search engines treat that as a thin duplicate page
 * and it misreports the route to any monitoring that checks status codes.
 *
 * Deleting the file makes the path fall through to `not_found_handling:
 * "404-page"` in wrangler.static.jsonc, which serves the same body with a real
 * 404 status.
 *
 * Run automatically by `npm run build`. Safe to run twice.
 */
import { rm, access } from 'node:fs/promises'
import { join } from 'node:path'

const OUT = 'out'

// Routes that must not be reachable in production, with the files the export
// emits for each. Keep in sync with any notFound()-in-production page.
const DEV_ONLY = ['styleguide']

let removed = 0
for (const route of DEV_ONLY) {
  for (const file of [`${route}.html`, `${route}.txt`, join(route, 'index.html')]) {
    const path = join(OUT, file)
    try {
      await access(path)
    } catch {
      continue
    }
    await rm(path, { force: true })
    console.log(`post-export: removed ${path}`)
    removed += 1
  }
}

console.log(`post-export: ${removed} dev-only file(s) removed from ${OUT}/`)
