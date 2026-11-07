# Forms are not connected to anything

**Status: known and accepted. Decided 2026-11-07.**

Every form on this site validates the visitor's input and then sends them to
`/thank-you`. **Nothing is emailed, stored, queued or forwarded.** A submission
reaches nobody. An enquiry sent through this site is lost.

This was already true before the site became a static export. The former Server
Actions (`app/contact/_shared/actions.ts`, `app/services/_components/actions.ts`)
and the former route handler (`app/api/newsletter/route.ts`) contained no
delivery of any kind — they validated, then called `redirect()`. The static
rebuild did not remove a working feature; it made an existing gap visible.

## Which forms

| Form | Where | On submit |
|---|---|---|
| Enquiry | `/contact`, `/get-started`, `/book-a-call` | → `/thank-you?from=enquiry` |
| Enquiry (services) | `/services` and service pages | → `/thank-you?from=enquiry` |
| Vulnerability report | `/report-issue` | → `/thank-you?from=report-issue` |
| Newsletter | site footer, every page | → `/thank-you?from=newsletter` |

## What the visitor sees

The confirmation page says the message was received. For the enquiry form it
reads "Received. A person will acknowledge it." **That statement is currently
false.** Anyone relying on it will wait for a reply that cannot come.

This matters most on `/report-issue`. That form invites security researchers to
disclose vulnerabilities, and `/.well-known/security.txt` points at the site. A
researcher who discloses through it will believe they have reported responsibly
while nothing has been received. If disclosure is a real intent, that form needs
a working destination before the page is promoted anywhere.

## Field values are deliberately not submitted

Form inputs carry no `name` attribute — see `SUBMITS_VALUES` in
`app/contact/_shared/Fields.tsx`. A static site can only submit via GET, which
would place the sender's name, email, company and message into the URL, and from
there into browser history, the `Referer` header of every following request, and
any access log on the path. Since nothing consumes the values, omitting them
removes that exposure at no functional cost.

## To make the forms work

1. Choose a destination: an email API (Resend, Postmark, SendGrid), storage
   (Cloudflare D1 or KV, Airtable), or a webhook.
2. Set `SUBMITS_VALUES = true` in `app/contact/_shared/Fields.tsx` so the fields
   are actually submitted.
3. Add a receiving endpoint. A static export cannot host one, so this means
   either a small separate Cloudflare Worker that the forms POST to, or a
   third-party form endpoint. Do NOT reintroduce a Next server Worker for this —
   that is what exceeded the CPU limit and took the domain down; see MEMORY.md.
4. Re-point each form's `action` at that endpoint and set `method="post"`.
5. Only after a test submission has been received end to end, change the
   confirmation copy back to a claim of receipt.

## In the meantime

The site publishes real contact routes that do work: the phone numbers, postal
addresses and mailto: links in the footer and on `/contact`. Those reach people.
The forms do not.
