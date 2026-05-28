import Link from "next/link";
import { ArrowRight, Eye, Lock, SquareDashedMousePointer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

type SearchParams = Promise<{
  redirect?: string;
  error?: string;
  message?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { redirect, error, message } = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card">
              <SquareDashedMousePointer className="h-4 w-4 text-accent" />
            </span>
            Artifacts
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="flex items-center py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-accent">
                Account access
              </p>
              <h1 className="text-3xl font-semibold">Welcome back</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to open your library and continue editing artifacts.
              </p>
            </div>

            {message && (
              <div className="mb-4 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <form
              action={login}
              className="rounded-lg border border-border bg-card p-5 shadow-xl shadow-primary/5"
            >
              {redirect && (
                <input type="hidden" name="redirect" value={redirect} />
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
              No account yet?{" "}
              <Link href="/signup" className="font-medium text-accent hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </section>

        <aside className="hidden items-center py-12 lg:flex">
          <div className="paper-card-deep w-full overflow-hidden p-8">
            <div className="mb-10 flex items-center justify-between text-sm">
              <span className="code-font text-muted-foreground">workspace.html</span>
              <span className="mono-label">private</span>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Lock className="mt-1 h-5 w-5 text-accent" />
                <div>
                  <h2 className="serif-display text-[1.35rem] leading-tight">
                    Private by default
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    Your drafts stay account-scoped until sharing is switched on.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="mt-1 h-5 w-5 text-accent" />
                <div>
                  <h2 className="serif-display text-[1.35rem] leading-tight">
                    Preview before publishing
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    Reopen any artifact and verify the sandboxed render.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
