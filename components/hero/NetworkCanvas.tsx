'use client'

/* =============================================================================
   NetworkCanvas - mounts the hero WebGL scene, or gets out of the way.

   THIS COMPONENT IS PURELY ADDITIVE. The hero's headline, lede and CTAs are
   server-rendered text that is complete and readable before this file executes.
   If WebGL is unavailable, the driver is blocklisted, the user asked for reduced
   motion, or the JS never arrives, the page loses a background and nothing else.

   WHAT IT GUARANTEES
   - prefers-reduced-motion: reduce  -> renders ONE frame and stops, and binds
     no pointer or click handling at all. Honouring the preference means no
     motion, not less of it, and an interaction whose entire output is motion is
     not worth offering to someone who asked for none.
   - WebGL unavailable                -> nothing is mounted.
   - canvas scrolled out of view      -> loop stops. A hero that keeps rendering
     while the reader is four sections down is wasted battery.
   - document hidden                  -> loop stops.
   - unmount                          -> RAF cancelled, listeners removed, every
     GPU resource disposed.

   WHY THE LISTENERS ARE ON window AND NOT ON THE CANVAS
   The canvas is `pointer-events: none` so that it can never swallow a click
   meant for a CTA - below 60rem it spans the full hero and sits directly under
   both buttons. Events are therefore taken from window and filtered by the
   canvas's own bounding box, which gives the scene pointer input without ever
   standing between the visitor and a link.
   ============================================================================= */

import { useEffect, useRef, useState } from 'react'
import { createNetworkScene, type SceneHandle } from './network-scene'

/** Elements whose click belongs to them, never to the scene. Needed because the
 *  canvas spans the full hero on narrow viewports, so the CTAs sit inside its
 *  bounding box even though they are not inside the canvas visually. */
const INTERACTIVE = 'a,button,input,textarea,select,summary,[role="button"],[tabindex]'

export function NetworkCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const host = canvas.parentElement ?? document.documentElement

    let handle: SceneHandle | null = null
    try {
      handle = createNetworkScene(canvas, host as HTMLElement)
    } catch {
      handle = null
    }
    if (!handle) {
      setFailed(true)
      return
    }
    const scene = handle

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

    let raf = 0
    let running = false
    let visible = true
    const start = performance.now()

    const tick = (nowMs: number) => {
      scene.frame((nowMs - start) / 1000)
      raf = requestAnimationFrame(tick)
    }

    const run = () => {
      if (running) return
      if (reduce.matches) {
        // A single composed frame, then stop. Time is fixed at a point where
        // packets are mid-flight so the still frame is not an empty graph.
        scene.frame(2.4)
        return
      }
      running = true
      raf = requestAnimationFrame(tick)
    }

    const stop = () => {
      if (!running) return
      running = false
      cancelAnimationFrame(raf)
    }

    const sync = () => {
      if (visible && !document.hidden) run()
      else stop()
    }

    const onResize = () => {
      scene.resize()
      if (!running) scene.frame(reduce.matches ? 2.4 : (performance.now() - start) / 1000)
    }

    /** Pointer position in normalised device coords, plus whether it is over
     *  the canvas at all. Returns null when the canvas has no layout box yet. */
    const toNdc = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect()
      if (!r.width || !r.height) return null
      const x = ((clientX - r.left) / r.width) * 2 - 1
      const y = -(((clientY - r.top) / r.height) * 2 - 1)
      const inside = x >= -1 && x <= 1 && y >= -1 && y <= 1
      return { x, y, inside }
    }

    const onPointer = (e: PointerEvent) => {
      if (reduce.matches) return
      const p = toNdc(e.clientX, e.clientY)
      if (p) scene.setPointer(p.x, p.y, p.inside)
    }

    // The field follows the cursor, so when the cursor leaves the window it has
    // to be told - otherwise the scan light freezes wherever the pointer last
    // was and sits there lit, which reads as a stuck render.
    const onLeave = () => scene.setPointer(0, 0, false)

    const onDown = (e: PointerEvent) => {
      if (reduce.matches) return
      // Secondary buttons open menus; a sweep pulse under a context menu is
      // noise the visitor did not ask for.
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const target = e.target as Element | null
      if (target?.closest?.(INTERACTIVE)) return
      const p = toNdc(e.clientX, e.clientY)
      if (!p || !p.inside) return
      scene.setPointer(p.x, p.y, true)
      scene.pulse(p.x, p.y)
    }

    const onMotionChange = () => {
      stop()
      scene.setPointer(0, 0, false)
      sync()
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((en) => en.isIntersecting)
        sync()
      },
      { rootMargin: '120px' },
    )
    io.observe(canvas)

    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    document.addEventListener('visibilitychange', sync)
    reduce.addEventListener('change', onMotionChange)

    sync()

    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      document.removeEventListener('visibilitychange', sync)
      reduce.removeEventListener('change', onMotionChange)
      scene.dispose()
    }
  }, [])

  if (failed) return null

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
