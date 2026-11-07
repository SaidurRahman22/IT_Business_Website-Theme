/* =============================================================================
   HERO SCENE - a network under observation, and under your hand.

   WHAT IT DEPICTS
   Nodes are hosts. A few are gateways and draw a halo. Edges are the links
   between them, and each link carries a travelling pulse of its own traffic.
   Packets run the edges; roughly one in eight is hostile and is stopped short
   of its target with a ring at the boundary. A monitoring sweep crosses the
   structure continuously. That is the firm's proposition rendered literally -
   we build the system and we attack it - rather than as an abstract form.

   WHAT THE VISITOR CAN DO (this is the part that was missing)
   - MOVE the pointer over the hero and the network responds: a scan light
     follows the cursor and illuminates whatever is under it, the mesh bends
     away from it in screen space, and PROBE LINES reach from the cursor to the
     three nearest hosts with a lock-on reticle on the closest.
   - CLICK (or tap) anywhere over the scene and a sweep pulse propagates
     outward from that point. It is not a decorative ripple: the wavefront
     physically displaces the graph as it crosses, lights every node and link it
     passes, and CATCHES hostile packets inside it - they flash red and stop. A
     click is a scan, and a scan finds the intruder.

   HOW THE INTERACTION IS IMPLEMENTED
   One shared GLSL chunk (FIELD_GLSL) defines the interaction field in SCREEN
   space, and every layer - dust, edges, nodes, packets - includes it and warps
   through the same two functions. That is why the graph deforms as one object
   instead of four layers sliding against each other. Doing it in clip space
   rather than model space also means the cursor affects what is visually near
   it, which is what a viewer expects, instead of what is near it in a rotated
   3D model they cannot see.

   COLOUR IS NOT HARD-CODED
   Every colour is read from CSS custom properties at init (--accent-500,
   --accent-300, --danger-500, --fg). Change the palette in globals.css and the
   scene follows. Nothing here needs editing to re-theme the site.

   The accent is still rationed. Healthy traffic, links, hosts, the cursor's
   scan light and the sweep are all NEUTRAL. Red is spent on exactly two things:
   a packet being stopped, and the lock-on reticle. If everything is red then
   nothing is an alert.

   PERFORMANCE CONTRACT
   - Device pixel ratio capped at 2. Uncapped DPR on a 3x phone is a GPU stall.
   - Five draw calls: dust, edges, nodes, packets, probe lines.
   - Packet and pulse motion is computed in the vertex/fragment shaders from one
     time uniform. There is no per-frame JS allocation and no per-packet object.
   - The only per-frame CPU work is projecting 44 node positions to find the one
     under the cursor, and writing 18 floats into the probe-line buffer.
   - The loop is driven by the caller, which pauses it when the canvas leaves
     the viewport or the document hides.
   ============================================================================= */

import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Euler,
  LineSegments,
  type Material,
  Matrix4,
  Points,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from 'three'

/** Deterministic PRNG. The layout must be identical on every load, otherwise
 *  the still frame shown under reduced motion and the live scene disagree. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const NODE_COUNT = 44
const GATEWAY_COUNT = 5
/** Each host links to its K nearest neighbours. A distance THRESHOLD was the
 *  first approach and it is not stable in the way that matters: change the node
 *  count and the edge count moves non-linearly, from a sparse dotted cloud to
 *  an unreadable mush. k-nearest gives a predictable ~1.5N edges and always
 *  produces a connected-looking graph. */
const K_NEIGHBOURS = 3
const PACKETS_PER_EDGE = 2
const DUST_COUNT = 420
const RIPPLE_SLOTS = 4
const RIPPLE_LIFE = 3.4
const PROBE_LINKS = 3

type Palette = { accent: Color; accentDim: Color; danger: Color; fg: Color }

/** Read a CSS custom property into a three Color. Falls back if the token is
 *  missing so a renamed variable degrades to something sane instead of black. */
function tokenColor(el: HTMLElement, name: string, fallback: string): Color {
  const raw = getComputedStyle(el).getPropertyValue(name).trim()
  try {
    return new Color(raw || fallback)
  } catch {
    return new Color(fallback)
  }
}

export type SceneHandle = {
  /** Advance and draw one frame. `tSeconds` is absolute, not a delta. */
  frame: (tSeconds: number) => void
  /** Re-read canvas size. Safe to call on every resize event. */
  resize: () => void
  /** Pointer in normalised device coords. `inside` false fades the field out. */
  setPointer: (x: number, y: number, inside: boolean) => void
  /** Fire a sweep pulse from a point in normalised device coords. */
  pulse: (x: number, y: number) => void
  /** Release every GPU resource and drop references. */
  dispose: () => void
}

