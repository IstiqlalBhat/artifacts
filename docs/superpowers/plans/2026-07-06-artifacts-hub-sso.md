# Artifacts → Hub SSO Centralization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the artifacts app's standalone Supabase auth with the hub SSO (shared `.tools.suncoast.studio` cookie, identity project `elkplwruyikftwccarpy`), serve it at `artifacts.tools.suncoast.studio`, keep its data in its own Supabase project (`qbykhcwzkdvnvruyhlcc`) behind a service-role client, backfill 14 artifact owners to identity-project user ids, and 308-redirect the old hostnames.

**Architecture:** Satellite recipe copied from `tools/clickup-time-tracking/web` (the Hour Archive): identity session via `@supabase/ssr` cookie client against the shared identity project + `is_current_user_allowed()` RPC; all data reads/writes via a service-role client against the app's own project, with ownership enforced by the existing `.eq("owner", user.id)` filters. Spec: `docs/superpowers/specs/2026-07-06-artifacts-hub-sso-design.md` (approved).

**Tech Stack:** Next.js 16 (App Router, `proxy.ts` NOT `middleware.ts`), React 19, TypeScript, `@supabase/ssr`, `@supabase/supabase-js`, Vitest, pnpm, Vercel REST API, Supabase Management API, Terraform (aws-infra), gh CLI.

## Global Constraints

- **Next.js 16 has breaking changes** (per `AGENTS.md`): middleware lives in `proxy.ts` exporting `proxy()`; when unsure about an API, read the guide in `node_modules/next/dist/docs/` before writing code.
- **Artifacts repo:** pnpm; double-quoted strings; work on the existing branch `feat/hub-sso-centralized-auth` (spec already committed as `ae3d912`). Never create/read/edit `.env*` secret files — only `.env.example`.
- **Tools repo (hub card):** single-quoted strings; branch off `main`; do NOT touch `clickup-time-tracking/` (its CLAUDE.md forbids attribution lines and its docs are gitignored).
- **Identity project:** `https://elkplwruyikftwccarpy.supabase.co` (transcript-router). **Data project:** `https://qbykhcwzkdvnvruyhlcc.supabase.co` (artifacts). Never swap these.
- **Vercel:** project `artifacts` = `prj_eDUKfIJz35v7ll9WpdSCwsWsOmNZ`, team `team_JY8AwqnV3lQXbmn9P1gdMK20`, git-connected to `SuncoastVS/artifacts` (prod branch `main` → merging the PR deploys prod). Set env vars via the **REST API only** — `vercel env add` with piped stdin silently stores EMPTY values. `NEXT_PUBLIC_*` values bake at build time.
- **Vercel API auth:** `TOKEN=$(python3 -c "import json;print(json.load(open('$HOME/Library/Application Support/com.vercel.cli/auth.json'))['token'])")`. If a call returns `invalidToken`, run any `vercel` CLI command first (refreshes the OAuth token) and re-read.
- **Supabase Management API auth:** `SB_TOKEN=$(cat ~/.supabase/access-token 2>/dev/null || security find-generic-password -s "Supabase CLI" -w)`.
- **`/s/[shareId]` must remain publicly accessible** (no auth) at every step.
- **AWS creds for Terraform:** the CLI uses `aws login` creds that Terraform can't read; always prefix with `eval "$(aws configure export-credentials --format env)"`.
- Commit style: conventional commits. End artifacts/aws-infra/tools commit messages with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Vitest test infrastructure (artifacts repo)

All work in `/Users/istiqlalaurangzeb/SuncoastCode/tools/artifacts` on branch `feat/hub-sso-centralized-auth`.

**Files:**
- Modify: `package.json` (add `test` script, `vitest` + `server-only` deps)
- Create: `vitest.config.ts`
- Create: `test/__mocks__/server-only.ts`

**Interfaces:**
- Produces: `pnpm test` runs vitest over `test/**/*.test.ts`; `@/` alias resolves to repo root; importing `"server-only"` is a no-op in tests.

- [ ] **Step 1: Install dev/runtime deps**

```bash
cd /Users/istiqlalaurangzeb/SuncoastCode/tools/artifacts
pnpm add -D vitest
pnpm add server-only
```

- [ ] **Step 2: Add the test script**

In `package.json` `scripts`, after `"lint": "eslint"` add:

```json
"test": "vitest run"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": new URL(".", import.meta.url).pathname,
      "server-only": new URL("test/__mocks__/server-only.ts", import.meta.url)
        .pathname,
    },
  },
});
```

- [ ] **Step 4: Create `test/__mocks__/server-only.ts`**

```ts
export {};
```

- [ ] **Step 5: Verify the runner works (no tests yet — expect "No test files found" exit 1 is OK, or pass with `--passWithNoTests`)**

Run: `pnpm vitest run --passWithNoTests`
Expected: exits 0, "No test files found" note.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts test/__mocks__/server-only.ts
git commit -m "chore: add vitest test infrastructure

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `cookieDomainOptions()` helper (TDD)

**Files:**
- Test: `test/auth-helpers.test.ts`
- Create: `lib/auth-helpers.ts`

**Interfaces:**
- Produces: `cookieDomainOptions(): { domain?: string }` — reads `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` at call time; `{}` when unset (host-only cookies in dev). Consumed by Tasks 3, 4, 6.

- [ ] **Step 1: Write the failing test**

