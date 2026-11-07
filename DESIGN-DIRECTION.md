# Design direction — Envenox

Written before implementation, deliberately. The previous pass coded first and the
direction was only implicit in a token table, which is how it ended up cold, generic
and off-message.

---

## 1. The correction

The site was built **cybersecurity-first**. That was wrong. Envenox is a
**software engineering firm** whose differentiator is that it has an in-house
offensive security practice. Security is the *proof*, not the product.

| | Before | Now |
|---|---|---|
| Lead | Cybersecurity | **Software engineering** |
| Security's role | The product | The differentiator that makes the build trustworthy |
| First nav item | Services → Cybersecurity | **Work / What we build** |
| Homepage opening | "We build it and we break it" (security framing) | The build, then the proof |
| Dark theme | "the security act" | the **ground**; light is where the craft is shown |

The sentence that should survive: *we are engineers who ship production systems, and
we keep our own adversaries on staff so the thing we hand you has already been attacked.*

## 2. Visual thesis

**A forge.** Warm, dark, worked metal; one hot light in the dark; things made by hand
and finished properly. Not a lab, not a SOC, not a dashboard.

This is chosen against the category. Developer-facing brands are overwhelmingly cold —
blue-black grounds with indigo or violet accents. Warm charcoal with molten copper is
immediately distinguishable and it carries the right connotation for a firm whose claim
is craft.

## 3. Colour — "Forge"

```
GROUND     #14110F   warm near-black. NOT blue-black. The brown in it is the point.
DEEP       #1F1A16   elevated warm surface
BORDER     #2E2721   warm hairline
PAPER      #F5F1E8   warm bone, the light act
PAPER-2    #E9E2D4   elevated paper
COPPER     #E8833A   the one warm light. Accent, links, focus, primary action.
COPPER-DK  #B85E22   hover / light-theme accent (contrast)
COPPER-LT  #F2A86B   accent on dark grounds
```

**One accent.** Copper is the only brand colour. There is no secondary brand hue.
A section is dark or it is paper; the copper is what moves between them.

### Semantic colours move out of copper's way
Severity now has to be legible *beside* a warm orange brand accent, so the ramp shifts
to maximise hue separation: critical stays red, high becomes a redder orange, medium
becomes a true yellow rather than amber, low green, info blue. These appear **only**
inside product consoles and severity labels — never in brand chrome.

## 4. Typography

```
DISPLAY   Instrument Serif    the narrative voice
UI/BODY   Inter / Inter Tight the working voice
MONO      JetBrains Mono      identifiers, timestamps, code, certificate numbers
```

**The serif ration changes.** It was capped at 3 uses sitewide, which is why the site
read as flat: the one typographic gesture with any character appeared three times on
~84 pages. It is now the **display face for narrative openers** — the hero, section
chapter-openers on the story pages, and pull quotes. Still never for UI, labels, nav,
buttons or body.

The hero mixes both faces in one line. A serif phrase inside a sans headline is the
oldest editorial move there is and it is the cheapest elegance available.

## 5. The hero — typographic scroll-story

**No 3D in the hero.** The previous hero spent the entire motion budget on an abstract
icosahedron that rendered as a dark sphere and said "integrity" — a security idea, told
abstractly, at the exact moment a visitor is deciding what this company does.

The hero is now **the story, told in type**, across three scroll beats:

```
BEAT 1    We build the software.
BEAT 2    Then we try to break it.
BEAT 3    Before anyone else gets the chance.
```

- Words reveal with a restrained stagger, driven by scroll position.
- Behind: warm grain over a slow copper gradient drift. Cheap, atmospheric, never the subject.
- **The LCP element is text.** It is in the HTML, it needs no JavaScript, and it is
  readable before anything executes.
- Under `prefers-reduced-motion`, all three beats render at once, resolved.

3D is not deleted — it is **relocated and earned**. One WebGL moment deeper in the page,
where the argument needs it, rather than as decoration above the fold.

## 6. Motion narrative

Native scroll stays. GSAP-style scrubbed choreography does not require a scroll
hijacker, and Lenis/Locomotive break keyboard and screen-reader scrolling for a
marginal aesthetic gain.

| Moment | Treatment |
|---|---|
| Hero | scroll-scrubbed word reveal, 3 beats |
| Section entry | word-by-word on the opener, then content with a 60ms stagger capped at 5 |
| Dark → paper | the palette cross-fade, 0.5s, the site's signature transition |
| Numbers | server-rendered, then counted *from* the value |
| The one WebGL moment | pinned, scrubbed, disposable, static poster fallback |

Everything still obeys the token vocabulary: `--ease-out` by default, `--dur-base` as the
house tempo, nothing animated further than 32px, no hover transforms.

## 7. What this direction forbids

- Indigo, violet, or electric blue anywhere.
- A second brand accent.
- Gradient blobs, ornamental bento grids, glass on everything.
- Abstract 3D above the fold.
- The serif in UI chrome.
- Security framing in the opening move.
- Any claim of awards or recognition.
