/**
 * The pillar hub, rendered twice: /services/cybersecurity (theme-dark, the
 * security act) and /services/software-development (theme-light, the software
 * craft act). The theme is declared by `pillars.*.theme` rather than chosen
 * here, so the act structure cannot drift from the data.
 *
 * The CROSS-PILLAR band deliberately flips to the other pillar's palette. That
 * is the one place on each hub where the other act shows through, which is
 * exactly what the link is for.
 */

import Link from 'next/link'
import { ArrowRight, Check, GitBranch } from 'lucide-react'
import { pillars, servicesBySlug, type Service } from '@/lib/services'
import { site, headlineStats } from '@/lib/site'
import { contactIntro } from '@/lib/contact'
import { Section, type SectionTheme } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Card, CardLink } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatBar } from '@/components/ui/StatBar'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { ServicesStyles, SectionHead, ServiceBanner } from './chrome'
import { serviceImage } from '@/lib/service-images'
import { AccreditationStrip, ReviewBadges, ClientStrip, CtaBand } from './blocks'
import { JsonLd, breadcrumbSchema, collectionSchema } from './seo'

/** `pillars.*.theme` is a class name; <Section> wants the bare token. */
function themeToken(theme: 'theme-dark' | 'theme-light'): SectionTheme {
  return theme === 'theme-light' ? 'light' : 'dark'
}

export type PillarKey = 'security' | 'software'

export function PillarHub({ pillar }: { pillar: PillarKey }) {
  const data = pillars[pillar]
  const other = pillars[pillar === 'security' ? 'software' : 'security']
  const theme = themeToken(data.theme)
  const otherTheme = themeToken(other.theme)
  const secureSdlc = servicesBySlug['devsecops']
  const path = `/services/${data.slug}`

  return (
    <>
      <ServicesStyles />
      <JsonLd
        data={collectionSchema({
          name: data.name,
          description: data.line,
          path,
          items: data.services,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: site.name, path: '/' },
          { name: 'Services', path: '/services' },
          { name: data.name, path },
        ])}
      />

      {/* ---------------- HERO ---------------- */}
      <Section theme={theme} grain offsetNav aria-labelledby="pillar-h1">
        {/* Two columns, matching the [slug] template. This hero has no
            credibility stat to put in the aside, so the banner carries the
            column on its own. */}
        <div className="sv-hero">
          <div className="sv-hero__main">
            <p className="u-eyebrow sv-hero__eyebrow">
              <Link className="u-link" href="/services">
                Services
              </Link>
            </p>
            <h1 id="pillar-h1" className="sv-h1">
              {data.name}
            </h1>
            <p className="sv-sub">{data.line}</p>
            <p className="sv-lede">{data.body}</p>

            <div className="sv-hero__actions">
              <Button href={site.primaryCta.href} variant="primary" size="lg">
                {site.primaryCta.label}
              </Button>
              <Button href={`/services/${secureSdlc.slug}`} variant="secondary" size="lg">
                {secureSdlc.name}
              </Button>
            </div>

            <ul className="sv-hero__meta">
              <li>{`${data.services.length} services`}</li>
              <li>{site.contact.responseSla}</li>
            </ul>
          </div>

          <div className="sv-hero__aside">
            <ServiceBanner src={serviceImage(data.slug)} />
          </div>
        </div>
      </Section>

      {/* ---------------- THE SERVICES ---------------- */}
      <Section theme={theme} aria-labelledby="pillar-services">
        <SectionHead
          eyebrow="What you can buy"
          title={`${data.name} services`}
          id="pillar-services"
          lede={data.line}
        />
        <RevealGroup as="ul" className="sv-grid sv-grid--3">
          {data.services.map((service: Service) => {
            const Icon = service.icon
            return (
              <Reveal as="li" key={service.slug}>
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
              </Reveal>
            )
          })}
        </RevealGroup>
      </Section>

      {/* ---------------- THE JOIN ---------------- */}
      <Section theme="deep" aria-labelledby="pillar-join">
        <SectionHead
          eyebrow="Where this pillar meets the other one"
          title={secureSdlc.name}
          id="pillar-join"
          lede={secureSdlc.outcome}
        />
        <div className="sv-rail">
          <div className="sv-rail__aside">
            <GitBranch size={24} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--accent)' }} />
            <p className="sv-lede" style={{ marginTop: 'var(--s4)' }}>
              {secureSdlc.cardLine}
            </p>
            <p style={{ marginTop: 'var(--s6)' }}>
              <Badge variant="brand" size="md">
                {secureSdlc.credibility.figure}
              </Badge>
            </p>
          </div>
          <div className="sv-rail__body">
            <p className="sv-prose-measure" style={{ margin: 0, color: 'var(--muted-strong)' }}>
              {secureSdlc.intro}
            </p>
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
        </div>
      </Section>

      {/* ---------------- ACCREDITATION ---------------- */}
      <Section theme={theme} tight aria-labelledby="pillar-accred">
        <SectionHead
          eyebrow="Accreditation"
          title="Certifications"
          id="pillar-accred"
        />
        <AccreditationStrip relevance={pillar} />
        {pillar === 'software' ? (
          <div style={{ marginTop: 'var(--s12)' }}>
            <p className="u-eyebrow" style={{ marginBottom: 'var(--s4)' }}>
              Third-party reviews
            </p>
            <ReviewBadges pillar="software" />
          </div>
        ) : null}
      </Section>

      {/* ---------------- PROOF ---------------- */}
      <Section theme={theme} tight aria-labelledby="pillar-proof">
        <SectionHead eyebrow="Capacity" title="Envenox at a glance" id="pillar-proof" />
        <StatBar stats={headlineStats} ariaLabel="Envenox at a glance" columns={4} />
        <div style={{ marginTop: 'var(--s16)' }}>
          <p className="u-eyebrow" style={{ marginBottom: 'var(--s6)' }}>
            Selected clients
          </p>
          <ClientStrip />
        </div>
      </Section>

      {/* ---------------- CROSS-PILLAR: the other act's palette ---------------- */}
      <Section theme={otherTheme} grain aria-labelledby="pillar-cross">
        <SectionHead
          eyebrow="The other pillar"
          title={other.name}
          id="pillar-cross"
          lede={other.line}
        />
        <p className="sv-prose-measure" style={{ color: 'var(--muted-strong)' }}>
          {other.body}
        </p>
        <div className="sv-hero__actions">
          <Button
            href={`/services/${other.slug}`}
            variant="primary"
            size="lg"
            iconRight={<ArrowRight size={16} aria-hidden="true" />}
          >
            {`See ${other.name}`}
          </Button>
        </div>
      </Section>

      {/* ---------------- CLOSING CTA ---------------- */}
      <Section theme={theme} tight>
        <CtaBand
          heading={contactIntro.heading}
          body={contactIntro.lead}
          secondary={site.secondaryCta}
        />
      </Section>
    </>
  )
}

export default PillarHub
