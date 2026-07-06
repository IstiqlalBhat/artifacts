import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAllowed } from "@/lib/allowlist";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
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