`test/auth-helpers.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { cookieDomainOptions } from "@/lib/auth-helpers";

describe("cookieDomainOptions", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;
  });

  it("returns the shared domain when the env var is set", () => {
    process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN = ".tools.suncoast.studio";
    expect(cookieDomainOptions()).toEqual({ domain: ".tools.suncoast.studio" });
  });

  it("returns {} when unset so dev cookies stay host-only", () => {
    expect(cookieDomainOptions()).toEqual({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run test/auth-helpers.test.ts`
Expected: FAIL — cannot resolve `@/lib/auth-helpers`.

- [ ] **Step 3: Write the implementation**

`lib/auth-helpers.ts`:

```ts
export function cookieDomainOptions(): { domain?: string } {
  const domain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;
  return domain ? { domain } : {};
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run test/auth-helpers.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add test/auth-helpers.test.ts lib/auth-helpers.ts
git commit -m "feat: shared-cookie domain helper for hub SSO

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Repoint the SSR auth client at the identity project

**Files:**
- Modify: `lib/supabase/server.ts` (rewrite in place — keeps export names so 8 importers don't churn)
- Modify: `proxy.ts` (rewrite)
- Delete: `lib/supabase/middleware.ts`, `lib/supabase/client.ts` (client.ts is confirmed dead code)

**Interfaces:**
- Consumes: `cookieDomainOptions()` from Task 2.
- Produces (same names as today): `isConfigured(): boolean`, `createClient(): Promise<SupabaseClient>` (identity project, cookie-scoped), `getCurrentUser(): Promise<User | null>`. Consumed by Tasks 4, 6, 7, 8.

- [ ] **Step 1: Rewrite `lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cookieDomainOptions } from "@/lib/auth-helpers";

export function isConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Cookie-scoped client for the shared IDENTITY project (hub SSO). Auth only —
// all artifact data lives in this app's own project, reached via supabaseData().
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon",
    {
      cookieOptions: cookieDomainOptions(),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — proxy handles refresh.
          }
        },
      },
    },
  );
}

export async function getCurrentUser() {
  if (!isConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Rewrite `proxy.ts`** (session refresh only; redirect logic moves to `requireUser()` in Task 4; keep the image-excluding matcher)

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { cookieDomainOptions } from "@/lib/auth-helpers";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon",
    {
      cookieOptions: cookieDomainOptions(),
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 3: Delete the dead files**

```bash
git rm lib/supabase/middleware.ts lib/supabase/client.ts
```

- [ ] **Step 4: Verify nothing still imports the deleted modules**

Run: `grep -rn "supabase/middleware\|supabase/client" app lib components proxy.ts`
Expected: no output.

(The full build still fails here — pages/actions are refactored in Tasks 7–8. That's expected mid-branch; `pnpm test` must pass.)

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: point SSR auth at the shared identity project

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Allowlist + `requireUser()` gate (TDD)

**Files:**
- Create: `lib/allowlist.ts`
- Test: `test/auth.test.ts`
- Create: `lib/auth.ts`

**Interfaces:**
- Consumes: `createClient` from Task 3.
- Produces:
  - `isCurrentUserAllowed(supabase: SupabaseClient): Promise<boolean>` — `rpc("is_current_user_allowed")` on the identity project.
  - `hubLoginUrl(nextPath?: string): string` — hub login with `?next=` = `NEXT_PUBLIC_SITE_URL` + path.
  - `requireUser(nextPath: string): Promise<{ id: string; email: string }>` — redirects to hub login (no session) or hub `/no-access` (not allowlisted). First line of every gated page (Task 8).
  - `currentAllowedUser(): Promise<{ id: string; email: string } | null>` — soft variant for server actions (Task 7).

- [ ] **Step 1: Create `lib/allowlist.ts`**

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

export async function isCurrentUserAllowed(
  supabase: SupabaseClient,
): Promise<boolean> {
  const { data } = await supabase.rpc("is_current_user_allowed");
  return data === true;
}
```

- [ ] **Step 2: Write the failing tests**

`test/auth.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getUser, allowed } = vi.hoisted(() => ({
  getUser: vi.fn(),
  allowed: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { getUser } })),
}));
vi.mock("@/lib/allowlist", () => ({ isCurrentUserAllowed: allowed }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { currentAllowedUser, hubLoginUrl, requireUser } from "@/lib/auth";

beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://artifacts.tools.suncoast.studio";
  getUser.mockReset();
  allowed.mockReset();
});
afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.HUB_LOGIN_URL;
});

describe("hubLoginUrl", () => {
  it("builds the hub login URL with the encoded next target", () => {
    expect(hubLoginUrl("/dashboard")).toBe(
      "https://tools.suncoast.studio/login?next=" +
        encodeURIComponent("https://artifacts.tools.suncoast.studio/dashboard"),
    );
  });
});

describe("requireUser", () => {
  it("redirects unauthenticated visitors to the hub login", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    await expect(requireUser("/dashboard")).rejects.toThrow(
      "REDIRECT:https://tools.suncoast.studio/login?next=" +
        encodeURIComponent("https://artifacts.tools.suncoast.studio/dashboard"),
    );
  });

  it("redirects non-allowlisted users to /no-access", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "u1", email: "x@y.z" } },
    });
    allowed.mockResolvedValue(false);
    await expect(requireUser("/dashboard")).rejects.toThrow(
      "REDIRECT:https://tools.suncoast.studio/no-access",
    );
  });

  it("returns id and email for an allowed user", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "u1", email: "x@y.z" } },
    });
    allowed.mockResolvedValue(true);
    await expect(requireUser("/dashboard")).resolves.toEqual({
      id: "u1",
      email: "x@y.z",
    });
  });
});

