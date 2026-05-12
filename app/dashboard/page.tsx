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
    .select("id, title, kind, files, share_token, updated_at")
    .order("updated_at", { ascending: false });

  const artifacts = (data ?? []) as Row[];
  const sharedCount = artifacts.filter((artifact) => artifact.share_token).length;
  const fileCount = artifacts.reduce(
    (total, artifact) => total + artifact.files.length,
    0,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <DashboardDropZone>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-accent">
                <Library className="h-4 w-4" />
                Library
              </p>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                Your artifacts
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Review drafts, reopen a workbench, or copy a shareable prototype.
                Drop a folder anywhere on this page to import it as a new
                artifact.
              </p>
            </div>
            <Link href="/new" className={buttonStyles({ size: "lg" })}>
              <Plus className="h-4 w-4" />
              New artifact
            </Link>
          </div>

          <div className="mb-8 grid border-y border-border sm:grid-cols-3">
            <Stat label="Artifacts" value={artifacts.length.toString()} />
            <Stat label="Files stored" value={fileCount.toString()} />
            <Stat label="Public links" value={sharedCount.toString()} />
          </div>

          {error && (
            <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error.message}. Run the SQL migration in{" "}
              <code className="code-font">supabase/migrations/</code>.
            </div>
          )}

          {artifacts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm shadow-primary/5">
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-border bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground sm:grid-cols-[1fr_9rem_9rem_7rem]">
                <span>Artifact</span>
                <span className="hidden sm:block">Updated</span>
                <span className="hidden sm:block">Sharing</span>
                <span className="text-right">Open</span>
              </div>
              <div className="divide-y divide-border">
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
    <div className="px-0 py-5 sm:border-r sm:border-border sm:px-5 sm:last:border-r-0">
      <div className="text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function ArtifactRow({ artifact }: { artifact: Row }) {
  const fileNames = artifact.files.map((file) => file.name).slice(0, 4);
  const more = artifact.files.length - fileNames.length;

  return (
    <Link
      href={`/a/${artifact.id}`}
      className="group grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50 sm:grid-cols-[1fr_9rem_9rem_7rem]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-background text-accent">
          <FileCode2 className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium group-hover:text-accent">
            {artifact.title}
          </span>
          <span className="mt-1 block truncate code-font text-xs text-muted-foreground">
            {fileNames.join(" / ")}
            {more > 0 ? ` / +${more}` : ""}
          </span>
        </span>
      </div>
      <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
        <Clock3 className="h-3.5 w-3.5" />
        {formatDate(artifact.updated_at)}
      </span>
      <span className="hidden sm:block">
        {artifact.share_token ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
            <Globe className="h-3.5 w-3.5" />
            Shared
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Private
          </span>
        )}
      </span>
      <span className="flex justify-end text-muted-foreground transition-colors group-hover:text-foreground">
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-card p-10">
      <div className="absolute inset-0 bg-dots opacity-55" />
      <div className="relative max-w-xl">
        <h2 className="text-xl font-semibold">No artifacts yet</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Start with a single HTML file or a small JSX component. The workbench
          will keep the file list, code, preview, and sharing controls together.
        </p>
        <Link href="/new" className={buttonStyles({ size: "lg", className: "mt-6" })}>
          <Plus className="h-4 w-4" />
          Create first artifact
        </Link>
      </div>
    </div>
  );
}
