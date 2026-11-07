/**
 * THE REGULATORY MAP, AS A MATRIX.
 *
 * `lib/industries.ts` gives each framework two sentences: what it `demands` and
 * where it `bite`s. Rendered as prose that is a list, and a compliance lead has
 * read a list like it on four other sites this week. Rendered as a matrix it
 * answers the question they actually arrive with: across every framework that
 * applies to my sector, WHICH KIND of obligation keeps recurring, and which
 * framework is carrying the most of them.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * WHERE THE MARKS COME FROM, AND WHAT THEY ARE NOT
 * ──────────────────────────────────────────────────────────────────────────
 * A cell is marked where that framework's OWN stated demands or its OWN stated
 * bite name that kind of obligation. The detection is keyword matching over the
 * two sentences on this page and nothing else - no external mapping, no
 * licensed control crosswalk, no judgement call baked into a lookup table a
 * reader cannot see. That is stated in the caption rather than implied, because
 * a matrix that looks like a certified control mapping and is not one is worse
 * than no matrix.
 *
 * The honest consequence: an absent mark means "this framework's stated demands
 * on this page do not name that obligation", NOT "this framework does not
 * require it". The caption says exactly that.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * MECHANICS
 * ──────────────────────────────────────────────────────────────────────────
 * A real <table> with real row and column headers, so the relationship is in
 * the accessibility tree rather than in the geometry. Nine columns will not fit
 * at 320px, so it sits in a keyboard-reachable scroller - `tabindex=0`, an
 * accessible name, and `position: relative` on the scroller itself so nothing
 * inside it can escape and widen the page.
 *
 * Server Component. No JavaScript, nothing to hydrate, nothing that animates.
 */

import type { IndustryPage } from '@/lib/industries'
import styles from './regulatory.module.css'

/* ========================================================================== *
 * THE OBLIGATION KINDS
 *
 * Eight kinds, chosen because every framework in `lib/industries.ts` is some
 * combination of them and because each one lands on a different team inside a
 * client. `long` is the column header a screen reader announces; `short` is
 * what fits above a 72px column.
 * ========================================================================== */

type Kind = {
  id: string
  short: string
  long: string
  /** Matched against `${demands} ${bite}`, lower-cased. */
  re: RegExp
  /** Who inside the client ends up owning it. */
  owner: string
}

export const KINDS: Kind[] = [
  {
    id: 'testing',
    short: 'Testing',
    long: 'Testing and independent assurance',
    re: /\b(test|tested|testing|scan|scanning|assess|assessment|audit|audited|penetration|exercis|red team|tlpt)/,
    owner: 'Security testing',
  },
  {
    id: 'evidence',
    short: 'Evidence',
    long: 'Evidence, records and registers',
    // `documented` (an artefact the framework requires) but NOT bare `document`.
    // The NCSC CAF's bite is "you cannot document your way past it", which names
    // documentation only to say it is insufficient - marking an evidence
    // obligation off that sentence would be reading it backwards.
    re: /\b(evidence|record|records|register|documented|statement of applicability|\blog\b|logs|attestation|self-assessment)/,
    owner: 'GRC',
  },
  {
    id: 'incident',
    short: 'Incident',
    long: 'Incident reporting on a clock',
    re: /\b(incident|notification|notify|breach|early warning|within \d+ (?:hour|day|month))/,
    owner: 'Detection and response',
  },
  {
    id: 'access',
    short: 'Access',
    long: 'Access, identity and authorisation',
    re: /\b(access|identity|authoris|authentic|role-based|permission|subject access|need to know|who need it)/,
    owner: 'Engineering',
  },
  {
    id: 'thirdparty',
    short: 'Third party',
    long: 'Third parties and the supply chain',
    re: /\b(third.part|supply chain|sub-processor|vendor|supplier|acquirer|scheme requirement|business associate)/,
    owner: 'Procurement',
  },
  {
    id: 'named',
    short: 'Named owner',
    long: 'Named accountability',
    // `named` alone is too loose - "named sub-processors" is a supply-chain
    // obligation, not an accountability one, and it was being marked here.
    re: /\b(named (?:individual|person|accountab|owner|officer)|accountab|safety officer|management bod|personally liable|management function|governance)/,
    owner: 'The board',
  },
  {
    id: 'data',
    short: 'Data',
    long: 'Data handling and lawful basis',
    re: /\b(data|personal|special category|residency|retention|lawful basis|consent|dpia|privacy|patient)/,
    owner: 'Legal and engineering',
  },
  {
    id: 'resilience',
    short: 'Resilience',
    long: 'Resilience and recovery',
    re: /\b(resilien|continuity|tolerance|disruption|availability|restore|backup|recovery|conduit|security level)/,
    owner: 'Platform',
  },
]

export type MatrixRow = {
  name: string
  demands: string
  bite: string
  /** Kind id → marked. */
  hits: Record<string, boolean>
  count: number
}

