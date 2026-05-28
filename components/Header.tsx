import Link from "next/link";
import { SquareDashedMousePointer, LogOut, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { Button, buttonStyles } from "@/components/ui/button";

const navLink =
  "code-font text-[0.7rem] uppercase tracking-[0.15em] text-ink-mute transition-colors hover:text-cobalt";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 w-full border-b-[1.5px] border-ink/15 bg-paper/85 backdrop-blur-xl supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5"
          aria-label="Artifacts home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-ink bg-cobalt text-paper-soft shadow-[2px_2px_0_var(--ink)] transition-transform group-hover:-translate-y-0.5">
            <SquareDashedMousePointer className="h-4 w-4" />
          </span>
          <span className="display text-[1.15rem] text-ink">Artifacts</span>
        </Link>

        {user && (
          <nav className="ml-3 hidden items-center gap-5 sm:flex">
            <Link href="/dashboard" className={navLink}>
              My Library
            </Link>
            <Link href="/directory" className={navLink}>
              SVS Directory
            </Link>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2.5">
          {user ? (
            <>
              <Link href="/new" className={buttonStyles({ size: "sm" })}>
                <Plus className="h-3.5 w-3.5" />
                New
              </Link>
              <span className="hidden max-w-52 truncate code-font text-xs text-ink-mute md:inline">
                {user.email}
              </span>
              <form action="/auth/logout" method="post">
                <Button
                  size="icon"
                  variant="ghost"
                  type="submit"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={`hidden sm:inline ${navLink}`}>
                Sign in
              </Link>
              <Link href="/signup" className={buttonStyles({ size: "sm" })}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
