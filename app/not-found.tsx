import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-shell px-6 py-12 text-center">
      <div className="contour contour-fade" aria-hidden="true" />
      <div className="grain-soft" aria-hidden="true" />
      <span
        className="sun-rays absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 opacity-25"
        aria-hidden="true"
      />

      <Link
        href="/"
        className="group relative z-10 mb-8 flex items-center gap-2.5"
      >
        <BrandMark className="transition-transform duration-300 group-hover:-rotate-6" />
        <span className="script text-[1.35rem] text-teal">Artifacts</span>
      </Link>
      <p className="display relative z-10 text-xs font-semibold uppercase tracking-[0.3em] text-sun-deep">
        Error 404
      </p>
      <h1 className="script relative z-10 mt-4 text-[clamp(2.8rem,9vw,5rem)] leading-[1.05] text-teal">
        Uncharted waters
      </h1>
      <p className="relative z-10 mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
        This artifact may have been deleted, made private, or the link is
        wrong. Double-check the URL you were sent.
      </p>
      <Link href="/" className="btn-sea relative z-10 mt-8">
        Back to shore
      </Link>
    </div>
  );
}
