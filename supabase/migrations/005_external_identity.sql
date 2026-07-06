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
