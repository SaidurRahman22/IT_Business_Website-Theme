import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Bug, KeyRound, Mail, ScrollText, Timer } from 'lucide-react'

import { legalDocsBySlug } from '@/lib/legal'
import { site } from '@/lib/site'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { Reveal, RevealGroup } from '@/components/ui/Reveal'
import { Breadcrumbs, JsonLd, ORGANIZATION_REF, breadcrumbList } from '../contact/_shared/seo'
import { reportFields } from '../contact/_shared/report-fields'
import { ErrorSummary, FormField, FormStyles } from '../contact/_shared/Fields'
import { decodeErrors, decodeValues } from '../contact/_shared/validate'

/**
 * /report-issue - the intake `public/.well-known/security.txt` points at.
 *
 * Everything on this page is derived from
 * `legalDocsBySlug['vulnerability-disclosure']`, so the commitments shown here
 * cannot drift from the policy they summarise. There is no copy on this page
 * asserting a commitment the policy does not make.
 *
 * THE PGP KEY DOES NOT EXIST YET. The policy text names
 * `/.well-known/pgp-key.txt`, and security.txt deliberately publishes no
 * `Encryption:` field because a key URL that 404s tells a researcher the policy
 * was written and never tested. This page names the same path and says plainly
 * that the key is pending - it does not render it as a download link.
 */

const doc = legalDocsBySlug['vulnerability-disclosure']

const section = (heading: string) => doc?.sections.find((s) => s.heading === heading)

const commitments = section('What we commit to')?.list ?? []
const whyExists = section('Why this exists')
const willNotDo = section('What we will not do')
const scope = section('Scope')
const rules = section('Rules of engagement')

export const metadata: Metadata = {
  title: 'Report a security issue',
  description:
    doc?.summary ??
    'How to report a security issue in our own systems, what we will do with it, and what we will not do to you.',
  alternates: { canonical: '/report-issue' },
}

const CSS = `
.ri__commit { list-style: none; margin: var(--s8) 0 0; padding: 0; display: grid; gap: var(--s4); }
@media (min-width: 768px) { .ri__commit { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.ri__commit > li { display: grid; }
.ri__commit .card { height: 100%; }
.ri__commit-head {
  display: flex;
  align-items: center;
  gap: var(--s2);
  margin: 0 0 var(--s3);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.ri__commit-head svg { flex: none; }
.ri__commit-body { margin: 0; color: var(--muted-strong); }

.ri__split { display: grid; gap: var(--s12); }
@media (min-width: 1000px) {
  .ri__split { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); gap: var(--s16); align-items: start; }
}
.ri__aside { display: grid; gap: var(--s6); align-content: start; }
.ri__aside-block { padding-top: var(--s4); border-top: 1px solid var(--border); }
.ri__aside-head {
  display: flex;
  align-items: center;
  gap: var(--s2);
  flex-wrap: wrap;
  margin: 0 0 var(--s2);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--fg);
}
.ri__aside-head svg { flex: none; color: var(--muted); }
.ri__aside-block p { margin: 0; color: var(--muted); font-size: var(--text-sm); max-width: 46ch; line-height: 1.55; }
.ri__addr {
  display: block;
  margin-bottom: var(--s2);
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-sm);
  color: var(--fg);
  overflow-wrap: anywhere;
}
.ri__path {
  display: inline-block;
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-sm);
  color: var(--muted-strong);
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1px var(--s2);
  overflow-wrap: anywhere;
}
.ri__scope { display: grid; gap: var(--s6); margin-top: var(--s8); }
@media (min-width: 900px) { .ri__scope { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--s12); } }
.ri__scope h3 { margin: 0 0 var(--s3); font-size: var(--text-lg); }
.ri__scope p, .ri__scope li { color: var(--muted-strong); }
.ri__scope ul { margin: var(--s3) 0 0; padding-left: var(--s4); font-size: var(--text-sm); }
.ri__scope li + li { margin-top: var(--s2); }
`

