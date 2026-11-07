import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ThankYouBody, ThankYouView } from './_view'

/**
 * /thank-you - confirmation.
 *
 * STATIC EXPORT: generateMetadata used to tailor the title to `?from=`. A
 * prerendered page cannot read search params, so the metadata is now static.
 * That costs nothing here: the page is noindex, so the title is never a search
 * result, and the on-page heading is still tailored client-side in _view.tsx.
 */
export const metadata: Metadata = {
  title: 'Thank you',
  description: 'Your message has been received.',
  alternates: { canonical: '/thank-you' },
  // A confirmation page has nothing a search engine should index, and indexing
  // one invites people to arrive here without having sent anything.
  robots: { index: false, follow: true },
}

export default function ThankYouPage() {
  // The fallback carries the real content: useSearchParams() suspends during
  // prerender, so an empty fallback would ship an empty thank-you.html. The
  // default (no-params) confirmation renders into the file; ThankYouView then
  // tailors it to ?from= on hydration.
  return (
    <Suspense fallback={<ThankYouBody params={{}} />}>
      <ThankYouView />
    </Suspense>
  )
}
