/**
 * Prototype-safe slug lookup tables.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * WHY THIS FILE EXISTS
 *
 * Every lookup map in lib/ used to be built with `Object.fromEntries(...)` or
 * `reduce(..., {})`. Both produce an object that INHERITS FROM
 * `Object.prototype`, so a lookup by an inherited key returns a truthy value
 * that was never in the data:
 *
 *   const m = Object.fromEntries([['alice', person]])
 *   m['constructor']  // => the Object constructor - a function, and truthy
 *   m['toString']     // => a function, and truthy
 *   m['__proto__']    // => an object, and truthy
 *
 * Every dynamic route guards with the same shape:
 *
 *   const person = peopleBySlug[slug]
 *   if (!person) notFound()
 *
 * With an inherited key that guard PASSES. `notFound()` never fires,
 * `generateMetadata` renders `undefined - undefined` into <title>, Open Graph
 * and the canonical URL, and the page body then dereferences record fields on
 * a function object. The result is an unauthenticated 500 and a malformed
 * canonical that a CDN is happy to cache.
 *
 * Nine of eleven [slug] routes happened to be shielded by
 * `export const dynamicParams = false`, which makes Next answer with its own
 * 404 before any of this code runs. Two were not. That is a one-line-away
 * failure mode, which is exactly the kind that comes back: the next person to
 * add a route will not know the flag is load-bearing for anything but
 * performance.
 *
 * So the flag is not the fix, it is the first of two layers. This file is the
 * second: the maps themselves stop being able to answer for a key nobody
 * stored. Use these helpers for every slug-keyed map - do not reintroduce a
 * bare `Object.fromEntries` or a `reduce` seeded with `{}`.
 *
 * TYPE NOTE: the return type stays `Record<string, T>` rather than
 * `Partial<Record<string, T>>` so these are drop-in replacements. That keeps
 * TypeScript claiming `map[key]` is always `T` when it can be `undefined` at
 * runtime - which is why every call site still needs its `if (!x) notFound()`
 * guard. The guard is now load-bearing AND correct; before, it was
 * load-bearing and defeatable.
 * ──────────────────────────────────────────────────────────────────────────
 */

/**
 * An empty record with a null prototype - safe as a `reduce` seed or a
 * hand-built accumulator. Replaces `{}`, which inherits.
 */
export function emptyRecord<T>(): Record<string, T> {
  return Object.create(null) as Record<string, T>
}

/**
 * Build a slug-keyed lookup from records that carry their own `slug`.
 *
 * Replaces `Object.fromEntries(items.map((i) => [i.slug, i]))`.
 *
 * A later duplicate slug overwrites an earlier one, matching the behaviour of
 * the `Object.fromEntries` form this replaces - slug uniqueness is enforced by
 * the content files, not here.
 */
export function bySlug<T extends { slug: string }>(items: readonly T[]): Record<string, T> {
  const out = emptyRecord<T>()
  for (const item of items) out[item.slug] = item
  return out
}

/**
 * Build a lookup keyed by an arbitrary field, grouping every record that
 * shares a key into an array.
 *
 * Replaces `items.reduce((acc, i) => { (acc[i.k] ??= []).push(i); return acc }, {})`.
 */
export function groupBy<T, K extends keyof T>(
  items: readonly T[],
  key: K extends string ? K : never,
): Record<string, T[]> {
  const out = emptyRecord<T[]>()
  for (const item of items) {
    const k = String(item[key])
    ;(out[k] ??= []).push(item)
  }
  return out
}
