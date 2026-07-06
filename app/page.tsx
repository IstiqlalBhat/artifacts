import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Code2,
  Eye,
  FileCode2,
  Lock,
  Share2,
  Upload,
  Shield,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { PreviewFrame } from "@/components/PreviewFrame";
import { hubLoginUrl } from "@/lib/auth";
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

  const files = ["index.html", "press.css", "motion.jsx"];

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "32px",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      color: "#17162a",
      background: "radial-gradient(120% 90% at 16% 10%, rgba(44,61,196,0.20), transparent 58%), radial-gradient(120% 90% at 86% 92%, rgba(255,90,31,0.22), transparent 58%), #f4efe3",
    }}>
      <section style={{
        width: "min(720px, 100%)",
        border: "1.5px solid #17162a",
        borderRadius: 14,
        overflow: "hidden",
        background: "#fbf8f0",
        boxShadow: "7px 7px 0 #17162a",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1.5px solid #17162a",
          color: "#5b556c",
          fontSize: 12,
          letterSpacing: 0.4,
        }}>
          <strong style={{ color: "#17162a", letterSpacing: 0.3 }}>Press panel</strong>
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>sandbox · live</span>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          minHeight: 290,
        }}>
          <div style={{
            padding: 18,
            borderRight: "1.5px solid #17162a",
          }}>
            {files.map((file, index) => (
              <div key={file} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 0",
                color: active === index ? "#e8480c" : "#5b556c",
                transition: "color 260ms ease",
              }}>
                <span style={{
                  width: 9,
                  height: 9,
                  borderRadius: 99,
                  background: active === index ? "#ff5a1f" : "rgba(23,22,42,0.22)",
                  border: "1.5px solid #17162a",
                  transition: "all 260ms ease",
                }} />
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13 }}>
                  {file}
                </span>
              </div>
            ))}
            <div style={{
              marginTop: 18,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 10,
              letterSpacing: 1.4,
              color: "rgba(91, 85, 108, 0.85)",
              textTransform: "uppercase",
            }}>
              entry · App.jsx
            </div>
          </div>
          <div style={{ position: "relative", padding: 24 }}>
            <div style={{
              position: "absolute",
              inset: 24,
              border: "1.5px solid #17162a",
              borderRadius: 10,
              background: "#f4efe3",
            }} />
            <div style={{
              position: "absolute",
              left: 46,
              right: 46,
              top: 66,
              height: 9,
              borderRadius: 99,
              background: "rgba(23,22,42,0.14)",
            }} />
            <div style={{
              position: "absolute",
              left: 46,
              top: 96,
              width: active === 0 ? "62%" : active === 1 ? "44%" : "78%",
              height: 9,
              borderRadius: 99,
              background: "linear-gradient(90deg, #2c3dc4, #ff5a1f)",
              transition: "width 520ms cubic-bezier(.22,1,.36,1)",
            }} />
            <div style={{
              position: "absolute",
              left: 46,
              right: 46,
              bottom: 54,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}>
              {[0, 1, 2].map((item) => (
                <div key={item} style={{
                  height: 54,
                  borderRadius: 9,
                  background: item === active ? "rgba(255,90,31,0.18)" : "#fbf8f0",
                  border: item === active ? "1.5px solid #ff5a1f" : "1.5px solid #17162a",
                  transition: "background 260ms ease, border 260ms ease",
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

  const primaryHref = user ? "/new" : hubLoginUrl("/dashboard");
  const primaryLabel = user ? "Create artifact" : "Sign in";
  // The secondary CTA only renders for signed-in users, so these have no
  // signed-out branch.
  const secondaryHref = "/dashboard";
  const secondaryLabel = "Open library";

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />

      {!configured && (
        <div className="border-b-[1.5px] border-orange/40 bg-orange/10 px-4 py-2 text-center text-xs text-orange-deep">
          Supabase is not configured yet. Copy{" "}
          <code className="code-font">.env.example</code> to{" "}
          <code className="code-font">.env.local</code> and run the SQL in{" "}
          <code className="code-font">supabase/migrations/</code>.
        </div>
      )}

      <main className="flex-1">
        {/* ───── HERO ───── */}
        <section className="riso-canvas relative isolate overflow-hidden">
          <div className="halftone halftone-fade" aria-hidden="true" />
          <div className="grain" aria-hidden="true" />

          <div className="relative z-10 mx-auto grid grid-cols-1 w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:px-10 lg:pb-32 lg:pt-24">
            <div className="min-w-0">
              <div className="animate-rise-in flex flex-wrap items-center gap-3">
                <span className="chip">
                  <Sparkles className="h-3 w-3 text-orange" aria-hidden="true" />
                  Sandbox · No.01
                </span>
                <span className="mono-label">Suncoast Venture Studio</span>
              </div>

              <h1 className="animate-rise-in motion-delay-1 display offset-head mt-6 text-balance text-[clamp(2.05rem,8.5vw,5.75rem)] leading-[0.95] text-ink">
                Drop the files.
                <br />
                Watch it run.
                <br />
                <span className="ink-underline">Send the link.</span>
              </h1>

              <p className="animate-rise-in motion-delay-2 mt-7 max-w-xl text-pretty text-[1.02rem] leading-[1.65] text-ink-soft">
                Artifacts is a focused workbench for HTML, CSS, JS, and JSX
                prototypes. Drop in files, watch them run inside a sandboxed
                iframe, and share the exact working version with a single link.
              </p>

              <div className="animate-rise-in motion-delay-3 mt-9 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
                {user ? (
                  <Link href={primaryHref} className="btn-cobalt w-full sm:w-auto">
                    {primaryLabel}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <a href={primaryHref} className="btn-cobalt w-full sm:w-auto">
                    {primaryLabel}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
                {user && (
                  <Link
                    href={secondaryHref}
                    className="btn-paper w-full sm:w-auto"
                  >
                    {secondaryLabel}
                  </Link>
                )}
              </div>

              <div className="animate-rise-in motion-delay-4 mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[0.82rem] font-medium text-ink-mute">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-cobalt" aria-hidden="true" />
                  Sandboxed iframe
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-cobalt" aria-hidden="true" />
                  Private by default
                </span>
                <span className="flex items-center gap-1.5">
                  <Share2 className="h-4 w-4 text-cobalt" aria-hidden="true" />
                  One-click public link
                </span>
              </div>
            </div>

            <div className="animate-rise-in motion-delay-2 min-w-0 lg:pl-2">
              <PreviewFrame
                label="artifact · App.jsx"
                live
                className="animate-float-slow"
                screenClassName="aspect-[4/3]"
              >
                <ArtifactRenderer doc={DEMO_DOC} title="Live JSX demo" />
              </PreviewFrame>
            </div>
          </div>
        </section>

        {/* ───── CAPABILITIES ───── */}
        <section className="riso-canvas relative isolate overflow-hidden border-t-[1.5px] border-ink/15">
          <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="mono-label">Capabilities / 01</p>
                <h2 className="display mt-3 text-balance text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] text-ink">
                  A tiny IDE.{" "}
                  <span className="text-cobalt">Real outputs.</span> Share-ready.
                </h2>
              </div>
              <p className="max-w-sm text-[0.97rem] leading-[1.6] text-ink-soft">
                Four pieces that turn a folder of loose files into a working,
                shareable prototype.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Capability
                eyebrow="01"
                icon={<Upload className="h-4 w-4" aria-hidden="true" />}
                title="Bring real files"
                body="Drag in HTML, CSS, JS, JSX, or TSX — multiple files per artifact, keep your structure intact."
                visual={<FileTreeVisual />}
              />
              <Capability
                eyebrow="02"
                icon={<Eye className="h-4 w-4" aria-hidden="true" />}
                title="Sandboxed preview"
                body="The iframe refreshes as you work, with Babel-standalone transforming JSX at runtime."
                visual={<PreviewWaveVisual />}
              />
              <Capability
                eyebrow="03"
                icon={<Lock className="h-4 w-4" aria-hidden="true" />}
                title="Private by default"
                body="Row-level security means each artifact belongs to your account until you flip sharing on."
                visual={<LockVisual />}
              />
              <Capability
                eyebrow="04"
                icon={<Share2 className="h-4 w-4" aria-hidden="true" />}
                title="One public link"
                body="Toggle sharing and copy a clean URL. Edit or unshare — caches invalidate immediately."
                visual={<LinkVisual />}
              />
            </div>
          </div>
        </section>

        {/* ───── HOW IT WORKS ───── */}
        <section className="riso-canvas-deep relative isolate overflow-hidden border-t-[1.5px] border-ink/15">
          <div className="grain" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
            <div className="mb-14 max-w-2xl">
              <p className="mono-label">Workflow / 02</p>
              <h2 className="display mt-3 text-balance text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] text-ink">
                From loose files{" "}
                <span className="text-cobalt">to a shareable prototype.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Step
                n="01"
                title="Upload or paste"
                body="Drop your files, or paste raw code. Set an entry file when needed; everything else is referenced relatively."
                hint="HTML · CSS · JS · JSX · TSX"
              />
              <Step
                n="02"
                title="Render in the sandbox"
                body={
                  <>
                    The server bundles your files into one HTML document piped
                    into an iframe via{" "}
                    <code className="code-font text-ink">srcDoc</code>. The
                    sandbox attribute blocks the iframe from reaching the parent
                    app.
                  </>
                }
                hint='sandbox="allow-scripts allow-forms allow-popups"'
              />
              <Step
                n="03"
                title="Send the link"
                body="Toggle the share switch on, copy the public URL, send it to anyone. They get the running version — no sign-in required."
                hint="public/<shareId>"
              />
            </div>
          </div>
        </section>

        {/* ───── TRUST / SANDBOX DETAIL ───── */}
        <section className="riso-canvas relative isolate overflow-hidden border-t-[1.5px] border-ink/15">
          <div className="relative z-10 mx-auto grid grid-cols-1 max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 lg:px-10 lg:py-28">
            <div>
              <p className="mono-label">Trust / 03</p>
              <h2 className="display mt-3 text-balance text-[clamp(1.85rem,4vw,2.9rem)] leading-[1.04] text-ink">
                Code you don&apos;t own runs inside an{" "}
                <span className="text-cobalt">iron box.</span>
              </h2>
              <p className="mt-5 max-w-lg text-[1rem] leading-[1.65] text-ink-soft">
                Every artifact renders inside a sandboxed iframe with explicit
                permissions. It cannot reach the parent page, your cookies, or
                your storage. Share pages cache for one hour and invalidate the
                instant you edit or unshare.
              </p>

              <ul className="mt-8 space-y-3 text-[0.95rem] text-ink-soft">
                {[
                  "Account-scoped storage via Postgres row-level security.",
                  "Sharing is a deliberate toggle — nothing is public by default.",
                  "Cache invalidates immediately on edit or unshare.",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <span
                      className="mt-[7px] inline-block h-2 w-2 shrink-0 rounded-full border-[1.5px] border-ink bg-orange"
                      aria-hidden="true"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="riso-card-pop p-5 sm:p-7">
              <div className="mono-label mb-4">renderer.ts · iframe sandbox</div>
              <pre className="code-font overflow-x-auto rounded-lg border-[1.5px] border-ink bg-ink p-4 text-[0.78rem] leading-[1.75] text-paper sm:text-[0.82rem]">
                <span className="text-cobalt-soft">{`<iframe`}</span>
                {`
  srcDoc={document}
  `}
                <span className="text-orange">{`sandbox`}</span>
                {`="allow-scripts
           allow-forms
           allow-popups
           allow-modals"
  referrerPolicy="no-referrer"
  loading="lazy"
`}
                <span className="text-cobalt-soft">{`/>`}</span>
              </pre>
              <div className="hairline-div my-5" aria-hidden="true" />
              <div className="grid grid-cols-2 gap-4 text-[0.82rem]">
                <Stat label="Sandboxed" value="iframe" />
                <Stat label="Private" value="default" />
                <Stat label="Share cache" value="1h" />
                <Stat label="Invalidation" value="instant" />
              </div>
            </div>
          </div>
        </section>

        {/* ───── CLOSING CTA ───── */}
        <section className="relative isolate overflow-hidden border-t-[1.5px] border-ink bg-cobalt">
          <div
            className="absolute inset-0 opacity-25 mix-blend-screen [background-image:radial-gradient(var(--orange)_22%,transparent_23%)] [background-size:13px_13px]"
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto max-w-5xl px-5 py-28 text-center sm:px-8 sm:py-36 lg:py-44">
            <p className="mono-label text-paper/70">Build / 04</p>
            <h2 className="display offset-head-cobalt mx-auto mt-4 max-w-3xl text-balance text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.0] text-paper-soft">
              Ship the next prototype in one tab.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[1.02rem] leading-[1.65] text-paper/85">
              Create an artifact, verify it inside the sandbox, share the exact
              running version. No deploy step. No build pipeline.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                <Link href={primaryHref} className="btn-orange w-full sm:w-auto">
                  Create artifact
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <a href={primaryHref} className="btn-orange w-full sm:w-auto">
                  Sign in
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="riso-canvas relative isolate overflow-hidden border-t-[1.5px] border-ink/15">
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="mono-label text-ink">Artifacts</span>
            <span className="hairline-div w-12" aria-hidden="true" />
            <span className="text-[0.8rem] text-ink-mute">
              Sandboxed rendering · account-scoped storage
            </span>
          </div>
          <span className="text-[0.8rem] text-ink-mute">
            Built by Suncoast Venture Studio
          </span>
        </div>
      </footer>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Component pieces
   ──────────────────────────────────────────────────────────── */

function Capability({
  eyebrow,
  icon,
  title,
  body,
  visual,
}: {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  body: string;
  visual: ReactNode;
}) {
  return (
    <article className="riso-card-pop flex h-full flex-col p-5 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-ink bg-cobalt text-paper-soft shadow-[2px_2px_0_var(--ink)]">
          {icon}
        </div>
        <span className="mono-label text-cobalt">{eyebrow}</span>
      </div>

      <div
        className="relative mb-6 h-24 overflow-hidden rounded-lg border-[1.5px] border-ink/30 bg-paper"
        aria-hidden="true"
      >
        {visual}
      </div>

      <h3 className="display text-[1.4rem] leading-[1.08] text-ink">{title}</h3>
      <p className="mt-3 text-[0.9rem] leading-[1.6] text-ink-soft">{body}</p>
    </article>
  );
}

function Step({
  n,
  title,
  body,
  hint,
}: {
  n: string;
  title: string;
  body: ReactNode;
  hint: string;
}) {
  return (
    <article className="riso-card-pop flex h-full flex-col p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <span className="step-badge">{n}</span>
        <span className="hairline-div w-10" aria-hidden="true" />
      </div>
      <h3 className="display text-[clamp(1.35rem,2.5vw,1.85rem)] leading-[1.06] text-ink">
        {title}
      </h3>
      <p className="mt-4 flex-1 text-[0.93rem] leading-[1.65] text-ink-soft">
        {body}
      </p>
      <div className="code-font mt-6 truncate rounded-md border-[1.5px] border-ink/25 bg-paper px-3 py-2 text-[0.72rem] text-ink-mute">
        {hint}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono-label">{label}</div>
      <div className="display mt-1 text-[1.4rem] leading-none text-ink">
        {value}
      </div>
    </div>
  );
}

/* ── Micro-visuals for capability tiles ── */

function FileTreeVisual() {
  return (
    <div className="absolute inset-0 flex items-center px-4">
      <div className="code-font w-full space-y-1.5 text-[0.7rem] text-ink-mute">
        {[
          { name: "index.html", on: true },
          { name: "press.css", on: false },
          { name: "app.jsx", on: false },
          { name: "data.json", on: false },
        ].map((f) => (
          <div key={f.name} className="flex items-center gap-2">
            <FileCode2
              className={`h-3 w-3 ${f.on ? "text-orange" : "text-ink-mute/55"}`}
            />
            <span className={f.on ? "text-ink" : "text-ink-mute"}>
              {f.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewWaveVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-3 top-3 flex h-5 items-center gap-1 rounded-md border-[1.5px] border-ink/40 bg-paper-soft px-2">
        <span className="h-1.5 w-1.5 rounded-full border border-ink bg-orange" />
        <span className="h-1.5 w-1.5 rounded-full border border-ink bg-cobalt" />
        <span className="h-1.5 w-1.5 rounded-full border border-ink bg-paper" />
      </div>
      <div className="absolute inset-x-3 bottom-3 top-11 rounded-md border-[1.5px] border-ink/20 bg-gradient-to-br from-cobalt/15 via-orange/15 to-transparent">
        <div className="absolute inset-x-2 top-2 h-1.5 rounded-full bg-ink/15" />
        <div className="absolute inset-x-2 top-5 h-1.5 w-2/3 rounded-full bg-cobalt/60" />
        <div className="absolute bottom-2 left-2 right-2 grid grid-cols-3 gap-1.5">
          <span className="h-3 rounded bg-ink/10" />
          <span className="h-3 rounded bg-orange/45" />
          <span className="h-3 rounded bg-ink/10" />
        </div>
      </div>
    </div>
  );
}

function LockVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-br from-cobalt/25 via-transparent to-transparent blur-xl" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-ink bg-paper-soft shadow-[2px_2px_0_var(--ink)]">
          <Lock className="h-5 w-5 text-cobalt" />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-1.5">
        <span className="h-1.5 rounded-full bg-ink/15" />
        <span className="h-1.5 rounded-full bg-ink/15" />
        <span className="h-1.5 rounded-full bg-ink/15" />
      </div>
    </div>
  );
}

function LinkVisual() {
  return (
    <div className="absolute inset-0 flex items-center px-4">
      <div className="w-full rounded-md border-[1.5px] border-ink/40 bg-paper-soft p-2.5">
        <div className="mono-label mb-1.5 text-[0.55rem]">public url</div>
        <div className="flex items-center gap-2 truncate">
          <Code2 className="h-3 w-3 shrink-0 text-orange" />
          <span className="code-font truncate text-[0.72rem] text-ink">
            /s/3k2j-press-9
          </span>
          <ArrowUpRight className="ml-auto h-3 w-3 shrink-0 text-ink-mute" />
        </div>
      </div>
    </div>
  );
}
