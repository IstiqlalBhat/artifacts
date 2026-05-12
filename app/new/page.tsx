import { Header } from "@/components/Header";
import { CreateArtifactView } from "@/components/CreateArtifactView";

export default function NewArtifactPage() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 min-h-0">
        <CreateArtifactView />
      </main>
    </div>
  );
}
