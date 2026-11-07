import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Boxes, ShieldCheck, Users } from 'lucide-react'
import { services, servicesBySlug, pillars, type Service } from '@/lib/services'
import { site } from '@/lib/site'
import { contactIntro } from '@/lib/contact'
import { serviceTopicsByParent } from '@/lib/resources'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Faq } from '@/components/ui/Faq'
import { ServicesStyles, SectionHead, Credibility, ServiceBanner } from '../_components/chrome'
import {
  AccreditationStrip,
  CaseStudyBlock,
  Chips,
  ClientStrip,
  CtaBand,
  EngagementShape,
  ExpertBlock,
  HotlineBlock,
  IncludedGrid,
  MethodologyLink,
  RelatedServices,
  ReviewBadges,
  TickList,
  TopicCluster,
} from '../_components/blocks'
import { EnquiryForm } from '../_components/EnquiryForm'
import { JsonLd, breadcrumbSchema, serviceSchema, serviceMetadata } from '../_components/seo'
import {
  ConsoleFrame,
  DeliverablesStack,
  EngagementTimeline,
  ScopeBoundary,
} from '../_components/diagrams'
import { consolesFor } from '../_components/consoles'
import { CardStack, StackCard } from '@/components/story/Story'
import { serviceImage } from '@/lib/service-images'

/* ========================================================================== *
 * ROUTE COLLISION - how `devsecops` is kept out of this template.
 *
 * Next.js App Router already resolves a static segment before a dynamic one,
 * so `app/services/devsecops/page.tsx` wins over `app/services/[slug]` at
 * request time whatever this file does. Two further guards make that explicit
 * rather than incidental:
 *
 *   1. generateStaticParams filters OWN_ROUTE_SLUGS out, so the build does not
 *      prerender a second, unreachable copy of those pages.
 *   2. the component calls notFound() if one of them ever arrives here, which
 *      would mean the static route had been deleted - better a 404 than a
 *      silently different page at the same URL.
 *
 * The two pillar slugs (`cybersecurity`, `software-development`) are not
 * service slugs at all - they live on `pillars.*.slug` - so they can never be
 * produced by generateStaticParams. They are listed in the guard anyway,
 * because a future rename that collided would otherwise fail silently.
 * ========================================================================== */

const OWN_ROUTE_SLUGS = new Set([
  'devsecops',
  'engagement-models',
  pillars.security.slug,
  pillars.software.slug,
])

/**
 * Services whose scope question is "where is the line", not "what is in the
 * brochure". These get <ScopeBoundary> - `included` drawn inside a boundary,
 * the service's own stated exclusions outside it - instead of a card grid.
 * Everything else keeps <IncludedGrid>, because drawing a boundary round a
 * build service would imply an exclusion list it does not have.
 */
const SCOPE_BOUNDARY_SLUGS = new Set([
  'penetration-testing',
  'application-security',
  'red-teaming',
  'cloud-security',
  'qa-automation',
])

export function generateStaticParams() {
  return services
    .filter((service) => !OWN_ROUTE_SLUGS.has(service.slug))
    .map((service) => ({ slug: service.slug }))
}

export const dynamicParams = false

type Params = { slug: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const service = servicesBySlug[slug]
  if (!service || OWN_ROUTE_SLUGS.has(slug)) {
    return { title: 'Service not found', robots: { index: false, follow: true } }
  }
  return serviceMetadata(service, `/services/${slug}`)
}

/* ========================================================================== *
 * SHARED PIECES
 * ========================================================================== */

function ServiceHero({ service, theme }: { service: Service; theme: 'dark' | 'light' }) {
  const Icon = service.icon
  const banner = serviceImage(service.slug)
  const pillarName =
    service.pillar === 'security' ? pillars.security.name : pillars.software.name
  const pillarSlug =
    service.pillar === 'security' ? pillars.security.slug : pillars.software.slug

  return (
    <Section theme={theme} grain offsetNav aria-labelledby="service-h1">
      {/* TWO COLUMNS, because one was leaving half the band empty.
          Everything here used to stack in a single column, and every item in
          it carries its own measure: the h1 is capped at 20ch, the sub at
          54ch, the stat at 68ch. Measured on the built page at 1440, the copy
          stopped at x=810 inside a container running to x=1320, so roughly
          500px of every service hero was blank.
          The stat moves to its own column rather than sitting under the lede.
          It is the one piece of evidence on the page a buyer scans for, and in
          a column of its own it reads as a figure rather than as another
          paragraph. */}
      <div className="sv-hero">
        <div className="sv-hero__main">
          <p className="u-eyebrow sv-hero__eyebrow">
            <Link className="u-link" href="/services">
              Services
            </Link>
            {' · '}
            <Link className="u-link" href={`/services/${pillarSlug}`}>
              {pillarName}
            </Link>
          </p>

          <h1 id="service-h1" className="sv-h1">
            <Icon
              size={32}
              strokeWidth={1.5}
              aria-hidden="true"
              style={{ display: 'inline-block', verticalAlign: '-4px', marginRight: 'var(--s3)', color: 'var(--accent)' }}
            />
            {service.name}
          </h1>

          <p className="sv-sub">{service.outcome}</p>

          <div className="sv-hero__actions">
            <Button href={site.primaryCta.href} variant="primary" size="lg">
              {site.primaryCta.label}
            </Button>
            <Button href="#enquiry-form" variant="secondary" size="lg">
              Send an enquiry
            </Button>
          </div>

          <ul className="sv-hero__meta">
            <li>{service.timeline}</li>
            <li>{service.engagement}</li>
          </ul>
        </div>

        <div className="sv-hero__aside">
          <ServiceBanner src={banner} />
          <Credibility figure={service.credibility.figure} context={service.credibility.context} />
        </div>
      </div>
    </Section>
  )
}

