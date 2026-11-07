import type { Metadata, Viewport } from 'next'
import { Inter, Inter_Tight, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { site } from '@/lib/site'
import { Nav } from '@/components/nav/Nav'
import { Footer } from '@/components/nav/Footer'
import { ScrollReset } from '@/components/nav/ScrollReset'
import './globals.css'

/* ========================================================================== *
 * FONTS - self-hosted by next/font at build time. No runtime request to
 * Google, no render-blocking stylesheet, no layout shift beyond the swap.
 *
 *   Inter Tight  headings
 *   Inter        body
 *   Instrument   the ChapterOpener ration - AT MOST 3 USES SITEWIDE
 *   JetBrains    IDs, timestamps, CVEs, certificate numbers. Nothing else.
 * ========================================================================== */

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-inter',
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-inter-tight',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-instrument-serif',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

/* ========================================================================== *
 * METADATA
 * ========================================================================== */

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}, ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.boilerplate.slice(0, 300),
  applicationName: site.name,
  alternates: { canonical: '/' },
  keywords: [
    'penetration testing',
    'application security',
    'managed detection and response',
    'secure software development',
    'custom software development',
    'ISO 27001',
    'SOC 2',
    'DORA',
    'NIS2',
  ],
  authors: [{ name: site.legalName, url: site.url }],
  creator: site.legalName,
  publisher: site.legalName,
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name}, ${site.tagline}`,
    description: site.positioning,
    url: site.url,
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name}, ${site.tagline}`,
    description: site.positioning,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: { telephone: true, email: true, address: false },
}

/**
 * The ONE hex literal outside AvatarPlaceholder's computed hsl, and a
 * deliberate, reported exception.
 *
 * <meta name="theme-color"> is read by the browser's own UI chrome, not by the
 * page, so `var(--ink-900)` does not resolve there - the value has to be a
 * literal. Dropping it instead would leave a white status bar above a near-black
 * page on iOS. This mirrors --ink-900 in globals.css; if that token ever
 * changes, change this with it. There is no theme-color per colour-scheme
 * because the site's themes are per-section, not per-OS-preference: every page
 * opens on .theme-dark regardless of what the OS prefers.
 */
const THEME_COLOR_INK_900 = '#0a0d13'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: THEME_COLOR_INK_900,
}

/* ========================================================================== *
 * JSON-LD - Organization + WebSite, sitewide.
 * ========================================================================== */

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${site.url}/#organization`,
      name: site.name,
      legalName: site.legalName,
      url: site.url,
      description: site.boilerplate,
      slogan: site.tagline,
      email: site.contact.email,
      telephone: site.contact.switchboard,
      sameAs: [site.social.linkedin, site.social.github, site.social.x],
      address: site.offices.map((office) => ({
        '@type': 'PostalAddress',
        streetAddress: office.line,
        addressLocality: office.city,
        addressCountry: office.country,
      })),
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'emergency',
          name: 'Incident response hotline',
          telephone: site.contact.irHotline,
          availableLanguage: ['en'],
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '00:00',
            closes: '23:59',
          },
        },
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: site.contact.email,
          telephone: site.contact.switchboard,
          availableLanguage: ['en'],
        },
        {
          '@type': 'ContactPoint',
          contactType: 'security',
          email: site.contact.securityEmail,
          availableLanguage: ['en'],
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.positioning,
      inLanguage: 'en-GB',
      publisher: { '@id': `${site.url}/#organization` },
    },
  ],
}

/**
 * Removes `no-js` from <html>.
 *
 * globals.css parks every `[data-reveal]` at opacity 0 and relies on
 * `.no-js [data-reveal]` to put it back when scripting is unavailable. The
 * class therefore has to be REMOVED by script rather than added, and it has to
 * happen in <head> before first paint - adding it later would flash the whole
 * page in and out. The same class drives the no-JS fallbacks in Nav, Tabs and
 * Faq, so this one line is load-bearing for the entire progressive-enhancement
 * story. If scripting is off, it simply never runs.
 */
const NO_JS_SCRIPT = `document.documentElement.classList.remove('no-js')`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [inter.variable, interTight.variable, instrumentSerif.variable, jetbrainsMono.variable].join(' ')

  return (
    <html lang="en" className={`no-js theme-dark ${fontVars}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_JS_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      </head>
      <body>
        {/* Puts every client-side navigation back at the top of the page.
            Without it a link clicked from halfway down one page lands halfway
            down the next; see the measurements in ScrollReset.tsx. It renders
            nothing and leaves back/forward restoration and #hash targets
            alone. */}
        <ScrollReset />
        <a className="u-skip" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
