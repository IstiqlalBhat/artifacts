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
import { buttonStyles } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

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
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <DashboardDropZone>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mono-label mb-3 flex items-center gap-2 text-cobalt">
                <Library className="h-4 w-4" />
                My Library
              </p>
              <h1 className="display offset-head text-[clamp(2.25rem,6vw,3.5rem)] leading-[0.95] text-ink">
                Your artifacts
              </h1>
              <p className="mt-3 max-w-2xl text-[0.97rem] leading-relaxed text-ink-soft">
                Review drafts, reopen a workbench, or copy a shareable
                prototype. Drop a folder anywhere on this page to import it as a
                new artifact.
              </p>
            </div>
            <Link href="/new" className="btn-cobalt shrink-0">
              <Plus className="h-4 w-4" />
              New artifact
            </Link>
          </div>

          <div className="riso-card mb-8 grid grid-cols-2 overflow-hidden p-0 sm:grid-cols-4">
            <Stat label="Artifacts" value={artifacts.length.toString()} />
            <Stat label="Files stored" value={fileCount.toString()} />
            <Stat label="Public links" value={sharedCount.toString()} />
            <Stat label="In SVS Directory" value={directoryCount.toString()} />
          </div>

          {error && (
            <div className="mb-6 rounded-lg border-[1.5px] border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
              {error.message}. Run the SQL migration in{" "}
              <code className="code-font">supabase/migrations/</code>.
            </div>
          )}

          {artifacts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="riso-card overflow-hidden p-0">
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b-[1.5px] border-ink/12 bg-paper-deep/50 px-4 py-3 sm:grid-cols-[1fr_8rem_8rem_8rem_4rem_4rem]">
                <span className="mono-label">Artifact</span>
                <span className="mono-label hidden sm:block">Updated</span>
                <span className="mono-label hidden sm:block">Sharing</span>
                <span className="mono-label hidden sm:block">Directory</span>
                <span className="mono-label hidden text-center sm:block">Del</span>
                <span className="mono-label text-right">Open</span>
              </div>
              <div className="divide-y divide-ink/10">
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
    <div className="border-b-[1.5px] border-ink/10 px-5 py-5 sm:border-b-0 sm:border-r-[1.5px] sm:last:border-r-0">
      <div className="display text-[2rem] leading-none text-ink">{value}</div>
      <div className="mono-label mt-2">{label}</div>
    </div>
  );
}

function ArtifactRow({ artifact }: { artifact: Row }) {
  const fileNames = artifact.files.map((file) => file.name).slice(0, 4);
  const more = artifact.files.length - fileNames.length;

  return (
    <div className="group relative grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-orange/[0.06] sm:grid-cols-[1fr_8rem_8rem_8rem_4rem_4rem]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink bg-cobalt text-paper-soft shadow-[2px_2px_0_var(--ink)] transition-transform group-hover:-translate-y-0.5">
          <FileCode2 className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold text-ink group-hover:text-cobalt">
            {artifact.title}
          </span>
          {artifact.description ? (
            <span className="mt-0.5 block truncate text-xs text-ink-mute">
              {artifact.description}
            </span>
          ) : null}
          <span className="mt-0.5 block truncate code-font text-xs text-ink-mute">
            {fileNames.join(" / ")}
            {more > 0 ? ` / +${more}` : ""}
          </span>
        </span>
      </div>
      <span className="hidden items-center gap-1.5 text-sm text-ink-mute sm:flex">
        <Clock3 className="h-3.5 w-3.5" />
        {formatDate(artifact.updated_at)}
      </span>
      <span className="hidden sm:block">
        {artifact.share_token ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-ink bg-orange/15 px-2 py-1 text-xs font-semibold text-orange-deep">
            <Globe className="h-3.5 w-3.5" />
            Shared
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-ink/25 bg-paper px-2 py-1 text-xs font-semibold text-ink-mute">
            <Lock className="h-3.5 w-3.5" />
            Private
          </span>
        )}
      </span>
      <span className="hidden sm:block">
        <DirectoryToggle
          id={artifact.id}
          initial={artifact.in_directory}
          title={artifact.title}
        />
      </span>
      <span className="hidden justify-center sm:flex">
        <DeleteArtifactButton id={artifact.id} title={artifact.title} />
      </span>
      <span className="flex justify-end text-ink-mute transition-all group-hover:translate-x-0.5 group-hover:text-cobalt">
        <ArrowRight className="h-4 w-4" />
      </span>
      <Link
        href={`/a/${artifact.id}`}
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
        <span className="chip mb-4">
          <Plus className="h-3 w-3 text-orange" />
          empty press
        </span>
        <h2 className="display text-[clamp(1.5rem,3.5vw,2.25rem)] leading-tight text-ink">
          No artifacts yet
        </h2>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
          Start with a single HTML file or a small JSX component. The workbench
          keeps the file list, code, preview, and sharing controls together.
        </p>
        <Link href="/new" className="btn-cobalt mt-7">
          <Plus className="h-4 w-4" />
          Create first artifact
        </Link>
      </div>
    </div>
  );
}
