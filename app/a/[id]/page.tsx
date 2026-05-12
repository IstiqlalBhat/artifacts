import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { ArtifactEditor } from "@/components/ArtifactEditor";
import { ShareBar } from "@/components/ShareBar";
import { createClient } from "@/lib/supabase/server";
import type { ArtifactFile, ArtifactKind } from "@/lib/renderer";

type Params = Promise<{ id: string }>;

export default async function ArtifactPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/a/${id}`);

  const { data, error } = await supabase
    .from("artifacts")
    .select("id, title, kind, files, entry, share_token, owner")
    .eq("id", id)
    .single();

  if (error || !data) notFound();
  if (data.owner !== user.id) notFound();

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <ShareBar
        artifactId={data.id}
        initialShareToken={data.share_token as string | null}
      />
      <main className="flex-1 min-h-0">
        <ArtifactEditor
          mode="edit"
          initial={{
            id: data.id,
            title: data.title,
            kind: data.kind as ArtifactKind,
            files: data.files as ArtifactFile[],
            entry: data.entry,
          }}
        />
      </main>
    </div>
  );
}
