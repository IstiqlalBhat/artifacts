import Link from "next/link";
import { SquareDashedMousePointer, LogOut, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase/server";
import { Button, buttonStyles } from "@/components/ui/button";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 w-screen overflow-hidden border-b border-border bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold"
          aria-label="Artifacts home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card shadow-sm shadow-primary/5">
            <SquareDashedMousePointer className="h-4 w-4 text-accent" />
          </span>
          <span className="text-sm">Artifacts</span>
        </Link>
        {user && (
          <Link
            href="/dashboard"
            className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
            Library
          </Link>
        )}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/new"
                className={buttonStyles({
                  size: "sm",
                  className: "bg-foreground text-background hover:bg-foreground/90",
                })}
              >
                <Plus className="h-3.5 w-3.5" />
                New
              </Link>
              <span className="hidden max-w-52 truncate text-xs text-muted-foreground md:inline">
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
              <Link
                href="/login"
                className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={buttonStyles({
                  size: "sm",
                  className: "bg-foreground text-background hover:bg-foreground/90",
                })}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
