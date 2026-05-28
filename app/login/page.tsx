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

      <main className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="flex items-center py-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="mono-label mb-3 text-cobalt">Account access</p>
              <h1 className="display offset-head text-[clamp(2.25rem,6vw,3.25rem)] leading-[0.95] text-ink">
                Welcome back
              </h1>
              <p className="mt-3 text-[0.97rem] leading-relaxed text-ink-soft">
                Sign in to open your library and continue editing artifacts.
              </p>
            </div>

            {message && (
              <div className="mb-4 rounded-lg border-[1.5px] border-cobalt/40 bg-cobalt/10 px-3.5 py-2.5 text-sm text-ink">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg border-[1.5px] border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <form action={login} className="riso-card-pop p-6">
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

            <p className="mt-6 text-sm text-ink-mute">
              No account yet?{" "}
              <Link
                href="/signup"
                className="font-semibold text-cobalt hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </section>

        <aside className="hidden items-center py-12 lg:flex">
          <AuthProof
            file="workspace.html"
            tag="private"
            rows={[
              {
                icon: <Lock className="h-5 w-5" />,
                title: "Private by default",
                body: "Your drafts stay account-scoped until sharing is switched on.",
              },
              {
                icon: <Eye className="h-5 w-5" />,
                title: "Preview before publishing",
                body: "Reopen any artifact and verify the sandboxed render.",
              },
            ]}
          />
        </aside>
      </main>
    </div>
  );
}

function AuthProof({
  file,
  tag,
  rows,
}: {
  file: string;
  tag: string;
  rows: { icon: React.ReactNode; title: string; body: string }[];
}) {
  return (
    <div className="riso-card-pop relative w-full overflow-hidden p-8">
      <div className="halftone halftone-fade" aria-hidden="true" />
      <div className="relative mb-10 flex items-center justify-between">
        <span className="code-font text-sm text-ink-mute">{file}</span>
        <span className="chip">{tag}</span>
      </div>
      <div className="relative space-y-7">
        {rows.map((row) => (
          <div key={row.title} className="flex items-start gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink bg-cobalt text-paper-soft shadow-[2px_2px_0_var(--ink)]">
              {row.icon}
            </span>
            <div>
              <h2 className="display text-[1.3rem] leading-tight text-ink">
                {row.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                {row.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
