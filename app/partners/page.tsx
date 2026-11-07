// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { initialsFromName } from '@/components/ui/AvatarPlaceholder'
import { site } from '@/lib/site'
import { contactIntro } from '@/lib/contact'
import { partners } from '@/lib/proof'
import styles from './partners.module.css'

/**
 * /partners.
 *
 * A static list, not a marquee. A partner tier is a fact a buyer evaluates -
 * "Advanced Tier Services Partner" and "Partner" are different claims about
 * what the vendor has audited - and a tier that scrolls past at reading speed
 * is a logo wall with extra steps. Every mark therefore sits beside its name
 * AND its tier, both as selectable text.
 *
 * `logo` is null on every record, so the mark slot renders a monogram tile
 * rather than a borrowed trademark. It is deliberately obviously a
 * placeholder, for the same reason the leadership avatars are: a plausible
 * logo would survive review and ship.
 */

export const metadata: Metadata = {
  title: 'Partners',
  description:
    'Vendor and cloud partnerships, each with the tier it was actually awarded rather than an unlabelled logo.',
  alternates: { canonical: '/partners' },
  openGraph: { title: `Partners · ${site.name}`, url: '/partners' },
}

export default function PartnersPage() {
  return (
    <>
      <Section theme="dark" grain offsetNav aria-labelledby="partners-title">
        <p className="u-eyebrow">Partners</p>

        <h1
          id="partners-title"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', maxWidth: '18ch', marginTop: 'var(--s4)' }}
        >
          Partnerships, with the tier each one actually is
        </h1>

        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {site.positioning}
        </p>
      </Section>

      <Section theme="light" aria-labelledby="partner-list-heading">
        <h2 id="partner-list-heading" className="u-eyebrow">
          {`${partners.length} partnerships`}
        </h2>

        <RevealGroup as="ul" className={styles.grid}>
          {partners.map((partner) => (
            <Reveal as="li" key={partner.name} className={styles.row}>
              <span className={styles.mark} aria-hidden="true">
                {initialsFromName(partner.name)}
              </span>

              <h3 className={styles.name}>{partner.name}</h3>

              <p className={styles.tier}>
                {partner.tier}
                <span className={styles.tierFull}>{partner.label}</span>
              </p>
            </Reveal>
          ))}
        </RevealGroup>

        <p className={styles.note}>
          Partner marks are rendered as monograms until each vendor&rsquo;s brand assets and usage
          permission are in place. The tier beside each name is the claim; the mark is decoration.
        </p>

        <p style={{ marginTop: 'var(--s8)' }}>
          <Link className="u-link" href="/certifications" style={{ color: 'var(--fg)' }}>
            Our own certifications, with certificate numbers and expiry dates
          </Link>
        </p>
      </Section>

      <Section theme="deep" tight>
        <h2 style={{ fontSize: 'var(--text-2xl)', maxWidth: '24ch' }}>{contactIntro.heading}</h2>
        <p className="u-measure" style={{ color: 'var(--muted)', marginTop: 'var(--s4)' }}>
          {site.contact.responseSla}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s3)', marginTop: 'var(--s8)' }}>
          <Button
            href={site.primaryCta.href}
            variant="primary"
            size="lg"
            iconRight={<ArrowRight size={18} aria-hidden="true" />}
          >
            {site.primaryCta.label}
          </Button>
          <Button href="/trust" variant="secondary" size="lg">
            Trust centre
          </Button>
        </div>
      </Section>
    </>
  )
}
