import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Eye,
  FileCode2,
  Globe,
  Lock,
  Share2,
  Upload,
} from "lucide-react";
import { Header } from "@/components/Header";
import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser, isConfigured } from "@/lib/supabase/server";
import { ArtifactRenderer } from "@/components/ArtifactRenderer";
import { buildArtifactDocument } from "@/lib/renderer";

const DEMO_DOC = buildArtifactDocument({
  kind: "jsx",
  files: [
    {
      name: "App.jsx",
      type: "text/jsx",
      content: `
function App() {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setActive((value) => (value + 1) % 3), 1100);
    return () => clearInterval(id);
  }, []);

  const files = ["index.html", "stage.css", "motion.jsx"];

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "32px",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      color: "#edfdfb",
      background: "linear-gradient(135deg, #071016 0%, #12202a 52%, #15443e 100%)",
    }}>
      <section style={{
        width: "min(720px, 100%)",
        border: "1px solid rgba(150, 255, 234, 0.24)",
        borderRadius: 18,
        overflow: "hidden",
        background: "rgba(4, 13, 18, 0.74)",
        boxShadow: "0 28px 80px rgba(0, 0, 0, 0.34)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 15px",
          borderBottom: "1px solid rgba(150, 255, 234, 0.14)",
          color: "rgba(237, 253, 251, 0.76)",
          fontSize: 12,
        }}>
          <strong style={{ color: "#ffffff" }}>Launch panel</strong>
          <span>sandbox live</span>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          minHeight: 300,
        }}>
          <div style={{
            padding: 18,
            borderRight: "1px solid rgba(150, 255, 234, 0.14)",
          }}>
            {files.map((file, index) => (
              <div key={file} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 0",
                color: active === index ? "#83f3df" : "rgba(237, 253, 251, 0.58)",
                transition: "color 260ms ease",
              }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: active === index ? "#83f3df" : "rgba(237, 253, 251, 0.25)",
                  boxShadow: active === index ? "0 0 20px rgba(131, 243, 223, 0.65)" : "none",
                  transition: "all 260ms ease",
                }} />
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13 }}>
                  {file}
                </span>
              </div>
            ))}
          </div>
          <div style={{ position: "relative", padding: 24 }}>
            <div style={{
              position: "absolute",
              inset: 24,
              border: "1px solid rgba(255, 255, 255, 0.13)",
              borderRadius: 14,
              background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
            }} />
            <div style={{
              position: "absolute",
              left: 46,
              right: 46,
              top: 70,
              height: 10,
              borderRadius: 99,
              background: "rgba(255,255,255,0.14)",
            }} />
            <div style={{
              position: "absolute",
              left: 46,
              top: 106,
              width: active === 0 ? "62%" : active === 1 ? "44%" : "78%",
              height: 10,
              borderRadius: 99,
              background: "#83f3df",
              transition: "width 420ms cubic-bezier(.22,1,.36,1)",
              boxShadow: "0 0 28px rgba(131, 243, 223, 0.45)",
            }} />
            <div style={{
              position: "absolute",
              left: 46,
              right: 46,
              bottom: 56,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}>
              {[0, 1, 2].map((item) => (
                <div key={item} style={{
                  height: 58,
                  borderRadius: 12,
                  background: item === active ? "rgba(131, 243, 223, 0.24)" : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  transition: "background 260ms ease",
                }} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}`,
    },
  ],
  entry: "App.jsx",
});

