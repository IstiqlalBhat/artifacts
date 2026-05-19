-- Directory + description.
-- description: optional free-text shown on cards and detail pages.
-- in_directory: when true, any signed-in user can read the artifact via
--   the Directory page or the /d/[id] viewer. Independent from share_token.
-- owner_email: denormalized at insert time so the Directory listing can show
--   the author without granting access to auth.users to the authenticated role.

alter table public.artifacts
  add column if not exists description text;

alter table public.artifacts
  add column if not exists in_directory boolean not null default false;

alter table public.artifacts
  add column if not exists owner_email text;

create index if not exists artifacts_in_directory_idx
  on public.artifacts (updated_at desc)
  where in_directory = true;

drop policy if exists "authenticated read directory artifacts" on public.artifacts;
create policy "authenticated read directory artifacts"
  on public.artifacts for select
  to authenticated
  using (in_directory = true);
