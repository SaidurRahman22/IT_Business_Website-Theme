/**
 * Renders the Attestation hero's p = 1 end state to static images.
 *
 *   node scripts/render-hero-fallback.mjs [--png] [--quality=86]
 *
 * Writes:
 *   public/img/hero-fallback.webp           1920 x 1080  (landscape, <= 180 KB)
 *   public/img/hero-fallback-portrait.webp  1080 x 1350  (portrait recompose)
 *
 * WHY A SOFTWARE RASTERISER AND NOT HEADLESS WEBGL
 * There is no headless GL binding in this project (`gl`, `puppeteer` and
 * `playwright` are all absent, and installing one is out of scope), so this
 * script rasterises the scene itself: ~130 lines of z-buffered triangle fill.
 *
 * It is NOT an approximation of the end state. It imports
 * `components/hero/hero-scene.ts` and uses the SAME geometry, the SAME seeded
 * PRNG, the SAME instance matrices, the SAME camera function and the SAME
 * `shadeMatcap()` as the live canvas, then applies three's own `FogExp2` curve.
 * The only intentional divergences from the GPU path are:
 *
 *   1. 2x supersampling with a linear-light box downsample, in place of MSAA.
 *   2. Flat per-triangle normals taken as the true geometric normal of the
 *      transformed triangle, where three's instancing shader approximates the
 *      normal matrix by dividing out the instance basis column lengths. The
 *      plate caps are identical either way; only the thin side walls differ,
 *      and only under shear.
 *
 * Re-run this whenever `ATTESTATION` in `components/hero/hero-scene.ts` changes,
 * or the static fallback stops matching what the canvas cross-fades into.
 */

import { existsSync, mkdirSync, statSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { dirname, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/* ---------------------------------------------------------------------------
   The hero modules are TypeScript and import each other without extensions, the
   way Next's bundler expects. Node 24 strips the types natively but will not
   guess the extension, so teach the resolver that one rule and nothing else.
   --------------------------------------------------------------------------- */

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[a-z0-9]+$/i.test(specifier)) {
      const candidate = new URL(`${specifier}.ts`, context.parentURL)
      if (existsSync(fileURLToPath(candidate))) {
        return { url: candidate.href, shortCircuit: true }
      }
    }
    return nextResolve(specifier, context)
  },
})

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(ROOT, 'public/img')

const heroModule = pathToFileURL(resolve(ROOT, 'components/hero/hero-scene.ts')).href
const matcapModule = pathToFileURL(resolve(ROOT, 'components/hero/matcap.ts')).href

const {
  ATTESTATION,
  cameraDistance,
  cameraHeight,
  composePlateMatrix,
  createFaceShapes,
  createPlateGeometry,
  createPlateStates,
  groupOffsetX,
  groupTransform,
} = await import(heroModule)
const { shadeMatcap, linearChannelToSrgb, srgbChannelToLinear } = await import(matcapModule)
const { Matrix3, Matrix4, PerspectiveCamera, Vector3 } = await import('three')

/* ---------------------------------------------------------------------------
   CLI
   --------------------------------------------------------------------------- */

const args = process.argv.slice(2)
const WANT_PNG = args.includes('--png')
const QUALITY_ARG = args.find((a) => a.startsWith('--quality='))
const START_QUALITY = QUALITY_ARG ? Number(QUALITY_ARG.split('=')[1]) : 86
/** --progress=<0..1> renders a mid-assembly frame instead, for art direction. */
const PROGRESS_ARG = args.find((a) => a.startsWith('--progress='))
const SUFFIX_ARG = args.find((a) => a.startsWith('--suffix='))
const SUFFIX = SUFFIX_ARG ? SUFFIX_ARG.split('=')[1] : ''

/**
 * `--suffix=` is concatenated into the output filename and then passed through
 * `resolve()`, which NORMALISES `..` - so an unchecked suffix escapes
 * `public/img` entirely. Verified before this guard existed:
 *
 *   --suffix=""                        -> public/img/hero-fallback.webp
 *   --suffix="/../../../../tmp/pwned"  -> D:\d\project\tmp\pwned.webp
 *   --suffix="/../../app/layout"       -> public/app/layout.webp
 *
 * The write content is a sharp-encoded image, so this is a clobber primitive
 * rather than code execution - but `public/app/layout.webp` is one
 * normalisation away from overwriting a source file, and `--png` writes a
 * second file at the same traversed path.
 *
 * Today the only caller is a developer running `npm run assets:hero`, so nobody
 * untrusted reaches it. It activates the moment a CI job templates a branch
 * name, tag or PR title into the suffix, which is exactly how this class of bug
 * gets switched on.
 */