/* -----------------------------------------------------------------------------
   THE INTERACTION FIELD

   Included verbatim by every layer's vertex shader, and by the fragment shaders
   that need the glow. Two functions:

   fieldOffset(ndc) - how far this point is pushed, in NDC. The cursor pushes
     geometry away from itself with a gaussian falloff; each live ripple pushes
     geometry outward in a narrow band at the wavefront radius, decaying with
     age. Applied in clip space as `clip.xy += offset * clip.w`, which is the
     standard way to add a screen-space offset without undoing perspective.

   fieldGlow(ndc) - how brightly this point is lit by the cursor and by any
     wavefront crossing it. Returned to the caller as a varying so the fragment
     shader can tint and brighten.

   `uAspect` is applied to every difference so the cursor's influence is a
   CIRCLE on screen. Without it the field is an ellipse stretched by the canvas
   aspect, which on a 16:9 hero looks like the cursor is dragging a wide smear.

   NOTE ON pow(): GLSL pow(x, 2.0) is undefined for negative x, and (r - front)
   is negative inside the wavefront - that is half the domain. Every squaring
   here is written q*q for that reason.
   --------------------------------------------------------------------------- */
const FIELD_GLSL = /* glsl */ `
  uniform vec2  uPointer;
  uniform float uPointerAmt;
  uniform vec4  uRipples[${RIPPLE_SLOTS}];
  uniform float uAspect;

  vec2 fieldOffset(vec2 ndc) {
    vec2 off = vec2(0.0);

    vec2 d = (ndc - uPointer) * vec2(uAspect, 1.0);
    float r = max(length(d), 1e-4);
    off += (d / r) * exp(-r * r * 3.2) * uPointerAmt * 0.085;

    for (int i = 0; i < ${RIPPLE_SLOTS}; i++) {
      vec4 rp = uRipples[i];
      if (rp.z < 0.0) continue;
      vec2 rd = (ndc - rp.xy) * vec2(uAspect, 1.0);
      float rr = max(length(rd), 1e-4);
      float q = (rr - rp.z * 1.25) * 6.0;
      off += (rd / rr) * exp(-q * q) * exp(-rp.z * 1.4) * rp.w * 0.085;
    }
    return off;
  }

  float fieldGlow(vec2 ndc) {
    // 3.2, not 6.0. At 6.0 the cursor lit a radius of about 0.4 NDC, which on
    // this graph is often one node and sometimes none, so moving the pointer
    // changed nothing a visitor could see. The scan light has to cover enough
    // of the structure to read as a light being moved over it.
    vec2 d = (ndc - uPointer) * vec2(uAspect, 1.0);
    float g = exp(-dot(d, d) * 3.2) * uPointerAmt;

    for (int i = 0; i < ${RIPPLE_SLOTS}; i++) {
      vec4 rp = uRipples[i];
      if (rp.z < 0.0) continue;
      float rr = length((ndc - rp.xy) * vec2(uAspect, 1.0));
      float q = (rr - rp.z * 1.25) * 7.0;
      g += exp(-q * q) * exp(-rp.z * 1.3) * rp.w;
    }
    return g;
  }

  vec4 warp(vec4 clip) {
    clip.xy += fieldOffset(clip.xy / clip.w) * clip.w;
    return clip;
  }
`

