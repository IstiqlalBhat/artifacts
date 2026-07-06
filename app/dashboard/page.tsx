import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  FileCode2,
  Globe,
  Library,
  Lock,
  Plus,
} from "lucide-react";
import { Header } from "@/components/Header";
import { DashboardDropZone } from "@/components/DashboardDropZone";
import { DeleteArtifactButton } from "@/components/DeleteArtifactButton";
import { DirectoryToggle } from "@/components/DirectoryToggle";
import { requireUser } from "@/lib/auth";
import { supabaseData } from "@/lib/supabase/data";
import { formatDate } from "@/lib/utils";

type Row = {
  id: string;
  title: string;
  kind: "html" | "jsx";
  files: { name: string }[];
  share_token: string | null;
  in_directory: boolean;
  description: string | null;
  updated_at: string;
};

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const supabase = supabaseData();

  const { data, error } = await supabase
    .from("artifacts")
    .select(
      "id, title, kind, files, share_token, in_directory, description, updated_at",
    )
    .eq("owner", user.id)
    .order("updated_at", { ascending: false });

  const artifacts = (data ?? []) as Row[];
  const sharedCount = artifacts.filter((artifact) => artifact.share_token).length;
  const directoryCount = artifacts.filter((artifact) => artifact.in_directory).length;
  const fileCount = artifacts.reduce(
    (total, artifact) => total + artifact.files.length,
    0,
  );

  return (
    <div className="relative flex min-h-screen flex-col bg-shell">
      <Header />
      <DashboardDropZone>
        <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
          <div
            className="contour contour-fade absolute inset-x-0 top-0 h-80"
            aria-hidden="true"
          />

          <div className="relative mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="animate-rise-in">
              <p className="mono-label mb-3 flex items-center gap-2 text-teal-bright">
                <Library className="h-4 w-4 text-sun" />
                My library
              </p>
              <h1 className="script text-[clamp(2.6rem,7vw,4rem)] leading-[1.08] text-teal">
                Your artifacts
              </h1>
              <p className="mt-3 max-w-2xl text-[0.97rem] leading-relaxed text-ink-soft">
                Review drafts, reopen a workbench, or copy a shareable
                prototype. Drop a folder anywhere on this page to import it as
                a new artifact.
              </p>
            </div>
            <Link href="/new" className="btn-sea shrink-0 self-start lg:self-auto">
              <Plus className="h-4 w-4" />
              New artifact
            </Link>
          </div>

          <div className="plate animate-rise-in motion-delay-1 relative mb-9 grid grid-cols-2 overflow-hidden sm:grid-cols-4">
            <Stat label="Artifacts" value={artifacts.length.toString()} />
            <Stat label="Files stored" value={fileCount.toString()} />
            <Stat label="Public links" value={sharedCount.toString()} />
            <Stat label="In SVS Directory" value={directoryCount.toString()} />
          </div>

          {error && (
            <div className="relative mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
              {error.message}. Run the SQL migration in{" "}
              <code className="code-font">supabase/migrations/</code>.
            </div>
          )}

          {artifacts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="plate animate-rise-in motion-delay-2 relative overflow-hidden">
              <div className="hidden grid-cols-[1fr_8rem_7.5rem_9rem_3.5rem_3.5rem] gap-4 border-b border-sea/15 bg-shell-deep/45 px-5 py-3 sm:grid">
                <span className="mono-label">Artifact</span>
                <span className="mono-label">Updated</span>
                <span className="mono-label">Sharing</span>
                <span className="mono-label">Directory</span>
                <span className="mono-label text-center">Del</span>
                <span className="mono-label text-right">Open</span>
              </div>
              <div className="divide-y divide-sea/10">
                {artifacts.map((artifact) => (
                  <ArtifactRow key={artifact.id} artifact={artifact} />
                ))}
              </div>
            </div>
          )}
        </main>
      </DashboardDropZone>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-sea/10 px-5 py-5 odd:border-r sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="display text-[2rem] leading-none text-sea-deep">
        {value}
      </div>
      <div className="mono-label mt-2">{label}</div>
    </div>
  );
}

