import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A print-proof mount for live previews: a cream mat with corner registration
 * brackets, an optional caption bar, and the rendered artifact pinned behind
 * an inked screen border. Presentational only — safe in server or client trees.
 */
export function PreviewFrame({
  label,
  live = false,
  children,
  className,
  screenClassName,
}: {
  label?: ReactNode;
  live?: boolean;
  children: ReactNode;
  className?: string;
  screenClassName?: string;
}) {
  return (
    <div className={cn("proof", className)}>
      <span className="crop crop-tl" aria-hidden="true" />
      <span className="crop crop-tr" aria-hidden="true" />
      <span className="crop crop-bl" aria-hidden="true" />
      <span className="crop crop-br" aria-hidden="true" />

      {(label || live) && (
        <div className="proof-bar">
          <span className="mono-label truncate">{label}</span>
          {live && (
            <span className="mono-label flex shrink-0 items-center gap-1.5 text-cobalt">
              <span className="live-dot" aria-hidden="true" />
              live
            </span>
          )}
        </div>
      )}

      <div className={cn("proof-screen", screenClassName)}>{children}</div>
    </div>
  );
}
