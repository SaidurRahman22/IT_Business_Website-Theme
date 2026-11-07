# Design research: competitor and reference sites

**Status:** living document. Add to it; do not rewrite history.
**Last updated:** 2026-11-07

Everything in here was **measured in a real browser** at 1440x900, not recalled
and not eyeballed from a screenshot. Colours are `getComputedStyle` values,
type sizes are computed pixel values, page heights are `scrollHeight`. Where a
number is an estimate it says so.

The point of the file is to stop the same argument happening twice. When
someone asks "should the service pages have a banner image?", the answer should
be a line in here with a site and a number attached, not a preference.

---

## How to use this

1. **Patterns to adopt** is the actionable list. Each entry says what it is,
   who does it, and what it would cost us.
2. **Anti-patterns** is equally important and gets skipped. Two of the three
   reference sites are commercially successful AND contain things that would
   actively damage Envenox's positioning. Copying a competitor wholesale copies
   their mistakes.
3. Envenox sells on **evidence and restraint**. A pattern that works for a
   volume outsourcing shop does not automatically work for a firm whose pitch
   is "we will tell you what we did not test". Every adoption note is written
   against that.

---

## Sites measured

| Site | What it is | Page measured | Height | Images |
|---|---|---|---|---|
| ambalait.com | Bangladesh software dev + IT consulting + cybersecurity. Closest peer to Envenox by service mix. | `/services/cybersecurity-companies` | 7,120px | 40 |
| ambalait.com | " | `/` (home) | 7,673px | 79 |
| sapphiresolutions.net | India/global outsourcing, 23 years, volume model | `/best-it-company-in-germany` | **17,452px** | **782** |

Plus the earlier sweep of 33 security and software homepages recorded in
`MEMORY.md` (2026-11-07, the redesign entry): Trail of Bits, Atredis,
Praetorian, Thoughtworks, Monterail, Bishop Fox, Doyensec, Netguru, STX Next
and others.

---

## 1. Ambala IT (ambalait.com)

The most useful reference of the three, because the service mix is almost
identical to Envenox's: software development, IT consulting, cybersecurity,
QA, ERP. They also use a **red accent on white**, which is the same colour
decision Envenox made independently.

### Measured design system

| Token | Value |
|---|---|
| Typeface | **Poppins** everywhere, weights 400 / 500 / 600 / 700 |
| Accent red | `#EC1E21` (also `#E63246`, `#D62F2F` in places, i.e. not strictly tokenised) |
| Ground | `#FFFFFF` |
| Alternate bands | `#F8F9FA`, `#F4F4F4` |
| Body text | `#666666` |
| Heading text | `#333333` |
| Muted text | `rgba(0,0,0,0.66)` |

### Measured type scale (service page)

| Element | Size | Weight | Line height |
|---|---|---|---|
| h1 | 22.4px | 600 | 26.9px |
| h2 | 22.4px | 600 | 26.9px |
| h3 | 16px | 600 | 19.2px |
| body | 16px | 400 | 24px |

**This scale is small and flat.** h1 and h2 are the same size, so the page has
no typographic hierarchy above "heading vs body". Envenox's scale
(`--text-3xl` 2.25rem down to `--text-xs` 0.75rem) is considerably stronger and
should not be flattened to match.

### Service page structure, in order

1. **Full-bleed banner band**, ~400px tall. A 1920x400 image (abstract red
   network mesh + a large shield silhouette) with the service name set large,
   white, centred over it. Immediately answers "what page am I on".
2. **Intro split.** Left: two paragraphs of prose plus a CTA button. Right: an
   illustration sitting on a soft blue blob.
3. **Capability card grid, 4 across.** Each card: a 50x50 line icon, a bold
   two-line title, a 3-4 line description. Cards are `#F8F9FA` on white, with
   generous internal padding.
4. **"Our Work Process".** A left column of steps (`STEP-01 Analysis`,
   `STEP-02 Planning`, `STEP-03 Execution`...) where the active step is a solid
   red pill, and a right panel showing that step's heading, prose and a
   photograph. It is a **vertical tab/stepper**, not a static list.
5. **Feature list + hero cut-out.** Left: icon + title + two-line description,
   stacked three deep. Right: a large cut-out figure with concentric arcs
   behind it.
6. **"Latest Article's"** — three blog cards with image tops.
7. FAQ accordion.

### What is genuinely good here

- The **banner band** gives every service page an identity in one glance, and
  costs one image.
- The **work-process stepper** is the strongest component on the site. It turns
  a list into something you read one item at a time, and it pairs each step
  with a picture.
