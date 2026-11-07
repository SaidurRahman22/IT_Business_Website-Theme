import type { HTMLAttributes, ReactNode } from 'react'

/**
 * ChapterOpener - the Instrument Serif moment.
 *
 * ============================================================================
 *  RATION: AT MOST 3 INSTANCES ACROSS THE ENTIRE SITE.
 *
 *  Instrument Serif is the only voice change the design language permits, and
 *  it only means something because it is scarce. Three appearances reads as an
 *  editorial decision; a fourth reads as a font choice; a tenth reads as a
 *  template. The intended allocation is:
 *
 *    1. Home - the positioning line that opens the page body.
 *    2. /approach - the opening of The Adversary Loop.
 *    3. One reserved slot (/about or the sample report walkthrough).
 *
 *  Before adding a fourth, delete one. If you are reading this because you
 *  want a serif line on a service page: the answer is no, use Inter Tight.
 *  Audit with:  grep -rn "ChapterOpener" app components | grep -v components/ui
 * ============================================================================
 *
 * Renders ONE large editorial line. No stacked serif paragraphs, no serif
 * subheads - a single sentence, and then the page returns to Inter.
 */

const CSS = `
.chapter {
  display: flex;
  flex-direction: column;
  gap: var(--s6);
}
.chapter__line {
  font-family: var(--font-instrument-serif), ui-serif, Georgia, serif;
  font-weight: 400;
  font-size: var(--text-3xl);
  line-height: 1.08;
  letter-spacing: 0;
  color: var(--fg);
  max-width: 22ch;
  text-wrap: balance;
  margin: 0;
}
@media (min-width: 768px) {
  .chapter__line { font-size: var(--text-4xl); max-width: 20ch; }
}
@media (min-width: 1024px) {
  .chapter__line { font-size: var(--text-5xl); }
}
.chapter__line em { font-style: italic; }
.chapter__note {
  color: var(--muted);
  font-size: var(--text-base);
  max-width: 48ch;
  margin: 0;
}
.chapter__rule { height: 1px; background-color: var(--border); width: 100%; }
`

export type ChapterOpenerProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  /** The one editorial line. Keep it to a single sentence. */
  children: ReactNode
  /** Small uppercase label above the line. */
  eyebrow?: string
  /** One supporting sentence below, set in Inter. */
  note?: ReactNode
  /** Render the line as a heading rather than a <p>. Supply `id` for
   *  aria-labelledby when this opens a <Section>. */
  as?: 'h1' | 'h2' | 'p'
  /** Hairline rule above the block. */
  rule?: boolean
}

export function ChapterOpener({
  children,
  eyebrow,
  note,
  as = 'p',
  rule = false,
  id,
  className = '',
  ...rest
}: ChapterOpenerProps) {
  const Line = as as 'p'

  return (
    <>
      <style href="envenox-chapter-opener" precedence="default">
        {CSS}
      </style>
      <div className={['chapter', className].filter(Boolean).join(' ')} {...rest}>
        {rule ? <div className="chapter__rule" aria-hidden="true" /> : null}
        {eyebrow ? <p className="u-eyebrow">{eyebrow}</p> : null}
        <Line id={id} className="chapter__line">
          {children}
        </Line>
        {note ? <p className="chapter__note">{note}</p> : null}
      </div>
    </>
  )
}

export default ChapterOpener
