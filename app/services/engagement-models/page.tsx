import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Users } from 'lucide-react'
import { servicesBySlug } from '@/lib/services'
import { site } from '@/lib/site'
import { contactIntro } from '@/lib/contact'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Faq } from '@/components/ui/Faq'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { ServicesStyles, SectionHead, Credibility, ServiceBanner } from '../_components/chrome'
import { serviceImage } from '@/lib/service-images'
import {
  CtaBand,
  EngagementShape,
  ExpertBlock,
  PhaseList,
  RelatedServices,
  TickList,
} from '../_components/blocks'
import { EnquiryForm } from '../_components/EnquiryForm'
import { JsonLd, breadcrumbSchema, serviceSchema, serviceMetadata } from '../_components/seo'

/* ========================================================================== *
 * /services/engagement-models
 *
 * This could have used the [slug] template. It does not, because the content
 * makes one commercial point that a generic template flattens: a SECURITY
 * retainer buys reserved capacity against an unpredictable need, and a
 * DELIVERY retainer buys a standing team against a predictable need. Those are
 * opposite propositions sharing a word, and blurring them is a real commercial
 * failure - so they are laid out side by side, each in the palette of its own
 * act, with the mirrored rows that let a buyer read across rather than down.
 *
 * NO PRICES. There is no number in the content layer and none is invented.
 * ========================================================================== */

const PATH = '/services/engagement-models'
const service = servicesBySlug['engagement-models']

const SECURITY_MODEL = service.included.find((m) => m.title === 'Security retainer')
const DELIVERY_MODEL = service.included.find((m) => m.title === 'Embedded team')

const reserveFaq = service.faqs.find(
  (f) => f.q === 'What does an incident retainer actually reserve?',
)
const fixedPriceFaq = service.faqs.find((f) => f.q === 'Do you work fixed price?')

export const metadata: Metadata = serviceMetadata(service, PATH)

/** One side of the retainer contrast, in the palette of its own act. */
function RetainerColumn({
  theme,
  kicker,
  heading,
  icon,
  rows,
  cta,
}: {
  theme: 'theme-dark' | 'theme-light'
  kicker: string
  heading: string
  icon: React.ReactNode
  rows: readonly { term: string; desc: string }[]
  cta: { label: string; href: string }
}) {
  return (
    <div className={`${theme} sv-theme-box`}>
      <div className="sv-contrast__head">
        <span className="sv-contrast__icon">{icon}</span>
        <p className="u-eyebrow" style={{ margin: 0 }}>
          {kicker}
        </p>
      </div>
      <h3 className="sv-h3">{heading}</h3>
      <dl className="sv-contrast__rows" style={{ marginTop: 'var(--s6)' }}>
        {rows.map((row) => (
          <div className="sv-contrast__row" key={row.term}>
            <dt className="sv-contrast__term">{row.term}</dt>
            <dd className="sv-contrast__desc">{row.desc}</dd>
          </div>
        ))}
      </dl>
      <p style={{ marginTop: 'var(--s8)', marginBottom: 0 }}>
        <Button
          href={cta.href}
          variant="secondary"
          iconRight={<ArrowRight size={16} aria-hidden="true" />}
        >
          {cta.label}
        </Button>
      </p>
    </div>
  )
}

