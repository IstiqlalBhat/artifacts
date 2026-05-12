import Link from "next/link";
import { SquareDashedMousePointer } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 text-sm font-semibold"
      >
        <SquareDashedMousePointer className="h-5 w-5 text-accent" />
        Artifacts
      </Link>
      <p className="code-font text-xs uppercase tracking-[0.3em] text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        Not found
      </h1>
      <p className="mt-3 max-w-sm text-sm text-muted-foreground">
        This artifact may have been deleted, made private, or the link is
        wrong. Double-check the URL you were sent.
      </p>
      <Link
        href="/"
        className="mt-8 text-sm text-accent hover:underline"
      >
        Back home →
      </Link>
    </div>
  );
}
