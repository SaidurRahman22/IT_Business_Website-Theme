# Security remediation plan

> **STATUS 2026-11-06 — P0, both P1s, and three of the four P2s are DONE and
> verified against a running production server. Remaining: the `style-src-elem`
> split (Phase 4, optional), the enquiry-form echo, the deployment model, and P4.**
>
> | Item | State | Proof |
> |---|---|---|
> | P0 framework + transitive deps | **done** | `npm audit` → `found 0 vulnerabilities`, from 35 advisories / 4 criticals |
> | P1 prototype-key slugs | **done** | 5 hostile slugs → HTTP 404; real slug → 200 |
> | P1 consent gate | **done** | header now inert: all 3 variants give an identical redirect |
> | P2 report-issue PII echo | **done** | bounce URL carries error codes + `credit` only |
> | P2 CSP + clickjacking | **done (Report-Only)** | 9 headers verified on the wire |
> | P2 `/styleguide` reachable | **done** | HTTP 404 in production build |
> | P3 newsletter CSRF | **done** | cross-origin 403 / same-origin 303 / no-Origin 303 |
> | P3 host-derived redirect | **done** | `Location` is now relative |
> | P3 FormData guards | **done** | all 3 actions |
> | P3 services validation gap | **done** | now uses the shared `validate()` |
> | P3 script path traversal | **done** | 4 hostile suffixes refused, benign accepted |
> | P3 `build:unchecked` gate | open | needs a pipeline decision |
> | deployment model | **open — needs your decision** | see P3 |
> | P4 cosmetic | open | |
>
> **Correction to the audit below:** there are **8** `dangerouslySetInnerHTML`
> sinks, not 9. The 9th grep hit is prose inside a comment in
> `components/product/WafTrafficPanel.tsx:381`.
>
> **Correction to P0 below:** `npm audit`'s claim that `next@15.5.29` fixes
> postcss and sharp is **wrong**, verified by dry-run lockfile. `next@15.5.29`
> still pins `postcss` to exactly `8.4.31`, and sharp stays at 0.34.5 because
> `^0.34.3` is satisfied. Two `overrides` were required. The AVIF/SVG RCEs are
> only truly closed by **sharp ≥ 0.35.5** — and Next 15.5.25+ silently refuses
> AVIF when sharp is older, so the override is what makes AVIF both safe *and*
> functional.

Audit date: 2026-11-06. Scope: full frontend — `app/`, `components/`, `lib/`, `scripts/`,
`public/`, `next.config.ts`, `wrangler.jsonc`.

Method: `npm audit` for live advisories; manual trace-to-sink for every injection and
redirect surface; an offline license pass; and four independent specialist reviews run
without being told the first audit's conclusions, so corroboration means something.

Severity here is **reachability-weighted**, not CVSS-sorted. A 10.0 that no deployed
route touches ranks below a 7.0 that every visitor hits.

---

## P0 — Framework: 4 critical RCEs, one directly reachable from this config

`next@15.5.4` carries **35 advisories**. Four are critical. The decisive one for this
codebase:

