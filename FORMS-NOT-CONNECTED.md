# Forms: connected, pending deploy

**Status: built and tested 2026-11-08. NOT live until the deploy order below
is followed.** This file previously recorded that forms reached nobody. That
is no longer the design, but it is still true of the *deployed* site until
both halves below ship.

## What now happens

```
visitor submits a form on envenox.com
      |  POST (plain form, no JavaScript required)
      v
forms.envenox.com        the envenox-forms Worker, in form-worker/
      |  origin check - honeypot - rate limit - validation
      |  SMTP over implicit TLS, port 465
      v
smtp.zoho.com            authenticated as admin@envenox.com
      v
admin@envenox.com        the message, with Reply-To set to the sender
```

No third party ever sees a submission. That was the deciding constraint:
`/report-issue` invites vulnerability disclosures and `/.well-known/security.txt`
points at it, so routing those through a free form service was not acceptable.

## Deploy order, which matters

The site now posts to `forms.envenox.com`. That hostname does not exist until
the Worker is deployed. **Deploy the site last**, or every form on the live
site fails with a DNS error.

1. `npx wrangler deploy -c form-worker/wrangler.jsonc`
   Creates the Worker and the `forms.envenox.com` custom domain. Adds a
   subdomain only; it does not touch the root record or MX.
2. `npx wrangler secret put SMTP_PASSWORD -c form-worker/wrangler.jsonc`
   A Zoho **application-specific** password, not the mailbox password. Generate
   it at Zoho Account, Security, App Passwords. The mailbox password stops
   working once 2FA is on, and an app password can be revoked on its own.
3. `curl https://forms.envenox.com/health` and confirm `passwordConfigured: true`.
4. Submit a real enquiry and confirm it arrives in the Zoho inbox.
5. Only then `npm run deploy` for the site.

## What was verified, and how

Run on Cloudflare's own network with `wrangler dev --remote`, not locally:

| Check | Result |
|---|---|
| TCP to `smtp.zoho.com:465` from a Worker | connects, `220 smtp.zohomail.com SMTP Server ready` |
| TCP to `:587` STARTTLS | connects, STARTTLS advertised |
| TCP to `:25` (control) | `Connections to port 25 are prohibited` |
| Full SMTP path with a deliberately wrong password | reached `auth-pass`, server replied `535 Authentication Failed` |
| Honeypot filled | `303` to `/thank-you`, identical to success, no mail sent |
| Unknown form name | rejected |
| Origin not envenox.com | rejected |
| Missing required field | rejected, names the field |
| Malformed email | rejected |

The port 25 control matters: it proves the probe can come out negative, so the
465 and 587 successes are real egress rather than a test that always passes.

The 535 result is the useful one. It proves connect, TLS, `EHLO`, `AUTH LOGIN`
and the username exchange all work against the real server, and that only the
credential is missing.

## Security decisions worth not undoing

- **`SUBMITS_VALUES` is now `true`** in `app/contact/_shared/Fields.tsx`. The
  old comment warned that submitting values would leak them into the URL. That
  applied to the GET form. These are POSTs, so values travel in the body and
  never reach browser history, a `Referer` header or an access log.
- **Header injection** is handled in one place, `headerValue()` in
  `form-worker/src/email.ts`. Nothing may reach a mail header without passing
  through it. A newline in a value would otherwise let a submitter append
  `Bcc:` and turn the contact form into an open relay.
- **Dot-stuffing** in `smtp.ts`: a body line that is a lone `.` ends the
  message early unless escaped.
- **The public error text never includes the SMTP reply.** An SMTP reply
  discloses whether a mailbox exists and what the relay policy is. The detail
  goes to the Worker log; the visitor gets one generic sentence.
- **The Worker is a separate deployment** from the site. The site is static
  assets with no `main` because a Next server Worker once exceeded the CPU
  allowance and took envenox.com down on 2026-11-06. A fault in the form
  Worker can lose a submission; it cannot take the website offline.

## Still optional

**Turnstile.** The Worker verifies it when `TURNSTILE_SECRET` is set and skips
it when not. The honeypot and the per-IP rate limit are active either way. Add
it if spam gets through:

```
npx wrangler secret put TURNSTILE_SECRET -c form-worker/wrangler.jsonc
```

then render the Turnstile widget in the forms so a `cf-turnstile-response`
field is submitted.

## One copy change still owed

`/thank-you` says "Received. A person will acknowledge it." That sentence
becomes true at step 4 above and not before. If the deploy order is followed
it is never false on the live site. If the site ships before the Worker, it is.
