import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CircleAlert } from 'lucide-react'
import { serviceTopics, serviceTopicsByParent } from '@/lib/resources'
import { servicesBySlug, pillars } from '@/lib/services'
import { site } from '@/lib/site'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ServicesStyles, SectionHead, LinkList } from '../../_components/chrome'
import { CtaBand } from '../../_components/blocks'
import { JsonLd, breadcrumbSchema, pageMetadata } from '../../_components/seo'

/**
 * The child explainers under a service.
 *
 * Every record in `serviceTopics` is `pending: true` - the explainer has not
 * been written. This renders the question as the H1 and says so, because a
 * stub that admits what it is beats a 404 (the URL is already in the service
 * page's topic cluster and in the site's internal link graph) and beats filler
 * (a page of generated prose under a buyer question is the fastest way to lose
 * the trust the parent page earned).
 *
 * `robots: noindex, follow` while `pending` is true: the links are worth
 * crawling, the empty page is not worth ranking. Clearing `pending` in
 * lib/resources.ts is all it takes to flip that.
 */

export function generateStaticParams() {
  return serviceTopics.map((topic) => ({ slug: topic.parent, topic: topic.slug }))
}

export const dynamicParams = false

type Params = { slug: string; topic: string }

function resolve(slug: string, topicSlug: string) {
  const parent = servicesBySlug[slug]
  const topic = serviceTopicsByParent[slug]?.find((t) => t.slug === topicSlug)
  if (!parent || !topic) return null
  return { parent, topic }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug, topic: topicSlug } = await params
  const found = resolve(slug, topicSlug)
  if (!found) return { title: 'Not found', robots: { index: false, follow: true } }

  const meta = pageMetadata({
    title: found.topic.title,
    description: `${found.topic.question} An explainer under ${found.parent.name}.`,
    path: `/services/${slug}/${topicSlug}`,
  })

  return found.topic.pending ? { ...meta, robots: { index: false, follow: true } } : meta
}

export default async function ServiceTopicPage({ params }: { params: Promise<Params> }) {
  const { slug, topic: topicSlug } = await params
  const found = resolve(slug, topicSlug)
  if (!found) notFound()

  const { parent, topic } = found
  const siblings = (serviceTopicsByParent[slug] ?? []).filter((t) => t.slug !== topicSlug)
  const pillarSlug =
    parent.pillar === 'security'
      ? pillars.security.slug
      : parent.pillar === 'software'
        ? pillars.software.slug
        : 'devsecops'
  const pillarName =
    parent.pillar === 'security'
      ? pillars.security.name
      : parent.pillar === 'software'
        ? pillars.software.name
        : servicesBySlug['devsecops'].name

  return (
    <>
      <ServicesStyles />
      <JsonLd
        data={breadcrumbSchema([
          { name: site.name, path: '/' },
          { name: 'Services', path: '/services' },
          { name: pillarName, path: `/services/${pillarSlug}` },
          { name: parent.name, path: `/services/${slug}` },
          { name: topic.title, path: `/services/${slug}/${topicSlug}` },
        ])}
      />

      <Section theme="dark" grain offsetNav aria-labelledby="topic-h1">
        <p className="u-eyebrow sv-hero__eyebrow">
          <Link className="u-link" href="/services">
            Services
          </Link>
          {' · '}
          <Link className="u-link" href={`/services/${slug}`}>
            {parent.name}
          </Link>
        </p>

        {/* The H1 is the buyer's question, in their words, from lib/resources.ts. */}
        <h1 id="topic-h1" className="sv-h1 sv-h1--long">
          {topic.question}
        </h1>
        <p className="sv-sub">{topic.title}</p>

        {topic.pending ? (
          <div className="sv-stub" style={{ marginTop: 'var(--s8)' }}>
            <p style={{ margin: 0 }}>
              <Badge variant="neutral" size="md">
                <CircleAlert size={14} strokeWidth={2} aria-hidden="true" />
                Being written
              </Badge>
            </p>
            <p style={{ margin: 0, color: 'var(--muted-strong)' }}>
              This explainer is being written. We would rather leave the page honest than fill it,
              so there is nothing here yet beyond the question itself.
            </p>
            <p style={{ margin: 0, color: 'var(--muted-strong)' }}>
              {`In the meantime the answer is in the ${parent.name} page, or ask it directly on a scoping call and you will get it from the person who would lead the work.`}
            </p>
            <div className="sv-hero__actions" style={{ marginTop: 0 }}>
              <Button
                href={`/services/${slug}`}
                variant="primary"
                iconRight={<ArrowRight size={16} aria-hidden="true" />}
              >
                {`Back to ${parent.name}`}
              </Button>
              <Button href={site.primaryCta.href} variant="secondary">
                {site.primaryCta.label}
              </Button>
            </div>
          </div>
        ) : null}
      </Section>

      <Section theme="deep" aria-labelledby="topic-parent">
        <SectionHead
          eyebrow="The service this sits under"
          title={parent.name}
          id="topic-parent"
          lede={parent.outcome}
        />
        <p className="sv-prose-measure" style={{ color: 'var(--muted-strong)' }}>
          {parent.intro}
        </p>
        <div className="sv-hero__actions">
          <Button
            href={`/services/${slug}`}
            variant="secondary"
            iconRight={<ArrowRight size={16} aria-hidden="true" />}
          >
            {`Read ${parent.name} in full`}
          </Button>
        </div>
      </Section>

      {siblings.length > 0 ? (
        <Section theme="dark" tight aria-labelledby="topic-siblings">
          <SectionHead
            eyebrow="Other questions"
            title={`More on ${parent.short ?? parent.name}`}
            id="topic-siblings"
          />
          <LinkList
            ariaLabel="Other explainers under this service"
            items={siblings.map((sibling) => ({
              href: `/services/${slug}/${sibling.slug}`,
              label: sibling.title,
              blurb: sibling.question,
            }))}
          />
        </Section>
      ) : null}

      <Section theme="deep" tight>
        <CtaBand
          heading={parent.outcome}
          body={parent.engagement}
          secondary={{ label: `Back to ${parent.name}`, href: `/services/${slug}` }}
        />
      </Section>
    </>
  )
}
