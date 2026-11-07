/**
 * The repeated blocks of a service page.
 *
 * Each one is a Server Component that takes data from `lib/**` and renders it.
 * None of them author copy: every sentence on screen comes from the content
 * layer. The only strings declared here are structural labels - "Deliverables",
 * "Timeline" - which are interface, not marketing.
 */

import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Phone,
  Quote as QuoteIcon,
  ShieldCheck,
} from 'lucide-react'
import type { Service, Phase } from '@/lib/services'
import { servicesBySlug, pillars } from '@/lib/services'
import { peopleBySlug } from '@/lib/people'
import { caseStudiesBySlug } from '@/lib/case-studies'
import { certifications, clients, reviewBadges } from '@/lib/proof'
import { serviceTopicsByParent } from '@/lib/resources'
import { resources } from '@/lib/resources'
import { site } from '@/lib/site'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardLink } from '@/components/ui/Card'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Marquee } from '@/components/ui/Marquee'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { SectionHead, LinkList } from './chrome'

/* ========================================================================== *
 * WHAT'S INCLUDED
 * ========================================================================== */

export function IncludedGrid({ items }: { items: Service['included'] }) {
  return (
    <RevealGroup as="ul" className="sv-grid sv-grid--3">
      {items.map((item) => (
        <Reveal as="li" key={item.title}>
          <Card padding="lg" className="sv-card">
            <h3 className="sv-h3">{item.title}</h3>
            <p className="sv-card__line">{item.body}</p>
          </Card>
        </Reveal>
      ))}
    </RevealGroup>
  )
}

/* ========================================================================== *
 * NUMBERED METHODOLOGY
 * ========================================================================== */

export function PhaseList({ phases }: { phases: readonly Phase[] }) {
  return (
    <RevealGroup as="ol" className="sv-phases">
      {phases.map((phase) => (
        <Reveal as="li" key={phase.n} className="sv-phase">
          <p className="sv-phase__n u-mono" aria-hidden="true">
            {String(phase.n).padStart(2, '0')}
          </p>
          <div>
            <h3 className="sv-phase__name">
              <span className="sv-sr">{`Phase ${phase.n}: `}</span>
              {phase.name}
            </h3>
            {phase.days ? <span className="sv-phase__when">{phase.days}</span> : null}
          </div>
          <p className="sv-phase__body">{phase.body}</p>
        </Reveal>
      ))}
    </RevealGroup>
  )
}

/**
 * The published methodology link.
 *
 * REPORTED GAP: there is no PDF in `public/`, and `lib/resources.ts` carries
 * every methodology as `pending: true`. Claiming a download that 404s is worse
 * than not offering one, so this links to the published methodology page that
 * the resources routes own, and says plainly what it is. When the artefact
 * exists, point `href` at it and change the label; nothing else moves.
 */
export function MethodologyLink({ slug }: { slug: string }) {
  const methodology = resources.find(
    (resource) => resource.type === 'methodology' && resource.services.includes(slug),
  )
  const href = methodology ? `/methodologies/${methodology.slug}` : '/methodologies'
  const label = methodology ? methodology.title : 'How we run an engagement'

  return (
    <p className="sv-note" style={{ marginTop: 'var(--s8)' }}>
      <Button href={href} variant="secondary" size="md" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
        {`Read the methodology, ${label}`}
      </Button>
    </p>
  )
}

/* ========================================================================== *
 * DELIVERABLES / OUTCOMES
 * ========================================================================== */

export function TickList({ items, ariaLabel }: { items: readonly string[]; ariaLabel: string }) {
  return (
    <RevealGroup as="ul" className="sv-ticks" aria-label={ariaLabel}>
      {items.map((item) => (
        <Reveal as="li" key={item}>
          <Check className="sv-ticks__mark" size={16} strokeWidth={2} aria-hidden="true" />
          <span>{item}</span>
        </Reveal>
      ))}
    </RevealGroup>
  )
}

/* ========================================================================== *
 * CHIPS - frameworks and stack
 * ========================================================================== */

