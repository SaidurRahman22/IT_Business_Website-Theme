import type { ReactNode } from 'react'

/**
 * Scroll-narrative primitives.
 *
 * Taken from a sweep of ~35 award-tier sites (see the reference notes in the
 * task folder). The three techniques below were singled out there as the
 * highest ratio of perceived quality to engineering cost, and all three are
 * **pure CSS** - no scroll library, no JavaScript, nothing to degrade.
 *
 *   "Equal-offset sticky siblings give you a card stack with zero JavaScript."
 *   "Sticky section headings and a reveal-from-under footer cost nothing and
 *    read as expensive."
 *   "Numbered chapters, one named pin per chapter, one idea per pin."
 *
 * The discipline that matters more than any of them: the top tier spends its
 * entire motion budget on a SINGLE pinned stage and treats everything else as
 * ordinary typesetting. These primitives are the "everything else".
 */

const CSS = `
/* ---- Chapter ------------------------------------------------------------
   A numbered chapter with a heading that HOLDS while its body scrolls under
   it. The number is not decoration: it tells a reader where they are in a long
   page, which is the thing a long page actually owes them. */
.ch {
  position: relative;
  display: grid;
  gap: var(--s8);
}
@media (min-width: 1024px) {
  .ch {
    grid-template-columns: minmax(0, 18rem) minmax(0, 1fr);
    gap: var(--s16);
    align-items: start;
  }
}

.ch__head {
  position: relative;
}
@media (min-width: 1024px) {
  .ch__head {
    position: sticky;
    /* Clears the fixed 72px nav plus breathing room. */
    top: calc(var(--nav-h) + var(--s8));
  }
}

.ch__num {
  display: block;
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: var(--text-xs);
  letter-spacing: 0.18em;
  color: var(--accent);
  margin-bottom: var(--s3);
}

.ch__title {
  margin: 0;
  font-size: clamp(1.75rem, 3.4vw, var(--text-4xl));
  letter-spacing: var(--tracking-tight);
  text-wrap: balance;
}

.ch__lede {
  margin: var(--s4) 0 0;
  color: var(--muted);
  font-size: var(--text-base);
  line-height: 1.6;
  max-width: 34ch;
}

.ch__rule {
  margin-top: var(--s6);
  height: 1px;
  background: linear-gradient(90deg, var(--accent), transparent);
}

.ch__body {
  min-width: 0;
  display: grid;
  gap: var(--s12);
}

/* ---- Sticky card stack --------------------------------------------------
   Every card is sticky at the SAME offset, so each comes to rest on the one
   before it and the stack assembles itself as you scroll. The entire effect is
   the equal \`top\` value. There is no JavaScript here at all.

   Each card needs its own opaque background or the stack reads as a smear;
   that is the one thing people get wrong when copying this. */
.stack {
  display: grid;
  gap: var(--s8);
}
.stack__card {
  position: sticky;
  top: calc(var(--nav-h) + var(--s8));
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--s8);
  /* A hairline of the ground above each card so stacked edges stay readable. */
  box-shadow: 0 -1px 0 0 var(--bg);
}
@media (min-width: 768px) {
  .stack__card {
    padding: var(--s12);
  }
}

/* The stack is a scroll effect. Under reduced motion it is simply a list -
   which is what it already is semantically, so nothing is lost. */
@media (prefers-reduced-motion: reduce) {
  .stack__card,
  .ch__head {
    position: static;
  }
}
/* Sticky needs a real scroll context; without JS the layout is identical, so
   no .no-js override is required here. */

.stack__index {
  font-family: var(--font-jetbrains-mono), ui-monospace, monospace;
  font-size: var(--text-xs);
  letter-spacing: 0.16em;
  color: var(--accent);
}
.stack__title {
  margin: var(--s3) 0 0;
  font-size: var(--text-2xl);
  letter-spacing: var(--tracking-tight);
}
.stack__body {
  margin: var(--s4) 0 0;
  color: var(--muted);
  line-height: 1.65;
  max-width: 62ch;
}

@media print {
  .stack__card,
  .ch__head {
    position: static;
  }
}
`

function Styles() {
  return (
    <style href="envenox-story" precedence="default">
      {CSS}
    </style>
  )
}

/* ========================================================================== */

export function Chapter({
  n,
  title,
  lede,
  id,
  children,
}: {
  /** Rendered as "01", "02"… A reader in a long page needs to know where they are. */
  n: number
  title: string
  lede?: string
  id?: string
  children: ReactNode
}) {
  const headingId = id ? `${id}-title` : undefined
  return (
    <>
      <Styles />
      <section className="ch" id={id} aria-labelledby={headingId}>
        <div className="ch__head">
          <span className="ch__num" aria-hidden="true">
            {String(n).padStart(2, '0')}
          </span>
          <h2 className="ch__title" id={headingId}>
            {title}
          </h2>
          {lede ? <p className="ch__lede">{lede}</p> : null}
          <div className="ch__rule" aria-hidden="true" />
        </div>
        <div className="ch__body">{children}</div>
      </section>
    </>
  )
}

export function CardStack({ children }: { children: ReactNode }) {
  return (
    <>
      <Styles />
      <div className="stack">{children}</div>
    </>
  )
}

export function StackCard({
  index,
  title,
  children,
}: {
  index?: string
  title?: string
  children: ReactNode
}) {
  return (
    <article className="stack__card">
      {index ? <span className="stack__index">{index}</span> : null}
      {title ? <h3 className="stack__title">{title}</h3> : null}
      <div className="stack__body">{children}</div>
    </article>
  )
}
