#!/usr/bin/env node
/**
 * Generates public/img/noise.png - the animated-grain tile.
 *
 * 128x128, 8-bit greyscale, monochrome. Zero dependencies: a PNG is a handful
 * of length-prefixed CRC'd chunks around a zlib stream, and Node ships zlib.
 *
 * The grain exists because large flat colour fields go dead without it (PART 2.4).
 * It is tiled at 128px and animated with `steps(10)`, so the tile must be
 * seamless in both axes - a visible seam at 4% opacity still reads as a grid.
 * We get seamlessness for free by generating value noise on a torus: the
 * lattice wraps modulo the tile size.
 *
 * Run: node scripts/make-noise.mjs
 */

import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SIZE = 128
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'img', 'noise.png')

/* ---- deterministic PRNG so the tile is byte-identical across machines ---- */
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ---- value noise on a wrapping lattice (seamless by construction) ---- */
function lattice(period, rand) {
  const g = new Float32Array(period * period)
  for (let i = 0; i < g.length; i++) g[i] = rand()
  return g
}

const smooth = (t) => t * t * (3 - 2 * t)

function sampleWrapped(g, period, x, y) {
  const fx = x * period
  const fy = y * period
  const x0 = Math.floor(fx) % period
  const y0 = Math.floor(fy) % period
  const x1 = (x0 + 1) % period
  const y1 = (y0 + 1) % period
  const tx = smooth(fx - Math.floor(fx))
  const ty = smooth(fy - Math.floor(fy))
  const a = g[y0 * period + x0]
  const b = g[y0 * period + x1]
  const c = g[y1 * period + x0]
  const d = g[y1 * period + x1]
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty
}

function build() {
  const rand = mulberry32(0x5b6cff) // the brand accent, because why not
  // Fine grain dominates; two coarser octaves stop it reading as TV static.
  const octaves = [
    { period: 64, weight: 0.55 },
    { period: 32, weight: 0.27 },
    { period: 16, weight: 0.18 },
  ].map((o) => ({ ...o, g: lattice(o.period, rand) }))

  // One filter byte (0 = None) per scanline, then one grey byte per pixel.
  const raw = Buffer.alloc(SIZE * (SIZE + 1))
  let p = 0
  for (let y = 0; y < SIZE; y++) {
    raw[p++] = 0
    for (let x = 0; x < SIZE; x++) {
      let v = 0
      for (const o of octaves) v += sampleWrapped(o.g, o.period, x / SIZE, y / SIZE) * o.weight
      // Centre on mid-grey: the tile is composited at ~4% opacity, so what
      // matters is the deviation from 128, not the absolute level.
      const centred = 128 + (v - 0.5) * 255
      raw[p++] = Math.max(0, Math.min(255, Math.round(centred)))
    }
  }
  return raw
}

/* ---- PNG container ---- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // bit depth
ihdr[9] = 0 // colour type 0 = greyscale
ihdr[10] = 0 // deflate
ihdr[11] = 0 // adaptive filtering
ihdr[12] = 0 // no interlace

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(build(), { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, png)
console.log(`noise.png written: ${OUT} (${SIZE}x${SIZE} greyscale, ${png.length} bytes)`)
