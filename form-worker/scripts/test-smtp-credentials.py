"""Test the Zoho SMTP credential from your own machine.

This bisects one question: is the password wrong, or is Cloudflare's egress
being refused by Zoho? The Worker reaches Zoho fine and fails only at the
password step, so running the SAME login from here separates the two:

  fails here too      -> the credential or the Zoho account setting is wrong
  works here, not CF  -> Zoho is refusing the login from Cloudflare's network

The password is read with getpass, so it is never echoed, never stored and
never written to a log. Nothing is sent: the session stops after AUTH.

Usage:  python -I form-worker/scripts/test-smtp-credentials.py
"""

import getpass
import smtplib
import ssl
import sys

USER = "admin@envenox.com"

# Zoho runs regional datacenters and the host must match the one your account
# lives in. A correct password against the wrong region returns 535, which is
# indistinguishable from a wrong password, so all of them are tried.
HOSTS = [
    ("smtp.zoho.com", "global / US"),
    ("smtp.zoho.eu", "Europe"),
    ("smtp.zoho.in", "India"),
    ("smtp.zoho.com.au", "Australia"),
]


def attempt(host: str, port: int, user: str, password: str) -> tuple[bool, str]:
    try:
        ctx = ssl.create_default_context()
        if port == 465:
            server = smtplib.SMTP_SSL(host, port, timeout=25, context=ctx)
        else:
            server = smtplib.SMTP(host, port, timeout=25)
            server.ehlo()
            server.starttls(context=ctx)
            server.ehlo()
        try:
            server.login(user, password)
            return True, "AUTH OK"
        finally:
            try:
                server.quit()
            except Exception:
                pass
    except smtplib.SMTPAuthenticationError as e:
        return False, f"{e.smtp_code} {e.smtp_error.decode(errors='replace').strip()}"
    except Exception as e:
        return False, f"{type(e).__name__}: {e}"


def main() -> int:
    print(f"Testing SMTP login for {USER}")
    print("Paste the Zoho app-specific password. It will not be shown.\n")
    password = getpass.getpass("Password: ")
    if not password:
        print("No password entered.")
        return 2

    # A silent clue: a pasted value can pick up spaces or a newline, and Zoho
    # rejects that with the same 535 as a genuinely wrong password.
    if password != password.strip():
        print("\n!! The value has leading or trailing whitespace. That alone causes 535.")
        print("   Re-copy it without the surrounding space.\n")

    print(f"\n(length {len(password)} characters)\n")

    any_ok = False
    for host, label in HOSTS:
        for port in (465, 587):
            ok, detail = attempt(host, port, USER, password)
            mark = "PASS" if ok else "fail"
            print(f"  [{mark}] {host}:{port:<4} ({label}) -> {detail}")
            if ok:
                any_ok = True
        if any_ok:
            break

    print()
    if any_ok:
        print("The credential WORKS from this machine.")
        print("If the Worker still fails, Zoho is refusing the login from")
        print("Cloudflare's network rather than rejecting the password.")
    else:
        print("The credential is rejected from here too, so this is NOT a")
        print("Cloudflare problem. Check, in order:")
        print("  1. Is it an APP-SPECIFIC password? Zoho Account, Security,")
        print("     App Passwords. The mailbox password fails once 2FA is on.")
        print("  2. Is IMAP/SMTP access enabled? Zoho Mail, Settings,")
        print("     Mail Accounts, IMAP/SMTP Access.")
        print("  3. Did Zoho email you about a blocked sign-in attempt?")
    return 0 if any_ok else 1


if __name__ == "__main__":
    sys.exit(main())
