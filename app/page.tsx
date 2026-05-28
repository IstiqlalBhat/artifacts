import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Code2,
  Eye,
  FileCode2,
  Lock,
  Share2,
  Upload,
  Sparkles,
  Shield,
} from "lucide-react";
import { Header } from "@/components/Header";
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
      color: "#2A1F18",
      background: "radial-gradient(120% 90% at 18% 12%, rgba(216,155,94,0.35), transparent 60%), radial-gradient(120% 90% at 82% 90%, rgba(184,95,62,0.25), transparent 60%), linear-gradient(135deg, #FAF4E5 0%, #F4ECDD 55%, #ECE0C8 100%)",
    }}>
      <section style={{
        width: "min(720px, 100%)",
        border: "1px solid #D9C9A9",
        borderRadius: 18,
        overflow: "hidden",
        background: "rgba(250, 244, 229, 0.85)",
        boxShadow: "0 28px 90px rgba(82, 56, 30, 0.25)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderBottom: "1px solid #D9C9A9",
          color: "#6B5747",
          fontSize: 12,
          letterSpacing: 0.4,
        }}>
          <strong style={{ color: "#2A1F18", letterSpacing: 0.3 }}>Launch panel</strong>
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>sandbox · live</span>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          minHeight: 290,
        }}>
          <div style={{
            padding: 18,
            borderRight: "1px solid #D9C9A9",
          }}>
            {files.map((file, index) => (
              <div key={file} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 0",
                color: active === index ? "#823A22" : "#6B5747",
                transition: "color 260ms ease",
              }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: active === index ? "#B85F3E" : "rgba(107, 87, 71, 0.3)",
                  boxShadow: active === index ? "0 0 18px rgba(184, 95, 62, 0.5)" : "none",
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
              color: "rgba(107, 87, 71, 0.7)",
              textTransform: "uppercase",
            }}>
              entry · App.jsx
            </div>
          </div>
          <div style={{ position: "relative", padding: 24 }}>
            <div style={{
              position: "absolute",
              inset: 24,
              border: "1px solid #D9C9A9",
              borderRadius: 14,
              background: "linear-gradient(180deg, #FAF4E5, #F4ECDD)",
            }} />
            <div style={{
              position: "absolute",
              left: 46,
              right: 46,
              top: 66,
              height: 8,
              borderRadius: 99,
              background: "rgba(107, 87, 71, 0.18)",
            }} />
            <div style={{
              position: "absolute",
              left: 46,
              top: 98,
              width: active === 0 ? "62%" : active === 1 ? "44%" : "78%",
              height: 8,
              borderRadius: 99,
              background: "linear-gradient(90deg, #B85F3E, #D89B5E)",
              transition: "width 520ms cubic-bezier(.22,1,.36,1)",
              boxShadow: "0 0 22px rgba(184, 95, 62, 0.4)",
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
                  borderRadius: 12,
                  background: item === active ? "rgba(184, 95, 62, 0.22)" : "rgba(250, 244, 229, 0.6)",
                  border: item === active ? "1px solid rgba(184, 95, 62, 0.4)" : "1px solid #D9C9A9",
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

  const primaryHref = user ? "/new" : "/signup";
  const primaryLabel = user ? "Create artifact" : "Start free";
  const secondaryHref = user ? "/dashboard" : "/login";
  const secondaryLabel = user ? "Open library" : "Sign in";

  return (
    <div className="sunlit-page flex min-h-screen flex-col">
      <Header />

      {!configured && (
        <div className="border-b border-[var(--terra)]/30 bg-[var(--terra)]/10 px-4 py-2 text-center text-xs text-[var(--terra-deep)]">
          Supabase is not configured yet. Copy{" "}
          <code className="code-font">.env.example</code> to{" "}
          <code className="code-font">.env.local</code> and run the SQL in{" "}
          <code className="code-font">supabase/migrations/</code>.
        </div>
      )}

      <main className="flex-1">
        {/* ───── HERO ───── */}
        <section className="sunlit-canvas relative isolate overflow-hidden">
          <div className="paper-grid" aria-hidden="true" />
          <div className="paper-grain" aria-hidden="true" />

          <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10 lg:px-10 lg:pb-32 lg:pt-24">
            <div className="min-w-0">
              <div className="animate-rise-in mono-label flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-[var(--terra)]/60" aria-hidden="true" />
                Workbench · No. 01 · Suncoast Venture Studio
              </div>

              <h1 className="animate-rise-in motion-delay-1 serif-display mt-5 text-balance text-[clamp(2.6rem,9vw,6.25rem)] leading-[0.95] text-[var(--ink)] sm:leading-[0.92]">
                Code, <span className="italic terra-text">but warm.</span>
                <br className="hidden sm:block" />{" "}
                Send the running thing.
              </h1>

              <p className="animate-rise-in motion-delay-2 mt-7 max-w-xl text-balance text-[clamp(1rem,1.15vw,1.075rem)] leading-[1.6] text-[var(--ink-soft)]">
                Artifacts is a focused workbench for HTML, CSS, JS, and JSX
                prototypes. Drop in files, watch them run inside a sandboxed
                iframe, and share the exact working version with a single link.
              </p>

              <div className="animate-rise-in motion-delay-3 mt-9 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={primaryHref} className="btn-terra w-full sm:w-auto">
                  {primaryLabel}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href={secondaryHref} className="btn-paper w-full sm:w-auto">
                  {secondaryLabel}
                </Link>
              </div>

              <div className="animate-rise-in motion-delay-4 mt-10 hidden flex-wrap gap-x-6 gap-y-2 text-[0.78rem] text-[var(--ink-mute)] sm:flex">
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-[var(--terra)]" aria-hidden="true" />
                  Sandboxed iframe
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-[var(--terra)]" aria-hidden="true" />
                  Private by default
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--terra)]" aria-hidden="true" />
                  One-click public link
                </span>
              </div>
            </div>

            <div className="animate-rise-in motion-delay-2 min-w-0 lg:pl-2">
              <div className="preview-frame animate-float-slow">
                <div className="preview-scan" aria-hidden="true" />
                <div className="flex h-11 items-center justify-between border-b border-[var(--hairline)] bg-[var(--paper-deep)]/40 px-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D67563]" aria-hidden="true" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#E2B47A]" aria-hidden="true" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#9DA56C]" aria-hidden="true" />
                  </div>
                  <span className="code-font text-[0.72rem] text-[var(--ink-mute)]">
                    artifact · App.jsx
                  </span>
                  <span className="mono-label text-[0.62rem] text-[var(--terra)]">
                    live
                  </span>
                </div>
                <div className="aspect-[4/3] bg-[var(--paper-soft)]">
                  <ArtifactRenderer doc={DEMO_DOC} title="Live JSX demo" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───── CAPABILITIES BENTO ───── */}
        <section className="sunlit-canvas-soft relative isolate overflow-hidden border-t border-[var(--hairline)]">
          <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="mono-label">Capabilities · 01</p>
                <h2 className="serif-display mt-3 text-balance text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.04] text-[var(--ink)]">
                  A tiny IDE.{" "}
                  <span className="italic text-[var(--terra-deep)]">Real outputs.</span>{" "}
                  Share-ready.
                </h2>
              </div>
              <p className="max-w-sm text-[0.95rem] leading-[1.6] text-[var(--ink-soft)]">
                Four pieces that turn a folder of loose files into a working,
                shareable prototype.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                body="The iframe refreshes as you work, with Babel-standalone in the iframe transforming JSX at runtime."
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

        {/* ───── HOW IT WORKS (3 steps) ───── */}
        <section className="sunlit-canvas-deep relative isolate overflow-hidden border-t border-[var(--hairline)]">
          <div className="paper-grain" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
            <div className="mb-14 max-w-2xl">
              <p className="mono-label">Workflow · 02</p>
              <h2 className="serif-display mt-3 text-balance text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.04] text-[var(--ink)]">
                From loose files{" "}
                <span className="italic text-[var(--terra-deep)]">
                  to a shareable prototype.
                </span>
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <Step
                n="01"
                title="Upload or paste"
                body="Drop your files, or paste raw code. Set an entry file when needed; everything else is referenced relatively."
                hint="HTML · CSS · JS · JSX · TSX"
              />
              <Step
                n="02"
                title="Render inside the sandbox"
                body={
                  <>
                    The server bundles your files into an HTML document piped into an iframe via{" "}
                    <code className="code-font text-[var(--ink)]">srcDoc</code>. The sandbox
                    attribute blocks the iframe from reaching the parent app.
                  </>
                }
                hint='sandbox="allow-scripts allow-forms allow-popups allow-modals"'
              />
              <Step
                n="03"
                title="Send the link"
                body="Toggle the share switch on, copy the public URL, send it to anyone. They get the running version — no login required."
                hint="public/<shareId>"
              />
            </div>
          </div>
        </section>

        {/* ───── TRUST STRIP / SANDBOX DETAIL ───── */}
        <section className="sunlit-canvas-soft relative isolate overflow-hidden border-t border-[var(--hairline)]">
          <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 lg:px-10 lg:py-28">
            <div>
              <p className="mono-label">Trust · 03</p>
              <h2 className="serif-display mt-3 text-balance text-[clamp(1.85rem,4vw,2.9rem)] leading-[1.05] text-[var(--ink)]">
                Code you don&apos;t own runs inside an{" "}
                <span className="italic text-[var(--terra-deep)]">iron box</span>.
              </h2>
              <p className="mt-5 max-w-lg text-[0.97rem] leading-[1.65] text-[var(--ink-soft)]">
                Every artifact renders inside a sandboxed iframe with explicit
                permissions. It cannot reach the parent page, your cookies, or
                your storage. Share pages cache for one hour and invalidate the
                instant you edit or unshare.
              </p>

              <ul className="mt-8 space-y-3 text-[0.92rem] text-[var(--ink-soft)]">
                <li className="flex gap-3">
                  <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--terra)]" aria-hidden="true" />
                  Account-scoped storage via Postgres row-level security.
                </li>
                <li className="flex gap-3">
                  <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--terra)]" aria-hidden="true" />
                  Sharing is a deliberate toggle — nothing is public by default.
                </li>
                <li className="flex gap-3">
                  <span className="mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--terra)]" aria-hidden="true" />
                  Cache invalidates immediately on edit or unshare.
                </li>
              </ul>
            </div>

            <div className="paper-card-deep p-5 sm:p-7">
              <div className="mono-label mb-4">renderer.ts · iframe sandbox</div>
              <pre className="code-font overflow-x-auto rounded-xl border border-[var(--hairline)] bg-[var(--paper)] p-4 text-[0.78rem] leading-[1.75] text-[var(--ink)] sm:text-[0.82rem]">
{`<iframe
  srcDoc={document}
  sandbox="allow-scripts
           allow-forms
           allow-popups
           allow-modals"
  referrerPolicy="no-referrer"
  loading="lazy"
/>`}
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

        {/* ───── CLOSING CTA (full-bleed cinematic) ───── */}
        <section className="relative isolate overflow-hidden border-t border-[var(--hairline)]">
          {/* AI-generated atmosphere */}
          <Image
            src="/sunlit-cta.png"
            alt=""
            fill
            sizes="100vw"
            priority={false}
            aria-hidden="true"
            className="object-cover object-center"
          />
          {/* Scrim 1 — overall warm darken for text legibility */}
          <div
            className="absolute inset-0 bg-[#1a110a]/65"
            aria-hidden="true"
          />
          {/* Scrim 2 — top gradient blending in from the section above */}
          <div
            className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--paper-deep)] to-transparent"
            aria-hidden="true"
          />
          {/* Scrim 3 — bottom gradient blending out to the footer */}
          <div
            className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--paper)] to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-5xl px-5 py-32 text-center sm:px-8 sm:py-40 lg:py-48">
            <p className="mono-label text-[#F4ECDD]/75">Build · 04</p>
            <h2 className="serif-display mx-auto mt-4 max-w-3xl text-balance text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.04] text-[#FAF4E5]">
              Ship the next prototype{" "}
              <span className="italic text-[#F4B98D]">in one tab.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[1rem] leading-[1.65] text-[#FAF4E5]/85">
              Create an artifact, verify it inside the sandbox, share the exact
              running version. No deploy step. No build pipeline.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={primaryHref} className="btn-terra w-full sm:w-auto">
                {user ? "Create artifact" : "Create your account"}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {!user && (
                <Link href="/login" className="btn-paper w-full sm:w-auto">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="sunlit-canvas-soft relative isolate overflow-hidden border-t border-[var(--hairline)]">
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="mono-label">Artifacts</span>
            <span className="hairline-div w-12" aria-hidden="true" />
            <span className="text-[0.78rem] text-[var(--ink-mute)]">
              Sandboxed rendering · account-scoped storage
            </span>
          </div>
          <span className="text-[0.78rem] text-[var(--ink-mute)]">
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
    <article className="tile paper-card tile-glow flex h-full flex-col p-5 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--paper)] text-[var(--terra)]">
          {icon}
        </div>
        <span className="mono-label">{eyebrow}</span>
      </div>

      <div
        className="relative mb-6 h-24 overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--paper)]"
        aria-hidden="true"
      >
        {visual}
      </div>

      <h3 className="serif-display text-[1.5rem] leading-[1.1] text-[var(--ink)]">
        {title}
      </h3>
      <p className="mt-3 text-[0.88rem] leading-[1.6] text-[var(--ink-soft)]">
        {body}
      </p>
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
    <article className="tile paper-card tile-glow flex h-full flex-col p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <span className="step-badge">{n}</span>
        <span className="hairline-div w-10" aria-hidden="true" />
      </div>
      <h3 className="serif-display text-[clamp(1.4rem,2.5vw,1.95rem)] leading-[1.08] text-[var(--ink)]">
        {title}
      </h3>
      <p className="mt-4 flex-1 text-[0.92rem] leading-[1.65] text-[var(--ink-soft)]">
        {body}
      </p>
      <div className="code-font mt-6 truncate rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-3 py-2 text-[0.72rem] text-[var(--ink-mute)]">
        {hint}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono-label">{label}</div>
      <div className="serif-display mt-1 text-[1.4rem] leading-none text-[var(--ink)]">
        {value}
      </div>
    </div>
  );
}

/* ── Micro-visuals for capability tiles ── */

function FileTreeVisual() {
  return (
    <div className="absolute inset-0 flex items-center px-4">
      <div className="code-font w-full space-y-1.5 text-[0.7rem] text-[var(--ink-mute)]">
        {[
          { name: "index.html", on: true },
          { name: "style.css", on: false },
          { name: "app.jsx", on: false },
          { name: "data.json", on: false },
        ].map((f) => (
          <div key={f.name} className="flex items-center gap-2">
            <FileCode2
              className={`h-3 w-3 ${
                f.on ? "text-[var(--terra)]" : "text-[var(--ink-mute)]/55"
              }`}
            />
            <span className={f.on ? "text-[var(--ink)]" : "text-[var(--ink-mute)]"}>
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
      <div className="absolute inset-x-3 top-3 flex h-5 items-center gap-1 rounded-md border border-[var(--hairline)] bg-[var(--paper-soft)] px-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#D67563]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#E2B47A]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#9DA56C]" />
      </div>
      <div className="absolute inset-x-3 bottom-3 top-11 rounded-md bg-gradient-to-br from-[var(--terra)]/18 via-[var(--honey)]/22 to-transparent">
        <div className="absolute inset-x-2 top-2 h-1.5 rounded-full bg-[var(--ink)]/12" />
        <div className="absolute inset-x-2 top-5 h-1.5 w-2/3 rounded-full bg-[var(--terra)]/55" />
        <div className="absolute bottom-2 left-2 right-2 grid grid-cols-3 gap-1.5">
          <span className="h-3 rounded bg-[var(--ink)]/10" />
          <span className="h-3 rounded bg-[var(--terra)]/35" />
          <span className="h-3 rounded bg-[var(--ink)]/10" />
        </div>
      </div>
    </div>
  );
}

function LockVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-br from-[var(--terra)]/22 via-transparent to-transparent blur-xl" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[var(--hairline)] bg-[var(--paper-soft)]">
          <Lock className="h-5 w-5 text-[var(--terra)]" />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-1.5">
        <span className="h-1.5 rounded-full bg-[var(--ink)]/12" />
        <span className="h-1.5 rounded-full bg-[var(--ink)]/12" />
        <span className="h-1.5 rounded-full bg-[var(--ink)]/12" />
      </div>
    </div>
  );
}

function LinkVisual() {
  return (
    <div className="absolute inset-0 flex items-center px-4">
      <div className="w-full rounded-md border border-[var(--hairline)] bg-[var(--paper-soft)] p-2.5">
        <div className="mono-label mb-1.5 text-[0.55rem]">public url</div>
        <div className="flex items-center gap-2 truncate">
          <Code2 className="h-3 w-3 shrink-0 text-[var(--terra)]" />
          <span className="code-font truncate text-[0.72rem] text-[var(--ink)]">
            /s/3k2j-sunlit-9
          </span>
          <ArrowUpRight className="ml-auto h-3 w-3 shrink-0 text-[var(--ink-mute)]" />
        </div>
      </div>
    </div>
  );
}