describe("currentAllowedUser", () => {
  it("returns null with no session", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    await expect(currentAllowedUser()).resolves.toBeNull();
  });

  it("returns null when not allowlisted", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "u1", email: "x@y.z" } },
    });
    allowed.mockResolvedValue(false);
    await expect(currentAllowedUser()).resolves.toBeNull();
  });

  it("returns the user when allowed", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "u1", email: "x@y.z" } },
    });
    allowed.mockResolvedValue(true);
    await expect(currentAllowedUser()).resolves.toEqual({
      id: "u1",
      email: "x@y.z",
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm vitest run test/auth.test.ts`
Expected: FAIL — cannot resolve `@/lib/auth`.

- [ ] **Step 4: Create `lib/auth.ts`**

```ts
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAllowed } from "@/lib/allowlist";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function hubLoginUrl(nextPath = "/"): string {
  const hub =
    process.env.HUB_LOGIN_URL ?? "https://tools.suncoast.studio/login";
  return `${hub}?next=${encodeURIComponent(`${siteUrl()}${nextPath}`)}`;
}

export async function requireUser(
  nextPath: string,
): Promise<{ id: string; email: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(hubLoginUrl(nextPath));
  if (!(await isCurrentUserAllowed(supabase))) {
    redirect("https://tools.suncoast.studio/no-access");
  }
  return { id: data.user.id, email: data.user.email ?? "" };
}

export async function currentAllowedUser(): Promise<{
  id: string;
  email: string;
} | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  if (!(await isCurrentUserAllowed(supabase))) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm test`
Expected: PASS (all files).

- [ ] **Step 6: Commit**

```bash
git add lib/allowlist.ts lib/auth.ts test/auth.test.ts
git commit -m "feat: requireUser gate against hub allowlist

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Service-role data client + `.env.example`

**Files:**
- Create: `lib/supabase/data.ts`
- Create: `.env.example`
- Modify: `.gitignore` (allow `.env.example` past the `.env*` rule at line 34)

**Interfaces:**
- Produces: `supabaseData(): SupabaseClient` — service-role client for the DATA project; server-only; throws if env missing. Consumed by Tasks 7–8.

- [ ] **Step 1: Create `lib/supabase/data.ts`**

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service-role client for this app's own DATA project. Ownership is enforced
// in app code (`.eq("owner", user.id)`) — the service role bypasses RLS.
// Never import from a Client Component: the key must never reach the browser.
export function supabaseData() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
```

- [ ] **Step 2: Create `.env.example`**

```bash
# Identity — the shared hub SSO Supabase project (same values on every tool).
NEXT_PUBLIC_SUPABASE_URL=https://elkplwruyikftwccarpy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# prod: .tools.suncoast.studio — must be IDENTICAL across all tool Vercel
# projects (shared-session SSO). Leave empty for local dev (host-only cookie).
NEXT_PUBLIC_AUTH_COOKIE_DOMAIN=
HUB_LOGIN_URL=https://tools.suncoast.studio/login
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Data — this app's own Supabase project (artifacts table).
SUPABASE_URL=https://qbykhcwzkdvnvruyhlcc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 3: In `.gitignore`, directly under the `.env*` line add:**

```
!.env.example
```

- [ ] **Step 4: Verify example file is trackable**

Run: `git check-ignore .env.example; echo "exit=$?"`
Expected: `exit=1` (not ignored).

- [ ] **Step 5: Commit**

```bash
git add lib/supabase/data.ts .env.example .gitignore
git commit -m "feat: service-role data client + env example

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Signout route, remove standalone auth routes, Header

**Files:**
- Create: `app/auth/signout/route.ts`
- Delete: `app/auth/logout/route.ts`, `app/auth/callback/route.ts`, `app/login/` (page + actions), `app/signup/`
- Modify: `components/Header.tsx`

**Interfaces:**
- Consumes: `createClient` (Task 3), `cookieDomainOptions` (Task 2), `getCurrentUser` (Task 3), `hubLoginUrl` (Task 4).
- Produces: `POST /auth/signout` (Header form target).

- [ ] **Step 1: Create `app/auth/signout/route.ts`**

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { cookieDomainOptions } from "@/lib/auth-helpers";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // @supabase/ssr's signOut sets the auth cookies to empty WITHOUT Max-Age=0,
  // so the chunked sb-<ref>-auth-token.0/.1 cookies persist (empty) and corrupt
  // the next login. Force a real deletion on the domain they were set on.
  const store = await cookies();
  const { domain } = cookieDomainOptions();
  for (const { name } of store.getAll()) {
    if (name.startsWith("sb-")) {
      store.set(name, "", { domain, path: "/", maxAge: 0 });
    }
  }

  const hub =
    process.env.HUB_LOGIN_URL ?? "https://tools.suncoast.studio/login";
  return NextResponse.redirect(hub, { status: 303 });
}
```

- [ ] **Step 2: Delete the standalone auth surface**

```bash
git rm -r app/auth/logout app/auth/callback app/login app/signup
```

- [ ] **Step 3: Update `components/Header.tsx`**

Add the import:

```ts
import { hubLoginUrl } from "@/lib/auth";
```

Change the signout form action (line 47) from `/auth/logout` to `/auth/signout`:

```tsx
<form action="/auth/signout" method="post">
```

Replace the signed-out block (the `<>` fragment with the `/login` + `/signup` links, lines 59–66) with:

```tsx
<a href={hubLoginUrl("/dashboard")} className={buttonStyles({ size: "sm" })}>
  Sign in
</a>
```

- [ ] **Step 4: Verify no references to the deleted routes remain**

Run: `grep -rn '"/login\|/signup\|auth/logout\|auth/callback' app components lib | grep -v node_modules`
Expected: remaining hits only in files Task 8 fixes — `app/page.tsx`, `app/s/[shareId]/page.tsx`, and the `redirect("/login?redirect=…")` lines in `app/dashboard/page.tsx`, `app/a/[id]/page.tsx`, `app/d/[id]/page.tsx`, `app/directory/page.tsx`. Nothing in `components/` or `lib/`.

- [ ] **Step 5: Run tests + commit**

Run: `pnpm test` → PASS.

```bash
git add -A
git commit -m "feat: hub signout with sb-* cookie purge; drop standalone login/signup

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Refactor `lib/artifacts.ts` to identity user + data client

**Files:**
- Modify: `lib/artifacts.ts`

**Interfaces:**
- Consumes: `currentAllowedUser()` (Task 4), `supabaseData()` (Task 5).
- Produces: same exported server actions with unchanged signatures/return shapes: `createArtifact`, `updateArtifact`, `toggleDirectory`, `toggleShare`, `deleteArtifact`.

- [ ] **Step 1: Swap the imports**

Remove `import { createClient } from "@/lib/supabase/server";` and add:

```ts
import { currentAllowedUser } from "@/lib/auth";
import { supabaseData } from "@/lib/supabase/data";
```

- [ ] **Step 2: Update the private read helpers** — replace `const supabase = await createClient();` with `const supabase = supabaseData();` in `getShareToken` (line 48) and `getShareState` (line 61). Remove the now-unneeded `await` only from client creation; queries stay awaited.

- [ ] **Step 3: Update every action's auth preamble.** In `createArtifact`, `updateArtifact`, `toggleDirectory`, `toggleShare`, `deleteArtifact`, replace this pattern:

```ts
const supabase = await createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) return { error: "Not signed in" };
```

with:

```ts
const user = await currentAllowedUser();
if (!user) return { error: "Not signed in" };
const supabase = supabaseData();
```

(`deleteArtifact` returns `void` — keep its bare `if (!user) return;`.)

- [ ] **Step 4: Set `owner_email` on insert** (the DB trigger that derived it is dropped in Task 9). In `createArtifact`'s `.insert({...})` add after `owner: user.id,`:

```ts
owner_email: user.email,
```

- [ ] **Step 5: Verify no `supabase.auth` usage remains in the file**

Run: `grep -n "auth\.\|createClient" lib/artifacts.ts`
Expected: no output.

Run: `pnpm test` → PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/artifacts.ts
git commit -m "refactor: artifact actions use identity user + service-role data client

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Refactor pages to `requireUser()` + data client

**Files:**
- Modify: `app/dashboard/page.tsx`, `app/a/[id]/page.tsx`, `app/d/[id]/page.tsx`, `app/directory/page.tsx`, `app/new/page.tsx`, `app/s/[shareId]/page.tsx`, `app/page.tsx`

**Interfaces:**
- Consumes: `requireUser(nextPath)`, `hubLoginUrl` (Task 4), `supabaseData()` (Task 5), `getCurrentUser` (Task 3).

- [ ] **Step 1: `app/dashboard/page.tsx`** — replace imports of `createClient` with:

```ts
import { requireUser } from "@/lib/auth";
import { supabaseData } from "@/lib/supabase/data";
```

Replace lines 32–36 (client + getUser + redirect) with:

```ts
const user = await requireUser("/dashboard");
const supabase = supabaseData();
```

(`redirect` import from `next/navigation` becomes unused — remove it. The data query keeps `.eq("owner", user.id)`.)

- [ ] **Step 2: `app/a/[id]/page.tsx`** — same import swap. Replace the client + getUser + `if (!user) redirect(...)` block with:

```ts
const user = await requireUser(`/a/${id}`);
const supabase = supabaseData();
```

Keep `if (data.owner !== user.id) notFound();`. Remove the unused `redirect` import.

- [ ] **Step 3: `app/d/[id]/page.tsx`** — same swap:

```ts
const user = await requireUser(`/d/${id}`);
const supabase = supabaseData();
```

Keep `if (!data.in_directory && data.owner !== user.id) notFound();`. Remove unused `redirect` import.

- [ ] **Step 4: `app/directory/page.tsx`** — same swap:

```ts
await requireUser("/directory");
const supabase = supabaseData();
```

(The page doesn't use the user object beyond gating.) Remove unused `redirect` import.

- [ ] **Step 5: `app/new/page.tsx`** — make the component async and gate it (it currently has no check at all):

```tsx
import { Header } from "@/components/Header";
import { CreateArtifactView } from "@/components/CreateArtifactView";
import { requireUser } from "@/lib/auth";

