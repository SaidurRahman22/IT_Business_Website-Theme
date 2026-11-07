import { existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Resolve a service's banner image, or null when it has none.
 *
 * This reads the filesystem rather than keeping a hand-written list of slugs,
 * and it can: every caller is a server component under `output: 'export'`, so
 * this runs once at build time and nothing reaches the browser. A literal list
 * would drift the moment someone adds or removes an image, and the failure
 * would be silent in both directions, a slug with no picture or a picture no
 * page renders.
 *
 * Images are produced by scripts/generate-service-images.mjs.
 */
const DIR = join(process.cwd(), 'public', 'img', 'services')

export function serviceImage(slug: string): string | null {
  return existsSync(join(DIR, `${slug}.webp`)) ? `/img/services/${slug}.webp` : null
}
