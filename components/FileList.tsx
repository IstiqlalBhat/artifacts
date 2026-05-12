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
      <p className="px-3 py-6 text-center text-xs text-muted-foreground">
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
            "group flex items-center gap-1 rounded-md text-sm",
            activeName === f.name
              ? "bg-card text-foreground shadow-sm shadow-primary/5"
              : "text-muted-foreground hover:bg-card/60",
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(f.name)}
            className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left"
          >
            <FileCode2 className="h-4 w-4 shrink-0 opacity-70" />
            <span className="flex-1 truncate code-font text-xs">{f.name}</span>
          </button>
          <button
            type="button"
            onClick={() => onSetEntry(f.name)}
            className={cn(
              "mr-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-opacity",
              entry === f.name
                ? "bg-accent text-accent-foreground"
                : "opacity-0 group-hover:opacity-100 hover:bg-muted",
            )}
            title="Use as entry"
          >
            {entry === f.name ? "Entry" : "Set"}
          </button>
          <button
            type="button"
            onClick={() => onRemove(f.name)}
            className="mr-1 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
            aria-label={`Remove ${f.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}
