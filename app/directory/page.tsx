import Link from "next/link";
import { ArrowRight, Clock3, FileCode2, Library, User } from "lucide-react";
import { Header } from "@/components/Header";
import { DirectoryCopyButton } from "@/components/DirectoryCopyButton";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/directory");

  const { data, error } = await supabase
    .from("artifacts")
    .select(
      "id, title, description, kind, owner_email, updated_at, share_token",
    )
    .eq("in_directory", true)
    .order("updated_at", { ascending: false });

  const artifacts = (data ?? []) as Row[];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-accent">
            <Library className="h-4 w-4" />
            SVS Directory
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Shared with the org
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Artifacts other people have published to the directory. Open any
            one to view it read-only.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error.message}
          </div>
        )}

        {artifacts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm shadow-primary/5">
            <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-border bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground sm:grid-cols-[1fr_12rem_9rem_6rem_4rem]">
              <span>Artifact</span>
              <span className="hidden sm:block">Author</span>
              <span className="hidden sm:block">Updated</span>
              <span className="hidden sm:block">Public URL</span>
              <span className="text-right">Open</span>
            </div>
            <div className="divide-y divide-border">
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
    <div className="group relative grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50 sm:grid-cols-[1fr_12rem_9rem_6rem_4rem]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-background text-accent">
          <FileCode2 className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium group-hover:text-accent">
            {artifact.title}
          </span>
          {artifact.description ? (
            <span className="mt-1 block truncate text-sm text-foreground/80">
              {artifact.description}
            </span>
          ) : null}
        </span>
      </div>
      <span className="hidden items-center gap-1.5 truncate text-sm text-muted-foreground sm:flex">
        <User className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{artifact.owner_email ?? "Unknown"}</span>
      </span>
      <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
        <Clock3 className="h-3.5 w-3.5" />
        {formatDate(artifact.updated_at)}
      </span>
      <span className="hidden sm:flex">
        <DirectoryCopyButton
          shareToken={artifact.share_token}
          title={artifact.title}
        />
      </span>
      <span className="flex justify-end text-muted-foreground transition-colors group-hover:text-foreground">
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
    <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-card p-10">
      <div className="relative max-w-xl">
        <h2 className="text-xl font-semibold">Nothing in the directory yet</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          When someone checks the SVS Directory box on one of their
          artifacts, it&apos;ll show up here for everyone signed in.
        </p>
      </div>
    </div>
  );
}