| Advisory | Sev | Fixed in | Why it is reachable HERE |
|---|---|---|---|
| [GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4) | critical | 15.5.24 | Unauth RCE in Image Optimization via **AVIF** — `next.config.ts:6` sets `formats: ['image/avif','image/webp']` |
| [GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw) | critical | >15.5.27 | Same, via SVG |
| [GHSA-9qr9-h5gf-34mp](https://github.com/advisories/GHSA-9qr9-h5gf-34mp) | **10.0** | 15.5.7 | RCE in React Flight protocol — RSC is the default renderer |
| [GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36) | 9.0 | 15.5.24 | Unauth RCE on Windows-hosted servers |
| [GHSA-w37m-7fhw-fmv9](https://github.com/advisories/GHSA-w37m-7fhw-fmv9) | 5.3 | 15.5.8 | Server Actions source exposure — 3 actions exist |
| [GHSA-955p-x3mx-jcvp](https://github.com/advisories/GHSA-955p-x3mx-jcvp) | mod | 15.5.21 | Unauth disclosure of Server Function endpoints |

Transitively vulnerable via Next: `postcss` (build-time path traversal / arbitrary `.map`
read) and `sharp` (libvips, libheif, librsvg CVEs).

No `middleware.ts` exists, so the eight middleware-bypass advisories do **not** apply.

**Action.** Bump the exact pin in `package.json` to the latest 15.5.x and regenerate the
lockfile. `npm audit fix --force` refuses on its own because the pin is exact.
**Sequence matters: upgrade before adding CSP** — [GHSA-ffhc-5mcf-pf4q](https://github.com/advisories/GHSA-ffhc-5mcf-pf4q)
is an XSS *in nonce-based CSP* on the current version.

Rollback: `package.json`, `package-lock.json` and `next.config.ts` are snapshotted outside
the repo before the bump.

---

## P1 — Prototype-key slugs bypass the not-found guard on two routes

**Verified by execution, not inference:**

```
peopleBySlug["constructor"] => function  | passes `if (!person)` guard: true
peopleBySlug["toString"]    => function  | passes `if (!person)` guard: true
peopleBySlug["__proto__"]   => object    | passes `if (!person)` guard: true
```

All seven lookup tables are built with `Object.fromEntries`, so each inherits from
`Object.prototype`. A request for `/about/leadership/constructor` resolves `person` to the
`Object` constructor — truthy — so `if (!person) notFound()` never fires. `generateMetadata`
then renders `undefined — undefined` into `<title>`, OG and canonical; the body dereferences
record fields on a function object.

Blast radius is **exactly two routes**, because 9 of 11 `[slug]` routes set
`dynamicParams = false` and get Next's framework 404 first:

| Route | `dynamicParams` |
|---|---|
| `app/about/leadership/[slug]` | **ABSENT** |
| `app/industries/[slug]` | **ABSENT** |
| the other 9 | `false` |

Impact: unauthenticated 500s, error-log noise, and a malformed canonical/OG URL that a CDN
can cache.

**Action, both layers:**
1. Add `export const dynamicParams = false` to the two routes — closes it immediately.
2. Give all seven lookup tables a null prototype so the weakness cannot return the next time
   someone adds a route and forgets the flag. Defence in depth, because layer 1 is one
   forgotten line away from regressing.

---

## P1 — The newsletter consent gate fails open

`app/api/newsletter/route.ts:56`:

```ts
if (request.headers.get('x-requires-consent') === 'true' && !consent)
```

Consent is only checked when **the caller asks for it to be checked**. The real footer form
(`components/nav/Footer.tsx:306-324`) posts `email` and `source` only — no `consent` field,
and a form cannot set a header — so consent is never enforced from the actual UI.

Harmless today: the route persists nothing. It becomes a compliance breach the moment the
double-opt-in wiring the file's own comment promises is added, and `lib/legal.ts` states the
lawful basis for this processing **is** consent.

**Action.** Decide consent server-side from the payload. Delete the header condition.

---

## P2 — Submitted PII is echoed into the URL, including vulnerability reports

`failureQuery` (`app/contact/_shared/validate.ts`) echoes every submitted value back as
`f_<name>` query params on validation failure. For `/report-issue` that is `name`, `email`,
`target`, and **two textareas** (`summary`, `impact`).

Consequences:
- Vulnerability-report text lands in browser history, CDN and proxy access logs, and
  analytics page URLs, and is visible in the same-origin `Referer`.
- A 2000-character non-ASCII message URL-encodes to ~6 KB+; the `Location` header can then
  exceed edge/proxy header limits and the user gets a 4xx/5xx instead of their error page.

**Action.** Exclude `textarea` fields from the echo. At minimum on `/report-issue`, where the
content is by definition sensitive. Error *codes* can keep travelling in the URL — they are
schema-validated on the way back in and carry no PII.

---

## P2 — No Content-Security-Policy, no clickjacking defence

`next.config.ts` sets four headers and omits CSP, `X-Frame-Options`, `frame-ancestors`,
`base-uri` and `form-action`. **Clickjacking is unmitigated.**

The predecessor static site has a strict policy at `holding-page/src/_headers`
(`default-src 'none'`, `frame-ancestors 'none'`, `form-action 'none'`). It was lost in the
rebuild, not consciously dropped.

**Action.** Restore an equivalent policy, after the P0 upgrade. Must permit: 8 inline
JSON-LD blocks, 1 inline classic script in `app/layout.tsx`, self-hosted `next/font`,
bundled three.js, and inline `style=` attributes.

---

## P2 — `/styleguide` is publicly reachable in production

`app/styleguide/page.tsx` carries only `robots: { index: false }` — a request to crawlers,
not an access control. `app/robots.ts` disallows just `/thank-you/`, `/campaigns/`, `/api/`.
Anyone requesting the path gets the full internal token and component reference.

**Action.** Gate on `NODE_ENV`, or exclude the route at build time. `/sample-report` is
deliberately public and carries a disclaimer — leave it.

---

## P3 — Hardening, no live exploit today

- **Newsletter CSRF + host-derived redirect.** Route handlers get no implicit Origin check
  (Server Actions do). Any third-party page can cross-site POST. Separately,
  `new URL('/thank-you', request.nextUrl.origin)` derives the origin from the incoming Host —
  behind Cloudflare that can resolve to a `workers.dev` or internal host. Use `site.url` or a
  relative `Location`. Add a rate limit *with* the delivery wiring, not after.
- **Server Actions accept non-FormData bodies.** `(form: FormData)` is a compile-time
  contract only. Action IDs are in the page HTML; a crafted `Next-Action` POST makes
  `form.get` throw → 500. Add an `instanceof FormData` guard to all three.
- **`build:unchecked` bypasses the placeholder gate.** 51 unsigned-off records
  (`isPlaceholder`, `needsSignOff`, placeholder hotline) publish as indexable URLs and into
  sitewide JSON-LD. The only protection is `check-placeholders.mjs` wired into `npm run build`.
  A deploy pipeline calling `next build` directly ships them. This is the real draft-content
  leak vector.
- **Deployment config is broken.** `wrangler.jsonc:9` points `assets.directory` at `./src`,
  which does not exist — holding-page residue. Static assets are also incompatible with
  `'use server'`, and on an assets deploy `next.config.ts` headers do not apply at all, so even
  the four current headers vanish. **Needs a decision on the deployment model before it can be
  fixed.**

---

## P4 — Cosmetic

- `app/page.tsx:1189` is `rel="noopener nofollow"`; the other six external links add
  `noreferrer`. `Referrer-Policy` already caps the leak at origin, so this is consistency.
- `package.json` has no `license` field. `"private": true` makes it harmless; `"UNLICENSED"`
  states intent and quiets tooling.
- `components/nav/Nav.tsx:10` imports the whole `site` object into a client component for ~5
  properties. Bundle weight today; a leak-by-accident precedent if `site` ever gains a
  non-public field.

---

## Checked and genuinely clean

Traced to the sink, not skimmed — and independently corroborated by a reviewer that was not
told these conclusions:

- **All 9 `dangerouslySetInnerHTML` sites.** Eight are JSON-LD escaped with
  `.replace(/</g,'\\u003c')`, which closes the `</script>` breakout; the ninth is a static
  constant. Every input is a static `lib/*.ts` literal. No dynamic param reaches a script tag.
- **No open redirect.** `ENQUIRY_RETURNS` is an exact-match allowlist;
  `^/services(/[A-Za-z0-9-]+){0,2}/?$` rules out protocol-relative `//evil.com` and CRLF.
- **No reflected XSS.** `decodeErrors` allowlists field names *and* error codes against the
  schema; `decodeValues` allowlists select options and re-caps length; values render through
  `defaultValue={}`, which React escapes.
- **No swallowed `NEXT_REDIRECT`** — no `redirect()` sits inside a try/catch.
- **Server/client boundary.** No secrets, no server-only imports, no `process.env` beyond
  `NODE_ENV` in any of the 14 client components.
- **Hydration.** `HeroStory` and `Reveal` write DOM attributes in effects only, never in JSX,
  so React cannot reconcile them away. `suppressHydrationWarning` on `<html>` is justified and
  scoped to that element's own attributes.
- **Zero** `localStorage`, `document.cookie`, `postMessage`, `eval`, `new Function`, or
  third-party `fetch`.
- **Secret hygiene.** `.gitignore` covers `.env*`, `.dev.vars`, `.secrets/`; no env files on
  disk; `security.txt` present, well-formed, and honest about the absent PGP key.
- **Licensing.** Every direct dependency is MIT, ISC or CC0-1.0. An automated checker flagged
  `simple-icons` as "Unknown/CRITICAL"; it is CC0-1.0 and the finding is a parser artifact.
  Note that CC0 waives copyright, **not trademark** — the Cloudflare mark labelled
  "Services Partner" is a factual claim, and belongs with the placeholder sign-off, not here.

---

## Order of work

1. **P0 upgrade first**, alone, then re-run all four gates. It is the largest change and the
   only one that moves the dependency tree; everything else is easier to attribute afterwards.
2. **P1 prototype keys** — two flags plus seven hardened tables.
3. **P1 consent gate** — delete the header condition.
4. **P2 PII echo** — drop textareas from the echo.
5. **P2 CSP** — Report-Only first, verify in-browser, then enforce.
6. **P2 `/styleguide` gate.**
7. **P3 hardening**, except the deployment model, which needs a decision first.
8. **P4.**

Gates after every step: `tsc --noEmit`, `check:icons`, `check:motion`, `check:placeholders`.
