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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm">
      <div className="riso-card-pop w-[min(30rem,100%)] p-6">
        <h2 className="display text-lg text-ink">Pick the entry file</h2>
        <p className="mt-1 text-xs text-ink-mute">
          {pending.candidates.length}{" "}
          {pending.kind === "jsx" ? "JSX/TSX" : "HTML"} files were found. The one
          you pick runs first in the preview.
        </p>
        {error && (
          <div className="mt-3 rounded-lg border-[1.5px] border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
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
                className="group flex w-full items-center gap-2 rounded-lg border-[1.5px] border-ink/25 bg-paper-soft px-3 py-2 text-left text-sm transition-colors hover:border-ink hover:bg-orange/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileCode2 className="h-3.5 w-3.5 shrink-0 text-cobalt" />
                <span className="code-font min-w-0 flex-1 truncate text-ink">
                  {f.name}
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-mute transition-colors group-hover:text-orange-deep" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-md px-2 py-1 text-ink-mute transition-colors hover:bg-paper-deep hover:text-ink disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onPick(null)}
            disabled={busy}
            className="rounded-md px-2 py-1 font-semibold text-ink-mute transition-colors hover:bg-paper-deep hover:text-ink disabled:opacity-60"
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
