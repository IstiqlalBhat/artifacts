import { Header } from "@/components/Header";
import { CreateArtifactView } from "@/components/CreateArtifactView";
import { requireUser } from "@/lib/auth";

export default async function NewArtifactPage() {
  await requireUser("/new");
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 min-h-0">
        <CreateArtifactView />
      </main>
    </div>
  );
}
