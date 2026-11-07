import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Code,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { servicesBySlug, pillars } from '@/lib/services'
import { site } from '@/lib/site'
import { contactIntro } from '@/lib/contact'
import { peopleBySlug } from '@/lib/people'
import { caseStudiesBySlug } from '@/lib/case-studies'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Faq } from '@/components/ui/Faq'
import { ChapterOpener } from '@/components/ui/ChapterOpener'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { SecureSdlcPipeline } from '@/components/diagram/SecureSdlcPipeline'
import { ComparisonTable } from '@/components/diagram/ComparisonTable'
import { ServicesStyles, SectionHead, Credibility, ServiceBanner } from '../_components/chrome'
import { serviceImage } from '@/lib/service-images'
import {
  CaseStudyBlock,
  Chips,
  ClientStrip,
  EngagementShape,
  IncludedGrid,
  PhaseList,
  RelatedServices,
  TickList,
} from '../_components/blocks'
import { EnquiryForm } from '../_components/EnquiryForm'
import {
  JsonLd,
  breadcrumbSchema,
  faqPageSchema,
  serviceSchema,
  serviceMetadata,
} from '../_components/seo'

/* ========================================================================== *
 * /services/devsecops - THE PAGE THAT JUSTIFIES THE COMPANY
 *
 * ROUTE COLLISION: `devsecops` is also a slug in lib/services.ts, so this
 * static route and `app/services/[slug]` both describe the same URL. The App
 * Router resolves the static segment first, so this file wins at request time.
 * `app/services/[slug]/page.tsx` additionally excludes the slug from
 * generateStaticParams and calls notFound() if it ever arrives, so the win is
 * explicit rather than incidental.
 *
 * MOTION: this page carries the site's second scroll-driven moment -
 * <SecureSdlcPipeline />, SVG stroke-dash, which renders finished with
 * scripting off and never opts in under prefers-reduced-motion. Everything
 * else is the house reveal: slideUpMoreAndFade, --dur-base, --ease-out, 60ms
 * stagger capped at five.
 *
 * INSTRUMENT SERIF: the ChapterOpener below is this agent's single use of the
 * rationed serif across all 35 routes under /services. It is spent here
 * deliberately, on the one line the whole company rests on.
 * ========================================================================== */

const PATH = '/services/devsecops'
const service = servicesBySlug['devsecops']
const study = caseStudiesBySlug['healthtech-secure-sdlc']

/** The objection a sceptical buyer thinks of first. Surfaced, not buried. */
const CONFLICT_Q = 'Is it a conflict of interest to test your own build?'
const conflictFaq = service.faqs.find((f) => f.q === CONFLICT_Q)
const remainingFaqs = service.faqs.filter((f) => f.q !== CONFLICT_Q)

const cycleTimeFaq = service.faqs.find((f) => f.q === 'How do you prove the cycle-time claim?')
const complianceFaq = service.faqs.find(
  (f) => f.q === 'What compliance evidence does this generate?',
)

/** Named roles and seniority, resolved from lib/people.ts. */
const DEV_SQUAD = ['marcus-reid', 'priya-raman'] as const
const SECURITY_SQUAD = ['sofia-marek', 'imran-haque'] as const

export const metadata: Metadata = serviceMetadata(service, PATH)

