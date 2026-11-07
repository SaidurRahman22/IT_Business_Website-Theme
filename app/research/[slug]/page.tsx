import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { resources, resourcesBySlug } from '@/lib/resources'
import { ResourceDetail, resourceMetadata } from '../../resources/_shared/detail'

const TYPE = 'research'

export const dynamicParams = false

export function generateStaticParams() {
  return resources.filter((r) => r.type === TYPE).map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const resource = resourcesBySlug[slug]
  if (!resource || resource.type !== TYPE) return { title: 'Research & Labs' }
  return resourceMetadata(resource)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const resource = resourcesBySlug[slug]
  if (!resource || resource.type !== TYPE) notFound()
  return <ResourceDetail resource={resource} />
}
