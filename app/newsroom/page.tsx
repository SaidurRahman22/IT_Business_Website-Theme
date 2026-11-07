// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ArrowRight, Megaphone } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { site } from '@/lib/site'
import { contactRoutes } from '@/lib/contact'
import { contactsFor } from '@/lib/people'
import styles from './newsroom.module.css'

/**
 * /newsroom - an honest empty state.
 *
 * There is no news data in lib/ and none is invented here. Three plausible
 * press releases would be checked by the first journalist who read them, and
 * a fabricated announcement on the newsroom of a firm that sells trust is not
 * a recoverable mistake. An empty state that gives a journalist a named
 * contact, a response time and the stated position on what we will discuss is
 * worth more than invented copy, because it is the only part of a newsroom
 * anybody uses on deadline.
 *
 * The press position is quoted from the careers-and-press route in
 * lib/contact.ts, which already states it: methodology, research and the
 * industry yes; a client, including whether one exists, no.
 */

export const metadata: Metadata = {
  title: 'Newsroom',
  description: `Press contact for ${site.legalName}, what we will and will not discuss, and where our published research lives.`,
  alternates: { canonical: '/newsroom' },
  openGraph: { title: `Newsroom · ${site.name}`, url: '/newsroom' },
}

const pressRoute = contactRoutes.find((route) => route.id === 'careers')
const pressContacts = contactsFor('press')

/** Real routes that already exist in the site's information architecture.
 *  This is what a journalist is actually looking for when a newsroom is
 *  empty - not an archive of announcements. */
const ELSEWHERE = [
  { href: '/research', label: 'Research & Labs', note: 'Original research and advisories' },
  { href: '/blog', label: 'Insights', note: 'Written by the people doing the work' },
  { href: '/methodologies', label: 'Methodologies', note: 'How each engagement type is run' },
  { href: '/approach', label: site.methodology.name, note: site.methodology.oneLine },
  { href: '/trust', label: 'Trust centre', note: 'Our own security posture, published' },
]

export default function NewsroomPage() {
  return (
    <>
      <Section theme="dark" grain offsetNav aria-labelledby="newsroom-title">
        <p className="u-eyebrow">Newsroom</p>

        <h1
          id="newsroom-title"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', maxWidth: '16ch', marginTop: 'var(--s4)' }}
        >
          Newsroom
        </h1>

        <div className={styles.empty}>
          <h2 className={styles.emptyHeading}>
            <Megaphone
              size={18}
              aria-hidden="true"
              style={{ display: 'inline-block', verticalAlign: '-3px', marginRight: '8px' }}
            />
            Nothing published yet
          </h2>
          <p className={styles.emptyBody}>
            There are no press releases to list. Announcements appear here when there are
            announcements; in the meantime the press contact below is live and answered.
          </p>
        </div>

        {pressRoute ? (
          <div className={styles.position}>
            <p className={styles.positionLabel}>What we will discuss</p>
            <p className={styles.positionBody}>{pressRoute.body}</p>
          </div>
        ) : null}
      </Section>

      <Section theme="light" aria-labelledby="press-contact-heading">
        <h2 id="press-contact-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '18ch' }}>
          Press contact
        </h2>

        {pressContacts.map((person) => (
          <div className={styles.contact} key={person.slug}>
            <AvatarPlaceholder name={person.name} size={72} />
            <div style={{ minWidth: 0 }}>
              <h3 className={styles.contactName}>
                <Link className="u-link" href={`/about/leadership/${person.slug}`} style={{ color: 'var(--fg)' }}>
                  {person.name}
                </Link>
              </h3>
              <p className={styles.contactRole}>{person.role}</p>

              <div className={styles.contactLines}>
                <p className={`u-mono ${styles.contactLine}`}>
                  <a className="u-link" href={`mailto:${site.contact.pressEmail}`}>
                    {site.contact.pressEmail}
                  </a>
                </p>
                <p className={`u-mono ${styles.contactLine}`}>
                  <a className="u-link" href={`tel:${site.contact.switchboard.replace(/\s/g, '')}`}>
                    {site.contact.switchboard}
                  </a>
                </p>
              </div>

              {pressRoute ? <p className={styles.contactSla}>{pressRoute.sla}</p> : null}
            </div>
          </div>
        ))}
      </Section>

      <Section theme="deep" aria-labelledby="elsewhere-heading">
        <h2 id="elsewhere-heading" style={{ fontSize: 'var(--text-2xl)', maxWidth: '26ch' }}>
          What is published, and where
        </h2>

        <RevealGroup as="ul" className={styles.elsewhere}>
          {ELSEWHERE.map((item) => (
            <Reveal as="li" key={item.href} className={styles.elsewhereRow}>
              <Link className={styles.elsewhereLink} href={item.href}>
                {item.label}
              </Link>
              <p className={styles.elsewhereNote}>{item.note}</p>
            </Reveal>
          ))}
        </RevealGroup>
      </Section>

      <Section theme="dark" tight>
        <h2 style={{ fontSize: 'var(--text-2xl)', maxWidth: '24ch' }}>
          For anything that is not press
        </h2>
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
          <Button href="/careers" variant="secondary" size="lg">
            Careers
          </Button>
        </div>
      </Section>
    </>
  )
}
