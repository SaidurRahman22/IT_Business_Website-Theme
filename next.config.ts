import type { NextConfig } from 'next'

/* ========================================================================== *
 * SECURITY HEADERS
 *
 * Every allowance below is traceable to something this repo actually loads.
 * Nothing is here "just in case". If you add a dependency that needs a new
 * origin, add it here deliberately — do not widen an existing directive.
 *
 * DO NOT copy holding-page/src/_headers forward wholesale. That policy was
 * written for a site with NO FORMS and sets `form-action 'none'`, which would
 * break all four form submissions on the no-JavaScript path — the exact
 * progressive-enhancement behaviour this codebase went out of its way to build.
 * Two directives differ from it on purpose: `form-action` and `img-src`.
 * ========================================================================== */

/**
 * `next dev` (webpack) builds modules with eval-based source maps, so the dev
 * server cannot run under a script-src without 'unsafe-eval'. Production has no
 * eval — not in Next's output, not in three.js r187, not in Radix. The branch
 * exists so the policy tested locally is otherwise identical to production.
 */
const isDev = process.env.NODE_ENV !== 'production'

/**
 * Cloudflare Web Analytics (RUM). When RUM is enabled on the zone, Cloudflare
 * injects <script src="https://static.cloudflareinsights.com/beacon.min.js">
 * at the edge AFTER Next has produced the response, so the app cannot nonce or
 * hash it. The beacon then POSTs to cloudflareinsights.com.
 *
 * These are the ONLY third-party origins in the whole policy, and the policy is
 * strictly better without them. They are here because the predecessor policy
 * allowed both, which is evidence RUM is on for this zone. IF RUM IS OFF,
 * DELETE BOTH CONSTANTS AND THEIR USES BELOW.
 */
const CF_BEACON_SCRIPT = 'https://static.cloudflareinsights.com'
const CF_BEACON_CONNECT = 'https://cloudflareinsights.com'

const CSP = [
  // Nothing is allowed unless named. Every fetch directive is stated
  // explicitly below, so this never actually fires — which makes 'none' free,
  // and catches any future CSP directive not enumerated here.
  "default-src 'none'",

  // 'unsafe-inline' is REQUIRED, and not because of anything in this codebase.
  // Next streams the RSC payload as inline <script>self.__next_f.push(...)</script>
  // whose content changes per render, so hashing is mathematically impossible
  // and adding any hash would additionally DISABLE 'unsafe-inline' per CSP3.
  // Removing it does not degrade the site, it stops it hydrating at all.
  //
  // The 7 <script type="application/ld+json"> blocks need NOTHING here: an
  // unrecognised script type returns at step 15 of the HTML spec's "prepare the
  // script element" algorithm, before the CSP check at step 23. A data block
  // never reaches script-src. The ONE author-written inline script this governs
  // is the `no-js` class remover in app/layout.tsx.
  `script-src 'self' 'unsafe-inline' ${CF_BEACON_SCRIPT}${isDev ? " 'unsafe-eval'" : ''}`,

  // 'unsafe-inline' is REQUIRED and must stay: 526 inline style= attributes
  // across 60 files. CSP honours nonces and hashes on <style> ELEMENTS and
  // <link rel=stylesheet> only — never on style= attributes. 'unsafe-hashes'
  // is not an option either, because the values are computed at runtime
  // (AvatarPlaceholder derives hsl() from a name, Marquee computes durations,
  // SeverityGauge computes angles), so the hash set is unbounded.
  "style-src 'self' 'unsafe-inline'",

  // /img/*.webp, /img/noise.png, /clips/*-poster.webp. No data:, no blob: —
  // the hero matcap is a programmatically drawn CanvasTexture, not an image
  // load. This is TIGHTER than the predecessor policy, which allowed data:.
  "img-src 'self'",

  // next/font self-hosts to /_next/static/media/*.woff2. No Google Fonts
  // origin is needed at runtime — the predecessor's fonts.gstatic.com is dead
  // weight and is deliberately dropped.
  "font-src 'self'",

  // <source> in components/motion/MotionClip.tsx -> /clips/*.webm, *.mp4
  "media-src 'self'",

  // Server Action fetch POSTs (the JS-on path) and RSC prefetch/navigation.
  `connect-src 'self' ${CF_BEACON_CONNECT}`,

  "object-src 'none'",
  "frame-src 'none'",
  "child-src 'none'",
  "worker-src 'none'",
  "manifest-src 'none'",

  // These three do NOT inherit from default-src and must be stated.
  "base-uri 'none'", // no <base> element exists anywhere in the app
  // 'self', NOT 'none'. React renders each Server Action as a real
  // <form method="POST" action="/contact">, and the footer posts to
  // /api/newsletter. 'none' breaks every form with JavaScript disabled.
  "form-action 'self'",
  "frame-ancestors 'none'",

  'upgrade-insecure-requests',
].join('; ')