export default async function NewArtifactPage() {
  await requireUser("/new");
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 min-h-0">
        <CreateArtifactView />
      </main>
    </div>
  );
}
```

- [ ] **Step 6: `app/s/[shareId]/page.tsx`** (MUST stay public) — in `fetchShared`, replace `const supabase = await createClient();` with `const supabase = supabaseData();` (swap the import accordingly). Change the "Make your own →" link (line 84) from `href="/signup"` to `href="/"`.

- [ ] **Step 7: `app/page.tsx`** (landing, public) — add `import { hubLoginUrl } from "@/lib/auth";`. Replace lines 170–173 with:

```ts
const primaryHref = user ? "/new" : hubLoginUrl("/dashboard");
const primaryLabel = user ? "Create artifact" : "Sign in";
const secondaryHref = user ? "/dashboard" : hubLoginUrl("/dashboard");
const secondaryLabel = user ? "Open library" : "Sign in";
```

If the hero renders both primary and secondary CTAs unconditionally, wrap the secondary in `{user && (…)}` so a signed-out visitor sees a single "Sign in" button, not two.

In the bottom CTA section (~line 429), change the primary label ternary `{user ? "Create artifact" : "Create your account"}` to `{user ? "Create artifact" : "Sign in"}` and delete the `{!user && (<Link href="/login" ...>Sign in</Link>)}` block entirely (the primary already covers sign-in when logged out).

Search the rest of the file for any remaining `/login`, `/signup`, "Sign up", "Create your account", or "Start free" copy and convert each to the single sign-in treatment above (`grep -n 'login\|signup\|Sign up\|Start free\|Create your account' app/page.tsx`). Any `<Link>` whose href becomes `hubLoginUrl(...)` (an external URL) must become an `<a>`.

- [ ] **Step 8: Full verification of the app code**

```bash
grep -rn '"/login\|"/signup' app components lib   # expect: no output
pnpm test                                          # expect: PASS
pnpm lint                                          # expect: clean
pnpm build                                         # expect: compiles (env-less build uses placeholder fallbacks)
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: gate all private routes through hub SSO requireUser

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Migration 005, backfill script, README; open the PR

