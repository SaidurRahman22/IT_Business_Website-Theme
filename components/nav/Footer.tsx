import Link from 'next/link'
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'
import { siGithub, siX } from 'simple-icons'
import { footerNav, legalNav, site } from '@/lib/site'
import { Honeypot } from '@/app/contact/_shared/Fields'
import { BrandIcon, type BrandMark } from '@/components/ui/BrandIcon'

/**
 * Footer - the second homepage (PART 9.12).
 *
 * A services buyer who lands deep in the site and scrolls to the bottom should
 * be able to reach any page, see where the offices are, read the positioning,
 * call the incident line and subscribe, without going back to the top. So this
 * is a Server Component with no interactivity whatsoever: four full link
 * columns, the IR hotline repeated, real addresses, the legal entity, and a
 * newsletter form that posts like a 1998 form.
 *
 * NEWSLETTER / NO-JAVASCRIPT: a plain <form method="post"> with a visible
 * <label>. No placeholder-as-label, no JS-only submit handler, no validation
 * that lives only in a click handler. It posts to /api/newsletter, which the
 * backend owner must implement; with scripting off the browser performs the
 * POST and follows the response. If that route 404s the form still submits -
 * it just lands on a 404, which is a missing endpoint, not a broken form.
 *
 * BRAND MARKS: GitHub and X come from simple-icons. LinkedIn does NOT ship in
 * simple-icons 15.15.0 (removed over trademark concerns) and Lucide has no
 * brand icons at all, so the LinkedIn link renders as a labelled text chip
 * rather than a hand-drawn copy of a trademarked glyph. Every social link
 * carries a visible text label regardless, so the accessible name comes from
 * real text and the row reads correctly with images or fonts unavailable.
 */

const CSS = `
.foot { background-color: var(--bg); color: var(--fg); }
.foot__top { display: grid; gap: var(--s12); padding-block: var(--s20) var(--s12); }
@media (min-width: 1024px) {
  .foot__top { grid-template-columns: minmax(0, 320px) minmax(0, 1fr); gap: var(--s16); }
}

.foot__brand { display: flex; flex-direction: column; gap: var(--s4); align-items: flex-start; }
.foot__wordmark {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--fg);
  text-decoration: none;
}
.foot__positioning { color: var(--muted); font-size: var(--text-sm); line-height: 1.6; max-width: 46ch; margin: 0; }

.foot__hotline {
  display: flex;
  flex-direction: column;
  gap: var(--s1);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: var(--s4);
  text-decoration: none;
  color: var(--fg);
  width: 100%;
  transition: background-color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.foot__hotline:hover { background-color: var(--surface); border-color: var(--fg); }
.foot__hotline-row { display: flex; align-items: center; gap: var(--s2); }
.foot__hotline-number {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-lg);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.foot__hotline-note { color: var(--muted); font-size: var(--text-xs); line-height: 1.45; }

.foot__cols { display: grid; gap: var(--s8); grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (min-width: 768px) { .foot__cols { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--s6); } }
.foot__col-heading {
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 var(--s3);
}
.foot__list { list-style: none; margin: 0; padding: 0; display: grid; gap: var(--s1); }
.foot__link {
  display: inline-block;
  padding-block: var(--s1);
  font-size: var(--text-sm);
  color: var(--muted-strong);
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-out);
}
.foot__link:hover { color: var(--fg); }

.foot__mid {
  display: grid;
  gap: var(--s8);
  padding-block: var(--s12);
  border-top: 1px solid var(--border);
}
@media (min-width: 768px) { .foot__mid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--s16); } }

.foot__offices { display: grid; gap: var(--s6); }
@media (min-width: 480px) { .foot__offices { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.foot__office-city {
  display: flex;
  align-items: center;
  gap: var(--s2);
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fg);
  margin: 0 0 var(--s1);
}
.foot__office-line { color: var(--muted); font-size: var(--text-sm); line-height: 1.5; margin: 0; font-style: normal; }

.foot__form { display: grid; gap: var(--s3); max-width: 44ch; }
.foot__form-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fg);
}
.foot__form-hint { font-size: var(--text-xs); color: var(--muted); margin: 0; }
.foot__form-row { display: flex; gap: var(--s2); flex-wrap: wrap; }
.foot__input {
  flex: 1 1 14rem;
  min-width: 0;
  min-height: 44px;
  background-color: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: 0 var(--s3);
  color: var(--fg);
  font-family: inherit;
  font-size: var(--text-sm);
  transition: border-color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out);
}
.foot__input::placeholder { color: var(--muted); }
.foot__input:hover { border-color: var(--fg); }
.foot__submit {
  min-height: 44px;
  padding-inline: var(--s4);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  background-color: var(--accent);
  color: var(--accent-fg);
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.foot__submit:hover {
  background-color: color-mix(in oklab, var(--accent) 82%, var(--fg) 18%);
  border-color: color-mix(in oklab, var(--accent) 82%, var(--fg) 18%);
}

.foot__bottom {
  display: flex;
  flex-direction: column;
  gap: var(--s6);
  padding-block: var(--s8);
  border-top: 1px solid var(--border);
}
@media (min-width: 1024px) {
  .foot__bottom { flex-direction: row; align-items: flex-start; justify-content: space-between; gap: var(--s12); }
}
.foot__legal { display: grid; gap: var(--s2); }
.foot__legal-line { font-size: var(--text-xs); color: var(--muted); margin: 0; line-height: 1.6; max-width: 62ch; }
.foot__legal-nav { display: flex; flex-wrap: wrap; gap: var(--s1) var(--s4); list-style: none; margin: 0; padding: 0; }
.foot__legal-link {
  font-size: var(--text-xs);
  color: var(--muted);
  text-decoration: none;
  padding-block: var(--s1);
  transition: color var(--dur-base) var(--ease-out);
}
.foot__legal-link:hover { color: var(--fg); }

.foot__social { display: flex; flex-wrap: wrap; gap: var(--s2); list-style: none; margin: 0; padding: 0; }
.foot__social-link {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  min-height: 44px;
  padding-inline: var(--s3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--muted-strong);
  text-decoration: none;
  transition: color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.foot__social-link:hover { color: var(--fg); background-color: var(--surface); border-color: var(--border-strong); }

/* Announced, not shown - these links open in a new tab. */
.foot__vh {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
`

