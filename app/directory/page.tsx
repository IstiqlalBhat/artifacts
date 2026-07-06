import Link from "next/link";
import { ArrowRight, Clock3, FileCode2, Library, User } from "lucide-react";
import { Header } from "@/components/Header";
import { DirectoryCopyButton } from "@/components/DirectoryCopyButton";
import { requireUser } from "@/lib/auth";
import { supabaseData } from "@/lib/supabase/data";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
  title: string;
  description: string | null;
  kind: "html" | "jsx";
  owner_email: string | null;
  updated_at: string;
  share_token: string | null;
};

export default async function DirectoryPage() {
  await requireUser("/directory");
  const supabase = supabaseData();

  const { data, error } = await supabase
    .from("artifacts")
    .select(
      "id, title, description, kind, owner_email, updated_at, share_token",
    )
    .eq("in_directory", true)
    .order("updated_at", { ascending: false });

  const artifacts = (data ?? []) as Row[];

  return (
    <div className="flex min-h-screen flex-col bg-shell">
      <Header />
      <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <div
          className="contour contour-fade absolute inset-x-0 top-0 h-80"
          aria-hidden="true"
        />

        <div className="relative mb-9 animate-rise-in">
          <p className="mono-label mb-3 flex items-center gap-2 text-teal-bright">
            <Library className="h-4 w-4 text-sun" />
            SVS Directory
          </p>
          <h1 className="script text-[clamp(2.6rem,7vw,4rem)] leading-[1.08] text-teal">
            Shared with the org
          </h1>
          <p className="mt-3 max-w-2xl text-[0.97rem] leading-relaxed text-ink-soft">
            Artifacts other people have published to the directory. Open any
            one to view it read-only.
          </p>
        </div>

        {error && (
          <div className="relative mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            {error.message}
          </div>
        )}

        {artifacts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="plate animate-rise-in motion-delay-1 relative overflow-hidden">
            <div className="hidden grid-cols-[1fr_11rem_8rem_5rem_3.5rem] gap-4 border-b border-sea/15 bg-shell-deep/45 px-5 py-3 sm:grid">
              <span className="mono-label">Artifact</span>
              <span className="mono-label">Author</span>
              <span className="mono-label">Updated</span>
              <span className="mono-label">Public URL</span>
              <span className="mono-label text-right">Open</span>
            </div>
            <div className="divide-y divide-sea/10">
              {artifacts.map((artifact) => (
                <DirectoryRow key={artifact.id} artifact={artifact} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DirectoryRow({ artifact }: { artifact: Row }) {
  return (
    <div className="group relative px-4 py-4 transition-colors hover:bg-sand/[0.14] sm:px-5">
      <Link
        href={`/d/${artifact.id}`}
        aria-label={`Open ${artifact.title}`}
        className="absolute inset-0"
      />

      {/* ── mobile: stacked card ── */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-sea to-sea-deep text-shell-bright shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <FileCode2 className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-ink">
              {artifact.title}
            </span>
            {artifact.description ? (
              <span className="mt-0.5 block truncate text-xs text-ink-mute">
                {artifact.description}
              </span>
            ) : null}
          </span>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-sea/60" />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-14 text-xs text-ink-mute">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{artifact.owner_email ?? "Unknown"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {formatDate(artifact.updated_at)}
          </span>
          <span className="relative z-10 ml-auto">
            <DirectoryCopyButton
              shareToken={artifact.share_token}
              title={artifact.title}
            />
          </span>
        </div>
      </div>

      {/* ── sm+: table row ── */}
      <div className="hidden grid-cols-[1fr_11rem_8rem_5rem_3.5rem] items-center gap-4 sm:grid">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-sea to-sea-deep text-shell-bright shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-300 group-hover:-translate-y-0.5">
            <FileCode2 className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink group-hover:text-sea-deep">
              {artifact.title}
            </span>
            {artifact.description ? (
              <span className="mt-0.5 block truncate text-sm text-ink-soft">
                {artifact.description}
              </span>
            ) : null}
          </span>
        </div>
        <span className="flex min-w-0 items-center gap-1.5 truncate text-sm text-ink-mute">
          <User className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{artifact.owner_email ?? "Unknown"}</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm text-ink-mute">
          <Clock3 className="h-3.5 w-3.5" />
          {formatDate(artifact.updated_at)}
        </span>
        <span className="flex">
          <DirectoryCopyButton
            shareToken={artifact.share_token}
            title={artifact.title}
          />
        </span>
        <span className="flex justify-end text-sea/50 transition-all group-hover:translate-x-0.5 group-hover:text-sea-deep">
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="plate animate-rise-in motion-delay-1 relative overflow-hidden p-10 sm:p-14">
      <div className="contour contour-fade" aria-hidden="true" />
      <span
        className="sun-rays absolute -right-8 -top-10 h-40 w-40 opacity-50"
        aria-hidden="true"
      />
      <div className="relative max-w-xl">
        <h2 className="display text-[clamp(1.5rem,3.5vw,2.2rem)] leading-tight text-ink">
          Nothing in the directory yet
        </h2>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
          When someone checks the SVS Directory box on one of their artifacts,
          it&apos;ll show up here for everyone signed in.
        </p>
      </div>
    </div>
  );
}
