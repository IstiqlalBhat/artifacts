"use client";

import { FolderPlus, Loader2 } from "lucide-react";
import { useFolderImport } from "@/lib/useFolderImport";
import { EntryPicker } from "@/components/EntryPicker";

export function DashboardDropZone({ children }: { children: React.ReactNode }) {
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

  return (
    <div {...dragProps} className="flex flex-1 flex-col">
      {children}

      {(hover || (busy && !pending)) && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex max-w-md flex-col items-center gap-3 rounded-lg border-2 border-dashed border-accent bg-card px-8 py-10 text-center shadow-xl shadow-primary/10">
            {busy ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="text-sm font-medium">Reading files...</p>
              </>
            ) : (
              <>
                <FolderPlus className="h-8 w-8 text-accent" />
                <p className="text-base font-semibold">
                  Drop to start a new artifact
                </p>
                <p className="text-xs text-muted-foreground">
                  Folder name suggests the title. HTML, CSS, JS, JSX, TS, TSX,
                  and images are imported with their relative paths. You&apos;ll
                  add a description before saving.
                </p>
              </>
            )}
          </div>
        </div>
      )}

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
