"use client";

import { FileCode2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArtifactFile } from "@/lib/renderer";

export function FileList({
  files,
  entry,
  onSelect,
  onRemove,
  onSetEntry,
  activeName,
}: {
  files: ArtifactFile[];
  entry: string | null;
  onSelect: (name: string) => void;
  onRemove: (name: string) => void;
  onSetEntry: (name: string) => void;
  activeName?: string;
}) {
  if (!files.length) {
    return (
      <p className="px-3 py-6 text-center text-xs text-ink-mute">
        No files yet.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-1 p-2">
      {files.map((f) => (
        <li
          key={f.name}
          className={cn(
            "group flex items-center gap-1 rounded-lg text-sm transition-colors",
            activeName === f.name
              ? "border border-sea/25 bg-shell-bright text-ink shadow-[0_2px_6px_-4px_rgba(22,90,91,0.4)]"
              : "border border-transparent text-ink-mute hover:bg-shell-bright/70",
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(f.name)}
            className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-left"
          >
            <FileCode2
              className={cn(
                "h-4 w-4 shrink-0",
                activeName === f.name ? "text-sea" : "opacity-60",
              )}
            />
            <span className="flex-1 truncate code-font text-xs">{f.name}</span>
          </button>
          <button
            type="button"
            onClick={() => onSetEntry(f.name)}
            className={cn(
              "mr-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-opacity",
              entry === f.name
                ? "border border-amber/60 bg-sand/35 text-amber-deep"
                : "opacity-0 group-hover:opacity-100 hover:bg-shell-deep",
            )}
            title="Use as entry"
          >
            {entry === f.name ? "Entry" : "Set"}
          </button>
          <button
            type="button"
            onClick={() => onRemove(f.name)}
            className="mr-1 rounded-full p-1 opacity-0 transition-opacity hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
            aria-label={`Remove ${f.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
