import Link from "next/link";
import { SquareDashedMousePointer } from "lucide-react";

export default function NotFound() {
  return (
    <div className="riso-canvas relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12 text-center">
      <div className="halftone halftone-fade" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Link
        href="/"
        className="group relative z-10 mb-8 flex items-center gap-2.5"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-ink bg-cobalt text-paper-soft shadow-[2px_2px_0_var(--ink)] transition-transform group-hover:-translate-y-0.5">
          <SquareDashedMousePointer className="h-4 w-4" />
        </span>
        <span className="display text-[1.15rem] text-ink">Artifacts</span>
      </Link>
      <p className="relative z-10 code-font text-xs uppercase tracking-[0.3em] text-orange-deep">
        404
      </p>
      <h1 className="display offset-head relative z-10 mt-3 text-[clamp(2.5rem,9vw,4.5rem)] leading-[0.95] text-ink">
        Not found
      </h1>
      <p className="relative z-10 mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
        This artifact may have been deleted, made private, or the link is wrong.
        Double-check the URL you were sent.
      </p>
      <Link href="/" className="btn-cobalt relative z-10 mt-8">
        Back home
      </Link>
    </div>
  );
}
