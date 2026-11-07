'use client'

// Keep the lucide-react import FIRST and braced. scripts/check-icons.mjs pairs
// the first `import {` in a file with the first `} from 'lucide-react'`, so a
// braced import above this one makes the guard report its names as icons.
import { ChevronDown, Menu, Phone, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { primaryNav, site, type NavChild, type NavGroup } from '@/lib/site'
import { Button } from '@/components/ui/Button'

/**
 * Nav - the persistent navigation. 72px (--nav-h), fixed.
 *
 * CRAWLABLE IA: the complete navigation tree is in the server-rendered HTML.
 * Radix NavigationMenu unmounts closed panels by default, which would leave the
 * entire information architecture invisible to a crawler and to a no-JS
 * visitor, so every panel is `forceMount`ed and hidden with
 * `visibility: hidden` instead. Visibility (rather than display:none) also
 * keeps closed panels out of the tab order and the accessibility tree.
 *
 * NO-JAVASCRIPT PATH: the Radix menu needs JS to open. While `.no-js` survives
 * on <html>, the desktop menu is hidden at every width and the <details> menu
 * takes over, because <details>/<summary> is native disclosure that works with
 * scripting off. That is why the mobile menu is not a Dialog.
 *
 * IR HOTLINE: a visible tel: link in the bar on every page and at every width.
 * Never behind a form, never in a modal, never a click-to-reveal. An
 * organisation being breached at 02:00 must be able to see and tap the number
 * without a single interaction. This is a spec hard requirement, not a
 * styling choice - do not move it into the menu to win back horizontal space.
 *
 * JAVASCRIPT: exactly one passive scroll listener, rAF-coalesced, writing
 * attributes only (`data-scrolled`, the theme class). It never writes inline
 * styles and never measures layout inside the scroll handler - section bands
 * are measured once on mount and on resize.
 */

const NAV_THEMES = ['theme-dark', 'theme-light', 'theme-deep'] as const

const CSS = `
.nav {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 50;
  height: var(--nav-h);
  color: var(--fg);
  background-color: transparent;
  border-bottom: 1px solid transparent;
  transition:
    background-color var(--dur-scene) var(--ease-theme),
    border-color var(--dur-scene) var(--ease-theme),
    color var(--dur-scene) var(--ease-theme),
    backdrop-filter var(--dur-scene) var(--ease-theme);
}
/* Scrolled: the spec's var(--bg) + blur(10px). Held at 92% so the blur does
   real work, an opaque fill would make backdrop-filter a no-op. */
.nav[data-scrolled='true'] {
  background-color: color-mix(in oklab, var(--bg) 92%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom-color: var(--border);
}

.nav__bar {
  position: relative;
  height: var(--nav-h);
  display: flex;
  align-items: center;
  gap: var(--s6);
}

.nav__brand {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--fg);
  text-decoration: none;
  flex: none;
}

/* ---- desktop menu ---- */
.nav__desktop { display: none; }
@media (min-width: 1024px) {
  .nav__desktop { display: block; flex: 1 1 auto; }
}
.no-js .nav__desktop { display: none; }

.nav__list { display: flex; align-items: center; gap: var(--s1); list-style: none; margin: 0; padding: 0; }

.nav__trigger,
.nav__toplink {
  display: inline-flex;
  align-items: center;
  gap: var(--s1);
  appearance: none;
  background: none;
  border: 0;
  border-radius: var(--radius-sm);
  padding: var(--s2) var(--s3);
  min-height: 36px;
  font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1;
  color: var(--muted-strong);
  text-decoration: none;
  cursor: pointer;
  transition: color var(--dur-base) var(--ease-out), background-color var(--dur-base) var(--ease-out);
}
.nav__trigger:hover,
.nav__toplink:hover { color: var(--fg); background-color: var(--surface); }
.nav__trigger[data-state='open'] { color: var(--fg); }
.nav__trigger-chevron { transition: transform var(--dur-base) var(--ease-out); }
.nav__trigger[data-state='open'] .nav__trigger-chevron { transform: rotate(180deg); }

/* ---- the panel. forceMount keeps the links in the HTML. ----
   640px is not arbitrary: scaleIn/scaleOut animate scale(0.9) from a
   "top center" origin, so each horizontal edge travels width * 0.1 / 2. At
   640px that is exactly 32px, the ceiling. A wider panel would animate
   further than the vocabulary allows, so the panel is capped, and the featured
   cell leads as a full-width row rather than a left column. */
.nav__panel {
  position: absolute;
  top: calc(var(--nav-h) - var(--s2));
  left: 0;
  width: min(640px, calc(100vw - var(--gutter) * 2));
  transform-origin: top center;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--s6);
  box-shadow: 0 1px 0 0 var(--border);
}
.nav__panel[data-state='open'] {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  animation: scaleIn var(--dur-base) var(--ease-out);
}
.nav__panel[data-state='closed'] { animation: scaleOut var(--dur-base) var(--ease-out); }

.nav__panel-grid { display: grid; gap: var(--s4); grid-template-columns: minmax(0, 1fr); }

.nav__featured {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  padding: var(--s4);
  text-decoration: none;
  color: var(--fg);
  transition: background-color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.nav__featured:hover { background-color: color-mix(in oklab, var(--surface) 86%, var(--fg) 14%); border-color: var(--border-strong); }
.nav__featured-label {
  font-family: var(--font-inter-tight), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  font-size: var(--text-lg);
  font-weight: 600;
  letter-spacing: var(--tracking-tight);
  line-height: 1.2;
}
.nav__featured-blurb { font-size: var(--text-sm); color: var(--muted); line-height: 1.45; }

.nav__links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px; list-style: none; margin: 0; padding: 0; }
.nav__links--single { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.nav__link {
  display: block;
  border-radius: var(--radius-sm);
  padding: var(--s2) var(--s3);
  text-decoration: none;
  color: var(--fg);
  transition: background-color var(--dur-base) var(--ease-out);
}
.nav__link:hover { background-color: var(--surface); }
.nav__link-label { display: block; font-size: var(--text-sm); font-weight: 500; line-height: 1.3; }
.nav__link-blurb { display: block; font-size: var(--text-xs); color: var(--muted); line-height: 1.4; margin-top: 2px; }

.nav__panel-foot { margin-top: var(--s4); padding-top: var(--s4); border-top: 1px solid var(--border); }
.nav__panel-all { font-size: var(--text-sm); color: var(--muted-strong); text-decoration: none; }
.nav__panel-all:hover { color: var(--fg); }

/* ---- actions ---- */
.nav__actions { display: flex; align-items: center; gap: var(--s3); margin-left: auto; flex: none; }

.nav__hotline {
  display: flex;
  align-items: center;
  gap: var(--s2);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: var(--s1) var(--s3);
  min-height: 44px;
  text-decoration: none;
  color: var(--fg);
  transition: background-color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.nav__hotline:hover { background-color: var(--surface); border-color: var(--fg); }
.nav__hotline-icon { flex: none; color: var(--muted-strong); }
.nav__hotline-text { display: flex; flex-direction: column; gap: 1px; line-height: 1.1; }
.nav__hotline-kicker {
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.nav__hotline-number {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
@media (min-width: 480px) {
  .nav__hotline-number { font-size: var(--text-sm); }
}

/* ---- narrow-viewport fit ----
   At 320px the bar has 288px of usable width, and brand + --s6 gap + hotline
   + burger measured well past it. The overflow was INVISIBLE: .nav is fixed and
   body is overflow-x: clip, so no scroll test catches it, the right-hand
   actions, including the IR hotline, were simply clipped off the edge.

   What gets sacrificed, in order: the bar gap, then the hotline's own padding,
   then its icon. The NUMBER is the last thing to go and it never does. Someone
   reaching for this link is mid-breach and needs the digits, not the glyph —
   and the kicker stays too, because a bare number with no label is a worse
   affordance than a slightly cramped one. */
@media (max-width: 639px) {
  .nav__bar { gap: var(--s3); }
  .nav__actions { gap: var(--s2); min-width: 0; }
  .nav__hotline { padding: var(--s1) var(--s2); gap: var(--s1); }
}
@media (max-width: 479px) {
  .nav__hotline-icon { display: none; }
  .nav__brand { font-size: var(--text-base); }
}

.nav__cta { display: none; }
@media (min-width: 1024px) { .nav__cta { display: inline-flex; } }

/* ---- mobile <details> menu: the real no-JS path ---- */
.nav__mobile { position: static; }
@media (min-width: 1024px) { .nav__mobile { display: none; } }
.no-js .nav__mobile { display: block; }

.nav__burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  color: var(--fg);
  cursor: pointer;
  list-style: none;
  transition: background-color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
}
.nav__burger::-webkit-details-marker { display: none; }
.nav__burger:hover { background-color: var(--surface); border-color: var(--fg); }
.nav__burger-close { display: none; }
.nav__mobile[open] .nav__burger-open { display: none; }
.nav__mobile[open] .nav__burger-close { display: inline-flex; }

.nav__sheet {
  position: absolute;
  top: var(--nav-h);
  left: 0;
  right: 0;
  max-height: calc(100dvh - var(--nav-h));
  overflow-y: auto;
  overscroll-behavior: contain;
  background-color: var(--bg);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: var(--s6) var(--gutter) var(--s8);
}
.nav__sheet-group + .nav__sheet-group { margin-top: var(--s6); padding-top: var(--s6); border-top: 1px solid var(--border); }
.nav__sheet-heading {
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 var(--s3);
}
.nav__sheet-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.nav__sheet-link {
  display: block;
  padding: var(--s3) 0;
  min-height: 44px;
  font-size: var(--text-base);
  color: var(--fg);
  text-decoration: none;
}
.nav__sheet-link:hover { color: var(--muted-strong); }
.nav__sheet-blurb { display: block; font-size: var(--text-xs); color: var(--muted); margin-top: 2px; }
.nav__sheet-cta { margin-top: var(--s8); display: grid; gap: var(--s3); }
.nav__sheet-hotline {
  font-family: var(--font-jetbrains-mono), ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: var(--text-sm);
  color: var(--fg);
  text-decoration: none;
  display: block;
  padding: var(--s3) 0;
}
`

/** Panel link row. */
function PanelLink({ child }: { child: NavChild }) {
  return (
    <li>
      <NavigationMenu.Link asChild>
        <Link href={child.href} className="nav__link">
          <span className="nav__link-label">{child.label}</span>
          {child.blurb ? <span className="nav__link-blurb">{child.blurb}</span> : null}
        </Link>
      </NavigationMenu.Link>
    </li>
  )
}

function GroupPanel({ group }: { group: NavGroup }) {
  const children = group.children ?? []
  const featured = group.featured
  const alreadyListed = group.href ? children.some((c) => c.href === group.href) : true

  return (
    <NavigationMenu.Content forceMount className="nav__panel">
      <div className="nav__panel-grid">
        {featured ? (
          <NavigationMenu.Link asChild>
            <Link href={featured.href} className="nav__featured">
              <span className="u-eyebrow">Start here</span>
              <span className="nav__featured-label">{featured.label}</span>
              {featured.blurb ? <span className="nav__featured-blurb">{featured.blurb}</span> : null}
            </Link>
          </NavigationMenu.Link>
        ) : null}
        <ul className="nav__links">
          {children.map((child) => (
            <PanelLink key={child.href} child={child} />
          ))}
        </ul>
      </div>
      {group.href && !alreadyListed ? (
        <div className="nav__panel-foot">
          <NavigationMenu.Link asChild>
            <Link href={group.href} className="nav__panel-all">
              All {group.label.toLowerCase()} &rarr;
            </Link>
          </NavigationMenu.Link>
        </div>
      ) : null}
    </NavigationMenu.Content>
  )
}

export function Nav() {
  const rootRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    type Band = { top: number; bottom: number; theme: string }
    let bands: Band[] = []
    let probeOffset = 36
    let frame = 0

    /** Measured once per layout change, never inside the scroll handler. */
    const measure = () => {
      const scrollY = window.scrollY
      probeOffset = el.getBoundingClientRect().height / 2
      bands = Array.from(document.querySelectorAll<HTMLElement>('[data-theme-section]')).map((s) => {
        const rect = s.getBoundingClientRect()
        const top = rect.top + scrollY
        return { top, bottom: top + rect.height, theme: s.dataset.themeSection ?? 'dark' }
      })
    }

    const applyTheme = (theme: string) => {
      if (el.dataset.navTheme === theme) return
      el.classList.remove(...NAV_THEMES)
      el.classList.add(`theme-${theme}`)
      el.dataset.navTheme = theme
    }

    const read = () => {
      frame = 0
      const scrollY = window.scrollY
      el.dataset.scrolled = scrollY > 8 ? 'true' : 'false'

      // Re-colour in sync with the section behind the nav rather than fighting it.
      const probe = scrollY + probeOffset
      for (const band of bands) {
        if (probe >= band.top && probe < band.bottom) {
          applyTheme(band.theme)
          break
        }
      }
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(read)
    }

    const onResize = () => {
      measure()
      onScroll()
    }

    measure()
    read()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('pageshow', onResize)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pageshow', onResize)
    }
  }, [])

  return (
    <>
      <style href="envenox-nav" precedence="default">
        {CSS}
      </style>
      <header
        ref={rootRef}
        className="nav theme-dark transition-theme no-print"
        data-scrolled="false"
        data-nav-theme="dark"
      >
        <div className="nav__bar u-container">
          <Link href="/" className="nav__brand">
            {site.name}
          </Link>

          <NavigationMenu.Root className="nav__desktop" aria-label="Primary">
            <NavigationMenu.List className="nav__list">
              {primaryNav.map((group) =>
                group.children && group.children.length > 0 ? (
                  <NavigationMenu.Item key={group.label} value={group.label}>
                    <NavigationMenu.Trigger className="nav__trigger">
                      {group.label}
                      <ChevronDown
                        className="nav__trigger-chevron"
                        size={16}
                        strokeWidth={1.75}
                        absoluteStrokeWidth
                        aria-hidden="true"
                      />
                    </NavigationMenu.Trigger>
                    <GroupPanel group={group} />
                  </NavigationMenu.Item>
                ) : (
                  <NavigationMenu.Item key={group.label} value={group.label}>
                    <NavigationMenu.Link asChild>
                      <Link href={group.href ?? '/'} className="nav__toplink">
                        {group.label}
                      </Link>
                    </NavigationMenu.Link>
                  </NavigationMenu.Item>
                ),
              )}
            </NavigationMenu.List>
          </NavigationMenu.Root>

          <div className="nav__actions">
            {/* Hard requirement: visible, tappable, on every page, at every width. */}
            <a
              className="nav__hotline"
              href={site.contact.irHotlineHref}
              data-ir-hotline="nav"
            >
              <Phone
                className="nav__hotline-icon"
                size={20}
                strokeWidth={1.75}
                absoluteStrokeWidth
                aria-hidden="true"
              />
              <span className="nav__hotline-text">
                <span className="nav__hotline-kicker">Breach? 24/7</span>
                <span className="nav__hotline-number">{site.contact.irHotline}</span>
              </span>
            </a>

            <Button href={site.primaryCta.href} size="sm" variant="primary" className="nav__cta">
              {site.primaryCta.label}
            </Button>

            <details className="nav__mobile">
              <summary className="nav__burger" aria-label="Navigation menu">
                <Menu
                  className="nav__burger-open"
                  size={20}
                  strokeWidth={1.75}
                  absoluteStrokeWidth
                  aria-hidden="true"
                />
                <X
                  className="nav__burger-close"
                  size={20}
                  strokeWidth={1.75}
                  absoluteStrokeWidth
                  aria-hidden="true"
                />
              </summary>
              <nav className="nav__sheet" aria-label="All pages">
                {primaryNav.map((group) => (
                  <div className="nav__sheet-group" key={group.label}>
                    <p className="nav__sheet-heading">{group.label}</p>
                    <ul className="nav__sheet-list">
                      {group.featured ? (
                        <li>
                          <Link href={group.featured.href} className="nav__sheet-link">
                            {group.featured.label}
                            {group.featured.blurb ? (
                              <span className="nav__sheet-blurb">{group.featured.blurb}</span>
                            ) : null}
                          </Link>
                        </li>
                      ) : null}
                      {(group.children ?? []).map((child) => (
                        <li key={child.href}>
                          <Link href={child.href} className="nav__sheet-link">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                      {group.href && !(group.children ?? []).some((c) => c.href === group.href) ? (
                        <li>
                          <Link href={group.href} className="nav__sheet-link">
                            All {group.label.toLowerCase()}
                          </Link>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ))}

                <div className="nav__sheet-cta">
                  <Button href={site.primaryCta.href} size="md" variant="primary" fullWidth>
                    {site.primaryCta.label}
                  </Button>
                  <a className="nav__sheet-hotline" href={site.contact.irHotlineHref}>
                    Incident response, 24/7, {site.contact.irHotline}
                  </a>
                </div>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  )
}

export default Nav
