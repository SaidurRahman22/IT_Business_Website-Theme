import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { resources, resourcesBySlug } from '@/lib/resources'
import { ResourceDetail, resourceMetadata } from '../_shared/detail'
import { TYPE_ROUTE } from '../_shared/resources'

/**
 * The detail route for resource types that have no listing page of their own -
 * guides, webinars and datasheets.
 *
 * Insights, research, tools and methodologies each have a dedicated route
 * (/blog, /research, /tools, /methodologies), and `resourceHref()` sends them
 * there. Keeping those slugs OUT of `generateStaticParams` here, with
 * `dynamicParams = false`, means there is exactly one canonical URL per
 * resource and no duplicate page competing with it.
 */

export const dynamicParams = false

/** Only the types with no dedicated listing route. */
const ownsSlug = (type: string) => TYPE_ROUTE[type] === undefined

export function generateStaticParams() {
  return resources.filter((r) => ownsSlug(r.type)).map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const resource = resourcesBySlug[slug]
  if (!resource || !ownsSlug(resource.type)) return { title: 'Resources' }
  return resourceMetadata(resource)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resource = resourcesBySlug[slug]
  if (!resource || !ownsSlug(resource.type)) notFound()
  return <ResourceDetail resource={resource} />
}