export default async function Home() {
  const user = await getCurrentUser();
  const configured = isConfigured();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {!configured && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-900 dark:text-amber-100">
          Supabase is not configured yet. Copy{" "}
          <code className="code-font">.env.example</code> to{" "}
          <code className="code-font">.env.local</code> and run the SQL in{" "}
          <code className="code-font">supabase/migrations/</code>.
        </div>
      )}

      <main className="flex-1">
        <section className="hero-surface relative isolate overflow-hidden text-white">
          <div className="absolute inset-0 bg-grid opacity-15" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
          <div className="relative mx-auto grid min-h-[calc(100svh-7rem)] w-full min-w-0 max-w-7xl items-center gap-10 overflow-hidden px-4 py-14 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:py-16">
            <div className="min-w-0 max-w-xs sm:max-w-xl">
              <p className="animate-rise-in text-sm font-medium text-teal-100/80">
                Upload code. Render it safely. Send the link.
              </p>
              <h1 className="animate-rise-in motion-delay-1 mt-4 text-balance text-6xl font-semibold leading-[0.92] sm:text-7xl lg:text-8xl">
                Artifacts
              </h1>
              <p className="animate-rise-in motion-delay-2 mt-6 max-w-lg text-balance text-base leading-7 text-white/70 sm:text-lg">
                A focused workbench for HTML, CSS, JS, and JSX prototypes.
                Keep drafts private, preview them live, and publish a clean
                public view when they are ready.
              </p>
              <div className="animate-rise-in motion-delay-3 mt-8 flex flex-wrap gap-3">
                {user ? (
                  <>
                    <Link
                      href="/new"
                      className={buttonStyles({
                        size: "lg",
                        className: "bg-white text-neutral-950 hover:bg-white/90",
                      })}
                    >
                      Create artifact
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/dashboard"
                      className={buttonStyles({
                        size: "lg",
                        variant: "outline",
                        className:
                          "border-white/25 text-white hover:bg-white/10",
                      })}
                    >
                      Open library
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className={buttonStyles({
                        size: "lg",
                        className: "bg-white text-neutral-950 hover:bg-white/90",
                      })}
                    >
                      Start free
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className={buttonStyles({
                        size: "lg",
                        variant: "outline",
                        className:
                          "border-white/25 text-white hover:bg-white/10",
                      })}
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="w-full min-w-0 max-w-xs animate-rise-in motion-delay-2 sm:max-w-none">
              <div className="preview-scan pulse-border w-full max-w-full overflow-hidden rounded-lg border border-white/20 bg-neutral-950 shadow-2xl shadow-black/40">
                <div className="flex h-10 items-center justify-between border-b border-white/10 bg-white/10 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-300/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-teal-300/80" />
                  </div>
                  <span className="code-font text-[11px] text-white/60">
                    artifact.jsx
                  </span>
                </div>
                <div className="aspect-[4/3] bg-white">
                  <ArtifactRenderer doc={DEMO_DOC} title="Live JSX demo" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="mb-3 text-sm font-medium text-accent">
                Workflow
              </p>
              <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
                From loose files to a shareable prototype.
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Feature
                icon={<Upload className="h-5 w-5" />}
                title="Bring real files"
                body="Drop in HTML, CSS, JS, JSX, or TSX and keep multi-file projects together."
              />
              <Feature
                icon={<Eye className="h-5 w-5" />}
                title="Preview continuously"
                body="The sandboxed iframe refreshes as you work without exposing the parent app."
              />
              <Feature
                icon={<Lock className="h-5 w-5" />}
                title="Stay private"
                body="Artifacts belong to your account until you explicitly switch sharing on."
              />
              <Feature
                icon={<Share2 className="h-5 w-5" />}
                title="Publish one link"
                body="Copy a public URL for review, handoff, or quick demos with no recipient login."
              />
            </div>
          </div>
        </section>

        <section className="bg-muted/50">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="self-center">
              <p className="mb-3 text-sm font-medium text-accent">
                Workspace
              </p>
              <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
                Built like a small IDE, not a paste bin.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                File selection, entry control, code editing, preview, and share
                state stay in the same working surface so a prototype can move
                from sketch to review without ceremony.
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xl shadow-primary/5">
              <div className="grid grid-cols-[13rem_1fr] border-b border-border text-sm">
                <div className="border-r border-border bg-muted/50 p-4">
                  <div className="mb-4 flex items-center gap-2 font-medium">
                    <FileCode2 className="h-4 w-4 text-accent" />
                    Files
                  </div>
                  {["index.html", "style.css", "app.jsx"].map((file, index) => (
                    <div
                      key={file}
                      className="flex items-center justify-between border-t border-border py-3 text-xs"
                    >
                      <span className="code-font text-muted-foreground">
                        {file}
                      </span>
                      {index === 2 && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-background p-4">
                  <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Code2 className="h-4 w-4" />
                    Editor and preview share one canvas
                  </div>
                  <div className="space-y-2 code-font text-xs">
                    <div className="h-2 w-5/6 rounded-full bg-muted" />
                    <div className="h-2 w-3/4 rounded-full bg-muted" />
                    <div className="h-2 w-2/3 rounded-full bg-accent/60" />
                    <div className="h-2 w-4/5 rounded-full bg-muted" />
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <div className="h-16 rounded-md border border-border bg-card" />
                      <div className="h-16 rounded-md border border-accent/40 bg-accent/10" />
                      <div className="h-16 rounded-md border border-border bg-card" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4 text-accent" />
                  Public sharing is a deliberate toggle.
                </span>
                <span className="code-font text-xs text-muted-foreground">
                  sandbox=&quot;allow-scripts ...&quot;
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">
                Ship the next prototype in one tab.
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Create an artifact, verify it in the sandbox, then share the
                exact running version.
              </p>
            </div>
            <Link
              href={user ? "/new" : "/signup"}
              className={buttonStyles({ size: "lg" })}
            >
              {user ? "New artifact" : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>Artifacts</span>
          <span>Sandboxed rendering with account-scoped storage.</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="border-t border-border pt-5">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-accent shadow-sm shadow-primary/5">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
