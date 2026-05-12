"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function ArtifactRenderer({
  doc,
  className,
  title = "Artifact preview",
}: {
  doc: string;
  className?: string;
  title?: string;
}) {
  const [loading, setLoading] = useState(true);
  // Memoize the srcdoc so React doesn't keep replacing the iframe content
  // on each re-render of the parent.
  const srcDoc = useMemo(() => doc, [doc]);

  return (
    <div className={cn("relative h-full w-full bg-white", className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
      )}
      <iframe
        title={title}
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-forms allow-popups allow-modals"
        referrerPolicy="no-referrer"
        className="h-full w-full border-0"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
}
