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
        ('istiqlal1234@gmail.com', '738122a5-3810-4a36-bf61-e3ede9f3ce3a', 'istiqlal@suncoast.studio'),
        ('sean@suncoast.studio',   '9095e55f-4012-4466-909e-61cb8e317016', 'sean@suncoast.studio'),
        ('travis@suncoast.studio', 'ece8182d-47e1-4075-8e81-583fd159442c', 'travis@suncoast.studio')
     ) as v(old_email, new_owner, new_email)
where old_u.email = v.old_email
  and a.owner = old_u.id;

-- Sanity: 14 artifacts total; owners now the three identity ids; no nulls.
select owner, owner_email, count(*) from public.artifacts
group by owner, owner_email order by count(*) desc;

commit;