export function Chips({ items, ariaLabel }: { items: readonly string[]; ariaLabel: string }) {
  return (
    <ul className="sv-chips" aria-label={ariaLabel}>
      {items.map((item) => (
        <li key={item}>
          <Badge variant="neutral" size="md">
            {item}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

/* ========================================================================== *
 * ACCREDITATION STRIP - with text labels, never bare marks
 * ========================================================================== */

export function AccreditationStrip({ relevance }: { relevance: 'security' | 'software' }) {
  const items = certifications.filter((c) => c.relevance === relevance || c.relevance === 'both')

  return (
    <>
      <ul className="sv-accred">
        {items.map((item) => (
          <li key={item.slug} className="sv-accred__item">
            <BadgeCheck className="sv-accred__icon" size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>
              <span className="sv-accred__label">{item.label}</span>
              <span className="sv-accred__issuer">
                {item.certificateNumber
                  ? `${item.issuer} · ${item.certificateNumber}`
                  : item.issuer}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="sv-note">
        <Link className="u-link" href="/certifications">
          Every certificate number and expiry date is published
        </Link>
        {' · '}
        <Link className="u-link" href="/trust">
          Our own security posture
        </Link>
      </p>
    </>
  )
}

/* ========================================================================== *
 * THIRD-PARTY REVIEW BADGES - software pillar
 * ========================================================================== */

export function ReviewBadges({ pillar }: { pillar: 'security' | 'software' }) {
  const badges = reviewBadges.filter((badge) => badge.pillar === pillar)
  if (badges.length === 0) return null

  return (
    <ul className="sv-accred" aria-label="Third-party reviews">
      {badges.map((badge) => (
        <li key={badge.source} className="sv-accred__item">
          <ShieldCheck className="sv-accred__icon" size={20} strokeWidth={1.75} aria-hidden="true" />
          <span>
            <span className="sv-accred__label">{badge.label}</span>
            <span className="sv-accred__issuer">
              <a
                className="u-link"
                href={badge.href}
                rel="noopener noreferrer nofollow"
                target="_blank"
              >
                {`Read the reviews on ${badge.source}`}
              </a>
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ========================================================================== *
 * CLIENT STRIP - labelled, never a bare logo wall
 * ========================================================================== */

export function ClientStrip() {
  return (
    <Marquee
      ariaLabel="Selected clients"
      duration="52s"
      items={clients.map((client) => ({ label: client.label, meta: client.industry }))}
    />
  )
}

/* ========================================================================== *
 * NAMED EXPERT - the block that turns a service into a person
 * ========================================================================== */

export function ExpertBlock({ slug }: { slug: string }) {
  const person = peopleBySlug[slug]
  if (!person) return null

  return (
    <div className="sv-expert">
      <AvatarPlaceholder name={person.name} size={96} />
      <div>
        <h3 className="sv-expert__name">{person.name}</h3>
        <p className="sv-expert__role">{person.role}</p>
        <p className="sv-expert__bio">{person.bio}</p>

        {person.certifications && person.certifications.length > 0 ? (
          <>
            <p className="u-eyebrow sv-expert__certs-label" id={`certs-${person.slug}`}>
              Certifications
            </p>
            <ul className="sv-chips" aria-labelledby={`certs-${person.slug}`}>
              {person.certifications.map((cert) => (
                <li key={cert}>
                  <Badge variant="brand" size="md">
                    {cert}
                  </Badge>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <p className="sv-note">
          <Link className="u-link" href={`/about/leadership/${person.slug}`}>
            {`More about ${person.name}`}
          </Link>
        </p>
      </div>
    </div>
  )
}

/* ========================================================================== *
 * CASE STUDY - a metric and a client quote
 * ========================================================================== */

export function CaseStudyBlock({ slug }: { slug: string }) {
  const study = caseStudiesBySlug[slug]
  if (!study) return null

  const who = study.client ?? study.anonymisedAs ?? study.industry

  return (
    <div className="sv-rail">
      <div className="sv-rail__aside">
        <p className="u-eyebrow">{who}</p>
        <p className="sv-h3" style={{ marginTop: 'var(--s4)' }}>
          {study.headline}
        </p>
        <ul className="sv-hero__meta" style={{ marginTop: 'var(--s6)' }}>
          <li>{study.industry}</li>
          <li>{study.engagementType}</li>
          <li>{study.engagementLength}</li>
          {study.nda ? (
            <li>
              <Badge variant="neutral">Under NDA</Badge>
            </li>
          ) : null}
        </ul>
        <p style={{ marginTop: 'var(--s6)' }}>
          <Button
            href={`/case-studies/${study.slug}`}
            variant="secondary"
            iconRight={<ArrowRight size={16} aria-hidden="true" />}
          >
            Read the case study
          </Button>
        </p>
      </div>

      <div className="sv-rail__body">
        <ul className="sv-metrics">
          {study.metrics.map((metric) => (
            <li key={metric.label}>
              <strong className="sv-metric__value u-tnum">{metric.value}</strong>
              <span className="sv-metric__label">{metric.label}</span>
              {metric.note ? <span className="sv-metric__note">{metric.note}</span> : null}
            </li>
          ))}
        </ul>

        <figure className="sv-quote" style={{ marginTop: 'var(--s12)' }}>
          <QuoteIcon className="sv-quote__mark" size={24} strokeWidth={1.5} aria-hidden="true" />
          <blockquote className="sv-quote__text">
            <p style={{ margin: 0 }}>{study.quote.text}</p>
          </blockquote>
          <figcaption className="sv-quote__by">
            {`${study.quote.role}, ${study.quote.company}`}
          </figcaption>
        </figure>
      </div>
    </div>
  )
}

/* ========================================================================== *
 * RELATED SERVICES - the cross-pillar link is called out, not hidden
 * ========================================================================== */

export function RelatedServices({ service }: { service: Service }) {
  const related = service.related
    .map((slug) => servicesBySlug[slug])
    .filter((item): item is Service => Boolean(item))

  const otherPillarName =
    service.pillar === 'security' ? pillars.software.name : pillars.security.name
  const otherPillarHref =
    service.pillar === 'security'
      ? `/services/${pillars.software.slug}`
      : `/services/${pillars.security.slug}`

  return (
    <>
      <RevealGroup as="ul" className="sv-grid sv-grid--2">
        {related.map((item) => {
          const Icon = item.icon
          const crossPillar = item.pillar !== service.pillar
          return (
            <Reveal as="li" key={item.slug}>
              <Card padding="lg" className="sv-card">
                <div className="sv-card__top">
                  <Icon className="sv-card__icon" size={20} strokeWidth={1.75} aria-hidden="true" />
                  <h3 className="sv-card__name">
                    <CardLink href={`/services/${item.slug}`}>{item.name}</CardLink>
                  </h3>
                </div>
                <p className="sv-card__line">{item.cardLine}</p>
                {crossPillar ? (
                  <p style={{ margin: 0 }}>
                    {/* Label length, not sentence length, Badge is nowrap. */}
                    <Badge variant="brand" size="md">
                      {item.pillar === 'join'
                        ? servicesBySlug['devsecops'].name
                        : item.pillar === 'security'
                          ? pillars.security.name
                          : pillars.software.name}
                    </Badge>
                  </p>
                ) : null}
              </Card>
            </Reveal>
          )
        })}
      </RevealGroup>

      <p className="sv-note" style={{ marginTop: 'var(--s8)' }}>
        <Link className="u-link" href={otherPillarHref}>
          {`See everything under ${otherPillarName}`}
        </Link>
      </p>
    </>
  )
}

/* ========================================================================== *
 * TOPIC CLUSTER - the child explainers
 * ========================================================================== */

export function TopicCluster({ slug }: { slug: string }) {
  const topics = serviceTopicsByParent[slug]
  if (!topics || topics.length === 0) return null

  return (
    <LinkList
      ariaLabel="Questions buyers ask about this service"
      items={topics.map((topic) => ({
        href: `/services/${slug}/${topic.slug}`,
        label: topic.title,
        blurb: topic.question,
      }))}
    />
  )
}

/* ========================================================================== *
 * ENGAGEMENT SHAPE - timeline, team, commercial
 * ========================================================================== */

export function EngagementShape({ service }: { service: Service }) {
  return (
    <dl className="sv-defs">
      <div className="sv-def">
        <dt className="sv-def__term">Timeline</dt>
        <dd className="sv-def__desc">{service.timeline}</dd>
      </div>
      <div className="sv-def">
        <dt className="sv-def__term">Team shape</dt>
        <dd className="sv-def__desc">{service.teamShape}</dd>
      </div>
      <div className="sv-def">
        <dt className="sv-def__term">Engagement</dt>
        <dd className="sv-def__desc">{service.engagement}</dd>
      </div>
      <div className="sv-def">
        <dt className="sv-def__term">Scoping</dt>
        <dd className="sv-def__desc">
          {site.contact.responseSla}{' '}
          <Link className="u-link" href="/services/engagement-models">
            How the four engagement models differ
          </Link>
          .
        </dd>
      </div>
    </dl>
  )
}

/* ========================================================================== *
 * CLOSING CTA BAND
 * ========================================================================== */

export function CtaBand({
  heading,
  body,
  primaryLabel = site.primaryCta.label,
  primaryHref = site.primaryCta.href,
  secondary,
}: {
  heading: string
  body: string
  primaryLabel?: string
  primaryHref?: string
  secondary?: { label: string; href: string }
}) {
  return (
    <div className="sv-cta-band">
      <div>
        <h2 className="sv-h2">{heading}</h2>
        <p className="sv-lede">{body}</p>
      </div>
      <div className="sv-cta-band__actions">
        <Button href={primaryHref} variant="primary" size="lg">
          {primaryLabel}
        </Button>
        {secondary ? (
          <Button href={secondary.href} variant="secondary" size="lg">
            {secondary.label}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

/* ========================================================================== *
 * IR HOTLINE - body copy only on /services/incident-response
 * ========================================================================== */

export function HotlineBlock() {
  return (
    <div className="sv-hotline">
      <p className="u-eyebrow">Active incident, right now</p>
      <a className="sv-hotline__num" href={site.contact.irHotlineHref} data-ir-hotline="body">
        <Phone size={20} strokeWidth={1.75} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-3px', marginRight: 'var(--s2)' }} />
        {site.contact.irHotline}
      </a>
      <p className="sv-def__desc" style={{ margin: 0 }}>
        {site.contact.irHotlineCommitment}
      </p>
    </div>
  )
}

export { SectionHead }
