import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { resourceTypes, resources } from '@/lib/resources'
import { HUB_DESCRIPTION, ResourcesHubView } from '../../_shared/hub'

/**
 * /resources/type/[type] - one prerendered page per resource type.
 *
 * Replaces the former `/resources?type=…` server-side filter, which a static
 * export cannot evaluate. Every type is known at build time, so each filtered
 * view ships as a real file.
 *
 * dynamicParams = false is SECURITY, not performance: it makes the routing layer
 * return 404 for any type outside generateStaticParams, before page code runs.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return resourceTypes.map((t) => ({ type: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>
}): Promise<Metadata> {
  const { type } = await params
  const def = resourceTypes.find((t) => t.slug === type)
  if (!def) return { title: 'Resources' }
  return {
    title: `${def.plural} · Resources`,
    description: `${def.description} ${HUB_DESCRIPTION}`,
    alternates: { canonical: `/resources/type/${def.slug}` },
  }
}

export default async function ResourcesByType({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  const def = resourceTypes.find((t) => t.slug === type)
  if (!def) notFound()
  if (resources.filter((r) => r.type === def.slug).length === 0) notFound()

  return <ResourcesHubView active={def.slug} />
}