function SharingBadge({ shared }: { shared: boolean }) {
  return shared ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/50 bg-sand/30 px-2.5 py-1 text-xs font-semibold text-amber-deep">
      <Globe className="h-3.5 w-3.5" />
      Shared
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sea/20 bg-shell px-2.5 py-1 text-xs font-semibold text-ink-mute">
      <Lock className="h-3.5 w-3.5" />
      Private
    </span>
  );
}

function ArtifactRow({ artifact }: { artifact: Row }) {
  const fileNames = artifact.files.map((file) => file.name).slice(0, 4);
  const more = artifact.files.length - fileNames.length;

  return (
    <div className="group relative px-4 py-4 transition-colors hover:bg-sand/[0.14] sm:px-5">
      <Link
        href={`/a/${artifact.id}`}
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
            <span className="mt-0.5 block truncate code-font text-[0.7rem] text-ink-mute">
              {fileNames.join(" / ")}
              {more > 0 ? ` / +${more}` : ""}
            </span>
          </span>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-sea/60" />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-14">
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-mute">
            <Clock3 className="h-3.5 w-3.5" />
            {formatDate(artifact.updated_at)}
          </span>
          <SharingBadge shared={!!artifact.share_token} />
          <span className="relative z-10 ml-auto flex items-center gap-2">
            <DirectoryToggle
              id={artifact.id}
              initial={artifact.in_directory}
              title={artifact.title}
            />
            <DeleteArtifactButton id={artifact.id} title={artifact.title} />
          </span>
        </div>
      </div>

      {/* ── sm+: table row ── */}
      <div className="hidden grid-cols-[1fr_8rem_7.5rem_9rem_3.5rem_3.5rem] items-center gap-4 sm:grid">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-sea to-sea-deep text-shell-bright shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-300 group-hover:-translate-y-0.5">
            <FileCode2 className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink group-hover:text-sea-deep">
              {artifact.title}
            </span>
            {artifact.description ? (
              <span className="mt-0.5 block truncate text-xs text-ink-mute">
                {artifact.description}
              </span>
            ) : null}
            <span className="mt-0.5 block truncate code-font text-[0.7rem] text-ink-mute">
              {fileNames.join(" / ")}
              {more > 0 ? ` / +${more}` : ""}
            </span>
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-sm text-ink-mute">
          <Clock3 className="h-3.5 w-3.5" />
          {formatDate(artifact.updated_at)}
        </span>
        <span>
          <SharingBadge shared={!!artifact.share_token} />
        </span>
        <span>
          <DirectoryToggle
            id={artifact.id}
            initial={artifact.in_directory}
            title={artifact.title}
          />
        </span>
        <span className="flex justify-center">
          <DeleteArtifactButton id={artifact.id} title={artifact.title} />
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
    <div className="plate animate-rise-in motion-delay-2 relative overflow-hidden p-10 sm:p-14">
      <div className="contour contour-fade" aria-hidden="true" />
      <span
        className="sun-rays absolute -right-8 -top-10 h-40 w-40 opacity-50"
        aria-hidden="true"
      />
      <div className="relative max-w-xl">
        <span className="chip chip-sand mb-5">
          <Plus className="h-3 w-3" />
          first entry
        </span>
        <h2 className="display text-[clamp(1.5rem,3.5vw,2.2rem)] leading-tight text-ink">
          Nothing logged yet
        </h2>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
          Start with a single HTML file or a small JSX component. The workbench
          keeps the file list, code, preview, and sharing controls together.
        </p>
        <Link href="/new" className="btn-sea mt-7">
          <Plus className="h-4 w-4" />
          Create first artifact
        </Link>
      </div>
    </div>
  );
}
