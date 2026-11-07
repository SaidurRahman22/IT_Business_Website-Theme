/**
 * Seeded PRNG for the hero scene.
 *
 * The Attestation scene scatters 320 plates from random positions, orientations
 * and assembly delays. Those must be IDENTICAL on every reload, in every
 * browser, and in `scripts/render-hero-fallback.mjs` - otherwise the static
 * fallback image shows a different object than the one the canvas cross-fades
 * into, and the seam is visible as a jump.
 *
 * `Math.random()` cannot give that. mulberry32 can: 32 bits of state, one
 * multiply and three xorshifts per call, a period of 2^32, and output quality
 * well past anything a visual needs.
 *
 * No three.js dependency here on purpose - this module is imported by the
 * Node render script as a leaf.
 */

/** A deterministic `[0, 1)` generator. */
export type Random = {
  /** Next value in `[0, 1)`. */
  next(): number
  /** Next value in `[min, max)`. */
  range(min: number, max: number): number
  /** Next value in `[-1, 1)`. */
  signed(): number
}

/**
 * Returns a deterministic `[0, 1)` generator for `seed`.
 *
 * @param seed any integer; coerced to uint32.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Wraps {@link mulberry32} with the range helpers the scene builder wants. */
export function createRandom(seed: number): Random {
  const next = mulberry32(seed)
  return {
    next,
    range: (min: number, max: number) => min + next() * (max - min),
    signed: () => next() * 2 - 1,
  }
}
