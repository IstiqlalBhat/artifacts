import Link from "next/link";
import {
  ArrowRight,
  FileCode2,
  Share2,
  SquareDashedMousePointer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "../login/actions";

type SearchParams = Promise<{ error?: string }>;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { error } = await searchParams;

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
                Create workspace
              </p>
              <h1 className="text-3xl font-semibold">Start your library</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Save live prototypes, keep drafts private, and share finished
                renders with a single link.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <form
              action={signup}
              className="rounded-lg border border-border bg-card p-5 shadow-xl shadow-primary/5"
            >
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
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use at least 8 characters.
                  </p>
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <aside className="hidden items-center py-12 lg:flex">
          <div className="paper-card-deep w-full overflow-hidden p-8">
            <div className="mb-10 flex items-center justify-between text-sm">
              <span className="code-font text-muted-foreground">new-artifact.jsx</span>
              <span className="mono-label">ready</span>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <FileCode2 className="mt-1 h-5 w-5 text-accent" />
                <div>
                  <h2 className="serif-display text-[1.35rem] leading-tight">
                    Upload or paste code
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    Start with a single file or keep a small project together.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Share2 className="mt-1 h-5 w-5 text-accent" />
                <div>
                  <h2 className="serif-display text-[1.35rem] leading-tight">
                    Share when it is ready
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    Public links open straight into the rendered artifact.
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