**Files:**
- Create: `supabase/migrations/005_external_identity.sql`
- Create: `scripts/backfill-sso-owners.sql`
- Modify: `README.md` (env var section + production URL)

**Interfaces:**
- Produces: migration + backfill SQL that Task 12 executes at cutover. NOT applied in this task.

- [ ] **Step 1: Create `supabase/migrations/005_external_identity.sql`**

```sql
-- Identity moved to the shared hub SSO Supabase project. `owner` now stores
-- that project's auth.users ids, which do not exist in this database:
--  * the FK to local auth.users must go (also removes its ON DELETE CASCADE);
--  * the trigger deriving owner_email from local auth.users must go, or it
--    would null owner_email on every future write. The app sets owner_email
--    from the SSO session instead.
-- RLS policies remain but are vestigial: the app now uses the service role.

alter table public.artifacts drop constraint artifacts_owner_fkey;

drop trigger if exists artifacts_set_owner_email on public.artifacts;
drop function if exists private.set_owner_email();
```

- [ ] **Step 2: Create `scripts/backfill-sso-owners.sql`**

```sql
-- One-time backfill after switching to hub SSO (run AFTER migration 005).
-- Remaps artifacts.owner from OLD local auth.users ids to the ids the same
-- people have in the IDENTITY project (elkplwruyikftwccarpy).
--
-- Fill in the three <UUID-*> values first — they come from the identity
-- project (run there):
--   select id, email from auth.users
--   where email in ('istiqlal@suncoast.studio','sean@suncoast.studio','travis@suncoast.studio');
--
-- istiqlal1234@gmail.com merges into istiqlal@suncoast.studio (decision in
-- docs/superpowers/specs/2026-07-06-artifacts-hub-sso-design.md).

begin;

update public.artifacts a
set owner = v.new_owner::uuid,
    owner_email = v.new_email
from auth.users old_u,
     (values
        ('istiqlal1234@gmail.com', '<UUID-ISTIQLAL>', 'istiqlal@suncoast.studio'),
        ('sean@suncoast.studio',   '<UUID-SEAN>',     'sean@suncoast.studio'),
        ('travis@suncoast.studio', '<UUID-TRAVIS>',   'travis@suncoast.studio')
     ) as v(old_email, new_owner, new_email)
where old_u.email = v.old_email
  and a.owner = old_u.id;

-- Sanity: 14 artifacts total; owners now the three identity ids; no nulls.
select owner, owner_email, count(*) from public.artifacts
group by owner, owner_email order by count(*) desc;

commit;
```

- [ ] **Step 3: Update `README.md`** — in the env-var docs replace `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` with `NEXT_PUBLIC_SUPABASE_ANON_KEY`, document the split (identity vars vs `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` data vars, `NEXT_PUBLIC_AUTH_COOKIE_DOMAIN`, `HUB_LOGIN_URL`) and change the example production `NEXT_PUBLIC_SITE_URL` (line 88) from `https://svsartifacts.com` to `https://artifacts.tools.suncoast.studio`. Note that login/signup pages no longer exist — access is via the hub (`tools.suncoast.studio`).

- [ ] **Step 4: Push the branch and open the PR (do NOT merge — merging deploys prod; that happens at cutover, Task 12)**

