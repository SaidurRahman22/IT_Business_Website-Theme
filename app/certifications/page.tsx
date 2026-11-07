import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Handshake, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { Section } from '@/components/ui/Section'
import { certifications, partners } from '@/lib/proof'
import type { Certification } from '@/lib/proof'
import { site, teamCredentials } from '@/lib/site'
import { trustSections } from '@/lib/trust'
import { NamedContactsCta, ProofStyles } from '../case-studies/_components/proof'

/**
 * `/certifications`.
 *
 * A certification mark with no certificate number is decoration. A number, a
 * named issuer, a stated scope and an expiry date is something a procurement
 * reviewer can take away and verify, so every field renders in `.u-mono` as a
 * document field rather than as marketing copy - and where a field is genuinely
 * absent it renders as an em dash rather than being quietly omitted.
 *
 * The "not held" rows are the point of the page. ISO/IEC 27701 is carried in
 * lib/trust.ts marked `Not held`, with the reason, and it is rendered here as
 * prominently as the certificates we do hold. It is the row that makes the
 * others believable.
 *
 * REPORTED: the brief placed the ISO 27701 "not held" record in lib/proof.ts.
 * It is actually in lib/trust.ts, in `trustSections` → `certifications` → rows.
 * This page reads it from there rather than restating it.
 *
 * Every mark carries its `label` as readable text. All `logo` fields in
 * lib/proof.ts are null, so the text IS the mark - which is the correct
 * fallback, not a degraded one.
 */

export const metadata: Metadata = {
  title: 'Certifications',
  description:
    'Our certifications with the certificate number, the issuing body, the stated scope and the expiry date, including one standard we do not hold and why.',
  alternates: { canonical: '/certifications' },
  openGraph: {
    type: 'website',
    title: `Certifications · ${site.name}`,
    description: 'Ours, with certificate numbers.',
    url: `${site.url}/certifications`,
  },
}

const RELEVANCE_LABEL: Record<Certification['relevance'], string> = {
  security: 'Security',
  software: 'Software',
  both: 'Both pillars',
}

const CSS = `
.ce-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }

.ce-lead { margin: var(--s6) 0 0; color: var(--muted-strong); max-width: 58ch; }

/* ---------------- certificate cards ---------------- */
.certs { display: grid; gap: var(--s6); list-style: none; margin: var(--s8) 0 0; padding: 0; }
@media (min-width: 820px) { .certs { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.cert { display: flex; flex-direction: column; gap: var(--s4); height: 100%; }
.cert__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: var(--s3); }
.cert__label {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 500;
  line-height: var(--leading-snug);
  color: var(--fg);
  max-width: 34ch;
}
.cert__fields { margin: 0; display: grid; gap: 0; border-top: 1px solid var(--border); }
.cert__row {
  display: grid;
  gap: var(--s1) var(--s4);
  padding-block: var(--s3);
  border-bottom: 1px solid var(--border);
}
@media (min-width: 480px) { .cert__row { grid-template-columns: 11rem minmax(0, 1fr); align-items: baseline; } }
.cert__key {
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.cert__value {
  margin: 0;
  font-size: var(--text-xs);
  line-height: 1.6;
  color: var(--fg);
  overflow-wrap: break-word;
}
.cert__value--strong { font-size: var(--text-sm); letter-spacing: 0.04em; color: var(--fg); }
.cert__value--absent { color: var(--muted); }

/* ---------------- not held ---------------- */
.notheld { list-style: none; margin: var(--s8) 0 0; padding: 0; }
.notheld > li {
  border: 1px solid var(--border-strong);
  border-left: 3px solid var(--muted);
  border-radius: var(--radius-md);
  padding: var(--s4) var(--s6);
  background-color: var(--surface);
}
.notheld > li + li { margin-top: var(--s4); }
.notheld__head { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--s3); }
.notheld__name { margin: 0; font-size: var(--text-base); font-weight: 500; color: var(--fg); }
.notheld__state { font-size: var(--text-xs); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.notheld__note { margin: var(--s3) 0 0; font-size: var(--text-sm); line-height: 1.6; color: var(--muted-strong); max-width: 72ch; }

/* ---------------- credentials ---------------- */
.creds { display: grid; gap: var(--s6); list-style: none; margin: var(--s8) 0 0; padding: 0; }
@media (min-width: 560px) { .creds { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--s8); } }
@media (min-width: 1024px) { .creds { grid-template-columns: repeat(6, minmax(0, 1fr)); } }
.cred { display: flex; flex-direction: column; gap: var(--s1); border-top: 1px solid var(--border-strong); padding-top: var(--s3); min-width: 0; }
.cred__count {
  margin: 0;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
}
.cred__label { margin: 0; font-size: var(--text-xs); color: var(--muted); line-height: 1.4; }

/* ---------------- partners ---------------- */
.partners { display: grid; gap: var(--s4); list-style: none; margin: var(--s8) 0 0; padding: 0; }
@media (min-width: 640px) { .partners { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 1024px) { .partners { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.partner { display: flex; flex-direction: column; gap: var(--s2); height: 100%; }
.partner__name { margin: 0; font-size: var(--text-base); font-weight: 500; color: var(--fg); }
.partner__tier { margin: 0; font-size: var(--text-xs); color: var(--muted); letter-spacing: 0.04em; }
.partner__label { margin: 0; font-size: var(--text-xs); color: var(--muted); }

.ce-note { margin: var(--s8) 0 0; font-size: var(--text-sm); color: var(--muted); max-width: 68ch; }

@media print {
  .cert, .notheld > li { break-inside: avoid; }
}
`

