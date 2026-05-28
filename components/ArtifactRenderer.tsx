"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const LOAD_FALLBACK_MS = 8000;

function documentKey(doc: string) {
  let hash = 0;
  for (let i = 0; i < doc.length; i += 1) {
    hash = Math.imul(31, hash) + doc.charCodeAt(i);
  }
  return `${doc.length}:${hash >>> 0}`;
}

export function ArtifactRenderer({
  doc,
  className,
  title = "Artifact preview",
}: {
  doc: string;
  className?: string;
  title?: string;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [loadedFrame, setLoadedFrame] = useState<string | null>(null);
  // Memoize the srcdoc so React doesn't keep replacing the iframe content
  // on each re-render of the parent.
  const srcDoc = useMemo(() => doc, [doc]);
  const srcDocKey = useMemo(() => documentKey(srcDoc), [srcDoc]);
  const frameKey = `${hydrated ? "client" : "server"}:${srcDocKey}`;
  const loading = loadedFrame !== frameKey;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setHydrated(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoadedFrame(frameKey);
    }, LOAD_FALLBACK_MS);

    return () => window.clearTimeout(timeout);
  }, [frameKey]);

  return (
    <div className={cn("relative h-full w-full bg-card", className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/85 backdrop-blur-sm">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
      )}
      <iframe
        key={frameKey}
        title={title}
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-forms allow-popups allow-modals"
        referrerPolicy="no-referrer"
        className="h-full w-full border-0"
        onError={() => setLoadedFrame(frameKey)}
        onLoad={() => setLoadedFrame(frameKey)}
      />
    </div>
  );
}
