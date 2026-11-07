import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight, Lock, Star } from 'lucide-react'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { StatBar } from '@/components/ui/StatBar'
import { caseStudies } from '@/lib/case-studies'
import { clients, reviewBadges, testimonials } from '@/lib/proof'
import type { ClientTier } from '@/lib/proof'
import { headlineStats, site } from '@/lib/site'
import { NamedContactsCta, ProofStyles } from '../case-studies/_components/proof'

/**
 * `/customers` - deliberately NOT the case study index.
 *
 *   /case-studies  the story index: filterable, one page per engagement
 *   /customers     who they are, tiered by what each has agreed to, what they
 *                  said, and what third parties scored us
 *
 * The tiering is the honest part. A client who will not be named is still
 * proof, which is why the anonymised tier is listed with its real engagement
 * behind it rather than quietly dropped - and why the named-and-quotable tier
 * shows a count of zero rather than being hidden while it is empty.
 *
 * Every mark on this page carries its `label` as readable text. All `logo`
 * fields in lib/proof.ts are currently null, so the text IS the mark.
 */

export const metadata: Metadata = {
  title: 'Customers',
  description:
    'Who we work with, tiered by what each client has agreed to be: named and quotable, logo only, or anonymised under NDA. With what they said and what third-party reviewers scored.',
  alternates: { canonical: '/customers' },
  openGraph: {
    type: 'website',
    title: `Customers · ${site.name}`,
    description: 'Who we work with, and what they say.',
    url: `${site.url}/customers`,
  },
}

const TIERS: { tier: ClientTier; label: string; permits: string }[] = [
  { tier: 'named-quotable', label: 'Named and quotable', permits: 'Name, sector and an attributed quote.' },
  { tier: 'logo-only', label: 'Logo permission only', permits: 'Name and sector. No attributed quote.' },
  { tier: 'anonymised', label: 'Anonymised, under NDA', permits: 'Neither name nor mark. The work is published; the client is not.' },
]

const CSS = `
.cu-lead { margin: var(--s6) 0 0; color: var(--muted-strong); max-width: 56ch; }

/* ---------------- permission tiers ---------------- */
.tiers { display: grid; gap: var(--s6); list-style: none; margin: var(--s12) 0 0; padding: 0; }
@media (min-width: 768px) { .tiers { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s8); } }
.tier { display: flex; flex-direction: column; gap: var(--s2); border-top: 1px solid var(--border-strong); padding-top: var(--s4); min-width: 0; }
.tier__count {
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
}
.tier__label { margin: 0; font-size: var(--text-sm); font-weight: 500; color: var(--fg); }
.tier__permits { margin: 0; font-size: var(--text-xs); line-height: 1.55; color: var(--muted); max-width: 34ch; }

/* ---------------- the wall ---------------- */
.wall { display: grid; gap: var(--s4); list-style: none; margin: var(--s8) 0 0; padding: 0; }
@media (min-width: 560px) { .wall { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 900px) { .wall { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (min-width: 1200px) { .wall { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
.wall__cell {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--s4);
  min-height: 108px;
  min-width: 0;
}
.wall__name {
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-base);
  font-weight: 500;
  line-height: 1.2;
  color: var(--fg);
  overflow-wrap: break-word;
}
.wall__meta { margin: 0; font-size: var(--text-xs); color: var(--muted); }

/* ---------------- anonymised tier ---------------- */
.anon { list-style: none; margin: var(--s8) 0 0; padding: 0; border-top: 1px solid var(--border); }
.anon > li { border-bottom: 1px solid var(--border); }
.anon__row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--s2) var(--s4);
  padding: var(--s4) 0;
  color: inherit;
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-out);
}
.anon__row:hover { color: var(--accent); }
.anon__name { font-size: var(--text-base); font-weight: 500; color: inherit; }
.anon__meta { font-size: var(--text-xs); color: var(--muted); margin-left: auto; display: inline-flex; align-items: center; gap: var(--s2); }

/* ---------------- quotes ---------------- */
.quotes { display: grid; gap: var(--s6); list-style: none; margin: var(--s6) 0 0; padding: 0; }
@media (min-width: 900px) { .quotes { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.quote-card { display: flex; flex-direction: column; gap: var(--s4); height: 100%; }
.quote-card__text { margin: 0; color: var(--fg); font-size: var(--text-lg); line-height: var(--leading-snug); }
.quote-card__who { display: flex; align-items: center; gap: var(--s3); margin-top: auto; }
.quote-card__name { margin: 0; font-size: var(--text-sm); font-weight: 500; color: var(--fg); }
.quote-card__org { margin: 0; font-size: var(--text-xs); color: var(--muted); }
.pillar-head { margin: var(--s16) 0 0; }
.pillar-head:first-of-type { margin-top: 0; }

/* ---------------- review badges ---------------- */
.reviews { display: grid; gap: var(--s4); list-style: none; margin: var(--s6) 0 0; padding: 0; }
@media (min-width: 768px) { .reviews { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.review { display: flex; flex-direction: column; gap: var(--s2); }
.review__score {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
}
.review__star { color: var(--accent); flex: none; }
.review__label { margin: 0; font-size: var(--text-sm); color: var(--muted-strong); }
.review__link { display: inline-flex; align-items: center; gap: var(--s1); font-size: var(--text-xs); color: var(--muted); text-decoration: none; transition: color var(--dur-micro) var(--ease-out); }
.review__link:hover { color: var(--fg); }
.cu-stats { margin-top: var(--s16); }
`

