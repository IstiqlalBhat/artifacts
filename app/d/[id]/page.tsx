import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import { Header } from "@/components/Header";
import { ArtifactRenderer } from "@/components/ArtifactRenderer";
import {
  buildArtifactDocument,
  type ArtifactFile,
  type ArtifactKind,
} from "@/lib/renderer";
import { requireUser } from "@/lib/auth";
import { supabaseData } from "@/lib/supabase/data";

type Params = Promise<{ id: string }>;

export default async function DirectoryArtifactPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const user = await requireUser(`/d/${id}`);
  const supabase = supabaseData();

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
    <div className="flex h-screen flex-col bg-paper">
      <Header />
      <div className="border-b-[1.5px] border-ink/12 bg-paper-deep/40 px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3">
          <Link
            href="/directory"
            className="code-font inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.15em] text-ink-mute transition-colors hover:text-cobalt"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            SVS Directory
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold text-ink">
              {data.title}
            </h1>
            {data.description ? (
              <p className="truncate text-xs text-ink-mute">
                {data.description}
              </p>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-mute">
            <User className="h-3.5 w-3.5" />
            {data.owner_email ?? "Unknown"}
          </span>
          <span className="chip">{data.kind}</span>
        </div>
      </div>
      <main className="min-h-0 flex-1 bg-white">
        <ArtifactRenderer doc={doc} title={data.title} />
      </main>
    </div>
  );
}
