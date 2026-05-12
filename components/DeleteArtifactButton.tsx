"use client";

import { useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { deleteArtifact } from "@/lib/artifacts";

export function DeleteArtifactButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div
        className="relative z-10 flex items-center gap-1"
        onClick={(event) => event.stopPropagation()}
      >
        <form action={deleteArtifact}>
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            aria-label={`Confirm delete ${title}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-destructive/30 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
          >
            <Check className="h-4 w-4" />
          </button>
        </form>
        <button
          type="button"
          aria-label="Cancel delete"
          onClick={() => setConfirming(false)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Delete ${title}`}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        setConfirming(true);
      }}
      className="relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
