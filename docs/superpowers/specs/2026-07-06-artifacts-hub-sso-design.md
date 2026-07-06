# Artifacts → Hub SSO Centralization — Design

**Date:** 2026-07-06
**Status:** Approved (design reviewed section-by-section)
**Repos touched:** `SuncoastVS/artifacts` (this repo), `SuncoastVS/tools` (hub card), `SuncoastVS/aws-infra` (DNS)

## Goal

Retire the artifacts app's standalone Supabase auth (email/password login + self-serve signup at `svsartifacts.com`) and gate it behind the existing hub SSO (`tools.suncoast.studio`), serving it at **`artifacts.tools.suncoast.studio`** — a standard "satellite" exactly like Hour Archive (`time-tracking.tools.suncoast.studio`).

## Decisions made (with owner)

| Decision | Choice |
|---|---|
| Hostname | `artifacts.tools.suncoast.studio` — inside the existing `.tools.suncoast.studio` cookie perimeter. Widening the cookie to `.suncoast.studio` was considered and rejected (exposes the session to every apex subdomain, incl. WordPress/marketing on the wildcard). |
| Data home | Keep the artifacts' own Supabase project (`qbykhcwzkdvnvruyhlcc`) for data; identity comes from the shared identity project (`elkplwruyikftwccarpy`, transcript-router). Hour Archive dual-project pattern. Merging data into the identity project was rejected (shared-schema governance). |
| `istiqlal1234@gmail.com`'s 8 artifacts | Reassign to `istiqlal@suncoast.studio` during backfill (Gmail is not on the hub allowlist). |
| Old hostnames | `svsartifacts.com`, `www.svsartifacts.com`, `artifacts.suncoast.studio` all become **308 redirects** to the new host after cutover. Registration for `svsartifacts.com` may lapse later; no action now. |
| Signup | Removed entirely. Access = hub Google OAuth + `is_current_user_allowed()` allowlist (domain-based: `suncoast.studio`, `saasfactory.vc`). |

## Current state (verified 2026-07-06)

