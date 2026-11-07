import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, GitBranch, Handshake, Workflow } from 'lucide-react'
import { pillars, servicesBySlug, services, type Service } from '@/lib/services'
import { site, headlineStats } from '@/lib/site'
import { contactIntro, contactRoutes } from '@/lib/contact'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Card, CardLink } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatBar } from '@/components/ui/StatBar'
import { Faq } from '@/components/ui/Faq'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { ServicesStyles, SectionHead, LinkList } from './_components/chrome'
import { ClientStrip, CtaBand } from './_components/blocks'
import { EnquiryForm } from './_components/EnquiryForm'
import { JsonLd, breadcrumbSchema, collectionSchema, pageMetadata } from './_components/seo'

/* ========================================================================== *
 * THEME NOTE - reported, not accidental.
 *
 * The brief fixes the act structure on the PILLAR HUBS: security is
 * `theme-dark`, software is `theme-light`. This hub stays on the dark and deep
 * palettes throughout, because it is the one page in the tree carrying a
 * sticky sub-navigation. A sticky strip cannot read the palette of whichever
 * band happens to be behind it - that needs JavaScript - so a light software
 * band here would put a light <Nav> directly on top of a dark sticky strip and
 * read as a bug. The act structure is carried instead by position and by the
 * seam in the middle, and the light palette takes over the moment a visitor
 * enters /services/software-development or any software service page.
 * ========================================================================== */

const PATH = '/services'

const engagementModels = servicesBySlug['engagement-models']
const secureSdlc = servicesBySlug['devsecops']

/**
 * The hub FAQ, assembled from questions already written for the two join
 * pages. Nothing is authored here: these are the buyer questions that are
 * genuinely hub-level rather than service-level, and the conflict-of-interest
 * objection leads because it is the first thing a sceptical buyer thinks.
 */
const hubFaqs = [
  secureSdlc.faqs.find((f) => f.q === 'Is it a conflict of interest to test your own build?'),
  ...engagementModels.faqs,
  secureSdlc.faqs.find((f) => f.q === 'Can you apply this to our in-house team?'),
  secureSdlc.faqs.find((f) => f.q === 'Does this replace a penetration test?'),
].filter((f): f is NonNullable<typeof f> => Boolean(f))

const JUMP = [
  { href: '#cybersecurity', label: pillars.security.name },
  { href: '#secure-sdlc', label: secureSdlc.name },
  { href: '#software-engineering', label: pillars.software.name },
  { href: '#engagement-models', label: engagementModels.name },
  { href: '#proof', label: 'Proof' },
  { href: '#faq', label: 'Questions' },
  { href: '#enquiry-form', label: 'Start a conversation' },
]

export const metadata: Metadata = pageMetadata({
  title: 'Services',
  description: `${site.positioning} ${pillars.security.line}`,
  path: PATH,
})