export function createNetworkScene(canvas: HTMLCanvasElement, host: HTMLElement): SceneHandle | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  } catch {
    // Context creation can fail on blocklisted drivers. The caller renders
    // nothing at all in that case; it must not throw into React's render.
    return null
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))

  const palette: Palette = {
    accent: tokenColor(host, '--accent-500', '#3b82f6'),
    accentDim: tokenColor(host, '--accent-300', '#93c5fd'),
    danger: tokenColor(host, '--danger-500', '#f43f5e'),
    fg: tokenColor(host, '--fg', '#f4f1ea'),
  }

  const scene = new Scene()
  const camera = new PerspectiveCamera(42, 1, 0.1, 50)
  camera.position.set(0, 0, 5.2)
  // project() reads matrixWorldInverse. The renderer refreshes it during
  // render(), but the first frame's probe lines are computed BEFORE the first
  // render, so without this the opening frame projects against an identity
  // matrix and the probes snap into place on frame two.
  camera.updateMatrixWorld()
  camera.matrixWorldInverse.copy(camera.matrixWorld).invert()

  /* ---- shared uniforms ----------------------------------------------------
     Spread into every material. Spreading copies the REFERENCES to these
     uniform objects, not their values, so writing shared.uTime.value once per
     frame updates all five materials. */
  const shared = {
    uTime: { value: 0 },
    uPointer: { value: new Vector2(0, 0) },
    uPointerAmt: { value: 0 },
    uRipples: {
      value: Array.from({ length: RIPPLE_SLOTS }, () => new Vector4(0, 0, -1, 0)),
    },
    uAspect: { value: 1 },
    uScale: { value: 1 },
    uSweep: { value: 0 },
    uSurge: { value: 0 },
  }

  // ---- node layout ---------------------------------------------------------
  // Nodes sit on a flattened shell rather than a cube, so the graph reads as one
  // connected system seen slightly from the side instead of a box of dots.
  const rand = mulberry32(0x5eed)
  const nodes: Vector3[] = []
  for (let i = 0; i < NODE_COUNT; i += 1) {
    const u = rand() * Math.PI * 2
    const v = Math.acos(2 * rand() - 1)
    const r = 1.5 + rand() * 0.62
    nodes.push(
      new Vector3(
        Math.sin(v) * Math.cos(u) * r,
        Math.sin(v) * Math.sin(u) * r * 0.62,
        Math.cos(v) * r * 0.78,
      ),
    )
  }

  // A handful of hosts are gateways: larger, haloed, and over-linked. A graph
  // where every node is identical reads as noise; a graph with a few hubs reads
  // as infrastructure.
  const isGateway = new Float32Array(NODE_COUNT)
  for (let g = 0; g < GATEWAY_COUNT; g += 1) {
    isGateway[Math.floor(rand() * NODE_COUNT)] = 1
  }

  // ---- edges: k-nearest neighbours, plus gateway backbone ------------------
  const edgeSet = new Set<number>()
  const edges: Array<[number, number]> = []
  const addEdge = (a: number, b: number) => {
    if (a === b) return
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    const key = lo * NODE_COUNT + hi
    if (edgeSet.has(key)) return
    edgeSet.add(key)
    edges.push([lo, hi])
  }

  const order: number[] = []
  for (let i = 0; i < NODE_COUNT; i += 1) {
    order.length = 0
    for (let j = 0; j < NODE_COUNT; j += 1) if (j !== i) order.push(j)
    order.sort((a, b) => nodes[i].distanceToSquared(nodes[a]) - nodes[i].distanceToSquared(nodes[b]))
    const k = isGateway[i] ? K_NEIGHBOURS + 3 : K_NEIGHBOURS
    for (let n = 0; n < k && n < order.length; n += 1) addEdge(i, order[n])
  }

  const EDGE_COUNT = edges.length

  // Two vertices per edge, each carrying its position along the link (0 or 1)
  // and the edge's own seed, so the fragment shader can run a traffic pulse
  // down the line without any CPU involvement.
  const edgePos = new Float32Array(EDGE_COUNT * 6)
  const edgeT = new Float32Array(EDGE_COUNT * 2)
  const edgeSeedAttr = new Float32Array(EDGE_COUNT * 2)
  edges.forEach(([a, b], k) => {
    edgePos.set([nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z], k * 6)
    edgeT[k * 2] = 0
    edgeT[k * 2 + 1] = 1
    const s = rand()
    edgeSeedAttr[k * 2] = s
    edgeSeedAttr[k * 2 + 1] = s
  })

  const edgeGeo = new BufferGeometry()
  edgeGeo.setAttribute('position', new BufferAttribute(edgePos, 3))
  edgeGeo.setAttribute('aT', new BufferAttribute(edgeT, 1))
  edgeGeo.setAttribute('aEdgeSeed', new BufferAttribute(edgeSeedAttr, 1))

  // Edges are NEUTRAL. They were accent-coloured once, which with a red accent
  // turned every link in the graph red and left the interceptions with nothing
  // to stand out against - the whole network read as an alarm instead of as a
  // healthy system in which something occasionally gets stopped.
  const edgeMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { ...shared, uColor: { value: palette.fg } },
    vertexShader: /* glsl */ `
      ${FIELD_GLSL}
      attribute float aT;
      attribute float aEdgeSeed;
      varying float vT;
      varying float vSeed;
      varying float vGlow;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec4 clip = projectionMatrix * mv;
        vGlow = fieldGlow(clip.xy / clip.w);
        vT = aT;
        vSeed = aEdgeSeed;
        gl_Position = warp(clip);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uSurge;
      uniform vec3  uColor;
      varying float vT;
      varying float vSeed;
      varying float vGlow;

      void main() {
        // One pulse of traffic travelling the link. Each link runs at its own
        // speed and phase; a synchronised network reads as a screensaver.
        float head = fract(uTime * (0.09 + vSeed * 0.15) * (1.0 + uSurge) + vSeed);

        // Three candidate distances so the pulse wraps around the end of the
        // link instead of popping out of existence at t=1 and back in at t=0.
        float q0 = (vT - head) * 9.0;
        float q1 = (vT - head + 1.0) * 9.0;
        float q2 = (vT - head - 1.0) * 9.0;
        float pulse = max(max(exp(-q0 * q0), exp(-q1 * q1)), exp(-q2 * q2));

        float a = 0.055 + pulse * 0.30 + vGlow * 0.45;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  })
  const edgeMesh = new LineSegments(edgeGeo, edgeMat)
  scene.add(edgeMesh)

  // ---- dust ----------------------------------------------------------------
  // A dim field of points behind the graph. It is not decoration for its own
  // sake: without it the network floats on flat black and the parallax has
  // nothing to read against, so the rotation looks like a 2D spin.
  const dustPos = new Float32Array(DUST_COUNT * 3)
  const dustSeed = new Float32Array(DUST_COUNT)
  for (let i = 0; i < DUST_COUNT; i += 1) {
    const u = rand() * Math.PI * 2
    const v = Math.acos(2 * rand() - 1)
    const r = 2.1 + rand() * 2.6
    dustPos.set(
      [Math.sin(v) * Math.cos(u) * r, Math.sin(v) * Math.sin(u) * r * 0.7, Math.cos(v) * r],
      i * 3,
    )
    dustSeed[i] = rand()
  }
  const dustGeo = new BufferGeometry()
  dustGeo.setAttribute('position', new BufferAttribute(dustPos, 3))
  dustGeo.setAttribute('aSeed', new BufferAttribute(dustSeed, 1))

  const dustMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: { ...shared, uColor: { value: palette.fg } },
    vertexShader: /* glsl */ `
      ${FIELD_GLSL}
      attribute float aSeed;
      uniform float uTime;
      uniform float uScale;
      varying float vA;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec4 clip = projectionMatrix * mv;
        float glow = fieldGlow(clip.xy / clip.w);
        vA = (0.10 + 0.10 * sin(uTime * 0.6 + aSeed * 6.2831)) + glow * 0.4;
        gl_Position = warp(clip);
        gl_PointSize = (0.9 + aSeed * 0.9 + glow * 2.0) * uScale * (6.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vA;
      void main() {
        vec2 d = gl_PointCoord - vec2(0.5);
        float r = length(d);
        if (r > 0.5) discard;
        gl_FragColor = vec4(uColor, vA * smoothstep(0.5, 0.0, r));
      }
    `,
  })
  const dust = new Points(dustGeo, dustMat)
  scene.add(dust)

  // ---- nodes ---------------------------------------------------------------
  const nodePos = new Float32Array(NODE_COUNT * 3)
  const nodeSeed = new Float32Array(NODE_COUNT)
  nodes.forEach((n, i) => {
    nodePos.set([n.x, n.y, n.z], i * 3)
    nodeSeed[i] = rand()
  })
  const nodeGeo = new BufferGeometry()
  nodeGeo.setAttribute('position', new BufferAttribute(nodePos, 3))
  nodeGeo.setAttribute('aSeed', new BufferAttribute(nodeSeed, 1))
  nodeGeo.setAttribute('aRole', new BufferAttribute(isGateway, 1))

  const nodeMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      ...shared,
      uColor: { value: palette.fg },
      // The lock-on reticle is the one place a single host is called out, so it
      // gets the on-dark accent. --accent-300, not --accent-500: the 500 is
      // tuned for a CTA fill on a light ground and measures 3.98:1 against
      // ink-900, which is close to invisible on this hero.
      uLockColor: { value: palette.accentDim },
      // The locked node's MODEL-space position. Compared by distance rather
      // than by index because a Points shader has no reliable instance id in
      // WebGL1, and node positions are unique by construction.
      uLockPos: { value: new Vector3(99, 99, 99) },
      uLockAmt: { value: 0 },
    },
    vertexShader: /* glsl */ `
      ${FIELD_GLSL}
      attribute float aSeed;
      attribute float aRole;
      uniform float uTime;
      uniform float uScale;
      uniform float uSweep;
      uniform vec3  uLockPos;
      uniform float uLockAmt;
      varying float vPulse;
      varying float vGlow;
      varying float vRole;
      varying float vLock;

      void main() {
        // Each host breathes on its own phase.
        vPulse = 0.55 + 0.45 * sin(uTime * 1.1 + aSeed * 6.2831);

        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec4 clip = projectionMatrix * mv;

        // The monitoring sweep is a band in MODEL space, so it travels through
        // the structure with the structure rather than sliding across the
        // screen independently of it.
        float sq = (position.x - uSweep) * 2.0;
        float sweep = exp(-sq * sq);

        vGlow = fieldGlow(clip.xy / clip.w) + sweep * 0.7;
        vRole = aRole;
        // A RADIUS, NOT AN EQUALITY TEST. This was step(0.0005, distance(...)),
        // which selects the locked host only if its float32 attribute and the
        // float64 uniform round to the same value - true today, and silently
        // false the moment anything perturbs either. Nodes are never closer
        // than ~0.2 apart, so a 0.05 radius still selects exactly one.
        vLock = uLockAmt * (1.0 - smoothstep(0.0, 0.05, distance(position, uLockPos)));

        gl_Position = warp(clip);
        float size = 2.3 + vPulse * 2.4 + aRole * 2.4 + vGlow * 6.0 + vLock * 7.0;
        gl_PointSize = size * uScale * (6.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec3 uLockColor;
      varying float vPulse;
      varying float vGlow;
      varying float vRole;
      varying float vLock;

      void main() {
        vec2 d = gl_PointCoord - vec2(0.5);
        float r = length(d);
        if (r > 0.5) discard;

        float core = smoothstep(0.5, 0.0, r);
        // Gateways carry a halo and the locked host a tighter reticle, so the
        // three states are told apart by SHAPE, not only by brightness.
        float halo = smoothstep(0.26, 0.36, r) * smoothstep(0.5, 0.36, r);

        float a = core * (0.30 + vPulse * 0.45)
                + halo * (vRole * 0.30 + vLock * 1.30)
                + core * vGlow * 0.80;

        vec3 col = mix(uColor, uLockColor, clamp(vLock, 0.0, 1.0));
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
      }
    `,
  })
  const nodeMesh = new Points(nodeGeo, nodeMat)
  scene.add(nodeMesh)

  // ---- packets -------------------------------------------------------------
  // Points whose position along their edge is derived in the shader from uTime
  // and a per-packet offset, so the CPU never touches them.
  const pCount = EDGE_COUNT * PACKETS_PER_EDGE
  const pA = new Float32Array(pCount * 3)
  const pB = new Float32Array(pCount * 3)
  const pOff = new Float32Array(pCount)
  const pSpeed = new Float32Array(pCount)
  const pHostile = new Float32Array(pCount)

  for (let k = 0; k < pCount; k += 1) {
    const [a, b] = edges[k % EDGE_COUNT]
    // Alternate direction on the second pass so links carry traffic both ways.
    const flip = k >= EDGE_COUNT
    const from = flip ? b : a
    const to = flip ? a : b
    pA.set([nodes[from].x, nodes[from].y, nodes[from].z], k * 3)
    pB.set([nodes[to].x, nodes[to].y, nodes[to].z], k * 3)
    pOff[k] = rand()
    pSpeed[k] = 0.14 + rand() * 0.2
    // MEASURED, NOT GUESSED. This was 0.13, carried over from when there was
    // one packet per edge. Doubling the packets per edge and moving to a
    // k-nearest graph took the packet count to ~156, so 0.13 put ~20 hostile
    // packets in the scene and a screenshot at any instant showed 10 to 16 red
    // rings at once. That is a network permanently under attack, which is the
    // precise failure the note above warns about, and it spends the only accent
    // the page has on wallpaper. At 0.055 there are ~9, and because the ring is
    // now an event that fades (see the packet shader) only two or three are
    // alight at any moment.
    pHostile[k] = rand() < 0.055 ? 1 : 0
  }

  const pGeo = new BufferGeometry()
  pGeo.setAttribute('position', new BufferAttribute(pA, 3)) // required by three
  pGeo.setAttribute('aFrom', new BufferAttribute(pA, 3))
  pGeo.setAttribute('aTo', new BufferAttribute(pB, 3))
  pGeo.setAttribute('aOffset', new BufferAttribute(pOff, 1))
  pGeo.setAttribute('aSpeed', new BufferAttribute(pSpeed, 1))
  pGeo.setAttribute('aHostile', new BufferAttribute(pHostile, 1))

  const pMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      ...shared,
      // Healthy traffic is NEUTRAL, the threat is the brand red. The reverse
      // was the first version and it made the whole graph red, so the
      // interception had nothing to contrast against and the page had no colour
      // left to direct attention with.
      uAccent: { value: palette.fg },
      uDanger: { value: palette.accentDim },
    },
    vertexShader: /* glsl */ `
      ${FIELD_GLSL}
      attribute vec3  aFrom;
      attribute vec3  aTo;
      attribute float aOffset;
      attribute float aSpeed;
      attribute float aHostile;
      uniform float uTime;
      uniform float uScale;
      uniform float uSurge;
      varying float vHostile;
      varying float vFade;
      varying float vBlocked;
      varying float vGlow;

      void main() {
        // A click briefly raises throughput across the whole graph: the system
        // responding to being probed, not just a ring expanding over it.
        float t = fract(uTime * aSpeed * (1.0 + uSurge * 0.8) + aOffset);

        // A hostile packet is stopped at 0.72 of the way to its target. It does
        // not reach the node: that is the entire point of the image.
        float stop = 0.72;
        float natural = aHostile * step(stop, t);
        float travel = mix(t, min(t, stop), aHostile);

        vec3 p = mix(aFrom, aTo, travel);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vec4 clip = projectionMatrix * mv;

        float glow = fieldGlow(clip.xy / clip.w);
        vGlow = glow;

        // THE SWEEP CATCHES INTRUDERS. A hostile packet inside a wavefront or
        // under the cursor is stopped early and flares. This is what makes the
        // click mean something: a scan finds the thing that was still moving.
        float caught = aHostile * smoothstep(0.30, 0.70, glow);
        float blocked = max(natural, caught);

        gl_Position = warp(clip);

        // AN INTERCEPTION IS AN EVENT, NOT A STATE. A blocked packet used to
        // park at its stop point and stay lit from t=0.72 to t=1.0, i.e. 28% of
        // every cycle, so the rings accumulated into a permanent rash of red
        // rather than reading as something happening. It now flares at the
        // moment of the block and decays over roughly a second, which is also
        // the truthful picture: the thing was stopped, it is not still being
        // stopped. A packet caught by a sweep holds its flare while the
        // wavefront is on it, because that one IS still being held.
        float sinceBlock = max(t - stop, 0.0);
        float flare = max(exp(-sinceBlock * 11.0), caught);

        // Fade in and out at the ends so packets appear to enter and leave a
        // host rather than pop into existence mid-link.
        float ends = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.92, 1.0, t));
        vFade = ends * mix(1.0, flare, blocked);
        vHostile = aHostile;
        vBlocked = blocked;

        float size = 2.9 + blocked * 9.0 * flare + glow * 2.5;
        gl_PointSize = size * uScale * (6.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uAccent;
      uniform vec3 uDanger;
      varying float vHostile;
      varying float vFade;
      varying float vBlocked;
      varying float vGlow;

      void main() {
        vec2 d = gl_PointCoord - vec2(0.5);
        float r = length(d);
        if (r > 0.5) discard;

        vec3 col = mix(uAccent, uDanger, max(vHostile * vBlocked, vHostile * 0.75));
        float core = smoothstep(0.5, 0.05, r);

        // A blocked packet renders as a ring rather than a dot: the shape of an
        // impact at a boundary, not of a thing still moving.
        float ring = smoothstep(0.28, 0.42, r) * smoothstep(0.5, 0.42, r);
        float shape = mix(core, max(core * 0.35, ring * 1.6), vBlocked);

        gl_FragColor = vec4(col, shape * vFade * (0.9 + vGlow * 0.8));
      }
    `,
  })
  const packets = new Points(pGeo, pMat)
  scene.add(packets)

  // ---- probe lines ---------------------------------------------------------
  // Drawn from the cursor to the nearest hosts. These are in WORLD space and
  // the object is never rotated: one end is pinned to the pointer, which does
  // not rotate with the graph.
  const probePos = new Float32Array(PROBE_LINKS * 6)
  const probeT = new Float32Array(PROBE_LINKS * 2)
  for (let i = 0; i < PROBE_LINKS; i += 1) {
    probeT[i * 2] = 0 // cursor end
    probeT[i * 2 + 1] = 1 // host end
  }
  const probePosAttr = new BufferAttribute(probePos, 3)
  probePosAttr.setUsage(DynamicDrawUsage)
  const probeGeo = new BufferGeometry()
  probeGeo.setAttribute('position', probePosAttr)
  probeGeo.setAttribute('aT', new BufferAttribute(probeT, 1))

  const probeMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uColor: { value: palette.fg },
      uAmt: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aT;
      varying float vT;
      void main() {
        vT = aT;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3  uColor;
      uniform float uAmt;
      uniform float uTime;
      varying float vT;
      void main() {
        // Brightest at the host end. A line brightest at the cursor reads as
        // something leaking out of the pointer; brightest at the host reads as
        // the host being interrogated.
        //
        // MEASURED. At 0.04/0.38 these lines were drawing and invisible: a
        // 44px box on the cursor measured 1.05x brighter on hover than off,
        // i.e. the whole interaction was worth a 5% lift in the one place it
        // should have been loudest. Projecting the endpoints explained it - the
        // three nearest hosts sit only 50 to 80px away, so these are short
        // stubs, and a short stub has to be bright to exist at all.
        float a = mix(0.25, 0.90, vT) * uAmt;
        a *= 0.75 + 0.25 * sin(uTime * 9.0 - vT * 7.0);
        gl_FragColor = vec4(uColor, a);
      }
    `,
  })
  const probes = new LineSegments(probeGeo, probeMat)
  // One end tracks the cursor and can leave the graph's bounding sphere, which
  // three computes once from the initial (all-zero) buffer. Without this the
  // whole object is culled the moment the pointer moves off centre.
  probes.frustumCulled = false
  scene.add(probes)

  // ---- the reticle ---------------------------------------------------------
  // A ring and crosshair pinned to the cursor's position in the scene.
  //
  // This is the piece that makes the rest of the pointer work legible. The
  // probe lines are short by construction (they go to the NEAREST hosts, which
  // are by definition close), so on their own they read as a bit of stray
  // brightness rather than as an action. The reticle says where the scan is,
  // and the lines then read as what it has found.
  //
  // It is sized in PIXELS and not divided by depth, unlike every other sprite
  // here: it is an instrument drawn over the scene, not an object inside it,
  // so it must not shrink as the cursor passes over more distant parts.
  const reticleGeo = new BufferGeometry()
  const reticlePos = new Float32Array(3)
  const reticlePosAttr = new BufferAttribute(reticlePos, 3)
  reticlePosAttr.setUsage(DynamicDrawUsage)
  reticleGeo.setAttribute('position', reticlePosAttr)

  const reticleMat = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uColor: { value: palette.fg },
      uAmt: { value: 0 },
      uTime: { value: 0 },
      uScale: shared.uScale,
    },
    vertexShader: /* glsl */ `
      uniform float uScale;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 46.0 * uScale;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3  uColor;
      uniform float uAmt;
      uniform float uTime;
      void main() {
        vec2 d = gl_PointCoord - vec2(0.5);
        float r = length(d);
        if (r > 0.5) discard;

        float ring = smoothstep(0.30, 0.355, r) * smoothstep(0.43, 0.375, r);
        // Four cardinal ticks sitting outside the ring. A bare circle reads as
        // a bubble; the ticks are what make it read as an instrument.
        vec2 a = abs(d);
        float ticks = (step(a.x, 0.011) + step(a.y, 0.011))
                    * smoothstep(0.43, 0.46, r) * smoothstep(0.5, 0.47, r);
        float core = smoothstep(0.045, 0.0, r);

        float breathe = 0.82 + 0.18 * sin(uTime * 3.4);
        gl_FragColor = vec4(uColor, (ring * 0.85 + ticks * 0.9 + core * 0.9) * uAmt * breathe);
      }
    `,
  })
  const reticle = new Points(reticleGeo, reticleMat)
  reticle.frustumCulled = false
  scene.add(reticle)

  // ---- interaction state ---------------------------------------------------
  let pointerX = 0
  let pointerY = 0
  let targetX = 0
  let targetY = 0
  let pointerAmt = 0
  let pointerTargetAmt = 0
  let surge = 0

  type Ripple = { x: number; y: number; start: number; strength: number }
  const ripples: Ripple[] = Array.from({ length: RIPPLE_SLOTS }, () => ({
    x: 0,
    y: 0,
    start: -1e9,
    strength: 0,
  }))
  let nextRipple = 0
  let now = 0

  // Scratch objects, reused every frame. Allocating a Vector3 per node per
  // frame is 44 * 60 = 2,640 allocations a second for nothing.
  const rotEuler = new Euler(0, 0, 0, 'XYZ')
  const rotMat = new Matrix4()
  const scratch = new Vector3()
  const cursorWorld = new Vector3()
  const rayDir = new Vector3()
  const nearIdx: number[] = []
  const nearDist: number[] = []
  let lockAmt = 0

  function resize() {
    const w = canvas.clientWidth || 1
    const h = canvas.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert()
    shared.uAspect.value = w / h
    // Point sprites are sized in pixels, so they must scale with the canvas or
    // the graph looks dense on a phone and sparse on a 4K monitor.
    shared.uScale.value = Math.min(Math.max(h / 760, 0.72), 1.5)
  }

  function setPointer(x: number, y: number, inside: boolean) {
    if (inside) {
      targetX = x
      targetY = y
    }
    pointerTargetAmt = inside ? 1 : 0
  }

  function pulse(x: number, y: number) {
    const slot = ripples[nextRipple]
    slot.x = x
    slot.y = y
    slot.start = now
    slot.strength = 1
    nextRipple = (nextRipple + 1) % RIPPLE_SLOTS
    // The click also kicks traffic. Capped, so hammering the mouse does not
    // wind the whole graph up into a blur.
    surge = Math.min(surge + 0.9, 1.6)
  }

  function frame(t: number) {
    now = t
    shared.uTime.value = t
    probeMat.uniforms.uTime.value = t

    // Ease toward the pointer. A direct bind makes the scene twitch.
    pointerX += (targetX - pointerX) * 0.07
    pointerY += (targetY - pointerY) * 0.07
    pointerAmt += (pointerTargetAmt - pointerAmt) * 0.06
    surge += (0 - surge) * 0.012

    shared.uPointer.value.set(pointerX, pointerY)
    shared.uPointerAmt.value = pointerAmt
    shared.uSurge.value = surge

    for (let i = 0; i < RIPPLE_SLOTS; i += 1) {
      const rp = ripples[i]
      const age = t - rp.start
      const v = shared.uRipples.value[i]
      if (age < 0 || age > RIPPLE_LIFE) v.set(0, 0, -1, 0)
      else v.set(rp.x, rp.y, age, rp.strength)
    }

    // The monitoring sweep. Slow enough to read as surveillance rather than as
    // a loading bar.
    shared.uSweep.value = Math.sin(t * 0.13) * 2.6

    const yaw = t * 0.045 + pointerX * 0.26
    const pitch = -pointerY * 0.18 + Math.sin(t * 0.21) * 0.035
    edgeMesh.rotation.set(pitch, yaw, 0)
    nodeMesh.rotation.set(pitch, yaw, 0)
    packets.rotation.set(pitch, yaw, 0)
    dust.rotation.set(pitch, yaw, 0)

    // ---- probe lines + lock-on ---------------------------------------------
    // Project every node to screen space and find the ones nearest the cursor.
    // 44 projections a frame; the alternative (raycasting a Points cloud) is
    // both slower and needs a threshold tuned per zoom level.
    rotEuler.set(pitch, yaw, 0)
    rotMat.makeRotationFromEuler(rotEuler)

    // Partial selection, not a sort: only the three nearest matter and an
    // Array.sort of 44 objects every frame allocates a comparator closure and
    // garbage for a result that is thrown away.
    nearIdx.length = 0
    nearDist.length = 0
    for (let i = 0; i < NODE_COUNT; i += 1) {
      scratch.copy(nodes[i]).applyMatrix4(rotMat).project(camera)
      const dx = (scratch.x - pointerX) * shared.uAspect.value
      const dy = scratch.y - pointerY
      const d = dx * dx + dy * dy
      let slot = nearIdx.length
      while (slot > 0 && nearDist[slot - 1] > d) slot -= 1
      if (slot < PROBE_LINKS) {
        nearIdx.splice(slot, 0, i)
        nearDist.splice(slot, 0, d)
        if (nearIdx.length > PROBE_LINKS) {
          nearIdx.length = PROBE_LINKS
          nearDist.length = PROBE_LINKS
        }
      }
    }

    // Cursor position in world space, on the z=0 plane the graph is centred on.
    scratch.set(pointerX, pointerY, 0.5).unproject(camera)
    rayDir.copy(scratch).sub(camera.position)
    const tPlane = rayDir.z !== 0 ? -camera.position.z / rayDir.z : 0
    cursorWorld.copy(camera.position).addScaledVector(rayDir, tPlane)

    for (let k = 0; k < PROBE_LINKS; k += 1) {
      scratch.copy(nodes[nearIdx[k] ?? 0]).applyMatrix4(rotMat)
      probePos.set(
        [cursorWorld.x, cursorWorld.y, cursorWorld.z, scratch.x, scratch.y, scratch.z],
        k * 6,
      )
    }
    probePosAttr.needsUpdate = true
    probeMat.uniforms.uAmt.value = pointerAmt

    reticlePos[0] = cursorWorld.x
    reticlePos[1] = cursorWorld.y
    reticlePos[2] = cursorWorld.z
    reticlePosAttr.needsUpdate = true
    reticleMat.uniforms.uAmt.value = pointerAmt
    reticleMat.uniforms.uTime.value = t

    // Lock on only when the cursor is genuinely near a host. Without the
    // distance gate the reticle teleports around the graph whenever the pointer
    // is nowhere near anything, which reads as a bug rather than as targeting.
    const wantLock = pointerAmt > 0.05 && nearDist.length > 0 && nearDist[0] < 0.055 ? 1 : 0
    lockAmt += (wantLock - lockAmt) * 0.12
    if (nearIdx.length > 0) nodeMat.uniforms.uLockPos.value.copy(nodes[nearIdx[0]])
    nodeMat.uniforms.uLockAmt.value = lockAmt

    renderer.render(scene, camera)
  }

  function dispose() {
    edgeGeo.dispose()
    nodeGeo.dispose()
    pGeo.dispose()
    dustGeo.dispose()
    probeGeo.dispose()
    reticleGeo.dispose()
    ;(edgeMat as Material).dispose()
    ;(nodeMat as Material).dispose()
    ;(pMat as Material).dispose()
    ;(dustMat as Material).dispose()
    ;(probeMat as Material).dispose()
    ;(reticleMat as Material).dispose()
    scene.clear()
    renderer.dispose()
  }

  resize()
  return { frame, resize, setPointer, pulse, dispose }
}