```bash
git add supabase/migrations/005_external_identity.sql scripts/backfill-sso-owners.sql README.md
git commit -m "feat: migration + backfill script for external identity

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push -u origin feat/hub-sso-centralized-auth
gh pr create --repo SuncoastVS/artifacts --base main \
  --title "Centralize auth behind the hub SSO (artifacts.tools.suncoast.studio)" \
  --body "$(cat <<'EOF'
Replaces standalone Supabase auth (login/signup) with the shared hub SSO used by Hour Archive and Transcript Router. Data stays in this app's own Supabase project behind a service-role client.

- Identity: shared cookie perimeter (.tools.suncoast.studio) + is_current_user_allowed() allowlist
- requireUser() gates /dashboard, /new, /a, /d, /directory; /s/[shareId] stays public
- Signout purges sb-* cookies with Max-Age=0 (June lockout fix)
- Migration 005 drops the local auth.users FK + owner_email trigger
- scripts/backfill-sso-owners.sql remaps 14 artifact owners to identity ids

⚠️ Do not merge until the cutover window: merging deploys prod, and the app only works once the new env vars are set and the backfill has run. Spec: docs/superpowers/specs/2026-07-06-artifacts-hub-sso-design.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

### Task 10: DNS — attach domain, aws-infra PR, apply

**Files:**
- Modify (aws-infra repo, fresh branch off `main`): `modules/ventures/suncoastvs/route53.tf`

Use a throwaway worktree so the user's `aws-infra` checkout (on `internaltools`) is untouched. One exists at `/private/tmp/claude-501/-Users-istiqlalaurangzeb-SuncoastCode-tools/d9a858ec-6053-4e34-904b-f4b5448b7687/scratchpad/aws-infra-main` (detached at `origin/main`); otherwise recreate with `git -C ~/SuncoastCode/aws-infra worktree add <scratchpad>/aws-infra-main --detach origin/main`.

- [ ] **Step 1: Attach the domain to the Vercel project**

```bash
TOKEN=$(python3 -c "import json;print(json.load(open('$HOME/Library/Application Support/com.vercel.cli/auth.json'))['token'])")
curl -s -X POST "https://api.vercel.com/v10/projects/prj_eDUKfIJz35v7ll9WpdSCwsWsOmNZ/domains?teamId=team_JY8AwqnV3lQXbmn9P1gdMK20" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"artifacts.tools.suncoast.studio"}'
```

Expected: JSON with `"name":"artifacts.tools.suncoast.studio"`, `"verified":true` (apex is already on this team).

- [ ] **Step 2: Get the Vercel-issued CNAME target**

```bash
curl -s "https://api.vercel.com/v6/domains/artifacts.tools.suncoast.studio/config?teamId=team_JY8AwqnV3lQXbmn9P1gdMK20" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

Capture the recommended CNAME value (a `<hash>.vercel-dns-0XX.com` host, like the four existing tool records). If the response carries no recommended value, read it from the Vercel dashboard (Project artifacts → Domains → artifacts.tools.suncoast.studio). Call it `<VERCEL-CNAME>` below.

- [ ] **Step 3: Branch + edit route53.tf in the worktree**

```bash
cd <scratchpad>/aws-infra-main
git fetch origin main && git switch -c feat/artifacts-tools-dns origin/main
```

In `modules/ventures/suncoastvs/route53.tf`, append after `zoom_tools_vercel` (keep the four existing tool-record styles):

```hcl
resource "aws_route53_record" "artifacts_tools_vercel" {
  zone_id = aws_route53_zone.hosted_zone.zone_id
  name    = "artifacts.tools.${local.dns_zone}"
  type    = "CNAME"
  ttl     = "300"
  records = ["<VERCEL-CNAME>."]
}
```

(Trailing dot on the record value, matching the existing records.)

- [ ] **Step 4: Validate with a targeted plan (read-only)**

```bash
eval "$(aws configure export-credentials --format env)"
terraform init -input=false
terraform plan -input=false -var-file=prod.tfvars \
  -target=module.suncoastvs.aws_route53_record.artifacts_tools_vercel
```

Expected: `Plan: 1 to add, 0 to change, 0 to destroy.`

- [ ] **Step 5: Commit, push, PR**

```bash
terraform fmt modules/ventures/suncoastvs/route53.tf
git add modules/ventures/suncoastvs/route53.tf
git commit -m "dns: artifacts.tools.suncoast.studio CNAME for the artifacts satellite

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push -u origin feat/artifacts-tools-dns
gh pr create --repo SuncoastVS/aws-infra --base main \
  --title "dns: artifacts.tools.suncoast.studio → Vercel" \
  --body "Adds the CNAME for the artifacts app's move behind the hub SSO (same pattern as the four existing tool records). Value is the Vercel-issued per-domain target; the domain is already attached to the artifacts Vercel project. terraform plan: 1 to add.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

- [ ] **Step 6: After PR merge — apply and verify**

```bash
git fetch origin main && git switch --detach origin/main
eval "$(aws configure export-credentials --format env)"
terraform apply -input=false -var-file=prod.tfvars \
  -target=module.suncoastvs.aws_route53_record.artifacts_tools_vercel