function ProblemFraming({ service, theme }: { service: Service; theme: 'dark' | 'light' | 'deep' }) {
  return (
    <Section theme={theme} aria-labelledby="problem">
      <div className="sv-rail">
        <div className="sv-rail__aside">
          <div className="sv-head__rule" aria-hidden="true" style={{ marginBottom: 'var(--s6)' }} />
          <p className="u-eyebrow">The problem</p>
          <h2 id="problem" className="sv-h2" style={{ marginTop: 'var(--s3)' }}>
            {service.outcome}
          </h2>
        </div>
        <div className="sv-rail__body">
          <p className="sv-prose-measure" style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--muted-strong)' }}>
            {service.intro}
          </p>
          {service.frameworks ? (
            <div style={{ marginTop: 'var(--s8)' }}>
              <p className="u-eyebrow" style={{ marginBottom: 'var(--s3)' }} id="frameworks">
                Frameworks we work to
              </p>
              <Chips items={service.frameworks} ariaLabel="Frameworks and standards" />
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

/**
 * SECURITY BY DEFAULT - the software pillar's differentiator.
 *
 * Rendered on the dark palette inside an otherwise light page: this is the
 * security act showing through the software craft act, which is precisely the
 * argument the block makes. Every sentence is `pillars.software.body` and the
 * Secure SDLC service's own copy.
 */
function SecurityByDefault() {
  const secureSdlc = servicesBySlug['devsecops']
  return (
    <Section theme="dark" grain aria-labelledby="security-by-default">
      <SectionHead
        eyebrow="The differentiator"
        title="Security by default"
        id="security-by-default"
        lede={pillars.software.body}
      />

      <div className="sv-rail">
        <div className="sv-rail__aside">
          <ShieldCheck size={24} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--accent)' }} />
          <p className="sv-lede" style={{ marginTop: 'var(--s4)' }}>
            {secureSdlc.outcome}
          </p>
          {/* Badge is a short LABEL primitive and sets white-space: nowrap.
              A credibility sentence in one overflowed the viewport by 320px at
              320px wide. <Credibility> is the component built for this pair. */}
          <Credibility
            figure={secureSdlc.credibility.figure}
            context={secureSdlc.credibility.context}
          />
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
        <div className="sv-rail__body">
          <TickList
            ariaLabel="What security by default means on a build"
            items={secureSdlc.included.map((item) => `${item.title}, ${item.body}`)}
          />
        </div>
      </div>
    </Section>
  )
}

/* ========================================================================== *
 * PAGE
 * ========================================================================== */

export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params

  const service = servicesBySlug[slug]
  if (!service || OWN_ROUTE_SLUGS.has(slug)) notFound()

  const path = `/services/${slug}`
  const isSecurity = service.pillar === 'security'
  const base: 'dark' | 'light' = isSecurity ? 'dark' : 'light'
  const alt: 'deep' | 'light' = isSecurity ? 'deep' : 'light'
  const pillarName = isSecurity ? pillars.security.name : pillars.software.name
  const pillarSlug = isSecurity ? pillars.security.slug : pillars.software.slug
  const hasTopics = (serviceTopicsByParent[slug]?.length ?? 0) > 0
  const consoles = consolesFor(slug)
  const hasBoundary = SCOPE_BOUNDARY_SLUGS.has(slug)
  const phaseCount = service.phases.length

  return (
    <>
      <ServicesStyles />
      <JsonLd data={serviceSchema(service, path)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: site.name, path: '/' },
          { name: 'Services', path: '/services' },
          { name: pillarName, path: `/services/${pillarSlug}` },
          { name: service.name, path },
        ])}
      />

      <ServiceHero service={service} theme={base} />

      {/* The one page in the tree where the hotline belongs in body copy. */}
      {slug === 'incident-response' ? (
        <Section theme="deep" tight aria-labelledby="hotline-h2">
          <h2 id="hotline-h2" className="sv-sr">
            Incident response hotline
          </h2>
          <HotlineBlock />
        </Section>
      ) : null}

      <ProblemFraming service={service} theme={alt} />

      {/* ---------------- THE CONSOLES ----------------
          The claim is made in the section above; this is the evidence for it,
          immediately after. Theme flips to the opposite act so the band reads
          as a separate exhibit rather than more of the same argument, which
          also keeps the dark/paper alternation intact on both pillars. */}
      {consoles.length ? (
        <Section theme={isSecurity ? 'light' : 'deep'} aria-labelledby="consoles">
          <SectionHead
            eyebrow="The working surface"
            title="What this looks like in operation"
            id="consoles"
            lede="Drawn, not screenshotted. These stand in for platforms we operate and do not own, so the data is illustrative, but the density, the columns and the decisions on them are the real ones."
          />
          <div className="sv-consoles">
            {consoles.map((placement) => (
              <ConsoleFrame
                key={placement.key}
                eyebrow={placement.eyebrow}
                title={placement.title}
                body={placement.body}
              >
                {placement.node}
              </ConsoleFrame>
            ))}
          </div>
        </Section>
      ) : null}

      {/* ---------------- WHAT'S INCLUDED ---------------- */}
      <Section theme={base} aria-labelledby="included">
        <SectionHead
          eyebrow="Scope"
          title={hasBoundary ? 'Where the line is' : 'What is included'}
          id="included"
          lede={
            hasBoundary
              ? 'What we will not test is as important as what we will, so both are on the same page rather than one of them in an appendix.'
              : undefined
          }
        />
        {hasBoundary ? (
          <ScopeBoundary service={service} />
        ) : (
          <IncludedGrid items={service.included} />
        )}
      </Section>

      {/* ---------------- SOFTWARE: security by default, placed high ---------------- */}
      {!isSecurity ? <SecurityByDefault /> : null}

      {/* ---------------- METHODOLOGY ---------------- */}
      <Section theme={alt} aria-labelledby="methodology">
        <SectionHead
          eyebrow={site.methodology.name}
          title="How the engagement runs"
          id="methodology"
          lede={site.methodology.oneLine}
        />
        {/* The SHAPE first, every phase on one axis, placed from its own
            stated schedule, with the artefact that drops out of it. Below
            860px the drawn band is display:none and its schedule list is the
            diagram, so a narrow viewport never scrolls sideways. */}
        <EngagementTimeline service={service} id="engagement-shape" />

        {/* Then the detail, one idea per card. The stack is this page's single
            motion stage: equal-offset sticky siblings, pure CSS, and a plain
            list under prefers-reduced-motion. */}
        <div className="sv-phaseStack">
          <CardStack>
            {service.phases.map((phase) => (
              <StackCard
                key={phase.n}
                index={`${String(phase.n).padStart(2, '0')} / ${String(phaseCount).padStart(2, '0')}`}
                title={phase.name}
              >
                {phase.days ? <p className="sv-phaseWhen u-mono">{phase.days}</p> : null}
                <p className="sv-phaseBody">{phase.body}</p>
              </StackCard>
            ))}
          </CardStack>
        </div>

        <MethodologyLink slug={slug} />
      </Section>

      {/* ---------------- SOFTWARE: the stack ---------------- */}
      {!isSecurity && service.stack ? (
        <Section theme={base} tight aria-labelledby="stack">
          <SectionHead eyebrow="Technology" title="The stack" id="stack" />
          <div style={{ display: 'flex', gap: 'var(--s4)', alignItems: 'flex-start' }}>
            <Boxes size={24} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--accent)', flex: 'none' }} />
            <Chips items={service.stack} ariaLabel="Technology stack" />
          </div>
        </Section>
      ) : null}

      {/* ---------------- DELIVERABLES ---------------- */}
      <Section theme={isSecurity ? base : alt} aria-labelledby="deliverables">
        <div className="sv-rail">
          <div className="sv-rail__aside">
            <div className="sv-head__rule" aria-hidden="true" style={{ marginBottom: 'var(--s6)' }} />
            <p className="u-eyebrow">Deliverables</p>
            <h2 id="deliverables" className="sv-h2" style={{ marginTop: 'var(--s3)' }}>
              Exactly what lands in your inbox
            </h2>
            <p className="sv-note">
              <Link className="u-link" href="/sample-report">
                Walk a redacted sample before you buy one
              </Link>
            </p>
            {/* The artefacts as objects rather than as a list of promises.
                Each sheet carries its real name and the form it arrives in;
                the full sentences are the list beside this. */}
            <div className="sv-deliverableArt">
              <DeliverablesStack service={service} />
            </div>
          </div>
          <div className="sv-rail__body">
            <TickList items={service.deliverables} ariaLabel="Deliverables" />
          </div>
        </div>
      </Section>

      {/* ---------------- SECURITY: accreditation strip ---------------- */}
      {isSecurity ? (
        <Section theme={alt} tight aria-labelledby="accreditation">
          <SectionHead eyebrow="Accreditation" title="Certifications" id="accreditation" />
          <AccreditationStrip relevance="security" />
        </Section>
      ) : null}

      {/* ---------------- OUTCOMES ---------------- */}
      <Section theme={base} aria-labelledby="outcomes">
        <SectionHead eyebrow="Outcomes" title="What changes afterwards" id="outcomes" />
        <TickList items={service.outcomes} ariaLabel="Outcomes" />
      </Section>

      {/* ---------------- TEAM COMPOSITION + NAMED EXPERT ---------------- */}
      <Section theme={alt} aria-labelledby="team">
        <SectionHead
          eyebrow="Who does the work"
          title="The team on your engagement"
          id="team"
          lede={service.teamShape}
        />
        <ExpertBlock slug={service.expert} />
      </Section>

      {/* ---------------- CASE STUDY ---------------- */}
      {service.caseStudy ? (
        <Section theme={base} grain aria-labelledby="case-study">
          <SectionHead eyebrow="Proof" title="An engagement in full" id="case-study" />
          <CaseStudyBlock slug={service.caseStudy} />
        </Section>
      ) : null}

      {/* ---------------- SOFTWARE: third-party reviews ---------------- */}
      {!isSecurity ? (
        <Section theme={alt} tight aria-labelledby="reviews">
          <SectionHead eyebrow="Third-party reviews" title="Where we are reviewed" id="reviews" />
          <ReviewBadges pillar="software" />
          <div style={{ marginTop: 'var(--s12)' }}>
            <p className="u-eyebrow" style={{ marginBottom: 'var(--s4)' }}>
              Accreditation
            </p>
            <AccreditationStrip relevance="software" />
          </div>
        </Section>
      ) : null}

      {/* ---------------- CLIENT STRIP ---------------- */}
      <Section theme={isSecurity ? alt : base} tight aria-labelledby="clients">
        <h2 id="clients" className="u-eyebrow" style={{ marginBottom: 'var(--s6)' }}>
          Selected clients
        </h2>
        <ClientStrip />
      </Section>

      {/* ---------------- RELATED SERVICES ---------------- */}
      <Section theme={base} aria-labelledby="related">
        <SectionHead eyebrow="Related" title="What usually goes with this" id="related" />
        <RelatedServices service={service} />
      </Section>

      {/* ---------------- ENGAGEMENT SHAPE ---------------- */}
      <Section theme={alt} aria-labelledby="engagement">
        <SectionHead eyebrow="Commercials" title="Shape, timeline and scoping" id="engagement" />
        <EngagementShape service={service} />
      </Section>

      {/* ---------------- TOPIC CLUSTER ---------------- */}
      {hasTopics ? (
        <Section theme={base} tight aria-labelledby="topics">
          <SectionHead
            eyebrow="Explainers"
            title={`Questions about ${service.short ?? service.name}`}
            id="topics"
          />
          <TopicCluster slug={slug} />
        </Section>
      ) : null}

      {/* ---------------- FAQ, the one FAQPage on this document ---------------- */}
      <Section theme={isSecurity ? alt : base} aria-labelledby="faq">
        <SectionHead eyebrow="Questions" title="Frequently asked" id="faq" />
        <Faq items={service.faqs} headingLevel={3} />
      </Section>

      {/* ---------------- INLINE ENQUIRY FORM ---------------- */}
      <Section theme={base} grain aria-labelledby="enquiry-h2">
        <div className="sv-rail">
          <div className="sv-rail__aside">
            <p className="u-eyebrow">{contactIntro.eyebrow}</p>
            <h2 id="enquiry-h2" className="sv-h2" style={{ marginTop: 'var(--s3)' }}>
              {contactIntro.heading}
            </h2>
            <p className="sv-lede">{contactIntro.lead}</p>
            <p className="sv-note">
              <Users size={16} strokeWidth={1.75} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-3px', marginRight: 'var(--s2)' }} />
              {service.teamShape}
            </p>
          </div>
          <div className="sv-rail__body">
            <EnquiryForm returnTo={path} interest={slug} />
          </div>
        </div>
      </Section>

      {/* ---------------- CLOSING CTA BAND ---------------- */}
      <Section theme={alt} tight>
        <CtaBand
          heading={service.outcome}
          body={service.engagement}
          secondary={{ label: site.secondaryCta.label, href: site.secondaryCta.href }}
        />
      </Section>
    </>
  )
}