if (SUFFIX && !/^[A-Za-z0-9._-]+$/.test(SUFFIX)) {
  console.error(`--suffix: [A-Za-z0-9._-] only (got ${JSON.stringify(SUFFIX)})`)
  process.exit(2)
}

/** Supersample factor. 2x box-downsampled in linear light stands in for MSAA. */
const SS = 2
/** Hard budget for the landscape hero. It is the LCP element. */
const MAX_BYTES = 180 * 1024

const TARGETS = [
  { name: 'hero-fallback', width: 1920, height: 1080, budget: MAX_BYTES },
  { name: 'hero-fallback-portrait', width: 1080, height: 1350, budget: MAX_BYTES },
]

/* ---------------------------------------------------------------------------
   SCENE — assembled exactly as components/hero/hero-scene.ts assembles it.
   --------------------------------------------------------------------------- */

const PROGRESS = PROGRESS_ARG ? Number(PROGRESS_ARG.split('=')[1]) : 1
/** A fresh scene starts with no accumulated idle rotation. */
const SPIN = 0

const faces = createFaceShapes()
const states = createPlateStates(faces)
const plate = createPlateGeometry()

const platePositions = plate.attributes.position.array
const PLATE_VERTS = plate.attributes.position.count
const PLATE_TRIS = PLATE_VERTS / 3

const group = groupTransform(PROGRESS)

/**
 * Builds every triangle of the solid in WORLD space for a given aspect ratio.
 * Aspect only enters through the horizontal drift of the assembly.
 */
function buildWorldTriangles(aspect) {
  const meshWorld = new Matrix4().makeRotationFromEuler({
    x: group.rotX,
    y: SPIN,
    z: group.rotZ,
    order: 'XYZ',
    isEuler: true,
  })
  meshWorld.setPosition(groupOffsetX(PROGRESS, aspect), group.y, 0)

  const instance = new Matrix4()
  const world = new Matrix4()
  const v = new Vector3()
  const tris = new Float32Array(faces.count * PLATE_TRIS * 9)
  let w = 0

  for (let i = 0; i < faces.count; i++) {
    composePlateMatrix(instance, states[i], faces.shapes[i], PROGRESS, 0)
    world.multiplyMatrices(meshWorld, instance)

    for (let t = 0; t < PLATE_VERTS; t++) {
      v.set(platePositions[t * 3], platePositions[t * 3 + 1], platePositions[t * 3 + 2])
      v.applyMatrix4(world)
      tris[w++] = v.x
      tris[w++] = v.y
      tris[w++] = v.z
    }
  }
  return tris
}

const TRI_COUNT = faces.count * PLATE_TRIS

/* ---------------------------------------------------------------------------
   RASTERISER
   --------------------------------------------------------------------------- */

const BG_LINEAR = [
  srgbChannelToLinear(((ATTESTATION.background >> 16) & 0xff) / 255),
  srgbChannelToLinear(((ATTESTATION.background >> 8) & 0xff) / 255),
  srgbChannelToLinear((ATTESTATION.background & 0xff) / 255),
]

/**
 * Renders the solid at `width x height` and returns sRGB-encoded RGBA bytes.
 */
