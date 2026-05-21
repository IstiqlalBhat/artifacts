"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Globe2, Loader2 } from "lucide-react";
import { toggleDirectory } from "@/lib/artifacts";
import { cn } from "@/lib/utils";

export function DirectoryToggle({
  id,
  initial,
  title,
}: {
  id: string;
  initial: boolean;
  title: string;
}) {
  const [checked, setChecked] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onChange = (next: boolean) => {
    setError(null);
    setChecked(next);
    startTransition(async () => {
      const res = await toggleDirectory(id, next);
      if ("error" in res && res.error) {
        setChecked(!next);
        setError(res.error);
      }
    });
  };

  return (
    <label
      className="relative z-10 inline-flex items-center gap-1.5 text-xs"
      onClick={(event) => event.stopPropagation()}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={(event) => onChange(event.target.checked)}
        aria-label={`${checked ? "Remove" : "Add"} ${title} ${checked ? "from" : "to"} the SVS Directory`}
        aria-invalid={error ? true : undefined}
        className="h-4 w-4 cursor-pointer accent-accent disabled:cursor-not-allowed"
      />
      <span
        className={cn(
          "inline-flex items-center gap-1 font-medium transition-colors",
          error
            ? "text-destructive"
            : checked
              ? "text-accent"
              : "text-muted-foreground",
        )}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : error ? (
          <AlertCircle className="h-3.5 w-3.5" />
        ) : (
          <Globe2 className="h-3.5 w-3.5" />
        )}
        {error ? (
          <span role="alert" title={error}>
            Failed
          </span>
        ) : (
          "SVS Directory"
        )}
      </span>
    </label>
  );
}
