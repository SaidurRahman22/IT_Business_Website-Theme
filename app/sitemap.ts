export const dynamic = 'force-static'

import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'
import { services, pillars } from '@/lib/services'
import { caseStudies } from '@/lib/case-studies'
import { people } from '@/lib/people'
import { industries } from '@/lib/proof'

/**
 * Never ship a test or orphan page in the sitemap. Competitors are shipping
 * `/new-home-test/` and `/services/red-teaming-2-2-2-2-2-2`, which tells a
 * search engine - and anyone who looks - more than they intended.
 *
 * Every entry below is derived from the data that renders the page, so a route
 * cannot drift out of the sitemap, and a page that no longer exists cannot stay
 * in it.
 */

const NOW = new Date()

type Entry = MetadataRoute.Sitemap[number]

const page = (path: string, priority: number, changeFrequency: Entry['changeFrequency'] = 'monthly'): Entry => ({
  url: `${site.url}${path}`,
  lastModified: NOW,
  changeFrequency,
  priority,
})

export default function sitemap(): MetadataRoute.Sitemap {
  const marketing: Entry[] = [
    page('/', 1.0, 'weekly'),
    page('/services', 0.9),
    page('/approach', 0.8),
    page('/industries', 0.7),
  ]

  const pillarPages: Entry[] = Object.values(pillars).map((p) => page(`/services/${p.slug}`, 0.9))

  const servicePages: Entry[] = services.map((s) =>
    // The join page is the site's reason to exist, so it outranks the rest.
    page(`/services/${s.slug}`, s.pillar === 'join' ? 0.95 : s.tier === 'E' ? 0.8 : 0.7),
  )

  const industryPages: Entry[] = industries.map((i) => page(`/industries/${i.slug}`, 0.7))

  const proof: Entry[] = [
    page('/case-studies', 0.85, 'weekly'),
    page('/sample-report', 0.9),
    page('/customers', 0.7),
    page('/certifications', 0.6),
    page('/trust', 0.8),
    ...caseStudies.map((c) => page(`/case-studies/${c.slug}`, c.featured ? 0.8 : 0.7)),
  ]

  const company: Entry[] = [
    page('/about', 0.7),
    page('/about/leadership', 0.6),
    page('/careers', 0.6, 'weekly'),
    page('/locations', 0.4),
    page('/newsroom', 0.5, 'weekly'),
    page('/partners', 0.5),
    ...people.map((p) => page(`/about/leadership/${p.slug}`, 0.4)),
  ]

  const resources: Entry[] = [
    page('/resources', 0.7, 'weekly'),
    page('/blog', 0.7, 'weekly'),
    page('/research', 0.6, 'weekly'),
    page('/tools', 0.6),
    page('/methodologies', 0.6),
  ]

  const conversion: Entry[] = [
    page('/contact', 0.9),
    page('/book-a-call', 0.8),
    page('/get-started', 0.8),
    page('/report-issue', 0.5),
  ]

  const legal: Entry[] = [
    page('/legal/privacy', 0.3, 'yearly'),
    page('/legal/cookies', 0.3, 'yearly'),
    page('/legal/terms', 0.3, 'yearly'),
    page('/legal/accessibility', 0.4, 'yearly'),
    page('/legal/vulnerability-disclosure', 0.5, 'yearly'),
    page('/sitemap', 0.3, 'yearly'),
  ]

  return [
    ...marketing,
    ...pillarPages,
    ...servicePages,
    ...industryPages,
    ...proof,
    ...company,
    ...resources,
    ...conversion,
    ...legal,
  ]
}
