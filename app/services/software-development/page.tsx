import type { Metadata } from 'next'
import { pillars } from '@/lib/services'
import { PillarHub } from '../_components/PillarHub'
import { pageMetadata } from '../_components/seo'

const PATH = `/services/${pillars.software.slug}`

export const metadata: Metadata = pageMetadata({
  title: pillars.software.name,
  description: `${pillars.software.line} ${pillars.software.body}`,
  path: PATH,
})

export default function SoftwareEngineeringPillarPage() {
  return <PillarHub pillar="software" />
}