function SquadColumn({
  heading,
  note,
  slugs,
  icon,
}: {
  heading: string
  note: string
  slugs: readonly string[]
  icon: React.ReactNode
}) {
  return (
    <div>
      <div className="sv-contrast__head">
        <span className="sv-contrast__icon">{icon}</span>
        <h3 className="sv-contrast__h">{heading}</h3>
      </div>
      <p className="sv-card__line">{note}</p>
      <RevealGroup as="ul" className="sv-grid" style={{ marginTop: 'var(--s6)' }}>
        {slugs.map((slug) => {
          const person = peopleBySlug[slug]
          if (!person) return null
          return (
            <Reveal as="li" key={slug}>
              <Card padding="md">
                <div style={{ display: 'flex', gap: 'var(--s4)', alignItems: 'flex-start' }}>
                  <AvatarPlaceholder name={person.name} size={56} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 500 }}>{person.name}</p>
                    <p className="sv-expert__role" style={{ marginTop: 2 }}>
                      {person.role}
                    </p>
                    {person.certifications && person.certifications.length > 0 ? (
                      <ul className="sv-chips" style={{ marginTop: 'var(--s3)' }} aria-label={`${person.name} certifications`}>
                        {person.certifications.map((cert) => (
                          <li key={cert}>
                            <Badge variant="neutral">{cert}</Badge>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </Card>
            </Reveal>
          )
        })}
      </RevealGroup>
    </div>
  )
}

export default function SecureSdlcPage() {
  return (
    <>
      <ServicesStyles />
      <JsonLd data={serviceSchema(service, PATH)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: site.name, path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.name, path: PATH },
        ])}
      />
      {/* <Faq> below runs with jsonLd={false}; this is the document's one
          FAQPage, and it covers the conflict question rendered as prose too. */}
      <JsonLd data={faqPageSchema(service.faqs)} />

      {/* ================= HERO ================= */}
      <Section theme="dark" grain offsetNav aria-labelledby="devsecops-h1">
        {/* Two columns, matching the [slug] template. This hero stacked in a
            single column and left the same ~500px of empty band to its right
            that the templated services had before the grid went in. */}
        <div className="sv-hero">
          <div className="sv-hero__main">
            <p className="u-eyebrow sv-hero__eyebrow">
              <Link className="u-link" href="/services">
                Services
              </Link>
              {' · '}
              {service.name}
            </p>

            <ChapterOpener as="h1" id="devsecops-h1" note={service.cardLine}>
              We build it and we break it.
            </ChapterOpener>

            <div className="sv-hero__actions">
              <Button href="#enquiry-form" variant="primary" size="lg">
                Book a secure-SDLC assessment
              </Button>
              <Button href="#the-model" variant="secondary" size="lg">
                See the integrated model
              </Button>
            </div>

            <ul className="sv-hero__meta">
              <li>{service.timeline}</li>
              <li>{service.engagement}</li>
            </ul>
          </div>

          <div className="sv-hero__aside">
            <ServiceBanner src={serviceImage('devsecops')} />
            <Credibility figure={service.credibility.figure} context={service.credibility.context} />
          </div>
        </div>
      </Section>

      {/* ================= THE GAP ================= */}
      <Section theme="deep" aria-labelledby="the-gap">
        <SectionHead
          eyebrow="The gap"
          title="Week forty-one is the expensive way"
          id="the-gap"
          lede={service.outcome}
        />

        <div className="sv-rail">
          <div className="sv-rail__aside">
            <ShieldAlert size={24} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--accent)' }} />
            <p className="sv-lede" style={{ marginTop: 'var(--s4)' }}>
              {study.challenge}
            </p>
          </div>
          <div className="sv-rail__body">
            <p
              className="sv-prose-measure"
              style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--muted-strong)' }}
            >
              {service.intro}
            </p>
          </div>
        </div>
      </Section>

      {/* ================= THE OBJECTION, SURFACED ================= *
       * The conflict-of-interest question is the first thing a sceptical
       * buyer thinks, so it is answered here in prose rather than behind an
       * accordion chevron at the bottom of the page. A page that does not
       * raise the obvious objection reads as naive or evasive.
       * ========================================================== */}
      {conflictFaq ? (
        <Section theme="dark" aria-labelledby="objection">
          <div className="sv-rail">
            <div className="sv-rail__aside">
              <div className="sv-head__rule" aria-hidden="true" style={{ marginBottom: 'var(--s6)' }} />
              <p className="u-eyebrow">The obvious objection</p>
              <h2 id="objection" className="sv-h2" style={{ marginTop: 'var(--s3)' }}>
                {conflictFaq.q}
              </h2>
            </div>
            <div className="sv-rail__body">
              <p
                className="sv-prose-measure"
                style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--muted-strong)' }}
              >
                {conflictFaq.a}
              </p>
              <figure className="sv-quote" style={{ marginTop: 'var(--s12)' }}>
                <blockquote className="sv-quote__text">
                  <p style={{ margin: 0 }}>{study.quote.text}</p>
                </blockquote>
                <figcaption className="sv-quote__by">
                  {`${study.quote.role}, ${study.quote.company}`}
                </figcaption>
              </figure>
            </div>
          </div>
        </Section>
      ) : null}

      {/* ================= THE INTEGRATED MODEL, AS A DIAGRAM =================
       * The site's second scroll-driven moment. The component renders
       * finished with scripting off and declines to animate under
       * prefers-reduced-motion; it needs no wrapper state from this page.
       * ============================================================= */}
      <Section theme="deep" bleed aria-labelledby="the-model">
        <div className="u-container">
          <SectionHead
            eyebrow="The integrated model"
            title={service.name}
            id="the-model"
            lede={service.cardLine}
          />
        </div>
        <SecureSdlcPipeline />
      </Section>

      {/* ================= WHAT'S INCLUDED ================= */}
      <Section theme="dark" aria-labelledby="included">
        <SectionHead eyebrow="Scope" title="What is included" id="included" />
        <IncludedGrid items={service.included} />
      </Section>

      {/* ================= WHO DOES WHAT ================= */}
      <Section theme="light" aria-labelledby="squads">
        <SectionHead
          eyebrow="Who does what"
          title="The dev squad and the security squad"
          id="squads"
          lede={service.teamShape}
        />

        <div className="sv-contrast">
          <SquadColumn
            heading={pillars.software.name}
            note={pillars.software.line}
            slugs={DEV_SQUAD}
            icon={<Code size={20} strokeWidth={1.75} aria-hidden="true" />}
          />
          <SquadColumn
            heading={pillars.security.name}
            note={pillars.security.line}
            slugs={SECURITY_SQUAD}
            icon={<ShieldCheck size={20} strokeWidth={1.75} aria-hidden="true" />}
          />
        </div>

        <p className="sv-note" style={{ marginTop: 'var(--s12)' }}>
          {study.team}
        </p>
      </Section>

      {/* ================= THE PHASES ================= */}
      <Section theme="deep" aria-labelledby="phases">
        <SectionHead
          eyebrow={site.methodology.name}
          title="How the loop runs"
          id="phases"
          lede={site.methodology.oneLine}
        />
        <PhaseList phases={service.phases} />
      </Section>

      {/* ================= EVIDENCE: CYCLE TIME ================= */}
      <Section theme="dark" grain aria-labelledby="evidence">
        <SectionHead
          eyebrow="Evidence"
          title="Findings land in our own sprint backlog"
          id="evidence"
          lede={cycleTimeFaq?.a}
        />

        <ul className="sv-metrics">
          <li>
            <strong className="sv-metric__value u-tnum">{service.credibility.figure}</strong>
            <span className="sv-metric__label">{service.credibility.context}</span>
          </li>
          {study.metrics.slice(0, 2).map((metric) => (
            <li key={metric.label}>
              <strong className="sv-metric__value u-tnum">{metric.value}</strong>
              <span className="sv-metric__label">{metric.label}</span>
              {metric.note ? <span className="sv-metric__note">{metric.note}</span> : null}
            </li>
          ))}
        </ul>

        <div className="sv-rail" style={{ marginTop: 'var(--s16)' }}>
          <div className="sv-rail__aside">
            <Clock size={24} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--accent)' }} />
            <p className="sv-lede" style={{ marginTop: 'var(--s4)' }}>
              {service.outcome}
            </p>
          </div>
          <div className="sv-rail__body">
            <TickList items={service.deliverables} ariaLabel="What the engagement produces" />
          </div>
        </div>
      </Section>

      {/* ================= COMPLIANCE AS A BY-PRODUCT ================= */}
      <Section theme="light" aria-labelledby="compliance">
        <SectionHead
          eyebrow="Compliance"
          title="Compliance as a by-product"
          id="compliance"
          lede={complianceFaq?.a}
        />

        <div className="sv-rail">
          <div className="sv-rail__aside">
            <BadgeCheck size={24} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--accent)' }} />
            {service.frameworks ? (
              <div style={{ marginTop: 'var(--s6)' }}>
                <Chips items={service.frameworks} ariaLabel="Frameworks this process satisfies" />
              </div>
            ) : null}
            <p className="sv-note">
              <Link className="u-link" href="/services/grc-compliance">
                {servicesBySlug['grc-compliance'].name}
              </Link>
              {' · '}
              <Link className="u-link" href="/trust">
                Our own posture
              </Link>
            </p>
          </div>
          <div className="sv-rail__body">
            <TickList items={service.outcomes} ariaLabel="Outcomes" />
          </div>
        </div>
      </Section>

      {/* ================= CASE STUDY ================= */}
      <Section theme="deep" aria-labelledby="case-study">
        <SectionHead
          eyebrow="Proof"
          title="A build where the security practice caught something"
          id="case-study"
        />
        <CaseStudyBlock slug={study.slug} />
        <div className="sv-rail" style={{ marginTop: 'var(--s16)' }}>
          <div className="sv-rail__aside">
            <p className="u-eyebrow">The technical layer</p>
          </div>
          <div className="sv-rail__body">
            <p className="sv-prose-measure" style={{ margin: 0, color: 'var(--muted-strong)' }}>
              {study.technicalLayer}
            </p>
          </div>
        </div>
      </Section>

      {/* ================= COMPARISON TABLE ================= */}
      <Section theme="dark" grain aria-labelledby="comparison">
        <SectionHead
          eyebrow="Two vendors, or one partner"
          title="What changes when the seam is removed"
          id="comparison"
        />
        <ComparisonTable />
      </Section>

      {/* ================= CLIENTS ================= */}
      <Section theme="deep" tight aria-labelledby="clients">
        <h2 id="clients" className="u-eyebrow" style={{ marginBottom: 'var(--s6)' }}>
          Selected clients
        </h2>
        <ClientStrip />
      </Section>

      {/* ================= RELATED ================= */}
      <Section theme="dark" aria-labelledby="related">
        <SectionHead eyebrow="Related" title="What this overlays" id="related" />
        <RelatedServices service={service} />
      </Section>

      {/* ================= ENGAGEMENT SHAPE ================= */}
      <Section theme="deep" aria-labelledby="engagement">
        <SectionHead eyebrow="Commercials" title="Shape, timeline and scoping" id="engagement" />
        <EngagementShape service={service} />
      </Section>

      {/* ================= THE REST OF THE QUESTIONS ================= */}
      <Section theme="dark" aria-labelledby="faq">
        <SectionHead
          eyebrow="Questions"
          title="The rest of what buyers ask"
          id="faq"
          lede="The conflict-of-interest question is answered in full further up this page."
        />
        <Faq items={remainingFaqs} headingLevel={3} jsonLd={false} />
      </Section>

      {/* ================= CTA: BOOK A SECURE-SDLC ASSESSMENT ================= */}
      <Section theme="light" grain aria-labelledby="enquiry-h2">
        <div className="sv-rail">
          <div className="sv-rail__aside">
            <p className="u-eyebrow">{contactIntro.eyebrow}</p>
            <h2 id="enquiry-h2" className="sv-h2" style={{ marginTop: 'var(--s3)' }}>
              Book a secure-SDLC assessment
            </h2>
            <p className="sv-lede">{contactIntro.lead}</p>
            <p className="sv-note">{site.contact.responseSla}</p>
            <p style={{ marginTop: 'var(--s6)' }}>
              <Button
                href={site.secondaryCta.href}
                variant="secondary"
                iconRight={<ArrowRight size={16} aria-hidden="true" />}
              >
                {site.secondaryCta.label}
              </Button>
            </p>
          </div>
          <div className="sv-rail__body">
            <EnquiryForm returnTo={PATH} interest="devsecops" />
          </div>
        </div>
      </Section>
    </>
  )
}
