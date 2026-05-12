-- Artifacts: a user uploads a bundle of HTML/CSS/JS/JSX files that render together.
-- Each artifact is owned by a user, optionally has a public share token.

create extension if not exists "pgcrypto";

create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled',
  kind text not null check (kind in ('html', 'jsx')),
  -- File bundle: array of { name, content, type } stored inline for portability.
  files jsonb not null default '[]'::jsonb,
  entry text,                -- entry file name (e.g. App.jsx) for jsx kind
  share_token text unique,   -- present when artifact is shared publicly
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artifacts_owner_idx on public.artifacts (owner, created_at desc);
create index if not exists artifacts_share_token_idx on public.artifacts (share_token) where share_token is not null;

-- RLS
alter table public.artifacts enable row level security;

drop policy if exists "owners read own artifacts" on public.artifacts;
create policy "owners read own artifacts"
  on public.artifacts for select
  using (auth.uid() = owner);

drop policy if exists "anyone reads shared artifacts" on public.artifacts;
create policy "anyone reads shared artifacts"
  on public.artifacts for select
  using (share_token is not null);

drop policy if exists "owners insert own artifacts" on public.artifacts;
create policy "owners insert own artifacts"
  on public.artifacts for insert
  with check (auth.uid() = owner);

drop policy if exists "owners update own artifacts" on public.artifacts;
create policy "owners update own artifacts"
  on public.artifacts for update
  using (auth.uid() = owner)
  with check (auth.uid() = owner);

drop policy if exists "owners delete own artifacts" on public.artifacts;
create policy "owners delete own artifacts"
  on public.artifacts for delete
  using (auth.uid() = owner);

-- Updated-at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists artifacts_touch_updated_at on public.artifacts;
create trigger artifacts_touch_updated_at
  before update on public.artifacts
  for each row execute function public.touch_updated_at();
