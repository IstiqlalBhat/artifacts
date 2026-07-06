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
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="mono-label mb-3 flex items-center gap-2 text-cobalt">
            <Library className="h-4 w-4" />
            SVS Directory
          </p>
          <h1 className="display offset-head text-[clamp(2.25rem,6vw,3.5rem)] leading-[0.95] text-ink">
            Shared with the org
          </h1>
          <p className="mt-3 max-w-2xl text-[0.97rem] leading-relaxed text-ink-soft">
            Artifacts other people have published to the directory. Open any one
            to view it read-only.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border-[1.5px] border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
            {error.message}
          </div>
        )}

        {artifacts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="riso-card overflow-hidden p-0">
            <div className="grid grid-cols-[1fr_auto] gap-4 border-b-[1.5px] border-ink/12 bg-paper-deep/50 px-4 py-3 sm:grid-cols-[1fr_12rem_9rem_6rem_4rem]">
              <span className="mono-label">Artifact</span>
              <span className="mono-label hidden sm:block">Author</span>
              <span className="mono-label hidden sm:block">Updated</span>
              <span className="mono-label hidden sm:block">Public URL</span>
              <span className="mono-label text-right">Open</span>
            </div>
            <div className="divide-y divide-ink/10">
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
    <div className="group relative grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-orange/[0.06] sm:grid-cols-[1fr_12rem_9rem_6rem_4rem]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink bg-cobalt text-paper-soft shadow-[2px_2px_0_var(--ink)] transition-transform group-hover:-translate-y-0.5">
          <FileCode2 className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold text-ink group-hover:text-cobalt">
            {artifact.title}
          </span>
          {artifact.description ? (
            <span className="mt-0.5 block truncate text-sm text-ink-soft">
              {artifact.description}
            </span>
          ) : null}
        </span>
      </div>
      <span className="hidden items-center gap-1.5 truncate text-sm text-ink-mute sm:flex">
        <User className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{artifact.owner_email ?? "Unknown"}</span>
      </span>
      <span className="hidden items-center gap-1.5 text-sm text-ink-mute sm:flex">
        <Clock3 className="h-3.5 w-3.5" />
        {formatDate(artifact.updated_at)}
      </span>
      <span className="hidden sm:flex">
        <DirectoryCopyButton
          shareToken={artifact.share_token}
          title={artifact.title}
        />
      </span>
      <span className="flex justify-end text-ink-mute transition-all group-hover:translate-x-0.5 group-hover:text-cobalt">
        <ArrowRight className="h-4 w-4" />
      </span>
      <Link
        href={`/d/${artifact.id}`}
        aria-label={`Open ${artifact.title}`}
        className="absolute inset-0"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="riso-card-pop relative overflow-hidden p-10 sm:p-14">
      <div className="halftone halftone-fade" aria-hidden="true" />
      <div className="relative max-w-xl">
        <h2 className="display text-[clamp(1.5rem,3.5vw,2.25rem)] leading-tight text-ink">
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