type Social = { label: string; href: string; mark?: BrandMark }

const socials: Social[] = [
  // No simple-icons mark exists for LinkedIn in 15.15.0 - text chip only.
  { label: 'LinkedIn', href: site.social.linkedin },
  { label: 'GitHub', href: site.social.github, mark: siGithub },
  { label: 'X', href: site.social.x, mark: siX },
]

export function Footer() {
  const year = new Date().getFullYear()
  const registered = site.offices.find((o) => o.primary) ?? site.offices[0]

  return (
    <>
      <style href="envenox-footer" precedence="default">
        {CSS}
      </style>
      <footer className="foot theme-dark transition-theme grain" data-theme-section="dark">
        <div className="u-container">
          {/* --- brand, positioning, incident line --- */}
          <div className="foot__top">
            <div className="foot__brand">
              <Link href="/" className="foot__wordmark">
                {site.name}
              </Link>
              <p className="foot__positioning">{site.positioning}</p>
              <a className="foot__hotline" href={site.contact.irHotlineHref} data-ir-hotline="footer">
                <span className="foot__hotline-row">
                  <Phone size={20} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                  <span className="u-eyebrow">Incident response: 24/7</span>
                </span>
                <span className="foot__hotline-number">{site.contact.irHotline}</span>
                <span className="foot__hotline-note">{site.contact.irHotlineCommitment}</span>
              </a>
            </div>

            {/* --- the four link columns --- */}
            <nav className="foot__cols" aria-label="Footer">
              {footerNav.map((column) => (
                <div key={column.heading}>
                  <h2 className="foot__col-heading">{column.heading}</h2>
                  <ul className="foot__list">
                    {column.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="foot__link">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* --- offices + newsletter --- */}
          <div className="foot__mid">
            <div>
              <h2 className="foot__col-heading">Offices</h2>
              <div className="foot__offices">
                {site.offices.map((office) => (
                  <div key={office.city}>
                    <p className="foot__office-city">
                      <MapPin size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                      {office.city}, {office.country}
                    </p>
                    <address className="foot__office-line">{office.line}</address>
                  </div>
                ))}
                <div>
                  <p className="foot__office-city">
                    <Mail size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                    General enquiries
                  </p>
                  <p className="foot__office-line">
                    <a className="foot__link u-link" href={`mailto:${site.contact.email}`}>
                      {site.contact.email}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="foot__office-city">
                    <Mail size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                    Security reports
                  </p>
                  <p className="foot__office-line">
                    <a className="foot__link u-link" href={`mailto:${site.contact.securityEmail}`}>
                      {site.contact.securityEmail}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="foot__col-heading">Research notes</h2>
              {/*
                STATIC EXPORT: there is no server to POST to. This is a GET form
                to /thank-you, which still works with scripting disabled.

                The email input previously had NO `name`, because under the old
                GET form the address would have landed in a URL and from there
                into browser history, Referer headers and access logs.

                2026-11-08: this is a POST to the envenox-forms Worker, so the
                value travels in the request body and none of that applies. The
                name is required: without it the field is never transmitted and
                the Worker rejects every subscription for a missing email. That
                is exactly what happened on the first live test.
              */}
              <form className="foot__form" action={site.forms.endpoint} method="post">
                <input type="hidden" name="form" value="newsletter" />
                <Honeypot />
                <input type="hidden" name="status" value="pending-double-opt-in" />
                <label className="foot__form-label" htmlFor="footer-newsletter-email">
                  Email address
                </label>
                <div className="foot__form-row">
                  <input
                    className="foot__input"
                    id="footer-newsletter-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    aria-describedby="footer-newsletter-hint"
                  />
                  <button className="foot__submit" type="submit">
                    Subscribe
                  </button>
                </div>
                <p className="foot__form-hint" id="footer-newsletter-hint">
                  Advisories, teardowns and methodology notes. Roughly monthly. No sales sequence,
                  one-click unsubscribe.
                </p>
              </form>
            </div>
          </div>

          {/* --- legal + social --- */}
          <div className="foot__bottom">
            <div className="foot__legal">
              <p className="foot__legal-line">
                &copy; {year} {site.legalName}. Registered in England and Wales. Registered office:{' '}
                {registered.line}.
              </p>
              <ul className="foot__legal-nav">
                {legalNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="foot__legal-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="foot__social">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    className="foot__social-link"
                    href={social.href}
                    rel="me noopener noreferrer"
                    target="_blank"
                  >
                    {social.mark ? <BrandIcon icon={social.mark} size={16} /> : null}
                    <span>{social.label}</span>
                    <span className="foot__vh"> (opens in a new tab)</span>
                    <ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