export default function EngagementModelsPage() {
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

      {/* ================= HERO ================= */}
      <Section theme="dark" grain offsetNav aria-labelledby="em-h1">
        {/* Two columns, matching the [slug] template. See the note there. */}
        <div className="sv-hero">
          <div className="sv-hero__main">
            <p className="u-eyebrow sv-hero__eyebrow">
              <Link className="u-link" href="/services">
                Services
              </Link>
            </p>
            <h1 id="em-h1" className="sv-h1">
              {service.name}
            </h1>
            <p className="sv-sub">{service.outcome}</p>

            <div className="sv-hero__actions">
              <Button href="#the-contrast" variant="primary" size="lg">
                The two retainers are not the same thing
              </Button>
              <Button href={site.primaryCta.href} variant="secondary" size="lg">
                {site.primaryCta.label}
              </Button>
            </div>

            <ul className="sv-hero__meta">
              <li>{service.timeline}</li>
              <li>{service.engagement}</li>
            </ul>
          </div>

          <div className="sv-hero__aside">
            <ServiceBanner src={serviceImage('engagement-models')} />
            <Credibility figure={service.credibility.figure} context={service.credibility.context} />
          </div>
        </div>
      </Section>

      {/* ================= THE CONTRAST, the point of the page =================
       * Two columns, each in the palette of its own act, with MIRRORED rows so
       * a buyer reads across rather than down. The paragraph above is the
       * written argument; the layout below is the same argument as a shape.
       * ================================================================ */}
      <Section theme="deep" aria-labelledby="the-contrast">
        <SectionHead
          eyebrow="Security retainer vs delivery retainer"
          title="Two things called a retainer"
          id="the-contrast"
          lede={service.intro}
        />

        <div className="sv-contrast">
          {SECURITY_MODEL ? (
            <RetainerColumn
              theme="theme-dark"
              kicker="Cybersecurity"
              heading={SECURITY_MODEL.title}
              icon={<ShieldCheck size={20} strokeWidth={1.75} aria-hidden="true" />}
              rows={[
                { term: 'What it is', desc: SECURITY_MODEL.body },
                ...(reserveFaq ? [{ term: reserveFaq.q, desc: reserveFaq.a }] : []),
              ]}
              cta={{
                label: `See ${servicesBySlug['incident-response'].name}`,
                href: '/services/incident-response',
              }}
            />
          ) : null}

          {DELIVERY_MODEL ? (
            <RetainerColumn
              theme="theme-light"
              kicker="Software Development"
              heading={DELIVERY_MODEL.title}
              icon={<Users size={20} strokeWidth={1.75} aria-hidden="true" />}
              rows={[
                { term: 'What it is', desc: DELIVERY_MODEL.body },
                ...(fixedPriceFaq ? [{ term: fixedPriceFaq.q, desc: fixedPriceFaq.a }] : []),
              ]}
              cta={{
                label: `See ${servicesBySlug['custom-software'].name}`,
                href: '/services/custom-software',
              }}
            />
          ) : null}
        </div>
      </Section>

      {/* ================= ALL FOUR MODELS ================= */}
      <Section theme="dark" aria-labelledby="models">
        <SectionHead
          eyebrow="The four shapes"
          title="What you can actually buy"
          id="models"
          lede={service.cardLine}
        />
        <RevealGroup as="ul" className="sv-grid sv-grid--2">
          {service.included.map((model) => (
            <Reveal as="li" key={model.title}>
              <Card padding="lg" className="sv-card">
                <h3 className="sv-h3">{model.title}</h3>
                <p className="sv-card__line">{model.body}</p>
              </Card>
            </Reveal>
          ))}
        </RevealGroup>
        {/* `engagement` is a sentence; Badge is a nowrap label primitive. */}
        <p className="sv-note" style={{ marginTop: 'var(--s8)' }}>
          {service.engagement}
        </p>
      </Section>

      {/* ================= FROM FIRST CALL TO MOBILISED ================= */}
      <Section theme="deep" aria-labelledby="process">
        <SectionHead
          eyebrow="From first call to mobilised"
          title="How an engagement starts"
          id="process"
          lede={service.timeline}
        />
        <PhaseList phases={service.phases} />
      </Section>

      {/* ================= WHAT YOU GET / WHAT CHANGES ================= */}
      <Section theme="dark" aria-labelledby="deliverables">
        <div className="sv-rail">
          <div className="sv-rail__aside">
            <div className="sv-head__rule" aria-hidden="true" style={{ marginBottom: 'var(--s6)' }} />
            <p className="u-eyebrow">Deliverables</p>
            <h2 id="deliverables" className="sv-h2" style={{ marginTop: 'var(--s3)' }}>
              Every proposal carries these
            </h2>
          </div>
          <div className="sv-rail__body">
            <TickList items={service.deliverables} ariaLabel="Deliverables" />
            <p className="u-eyebrow" style={{ marginTop: 'var(--s12)', marginBottom: 'var(--s4)' }}>
              Outcomes
            </p>
            <TickList items={service.outcomes} ariaLabel="Outcomes" />
          </div>
        </div>
      </Section>

      {/* ================= WHO YOU TALK TO ================= */}
      <Section theme="deep" aria-labelledby="who">
        <SectionHead
          eyebrow="Who you talk to"
          title="The commercial conversation"
          id="who"
          lede={service.teamShape}
        />
        <ExpertBlock slug={service.expert} />
      </Section>

      {/* ================= RELATED ================= */}
      <Section theme="dark" aria-labelledby="related">
        <SectionHead eyebrow="Related" title="Where each model applies" id="related" />
        <RelatedServices service={service} />
      </Section>

      {/* ================= ENGAGEMENT SHAPE ================= */}
      <Section theme="deep" tight aria-labelledby="engagement">
        <SectionHead eyebrow="Commercials" title="Shape, timeline and scoping" id="engagement" />
        <EngagementShape service={service} />
      </Section>

      {/* ================= FAQ ================= */}
      <Section theme="dark" aria-labelledby="faq">
        <SectionHead eyebrow="Questions" title="Frequently asked" id="faq" />
        <Faq items={service.faqs} headingLevel={3} />
      </Section>

      {/* ================= INLINE FORM ================= */}
      <Section theme="deep" grain aria-labelledby="enquiry-h2">
        <div className="sv-rail">
          <div className="sv-rail__aside">
            <p className="u-eyebrow">{contactIntro.eyebrow}</p>
            <h2 id="enquiry-h2" className="sv-h2" style={{ marginTop: 'var(--s3)' }}>
              {contactIntro.heading}
            </h2>
            <p className="sv-lede">{contactIntro.lead}</p>
            <p className="sv-note">{site.contact.responseSla}</p>
          </div>
          <div className="sv-rail__body">
            <EnquiryForm returnTo={PATH} interest="not-sure" />
          </div>
        </div>
      </Section>

      <Section theme="dark" tight>
        <CtaBand
          heading={service.outcome}
          body={service.engagement}
          secondary={site.secondaryCta}
        />
      </Section>
    </>
  )
}
