import type { Metadata } from 'next'

import { resourceTypesBySlug } from '@/lib/resources'
import { TypeListing } from '../resources/_shared/listing'

const TYPE = 'methodology'

export const metadata: Metadata = {
  title: 'Methodologies',
  description: resourceTypesBySlug[TYPE]?.description,
  alternates: { canonical: '/methodologies' },
}

/** Methodologies - a filtered view over the same `resources` data, by type. */
export default function Page() {
  return <TypeListing type={TYPE} />
}
