'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { site } from '@/lib/site'

/**
 * Route-level error boundary.
 *
 * Styled with raw tokens rather than the shared components, deliberately: if the
 * thing that threw was in the component layer, a boundary that imports from it
 * throws too and the user gets the framework's bare error page.
 *
 * It does not print the error message or the stack. A marketing site is not the
 * place to disclose internals, and a security firm leaking a stack trace on its
 * own site is a story. `digest` is shown because it is an opaque identifier that
 * makes a support conversation possible without disclosing anything.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Replace with the real reporter when one is configured. Keep it client-side
    // and keep it out of the rendered output.
    if (process.env.NODE_ENV !== 'production') console.error(error)
  }, [error])

  return (
    <div
      className="theme-dark grain transition-theme"
      style={{
        background: 'var(--bg)',
        color: 'var(--fg)',
        minHeight: '70vh',
        display: 'grid',
        alignItems: 'center',
      }}
    >
      <div className="u-container" style={{ paddingBlock: 'var(--s24)', position: 'relative', zIndex: 2 }}>
        <p className="u-eyebrow u-mono">Error</p>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginTop: 'var(--s4)', maxWidth: '22ch' }}>
          Something on our side failed.
        </h1>

        <p className="u-measure" style={{ color: 'var(--muted)', marginTop: 'var(--s6)' }}>
          Not your fault and not your problem to debug. Try again, if it persists, tell us and we
          will fix it rather than ask you to clear your cache.
        </p>

        {error.digest ? (
          <p className="u-mono" style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--s4)' }}>
            Reference: {error.digest}
          </p>
        ) : null}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--s3)', marginTop: 'var(--s8)' }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: 'var(--s3) var(--s6)',
              minHeight: 44,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-500)',
              color: '#fff',
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              transition: 'background-color var(--dur-base) var(--ease-out)',
            }}
          >
            Try again
          </button>

          <Link
            href="/"
            style={{
              padding: 'var(--s3) var(--s6)',
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-strong)',
              transition: 'border-color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out)',
            }}
          >
            Go to the homepage
          </Link>
        </div>

        <p style={{ marginTop: 'var(--s12)', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
          In an active incident, do not wait for this page to work —{' '}
          <a className="u-link u-mono" href={site.contact.irHotlineHref} style={{ color: 'var(--fg)' }}>
            {site.contact.irHotline}
          </a>
          , answered by a responder, 24/7.
        </p>
      </div>
    </div>
  )
}
