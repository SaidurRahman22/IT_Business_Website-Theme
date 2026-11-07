'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/* =============================================================================
   SCROLL RESET ON ROUTE CHANGE

   THE BUG THIS FIXES
   Clicking an internal link left the reader at whatever scroll offset they were
   already at. Measured on the built site at 1440x900, six links from the
   homepage, every one of them:

     link                            scrollY before -> after
     Security practice                      2349 -> 2349
     Software development                   1523 -> 1523
     Read the method                        5456 -> 5456
     All services                           3344 -> 3344
     Read the case study                    4958 -> 4958
     Or walk a sample report first          8206 -> 8206

   So a visitor clicking "Read the method" from near the bottom of the homepage
   arrived on /approach already 5,456px down it, somewhere in the middle of a
   page they had never seen. Not intermittent: the landing offset equalled the
   departure offset exactly, every time.

   WHAT IS ACTUALLY HAPPENING, AS MEASURED
   The navigation IS client-side (the document is not replaced: a sampler
   started before the click survives the navigation and keeps reporting). During
   it, Next performs NO scroll operation at all. Instrumenting window.scrollTo,
   Element.prototype.scrollIntoView and the documentElement.scrollTop setter
   across a full navigation recorded zero calls, and scrollY sampled every
   100ms for two seconds after the click stayed flat at 3344.

   The page's own scroll machinery is fine: window.scrollTo(0, 0) and
   documentElement.scrollTop = 0 both work when called directly. So this is not
   a blocked scroll, it is an absent one, and the remedy is to perform it.

   TWO THINGS IT IS NOT, both tested and ruled out rather than assumed:
   - NOT `scroll-behavior: smooth` on html. Forcing it to `auto` at runtime
     changed nothing: 2349 -> 2349 still.
   - NOT the `overflow-x: clip` on body. Moving the clip to html, or removing
     it, changed nothing either, and `documentElement.scrollTop = 0` moves the
     page in all three configurations.

   WHY A COMPONENT RATHER THAN A CSS OR CONFIG CHANGE
   There is nothing to configure: `scroll` already defaults to true on every
   Link and none of them passes `scroll={false}`. The reset has to be performed
   by something, so it is performed here, where it can be read and verified.

   WHAT IT DELIBERATELY DOES NOT DO
   Three cases where scrolling to the top would be wrong, so each is excluded:

   1. The FIRST render. The browser has already placed the document, whether at
      the top, at a restored offset, or on a #hash target. Overriding that would
      break deep links into a page on a cold load.
   2. BACK and FORWARD. The browser restores the previous position, which is
      exactly what a reader going back expects to find. A popstate listener
      marks those so the next pathname change is left alone.
   3. Any URL carrying a #hash. The anchor owns the destination. The site has
      14 in-page anchors including the skip link, and fighting them would break
      "Skip to content" and every contents list.

   `behavior: 'instant'` is load-bearing, not a default. html sets
   `scroll-behavior: smooth`, so a plain scrollTo would ANIMATE the whole way
   from 8,206px to 0 on arrival at a page the reader has not seen yet.
   'instant' overrides the stylesheet for this one call and leaves smooth
   scrolling intact for the in-page anchors that want it.

   BACK AND FORWARD ARE RESTORED BY THIS COMPONENT TOO, BECAUSE NOTHING ELSE
   DOES IT. Simply skipping history navigations was the first version, and
   measuring it showed why that is not enough: going back from /services to the
   homepage landed at 0 rather than at the 3,344px the reader left from. The
   browser's own restoration cannot work here, because on a client-side history
   navigation the previous page's DOM does not exist yet at the moment the
   browser would restore, so there is nothing to scroll through.

   Before this component existed that looked fine by accident: nothing ever
   scrolled, so going back "kept" the offset it had never left. Fixing forward
   navigation would therefore have quietly broken back, which is why the offset
   is now recorded per path and put back deliberately.

   The restore retries across a few frames because the destination page lays
   out after the history navigation commits, and a scrollTo issued against a
   document that is still short silently clamps. It is bounded at ten frames so
   a page that is genuinely shorter than it used to be cannot spin.

   Renders nothing.
   ============================================================================= */
export function ScrollReset() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)
  const cameFromHistory = useRef(false)
  const positions = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    const onPopState = () => {
      cameFromHistory.current = true
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // Keep the current path's offset current. The cleanup runs when the path
  // changes, so the last thing it does is record where the reader was when
  // they left, which is the value a later Back needs.
  useEffect(() => {
    const save = () => positions.current.set(pathname, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      save()
      window.removeEventListener('scroll', save)
    }
  }, [pathname])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (cameFromHistory.current) {
      cameFromHistory.current = false
      // ZERO IS A REAL POSITION, NOT A MISSING ONE. Discarding it with a
      // `previous <= 0` guard meant going Back and then Forward again left the
      // reader at the offset of the page they had just come from: measured
      // 3344 on /services, where the recorded position was 0. A path never
      // visited in this session has no recorded offset, and the top is the
      // right answer for it.
      const previous = positions.current.get(pathname)
      const target = typeof previous === 'number' ? previous : 0

      let frames = 0
      let raf = 0
      const settle = () => {
        window.scrollTo({ top: target, left: 0, behavior: 'instant' })
        if (Math.abs(window.scrollY - target) < 2 || (frames += 1) > 10) return
        raf = requestAnimationFrame(settle)
      }
      raf = requestAnimationFrame(settle)
      return () => cancelAnimationFrame(raf)
    }

    if (window.location.hash) return

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
