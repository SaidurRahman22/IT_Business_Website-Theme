export const dynamic = 'force-static'

import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Thank-you pages and campaign landing pages are reachable but should
        // not compete in search with the page that sends traffic to them.
        // /styleguide is an internal reference, not a page. It is also gated to
        // 404 in production builds - this entry is the belt beside that brace,
        // for any environment where the gate is not in force.
        disallow: ['/thank-you/', '/campaigns/', '/api/', '/styleguide'],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