- Auth today: server-side `@supabase/ssr` cookie sessions against the app's own project; login/signup pages + `/auth/callback`; no cookie `domain` config anywhere. `lib/supabase/client.ts` (browser client) is dead code.
- Gating today is inconsistent: middleware redirect covers `/dashboard`, `/new`, `/a/`; `/d/` and `/directory` are page-gated only.
- Data: single table `public.artifacts` — `owner uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`, RLS on `auth.uid()`, `anyone reads shared artifacts` anon policy (`share_token is not null`) powering public `/s/[shareId]`. A `SECURITY DEFINER` trigger (`private.set_owner_email`) re-derives `owner_email` from local `auth.users` on every write. No storage buckets; file bundles live in `files jsonb`.
- Scale: 3 users, 14 artifacts, ~3 MB total (`istiqlal1234@gmail.com`×8, `sean@suncoast.studio`×5, `travis@suncoast.studio`×1).
- Vercel project `artifacts` (`prj_eDUKfIJz35v7ll9WpdSCwsWsOmNZ`, team `team_JY8AwqnV3lQXbmn9P1gdMK20`) already has `artifacts.suncoast.studio` + `svsartifacts.com` (+`www` 308) attached and serving. Env vars: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (all "sensitive"-type; not readable via API).
- DNS: `artifacts.suncoast.studio` CNAME already codified in aws-infra (`modules/ventures/suncoastvs/route53.tf`, PR #82) and in TF state. `artifacts.tools.suncoast.studio` does **not** exist anywhere yet.

## Architecture

### 1. Auth perimeter (this repo)

Copy the satellite recipe from `tools/clickup-time-tracking/web/`:

- `lib/auth-helpers.ts` — `cookieDomainOptions()` reading `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN`.
- `lib/supabase/auth-server.ts` — identity-project `createServerClient` with `cookieOptions: cookieDomainOptions()`.
- `proxy.ts` — rewrite: refresh the identity session (`supabase.auth.getUser()`) with shared cookie options; keep the existing static-asset matcher; drop its redirect logic (pages gate themselves).
- `lib/allowlist.ts` — `isCurrentUserAllowed()` → `rpc('is_current_user_allowed')`.
- `lib/auth.ts` — `requireUser()`: no session → redirect `${HUB_LOGIN_URL}?next=<encoded https://artifacts.tools.suncoast.studio + current path>`; not allowlisted → `https://tools.suncoast.studio/no-access`. Returns `{ id, email }`.
- **First line of every gated page:** `/dashboard`, `/new`, `/a/[id]`, `/d/[id]`, `/directory` (fixes today's `/d`+`/directory`+`/new` gating inconsistencies).
- **Public, untouched:** `/`, `/s/[shareId]`, `/not-found`.
- **Deleted:** `app/login/`, `app/signup/`, `app/auth/callback/`, password/signup server actions, `lib/supabase/client.ts` (already dead), `lib/supabase/middleware.ts` (superseded by new proxy logic).
- **Sign-out:** replace `app/auth/logout` with transcript-router-style `app/auth/signout/route.ts`: `signOut()` **then** delete every `sb-*` cookie with `Max-Age=0` on the shared domain (the 2026-06 lockout-bug fix), 303 → hub login. Header form posts here (same-site, SameSite=Lax OK).
- Landing page (`app/page.tsx`): single "Sign in" CTA → hub login with `?next=`; remove signup CTA.
- `getCurrentUser()` (used by landing CTA swap + data layer) now reads the identity session.

### 2. Data layer (this repo)

- New `lib/supabase/data.ts` — service-role client for the artifacts data project (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, server-only, no cookies).
- `lib/artifacts.ts` + pages swap the cookie-session client for the data client. Identity (`requireUser()`/`getCurrentUser()`) supplies `user.id`/`user.email`; existing `.eq("owner", user.id)` filters become the enforcement layer.
  - `/s/[shareId]`: data client + `.eq("share_token", …)` (+ not-null) — stays anonymous.
  - `/directory`: data client + `in_directory = true`.
  - `/d/[id]`: `in_directory = true` OR owner.
  - Inserts set `owner_email` explicitly from the session email.
- RLS policies remain in place but are vestigial (service role bypasses them); they still guard the old anon key.

### 3. Schema migration + backfill (one-time)

`supabase/migrations/005_external_identity.sql` (applied to `qbykhcwzkdvnvruyhlcc`):
- `ALTER TABLE public.artifacts DROP CONSTRAINT artifacts_owner_fkey;` — owner ids become identity-project ids that don't exist in local `auth.users`; also removes the `ON DELETE CASCADE` hazard.
- Drop trigger `artifacts_set_owner_email` and function `private.set_owner_email()` — would null `owner_email` on every future write. Column stays; app sets it.

Backfill procedure:
1. Identity project: admin-create `sean@suncoast.studio`, `travis@suncoast.studio` (`istiqlal@suncoast.studio` already exists). Google OAuth auto-links by verified email at their first login.
2. Mapping: `istiqlal1234@gmail.com → istiqlal@suncoast.studio`'s new id (account merge); `sean`/`travis` → same-email new ids.
3. `UPDATE public.artifacts SET owner = <new id>, owner_email = <new email>` per mapping.
4. Verify: total 14 rows; per-owner counts 8+1 (istiqlal), 5 (sean), 1 (travis); share links render anonymously.

### 4. Domains / DNS / hub card

1. Attach `artifacts.tools.suncoast.studio` to the Vercel project → Vercel issues the per-domain CNAME target.
2. **aws-infra PR:** add `aws_route53_record.artifacts_tools_vercel` (CNAME, TTL 300, Vercel-issued value) to `modules/ventures/suncoastvs/route53.tf`, styled like `tools_vercel`/`time_tracking_tools_vercel`. Plain create — no import. `terraform apply` after merge.
3. **Hub card PR (`tools` repo):** `ARTIFACTS_TOOL_URL` (default `https://artifacts.tools.suncoast.studio`) in `hub/lib/env.ts`; icon in `hub/components/icons.tsx`; third entry in the `tools` array in `hub/app/page.tsx`.
4. After cutover verification: PATCH the three old hostnames to `redirect: artifacts.tools.suncoast.studio, redirectStatusCode: 308` via the Vercel domains API. The existing `artifacts.suncoast.studio` Route 53 record stays as-is.
5. No identity-project migrations; no new OAuth redirect URLs (hub owns the callback).

### 5. Env vars (Vercel project `artifacts`)

Set via the **Vercel REST API**, not CLI stdin (piped `vercel env add` silently stores empty values — June gotcha). `NEXT_PUBLIC_*` bake at build → set env **before** the cutover deploy.

| Var | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | identity project URL (`https://elkplwruyikftwccarpy.supabase.co`) — **repointed** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | identity project anon key (code already falls back to this name) |
| `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` | `.tools.suncoast.studio` |
| `HUB_LOGIN_URL` | `https://tools.suncoast.studio/login` |
| `NEXT_PUBLIC_SITE_URL` | `https://artifacts.tools.suncoast.studio` |
| `SUPABASE_URL` | data project URL (`https://qbykhcwzkdvnvruyhlcc.supabase.co`) — new name for old value |
| `SUPABASE_SERVICE_ROLE_KEY` | unchanged (data project) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | removed (identity anon key replaces it) |

## Rollout order

1. DNS/domain first: attach domain → aws-infra PR → apply → `artifacts.tools.suncoast.studio` serves the (still old-auth) app.
2. Prep: create identity users, compute owner mapping. No visible change.
3. **Cutover:** set env vars → merge app PR (deploy bakes new env) → run migration 005 + remap SQL alongside the deploy. Old sessions die at this moment by design (minutes-long window, internal tool); everyone re-logs-in via the hub.
4. Merge hub card PR.
5. Verify end-to-end (Playwright): hub login → dashboard shows merged artifacts; Sean/Travis counts intact; anon share link renders logged-out; signout → clean re-login (no stale-cookie lockout); gated routes redirect to hub with correct `?next=`.
6. Flip the three old hostnames to 308 redirects.

## Testing

- Unit: `cookieDomainOptions()` (mirrors the tools-repo tests), `requireUser()` redirect targets, allowlist gate.
- Manual/Playwright at cutover: the checklist in Rollout step 5.
- Data: post-remap SQL assertions (counts per owner, no null `owner_email`, no orphaned owners).

## Out of scope

- Letting `svsartifacts.com` registration lapse (later, once redirect traffic dies).
- Decommissioning the old project's auth config/email templates (dormant, harmless).
- Any change to the hub allowlist contents (domain rules already cover all three users post-merge).
