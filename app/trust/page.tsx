// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ArrowUpRight, FileCheck2 } from 'lucide-react'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { site } from '@/lib/site'
import { trustIntro, trustSections, trustContacts, type TrustSection } from '@/lib/trust'
import styles from './trust.module.css'

/**
 * /trust - the trust centre.
 *
 * None of the thirteen competitor sites studied had one, despite all of them
 * holding client source code. This page is therefore treated as a reference
 * document rather than a marketing page: a reviewer opens it with a
 * questionnaire beside them and reads it in order.
 *
 * STRUCTURE: every word of copy comes from lib/trust.ts, rendered verbatim.
 * The only things this file adds are navigation and emphasis -
 *   - a section index, sticky at >=1024px purely in CSS, which is a plain list
 *     of anchors in the markup and so needs no JS to degrade to;
 *   - real <table> semantics for every row set, because the sub-processor list
 *     is something a reviewer scans column-wise, not a set of cards;
 *   - the `incidents` section laid out as two identical panels, so the
 *     notification commitment carries exactly the weight of the clean record;
 *   - the ISO 27701 "Not held" row rendered with the same type weight and the
 *     same surface as every "Certified" row above it. That row is what makes
 *     the others believable, so it is not softened, shrunk or moved.
 *
 * LINKIFY: `linkify()` below wraps email addresses and a small allowlist of
 * internal paths that already appear inside the copy. It does not alter a
 * character - notes in lib/trust.ts literally say "See
 * /legal/vulnerability-disclosure", and a reference document should let you
 * click that.
 */

export const metadata: Metadata = {
  title: 'Trust centre',
  description:
    'Our own security posture, published rather than described on request: certifications, background-check policy, evidence handling, the full sub-processor list, how we test ourselves, and what we commit to if we have an incident.',
  alternates: { canonical: '/trust' },
  openGraph: {
    title: `Trust centre · ${site.name}`,
    description: trustIntro.lead,
    url: '/trust',
  },
}

/* ========================================================================== *
 * LINKIFY - makes the paths and addresses already present in the copy live.
 * The allowlist is exact-match only, so "24/7/365" is never mistaken for a
 * route. Nothing is reworded, inserted or removed.
 * ========================================================================== */

const INTERNAL_PATHS = [
  '/legal/vulnerability-disclosure',
  '/certifications',
  '/sample-report',
  '/case-studies',
  '/approach',
  '/contact',
  '/trust',
] as const

const EMAIL = String.raw`[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9.-]+`
const LINKABLE = new RegExp(`(${EMAIL}|${INTERNAL_PATHS.join('|')})`, 'g')

function linkify(text: string): ReactNode[] {
  return text.split(LINKABLE).map((part, i) => {
    if (i % 2 === 0) return part
    if (part.includes('@')) {
      return (
        <a key={i} className="u-link u-mono" href={`mailto:${part}`}>
          {part}
        </a>
      )
    }
    return (
      <Link key={i} className="u-link u-mono" href={part}>
        {part}
      </Link>
    )
  })
}

/* ========================================================================== *
 * ROW TABLE
 * ========================================================================== */

