import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cookieDomainOptions } from "@/lib/auth-helpers";

export function isConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Cookie-scoped client for the shared IDENTITY project (hub SSO). Auth only —
// all artifact data lives in this app's own project, reached via supabaseData().
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon",
    {
      cookieOptions: cookieDomainOptions(),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — proxy handles refresh.
          }
        },
      },
    },
  );
}

export async function getCurrentUser() {
  if (!isConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  } catch {
    return null;
  }
}
