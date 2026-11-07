import type { Metadata } from 'next'
import { pillars } from '@/lib/services'
import { PillarHub } from '../_components/PillarHub'
import { pageMetadata } from '../_components/seo'

const PATH = `/services/${pillars.security.slug}`

export const metadata: Metadata = pageMetadata({
  title: pillars.security.name,
  description: `${pillars.security.line} ${pillars.security.body}`,
  path: PATH,
})

export default function CybersecurityPillarPage() {
  return <PillarHub pillar="security" />
}
