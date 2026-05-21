-- Backfill legacy descriptions so existing artifacts stay editable.
-- PR #4 raises updateArtifact's server-side validation to require a
-- description of at least 10 characters whenever the field is in the patch.
-- The editor always sends description on save, so any row with a null or
-- sub-10-char description becomes un-saveable — owners can't change files,
-- entry, or directory state until they rewrite the description.
--
-- Most affected rows pre-date PR #3 (when description was added) and have
-- description = null. A handful may have short manual values. This migration
-- fills them with a clearly-placeholder string so the row passes the gate;
-- owners can replace it on their next edit.
--
-- Idempotent: after running, every row has description >= 10 chars, so the
-- where clause matches nothing on re-run.

update public.artifacts
   set description = 'Legacy artifact — please update this description.'
 where description is null
    or char_length(description) < 10;
