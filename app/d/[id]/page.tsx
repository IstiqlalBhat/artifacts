import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import { Header } from "@/components/Header";
import { ArtifactRenderer } from "@/components/ArtifactRenderer";
import {
  buildArtifactDocument,
  type ArtifactFile,
  type ArtifactKind,
} from "@/lib/renderer";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export default async function DirectoryArtifactPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/d/${id}`);

  const { data, error } = await supabase
    .from("artifacts")
    .select(
      "id, title, description, kind, files, entry, owner_email, in_directory, owner",
    )
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  if (!data.in_directory && data.owner !== user.id) notFound();

  const doc = buildArtifactDocument({
    kind: data.kind as ArtifactKind,
    files: data.files as ArtifactFile[],
    entry: data.entry,
  });

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="border-b border-border bg-card/95 px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3">
          <Link
            href="/directory"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Directory
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold">{data.title}</h1>
            {data.description ? (
              <p className="truncate text-xs text-muted-foreground">
                {data.description}
              </p>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            {data.owner_email ?? "Unknown"}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {data.kind}
          </span>
        </div>
      </div>
      <main className="flex-1 min-h-0 bg-white">
        <ArtifactRenderer doc={doc} title={data.title} />
      </main>
    </div>
  );
}
