import Link from "next/link";
import { LogOut, Plus, UserRound } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { hubLoginUrl } from "@/lib/auth";
import { Button, buttonStyles } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";
import { MobileNav } from "@/components/MobileNav";

const navLink =
  "display text-[0.82rem] font-semibold text-ink-soft transition-colors hover:text-teal";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-teal/10 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5"
          aria-label="Artifacts home"
        >
          <BrandMark className="transition-transform duration-300 group-hover:-rotate-6" />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="script text-[1.35rem] text-teal">Artifacts</span>
            <span className="display mt-0.5 hidden text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-ink-mute md:block">
              Suncoast Venture Studio
            </span>
          </span>
        </Link>

        {user && (
          <nav className="ml-5 hidden items-center gap-6 sm:flex">
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
              <span className="hidden max-w-56 items-center gap-2 truncate rounded-full border border-teal/15 bg-teal-tint px-3.5 py-1.5 text-xs text-teal md:inline-flex">
                <UserRound className="h-3.5 w-3.5 shrink-0 text-teal-bright" />
                <span className="truncate">{user.email}</span>
              </span>
              <Link
                href="/new"
                className={buttonStyles({ size: "sm", className: "px-4" })}
              >
                <Plus className="h-3.5 w-3.5" />
                New
              </Link>
              <form action="/auth/signout" method="post" className="hidden sm:block">
                <Button
                  size="icon"
                  variant="ghost"
                  type="submit"
                  aria-label="Sign out"
                  className="hover:bg-rust/10 hover:text-rust"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
              <MobileNav email={user.email ?? ""} />
            </>
          ) : (
            <a
              href={hubLoginUrl("/dashboard")}
              className={buttonStyles({ size: "sm", className: "px-4" })}
            >
              Sign in
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
