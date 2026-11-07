import Link from 'next/link'
import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

/**
 * A 404 that does something useful. The obvious URL guesses (`/portfolio`,
 * `/clients`, `/pentest`, `/team`) are redirected in next.config.ts rather than
 * landing here - competitors 404 on `/case-studies` while their real path is
 * `/portfolio`, which is a self-inflicted wound.
 *
 * Styled with raw tokens rather than the shared components so that this page
 * still renders correctly if the failure that brought someone here was a build
 * problem in the component layer.
 */
export default function NotFound() {
  const routes = [
    { href: '/services', label: 'Services', note: 'Both pillars, and the seam between them' },
    { href: '/services/devsecops', label: 'Secure SDLC', note: 'Why one firm does both' },
    { href: '/case-studies', label: 'Case studies', note: 'What the work actually produced' },
    { href: '/sample-report', label: 'Sample report', note: 'The document you would be buying' },
    { href: '/trust', label: 'Trust centre', note: 'Our own security posture' },
    { href: '/contact', label: 'Contact', note: 'Book a 60-minute scoping call' },
  ]

  return (
    <div
      className="theme-dark grain transition-theme"
      style={{ background: 'var(--bg)', color: 'var(--fg)', minHeight: '70vh', display: 'grid', alignItems: 'center' }}
    >
      <div className="u-container" style={{ paddingBlock: 'var(--s24)', position: 'relative', zIndex: 2 }}>
        <p className="u-eyebrow u-mono">404</p>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 6vw, 4rem)',
            marginTop: 'var(--s4)',
            maxWidth: '20ch',
          }}
        >
          That page does not exist.
        </h1>

        <p className="u-measure" style={{ color: 'var(--muted)', marginTop: 'var(--s6)' }}>
          Either the address is wrong or we moved something and failed to redirect it. The second
          is our fault, if you arrived from a link on this site, we would like to know:{' '}
          <a className="u-link" href={`mailto:${site.contact.email}?subject=Broken%20link`} style={{ color: 'var(--fg)' }}>
            {site.contact.email}
          </a>
          .
        </p>

        <div className="u-rule" style={{ marginBlock: 'var(--s12)' }} />

        <nav aria-label="Main sections">
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gap: 'var(--s2)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {routes.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  style={{
                    display: 'block',
                    padding: 'var(--s4)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'border-color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out)',
                  }}
                >
                  <span style={{ display: 'block', fontWeight: 500 }}>{r.label}</span>
                  <span style={{ display: 'block', color: 'var(--muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--s1)' }}>
                    {r.note}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p style={{ marginTop: 'var(--s12)', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
          Everything in one list: <Link className="u-link" href="/sitemap" style={{ color: 'var(--fg)' }}>site map</Link>.
          {' '}In an active incident?{' '}
          <a className="u-link u-mono" href={site.contact.irHotlineHref} style={{ color: 'var(--fg)' }}>
            {site.contact.irHotline}
          </a>
          {' '}— answered by a responder, 24/7.
        </p>
      </div>
    </div>
  )
}
