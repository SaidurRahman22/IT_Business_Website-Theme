export const dynamic = 'force-static'

import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'

/**
 * The default social card.
 *
 * Composed in code rather than generated as an image, so the wordmark and the
 * positioning line are REAL TEXT laid out by a text engine - not pixels an
 * image model guessed at. Text rendered into a generated image is the fastest
 * way to ship a card with a malformed letterform in the company name.
 *
 * The geometry echoes the hero's Attestation motif: plates seated into one
 * closed form. No padlock, no shield, no keyhole.
 *
 * Per-page cards can override this by adding their own `opengraph-image.tsx`.
 */

export const alt = `${site.name}, cybersecurity and software development`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INK_900 = '#0A0D13'
const INK_700 = '#1E2533'
const PAPER_50 = '#F7F5F1'
const ACCENT_300 = '#9AA5FF'
const ACCENT_500 = '#5B6CFF'
const MUTED = '#8A93A6'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: INK_900,
          color: PAPER_50,
          position: 'relative',
        }}
      >
        {/* The mark, bled off the right edge so it reads as a crop of something
            larger rather than as a logo dropped onto a rectangle. */}
        <svg
          width="760"
          height="760"
          viewBox="-1.2 -1.2 2.4 2.4"
          style={{ position: 'absolute', right: -210, top: -72, opacity: 0.92 }}
        >
          {/* Twenty faces of an icosahedral silhouette, drawn as seated plates.
              Values step down the palette so the faceting is legible at the
              small sizes a timeline actually renders this at. */}
          {[
            { d: 'M0 -1 L0.62 -0.5 L0 -0.18 Z', f: ACCENT_300, o: 0.95 },
            { d: 'M0 -1 L-0.62 -0.5 L0 -0.18 Z', f: ACCENT_300, o: 0.72 },
            { d: 'M0.62 -0.5 L0.95 0.12 L0.38 0.2 L0 -0.18 Z', f: ACCENT_500, o: 0.86 },
            { d: 'M-0.62 -0.5 L-0.95 0.12 L-0.38 0.2 L0 -0.18 Z', f: ACCENT_500, o: 0.6 },
            { d: 'M0.38 0.2 L0.58 0.86 L0 0.62 Z', f: ACCENT_500, o: 0.5 },
            { d: 'M-0.38 0.2 L-0.58 0.86 L0 0.62 Z', f: ACCENT_500, o: 0.36 },
            { d: 'M0 -0.18 L0.38 0.2 L0 0.62 L-0.38 0.2 Z', f: INK_700, o: 1 },
            { d: 'M0.95 0.12 L0.58 0.86 L0.38 0.2 Z', f: INK_700, o: 0.92 },
            { d: 'M-0.95 0.12 L-0.58 0.86 L-0.38 0.2 Z', f: INK_700, o: 0.8 },
            { d: 'M0.58 0.86 L0 1 L0 0.62 Z', f: INK_700, o: 0.66 },
            { d: 'M-0.58 0.86 L0 1 L0 0.62 Z', f: INK_700, o: 0.56 },
          ].map((p, i) => (
            <path key={i} d={p.d} fill={p.f} fillOpacity={p.o} />
          ))}
        </svg>

        {/* Copy layer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 72,
            width: 760,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                fontSize: 24,
                letterSpacing: 6,
                textTransform: 'uppercase',
                color: PAPER_50,
                fontWeight: 600,
              }}
            >
              {site.name}
            </div>

            <div
              style={{
                display: 'flex',
                marginTop: 14,
                fontSize: 17,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: MUTED,
              }}
            >
              Cybersecurity · Software development
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 60,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontWeight: 600,
            }}
          >
            {site.tagline}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', height: 1, background: INK_700, width: '100%' }} />
            <div style={{ display: 'flex', fontSize: 22, color: MUTED }}>
              {site.domain}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
