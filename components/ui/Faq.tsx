'use client'

// Keep the lucide-react import FIRST and braced - see the note in Nav.tsx.
import { ChevronDown } from 'lucide-react'
import * as Accordion from '@radix-ui/react-accordion'
import type { Faq as FaqItem } from '@/lib/services'

/**
 * Faq - Radix Accordion, type single and collapsible.
 *
 * MOTION: the panel uses `.acc-content`, already wired in globals.css to
 * `collapseDown` / `collapseUp` on --dur-base --ease-out. That height animation
 * is the single documented exception to "never animate height", because Radix
 * measures the height into --radix-accordion-content-height for it. The chevron
 * rotates 180deg on the same tempo - rotation is permitted, it is not a lift.
 *
 * SEO: emits FAQPage JSON-LD for exactly the questions it renders, so the
 * answers are machine-readable even though Radix unmounts closed panels. Set
 * `jsonLd={false}` on any second FAQ block on the same page - one FAQPage per
 * document, or search engines treat the markup as inconsistent.
 *
 * NO-JAVASCRIPT PATH: Radix renders closed panels as `isOpen && children`, so
 * no CSS can bring a closed answer back. A static definition list carrying
 * every question and answer therefore ships alongside, `display: none` by
 * default and visible only while the `.no-js` class survives on <html>. With
 * scripting off a visitor reads a plain, complete Q&A document; with scripting
 * on they get the accordion and the static copy is removed from both the
 * layout and the accessibility tree.
 */

const CSS = `
.faq { border-top: 1px solid var(--border); }
.faq__item { border-bottom: 1px solid var(--border); }
.faq__header { margin: 0; }

.faq__trigger {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s6);
  width: 100%;
  min-height: 44px;
  padding: var(--s6) 0;
  appearance: none;
  background: none;
  border: 0;
  text-align: left;
  cursor: pointer;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-lg);
  font-weight: 500;
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--fg);
  /* Colour only. The row must not move under the pointer. */
  transition: color var(--dur-base) var(--ease-out);
}
.faq__trigger:hover { color: var(--muted-strong); }
.faq__trigger:focus-visible { outline-offset: -2px; }

.faq__chevron {
  flex: none;
  margin-top: 2px;
  color: var(--muted);
  transition: transform var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}
.faq__trigger[data-state='open'] .faq__chevron { transform: rotate(180deg); color: var(--fg); }

/* .acc-content carries the collapseDown / collapseUp animations from globals. */
.faq__content { overflow: hidden; }
.faq__answer {
  padding-bottom: var(--s6);
  color: var(--muted-strong);
  max-width: 68ch;
  margin: 0;
}

/* The no-JS mirror. display:none also keeps it out of the a11y tree when
   scripting is available, so nothing is announced twice. */
.faq__nojs { display: none; border-top: 1px solid var(--border); }
.no-js .faq__nojs { display: block; }
.no-js .faq__accordion { display: none; }
.faq__nojs dt {
  padding-top: var(--s6);
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-lg);
  font-weight: 500;
  line-height: var(--leading-snug);
  color: var(--fg);
}
.faq__nojs dd {
  margin: var(--s2) 0 0;
  padding-bottom: var(--s6);
  border-bottom: 1px solid var(--border);
  color: var(--muted-strong);
  max-width: 68ch;
}
`

export type FaqProps = {
  items: readonly FaqItem[]
  /** Open one question by default - pass its question text. */
  defaultQuestion?: string
  /** Heading level for each question. */
  headingLevel?: 2 | 3 | 4
  /**
   * Emit FAQPage JSON-LD. Default true. Set false for any additional FAQ block
   * on the same page so the document has exactly one FAQPage.
   */
  jsonLd?: boolean
  id?: string
  className?: string
}

/** JSON-LD that cannot break out of the script element. */
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export function Faq({
  items,
  defaultQuestion,
  headingLevel = 3,
  jsonLd = true,
  id,
  className = '',
}: FaqProps) {
  if (items.length === 0) return null

  const HeadingTag = `h${headingLevel}` as 'h3'
  const valueOf = (index: number) => `faq-${index}`
  const defaultIndex =
    defaultQuestion === undefined ? -1 : items.findIndex((i) => i.q === defaultQuestion)
  const defaultValue = defaultIndex >= 0 ? valueOf(defaultIndex) : undefined

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <>
      <style href="envenox-faq" precedence="default">
        {CSS}
      </style>

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      ) : null}

      <div id={id} className={className}>
        <Accordion.Root
          type="single"
          collapsible
          defaultValue={defaultValue}
          className="faq faq__accordion"
        >
          {items.map((item, index) => (
            <Accordion.Item key={valueOf(index)} value={valueOf(index)} className="faq__item">
              <Accordion.Header asChild>
                <HeadingTag className="faq__header">
                  <Accordion.Trigger className="faq__trigger">
                    <span>{item.q}</span>
                    <ChevronDown
                      className="faq__chevron"
                      size={20}
                      strokeWidth={1.75}
                      absoluteStrokeWidth
                      aria-hidden="true"
                    />
                  </Accordion.Trigger>
                </HeadingTag>
              </Accordion.Header>
              <Accordion.Content className="acc-content faq__content">
                <p className="faq__answer">{item.a}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        {/* Visible only while scripting is unavailable. */}
        <dl className="faq__nojs">
          {items.map((item) => (
            <div key={item.q}>
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  )
}

export default Faq
