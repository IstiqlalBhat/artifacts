-- Auto-share artifacts that are in the SVS Directory.
-- Going forward, server actions generate a share_token whenever in_directory
-- flips to true. This migration backfills the legacy rows that pre-date that
-- behavior: anything already in the directory but still private gets a
-- 12-char hex token. Idempotent — re-running matches zero rows.
--
-- pgcrypto is already enabled by 001_artifacts.sql.

update public.artifacts
   set share_token = encode(gen_random_bytes(6), 'hex')
 where in_directory = true
   and share_token is null;