function render(width, height) {
  const W = width * SS
  const H = height * SS
  const aspect = width / height
  const WORLD_TRIS = buildWorldTriangles(aspect)

  /* --- Camera: identical functions to the live scene --------------------- */

  const camera = new PerspectiveCamera(ATTESTATION.fov, aspect, ATTESTATION.near, ATTESTATION.far)
  camera.position.set(0, cameraHeight(PROGRESS), cameraDistance(PROGRESS, aspect))
  camera.lookAt(0, group.y, 0)
  camera.updateMatrixWorld(true)
  camera.updateProjectionMatrix()

  const view = new Matrix4().copy(camera.matrixWorld).invert()
  const viewProjection = new Matrix4().multiplyMatrices(camera.projectionMatrix, view)
  const viewNormal = new Matrix3().setFromMatrix4(view)

  /* --- Buffers ----------------------------------------------------------- */

  const colour = new Float32Array(W * H * 3)
  const depth = new Float32Array(W * H) // stores 1/w; larger is nearer
  for (let i = 0, n = W * H; i < n; i++) {
    colour[i * 3] = BG_LINEAR[0]
    colour[i * 3 + 1] = BG_LINEAR[1]
    colour[i * 3 + 2] = BG_LINEAR[2]
  }

  const clip = new Float32Array(12)
  const sx = new Float32Array(3)
  const sy = new Float32Array(3)
  const invW = new Float32Array(3)
  const shade = new Float32Array(3)
  const a = new Vector3()
  const b = new Vector3()
  const c = new Vector3()
  const e1 = new Vector3()
  const e2 = new Vector3()
  const n = new Vector3()

  const halfW = W / 2
  const halfH = H / 2
  const fogSq = ATTESTATION.fogDensity * ATTESTATION.fogDensity

  let drawn = 0

  for (let t = 0; t < TRI_COUNT; t++) {
    const o = t * 9
    a.set(WORLD_TRIS[o], WORLD_TRIS[o + 1], WORLD_TRIS[o + 2])
    b.set(WORLD_TRIS[o + 3], WORLD_TRIS[o + 4], WORLD_TRIS[o + 5])
    c.set(WORLD_TRIS[o + 6], WORLD_TRIS[o + 7], WORLD_TRIS[o + 8])

    // Clip space, one vertex at a time.
    let behind = false
    const verts = [a, b, c]
    for (let k = 0; k < 3; k++) {
      const p = verts[k]
      const e = viewProjection.elements
      const cw = e[3] * p.x + e[7] * p.y + e[11] * p.z + e[15]
      if (cw <= ATTESTATION.near) {
        behind = true
        break
      }
      clip[k * 4] = e[0] * p.x + e[4] * p.y + e[8] * p.z + e[12]
      clip[k * 4 + 1] = e[1] * p.x + e[5] * p.y + e[9] * p.z + e[13]
      clip[k * 4 + 3] = cw
    }
    // Nothing in this scene straddles the near plane; a whole-triangle reject is
    // sound and avoids a polygon clipper that would never run.
    if (behind) continue

    for (let k = 0; k < 3; k++) {
      const w = clip[k * 4 + 3]
      const iw = 1 / w
      invW[k] = iw
      sx[k] = (clip[k * 4] * iw + 1) * halfW
      sy[k] = (1 - clip[k * 4 + 1] * iw) * halfH
    }

    const area = (sx[1] - sx[0]) * (sy[2] - sy[0]) - (sx[2] - sx[0]) * (sy[1] - sy[0])
    if (!(Math.abs(area) > 1e-9)) continue

    let minX = Math.max(0, Math.floor(Math.min(sx[0], sx[1], sx[2])))
    let maxX = Math.min(W - 1, Math.ceil(Math.max(sx[0], sx[1], sx[2])))
    let minY = Math.max(0, Math.floor(Math.min(sy[0], sy[1], sy[2])))
    let maxY = Math.min(H - 1, Math.ceil(Math.max(sy[0], sy[1], sy[2])))
    if (minX > maxX || minY > maxY) continue

    /* --- Flat shading, once per triangle -------------------------------- */

    // Every plate face is flat, so the view-space normal - and therefore the
    // matcap lookup - is constant across the triangle. 2,560 shade calls for
    // the whole image instead of several million.
    e1.subVectors(b, a)
    e2.subVectors(c, a)
    n.crossVectors(e1, e2).applyMatrix3(viewNormal).normalize()
    // A matcap is indexed by the view-space normal of the surface facing the
    // camera; flip away-facing normals so interior walls are not black.
    if (n.z < 0) n.negate()
    shadeMatcap(n.x, n.y, shade)

    const invArea = 1 / area

    for (let py = minY; py <= maxY; py++) {
      const fy = py + 0.5
      for (let px = minX; px <= maxX; px++) {
        const fx = px + 0.5

        const w0 = (sx[1] - fx) * (sy[2] - fy) - (sx[2] - fx) * (sy[1] - fy)
        const w1 = (sx[2] - fx) * (sy[0] - fy) - (sx[0] - fx) * (sy[2] - fy)
        const w2 = (sx[0] - fx) * (sy[1] - fy) - (sx[1] - fx) * (sy[0] - fy)

        const b0 = w0 * invArea
        const b1 = w1 * invArea
        const b2 = w2 * invArea
        if (b0 < 0 || b1 < 0 || b2 < 0) continue

        // 1/w interpolates linearly in screen space; this is the depth test and
        // the fog depth in one value.
        const iw = b0 * invW[0] + b1 * invW[1] + b2 * invW[2]
        const idx = py * W + px
        if (iw <= depth[idx]) continue
        depth[idx] = iw

        // three's FogExp2: 1 - exp(-density^2 * depth^2), mixed in linear light.
        const fogDepth = 1 / iw
        const fog = 1 - Math.exp(-fogSq * fogDepth * fogDepth)
        const keep = 1 - fog

        const ci = idx * 3
        colour[ci] = shade[0] * keep + BG_LINEAR[0] * fog
        colour[ci + 1] = shade[1] * keep + BG_LINEAR[1] * fog
        colour[ci + 2] = shade[2] * keep + BG_LINEAR[2] * fog
        drawn++
      }
    }
  }

  /* --- Downsample in linear light, then encode to sRGB ------------------- */

  const out = Buffer.alloc(width * height * 4)
  const inv = 1 / (SS * SS)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0
      let g = 0
      let bl = 0
      for (let oy = 0; oy < SS; oy++) {
        const row = (y * SS + oy) * W
        for (let ox = 0; ox < SS; ox++) {
          const ci = (row + x * SS + ox) * 3
          r += colour[ci]
          g += colour[ci + 1]
          bl += colour[ci + 2]
        }
      }
      const oi = (y * width + x) * 4
      out[oi] = clamp255(linearChannelToSrgb(r * inv))
      out[oi + 1] = clamp255(linearChannelToSrgb(g * inv))
      out[oi + 2] = clamp255(linearChannelToSrgb(bl * inv))
      out[oi + 3] = 255
    }
  }

  return { data: out, shadedSamples: drawn }
}