export function buildMatrix(regulatory: IndustryPage['regulatory']): MatrixRow[] {
  return regulatory.map((entry) => {
    const haystack = `${entry.demands} ${entry.bite}`.toLowerCase()
    const hits: Record<string, boolean> = {}
    let count = 0
    for (const kind of KINDS) {
      const on = kind.re.test(haystack)
      hits[kind.id] = on
      if (on) count += 1
    }
    return { name: entry.name, demands: entry.demands, bite: entry.bite, hits, count }
  })
}

/* ========================================================================== */

export function RegulatoryMatrix({
  industryName,
  regulatory,
  id,
}: {
  industryName: string
  regulatory: IndustryPage['regulatory']
  id?: string
}) {
  const rows = buildMatrix(regulatory)

  /* Columns are ordered by how many of THIS sector's frameworks name them,
     densest first. The grid then reads as a staircase rather than as scatter,
     and the answer to "what does everything here ask for" is the left-hand
     column rather than something the reader has to count. The canonical order
     in KINDS breaks ties, so the arrangement is stable. */
  const ordered = KINDS.map((kind, i) => ({
    kind,
    i,
    total: rows.filter((r) => r.hits[kind.id]).length,
  })).sort((a, b) => b.total - a.total || a.i - b.i)

  const max = Math.max(1, ...ordered.map((c) => c.total))
  const heaviest = rows.reduce((a, b) => (b.count > a.count ? b : a), rows[0])
  const recurring = ordered.filter((c) => c.total === max).map((c) => c.kind.long.toLowerCase())

  return (
    <figure className={styles.fig} id={id}>
      {/* The read, in a sentence, before the grid. Derived, not asserted.
          Three cases, because the sentence has to stay true in all of them —
          "the obligations that recur most are A, B, C, D and E, each named by
          1 of 3" is five frameworks tying at nothing, written as if it were a
          finding. */}
      <p className={styles.lede}>
        {`${rows.length} frameworks apply to ${industryName}. `}
        {max <= 1
          ? 'No obligation here is named by more than one of them: each asks for a different thing, which is why one control set does not discharge the set. '
          : recurring.length === 1
            ? `The obligation that recurs across the most of them is ${recurring[0]}, named by ${max} of ${rows.length}. `
            : /* Joined with a comma, not "and": two of these labels are already
                 "evidence, records and registers" and "resilience and recovery",
                 and "A and B" between them produces four "and"s in a row. */
              `${recurring.length} obligations tie for the most recurrent (${recurring.slice(0, 2).join('; ')}${recurring.length > 2 ? '; and others' : ''}) each named by ${max} of ${rows.length}. `}
        {heaviest
          ? `${heaviest.name} names the widest spread, touching ${heaviest.count} of the ${KINDS.length} kinds.`
          : ''}
      </p>

      {/* Nine columns do not fit on a phone, so this scrolls on its own rather
          than taking the page with it. `position: relative` on the scroller is
          not cosmetic, see regulatory.module.css. */}
      <div
        className={styles.scroll}
        tabIndex={0}
        role="region"
        aria-label={`Framework obligation matrix for ${industryName}, scrollable`}
      >
        <table className={styles.table}>
          <caption className={styles.caption}>
            {`Which kind of obligation each ${industryName} framework names, read from that framework's own stated demands and its own stated bite.`}
          </caption>
          <thead>
            <tr>
              <th scope="col" className={`${styles.th} ${styles.thCorner}`}>
                Framework
              </th>
              {ordered.map(({ kind }) => (
                <th scope="col" className={styles.th} key={kind.id}>
                  <span className={styles.thShort}>{kind.short}</span>
                  <span className={styles.thOwner}>{kind.owner}</span>
                </th>
              ))}
              <th scope="col" className={`${styles.th} ${styles.thCount}`}>
                Spread
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <th scope="row" className={styles.rowHead}>
                  {row.name}
                </th>
                {ordered.map(({ kind }) => {
                  const on = row.hits[kind.id]
                  return (
                    <td
                      key={kind.id}
                      className={styles.cell}
                      data-on={on ? 'true' : 'false'}
                      aria-label={
                        on
                          ? `${row.name} names ${kind.long}`
                          : `${row.name} does not name ${kind.long}`
                      }
                    />
                  )
                })}
                <td className={`${styles.cell} ${styles.cellCount}`}>
                  <span className="u-mono u-tnum">{`${row.count}/${KINDS.length}`}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className={`${styles.rowHead} ${styles.footHead}`}>
                Frameworks naming it
              </th>
              {ordered.map(({ kind, total }) => (
                <td className={`${styles.cell} ${styles.cellTotal}`} key={kind.id}>
                  <span className="u-mono u-tnum">{total}</span>
                </td>
              ))}
              <td className={`${styles.cell} ${styles.cellCount}`} />
            </tr>
          </tfoot>
        </table>
      </div>

      <figcaption className={styles.note}>
        A cell is marked where that framework&rsquo;s own stated demands, or its own stated bite,
        name that kind of obligation &mdash; read from the two sentences published under each
        framework below, and from nothing else. An unmarked cell therefore means{' '}
        <em>not named here</em>, not <em>not required</em>. This is a reading aid for the page you
        are on, not a certified control mapping, and we would rather say so than let it be mistaken
        for one.
      </figcaption>
    </figure>
  )
}

export default RegulatoryMatrix