/* ========================================================================== *
 * CARDS
 * ========================================================================== */

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon
  return (
    <Card padding="lg" className="sv-card">
      <div className="sv-card__top">
        <Icon className="sv-card__icon" size={20} strokeWidth={1.75} aria-hidden="true" />
        <h3 className="sv-card__name">
          <CardLink href={`/services/${service.slug}`}>{service.name}</CardLink>
        </h3>
      </div>
      <p className="sv-card__line">{service.cardLine}</p>
      <ul className="sv-card__list">
        {service.deliverables.slice(0, 3).map((item) => (
          <li key={item}>
            <Check className="sv-card__tick" size={14} strokeWidth={2} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="sv-card__cta" aria-hidden="true">
        {`View ${service.short ?? service.name}`}
        <ArrowRight size={16} strokeWidth={1.75} />
      </p>
    </Card>
  )
}

function PillarCards({ list }: { list: readonly Service[] }) {
  return (
    <RevealGroup as="ul" className="sv-grid sv-grid--3">
      {list.map((service) => (
        <Reveal as="li" key={service.slug}>
          <ServiceCard service={service} />
        </Reveal>
      ))}
    </RevealGroup>
  )
}

/* ========================================================================== *
 * PAGE
 * ========================================================================== */

export default function ServicesHubPage() {
  return (
    <>
      <ServicesStyles />
      <JsonLd
        data={collectionSchema({
          name: 'Services',
          description: site.positioning,
          path: PATH,
          items: services,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: site.name, path: '/' },
          { name: 'Services', path: PATH },
        ])}
      />

      {/* ---------------------------------------------------------------- *
       * HERO
       * ---------------------------------------------------------------- */}
      <Section theme="dark" grain offsetNav aria-labelledby="services-h1">
        <p className="u-eyebrow sv-hero__eyebrow">Services</p>
        {/* The H1 is the two pillar names, verbatim from lib/services.ts: one
            name per concept, and no claim this page is not entitled to make. */}
        <h1 id="services-h1" className="sv-h1 sv-h1--long">
          {`${pillars.security.name} and ${pillars.software.name}`}
        </h1>
        <p className="sv-sub">{site.positioning}</p>
        {/* How engagements actually run, in one line. */}
        <p className="sv-lede">{engagementModels.cardLine}</p>

        <div className="sv-hero__actions">
          <Button href={site.primaryCta.href} variant="primary" size="lg">
            {site.primaryCta.label}
          </Button>
          <Button href={`/services/${secureSdlc.slug}`} variant="secondary" size="lg">
            {`Why one firm does both, ${secureSdlc.name}`}
          </Button>
        </div>

        <ul className="sv-hero__meta">
          <li>{site.contact.responseSla}</li>
          <li>{`${pillars.security.services.length} cybersecurity services`}</li>
          <li>{`${pillars.software.services.length} engineering services`}</li>
        </ul>
      </Section>

      {/* ---------------------------------------------------------------- *
       * STICKY JUMP NAV
       * Deliberately a direct child of <main> rather than a child of a
       * <Section>: a sticky element is bounded by its own parent block, so
       * inside a short band it would unstick the moment that band scrolled
       * past. Anchors only - no JavaScript, and globals.css already sets
       * scroll-padding-top to clear the fixed nav.
       * ---------------------------------------------------------------- */}
      <nav className="sv-jump theme-deep" aria-label="Jump to a section of this page">
        <div className="u-container sv-jump__inner">
          {JUMP.map((item) => (
            <a key={item.href} className="sv-jump__link" href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ---------------------------------------------------------------- *
       * THE TWO PILLARS AND THE SEAM
       * ---------------------------------------------------------------- */}
      <Section theme="deep" aria-labelledby="pillars-h2">
        <SectionHead
          eyebrow="How the work divides"
          title="Two pillars, and the seam between them"
          id="pillars-h2"
          lede={site.methodology.oneLine}
        />

        <div className="sv-seam">
          <Card padding="lg" className="sv-seam__col" key="security">
            <p className="u-eyebrow sv-seam__kicker">Pillar one</p>
            <h3 className="sv-seam__name">
              <CardLink href={`/services/${pillars.security.slug}`}>
                {pillars.security.name}
              </CardLink>
            </h3>
            <p className="sv-seam__line">{pillars.security.line}</p>
            <p className="sv-seam__body">{pillars.security.body}</p>
            <p className="sv-seam__cta" aria-hidden="true">
              <Badge variant="neutral" size="md">
                {`${pillars.security.services.length} services`}
              </Badge>
            </p>
          </Card>

          <Card padding="lg" className="sv-seam__col sv-seam__centre" key="seam">
            <p className="u-eyebrow sv-seam__kicker">The seam</p>
            <h3 className="sv-seam__name">
              <CardLink href={`/services/${secureSdlc.slug}`}>
                <GitBranch
                  size={20}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  style={{ display: 'inline-block', verticalAlign: '-3px', marginRight: 'var(--s2)' }}
                />
                {secureSdlc.name}
              </CardLink>
            </h3>
            <p className="sv-seam__line">{secureSdlc.outcome}</p>
            <p className="sv-seam__body">{secureSdlc.cardLine}</p>
            <p className="sv-seam__cta" aria-hidden="true">
              <Badge variant="brand" size="md">
                {secureSdlc.credibility.figure}
              </Badge>
            </p>
          </Card>

          <Card padding="lg" className="sv-seam__col" key="software">
            <p className="u-eyebrow sv-seam__kicker">Pillar two</p>
            <h3 className="sv-seam__name">
              <CardLink href={`/services/${pillars.software.slug}`}>
                {pillars.software.name}
              </CardLink>
            </h3>
            <p className="sv-seam__line">{pillars.software.line}</p>
            <p className="sv-seam__body">{pillars.software.body}</p>
            <p className="sv-seam__cta" aria-hidden="true">
              <Badge variant="neutral" size="md">
                {`${pillars.software.services.length} services`}
              </Badge>
            </p>
          </Card>
        </div>

        <div id="secure-sdlc" className="sv-head" style={{ marginTop: 'var(--s16)', marginBottom: 0 }}>
          <div className="sv-head__rule" aria-hidden="true" />
          <h3 className="sv-h3">{secureSdlc.outcome}</h3>
          <p className="sv-head__lede">{secureSdlc.intro}</p>
          <p style={{ marginTop: 'var(--s6)' }}>
            <Button
              href={`/services/${secureSdlc.slug}`}
              variant="primary"
              iconRight={<ArrowRight size={16} aria-hidden="true" />}
            >
              {`Read ${secureSdlc.name}`}
            </Button>
          </p>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * CYBERSECURITY SERVICES
       * ---------------------------------------------------------------- */}
      <Section theme="dark" grain aria-labelledby="cybersecurity">
        <SectionHead
          eyebrow="Pillar one"
          title={pillars.security.name}
          id="cybersecurity"
          lede={pillars.security.line}
        />
        <PillarCards list={pillars.security.services} />
        <p className="sv-note" style={{ marginTop: 'var(--s8)' }}>
          <Link className="u-link" href={`/services/${pillars.security.slug}`}>
            {`Everything under ${pillars.security.name}`}
          </Link>
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * SOFTWARE ENGINEERING SERVICES
       * ---------------------------------------------------------------- */}
      <Section theme="deep" aria-labelledby="software-engineering">
        <SectionHead
          eyebrow="Pillar two"
          title={pillars.software.name}
          id="software-engineering"
          lede={pillars.software.line}
        />
        <PillarCards list={pillars.software.services} />
        <p className="sv-note" style={{ marginTop: 'var(--s8)' }}>
          <Link className="u-link" href={`/services/${pillars.software.slug}`}>
            {`Everything under ${pillars.software.name}`}
          </Link>
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * ENGAGEMENT MODELS
       * ---------------------------------------------------------------- */}
      <Section theme="dark" aria-labelledby="engagement-models">
        <SectionHead
          eyebrow="Commercial shape"
          title={engagementModels.name}
          id="engagement-models"
          lede={engagementModels.outcome}
        />

        <div className="sv-rail">
          <div className="sv-rail__aside">
            <Workflow size={24} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--accent)' }} />
            <p className="sv-lede" style={{ marginTop: 'var(--s4)' }}>
              {engagementModels.intro}
            </p>
            <p style={{ marginTop: 'var(--s6)' }}>
              <Button
                href={`/services/${engagementModels.slug}`}
                variant="secondary"
                iconRight={<ArrowRight size={16} aria-hidden="true" />}
              >
                How the four models differ
              </Button>
            </p>
          </div>

          <div className="sv-rail__body">
            <RevealGroup as="ul" className="sv-grid sv-grid--2">
              {engagementModels.included.map((model) => (
                <Reveal as="li" key={model.title}>
                  <Card padding="lg" className="sv-card">
                    <h3 className="sv-h3">{model.title}</h3>
                    <p className="sv-card__line">{model.body}</p>
                  </Card>
                </Reveal>
              ))}
            </RevealGroup>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * PROOF BAR
       * ---------------------------------------------------------------- */}
      <Section theme="deep" tight aria-labelledby="proof">
        <SectionHead eyebrow="Capacity" title="The firm behind the services" id="proof" />
        <StatBar stats={headlineStats} ariaLabel="Envenox at a glance" columns={4} />
        <div style={{ marginTop: 'var(--s16)' }}>
          <p className="u-eyebrow" style={{ marginBottom: 'var(--s6)' }}>
            Selected clients
          </p>
          <ClientStrip />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * THE ROUTER - "not sure what you need?"
       * ---------------------------------------------------------------- */}
      <Section theme="dark" grain aria-labelledby="router">
        <SectionHead
          eyebrow="Not sure what you need?"
          title={contactIntro.heading}
          id="router"
          lede={contactRoutes[0].body}
        />

        <div className="sv-rail">
          <div className="sv-rail__aside">
            <Handshake size={24} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--accent)' }} />
            <p className="sv-lede" style={{ marginTop: 'var(--s4)' }}>
              {contactIntro.lead}
            </p>
            <div className="sv-hero__actions">
              <Button href={site.primaryCta.href} variant="primary" size="lg">
                {site.primaryCta.label}
              </Button>
            </div>
          </div>
          <div className="sv-rail__body">
            <LinkList
              ariaLabel="Where to start"
              items={[
                {
                  href: `/services/${secureSdlc.slug}`,
                  label: secureSdlc.name,
                  blurb: secureSdlc.cardLine,
                },
                {
                  href: `/services/${pillars.security.slug}`,
                  label: pillars.security.name,
                  blurb: pillars.security.line,
                },
                {
                  href: `/services/${pillars.software.slug}`,
                  label: pillars.software.name,
                  blurb: pillars.software.line,
                },
                {
                  href: `/services/${engagementModels.slug}`,
                  label: engagementModels.name,
                  blurb: engagementModels.cardLine,
                },
                {
                  href: '/sample-report',
                  label: 'Walk a sample report',
                  blurb: 'See what actually lands in your inbox before you buy one.',
                },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * FAQ - the single FAQPage on this document (emitted by <Faq>)
       * ---------------------------------------------------------------- */}
      <Section theme="deep" aria-labelledby="faq">
        <SectionHead eyebrow="Before you ask" title="Questions buyers ask" id="faq" />
        <Faq items={hubFaqs} headingLevel={3} />
      </Section>

      {/* ---------------------------------------------------------------- *
       * INLINE ENQUIRY FORM - the services norm, and it posts without JS
       * ---------------------------------------------------------------- */}
      <Section theme="dark" grain aria-labelledby="enquiry-h2">
        <div className="sv-rail">
          <div className="sv-rail__aside">
            <p className="u-eyebrow">{contactIntro.eyebrow}</p>
            <h2 id="enquiry-h2" className="sv-h2" style={{ marginTop: 'var(--s3)' }}>
              {contactIntro.heading}
            </h2>
            <p className="sv-lede">{contactIntro.lead}</p>
            {/* No hotline in the body here: the fixed <Nav> carries a visible
                tel: link at every width, and repeating it on every page in the
                tree would dilute the one place it belongs in body copy —
                /services/incident-response. */}
            <p className="sv-note">{contactRoutes[0].sla}</p>
          </div>
          <div className="sv-rail__body">
            <EnquiryForm returnTo={PATH} />
          </div>
        </div>
      </Section>

      <Section theme="deep" tight>
        <CtaBand
          heading={site.methodology.name}
          body={site.methodology.oneLine}
          primaryLabel="Read how we work"
          primaryHref={`/${site.methodology.slug}`}
          secondary={site.secondaryCta}
        />
      </Section>
    </>
  )
}
