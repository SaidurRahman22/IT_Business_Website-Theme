import { ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/* =============================================================================
   THE ADVERSARY LOOP

   WHAT WAS WRONG WITH THE PREVIOUS VERSION
   The five steps were a <CardStack>: five sticky rounded boxes, each about
   260px tall, holding roughly forty words. Measured on the built page the band
   ran 1,848px for 200 words of copy, every card was a 1,180px box with its text
   confined to the left 600px, and the five numbers counted 01 to 05 in a
   straight line.

   That last part is the real failure. The section is called THE ADVERSARY LOOP
   and its own lede says "Threat models shape the build. The build gets
   attacked. The attack rewrites the threat model." It is a cycle: step 05 is
   the input to step 01. The old UI drew a list. A visitor who read only the
   picture learned the opposite of the thing the name promises.

   WHAT THIS IS INSTEAD
   A sticky heading beside a rail of five steps, with the return path to 01
   drawn at the bottom. Three things follow from that:

   - The rail IS the argument. A continuous line through five markers that
     closes back on itself is the shape of the claim, so the diagram and the
     copy now say the same thing.
   - Rows, not cards. Five boxes made five containers out of what is one
     sequence; hairline-separated rows let the rail run through them unbroken,
     and the band drops to roughly a third of its old height.
   - Two real columns, so the copy is not a narrow strip inside a wide box.

   THE MOTION IS SCROLL-DRIVEN AND COSTS NO JAVASCRIPT
   The rail fills and each step wakes as it enters the viewport, using native
   CSS scroll-driven animation (`animation-timeline: view()`). No GSAP, no
   ScrollTrigger, no IntersectionObserver, nothing added to the bundle. This
   project has no animation library and does not need one for this.

   The motion carries meaning rather than decorating: it is progress through a
   cycle, which is the one thing the section is about. It is not a fade applied
   to a section because the section was there.

   THE STATIC STATE IS THE COMPLETE STATE, AND THAT IS NOT A DETAIL
   `animation-timeline` is NOT Baseline. It ships in Chrome/Edge 115+ and
   Safari 26+, but in Firefox it is still behind
   `layout.css.scroll-driven-animations.enabled`, so a real share of visitors
   will never run it. Both the fallback and reduced motion therefore resolve to
   the SAME honest end state: rail fully drawn, every marker live, every step at
   full contrast. The scroll behaviour only ever takes that finished state and
   reveals it; it is never the only way to see it.

   This is why the dim/undrawn values live INSIDE
   `@media (prefers-reduced-motion: no-preference)` and `@supports`, and never
   in the base rules. Writing `opacity: 0` in the base and relying on an
   animation to undo it is the failure mode that leaves a Firefox visitor
   looking at an empty band.
   ============================================================================= */

const CSS = `
.aloop {
  display: grid;
  gap: var(--s12);
  /* DECLARED HERE, NOT ON .aloop__steps.
     The rail width is used by the step rows AND by the return row, and the
     return row is a SIBLING of the step list, not a descendant. Declared on
     the list it was simply undefined in .aloop__return, which made
     \`grid-template-columns: var(--aloop-rail) minmax(0, 1fr)\` invalid, so the
     browser dropped the whole declaration and the return row silently
     collapsed to one column: the marker stretched the full width and the text
     fell underneath it.
     Same failure as the --s10 bug in hero.module.css. An undefined custom
     property does not warn and does not fall back; it invalidates the
     declaration that references it. Declare the token at the common ancestor. */
  --aloop-rail: 2.25rem;
  /* How far the return bracket swings out to the LEFT of the rail. It has to
     stay inside the section's padding, and on a phone the rail is only
     ~18px from the edge of the column, so a desktop-sized swing would be
     clipped off the viewport. Narrow by default, wide once there is a second
     column and a gutter to swing into. */
  --aloop-bracket: 0.65rem;
}
@media (min-width: 64rem) {
  .aloop { --aloop-bracket: 1.75rem; }
}
@media (min-width: 64rem) {
  .aloop {
    grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
    gap: var(--s20);
    align-items: start;
  }
}

/* ---- the sticky side ----------------------------------------------------
   The heading holds while the steps move under it, so a reader never loses
   which process they are reading. Sticky only where there is a second column
   to hold still against; on narrow screens it is an ordinary block. */
.aloop__aside { min-width: 0; }
@media (min-width: 64rem) {
  .aloop__aside {
    position: sticky;
    /* Clears the fixed nav. --s12, not a bare number: the nav height is a
       token and this has to track it. */
    top: calc(var(--nav-h) + var(--s12));
  }
}

.aloop__title {
  margin: var(--s4) 0 0;
  font-size: var(--text-2xl);
  letter-spacing: var(--tracking-tight);
  text-wrap: balance;
}
@media (min-width: 48rem) {
  .aloop__title { font-size: var(--text-3xl); }
}

.aloop__lede {
  margin: var(--s6) 0 0;
  color: var(--muted-strong);
  line-height: 1.6;
  max-width: 38ch;
}

.aloop__cta { margin-top: var(--s8); }

/* ---- the rail -----------------------------------------------------------
   One continuous line behind every marker. The track is neutral and the fill
   is the accent, so "how far through the loop you are" is the only thing on
   this band spending the accent. */
.aloop__steps {
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
}

/* The track and the fill are the same geometry. Both start at the first marker
   and end at the last, NOT at the edges of the list, or the line would hang
   past the top and bottom markers like a dropped thread. */
.aloop__steps::before,
.aloop__steps::after {
  content: '';
  position: absolute;
  left: calc(var(--aloop-rail) / 2);
  top: var(--s6);
  bottom: var(--s6);
  width: 1px;
  transform: translateX(-0.5px);
}
.aloop__steps::before { background-color: var(--border-strong); }
.aloop__steps::after {
  background-color: var(--accent);
  transform-origin: top;
  /* FULLY DRAWN BY DEFAULT. Scroll-driven animation below takes it back to 0
     and draws it in, but only where that animation can actually run. */
}

.aloop__step {
  position: relative;
  display: grid;
  grid-template-columns: var(--aloop-rail) minmax(0, 1fr);
  gap: var(--s4);
  padding: var(--s6) 0;
}
.aloop__step + .aloop__step { border-top: 1px solid var(--border); }

/* The marker sits ON the rail, with a ring of the band's own background so the
   line appears to pass behind it rather than through it. */
.aloop__marker {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  padding-top: var(--s1);
}
.aloop__dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background-color: var(--accent);
  box-shadow: 0 0 0 5px var(--bg);
}

/* MUTED, not accent. The rail and its markers are already the accent on this
   band, and they are the thing that earns it: they carry progress and state,
   which is what the accent is reserved for. Making the step numbers accent as
   well put three red elements on every row and turned the section into the
   loudest thing on the page for no added meaning. */
.aloop__n {
  display: block;
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  letter-spacing: 0.16em;
  color: var(--muted);
}
.aloop__name {
  margin: var(--s2) 0 0;
  font-size: var(--text-xl);
  letter-spacing: var(--tracking-tight);
}
.aloop__body {
  margin: var(--s3) 0 0;
  color: var(--muted);
  line-height: 1.65;
  max-width: 60ch;
}

/* ---- the cycle bracket --------------------------------------------------
   THE LOOP, ACTUALLY DRAWN.

   The dashed segment below step 05 used to stop at the return marker and go
   nowhere, which left the band asserting a cycle while still drawing a line
   with two loose ends. This bracket is the missing edge: it leaves the rail at
   the return marker, runs up the outside of the whole list, and comes back in
   at the first marker. Top edge, left edge, bottom edge, no right edge, so it
   joins the rail at both ends instead of floating beside it.

   The geometry is tied to the same two anchors the markers use: "top" matches
   the centre of the first dot (list padding + half the dot) and "bottom"
   matches the centre of the return icon. Change the dot size or the row
   padding and these two values have to move with them.

   NOTE: this whole CSS block is a JS template literal, so a backtick in a
   comment here terminates the string and the file stops parsing. Quote
   property names with "..." in these notes, never with backticks. */
.aloop__cycle { position: relative; }
.aloop__cycle::before {
  content: '';
  position: absolute;
  left: calc(var(--aloop-rail) / 2 - var(--aloop-bracket));
  width: var(--aloop-bracket);
  top: calc(var(--s6) + 6px);
  bottom: 0.95rem;
  border: 1px dashed var(--accent);
  border-right: 0;
  border-radius: 8px 0 0 8px;
  /* 0.55, not 0.4, and 1.75rem wide rather than 0.8rem on desktop. At the
     first values this was a 13px dashed hairline at 40% on a near-black
     ground: present in the DOM and invisible on screen, which is the cost of
     the feature with none of the signal. */
  opacity: 0.55;
  pointer-events: none;
}

/* ---- the return ---------------------------------------------------------
   The whole point of the band. A dashed segment continues past the last
   marker and turns back, and the row says in words what the line says in
   shape. It is outside the <ol> because it is not a sixth step. */
.aloop__return {
  position: relative;
  display: grid;
  grid-template-columns: var(--aloop-rail) minmax(0, 1fr);
  gap: var(--s4);
  align-items: center;
  margin-top: calc(var(--s6) * -1);
  padding-top: var(--s12);
}
.aloop__return::before {
  content: '';
  position: absolute;
  left: calc(var(--aloop-rail) / 2);
  top: 0;
  height: calc(100% - 0.9rem);
  width: 1px;
  transform: translateX(-0.5px);
  /* Dashed, where the five steps are solid: this part of the loop is the
     return path, not another stage you work through. */
  background-image: linear-gradient(var(--accent) 50%, transparent 0);
  background-size: 1px 7px;
  background-repeat: repeat-y;
  opacity: 0.7;
}
.aloop__returnMark {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  color: var(--accent);
  background-color: var(--bg);
  padding-block: var(--s1);
}
.aloop__returnText {
  margin: 0;
  color: var(--muted-strong);
  font-size: var(--text-sm);
  line-height: 1.6;
  max-width: 52ch;
}
.aloop__returnText b {
  color: var(--fg);
  font-weight: 500;
}

/* ---- hover --------------------------------------------------------------
   Colour only. The contract forbids a transform, a scale or a shadow lift on
   hover, and a row of a process diagram has nothing to gain from moving. */
.aloop__step:hover .aloop__name { color: var(--accent); }
.aloop__name {
  transition: color var(--dur-micro) var(--ease-out);
}

/* =========================================================================
   SCROLL-DRIVEN STATE

   Everything above is the finished picture. Everything below takes it apart
   and lets the scroll put it back together, and ONLY where the browser can do
   that and the visitor has not asked for less motion.
   ========================================================================= */
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .aloop__steps::after {
      transform: translateX(-0.5px) scaleY(0);
      animation: aloopFill linear both;
      animation-timeline: view();
      /* Start filling once the list is properly on screen and finish before it
         leaves, so the line is never still crawling while the reader is
         already past the last step. */
      animation-range: entry 60% exit 20%;
    }

    .aloop__content,
    .aloop__returnRow {
      opacity: 0.4;
      animation: aloopWake linear both;
      animation-timeline: view();
      animation-range: entry 25% entry 85%;
    }

    /* Later than the text wake on purpose. At "entry 35%" the markers for 04
       and 05 were already full accent while the rail fill had only reached
       03, so the progress line and the markers were telling the reader two
       different things about where they were. Lighting a marker as the fill
       arrives keeps one answer on screen.
       The TEXT still wakes early (entry 25%): copy should be readable before
       it is "reached", because a reader scanning ahead is not doing anything
       wrong. Only the state indicators wait. */
    .aloop__dot {
      background-color: var(--border-strong);
      animation: aloopMark linear both;
      animation-timeline: view();
      animation-range: entry 65% entry 100%;
    }

    .aloop__returnMark {
      animation: aloopWake linear both;
      animation-timeline: view();
      animation-range: entry 25% entry 85%;
      opacity: 0.4;
    }
  }
}

@keyframes aloopFill {
  to { transform: translateX(-0.5px) scaleY(1); }
}
@keyframes aloopWake {
  to { opacity: 1; }
}
@keyframes aloopMark {
  to { background-color: var(--accent); }
}

@media print {
  .aloop__aside { position: static; }
  .aloop__steps::after { display: none; }
}
`

function Styles() {
  return (
    <style href="envenox-adversary-loop" precedence="default">
      {CSS}
    </style>
  )
}

export type LoopStep = { n: number; name: string; body: string }

export function AdversaryLoop({
  eyebrow,
  name,
  line,
  steps,
  returnPath,
  href,
  cta,
  headingId,
}: {
  eyebrow: string
  name: string
  line: string
  steps: readonly LoopStep[]
  /** The sentence for the return edge. Authored in lib/homepage.ts, like every
   *  other sentence on the page; the only strings written here are structural
   *  labels such as "05 returns to 01". */
  returnPath: string
  href: string
  cta: string
  headingId: string
}) {
  const total = String(steps.length).padStart(2, '0')
  const first = steps[0]

  return (
    <>
      <Styles />
      <div className="aloop">
        <div className="aloop__aside">
          <p className="u-eyebrow">{eyebrow}</p>
          <h2 id={headingId} className="aloop__title">
            {name}
          </h2>
          <p className="aloop__lede">{line}</p>
          <div className="aloop__cta">
            <Button
              href={href}
              variant="secondary"
              iconRight={
                <ArrowRight size={16} strokeWidth={1.75} absoluteStrokeWidth aria-hidden="true" />
              }
            >
              {cta}
            </Button>
          </div>
        </div>

        {/* The bracket that closes the cycle is drawn on this wrapper, because
            it has to span BOTH the step list and the return row. */}
        <div className="aloop__cycle">
          {/* A real <ol>. The order is the content, so it is carried by the
              element and not only by the printed numbers. */}
          <ol className="aloop__steps">
            {steps.map((step) => (
              <li className="aloop__step" key={step.n}>
                <span className="aloop__marker" aria-hidden="true">
                  <span className="aloop__dot" />
                </span>
                <div className="aloop__content">
                  <span className="aloop__n" aria-hidden="true">
                    {String(step.n).padStart(2, '0')} / {total}
                  </span>
                  <h3 className="aloop__name">{step.name}</h3>
                  <p className="aloop__body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Not a sixth step, so not inside the <ol>. It is the edge that
              turns the list into a loop, and it is stated in words as well as
              drawn, because a dashed line is not an argument on its own. */}
          <div className="aloop__return">
            <span className="aloop__returnMark" aria-hidden="true">
              <RotateCcw size={18} strokeWidth={1.75} absoluteStrokeWidth />
            </span>
            <p className="aloop__returnText aloop__returnRow">
              <b>
                {total} returns to 01, {first.name}.
              </b>{' '}
              {returnPath}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