/**
 * autoplay=(self) is REQUIRED: MotionClip calls video.play() without a user
 * gesture, so autoplay=() silently breaks every clip on the site.
 *
 * interest-cohort=() is deliberately NOT carried over from the predecessor
 * policy: FLoC was withdrawn in 2021, the token is now unrecognised, and it
 * logs a console warning on every page load — noise you do not want while
 * reading CSP reports. browsing-topics=() is its live replacement.
 */
const PERMISSIONS_POLICY = [
  'accelerometer=()',
  'autoplay=(self)',
  'browsing-topics=()',
  'camera=()',
  'display-capture=()',
  'encrypted-media=()',
  'fullscreen=(self)',
  'geolocation=()',
  'gyroscope=()',
  'idle-detection=()',
  'local-fonts=()',
  'magnetometer=()',
  'microphone=()',
  'midi=()',
  'payment=()',
  'publickey-credentials-get=()',
  'screen-wake-lock=()',
  'serial=()',
  'usb=()',
  'xr-spatial-tracking=()',
].join(', ')

/**
 * CSP ships REPORT-ONLY first. This site has never run under a policy, so
 * enforcing an untested one risks a silent, total hydration failure that looks
 * exactly like a broken deploy. Leave it in report-only for at least one week
 * and one full content deploy, work the verification list in
 * SECURITY-REMEDIATION.md, then change this one key to
 * 'Content-Security-Policy'.
 *
 * NO report-uri / report-to is set, on purpose. CSP reports carry the FULL
 * document URL, and a failed enquiry bounce still echoes the sender's name,
 * email and message in the query string (the vulnerability-report form no
 * longer does — see report-fields.ts). Pointing a collector at that would ship
 * personal data to a third party. Verify from the browser console instead; add
 * a FIRST-PARTY report route only after the enquiry echo is fixed too.
 */
const CSP_HEADER_KEY = 'Content-Security-Policy-Report-Only'

const SECURITY_HEADERS = [
  { key: CSP_HEADER_KEY, value: CSP },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Legacy belt-and-braces beside frame-ancestors, for pre-CSP2 browsers.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: PERMISSIONS_POLICY },
  // Severs window.opener. Verified zero window.open in the codebase.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Stops other sites loading our assets as no-cors subresources. TRADE-OFF: a
  // partner or press page hotlinking /img/* gets a blank image. Social unfurls
  // are unaffected (those fetch server-side; CORP is browser-only). If
  // hotlinking is wanted, add a /img/:path* rule with 'cross-origin'.
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  // COEP is deliberately omitted: require-corp buys nothing without
  // SharedArrayBuffer and would break any future third-party embed.
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // STATIC EXPORT. Every one of the 108 routes is prerendered, so they ship as
  // plain files served by Workers Assets with no Worker invocation at all.
  //
  // WHY: rendering app/page.tsx through the Next server in a Worker cost 205ms
  // of CPU and exceeded the Workers Free allowance, which killed the isolate and
  // then hung every subsequent request for ~55s. See MEMORY.md 2026-11-07.
  // Static files cost ~0 CPU and cannot wedge.
  //
  // CONSEQUENCES, all handled elsewhere:
  // - headers() and redirects() below are IGNORED under export. The headers are
  //   already duplicated in public/_headers; the redirects move to
  //   public/_redirects. Both are read by Workers Assets.
  // - unoptimized images: the /_next/image optimizer needs a server. There are
  //   zero next/image imports in this app, so this is inert, but it is required
  //   for the export to build.
  output: 'export',
  images: { formats: ['image/avif', 'image/webp'], unoptimized: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
      {
        // /api/newsletter 303-redirects with a status code in the URL. Nothing
        // here is cacheable and some of it is request-specific.
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },
  async redirects() {
    return [
      // PART 14 — redirect the obvious URL guesses
      { source: '/portfolio', destination: '/case-studies', permanent: true },
      { source: '/clients', destination: '/customers', permanent: true },
      { source: '/work', destination: '/case-studies', permanent: true },
      { source: '/pen-testing', destination: '/services/penetration-testing', permanent: true },
      { source: '/pentest', destination: '/services/penetration-testing', permanent: true },
      { source: '/team', destination: '/about/leadership', permanent: true },
      { source: '/security', destination: '/services/cybersecurity', permanent: true },
      { source: '/software', destination: '/services/software-development', permanent: true },
    ]
  },
}

export default nextConfig
