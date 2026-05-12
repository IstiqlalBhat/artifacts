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
import { createClient } from "@/lib/supabase/server";

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
  const supabase = await createClient();
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
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4 text-sm">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <SquareDashedMousePointer className="h-4 w-4 text-accent" />
          <span>Artifacts</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="truncate font-medium" title={data.title}>
            {data.title}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {data.kind}
          </span>
        </div>
        <Link
          href="/signup"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Make your own →
        </Link>
      </header>
      <main className="flex-1 min-h-0 bg-white">
        <ArtifactRenderer doc={doc} title={data.title} />
      </main>
    </div>
  );
}
