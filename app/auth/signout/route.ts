import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { cookieDomainOptions } from "@/lib/auth-helpers";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // @supabase/ssr's signOut sets the auth cookies to empty WITHOUT Max-Age=0,
  // so the chunked sb-<ref>-auth-token.0/.1 cookies persist (empty) and corrupt
  // the next login. Force a real deletion on the domain they were set on.
  const store = await cookies();
  const { domain } = cookieDomainOptions();
  for (const { name } of store.getAll()) {
    if (name.startsWith("sb-")) {
      store.set(name, "", { domain, path: "/", maxAge: 0 });
    }
  }

  const hub =
    process.env.HUB_LOGIN_URL ?? "https://tools.suncoast.studio/login";
  return NextResponse.redirect(hub, { status: 303 });
}
