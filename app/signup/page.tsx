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
    <div className="min-h-screen bg-paper">
      <header className="border-b-[1.5px] border-ink/15 bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-ink bg-cobalt text-paper-soft shadow-[2px_2px_0_var(--ink)] transition-transform group-hover:-translate-y-0.5">
              <SquareDashedMousePointer className="h-4 w-4" />
            </span>
            <span className="display text-[1.15rem] text-ink">Artifacts</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto grid grid-cols-1 min-h-[calc(100svh-4rem)] max-w-7xl px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="flex items-center py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="mono-label mb-3 text-cobalt">Create workspace</p>
              <h1 className="display offset-head text-[clamp(2.25rem,6vw,3.25rem)] leading-[0.95] text-ink">
                Start your library
              </h1>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-ink-soft">
                Save live prototypes, keep drafts private, and share finished
                renders with a single link.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border-[1.5px] border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <form action={signup} className="riso-card-pop p-6">
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
                  <p className="text-xs text-ink-mute">
                    Use at least 8 characters.
                  </p>
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <p className="mt-6 text-sm text-ink-mute">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-cobalt hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <aside className="hidden items-center py-12 lg:flex">
          <div className="riso-card-pop relative w-full overflow-hidden p-8">
            <div className="halftone halftone-fade" aria-hidden="true" />
            <div className="relative mb-10 flex items-center justify-between">
              <span className="code-font text-sm text-ink-mute">
                new-artifact.jsx
              </span>
              <span className="chip">ready</span>
            </div>
            <div className="relative space-y-7">
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink bg-cobalt text-paper-soft shadow-[2px_2px_0_var(--ink)]">
                  <FileCode2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="display text-[1.3rem] leading-tight text-ink">
                    Upload or paste code
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    Start with a single file or keep a small project together.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink bg-orange text-ink shadow-[2px_2px_0_var(--ink)]">
                  <Share2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="display text-[1.3rem] leading-tight text-ink">
                    Share when it&apos;s ready
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
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
