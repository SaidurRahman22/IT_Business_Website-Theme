import type { Metadata } from 'next'

import { resourceTypesBySlug } from '@/lib/resources'
import { TypeListing } from '../resources/_shared/listing'

const TYPE = 'insight'

export const metadata: Metadata = {
  title: 'Insights',
  description: resourceTypesBySlug[TYPE]?.description,
  alternates: { canonical: '/blog' },
}

/** Insights - a filtered view over the same `resources` data, by type. */
export default function Page() {
  return <TypeListing type={TYPE} />
}