function clamp255(v) {
  return Math.round(Math.min(1, Math.max(0, v)) * 255)
}

/* ---------------------------------------------------------------------------
   ENCODE
   --------------------------------------------------------------------------- */

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error(
    'render-hero-fallback: `sharp` is not resolvable. It ships with Next 15 as an\n' +
      'optional dependency; if it is missing, the images cannot be encoded here.',
  )
  process.exit(1)
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

console.log(`Attestation p=${PROGRESS}: ${faces.count} plates, ${TRI_COUNT} triangles`)

for (const target of TARGETS) {
  const started = Date.now()
  const { data, shadedSamples } = render(target.width, target.height)
  const raw = { width: target.width, height: target.height, channels: 4 }
  const file = resolve(OUT_DIR, `${target.name}${SUFFIX}.webp`)

  // Belt beside the charset brace above: assert the resolved path is still
  // INSIDE OUT_DIR before anything is written. If the suffix rule is ever
  // loosened, this is what stops a write escaping public/img.
  if (!file.startsWith(OUT_DIR + sep)) {
    console.error(`refusing to write outside ${OUT_DIR}: ${file}`)
    process.exit(2)
  }

  // Step the quality down until the budget is met. A near-black, smoothly
  // shaded frame compresses very well, so this rarely iterates.
  let quality = START_QUALITY
  let bytes = Infinity
  for (;;) {
    await sharp(data, { raw })
      .webp({ quality, effort: 6, smartSubsample: true })
      .toFile(file)
    bytes = statSync(file).size
    if (bytes <= target.budget || quality <= 50) break
    quality -= 6
  }

  if (WANT_PNG) {
    await sharp(data, { raw }).png({ compressionLevel: 9 }).toFile(file.replace(/\.webp$/, '.png'))
  }

  const kb = (bytes / 1024).toFixed(1)
  const verdict = bytes <= target.budget ? 'OK' : 'OVER BUDGET'
  console.log(
    `  ${target.name}${SUFFIX}.webp  ${target.width}x${target.height}  q${quality}  ${kb} KB  ` +
      `${verdict}  (${shadedSamples.toLocaleString('en-GB')} samples, ${Date.now() - started} ms)`,
  )
  if (bytes > target.budget) process.exitCode = 1
}