- **Consistent card rhythm.** Every capability is the same shape, so the grid
  scans.

---

## 2. Sapphire Solutions (sapphiresolutions.net)

A volume outsourcing site. Useful for proof-pattern ideas; dangerous as a
layout model.

### Measured design system

| Token | Value |
|---|---|
| Typeface | **Poppins** again |
| Brand | `#005D89` (deep teal-blue), with `#005C9A` |
| Near-black | `#1D1D1F` |
| Pale tint bands | `#EEFBFF`, `#EBF9FF`, `#ECF4FF`, `#F2F7FC`, `#DBF1FF` |
| Body text | `#555555` |

### Measured type scale

| Element | Size | Weight |
|---|---|---|
| h1 | 34px | 800 |
| h2 | 24px | 700 |
| h3 | 18px | 600 |
| body | 15px | 400, 1.7 line height |

A much better hierarchy than Ambala's: 34 / 24 / 18 / 15 is a real scale.

### Proof patterns worth noting

- **Third-party review badges in a row**: Google (900+ reviews), Clutch (320+),
  GoodFirms (200+), each with a laurel wreath and star rating.
- **A big-number stat triple**: `23+ Years Experience`, `2800+ Satisfied
  Clients`, `1500+ Projects Completed`.
- **Client logo strip** on a deep teal band: Adani, American Express, Bayer,
  Vedanta, Larsen & Toubro, Chevron, LafargeHolcim, Almarai.
- **"Process We Follow"**: numbered cards `01`-`04`, each on its own pastel
  tint with a line icon, titles like "Requirement", "Designs, Wireframes &
  Prototype", "Prototype Demo", "Changes And...".

---

## 3. Patterns to adopt

Ranked by value to Envenox, with the real cost.

### A. A banner band at the top of every service page — HIGH VALUE

Both references do it. Envenox's service pages currently open with type on a
flat ground and give no visual signal of which service you are on.

**How to do it without the cliché:** the banner does not have to be a stock
hacker image. A tightly cropped, heavily toned photograph in the existing
`saturate(0.42)` treatment, or a continuation of the hero's network scene
rendered as a still, would carry the same navigational function.

**Cost:** one image per service, ~120-250KB as cropped webp. There are ~20
service pages, so this is a real content job, not a CSS change.

### B. A work-process stepper — HIGH VALUE

Ambala's is the best single component across both sites, and Envenox already
has the content for it: `lib/approach.ts` holds the five Adversary Loop stages
with `what[]`, `owns`, `artefact` and `failureIfSkipped` per stage. That is
richer than anything on either reference site and it is currently only rendered
as flat prose on `/approach`.

**Note the overlap:** the homepage already got a rail-and-return treatment of
the same five stages on 2026-11-07. A service-page stepper must not be a third
rendering of the same thing. Either reuse the homepage component, or make the
service-page version stage-specific (per service, not the global loop).

### C. Capability cards with icons — MEDIUM VALUE

Envenox's service pages list what is included as prose. A 3-up or 4-up card
grid with a lucide icon, a title and 3 lines scans far better.

**Caution:** the no-slop rule in this repo is explicit that not every block
should become a card. This earns it because the items are genuinely a repeated
content type.

### D. A stat triple — MEDIUM VALUE, and we already do it better

Both references use big round numbers. Envenox's existing `<Stat>` with a
`provenance` prop is a stronger version of the same idea, because it can say
where the number came from. Use ours; take only the idea of placing it high on
the page rather than near the footer.

### E. Third-party review badges — ALREADY PRESENT, under-used

`lib/proof.ts` already holds review badges split by pillar and they render on
the homepage. The service pages do not show them. Moving a relevant badge onto
each service page is close to free.

---

## 4. Anti-patterns: what NOT to copy

These are measured, not stylistic objections.

### The hoodie-and-Anonymous-mask imagery

Ambala's cybersecurity page uses a hooded figure holding a phone, and later a
hooded figure in a Guy Fawkes mask. This is the single most worn cliché in
security marketing. For a firm selling to CTOs who have seen it a thousand
times it reads as a stock purchase, not as expertise. **Do not.**

### Page length and image count

Sapphire's page is **17,452px tall with 782 images**. That is not a design
decision, it is an SEO landing page. Envenox's homepage was deliberately cut
from 7,210 words to 1,706 for exactly this reason. Do not reverse that.

### Un-tokenised accent colours

Ambala uses `#EC1E21`, `#E63246` and `#D62F2F` apparently interchangeably for
the same role. Envenox has `--accent-300/500/600` with measured contrast ratios
(6.15:1, 4.56:1, 7.45:1). Keep the discipline.