dig +short CNAME artifacts.tools.suncoast.studio   # expect: <VERCEL-CNAME>.
curl -sI https://artifacts.tools.suncoast.studio | head -3   # expect: HTTP/2 200 once cert issues
```

Also re-check `.../v6/domains/artifacts.tools.suncoast.studio/config` → `"misconfigured": false`.

---

### Task 11: Hub dashboard card (tools repo PR)

**Files (repo `/Users/istiqlalaurangzeb/SuncoastCode/tools`, new branch `feat/hub-artifacts-card` off `main`):**
- Modify: `hub/lib/env.ts`
- Modify: `hub/components/icons.tsx`
- Modify: `hub/app/page.tsx`

The user's tools checkout is on `feat/hour-archive-quick-ranges-search` — stash nothing; create the branch from `origin/main` in a worktree if that branch has uncommitted work: `git -C ~/SuncoastCode/tools worktree add <scratchpad>/tools-hub-card -b feat/hub-artifacts-card origin/main`.

- [ ] **Step 1: `hub/lib/env.ts`** — add after the `hoursToolUrl` line:

```ts
artifactsToolUrl: process.env.ARTIFACTS_TOOL_URL ?? 'https://artifacts.tools.suncoast.studio',
```

- [ ] **Step 2: `hub/components/icons.tsx`** — append (uses the existing `Outline`/`IconProps` from the top of the file):

```tsx
/** Artifacts — stacked layers. */
export function IconLayers(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="m12 3.5 8.5 4.9L12 13.3 3.5 8.4Z" />
      <path d="m3.5 12.4 8.5 4.9 8.5-4.9" opacity={0.85} />
      <path d="m3.5 16.3 8.5 4.9 8.5-4.9" opacity={0.55} />
    </Outline>
  );
}
```

- [ ] **Step 3: `hub/app/page.tsx`** — add `IconLayers` to the `@/components/icons` import list; change the destructure to `const { zoomToolUrl, hoursToolUrl, artifactsToolUrl } = loadEnv();`; append to the `tools` array:

```ts
{
  href: artifactsToolUrl,
  kicker: 'Prototypes',
  title: 'Artifacts',
  desc: 'Host and share live HTML & JSX prototypes with the whole studio.',
  Icon: IconLayers,
},
```

- [ ] **Step 4: Verify + PR**

```bash
cd hub && npm install && npm run build   # expect: compiled successfully
cd .. && git add hub && git commit -m "feat(hub): Artifacts tool card

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
git push -u origin feat/hub-artifacts-card
gh pr create --repo SuncoastVS/tools --base main \
  --title "feat(hub): Artifacts tool card" \
  --body "Adds the Artifacts satellite (artifacts.tools.suncoast.studio) to the hub dashboard. Mergeable any time — the card 404s gracefully until the artifacts cutover completes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

Merging this PR auto-deploys the hub (root dir `hub/`, git-connected). Safe to merge before or after Task 12.

---

### Task 12: Cutover (env → users → deploy → migrate → backfill → verify)

Execute in one sitting; the app is briefly broken between the env flip and the backfill (internal tool, accepted in the spec).

- [ ] **Step 1: Identity users.** Get identity keys, then admin-create the two missing users (auto-links to Google on their first login):

```bash
SERVICE_KEY=$(supabase projects api-keys --project-ref elkplwruyikftwccarpy -o json | python3 -c "import json,sys;print([k['api_key'] for k in json.load(sys.stdin) if k['name']=='service_role'][0])")
ANON_KEY=$(supabase projects api-keys --project-ref elkplwruyikftwccarpy -o json | python3 -c "import json,sys;print([k['api_key'] for k in json.load(sys.stdin) if k['name']=='anon'][0])")
for EMAIL in sean@suncoast.studio travis@suncoast.studio; do
  curl -s -X POST "https://elkplwruyikftwccarpy.supabase.co/auth/v1/admin/users" \
    -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"email_confirm\":true}"
done
```

(A 422 "already been registered" is fine — means they logged into the hub before.)

- [ ] **Step 2: Collect the three identity uuids** (Management API on the IDENTITY project):

```bash
SB_TOKEN=$(cat ~/.supabase/access-token 2>/dev/null || security find-generic-password -s "Supabase CLI" -w)
curl -s -X POST "https://api.supabase.com/v1/projects/elkplwruyikftwccarpy/database/query" \
  -H "Authorization: Bearer $SB_TOKEN" -H "Content-Type: application/json" \
  -d '{"query":"select id, email from auth.users where email in ('"'"'istiqlal@suncoast.studio'"'"','"'"'sean@suncoast.studio'"'"','"'"'travis@suncoast.studio'"'"')"}'
```

Paste the three uuids into `scripts/backfill-sso-owners.sql` (replacing `<UUID-*>`).

- [ ] **Step 3: Set Vercel env** (upsert new values, then delete the obsolete key):

```bash
TOKEN=$(python3 -c "import json;print(json.load(open('$HOME/Library/Application Support/com.vercel.cli/auth.json'))['token'])")
P="prj_eDUKfIJz35v7ll9WpdSCwsWsOmNZ"; T="team_JY8AwqnV3lQXbmn9P1gdMK20"
# Shell state does not persist between steps — re-derive the identity anon key:
ANON_KEY=$(supabase projects api-keys --project-ref elkplwruyikftwccarpy -o json | python3 -c "import json,sys;print([k['api_key'] for k in json.load(sys.stdin) if k['name']=='anon'][0])")
curl -s -X POST "https://api.vercel.com/v10/projects/$P/env?teamId=$T&upsert=true" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "[
  {\"key\":\"NEXT_PUBLIC_SUPABASE_URL\",\"value\":\"https://elkplwruyikftwccarpy.supabase.co\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\"]},
  {\"key\":\"NEXT_PUBLIC_SUPABASE_ANON_KEY\",\"value\":\"$ANON_KEY\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\"]},
  {\"key\":\"NEXT_PUBLIC_AUTH_COOKIE_DOMAIN\",\"value\":\".tools.suncoast.studio\",\"type\":\"encrypted\",\"target\":[\"production\"]},
  {\"key\":\"HUB_LOGIN_URL\",\"value\":\"https://tools.suncoast.studio/login\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\"]},
  {\"key\":\"NEXT_PUBLIC_SITE_URL\",\"value\":\"https://artifacts.tools.suncoast.studio\",\"type\":\"encrypted\",\"target\":[\"production\"]},
  {\"key\":\"SUPABASE_URL\",\"value\":\"https://qbykhcwzkdvnvruyhlcc.supabase.co\",\"type\":\"encrypted\",\"target\":[\"production\",\"preview\"]}
]"
# Obsolete: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (old data-project publishable key)
curl -s -X DELETE "https://api.vercel.com/v9/projects/$P/env/1k2ZfZKuEwEgxAGJ?teamId=$T" -H "Authorization: Bearer $TOKEN"
```

