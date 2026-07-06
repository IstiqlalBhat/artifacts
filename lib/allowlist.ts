import type { SupabaseClient } from "@supabase/supabase-js";

export async function isCurrentUserAllowed(
  supabase: SupabaseClient,
): Promise<boolean> {
  const { data } = await supabase.rpc("is_current_user_allowed");
  return data === true;
}
