"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
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

  const onToggle = () => {
    if (pending) return;
    const next = !checked;
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
    <span
      className="relative z-10 inline-flex items-center gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={pending}
        onClick={(event) => {
          event.preventDefault();
          onToggle();
        }}
        aria-label={`${checked ? "Remove" : "Add"} ${title} ${checked ? "from" : "to"} the SVS Directory`}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked
            ? "border-sea-deep bg-sea"
            : "border-sea/30 bg-shell-deep",
          pending && "opacity-60",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-shell-bright shadow transition-transform duration-200",
            checked && "translate-x-4",
          )}
        >
          {pending && (
            <Loader2 className="h-2.5 w-2.5 animate-spin text-sea" />
          )}
        </span>
      </button>
      <span
        className={cn(
          "hidden items-center gap-1 text-xs font-semibold sm:inline-flex",
          error ? "text-destructive" : checked ? "text-sea-deep" : "text-ink-mute",
        )}
      >
        {error ? (
          <>
            <AlertCircle className="h-3.5 w-3.5" />
            <span role="alert" title={error}>
              Failed
            </span>
          </>
        ) : checked ? (
          "Listed"
        ) : (
          "Off"
        )}
      </span>
    </span>
  );
}