function RowTable({ section }: { section: TrustSection }) {
  if (!section.rows?.length) return null

  return (
    <div
      className={styles.tableWrap}
      role="region"
      aria-labelledby={`${section.id}-heading`}
      tabIndex={0}
    >
      <table className={styles.spec}>
        {/* No visually-hidden <thead>: position:absolute on a thead takes it
            out of the table's own layout and AT support for that is uneven.
            A <caption> plus a `scope="row"` header per row is the correct
            and robust semantic for a two-column specification table. */}
        <caption className={styles.srOnly}>{section.summary}</caption>
        <tbody>
          {section.rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>
                <span className={styles.value}>{row.value}</span>
                {row.note ? <span className={styles.rowNote}>{linkify(row.note)}</span> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ========================================================================== *
 * INCIDENTS - the one section laid out differently, on purpose.
 * ========================================================================== */

function IncidentPanels({ section }: { section: TrustSection }) {
  const [commitment, ...rest] = section.body ?? []

  return (
    <>
      <div className={styles.equalPair}>
        <div className={styles.equalPanel}>
          <p className={styles.equalLabel}>The record</p>
          <p className={styles.equalBody}>{section.summary}</p>
        </div>
        {commitment ? (
          <div className={styles.equalPanel}>
            <p className={styles.equalLabel}>The commitment</p>
            <p className={styles.equalBody}>{commitment}</p>
          </div>
        ) : null}
      </div>
      {rest.length ? (
        <div className={styles.body}>
          {rest.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </>
  )
}

/* ========================================================================== *
 * PAGE
 * ========================================================================== */

export default function TrustPage() {
  return (
    <>
      {/* ---------------------------------------------------------------- *
       * HERO
       * ---------------------------------------------------------------- */}
      <Section theme="dark" grain offsetNav aria-labelledby="trust-title">
        <p className="u-eyebrow">Trust centre</p>

        <h1
          id="trust-title"
          style={{ fontSize: 'clamp(2.25rem, 5.2vw, 4rem)', maxWidth: '20ch', marginTop: 'var(--s4)' }}
        >
          {trustIntro.heading}
        </h1>

        <p
          className="u-measure"
          style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
        >
          {trustIntro.lead}
        </p>

        <p className={styles.heroNote} style={{ marginTop: 'var(--s8)' }}>
          {trustIntro.note}
        </p>

        <ul className={styles.heroLinks} style={{ marginTop: 'var(--s12)' }}>
          <li>
            <Button href="/certifications" variant="secondary" size="md">
              Certificates and numbers
            </Button>
          </li>
          <li>
            <Button href="/legal/vulnerability-disclosure" variant="ghost" size="md">
              Vulnerability disclosure policy
            </Button>
          </li>
        </ul>

        {/* A PLAIN ANCHOR, deliberately not <Button href>. Button sends any
            href starting with "/" through next/link, and /.well-known/
            security.txt is a static file in public/ with no route behind it —
            a client-side navigation to it resolves against the router and
            lands on the app's not-found page instead of serving the file.
            Same reason the reference list at the foot of this page uses <a>
            for it. */}
        <p style={{ marginTop: 'var(--s6)' }}>
          <a className="u-link u-mono" href="/.well-known/security.txt" style={{ color: 'var(--muted-strong)' }}>
            /.well-known/security.txt
            <ArrowUpRight
              size={14}
              aria-hidden="true"
              style={{ display: 'inline-block', verticalAlign: '-2px', marginLeft: '4px' }}
            />
          </a>
        </p>
      </Section>

      {/* ---------------------------------------------------------------- *
       * THE DOCUMENT - index + seven sections, one continuous surface.
       * ---------------------------------------------------------------- */}
      <Section theme="light" innerClassName={styles.layout}>
        <nav className={styles.indexWrap} aria-label="Sections of this document">
          <h2 className={styles.indexHeading}>On this page</h2>
          <ol className={styles.indexList}>
            {trustSections.map((section, i) => (
              <li key={section.id}>
                <a className={styles.indexLink} href={`#${section.id}`}>
                  <span className={`u-mono ${styles.indexNum}`} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{section.heading}</span>
                </a>
              </li>
            ))}
            <li>
              <a className={styles.indexLink} href="#trust-contacts">
                <span className={`u-mono ${styles.indexNum}`} aria-hidden="true">
                  08
                </span>
                <span>Contacts</span>
              </a>
            </li>
          </ol>
        </nav>

        <div className={styles.doc}>
          {trustSections.map((section, i) => (
            <Reveal
              as="section"
              key={section.id}
              id={section.id}
              className={styles.docSection}
              aria-labelledby={`${section.id}-heading`}
            >
              <div className={styles.sectionTop}>
                <span className={`u-mono ${styles.sectionNum}`} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 id={`${section.id}-heading`} className={styles.sectionHeading}>
                  {section.heading}
                </h2>
              </div>

              {section.id === 'incidents' ? (
                <IncidentPanels section={section} />
              ) : (
                <>
                  <p className={styles.summary}>{section.summary}</p>
                  <RowTable section={section} />
                  {section.body?.length ? (
                    <div className={styles.body}>
                      {section.body.map((paragraph) => (
                        <p key={paragraph.slice(0, 48)}>{linkify(paragraph)}</p>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------------------------------------------------------------- *
       * CONTACTS
       * ---------------------------------------------------------------- */}
      <Section theme="deep" id="trust-contacts" aria-labelledby="trust-contacts-heading">
        <h2 id="trust-contacts-heading" style={{ fontSize: 'var(--text-3xl)', maxWidth: '20ch' }}>
          {trustContacts.heading}
        </h2>

        <RevealGroup as="dl" className={styles.contacts}>
          {trustContacts.lines.map((line) => (
            <Reveal as="div" className={styles.contactRow} key={line.label}>
              <dt className={styles.contactLabel}>{line.label}</dt>
              <dd className={styles.contactValue}>{linkify(line.value)}</dd>
            </Reveal>
          ))}
        </RevealGroup>

        <ul className={styles.refs}>
          <li>
            <Link className={`u-link ${styles.refLink}`} href="/certifications">
              <FileCheck2 size={16} aria-hidden="true" />
              Every certificate we hold, with its number, issuer and expiry
            </Link>
          </li>
          <li>
            <Link className={`u-link ${styles.refLink}`} href="/legal/vulnerability-disclosure">
              <FileCheck2 size={16} aria-hidden="true" />
              How to report a vulnerability in our own systems, no NDA required
            </Link>
          </li>
          <li>
            <a className={`u-link ${styles.refLink}`} href="/.well-known/security.txt">
              <FileCheck2 size={16} aria-hidden="true" />
              <span className="u-mono">/.well-known/security.txt</span>
            </a>
          </li>
          <li>
            <Link className={`u-link ${styles.refLink}`} href="/approach">
              <FileCheck2 size={16} aria-hidden="true" />
              {site.methodology.name}, the method these controls are built into
            </Link>
          </li>
        </ul>
      </Section>
    </>
  )
}
