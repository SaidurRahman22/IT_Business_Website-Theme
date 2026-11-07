import type { Metadata } from 'next'

import { resourceTypesBySlug } from '@/lib/resources'
import { TypeListing } from '../resources/_shared/listing'

const TYPE = 'tool'

export const metadata: Metadata = {
  title: 'Open-source tools',
  description: resourceTypesBySlug[TYPE]?.description,
  alternates: { canonical: '/tools' },
}

/** Open-source tools - a filtered view over the same `resources` data, by type. */
export default function Page() {
  return <TypeListing type={TYPE} />
}
