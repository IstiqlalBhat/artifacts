"use client";

import { ArrowRight, FileCode2, Loader2 } from "lucide-react";
import type { Pending } from "@/lib/useFolderImport";

type Props = {
  pending: Pending;
  busy: boolean;
  error: string | null;
  onPick: (entry: string | null) => void;
  onCancel: () => void;
};

export function EntryPicker({ pending, busy, error, onPick, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-abyss/40 p-4 backdrop-blur-sm">
      <div className="plate w-[min(30rem,100%)] p-6">
        <p className="mono-label mb-2">Chart the course</p>
        <h2 className="display text-xl text-ink">Pick the entry file</h2>
        <p className="mt-1.5 text-xs text-ink-mute">
          {pending.candidates.length}{" "}
          {pending.kind === "jsx" ? "JSX/TSX" : "HTML"} files were found. The
          one you pick runs first in the preview.
        </p>
        {error && (
          <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
        <ul className="scroll-thin mt-4 max-h-64 space-y-1.5 overflow-auto pr-1">
          {pending.candidates.map((f) => (
            <li key={f.name}>
              <button
                type="button"
                onClick={() => onPick(f.name)}
                disabled={busy}
                className="group flex w-full items-center gap-2.5 rounded-xl border border-sea/25 bg-shell px-3 py-2.5 text-left text-sm transition-colors hover:border-amber/60 hover:bg-sand/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileCode2 className="h-3.5 w-3.5 shrink-0 text-sea" />
                <span className="code-font min-w-0 flex-1 truncate text-ink">
                  {f.name}
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-mute transition-all group-hover:translate-x-0.5 group-hover:text-amber-deep" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full px-3 py-1.5 text-ink-mute transition-colors hover:bg-shell-deep hover:text-ink disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onPick(null)}
            disabled={busy}
            className="rounded-full px-3 py-1.5 font-semibold text-sea-deep transition-colors hover:bg-sea/10 disabled:opacity-60"
          >
            {busy ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving…
              </span>
            ) : (
              "Decide later"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
