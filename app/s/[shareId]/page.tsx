import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SquareDashedMousePointer } from "lucide-react";
import { ArtifactRenderer } from "@/components/ArtifactRenderer";
import {
  buildArtifactDocument,
  type ArtifactFile,
  type ArtifactKind,
} from "@/lib/renderer";
import { supabaseData } from "@/lib/supabase/data";

type Params = Promise<{ shareId: string }>;

// Cache rendered share pages for an hour. Invalidated immediately when the
// owner edits or unshares the artifact via revalidatePath in server actions.
export const revalidate = 3600;

type Row = {
  id: string;
  title: string;
  kind: ArtifactKind;
  files: ArtifactFile[];
  entry: string | null;
};

async function fetchShared(shareId: string): Promise<Row | null> {
  const supabase = supabaseData();
  const { data, error } = await supabase
    .from("artifacts")
    .select("id, title, kind, files, entry")
    .eq("share_token", shareId)
    .maybeSingle();
  if (error || !data) return null;
  return data as Row;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { shareId } = await params;
  const data = await fetchShared(shareId);
  if (!data) return { title: "Artifact not found" };
  const title = `${data.title} - Artifact`;
  const description = `A live ${data.kind === "jsx" ? "JSX" : "HTML"} artifact, rendered in a sandbox.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: false },
  };
}

export default async function SharePage({ params }: { params: Params }) {
  const { shareId } = await params;
  const data = await fetchShared(shareId);
  if (!data) notFound();

  const doc = buildArtifactDocument({
    kind: data.kind,
    files: data.files,
    entry: data.entry,
  });

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="flex h-14 items-center justify-between gap-3 border-b-[1.5px] border-ink/15 bg-paper px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border-[1.5px] border-ink bg-cobalt text-paper-soft shadow-[2px_2px_0_var(--ink)] transition-transform group-hover:-translate-y-0.5">
            <SquareDashedMousePointer className="h-4 w-4" />
          </span>
          <span className="display text-base text-ink">Artifacts</span>
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-sm font-semibold text-ink" title={data.title}>
            {data.title}
          </span>
          <span className="chip shrink-0">{data.kind}</span>
        </div>
        <Link
          href="/"
          className="code-font shrink-0 text-[0.7rem] uppercase tracking-[0.15em] text-ink-mute transition-colors hover:text-cobalt"
        >
          Make your own →
        </Link>
      </header>
      <main className="min-h-0 flex-1 bg-white">
        <ArtifactRenderer doc={doc} title={data.title} />
      </main>
    </div>
  );
}
