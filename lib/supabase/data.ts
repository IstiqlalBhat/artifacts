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