Verify names/targets: `curl -s "https://api.vercel.com/v9/projects/$P/env?teamId=$T" -H "Authorization: Bearer $TOKEN" | python3 -c "import json,sys; [print(e['key'], e['target']) for e in json.load(sys.stdin)['envs']]"` — `SUPABASE_SERVICE_ROLE_KEY` must still be present. Do NOT trust value listing (hidden); the functional test in Step 6 is the real verification.

- [ ] **Step 4: Deploy** — merge the artifacts PR (Task 9): `gh pr merge --repo SuncoastVS/artifacts --squash <PR#>`. The git-connected project builds prod with the new env. Watch: `vercel ls artifacts --scope team_JY8AwqnV3lQXbmn9P1gdMK20`.

- [ ] **Step 5: Apply migration 005, then the backfill** (Management API on the DATA project — order matters, the FK must be gone before owners are remapped):

```bash
curl -s -X POST "https://api.supabase.com/v1/projects/qbykhcwzkdvnvruyhlcc/database/query" \
  -H "Authorization: Bearer $SB_TOKEN" -H "Content-Type: application/json" \
  --data-binary @<(python3 -c "import json;print(json.dumps({'query':open('supabase/migrations/005_external_identity.sql').read()}))")
curl -s -X POST "https://api.supabase.com/v1/projects/qbykhcwzkdvnvruyhlcc/database/query" \
  -H "Authorization: Bearer $SB_TOKEN" -H "Content-Type: application/json" \
  --data-binary @<(python3 -c "import json;print(json.dumps({'query':open('scripts/backfill-sso-owners.sql').read()}))")
```

Expected final select: exactly 3 owner groups totalling 14 rows — `istiqlal@suncoast.studio` 8 (the merged Gmail set), `sean@suncoast.studio` 5, `travis@suncoast.studio` 1. No null `owner_email`, and every `owner` is one of the three identity uuids.

- [ ] **Step 6: Verify end-to-end** (Playwright MCP):
  1. `https://artifacts.tools.suncoast.studio/dashboard` logged-out → 307/302 chain to `tools.suncoast.studio/login?next=…`.
  2. Log in via the hub (Google, istiqlal@suncoast.studio) → land back on the artifacts dashboard → 8 artifacts listed.
  3. Open one artifact (`/a/<id>`) → editor loads; toggle nothing.
  4. Anon check (fresh incognito context): an `/s/<token>` share URL → renders with no login.
  5. `/directory` → lists `in_directory` artifacts with owner emails (not "Unknown").
  6. Create a throwaway artifact → appears in dashboard, `owner_email` = istiqlal@suncoast.studio in DB → delete it.
  7. Sign out from the artifacts header → redirected to hub login; sign back in → works (no stale-cookie lockout).

---

### Task 13: Flip the old hostnames to 308 redirects

Only after Task 12 Step 6 passes in full.

- [ ] **Step 1: PATCH each old domain**

```bash
TOKEN=$(python3 -c "import json;print(json.load(open('$HOME/Library/Application Support/com.vercel.cli/auth.json'))['token'])")
P="prj_eDUKfIJz35v7ll9WpdSCwsWsOmNZ"; T="team_JY8AwqnV3lQXbmn9P1gdMK20"
for D in svsartifacts.com www.svsartifacts.com artifacts.suncoast.studio; do
  curl -s -X PATCH "https://api.vercel.com/v9/projects/$P/domains/$D?teamId=$T" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"redirect":"artifacts.tools.suncoast.studio","redirectStatusCode":308}'
done
```

- [ ] **Step 2: Verify redirects preserve paths**

```bash
curl -sI "https://svsartifacts.com/s/SOME-REAL-TOKEN" | grep -i "^location\|HTTP"
curl -sI "https://artifacts.suncoast.studio/dashboard" | grep -i "^location\|HTTP"
```

Expected: `HTTP/2 308` with `location: https://artifacts.tools.suncoast.studio/<same path>`, and following the redirect on the share link renders the artifact.

- [ ] **Step 3: Confirm the Route 53 records for the old names stay untouched** (they now point at a redirecting Vercel domain — nothing to change in aws-infra).

---

## Execution notes

- Tasks 1–9 are pure repo work (artifacts repo, one PR at the end — **not merged**).
- Task 10 (DNS) and Task 11 (hub card) are independent of 1–9 and of each other; both can run any time before Task 12.
- Task 12 is the cutover and consumes everything.
- Task 13 is last, after verification.
