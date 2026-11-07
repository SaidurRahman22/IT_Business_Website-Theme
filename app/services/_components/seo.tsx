/**
 * Structured data and metadata for the services tree.
 *
 * DIVISION OF LABOUR:
 *   app/layout.tsx  → Organization + WebSite, sitewide. Never re-emitted here.
 *   components/ui/Faq.tsx → FAQPage, for exactly the questions it renders.
 *                           Verified in the implementation; NOT duplicated here.
 *   this file       → Service, BreadcrumbList, and the collection schema for
 *                     the hub and the two pillar hubs.
 *
 * Pricing is deliberately absent from every schema below. Nobody in this sector
 * publishes a price, there is no number in the content layer to publish, and an
 * `offers.price` invented to satisfy a validator is a fabricated commercial fact.
 */

import type { Metadata } from 'next'
import { site } from '@/lib/site'
import type { Service } from '@/lib/services'

/** JSON-LD that cannot break out of its script element. */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  )
}

/* ========================================================================== *
 * SERVICE
 * ========================================================================== */

export function serviceSchema(service: Service, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${site.url}${path}#service`,
    name: service.name,
    serviceType: service.name,
    alternateName: service.short,
    description: service.outcome,
    disambiguatingDescription: service.cardLine,
    url: `${site.url}${path}`,
    provider: { '@id': `${site.url}/#organization` },
    areaServed: site.offices.map((office) => ({
      '@type': 'Country',
      name: office.country,
    })),
    audience: { '@type': 'BusinessAudience', name: 'Regulated organisations' },
    category:
      service.pillar === 'security'
        ? 'Cybersecurity'
        : service.pillar === 'software'
          ? 'Software Development'
          : 'Secure software development lifecycle',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.name}, what is included`,
      itemListElement: service.included.map((item, index) => ({
        '@type': 'OfferCatalogItem',
        position: index + 1,
        name: item.title,
        description: item.body,
      })),
    },
    termsOfService: `${site.url}/legal/terms`,
  }
}

/* ========================================================================== *
 * BREADCRUMBS
 * ========================================================================== */

export function breadcrumbSchema(trail: readonly { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path}`,
    })),
  }
}

/* ========================================================================== *
 * FAQPAGE - only where <Faq> is NOT the sole renderer of the questions
 *
 * `components/ui/Faq.tsx` already emits FAQPage for exactly the items it
 * renders, so the overwhelming majority of pages in this tree need nothing
 * here. The exception is /services/devsecops, which pulls the
 * conflict-of-interest question OUT of the accordion and renders it as prose at
 * the top of the page. That page therefore passes `jsonLd={false}` to <Faq> and
 * emits one FAQPage from here covering every question on the document - one
 * FAQPage per page either way, never two.
 * ========================================================================== */

export function faqPageSchema(items: readonly { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

/* ========================================================================== *
 * COLLECTION - the hub and the pillar hubs
 * ========================================================================== */

export function collectionSchema({
  name,
  description,
  path,
  items,
}: {
  name: string
  description: string
  path: string
  items: readonly Service[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${site.url}${path}#collection`,
    name,
    description,
    url: `${site.url}${path}`,
    isPartOf: { '@id': `${site.url}/#website` },
    about: { '@id': `${site.url}/#organization` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        description: item.cardLine,
        url: `${site.url}/services/${item.slug}`,
      })),
    },
  }
}

/* ========================================================================== *
 * METADATA
 * ========================================================================== */

/**
 * Descriptions are built from `outcome` + `credibility`, both of which are
 * written copy. Nothing is paraphrased and no keyword string is appended.
 * Trimmed to 300 characters at a word boundary so a snippet never ends mid-word.
 */
export function clamp(text: string, max = 300): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[,;:·\-\s]+$/, '')}…`
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}): Metadata {
  const clamped = clamp(description)
  return {
    title,
    description: clamped,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title: `${title} · ${site.name}`,
      description: clamped,
      url: `${site.url}${path}`,
      siteName: site.name,
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · ${site.name}`,
      description: clamped,
    },
  }
}

export function serviceMetadata(service: Service, path: string): Metadata {
  return pageMetadata({
    title: service.name,
    description: `${service.outcome} ${service.credibility.figure} ${service.credibility.context}.`,
    path,
  })
}
