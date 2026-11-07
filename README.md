# Envenox — envenox.com

Marketing site for **Envenox**, a firm with two practices: offensive security and
custom software engineering.

Built to the specification in `D:\project\task\MASTER-PROMPT.md`, whose motion system,
video component and hero mechanic are reverse-engineered from live production sites with
measured values, and whose page architecture is synthesised from thirteen verified
competitor sites.

> **The previous holding page is preserved at [`holding-page/`](holding-page/)** — the
> Cloudflare Workers static-assets site that was live at envenox.com. It was copied, verified
> byte-identical with `diff -rq`, and only then removed from the project root. Nothing was lost.

---

## Stack

| | |
|---|---|
| Framework | Next.js 15.5.4 (App Router), TypeScript, React Server Components by default |
| Styling | Tailwind CSS v4 with CSS custom properties for every design token |
| 3D | three.js **0.187.0, vanilla** — mounted inside a React component |
| Smooth scroll | **none** — native scroll only |
| Animation | CSS transitions + keyframes + IntersectionObserver. ONE `requestAnimationFrame` loop, hero only. No GSAP, no Framer Motion |
| UI primitives | Radix UI (tabs, accordion, dialog, navigation-menu) for keyboard + ARIA |
| Icons | `lucide-react` for UI, `simple-icons` for brand marks only |
| Fonts | `next/font`, self-hosted, zero layout shift |
| Content | Typed data in `lib/` — frontend only, no CMS |

### Why vanilla three.js rather than React Three Fiber

Measured, not preferred. R3F costs **~104 KB gzip beyond react + three** and defeats
three.js tree-shaking: its ESM build does `import * as THREE from 'three'` and calls
`extend(THREE)`, so classes the project never uses are verifiably present in the bundle.
`@react-three/fiber@9.8.2` also pins `react: ">=19 <19.4"`, which conflicts with this
project's React. The hero scene is one object, one material, one uniform — JSX's value is
composition and state, and neither exists here.

### Why no smooth-scroll library

The hero feels smooth because **the damping is in the render loop**, not because scroll is
virtualised. Lenis, Locomotive and friends hijack native scroll, break keyboard and
screen-reader scrolling, and carry real accessibility review cost. They are the change most
likely to generate a complaint from a customer trying to reach the login.

---

## Getting started

```bash
npm install          # already done; versions are pinned exactly
npm run dev          # http://localhost:3000
npm run check        # icons → placeholders → typecheck
npm run build        # runs `check` first, then next build
```

`npm run build` **will fail** right now, by design — see *Release gates* below.

---

## Layout

```
app/
  globals.css          the design system: tokens, themes, every keyframe
  layout.tsx           fonts, nav, footer, sitewide JSON-LD
  robots.ts            sitemap pointer, thank-you/campaign pages disallowed
  sitemap.ts           derived from lib/ data so routes cannot drift
components/
  ui/                  Button, Card, Section, Reveal, Stat, Marquee, Faq, Tabs, Badge, …
  nav/                 Nav (with the IR hotline), Footer
  hero/                the three.js "Attestation" scene + its fallback ladder
  product/             stylised SIEM / EDR / WAF consoles, built in DOM not captured
  diagram/             the animated secure-SDLC pipeline, SVG + stroke-dash
  motion/              MotionClip, ClipCarousel — three-state control, progress ring
lib/                   all content, typed. See "Content" below
scripts/               asset generation + the two release gates
content/               PLACEHOLDER-REGISTER.md
public/
  img/noise.png        the grain tile, generated — not committed by hand
  clips/README.md      the motion-clip production spec and ffmpeg commands
  .well-known/security.txt
holding-page/          the previous live site, preserved
```

### Content

| File | What |
|---|---|
| `lib/site.ts` | Company, both nav axes, footer, stats with `source` + `asOf`, IR hotline |
| `lib/services.ts` | 17 services + 2 join pages — intro, phases, deliverables, FAQs, cross-pillar links |
| `lib/homepage.ts` | Every homepage section's copy, with the voice rules at the top |
| `lib/approach.ts` | The Adversary Loop — the named methodology |
| `lib/case-studies.ts` | 6 studies, 3 metrics each above the fold, plus a technical-layer section |
| `lib/sample-report.ts` | `/sample-report` — the report, section by section |
| `lib/trust.ts` | `/trust` — our own posture, published rather than described on request |
| `lib/industries.ts` | 6 sectors: the regulation that bites, the failure modes, both pillars |
| `lib/resources.ts` | Resource types with verb-matched CTAs, plus service-topic explainers |
| `lib/proof.ts` | Certifications, partners, permission-tiered clients, testimonials, badges |
| `lib/people.ts` | Leadership. Every record is a placeholder; see below |
| `lib/contact.ts` | Three contact routes, the no-JS form schema, "what happens next" |
| `lib/legal.ts` | VDP and accessibility statement (publishable), privacy/cookies/terms (drafts) |

---

## The design system is a contract

`app/globals.css` is the single source of truth. **Nothing in this codebase may invent a
duration, an easing or a distance.**

```
easings     --ease-out (THE DEFAULT, ~60% of all motion)
            --ease-in-out · --ease-theme (palette only) · --ease-carousel (large slides only)
durations   --dur-micro .15s · --dur-base .3s (the house tempo) · --dur-scene .5s
distances   --d-tooltip 2px · --d-panel 5px · --d-content 10px · --d-entrance 32px
```