### Flat type hierarchy

Ambala's h1 and h2 are both 22.4px. Keep Envenox's scale.

### Chat widgets and popups

Both sites have a floating live-chat bubble; Sapphire fires a full-screen
contact modal over the content. Sapphire's modal obscured the page during
measurement, which is a fair indication of what it does to a reader. Envenox's
closing CTA names a specific next step instead, which is better.

---

## 5. What this means for the Envenox service pages

In rough priority order:

1. **Fix what is broken before adding anything.** As of this file's creation,
   `/services/devsecops` had its entire Secure SDLC pipeline diagram rendering
   at `opacity: 0` because of a CSS Modules keyframe-scoping bug, and the
   diagram caption escaped the page container. Nine other components across
   `product.module.css` and `delivery.module.css` were invisible for the same
   reason. See `scripts/check-animations.mjs`.
2. **Give each service page a banner band** (pattern A).
3. **Convert "what is included" prose to a capability grid** (pattern C).
4. **Surface the relevant review badge and a provenanced stat** high on the
   page (patterns D, E).
5. **Consider a per-service stepper** only after deciding how it differs from
   the homepage Adversary Loop rail (pattern B).

---

## 6. Open questions

- **Imagery source.** The homepage uses two licensed Unsplash photographs
  credited in the caption. Twenty service banners is a different scale of
  problem. Options: generated imagery (blocked while the Cloudflare token has
  no Workers AI scope and the HF quota is exhausted), more Unsplash, or a
  programmatic treatment derived from the hero's network scene. **Not yet
  decided.**
- **Does every service page need the same template?** There are bespoke pages
  (`devsecops`, `cybersecurity`, `software-development`, `engagement-models`)
  and ~16 generated from `[slug]`. A banner band is easy for the generated
  ones; the bespoke ones each need a judgement.

---

## 7. Applied status, measured 2026-11-07

Answering the obvious question: how much of the above is actually on the site?

### Measured state of the service pages, all 18, at 1440x900

| Fact | Value |
|---|---|
| Pages returning 200 | 18 / 18 |
| Horizontal overflow | 0 on every page |
| Console errors | 0 on every page |
| **Images in `<main>`** | **0 on every page** |
| Page height range | 12,021px (`vciso`) to **17,430px** (`managed-detection-response`) |

Two things fall out of that and both matter.

**The pages are entirely image-free.** Not "light on imagery": zero `<img>` in
the main content of all eighteen. Pattern A is not partially done, it is
absent.

**They are as long as the page this document calls an anti-pattern.**
`managed-detection-response` at 17,430px is taller than Sapphire's 17,452px SEO
landing page. The difference is that Sapphire fills that height with 782
images and Envenox fills it with text. Neither is good. The homepage was cut
from 7,210 words to 1,706 for exactly this reason and the service pages never
got the same treatment.

### What is already implemented, contrary to first assumption

Reading the template rather than the rendered page suggested most patterns were
missing. They are not. `app/services/[slug]/page.tsx` already renders 17
sections including:

- `IncludedGrid` — already a 3-up card grid (pattern C, minus the icons)
- `Credibility` — a provenanced stat (pattern D, stronger than either reference)
- a third-party reviews section (pattern E)
- client logos, a case study, certifications, team, stack, deliverables,
  outcomes, numbered methodology phases, FAQs

**The service template is richer than either reference site.** Its problems are
the opposite of what the references suggest: too much, too long, unillustrated,
not too little.

### Applied on 2026-11-07

- **Two-column service hero.** Everything in the hero stacked in one column and
  each item carried its own measure (h1 20ch, sub 54ch, stat 68ch), so the copy
  stopped at x=810 inside a container running to x=1320. Roughly 500px of every
  service hero was blank. The credibility stat now occupies its own 24rem
  column. Measured after: dead space on the right went from ~510px to 48px,
  which is the container gutter. Applies to the 14 `[slug]` pages; the 4
  bespoke pages (`devsecops`, `cybersecurity`, `software-development`,
  `engagement-models`) have their own heroes and were not touched.

### Not applied, and why

- **Pattern A, banner imagery.** Blocked on a decision, not on effort. ~16
  pages need an image each, and a single shared default would read as filler.
  Options are in §6.
- **Pattern C icons.** `IncludedGrid` has no icon slot and `Service` has one
  `icon` for the whole service, not per included item. Adding per-item icons
  means adding data, not just markup.
- **Length.** Nothing has been cut. This is the largest unaddressed problem and
  it is a content decision, not a CSS one.
