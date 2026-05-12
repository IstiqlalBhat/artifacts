# Artifacts

Upload HTML, CSS, JS, or JSX. Render it in a sandboxed iframe. Share it with a public link.

Built with **Next.js 16** (App Router) + **Supabase** (auth, Postgres, RLS) + **Tailwind 4**.

## Features

- Email + password auth (Supabase)
- Drag-and-drop file upload (or paste code) — multiple files per artifact
- Live preview, sandboxed iframe rendering
- JSX/TSX support via Babel standalone + React 18 (in the iframe)
- Per-artifact public share link, toggleable
- Row-level security: artifacts are private by default
- Share pages cached for 1h, invalidated immediately on edit/unshare

## Local setup

### 1. Supabase project

[supabase.com](https://supabase.com) → New project. Copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Publishable key** (or legacy anon key) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 2. Environment

```bash
cp .env.example .env.local
# fill in the two values above
```

### 3. Run the SQL migration

Supabase dashboard → **SQL Editor** → paste
[`supabase/migrations/001_artifacts.sql`](./supabase/migrations/001_artifacts.sql)
and run. Creates the `artifacts` table + RLS policies.

### 4. Auth options (optional)

**Authentication → Providers → Email** → toggle off "Confirm email" so signup
is instant. Keep it on if you want verification; then add
`http://localhost:3000/auth/callback` to **URL Configuration → Redirect URLs**.

### 4b. Branded email templates (optional)

Paste the HTML from [`supabase/templates/`](./supabase/templates/) into
**Authentication → Email Templates**. See
[`supabase/templates/README.md`](./supabase/templates/README.md) for the
file-to-slot mapping.

### 5. Dev server

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

### Option A — `vercel` CLI

```bash
pnpm dlx vercel@latest        # first-time link (will prompt to create project)
pnpm dlx vercel env add NEXT_PUBLIC_SUPABASE_URL
pnpm dlx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
pnpm dlx vercel env add NEXT_PUBLIC_SITE_URL   # https://your-app.vercel.app
pnpm dlx vercel --prod
```

### Option B — GitHub import

1. Push the repo to GitHub.
2. <https://vercel.com/new> → import the repo. Framework auto-detects as Next.js.
3. Add the three env vars in **Project Settings → Environment Variables** for
   **Production** and **Preview**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` — your deployment URL (e.g. `https://artifacts.vercel.app`)
4. **Deploy**.

### After the first deploy — point Supabase at production

Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL** → your Vercel URL
- **Redirect URLs** → add `https://your-app.vercel.app/auth/callback` (keep the
  localhost one too for dev).

Existing share links keep working — the share token is stored in the DB and
doesn't depend on the host. Any links you sent with `localhost` in them die;
new links picked up from the deployed site use the production host.

## How rendering works

Each artifact is a bundle of files stored as JSONB. On render, the server
builds a single HTML document that's piped into an iframe via `srcDoc`. The
iframe is sandboxed (`sandbox="allow-scripts allow-forms allow-popups allow-modals"`)
so artifact code can't reach into the parent page, cookies, or storage.

- **HTML kind** — finds the entry HTML file (or `index.html`), inlines any
  local `<link>` and `<script>` references against the uploaded files.
- **JSX kind** — concatenates the source files, strips ES `import`/`export`
  syntax, base64-encodes the result into the iframe, then uses Babel standalone
  at runtime to transform JSX and mount the first component named `App`,
  `Page`, `Main`, or the default export.

## Project layout

```
app/
  page.tsx                 Landing page (live JSX demo in an iframe)
  login/, signup/          Auth pages + server actions
  auth/callback/, logout/  Auth route handlers
  dashboard/               User dashboard
  new/                     Create artifact
  a/[id]/                  Owner view + editor + share bar
  s/[shareId]/             Public share view (cached, OpenGraph metadata)
  not-found.tsx            404 page
components/
  ArtifactEditor.tsx       Main editor (files, code, preview)
  ArtifactRenderer.tsx     Sandboxed iframe
  ShareBar.tsx             Share toggle + copy
  Header.tsx, FileList.tsx, ui/*
lib/
  renderer.ts              Builds the iframe document
  artifacts.ts             Server actions (create / update / share / delete)
  supabase/                client.ts, server.ts, middleware.ts
  utils.ts
supabase/migrations/       SQL schema + RLS
proxy.ts                   Auth refresh + route guard (Next 16 replaces middleware.ts)
vercel.ts                  Vercel deploy config (cache headers)
```
