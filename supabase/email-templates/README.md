# Supabase Email Templates

Repo-managed Supabase Auth email templates for Artifacts.

## Included templates

Dashboard template name | File | Uses
--- | --- | ---
Confirm signup | `confirmation.html` | `{{ .ConfirmationURL }}`, `{{ .Email }}`
Magic Link | `magic-link.html` | `{{ .ConfirmationURL }}`, `{{ .Email }}`
Reset Password | `recovery.html` | `{{ .ConfirmationURL }}`, `{{ .Email }}`
Invite User | `invite.html` | `{{ .ConfirmationURL }}`, `{{ .Email }}`
Change Email Address | `email-change.html` | `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}`
Reauthentication | `reauthentication.html` | `{{ .Token }}`, `{{ .Email }}`
Security notifications | `notifications/*.html` | notification-specific variables

Subjects live in `subjects.json`.

## Dashboard setup

Supabase dashboard:

1. Go to **Authentication -> Email Templates**.
2. Pick a template.
3. Copy the matching subject from `subjects.json`.
4. Copy the matching HTML file into **Message Body**.
5. Save.

The app already sends signup confirmations to:

```text
{{ site }}/auth/callback?next=/dashboard
```

through `options.emailRedirectTo` in `app/login/actions.ts`.

## Management API payload

Generate a JSON payload for Supabase's Management API:

```bash
node supabase/email-templates/scripts/build-management-payload.mjs > /tmp/artifacts-auth-templates.json
```

Include notification enable flags too:

```bash
node supabase/email-templates/scripts/build-management-payload.mjs --enable-notification-emails > /tmp/artifacts-auth-templates.json
```

Apply it with a Supabase access token:

```bash
curl -X PATCH "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  --data @/tmp/artifacts-auth-templates.json
```

Do not commit the generated payload if it includes project-specific settings.

## Notes

- These templates use Supabase's `{{ .ConfirmationURL }}` for link-based auth so they work with the current `/auth/callback` route.
- If email security scanners start consuming links, switch the action templates to a `{{ .TokenHash }}` flow and add an `/auth/confirm` route that calls `verifyOtp`.
- Keep **Authentication -> URL Configuration -> Site URL** and **Redirect URLs** in sync with local and production domains.
