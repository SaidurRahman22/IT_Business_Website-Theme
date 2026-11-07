import type { HTMLAttributes, JSX, ReactNode } from 'react'

/**
 * Prose - the typographic container for long-form copy.
 *
 * Everything inside is styled by element, so MDX, a CMS payload and
 * hand-written JSX all land identically. 68ch measure (`.u-measure`), heading
 * rhythm tuned to the Inter Tight / Inter pairing, --muted for secondary text,
 * and `.u-mono` weight for inline code.
 *
 * Instrument Serif deliberately does NOT appear here. Serif is rationed to the
 * two or three ChapterOpener moments on the whole site; running it through body
 * copy would spend the whole ration on one page.
 */

const CSS = `
.prose {
  color: var(--fg);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}
.prose > * + * { margin-top: var(--s4); }

.prose h2,
.prose h3,
.prose h4 { color: var(--fg); text-wrap: balance; }
.prose h2 { font-size: var(--text-2xl); margin-top: var(--s12); }
.prose h3 { font-size: var(--text-xl); margin-top: var(--s8); }
.prose h4 { font-size: var(--text-lg); font-weight: 500; margin-top: var(--s6); }
.prose > h2:first-child,
.prose > h3:first-child,
.prose > h4:first-child { margin-top: 0; }
.prose h2 + *,
.prose h3 + *,
.prose h4 + * { margin-top: var(--s3); }

.prose p { color: var(--muted-strong); }
.prose .prose__lead,
.prose > p:first-child { color: var(--fg); font-size: var(--text-lg); }

.prose a {
  color: var(--fg);
  text-decoration: underline;
  text-decoration-color: color-mix(in oklab, var(--fg) 40%, transparent);
  text-underline-offset: 3px;
  transition: text-decoration-color var(--dur-micro) var(--ease-out);
}
.prose a:hover { text-decoration-color: var(--fg); }

.prose strong { color: var(--fg); font-weight: 600; }
.prose em { font-style: italic; }
.prose small { font-size: var(--text-sm); color: var(--muted); }

.prose ul,
.prose ol { padding-left: var(--s6); color: var(--muted-strong); }
.prose ul { list-style: none; padding-left: var(--s4); }
.prose ul > li { position: relative; padding-left: var(--s4); }
.prose ul > li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.68em;
  width: 6px;
  height: 1px;
  background-color: var(--border-strong);
}
.prose ol { list-style: decimal; }
.prose ol > li::marker { color: var(--muted); font-variant-numeric: tabular-nums; }
.prose li + li { margin-top: var(--s2); }
.prose li > ul,
.prose li > ol { margin-top: var(--s2); }

.prose blockquote {
  border-left: 1px solid var(--border-strong);
  padding-left: var(--s6);
  color: var(--fg);
  font-size: var(--text-lg);
  line-height: var(--leading-snug);
}
.prose blockquote cite {
  display: block;
  margin-top: var(--s3);
  font-size: var(--text-sm);
  font-style: normal;
  color: var(--muted);
}

.prose code {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-variant-ligatures: none;
  font-size: 0.875em;
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 1px var(--s1);
}
.prose pre {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-sm);
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--s4);
  overflow-x: auto;
}
.prose pre code { background: none; border: 0; padding: 0; font-size: inherit; }

.prose hr { border: 0; height: 1px; background-color: var(--border); margin-block: var(--s8); }

.prose table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  font-variant-numeric: tabular-nums;
}
.prose th,
.prose td { text-align: left; padding: var(--s3) var(--s4); border-bottom: 1px solid var(--border); }
.prose th { color: var(--fg); font-weight: 500; }
.prose td { color: var(--muted-strong); }

.prose figure figcaption {
  margin-top: var(--s3);
  font-size: var(--text-sm);
  color: var(--muted);
}

.prose dt { color: var(--fg); font-weight: 500; }
.prose dd { color: var(--muted-strong); margin-top: var(--s1); }
.prose dd + dt { margin-top: var(--s4); }
`

export type ProseProps = Omit<HTMLAttributes<HTMLElement>, 'children'> & {
  children?: ReactNode
  as?: keyof JSX.IntrinsicElements
  /** Drop the 68ch cap - for prose inside an already-narrow column. */
  wide?: boolean
}

export function Prose({ children, as = 'div', wide = false, className = '', ...rest }: ProseProps) {
  const Tag = as as 'div'
  return (
    <>
      <style href="envenox-prose" precedence="default">
        {CSS}
      </style>
      <Tag className={['prose', wide ? '' : 'u-measure', className].filter(Boolean).join(' ')} {...rest}>
        {children}
      </Tag>
    </>
  )
}

export default Prose