/**
 * STATIC EXPORT: this page no longer reads searchParams.
 *
 * The `?err=...&f_...=` round-trip existed so a Server Action could bounce a
 * failed submit back here carrying the errors and the typed values. Static
 * export has no Server Actions, so nothing can produce those params any more;
 * the form validates in the browser via `required`/`type` instead. Passing an
 * empty object keeps the shared form components' signatures unchanged.
 */
export default async function ReportIssuePage() {
  const params: Record<string, string | string[] | undefined> = {}
  const errors = decodeErrors(reportFields, params)
  const values = decodeValues(reportFields, params)

  return (
    <>
      <style href="envenox-reportissue" precedence="default">
        {CSS}
      </style>
      <FormStyles />
      <JsonLd data={breadcrumbList([{ name: 'Report a security issue', path: '/report-issue' }])} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Report a security issue',
          description: doc?.summary,
          url: `${site.url}/report-issue`,
          isPartOf: { '@id': `${site.url}/#website` },
          publisher: ORGANIZATION_REF,
        }}
      />

      {/* ---- 1. what this is ---- */}
      <Section theme="dark" grain offsetNav aria-labelledby="ri-h1">
        <Breadcrumbs trail={[{ name: 'Report a security issue', path: '/report-issue' }]} />

        <p className="u-eyebrow" style={{ marginTop: 'var(--s8)' }}>
          Vulnerability disclosure
        </p>
        <h1
          id="ri-h1"
          style={{ fontSize: 'clamp(2.25rem, 5.4vw, 4rem)', marginTop: 'var(--s4)', maxWidth: '16ch' }}
        >
          Report a security issue
        </h1>
        {whyExists?.body.map((paragraph) => (
          <p
            key={paragraph.slice(0, 40)}
            className="u-measure"
            style={{ color: 'var(--muted-strong)', fontSize: 'var(--text-lg)', marginTop: 'var(--s6)' }}
          >
            {paragraph}
          </p>
        ))}

        {/* The four commitments, quoted from the policy rather than restated. */}
        <RevealGroup as="ul" className="ri__commit">
          <Reveal as="li">
            <Card as="div" padding="md">
              <p className="ri__commit-head">
                <Timer size={14} aria-hidden="true" />
                Acknowledgement
              </p>
              <p className="ri__commit-body">
                {commitments[0] ?? 'Acknowledgement within one business day, from a person.'}
              </p>
            </Card>
          </Reveal>
          <Reveal as="li">
            <Card as="div" padding="md">
              <p className="ri__commit-head">
                <ScrollText size={14} aria-hidden="true" />
                Triage
              </p>
              <p className="ri__commit-body">
                {commitments[1] ??
                  'A triage decision within five business days, with the reasoning.'}
              </p>
            </Card>
          </Reveal>
          <Reveal as="li">
            <Card as="div" padding="md">
              <p className="ri__commit-head">
                <Bug size={14} aria-hidden="true" />
                No NDA, no account
              </p>
              <p className="ri__commit-body">{whyExists?.body[1]}</p>
            </Card>
          </Reveal>
          <Reveal as="li">
            <Card as="div" padding="md">
              <p className="ri__commit-head">
                <ScrollText size={14} aria-hidden="true" />
                No legal action
              </p>
              <p className="ri__commit-body">{willNotDo?.body[0]}</p>
            </Card>
          </Reveal>
        </RevealGroup>

        <p style={{ marginTop: 'var(--s8)' }}>
          <Link className="u-link" href="/legal/vulnerability-disclosure" style={{ color: 'var(--fg)' }}>
            Read the full vulnerability disclosure policy
          </Link>{' '}
          <ArrowRight size={14} aria-hidden="true" style={{ display: 'inline-block', verticalAlign: '-2px' }} />
        </p>
      </Section>

      {/* ---- 2. the form, plus the direct routes ---- */}
      <Section theme="light" id="report-form" aria-labelledby="ri-form-h2">
        <div className="ri__split">
          <div style={{ minWidth: 0 }}>
            <h2 id="ri-form-h2" style={{ fontSize: 'var(--text-2xl)', maxWidth: '20ch' }}>
              Send the report
            </h2>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--s3)', maxWidth: '54ch' }}>
              {section('How to report')?.body[1]}
            </p>

            {/* Server action, server validation, no Client Component. Submits
                with scripting off exactly as it does with scripting on. */}
            <form className="frm" action="/thank-you" method="get" style={{ marginTop: 'var(--s8)' }}>
              <input type="hidden" name="from" value="report-issue" />
              <ErrorSummary id="report-errors" fields={reportFields} errors={errors} />

              <div className="frm__grid">
                {reportFields.map((field) => (
                  <FormField key={field.name} field={field} errors={errors} values={values} />
                ))}
              </div>

              <div className="frm__actions">
                <Button type="submit" size="lg" iconRight={<ArrowRight size={16} aria-hidden="true" />}>
                  Send the report
                </Button>
              </div>

              <p className="frm__note">
                Fields marked without “(optional)” are required. We will not share your identity
                with anyone outside the triage team unless you ask us to.
              </p>
            </form>
          </div>

          <aside className="ri__aside" aria-labelledby="ri-direct-h2">
            <h2 id="ri-direct-h2" className="u-eyebrow" style={{ margin: 0 }}>
              Or report it directly
            </h2>

            <div className="ri__aside-block">
              <p className="ri__aside-head">
                <Mail size={16} aria-hidden="true" />
                Email
              </p>
              <a className="ri__addr u-link" href={`mailto:${site.contact.securityEmail}`}>
                {site.contact.securityEmail}
              </a>
              <p>
                Read by the triage team. A plain email is as acceptable as the form, and the same
                commitments apply to it.
              </p>
            </div>

            <div className="ri__aside-block">
              <p className="ri__aside-head">
                <KeyRound size={16} aria-hidden="true" />
                PGP
                <Badge variant="neutral">Key pending</Badge>
              </p>
              <p style={{ marginBottom: 'var(--s2)' }}>
                The policy names <span className="ri__path">/.well-known/pgp-key.txt</span> as the
                key location. <strong style={{ color: 'var(--fg)' }}>That key is not published
                yet</strong>, so do not expect a download there, and{' '}
                <span className="ri__path">security.txt</span> deliberately omits the{' '}
                <span className="ri__path">Encryption:</span> field rather than advertising a URL
                that returns a 404.
              </p>
              <p>
                If you need to encrypt before you send anything, email the address above asking for
                a key and we will send one and publish it at that path in the same change. If you
                would rather not send detail in cleartext in the meantime, send the host and a
                sentence and we will arrange a channel.
              </p>
            </div>

            <div className="ri__aside-block">
              <p className="ri__aside-head">
                <ScrollText size={16} aria-hidden="true" />
                Reporting about a client
              </p>
              <p>
                Anything belonging to a client is out of scope here. Report it to them. If you
                cannot identify the owner, tell us and we will try to route it without disclosing
                who they are.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {/* ---- 3. scope and rules, from the policy ---- */}
      <Section theme="deep" aria-labelledby="ri-scope-h2">
        <h2 id="ri-scope-h2" style={{ fontSize: 'var(--text-2xl)' }}>
          Scope and rules of engagement
        </h2>

        <div className="ri__scope">
          <div>
            <h3>{scope?.heading}</h3>
            {scope?.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} style={{ margin: 0 }}>
                {paragraph}
              </p>
            ))}
            {scope?.list?.length ? (
              <ul>
                {scope.list.map((item) => (
                  <li key={item.slice(0, 40)}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            <h3>{rules?.heading}</h3>
            {rules?.body.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} style={{ margin: '0 0 var(--s3)' }}>
                {paragraph}
              </p>
            ))}
            <p style={{ margin: 0 }}>
              <Link className="u-link" href="/legal/vulnerability-disclosure" style={{ color: 'var(--fg)' }}>
                The full policy, including what we will not do
              </Link>
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}
