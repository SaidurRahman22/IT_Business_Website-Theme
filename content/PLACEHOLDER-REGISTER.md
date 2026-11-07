# Placeholder register

Every item here is **structurally correct and commercially unverified**. The site is built
around it so the machinery can be reviewed, but none of it may be published as fact.

`node scripts/check-placeholders.mjs` enumerates these from the source. Under
`NODE_ENV=production` it **exits 1**, so a production build cannot complete while any flag
remains. That guard matters more than any individual asset: without it the placeholder ships,
which is the entire reason the people placeholders are initials avatars rather than realistic
generated faces — a realistic face in a `headshot` field looks finished, so it survives review.

Current state: **51 flagged records, 0 forbidden strings.**

---

## 1. People — `lib/people.ts` · 9 records · `isPlaceholder: true`

Leadership and client-quote headshots must be **real photographs of real people** before
launch. Stock or generated faces on an About page is the fastest credibility loss available to
a firm selling trust, and a reverse image search takes ten seconds.

| Needed | Per person |
|---|---|
| Headshot | Real photograph, consistent lighting and crop across the set, min 1024×1024 |
| Name, role | As the person wants to be credited |
| Bio | ~50 words, written in their voice, not a résumé summary |
| Certifications | For every security lead — this is the proof a services buyer reads |
| LinkedIn | Real profile URL (currently a bare `linkedin.com/in/` stub) |

**To clear:** upload the photograph, set `headshot` to its path, set `isPlaceholder: false`.

Names currently in the file are invented. If the real leadership team differs, replace the
records rather than renaming them — the `slug` is referenced as `expert` by service pages and
as the author of case studies.

## 2. Headline stats — `lib/site.ts` · 4 records · `placeholder: true`

Each already carries a `source` and an `asOf` date, which is the part most sites omit. The
figures themselves are invented.

| Stat | Claimed | Source named | Must be |
|---|---|---|---|
| Engineers and testers | 38 | Internal headcount register | Reconciled to payroll on a stated date |
| Years operating | 11 | Companies House incorporation record | Checked against the real incorporation date |
| Engagements delivered | 240+ | Delivery system export | A real count with a stated cut-off |
| Net promoter score | 71 | Post-engagement survey, 94 responses | A real survey with a real response count |

**To clear:** confirm each figure against its stated source, correct the figure and the date,
remove `placeholder: true`.

Also unverified in this file: the **IR hotline number** (`+44 20 4525 9100`) and the
**switchboard**. The hotline is a hard launch blocker — it appears in the navigation on every
page as a `tel:` link and the site promises "answered by a responder, 24/7, median pickup
under 4 minutes". Either that staffing commitment is real or the claim comes off the site.

## 3. Case studies — `lib/case-studies.ts` · 6 records · `needsSignOff: true`

Each needs **written client approval for the metrics AND for the attributed quote**, separately.
Verbal approval from one stakeholder is not sign-off.

Per study, confirm: the three above-fold metrics and their measurement windows; the quote text,
the attributed name/role/company, and whether the client will be named at all; the
`anonymisedAs` descriptor if they will not; the engagement length and team shape; and whether
the technical-layer section discloses anything the client considers sensitive — that section is
the credibility of the page and also the most likely thing to be redacted.

Two studies (`healthtech-secure-sdlc`, `manufacturing-erp-replacement`, plus
`saas-cloud-identity-review`) are flagged `dualPillar: true`. At least one dual-pillar study is
a strategic requirement — not one case study in the entire competitor sample showed a client
buying both security and software, and that is this company's whole proposition.

## 4. Certifications, partners, clients, badges — `lib/proof.ts` · 30 records

### Certifications — the detail IS the proof
Every mark needs a **real certificate number and expiry date**. A certification logo with no
number is decoration; a number and an expiry is something a procurement reviewer can verify.
Currently every number is a `0000000` stub.

- ISO/IEC 27001:2022 — scope statement must match the actual certified scope
- ISO 9001:2015, SOC 2 Type II, Cyber Essentials Plus, CREST membership, PCI QSA

Any of these the company does not actually hold must be **deleted, not left flagged**. Claiming
an accreditation you do not hold is the one failure on this page that is not recoverable.

### Partner tiers
Six partner records. Each needs the real tier name and written permission to use the mark —
partner programmes are specific about tier wording and logo usage.

### Clients
Ten logo-only records with invented names. The client list must be **tiered by permission**:
named-and-quotable / logo-only / anonymised. An anonymised entry ("Enterprise FinTech, 2,000
employees") is still proof, which is why the tier exists.

### Review badges
Clutch and G2 (software side) and Gartner Peer Insights (security side) — a hybrid firm needs
both, and the scores and review counts must come from the live profiles. The profiles must
exist first.

---

## 5. Not flagged by the guard, but still owed

These are absences rather than placeholders, so the script cannot see them.

- **`/sample-report`** — a redacted real deliverable, 6–10 pages. The highest-leverage asset on
  the site and almost no competitor publishes one. If no real report can be redacted, write one
  for a fictional client and label it *"Sample report — illustrative"* on every page.
- **Hero fallback image** — must be designed first, as an image worth shipping on its own.
- **Motion clips** — 4–6 at 6–12s. Spec in `public/clips/README.md`. The stylised product-UI
  components are the source material: animate the component and screen-record it.
- **Service line visuals, industry heroes, case study covers, OG card** — generation prompts
  exist in `D:\project\task\IMAGE-GENERATION-PROMPTS.md`. Generate *after* the structure is
  built, in the batch order given there, using the shared house-style block so the set coheres.
  **Never generate text into an image** — composite titles and logos as real text in code.
- **Methodology PDFs and datasheets** — one per service page, linked from the methodology step.
- **Legal copy** — privacy notice, cookie policy + CMP config, terms, DPA template,
  sub-processor list, data-residency statement, and the **background-check policy for engineers
  who will touch client code**, which `/trust` promises is published rather than available on
  request.
- **`public/.well-known/pgp-key.txt`** — `security.txt` references it.
