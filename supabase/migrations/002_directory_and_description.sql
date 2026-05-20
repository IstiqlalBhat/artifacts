-- Directory + description.
-- description: free-text shown on cards and detail pages. Required for new
--   artifacts (enforced in the server action); capped at 1000 chars here.
-- in_directory: when true, any signed-in user can read the artifact via
--   the Directory page or the /d/[id] viewer. Independent from share_token.
-- owner_email: derived from auth.users.email by trigger so the Directory
--   listing can show the author without granting the authenticated role
--   access to auth.users. Tamper-proof: clients cannot spoof it.

alter table public.artifacts
  add column if not exists description text;

alter table public.artifacts
  add column if not exists in_directory boolean not null default false;

alter table public.artifacts
  add column if not exists owner_email text;

update public.artifacts
   set description = left(description, 1000)
 where description is not null
   and char_length(description) > 1000;

alter table public.artifacts
  drop constraint if exists artifacts_description_length_chk;
alter table public.artifacts
  add constraint artifacts_description_length_chk
  check (description is null or char_length(description) <= 1000);

create index if not exists artifacts_in_directory_idx
  on public.artifacts (updated_at desc)
  where in_directory = true;

drop policy if exists "authenticated read directory artifacts" on public.artifacts;
create policy "authenticated read directory artifacts"
  on public.artifacts for select
  to authenticated
  using (in_directory = true);

create schema if not exists private;
revoke all on schema private from public;

-- owner_email derivation. security definer because authenticated role
-- doesn't have read access on auth.users; the trigger does the lookup on
-- their behalf and overwrites whatever the client tried to set.
create or replace function private.set_owner_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.owner_email := (
    select email from auth.users where id = new.owner
  );
  return new;
end $$;

drop trigger if exists artifacts_set_owner_email on public.artifacts;
drop function if exists public.set_owner_email();
create trigger artifacts_set_owner_email
  before insert or update on public.artifacts
  for each row execute function private.set_owner_email();

-- Backfill rows that pre-date this migration. Safe to re-run: the trigger
-- will produce the same value on any future writes.
update public.artifacts a
   set owner_email = u.email
  from auth.users u
 where a.owner = u.id
   and a.owner_email is distinct from u.email;
