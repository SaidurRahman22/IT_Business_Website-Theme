'use client'

import { useEffect, useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'

/**
 * CopyButton - copy a value to the clipboard, with a spoken confirmation.
 *
 * WHY THIS EXISTS
 *
 * The contact details on this site are `tel:` and `mailto:` anchors. On a
 * phone that is the right affordance and it works. On a desktop, which is
 * where a CISO reads a security vendor's contact page, `tel:` does nothing
 * useful: it either opens an application nobody has configured or it does
 * nothing at all, and the reader ends up selecting the digits by hand. The
 * anchor stays, because it is correct on mobile; this sits beside it for the
 * case the anchor does not serve.
 *
 * PROGRESSIVE ENHANCEMENT
 *
 * This is a static export, so the server renders no button at all and the
 * effect below adds it only once the component has mounted AND the Clipboard
 * API is actually present. Two reasons, not one:
 *   - rendering it server-side and hiding it later is a hydration mismatch;
 *   - `navigator.clipboard` is undefined on insecure origins, so a button
 *     rendered unconditionally would be a control that silently does nothing.
 * A control that cannot perform its action should not be on the page.
 *
 * MOTION AND COLOUR
 *
 * Colour only, matching the Button contract: no transform, no lift, no glow.
 * There is no animation at all here, so there is nothing for
 * prefers-reduced-motion to suppress; the state change is an icon swap.
 */

const CSS = `
.copybtn {
  /* 44x44 hit area from padding while the mark itself stays small, so the
     target clears the touch minimum without the control shouting next to a
     line of text. */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  margin-inline-start: var(--s1);
  border: 0;
  background: none;
  color: var(--muted);
  cursor: pointer;
  vertical-align: middle;
  touch-action: manipulation;
  transition: color var(--dur-base) var(--ease-out);
}
.copybtn:hover { color: var(--fg); }
.copybtn:active { color: var(--accent); transition-duration: var(--dur-micro); }
.copybtn[data-copied='true'] { color: var(--accent); }
`

export function CopyButton({
  value,
  label,
}: {
  /** The exact text placed on the clipboard. */
  value: string
  /** Completes the accessible name, e.g. "email address" -> "Copy email address". */
  label: string
}) {
  const [enabled, setEnabled] = useState(false)
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    setEnabled(typeof navigator !== 'undefined' && !!navigator.clipboard)
    // Clearing on unmount stops a pending revert calling setState on a
    // component that has gone, which is a real possibility here because these
    // sit on pages the reader navigates away from quickly.
    return () => clearTimeout(timer.current)
  }, [])

  if (!enabled) return null

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // A rejected clipboard write (permissions, focus) must not look like a
      // success. Leaving the icon unchanged is the honest signal: the anchor
      // beside it still works.
    }
  }

  return (
    <>
      <style href="envenox-copybtn" precedence="default">
        {CSS}
      </style>
      <button
        type="button"
        className="copybtn"
        data-copied={copied}
        onClick={copy}
        /* The name changes with the state so a screen reader user who returns
           to the control hears what happened, not just what it does. */
        aria-label={copied ? `${label} copied` : `Copy ${label}`}
      >
        {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      </button>
      {/* The announcement lives outside the button. An aria-label change on a
          control the reader is still focused on is not reliably re-announced;
          a separate polite live region is. */}
      <span className="u-sr-only" aria-live="polite">
        {copied ? `${label} copied to clipboard` : ''}
      </span>
    </>
  )
}

export default CopyButton