Four rules produce most of the perceived quality, and all four are free:

1. **Default to `--ease-out`.** Motion starts at full speed and decelerates. Almost nothing eases *in*.
2. **Default to `--dur-base`.** Nothing exceeds 0.6s except the hero, which is scroll-bound.
3. **Never animate a distance larger than 32px.** No 60px or 100px slide-ins. Ever.
4. **Never scale, lift or bounce a button on hover.** Hover is a colour shift. This rule is
   subtractive — you delete code to comply.

Three themes (`.theme-dark`, `.theme-light`, `.theme-deep`) cross-fade as sections scroll past.
**The dark theme is the security act; the light theme is the software craft act.** That movement
is the story of the two businesses, not decoration.

`--signal-critical` / `-high` / `-medium` / `-low` / `-info` are **semantic only**. They appear
inside product UI and severity labels and nowhere else — not in brand chrome, not in headings,
not in buttons. The moment red is decorative, there is no colour left to mean "danger".

### One contrast fix worth knowing about

The specified `--ink-500` (`#4A5468`) measures **3.0:1** against `--ink-900` and fails WCAG AA
for body text. Dark-theme `--muted` is therefore `#8A93A6`. `--ink-500` is kept as a token for
borders and non-text use.

### No security clichés

Verified absent from all ten leading security sites studied, and absent here: padlocks,
green-on-black terminals, hooded figures, world maps with arcing red attack lines, Matrix rain,
binary waterfalls, handshakes, glowing blue shields. This applies to vectors and illustrations
exactly as it applies to photographs. If a padlock appears in the hero, the design has failed.

---

## Release gates

Two scripts stand between this and production. Both are wired into `npm run build`.

### `npm run check:icons`

Reads the **installed** `lucide-react` from `node_modules` rather than any remembered list, so
it is correct for whatever version is pinned. Fails on an unresolved icon name and on
`import * as Icons from 'lucide-react'` (which ships all ~1,865 icons). `--suggest` prints the
nearest real names.

> ⚠ `ICON-INVENTORY.md`'s rename table describes a **newer** Lucide than this project pins.
> Against `lucide-react@0.544.0`, `shield-exclamation-point`, `circle-exclamation-point`,
> `triangle-exclamation-point`, `building-complex` and `fingerprint-pattern` **do not exist** —
> use `ShieldAlert`, `CircleAlert`, `TriangleAlert`, `Building2`, `Fingerprint`. This is exactly
> why the guard reads the package instead of the table.

### `npm run check:placeholders`

Enumerates every unverified content record and **exits 1 under `NODE_ENV=production`**.
Currently: **51 placeholder records**.

This guard matters more than any individual placeholder asset. Without it the placeholder
ships — which is the whole reason the people placeholders are initials avatars rather than
realistic generated faces. A realistic face in a `headshot` field looks finished, so it
survives review.

It also hard-fails on `lorem ipsum`, `99.9%`, `Threat A`-style generic naming, `AdobeStock_*`
filenames and unresolved `TODO: icon` comments.

**Launch blockers:** real headshots · real certificate numbers and expiry dates · written client
sign-off per case study, for the metrics *and* the quote · verified stats · a genuinely staffed
24/7 incident hotline number. Full detail in [`content/PLACEHOLDER-REGISTER.md`](content/PLACEHOLDER-REGISTER.md).

---

## Definition of done, per page

- [ ] Renders correctly with **JavaScript disabled** — content, nav, footer, forms, stats
- [ ] Renders correctly under **`prefers-reduced-motion: reduce`**, and looks deliberate
- [ ] Lighthouse ≥ 95 performance, ≥ 100 accessibility · axe-core reports zero violations
- [ ] Keyboard-only navigable end to end, with visible focus throughout
- [ ] Works at 320, 768, 1024, 1440 and 1920px with no horizontal scroll
- [ ] All animated values use **only** the tokens above · no animated distance exceeds 32px
- [ ] No hover state uses `transform` or `scale`
- [ ] Every image has meaningful alt text or `alt=""` · every stat is in the server-rendered HTML
- [ ] Every logo and certification mark has a readable text label beside it
- [ ] Structured data validates · both release gates pass
- [ ] Tested on a real mid-range Android and a real iPhone — not just a simulator

## Performance budget

| Metric | Target |
|---|---|
| LCP | < 2.0s on 4G — the hero fallback image is the LCP element |
| CLS | < 0.1 |
| INP | < 200ms |
| JS on the critical path | < 150 KB gzip — **three.js is not in it** |
| Above-fold page weight | < 600 KB |

The rule that matters most: **`import()` the hero module after first paint.** three.js must
never be in the critical path of an enterprise buyer's LCP. Budget it as *deferred 130 KB*, not
*130 KB on LCP* — that reframing is worth more than every other optimisation combined.

---

## Deployment

**Not configured, deliberately.** `wrangler.jsonc` still describes the old static holding page
and will not serve a Next.js application as-is. A Next.js app on Cloudflare needs OpenNext
(`@opennextjs/cloudflare`), or the project moves to a Node host. That decision has not been
made and should not be made by whoever notices this file first.

Nothing in this repository has been pushed to any remote.
