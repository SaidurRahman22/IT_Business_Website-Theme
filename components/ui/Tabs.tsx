'use client'

import * as TabsPrimitive from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'

/**
 * Tabs - a thin wrapper over Radix Tabs.
 *
 * It exists so that every tabbed surface on the site inherits correct roles,
 * aria-controls/aria-labelledby wiring, roving tabindex and Home/End/arrow
 * keyboard behaviour without each page re-deriving it.
 *
 * MOTION: panels use the `fadeInTabTranslate` state machine already in
 * globals.css, which is keyed on `[data-radix-tabs-content][data-state=active]`.
 * Radix does NOT emit that attribute itself, so this wrapper sets it. Without
 * it the panels would swap with no transition at all.
 *
 * NO-JAVASCRIPT PATH: Radix unmounts inactive panels, which would hide all but
 * the first panel's content from a no-JS visitor with no way to reach it. Every
 * panel is therefore `forceMount`ed so all content ships in the server HTML,
 * and under `.no-js` the tab strip is hidden and all panels render stacked,
 * each introduced by its own visible heading. A no-JS visitor gets a plain,
 * complete, correctly-labelled document instead of a dead tab bar.
 */

const CSS = `
.tabs__list {
  display: flex;
  gap: var(--s1);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs__list::-webkit-scrollbar { display: none; }

.tabs__trigger {
  position: relative;
  flex: none;
  appearance: none;
  background: none;
  border: 0;
  border-bottom: 1px solid transparent;
  margin-bottom: -1px;
  padding: var(--s3) var(--s4);
  min-height: 44px;
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1;
  color: var(--muted);
  cursor: pointer;
  white-space: nowrap;
  /* Colour only. No transform on hover or on selection. */
  transition:
    color var(--dur-base) var(--ease-out),
    background-color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
}
.tabs__trigger:hover { color: var(--fg); background-color: var(--surface); }
.tabs__trigger[data-state='active'] { color: var(--fg); border-bottom-color: var(--accent); }

.tabs__panel { outline: none; padding-top: var(--s6); }
.tabs__panel:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }

/* Shown only when the no-js class survives, i.e. scripting is unavailable. */
.tabs__nojs-label { display: none; }
.no-js .tabs__list { display: none; }
.no-js .tabs__panel[hidden] { display: block; }
.no-js .tabs__nojs-label {
  display: block;
  font-size: var(--text-xl);
  margin-bottom: var(--s3);
}
`

export type TabItem = {
  /** Stable identity. Also the URL-safe fragment if you deep-link. */
  value: string
  label: string
  content: ReactNode
}

export type TabsProps = {
  items: TabItem[]
  /** Accessible name for the tab strip, e.g. "Engagement models". Required. */
  ariaLabel: string
  /** Defaults to the first item. */
  defaultValue?: string
  /** Controlled value. Pair with onValueChange. */
  value?: string
  onValueChange?: (value: string) => void
  /** Heading level used for the no-JS panel labels. */
  nojsHeadingLevel?: 2 | 3 | 4
  className?: string
  listClassName?: string
  panelClassName?: string
}

export function Tabs({
  items,
  ariaLabel,
  defaultValue,
  value,
  onValueChange,
  nojsHeadingLevel = 3,
  className = '',
  listClassName = '',
  panelClassName = '',
}: TabsProps) {
  if (items.length === 0) return null
  const NojsHeading = `h${nojsHeadingLevel}` as 'h3'

  return (
    <>
      <style href="envenox-tabs" precedence="default">
        {CSS}
      </style>
      <TabsPrimitive.Root
        className={className}
        defaultValue={value === undefined ? (defaultValue ?? items[0].value) : undefined}
        value={value}
        onValueChange={onValueChange}
      >
        <TabsPrimitive.List className={['tabs__list', listClassName].filter(Boolean).join(' ')} aria-label={ariaLabel}>
          {items.map((item) => (
            <TabsPrimitive.Trigger key={item.value} value={item.value} className="tabs__trigger">
              {item.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>

        {items.map((item) => (
          <TabsPrimitive.Content
            key={item.value}
            value={item.value}
            forceMount
            data-radix-tabs-content=""
            className={['tabs__panel', panelClassName].filter(Boolean).join(' ')}
          >
            <NojsHeading className="tabs__nojs-label">{item.label}</NojsHeading>
            {item.content}
          </TabsPrimitive.Content>
        ))}
      </TabsPrimitive.Root>
    </>
  )
}

/**
 * The raw primitives, for a tabbed surface that needs a custom trigger layout
 * (a vertical rail, triggers with icons and counts, a two-row strip). Keep the
 * `tabs__*` class names and remember `data-radix-tabs-content` on every panel,
 * or the panel transition will not fire.
 */
export const TabsRoot = TabsPrimitive.Root
export const TabsList = TabsPrimitive.List
export const TabsTrigger = TabsPrimitive.Trigger
export const TabsPanel = TabsPrimitive.Content

export default Tabs
