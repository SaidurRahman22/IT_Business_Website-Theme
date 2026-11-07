import type { Metadata } from 'next'

import { resourceTypesBySlug } from '@/lib/resources'
import { TypeListing } from '../resources/_shared/listing'

const TYPE = 'research'

export const metadata: Metadata = {
  title: 'Research & Labs',
  description: resourceTypesBySlug[TYPE]?.description,
  alternates: { canonical: '/research' },
}

/** Research & Labs - a filtered view over the same `resources` data, by type. */
export default function Page() {
  return <TypeListing type={TYPE} />
}
