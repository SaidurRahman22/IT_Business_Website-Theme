import type { Metadata } from 'next'
import { Suspense } from 'react'
import { site } from '@/lib/site'
import { CaseStudiesIndexBody, CaseStudiesIndexView } from './_components/index-view'

/**
 * The case study index.
 *
 * FILTERING WITHOUT JAVASCRIPT - the whole design of this page.
 *
 * Every filter is a real `<a href>` carrying search params, read here on the
 * server. Nothing is a `<button>`, nothing is state, nothing needs hydration.
 * With scripting off the page is a set of links that reload a filtered server
 * render; with scripting on, `next/link` upgrades exactly the same markup to a
 * soft navigation and a prefetch. That is the progressive enhancement - the
 * enhancement is the transport, never the capability.
 *
 * "Load more" is the same idea: `?page=2` renders pages 1..2 inclusive, so the
 * link appends rather than replaces, which is what "load more" means. A buyer
 * with scripting disabled on the page they use to find proof still gets every
 * story.
 *
 * Location is a first-class facet. Data residency, time zone and nearshore
 * delivery are real purchase criteria for a services buyer, which is why a
 * product-site filter set does not transfer.
 */

export const metadata: Metadata = {
  title: 'Case studies',
  description:
    'Engagements with the measured result, the technical detail, the team shape and the timeline. Filterable by service, industry, location and engagement type.',
  alternates: { canonical: '/case-studies' },
  openGraph: {
    type: 'website',
    title: `Case studies · ${site.name}`,
    description: 'What the work actually produced, with the measurement window attached to every number.',
    url: `${site.url}/case-studies`,
  },
}

export default function CaseStudiesIndex() {
  // The FALLBACK is the whole point, not a loading state. useSearchParams()
  // suspends during prerender, so whatever sits in the fallback is what lands in
  // case-studies.html. Rendering the unfiltered body there keeps every case
  // study in the static file for crawlers and for scripting-disabled visitors;
  // CaseStudiesIndexView then takes over on hydration and applies the URL's
  // facets. An empty fallback shipped an empty page.
  return (
    <Suspense fallback={<CaseStudiesIndexBody sp={{}} />}>
      <CaseStudiesIndexView />
    </Suspense>
  )
}
