import { Header } from "@/components/Header";
import { ArtifactEditor } from "@/components/ArtifactEditor";

export default function NewArtifactPage() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 min-h-0">
        <ArtifactEditor mode="new" />
      </main>
    </div>
  );
}
