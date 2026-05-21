"use client";

import { useEffect, useState } from "react";
import { FilePlus2, FolderPlus, Loader2, Sparkles } from "lucide-react";
import { ArtifactEditor } from "@/components/ArtifactEditor";
import { EntryPicker } from "@/components/EntryPicker";
import { useFolderImport } from "@/lib/useFolderImport";
import {
  useImportStaging,
  type ImportStaging,
} from "@/components/ImportStagingProvider";
import { cn } from "@/lib/utils";

export function CreateArtifactView() {
  const [showBlank, setShowBlank] = useState(false);
  const { staging, clearStaging } = useImportStaging();
  const [imported, setImported] = useState<ImportStaging | null>(() => staging);
  useEffect(() => {
    if (staging) {
      setImported((prev) => prev ?? staging);
      clearStaging();
    }
  }, [staging, clearStaging]);

  const {
    hover,
    busy,
    pending,
    error,
    dragProps,
    confirmEntry,
    cancelPending,
    clearError,
  } = useFolderImport();

  if (imported) {
    return (
      <ArtifactEditor
        mode="new"
        initial={{
          title: imported.suggestedTitle ?? "",
          description: "",
          kind: imported.kind,
          files: imported.files,
          entry: imported.entry,
          inDirectory: false,
        }}
      />
    );
  }

  if (showBlank) {
    return <ArtifactEditor mode="new" />;
  }

  return (
    <div
      {...dragProps}
      className="relative flex h-full flex-col items-center justify-center bg-muted/30 px-4 py-10"
    >
      <div
        className={cn(
          "relative w-full max-w-2xl rounded-2xl border-2 border-dashed p-10 text-center transition-colors sm:p-14",
          hover
            ? "border-accent bg-accent/10"
            : "border-border bg-card shadow-sm shadow-primary/5",
        )}
      >
        {busy && !pending ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <p className="text-base font-semibold">Reading files...</p>
            <p className="text-xs text-muted-foreground">
              Opening the editor so you can title and describe it.
            </p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "mx-auto flex h-16 w-16 items-center justify-center rounded-full border transition-colors",
                hover
                  ? "border-accent/60 bg-accent/20 text-accent"
                  : "border-accent/30 bg-accent/10 text-accent",
              )}
            >
              <FolderPlus className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold sm:text-3xl">
              {hover ? "Drop it" : "Drop a folder to start"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Drag a folder (or loose files) from Finder onto this page. We
              keep the structure, pick the entry file, and open the workbench
              automatically.
            </p>
            <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">
              HTML, CSS, JS, JSX, TS, TSX, and images (PNG, JPG, GIF, WEBP,
              SVG, AVIF, ICO, BMP) are imported. Up to 80 files, 6 MB total.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowBlank(true)}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm shadow-primary/5 transition-colors hover:bg-muted"
              >
                <FilePlus2 className="h-4 w-4" />
                Start with a blank workbench
              </button>
            </div>
          </>
        )}
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-accent" />
        Tip: drop an <code className="code-font">index.html</code> next to{" "}
        <code className="code-font">style.css</code> and{" "}
        <code className="code-font">app.js</code> for instant preview.
      </p>

      {pending && (
        <EntryPicker
          pending={pending}
          busy={busy}
          error={error}
          onPick={confirmEntry}
          onCancel={cancelPending}
        />
      )}

      {error && !busy && !pending && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="text-destructive/70 transition-colors hover:text-destructive"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
