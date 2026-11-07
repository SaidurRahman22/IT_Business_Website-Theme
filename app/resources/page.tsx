import type { Metadata } from 'next'
import { HUB_DESCRIPTION, ResourcesHubView } from './_shared/hub'

export const metadata: Metadata = {
  title: 'Resources',
  description: HUB_DESCRIPTION,
  alternates: { canonical: '/resources' },
}

/**
 * /resources - the unfiltered hub.
 *
 * The filtered views live at /resources/type/[type] and are prerendered, one per
 * resource type. See the note in _shared/hub.tsx for why filtering moved from
 * `?type=` to real routes.
 */
export default function ResourcesHub() {
  return <ResourcesHubView active={null} />
}
