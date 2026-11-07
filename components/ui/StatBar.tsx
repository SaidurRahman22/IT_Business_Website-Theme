import type { CSSProperties, HTMLAttributes } from 'react'
import type { Stat as StatData } from '@/lib/site'
import { Stat } from './Stat'

/**
 * StatBar - a row of capacity figures, hairline-separated.
 *
 * Takes `headlineStats` (or any `Stat[]`) straight from lib/site.ts, so the
 * `source` and `asOf` provenance travels with every number automatically.
 *
 *   import { headlineStats } from '@/lib/site'
 *   <StatBar stats={headlineStats} ariaLabel="Envenox at a glance" />
 *
 * Every figure is server-rendered text - see the note at the top of Stat.tsx.
 */

const CSS = `
.statbar {
  display: grid;
  gap: var(--s8);
  list-style: none;
  margin: 0;
  padding: 0;
}
.statbar > li { min-width: 0; }

@media (min-width: 640px) {
  .statbar { gap: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .statbar > li { padding: var(--s6) var(--s6) var(--s6) 0; border-top: 1px solid var(--border); }
  .statbar > li + li { border-left: 1px solid var(--border); padding-left: var(--s6); }
  /* The second cell of each pair starts a new row edge, not a mid-row border. */
  .statbar--2 > li:nth-child(2n + 1) { border-left: 0; padding-left: 0; }
}
@media (min-width: 1024px) {
  .statbar--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .statbar--4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .statbar--3 > li:nth-child(2n + 1),
  .statbar--4 > li:nth-child(2n + 1) { border-left: 1px solid var(--border); padding-left: var(--s6); }
  .statbar--3 > li:first-child,
  .statbar--4 > li:first-child { border-left: 0; padding-left: 0; }
}
`

export type StatBarProps = Omit<HTMLAttributes<HTMLUListElement>, 'children'> & {
  stats: readonly StatData[]
  /** Accessible name for the list, e.g. "Envenox at a glance". Required. */
  ariaLabel: string
  columns?: 2 | 3 | 4
  size?: 'sm' | 'md' | 'lg'
  provenance?: 'details' | 'title' | 'none'
}

export function StatBar({
  stats,
  ariaLabel,
  columns = 4,
  size = 'md',
  provenance = 'details',
  className = '',
  style,
  ...rest
}: StatBarProps) {
  return (
    <>
      <style href="envenox-statbar" precedence="default">
        {CSS}
      </style>
      <ul
        className={['statbar', `statbar--${columns}`, className].filter(Boolean).join(' ')}
        aria-label={ariaLabel}
        style={style as CSSProperties}
        {...rest}
      >
        {stats.map((s) => (
          <Stat
            key={s.label}
            as="li"
            value={s.display}
            suffix={s.suffix}
            label={s.label}
            source={s.source}
            asOf={s.asOf}
            size={size}
            provenance={provenance}
          />
        ))}
      </ul>
    </>
  )
}

export default StatBar