export default function CustomersPage() {
  const anonymised = caseStudies.filter((study) => study.client === null && study.anonymisedAs)

  const counts: Record<ClientTier, number> = {
    'named-quotable': clients.filter((c) => c.tier === 'named-quotable').length,
    'logo-only': clients.filter((c) => c.tier === 'logo-only').length,
    anonymised: anonymised.length,
  }

  const logoOnly = clients.filter((c) => c.tier === 'logo-only')
  const namedQuotable = clients.filter((c) => c.tier === 'named-quotable')

  const byPillar = [
    { pillar: 'security' as const, label: 'On the security side' },
    { pillar: 'software' as const, label: 'On the software side' },
    { pillar: 'both' as const, label: 'On both' },
  ]

  return (
    <>
      <style href="envenox-customers" precedence="default">
        {CSS}
      </style>
      <ProofStyles />

      {/* ---------- hero + the permission model ---------- */}
      <Section theme="dark" grain offsetNav aria-labelledby="cu-title">
        <p className="u-eyebrow">Customers</p>
        <h1 id="cu-title" style={{ fontSize: 'var(--text-3xl)', margin: 'var(--s3) 0 0', maxWidth: '18ch' }}>
          Who we work with, and what they say
        </h1>
        <p className="cu-lead">
          Each client below appears at the permission level they agreed to, and no higher. The engagements
          themselves are on{' '}
          <Link href="/case-studies" className="u-link">
            the case studies index
          </Link>
          .
        </p>

        <ul className="tiers" aria-label="Client permission tiers">
          {TIERS.map((tier) => (
            <li className="tier" key={tier.tier}>
              <p className="tier__count u-tnum">{counts[tier.tier]}</p>
              <p className="tier__label">{tier.label}</p>
              <p className="tier__permits">{tier.permits}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- the wall, plus the anonymised tier ---------- */}
      <Section theme="deep" aria-labelledby="cu-wall">
        <h2 id="cu-wall" style={{ fontSize: 'var(--text-2xl)', margin: 0 }}>
          The wall
        </h2>

        {namedQuotable.length > 0 ? (
          <>
            <h3 className="u-eyebrow" style={{ marginTop: 'var(--s8)' }}>
              Named and quotable
            </h3>
            <RevealGroup as="ul" className="wall">
              {namedQuotable.map((client) => (
                <Reveal as="li" key={client.name}>
                  <Card padding="md" className="wall__cell">
                    <p className="wall__name">{client.label}</p>
                    <p className="wall__meta u-mono">{client.industry}</p>
                  </Card>
                </Reveal>
              ))}
            </RevealGroup>
          </>
        ) : null}

        <h3 className="u-eyebrow" style={{ marginTop: 'var(--s12)' }}>
          Logo permission only, {counts['logo-only']} clients
        </h3>
        <RevealGroup as="ul" className="wall">
          {logoOnly.map((client) => (
            <Reveal as="li" key={client.name}>
              <Card padding="md" className="wall__cell">
                <p className="wall__name">{client.label}</p>
                <p className="wall__meta u-mono">{client.industry}</p>
              </Card>
            </Reveal>
          ))}
        </RevealGroup>

        <h3 className="u-eyebrow" style={{ marginTop: 'var(--s16)' }}>
          Anonymised, under NDA, {counts.anonymised} engagements
        </h3>
        <ul className="anon" aria-label="Anonymised clients, with the published engagement">
          {anonymised.map((study) => (
            <li key={study.slug}>
              <Link href={`/case-studies/${study.slug}`} className="anon__row">
                <span className="anon__name">{study.anonymisedAs}</span>
                <Badge variant="brand">
                  <Lock size={11} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
                  Under NDA
                </Badge>
                <span className="anon__meta u-mono">
                  {study.industry} · {study.country}
                  <ArrowUpRight size={13} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- what they said ---------- */}
      <Section theme="light" aria-labelledby="cu-quotes">
        <h2 id="cu-quotes" style={{ fontSize: 'var(--text-2xl)', margin: 0 }}>
          What they said
        </h2>

        {byPillar.map((group) => {
          const items = testimonials.filter((t) => t.pillar === group.pillar)
          if (items.length === 0) return null
          return (
            <div key={group.pillar}>
              <h3 className="u-eyebrow pillar-head">{group.label}</h3>
              <RevealGroup as="ul" className="quotes">
                {items.map((t) => (
                  <Reveal as="li" key={t.name + t.company}>
                    <Card padding="lg" className="quote-card">
                      <blockquote className="quote-card__text">{t.text}</blockquote>
                      <div className="quote-card__who">
                        <AvatarPlaceholder name={t.name} size={44} />
                        <div>
                          <p className="quote-card__name">{t.name}</p>
                          <p className="quote-card__org">{t.company}</p>
                        </div>
                      </div>
                    </Card>
                  </Reveal>
                ))}
              </RevealGroup>
            </div>
          )
        })}
      </Section>

      {/* ---------- third-party reviews, split by pillar ---------- */}
      <Section theme="dark" aria-labelledby="cu-reviews">
        <h2 id="cu-reviews" style={{ fontSize: 'var(--text-2xl)', margin: 0 }}>
          Third-party reviews
        </h2>

        {(['software', 'security'] as const).map((pillar) => {
          const badges = reviewBadges.filter((badge) => badge.pillar === pillar)
          if (badges.length === 0) return null
          return (
            <div key={pillar}>
              <h3 className="u-eyebrow pillar-head">
                {pillar === 'software' ? 'Read on the software side' : 'Read on the security side'}
              </h3>
              <ul className="reviews">
                {badges.map((badge) => (
                  <li key={badge.source}>
                    <Card padding="lg" className="review">
                      <span className="review__score u-tnum">
                        <Star className="review__star" size={18} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                        {badge.score}
                      </span>
                      <p className="review__label">{badge.label}</p>
                      <a className="review__link" href={badge.href} rel="noopener noreferrer nofollow" target="_blank">
                        {badge.source}
                        <ArrowUpRight size={12} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                      </a>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        <div className="cu-stats">
          <StatBar stats={headlineStats} ariaLabel="Envenox at a glance" columns={4} size="md" />
        </div>
      </Section>

      {/* ---------- CTA ---------- */}
      <Section theme="light" aria-labelledby="cu-cta">
        <NamedContactsCta id="cu-cta">
          <Button
            href="/case-studies"
            variant="secondary"
            size="lg"
            iconRight={<ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />}
          >
            {site.secondaryCta.label}
          </Button>
        </NamedContactsCta>
      </Section>
    </>
  )
}
