import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Lock,
  Share2,
  Shield,
  Sun,
} from "lucide-react";
import { Header } from "@/components/Header";
import { PreviewFrame } from "@/components/PreviewFrame";
import { BrandMark } from "@/components/BrandMark";
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

  const files = ["index.html", "beach.css", "app.jsx"];

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "28px",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      color: "#20201d",
      background: "radial-gradient(120% 90% at 16% 0%, rgba(254,213,132,0.35), transparent 55%), radial-gradient(120% 90% at 90% 100%, rgba(22,90,91,0.14), transparent 58%), #fbf7ef",
    }}>
      <section style={{
        width: "min(700px, 100%)",
        border: "1px solid rgba(22,90,91,0.22)",
        borderRadius: 16,
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 22px 44px -24px rgba(22,70,71,0.5)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 16px",
          borderBottom: "1px solid rgba(22,90,91,0.16)",
          color: "#6f6a60",
          fontSize: 12,
          letterSpacing: 0.4,
        }}>
          <strong style={{ color: "#165a5b", letterSpacing: 0.3 }}>Beach panel</strong>
          <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>sandbox · live</span>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          minHeight: 280,
        }}>
          <div style={{
            padding: 18,
            borderRight: "1px solid rgba(22,90,91,0.14)",
          }}>
            {files.map((file, index) => (
              <div key={file} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 0",
                color: active === index ? "#165a5b" : "#6f6a60",
                fontWeight: active === index ? 600 : 400,
                transition: "color 260ms ease",
              }}>
                <span style={{
                  width: 9,
                  height: 9,
                  borderRadius: 99,
                  background: active === index ? "#ffab17" : "rgba(32,32,29,0.14)",
                  transition: "all 260ms ease",
                }} />
                <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13 }}>
                  {file}
                </span>
              </div>
            ))}
            <div style={{
              marginTop: 16,
              fontSize: 10,
              letterSpacing: 1.6,
              color: "rgba(111,106,96,0.9)",
              textTransform: "uppercase",
              fontWeight: 600,
            }}>
              entry · App.jsx
            </div>
          </div>
          <div style={{ position: "relative", padding: 22 }}>
            <div style={{
              position: "absolute",
              inset: 22,
              border: "1px solid rgba(22,90,91,0.2)",
              borderRadius: 12,
              background: "#fbf7ef",
            }} />
            <div style={{
              position: "absolute",
              left: 42,
              right: 42,
              top: 60,
              height: 9,
              borderRadius: 99,
              background: "rgba(32,32,29,0.08)",
            }} />
            <div style={{
              position: "absolute",
              left: 42,
              top: 88,
              width: active === 0 ? "62%" : active === 1 ? "44%" : "78%",
              height: 9,
              borderRadius: 99,
              background: "linear-gradient(90deg, #165a5b, #ffab17)",
              transition: "width 520ms cubic-bezier(.22,1,.36,1)",
            }} />
            <div style={{
              position: "absolute",
              left: 42,
              right: 42,
              bottom: 48,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}>
              {[0, 1, 2].map((item) => (
                <div key={item} style={{
                  height: 52,
                  borderRadius: 10,
                  background: item === active ? "rgba(254,213,132,0.55)" : "#ffffff",
                  border: item === active ? "1px solid #ffab17" : "1px solid rgba(22,90,91,0.18)",
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

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Header />

      {!configured && (
        <div className="border-b border-sun/40 bg-sand-soft px-4 py-2 text-center text-xs text-sun-deep">
          Supabase is not configured yet. Copy{" "}
          <code className="code-font">.env.example</code> to{" "}
          <code className="code-font">.env.local</code> and run the SQL in{" "}
          <code className="code-font">supabase/migrations/</code>.
        </div>
      )}

      <main className="flex-1">
        {/* ───── HERO — a postcard from the sandbox ───── */}
        <section className="relative isolate overflow-hidden">
          <div className="contour" aria-hidden="true" />
          <div className="grain-soft" aria-hidden="true" />

          <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pt-16 text-center sm:px-8 sm:pt-20">
            <div className="animate-rise-in flex justify-center">
              <span className="chip">
                <Sun className="h-3.5 w-3.5 text-sun" aria-hidden="true" />
                Suncoast Venture Studio · Internal tool
              </span>
            </div>

            <h1 className="animate-rise-in motion-delay-1 mt-8">
              <span className="display block text-balance text-[clamp(2.3rem,6.5vw,4.2rem)] font-extrabold leading-[1.06] tracking-[-0.02em] text-ink">
                Drop the files.
                <br />
                Watch them run.
              </span>
              <span className="script mt-3 block text-[clamp(3.1rem,9vw,5.9rem)] leading-[1.08] text-teal">
                <span className="uline">
                  Send the link!
                  <svg viewBox="0 0 330 14" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M4 9C45 3 85 3 122 8s83 5 123-1 70-4 81 0" />
                  </svg>
                </span>
              </span>
            </h1>

            <p className="animate-rise-in motion-delay-2 mx-auto mt-8 max-w-xl text-pretty text-[1.04rem] leading-[1.7] text-ink-soft">
              Artifacts is the studio&apos;s workbench for HTML, CSS, JS, and
              JSX prototypes. Drop in files, watch them run inside a sandboxed
              iframe, and share the exact working version with a single link.
            </p>

            <div className="animate-rise-in motion-delay-3 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                <Link href={primaryHref} className="btn-sea w-full sm:w-auto">
                  {primaryLabel}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <a href={primaryHref} className="btn-sea w-full sm:w-auto">
                  {primaryLabel}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {user && (
                <Link href="/dashboard" className="btn-shell w-full sm:w-auto">
                  Open library
                </Link>
              )}
            </div>

            <div className="animate-rise-in motion-delay-4 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-[0.84rem] font-medium text-ink-mute">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-teal" aria-hidden="true" />
                Sandboxed iframe
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-teal" aria-hidden="true" />
                Private by default
              </span>
              <span className="flex items-center gap-1.5">
                <Share2 className="h-4 w-4 text-teal" aria-hidden="true" />
                One-click public link
              </span>
            </div>
          </div>

          {/* the postcard */}
          <div className="relative z-10 mx-auto mt-12 w-full max-w-3xl px-5 sm:px-8">
            <span
              className="sun-rays absolute -top-10 right-2 hidden h-36 w-36 opacity-60 md:block"
              aria-hidden="true"
            />
            <div className="animate-rise-in motion-delay-3 [--tilt:0deg] md:[--tilt:-1.2deg]">
              <PreviewFrame
                label="Greetings from the sandbox"
                live
                className="animate-float-tide"
                screenClassName="aspect-[4/3] sm:aspect-[16/10]"
              >
                <ArtifactRenderer doc={DEMO_DOC} title="Live JSX demo" />
              </PreviewFrame>
            </div>
          </div>

          {/* wave edge into the next (white) section */}
          <svg
            viewBox="0 0 1440 64"
            preserveAspectRatio="none"
            className="relative z-0 -mt-10 block h-14 w-full text-white sm:h-16"
            aria-hidden="true"
          >
            <path
              d="M0 38C180 62 340 10 540 24s360 40 560 22 260-14 340-6v34H0Z"
              fill="currentColor"
            />
          </svg>
        </section>

        {/* ───── THE WORKBENCH — three crate-label tiles ───── */}
        <section className="relative bg-white pb-20 pt-10 sm:pb-24 sm:pt-12">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mono-label text-teal-bright">The workbench</p>
              <h2 className="script mt-3 text-balance text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.1] text-teal">
                Purpose-built for running prototypes
              </h2>
              <p className="mt-4 text-[0.98rem] leading-[1.65] text-ink-soft">
                Three moves turn a folder of loose files into a working,
                shareable prototype — no deploy step, no build pipeline.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Tile
                kicker="Step one"
                title="Bring real files"
                body="Drag in HTML, CSS, JS, JSX, or TSX — multiple files per artifact, folder structure kept intact."
                art={<BadgeFiles />}
              />
              <Tile
                kicker="Step two"
                title="Sandboxed preview"
                body="The iframe refreshes as you type, with Babel transforming JSX at runtime. What you see is what ships."
                art={<BadgePreview />}
              />
              <Tile
                kicker="Step three"
                title="One public link"
                body="Artifacts stay private until you flip sharing on. Copy a clean URL; unshare and caches invalidate instantly."
                art={<BadgeLink />}
              />
            </div>
          </div>
        </section>

        {/* ───── HOW IT RENDERS — notched cream band ───── */}
        <section className="relative bg-cream-deep pb-20 pt-16 sm:pb-24 sm:pt-20">
          {/* V-notch wedge from the white section above */}
          <svg
            viewBox="0 0 56 24"
            className="absolute left-1/2 top-0 h-6 w-14 -translate-x-1/2 text-white"
            aria-hidden="true"
          >
            <path d="M0 0h56L28 24Z" fill="currentColor" />
          </svg>
          <div className="grain-soft" aria-hidden="true" />

          <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mono-label text-teal-bright">Under the hood</p>
              <h2 className="script mt-3 text-balance text-[clamp(2.2rem,5.5vw,3.6rem)] leading-[1.1] text-teal">
                From loose files to one link
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
              <Step
                n="1"
                title="Upload or paste"
                body="Drop your files, or paste raw code. Set an entry file when needed; everything else is referenced relatively."
                hint="HTML · CSS · JS · JSX · TSX"
              />
              <Step
                n="2"
                title="Render in the sandbox"
                body={
                  <>
                    The server bundles your files into one HTML document piped
                    into an iframe via{" "}
                    <code className="code-font text-teal">srcDoc</code>. The
                    sandbox attribute blocks it from reaching the parent app.
                  </>
                }
                hint='sandbox="allow-scripts allow-forms allow-popups"'
              />
              <Step
                n="3"
                title="Send the link"
                body="Toggle the share switch, copy the public URL, send it to anyone. They get the running version — no sign-in required."
                hint="public/<shareId>"
              />
            </div>
          </div>
        </section>

        {/* ───── SECURITY — split with spec card ───── */}
        <section className="relative bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div>
              <p className="mono-label text-teal-bright">Peace of mind</p>
              <h2 className="mt-3 text-balance">
                <span className="display block text-[clamp(1.7rem,3.6vw,2.5rem)] font-extrabold leading-[1.12] tracking-[-0.015em] text-ink">
                  Code you don&apos;t own runs
                </span>
                <span className="script mt-1 block text-[clamp(2.2rem,4.6vw,3.2rem)] leading-[1.1] text-teal">
                  in a sealed sandbox
                </span>
              </h2>
              <p className="mt-5 max-w-lg text-[1rem] leading-[1.7] text-ink-soft">
                Every artifact renders inside a sandboxed iframe with explicit
                permissions. It cannot reach the parent page, your cookies, or
                your storage. Share pages cache for one hour and invalidate the
                instant you edit or unshare.
              </p>

              <ul className="mt-8 space-y-3.5 text-[0.95rem] text-ink-soft">
                {[
                  "Account-scoped storage via Postgres row-level security.",
                  "Sharing is a deliberate toggle — nothing is public by default.",
                  "Cache invalidates immediately on edit or unshare.",
                ].map((line) => (
                  <li key={line} className="flex gap-3">
                    <Sun
                      className="mt-0.5 h-4 w-4 shrink-0 text-sun"
                      aria-hidden="true"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="plate plate-ribbon overflow-hidden p-5 sm:p-7">
              <div className="mono-label mb-4 mt-1 text-teal-bright">
                renderer.ts · iframe sandbox
              </div>
              <pre className="code-font overflow-x-auto rounded-2xl bg-plum-deep p-5 text-[0.78rem] leading-[1.8] text-cream/90 sm:text-[0.82rem]">
                <span className="text-sand">{`<iframe`}</span>
                {`
  srcDoc={document}
  `}
                <span className="text-sun">{`sandbox`}</span>
                {`="allow-scripts
           allow-forms
           allow-popups
           allow-modals"
  referrerPolicy="no-referrer"
  loading="lazy"
`}
                <span className="text-sand">{`/>`}</span>
              </pre>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 text-[0.82rem] sm:grid-cols-4">
                <Stat label="Sandboxed" value="iframe" />
                <Stat label="Private" value="default" />
                <Stat label="Share cache" value="1h" />
                <Stat label="Invalidation" value="instant" />
              </div>
            </div>
          </div>
        </section>

        {/* ───── EVENING CTA — plum + palms ───── */}
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-plum to-plum-deep">
          <div className="contour contour-sand" aria-hidden="true" />
          <PalmSil className="absolute -left-10 bottom-0 h-64 w-52 text-sand opacity-[0.09] sm:h-80 sm:w-64" />
          <PalmSil
            className="absolute -right-12 bottom-0 h-72 w-56 -scale-x-100 text-sand opacity-[0.09] sm:h-96 sm:w-72"
          />

          <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
            <p className="mono-label text-sand/75">After hours</p>
            <h2 className="mt-4 text-balance">
              <span className="script block text-[clamp(2.6rem,7vw,4.6rem)] leading-[1.08] text-sand">
                A better way to ship prototypes
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-[1.02rem] leading-[1.7] text-cream/80">
              Create an artifact, verify it inside the sandbox, share the exact
              running version — all before the sun goes down.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {user ? (
                <Link href={primaryHref} className="btn-sand w-full sm:w-auto">
                  Create artifact
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : (
                <a href={primaryHref} className="btn-sand w-full sm:w-auto">
                  Sign in
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ───── FOOTER — cream, then the teal band ───── */}
      <footer className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <BrandMark className="h-11 w-11" />
            <span className="flex flex-col leading-tight">
              <span className="script text-[1.3rem] text-teal">Artifacts</span>
              <span className="text-[0.78rem] text-ink-mute">
                Sandboxed rendering · account-scoped storage
              </span>
            </span>
          </div>
          <nav className="display flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.82rem] font-semibold text-ink-soft">
            <a
              href="https://tools.suncoast.studio"
              className="transition-colors hover:text-teal"
            >
              Tools Hub
            </a>
            <Link href="/dashboard" className="transition-colors hover:text-teal">
              My Library
            </Link>
            <Link href="/directory" className="transition-colors hover:text-teal">
              SVS Directory
            </Link>
          </nav>
        </div>
        <div className="bg-teal px-5 py-3.5 text-center">
          <p className="text-[0.75rem] text-cream/85">
            © 2026 Suncoast Venture Studio — Proudly made in Sarasota, Florida
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Component pieces
   ──────────────────────────────────────────────────────────── */

function Tile({
  kicker,
  title,
  body,
  art,
}: {
  kicker: string;
  title: string;
  body: string;
  art: ReactNode;
}) {
  return (
    <article className="plate plate-hover group flex h-full flex-col p-6">
      <div className="flex justify-center rounded-2xl bg-cream px-4 py-5">
        <div className="h-28 w-full max-w-[13rem] transition-transform duration-300 group-hover:scale-[1.03] group-hover:-rotate-1">
          {art}
        </div>
      </div>
      <p className="mono-label mt-6 text-teal-bright">{kicker}</p>
      <h3 className="display mt-1.5 text-[1.3rem] font-bold leading-snug text-ink">
        {title}
      </h3>
      <p className="mt-2.5 flex-1 text-[0.9rem] leading-[1.65] text-ink-mute">
        {body}
      </p>
      <span className="display mt-5 inline-flex items-center gap-2 text-[0.84rem] font-semibold text-teal">
        In the workbench
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
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
    <article className="relative flex h-full flex-col">
      <div className="flex items-center gap-4">
        <span className="display flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal text-[1.25rem] font-bold text-white shadow-[0_10px_20px_-10px_rgba(14,65,66,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]">
          {n}
        </span>
        <span className="tide-rule flex-1" aria-hidden="true" />
        <Sun className="h-4 w-4 shrink-0 text-sun" aria-hidden="true" />
      </div>
      <h3 className="display mt-5 text-[1.25rem] font-bold leading-snug text-ink">
        {title}
      </h3>
      <p className="mt-3 flex-1 text-[0.92rem] leading-[1.7] text-ink-soft">
        {body}
      </p>
      <div className="code-font mt-5 truncate rounded-xl border border-teal/15 bg-white px-3.5 py-2.5 text-[0.72rem] text-ink-mute">
        {hint}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono-label text-[0.6rem] text-ink-mute">{label}</div>
      <div className="display mt-1 text-[1.25rem] font-bold leading-none text-teal">
        {value}
      </div>
    </div>
  );
}

/* ── Vintage crate-label badges (tile art) ── */

function BadgeFrame({
  id,
  arc,
  children,
}: {
  id: string;
  arc: string;
  children: ReactNode;
}) {
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" aria-hidden="true">
      <rect
        x="3"
        y="3"
        width="194"
        height="114"
        rx="10"
        fill="var(--sepia-paper)"
        stroke="var(--sepia)"
        strokeWidth="2"
      />
      <rect
        x="10"
        y="10"
        width="180"
        height="100"
        rx="6"
        fill="none"
        stroke="var(--sepia)"
        strokeWidth="1"
        strokeDasharray="3 2.6"
        opacity="0.55"
      />
      <defs>
        <path id={`arc-${id}`} d="M32 52a75 60 0 0 1 136 0" fill="none" />
      </defs>
      <text
        fill="var(--sepia)"
        fontSize="13"
        fontWeight="800"
        letterSpacing="2.6"
        textAnchor="middle"
        style={{ fontFamily: "var(--font-display), Poppins, sans-serif" }}
      >
        <textPath href={`#arc-${id}`} startOffset="50%">
          {arc}
        </textPath>
      </text>
      <g fill="var(--sepia)" fontSize="9">
        <text x="22" y="34">
          ★
        </text>
        <text x="170" y="34">
          ★
        </text>
      </g>
      {children}
    </svg>
  );
}

function BadgeFiles() {
  return (
    <BadgeFrame id="files" arc="REAL FILES IN">
      <g
        stroke="var(--sepia)"
        strokeWidth="2"
        fill="#fffdf7"
        strokeLinejoin="round"
      >
        <rect x="76" y="56" width="30" height="40" rx="2" opacity="0.55" />
        <rect x="84" y="52" width="30" height="42" rx="2" opacity="0.8" />
        <path d="M94 48h22l8 8v34a2 2 0 0 1-2 2H94a2 2 0 0 1-2-2V50a2 2 0 0 1 2-2Z" />
        <path d="M116 48v8h8" fill="none" />
      </g>
      <g stroke="var(--sepia)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M98 66h18" />
        <path d="M98 73h18" />
        <path d="M98 80h12" />
      </g>
    </BadgeFrame>
  );
}

function BadgePreview() {
  return (
    <BadgeFrame id="preview" arc="LIVE PREVIEW">
      <g stroke="var(--sepia)" strokeWidth="2" fill="#fffdf7">
        <rect x="70" y="50" width="60" height="44" rx="4" />
        <path d="M70 60h60" />
      </g>
      <g fill="var(--sepia)">
        <circle cx="76.5" cy="55" r="1.6" />
        <circle cx="82" cy="55" r="1.6" />
        <circle cx="87.5" cy="55" r="1.6" />
      </g>
      <path d="M95 68l14 9-14 9Z" fill="var(--sepia)" />
      <path
        d="M112 86c3 0 3-2.4 6-2.4s3 2.4 6 2.4"
        stroke="var(--sepia)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </BadgeFrame>
  );
}

function BadgeLink() {
  return (
    <BadgeFrame id="link" arc="ONE PUBLIC LINK">
      <g
        stroke="var(--sepia)"
        strokeWidth="2"
        fill="#fffdf7"
        strokeLinejoin="round"
      >
        <rect x="68" y="54" width="52" height="36" rx="3" />
        <path d="M68 56l26 20 26-20" fill="none" />
      </g>
      <g stroke="var(--sepia)" strokeWidth="2" strokeLinecap="round">
        <path d="M124 72h12" />
        <path d="M131 66l6 6-6 6" fill="none" strokeLinejoin="round" />
      </g>
    </BadgeFrame>
  );
}

/* ── Palm silhouette for the evening section ── */

function PalmSil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 160" fill="currentColor" className={className} aria-hidden="true">
      <path d="M60 158c-4-36-6-70 6-102l7 2c-14 30-9 64-3 100z" />
      <path d="M70 58C50 42 26 40 8 50c22 2 40 8 56 16z" />
      <path d="M70 58C44 52 22 60 10 74c20-6 40-8 56-6z" />
      <path d="M70 58c-8-24-26-38-48-40 18 10 32 24 40 42z" />
      <path d="M70 58c4-24 20-40 42-44-14 12-26 28-32 46z" />
      <path d="M70 58c22-12 46-10 62 2-22-2-42 2-56 8z" />
      <path d="M70 58c26-2 46 10 56 26-18-10-38-14-54-16z" />
      <circle cx="66" cy="62" r="5" />
      <circle cx="76" cy="63" r="5" />
    </svg>
  );
}
