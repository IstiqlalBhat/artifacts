# Email templates

Branded HTML templates for the Supabase auth emails. Drop each one into the
matching slot under **Supabase Dashboard → Authentication → Email Templates**.

| File | Supabase template | Subject line suggestion |
|---|---|---|
| `confirmation.html` | Confirm signup | Confirm your Artifacts account |
| `magic_link.html` | Magic Link | Sign in to Artifacts |
| `recovery.html` | Reset Password | Reset your Artifacts password |
| `email_change.html` | Change Email Address | Confirm your new Artifacts email |
| `invite.html` | Invite user | You're invited to Artifacts |
| `reauthentication.html` | Reauthentication | Verify your identity |

## How to install

1. Open Supabase → **Authentication → Email Templates**.
2. For each row in the table above, click the template, paste the file
   contents into the **Message body** box, and update the **Subject** to the
   suggested line.
3. Save.

Supabase uses [Go's `text/template`](https://pkg.go.dev/text/template) syntax
under the hood, so all `{{ .Variable }}` placeholders (e.g. `{{ .ConfirmationURL }}`,
`{{ .Email }}`, `{{ .Token }}`, `{{ .NewEmail }}`) are filled in by the
service when the email is sent.

## Design notes

- **Email-safe markup** — table-based layout, all styles inlined, no web
  fonts. Works in Gmail (web/iOS/Android), Apple Mail, Outlook 2016+, and
  Outlook.com.
- **Mobile-first** — 520px max content width, generous tap targets, scalable
  text.
- **Preheader text** — the first hidden `<div>` controls the preview snippet
  most clients show next to the subject.
- **One CTA per email** — a single dark button, with a fallback plain URL
  underneath for clients that block buttons or rewrite links.
- **OTP template** uses a monospace block with letter spacing tuned for the
  6-digit code Supabase generates.

## Quick edits

To change the brand color (the small accent inside the logo and OTP), update
`#83f3df` everywhere. To change the button color, update `#0b0f13`. To change
the link color, update `#0d8c80`.