function Field({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string | null
  strong?: boolean
}) {
  return (
    <div className="cert__row">
      <dt className="cert__key u-mono">{label}</dt>
      <dd
        className={[
          'cert__value',
          'u-mono',
          strong ? 'cert__value--strong' : '',
          value ? '' : 'cert__value--absent',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value ?? (
          <>
            <span aria-hidden="true">—</span>
            <span className="ce-sr">Not stated</span>
          </>
        )}
      </dd>
    </div>
  )
}

export default function CertificationsPage() {
  const notHeld =
    trustSections
      .find((section) => section.id === 'certifications')
      ?.rows?.filter((row) => row.value.toLowerCase().startsWith('not held')) ?? []

  return (
    <>
      <style href="envenox-certifications" precedence="default">
        {CSS}
      </style>
      <ProofStyles />

      {/* ---------- hero ---------- */}
      <Section theme="dark" grain offsetNav aria-labelledby="ce-title">
        <p className="u-eyebrow">Certifications</p>
        <h1 id="ce-title" style={{ fontSize: 'var(--text-3xl)', margin: 'var(--s3) 0 0', maxWidth: '20ch' }}>
          Ours, with certificate numbers
        </h1>
        <p className="ce-lead">
          Every mark below carries its issuing body, its stated scope, its certificate number where one is
          issued, and its expiry date. One standard we do not hold is listed too, with the reason. Our wider
          posture is on{' '}
          <Link href="/trust" className="u-link">
            the trust centre
          </Link>
          .
        </p>
      </Section>

      {/* ---------- held certifications ---------- */}
      <Section theme="deep" aria-labelledby="ce-held">
        <h2 id="ce-held" style={{ fontSize: 'var(--text-2xl)', margin: 0 }}>
          <ShieldCheck
            size={20}
            strokeWidth={1.75}
            absoluteStrokeWidth
            aria-hidden="true"
            style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: 'var(--s2)' }}
          />
          Held, {certifications.length} certifications
        </h2>

        <RevealGroup as="ul" className="certs">
          {certifications.map((cert) => (
            <Reveal as="li" key={cert.slug}>
              <Card padding="lg" className="cert">
                <div className="cert__head">
                  {/* The label IS the mark: readable text, never a bare logo. */}
                  <h3 className="cert__label">{cert.label}</h3>
                  <Badge variant="neutral">{RELEVANCE_LABEL[cert.relevance]}</Badge>
                </div>

                <dl className="cert__fields">
                  <Field label="Certificate no." value={cert.certificateNumber} strong />
                  <Field label="Issuer" value={cert.issuer} />
                  <Field label="Scope" value={cert.scope} />
                  <Field label="Issued" value={cert.issued} strong />
                  <Field label="Expires" value={cert.expires} strong />
                </dl>
              </Card>
            </Reveal>
          ))}
        </RevealGroup>

        {notHeld.length > 0 ? (
          <>
            <h2 style={{ fontSize: 'var(--text-2xl)', margin: 'var(--s24) 0 0' }}>Not held</h2>
            <ul className="notheld" aria-label="Standards we do not hold">
              {notHeld.map((row) => (
                <li key={row.label}>
                  <div className="notheld__head">
                    <h3 className="notheld__name u-mono">{row.label}</h3>
                    <span className="notheld__state u-mono">{row.value}</span>
                  </div>
                  {row.note ? <p className="notheld__note">{row.note}</p> : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Section>

      {/* ---------- individual credentials, aggregated ---------- */}
      <Section theme="dark" tight aria-labelledby="ce-creds">
        <h2 id="ce-creds" style={{ fontSize: 'var(--text-2xl)', margin: 0 }}>
          Individual credentials across the team
        </h2>
        <ul className="creds" aria-label="Team credentials by count">
          {teamCredentials.map((credential) => (
            <li className="cred" key={credential.label}>
              <p className="cred__count u-tnum">{credential.count}</p>
              <p className="cred__label">{credential.label}</p>
            </li>
          ))}
        </ul>
        <p className="ce-note">
          <Link href="/about/leadership" className="u-link">
            Who holds what
          </Link>
        </p>
      </Section>

      {/* ---------- partners, with tier names ---------- */}
      <Section theme="deep" aria-labelledby="ce-partners">
        <h2 id="ce-partners" style={{ fontSize: 'var(--text-2xl)', margin: 0 }}>
          <Handshake
            size={20}
            strokeWidth={1.75}
            absoluteStrokeWidth
            aria-hidden="true"
            style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: 'var(--s2)' }}
          />
          Partners and tiers
        </h2>
        <RevealGroup as="ul" className="partners">
          {partners.map((partner) => (
            <Reveal as="li" key={partner.name}>
              <Card padding="md" className="partner">
                <p className="partner__name">{partner.name}</p>
                <p className="partner__tier u-mono">{partner.tier}</p>
                <p className="partner__label">{partner.label}</p>
              </Card>
            </Reveal>
          ))}
        </RevealGroup>
      </Section>

      {/* ---------- CTA ---------- */}
      <Section theme="light" aria-labelledby="ce-cta">
        <NamedContactsCta id="ce-cta">
          <Button
            href="/trust"
            variant="secondary"
            size="lg"
            iconRight={<ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />}
          >
            Our own security posture
          </Button>
        </NamedContactsCta>
      </Section>
    </>
  )
}
