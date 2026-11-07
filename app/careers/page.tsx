// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ArrowRight, Briefcase, MoveRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { AvatarPlaceholder } from '@/components/ui/AvatarPlaceholder'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { site, headlineStats, teamCredentials } from '@/lib/site'
import { contactRoutes } from '@/lib/contact'
import { contactsFor } from '@/lib/people'
import { trustSections } from '@/lib/trust'
import styles from './careers.module.css'

/**
 * /careers - an honest empty state.
 *
 * There is no job data in lib/, so there are no listings and none are
 * invented. What the content layer does commit to is two specific, checkable
 * things, and they are the page:
 *
 *   1. Salary bands are published, "because a role advertised without one
 *      wastes everybody's afternoon" - quoted from the careers route in
 *      lib/contact.ts rather than paraphrased.
 *   2. Every engineer and tester is background-checked before being assigned
 *      to an engagement, and the policy is published rather than described on
 *      request - quoted from the `people` section of lib/trust.ts, with a link
 *      straight to it.
 *
 * Both are stated here because both are things a candidate can hold us to,
 * and because the second one is also why a client lets us read their source.
 */

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Roles are listed when they are open, always with a salary band. Every engineer and tester is background-checked before they are assigned to an engagement.',
  alternates: { canonical: '/careers' },
  openGraph: { title: `Careers · ${site.name}`, url: '/careers' },
}

const careersRoute = contactRoutes.find((route) => route.id === 'careers')
const hiringContacts = contactsFor('careers')
const peopleSection = trustSections.find((section) => section.id === 'people')
const headcount = headlineStats.find((stat) => stat.label.includes('engineers'))

/**
 * The salary-band commitment, taken from the data rather than retyped so it
 * cannot drift: it is the FIRST sentence of the careers-and-press route body.
 * The rest of that body is the press position, which belongs on /newsroom and
 * is rendered there in full.
 */
const SALARY_COMMITMENT = (careersRoute?.body ?? '').split(/(?<=\.)\s+/)[0]

export default function CareersPage() {
  return (
    <>
      <Section theme="dark" grain offsetNav aria-labelledby="careers-title">
        <p className="u-eyebrow">Careers</p>

        <h1
          id="careers-title"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', maxWidth: '16ch', marginTop: 'var(--s4)' }}
        >
          Careers
        </h1>

        <div className={styles.empty}>
          <h2 className={styles.emptyHeading}>
            <Briefcase
              size={18}
              aria-hidden="true"
              style={{ display: 'inline-block', verticalAlign: '-3px', marginRight: '8px' }}
            />
            No roles open right now
          </h2>
          <p className={styles.emptyBody}>
            Roles are listed on this page when they are open, and not before. If none are listed,
            none are open. Speculative applications are read, the address and the person who reads
            them are below.
          </p>
        </div>

        <div className={styles.commitments}>
          <div className={styles.commitment}>
            <p className={styles.commitmentLabel}>When a role is listed</p>
            <p className={styles.commitmentBody}>{SALARY_COMMITMENT}</p>
          </div>

          <div className={styles.commitment}>
            <p className={styles.commitmentLabel}>Before you are assigned to an engagement</p>
            <p className={styles.commitmentBody}>{peopleSection?.summary}</p>
            <Link className={`u-link ${styles.commitmentLink}`} href="/trust#people">
              The background-check policy, in full
              <MoveRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * WHO IS ALREADY HERE - counted credentials, not adjectives
       * ---------------------------------------------------------------- */}
      <Section theme="light" aria-labelledby="bar-heading">
        <h2 id="bar-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '20ch' }}>
          Who is already here
        </h2>
        {headcount ? (
          <p
            className="u-measure"
            style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s4)' }}
          >
            {`${headcount.display} ${headcount.label}, across a security practice and a software development practice.`}
          </p>
        ) : null}

        <RevealGroup as="ul" className={styles.credGrid} aria-label="Certifications held across the team">
          {teamCredentials.map((credential) => (
            <Reveal as="li" key={credential.label} className={styles.credCell}>
              <span className={`u-mono u-tnum ${styles.credCount}`}>{credential.count}</span>
              <span className={styles.credLabel}>{credential.label}</span>
            </Reveal>
          ))}
        </RevealGroup>

        <p style={{ marginTop: 'var(--s8)', display: 'flex', flexWrap: 'wrap', gap: 'var(--s4)' }}>
          <Link className="u-link" href="/about/leadership" style={{ color: 'var(--fg)' }}>
            The people who lead each practice
          </Link>
          <Link className="u-link" href="/approach" style={{ color: 'var(--fg)' }}>
            {`How the work is actually run, ${site.methodology.name}`}
          </Link>
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * THE HIRING CONTACT
       * ---------------------------------------------------------------- */}
      <Section theme="deep" aria-labelledby="hiring-heading">
        <h2 id="hiring-heading" style={{ fontSize: 'var(--text-2xl)', maxWidth: '26ch' }}>
          Who reads applications
        </h2>

        {hiringContacts.map((person) => (
          <div className={styles.contact} key={person.slug}>
            <AvatarPlaceholder name={person.name} size={72} />
            <div style={{ minWidth: 0 }}>
              <h3 className={styles.contactName}>
                <Link className="u-link" href={`/about/leadership/${person.slug}`} style={{ color: 'var(--fg)' }}>
                  {person.name}
                </Link>
              </h3>
              <p className={styles.contactRole}>{person.role}</p>
              <p className={styles.contactBio}>{person.bio}</p>
              <p className={`u-mono ${styles.contactMail}`}>
                <a className="u-link" href={`mailto:${site.contact.careersEmail}`}>
                  {site.contact.careersEmail}
                </a>
              </p>
              {careersRoute ? <p className={styles.contactSla}>{careersRoute.sla}</p> : null}
            </div>
          </div>
        ))}
      </Section>

      <Section theme="dark" tight>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s3)' }}>
          <Button
            href={`mailto:${site.contact.careersEmail}`}
            variant="primary"
            size="lg"
            iconRight={<ArrowRight size={18} aria-hidden="true" />}
          >
            {`Email ${site.contact.careersEmail}`}
          </Button>
          <Button href="/trust" variant="secondary" size="lg">
            Trust centre
          </Button>
        </div>
      </Section>
    </>
  )
}
