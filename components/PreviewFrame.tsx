import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A vintage-postcard mount for live previews: warm card stock with a
 * dashed inner rule, a sand postage stamp, and a Sarasota postmark whose
 * cancellation waves strike through it. "Send the running thing" — as a
 * postcard. Presentational only — safe in server or client trees.
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
    <div className={cn("postcard", className)}>
      <div className="relative z-10 mb-2 flex items-start justify-between gap-3 px-1.5 pt-1">
        <div className="pt-1.5">
          {label && (
            <p className="display text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-sepia/85">
              {label}
            </p>
          )}
          {live && (
            <p className="display mt-1.5 inline-flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-rust">
              <span className="live-dot" aria-hidden="true" />
              live
            </p>
          )}
        </div>

        {/* stamp + postmark */}
        <div className="relative mr-1 shrink-0" aria-hidden="true">
          <span className="stamp">
            <span className="stamp-inner">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path d="M7.5 14.4a4.5 4.5 0 0 1 9 0Z" fill="currentColor" />
                <g
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                >
                  <path d="M12 5.6v2" />
                  <path d="M6.9 7.7l1.4 1.4" />
                  <path d="M17.1 7.7l-1.4 1.4" />
                  <path d="M4.5 17.4c1.9 0 1.9 1.2 3.75 1.2s1.9-1.2 3.75-1.2 1.9 1.2 3.75 1.2 1.9-1.2 3.75-1.2" />
                </g>
              </svg>
            </span>
          </span>
          <Postmark className="absolute -left-14 -top-1.5 h-[4.4rem] w-24 text-teal/70" />
        </div>
      </div>

      <div className={cn("postcard-screen", screenClassName)}>{children}</div>
    </div>
  );
}

function Postmark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 64" fill="none" className={className}>
      {/* cancellation waves striking the stamp */}
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M2 22c5 0 5 3.4 10 3.4s5-3.4 10-3.4 5 3.4 10 3.4 5-3.4 10-3.4" />
        <path d="M2 32c5 0 5 3.4 10 3.4s5-3.4 10-3.4 5 3.4 10 3.4 5-3.4 10-3.4" />
        <path d="M2 42c5 0 5 3.4 10 3.4s5-3.4 10-3.4 5 3.4 10 3.4 5-3.4 10-3.4" />
      </g>
      {/* the ring */}
      <circle cx="64" cy="32" r="25" stroke="currentColor" strokeWidth="1.5" fill="#fffdf7" />
      <circle
        cx="64"
        cy="32"
        r="18.5"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeDasharray="2.6 2.4"
      />
      <defs>
        <path
          id="pm-arc"
          d="M41.5 32a22.5 22.5 0 1 1 45 0a22.5 22.5 0 1 1 -45 0"
        />
      </defs>
      <text
        fill="currentColor"
        fontSize="6"
        fontWeight="700"
        letterSpacing="1.6"
        style={{ fontFamily: "var(--font-display), Poppins, sans-serif" }}
      >
        <textPath href="#pm-arc" startOffset="2">
          ARTIFACTS • SARASOTA FLA
        </textPath>
      </text>
      <text
        x="64"
        y="30.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="7"
        fontWeight="700"
        style={{ fontFamily: "var(--font-display), Poppins, sans-serif" }}
      >
        SVS
      </text>
      <text
        x="64"
        y="39"
        textAnchor="middle"
        fill="currentColor"
        fontSize="5.4"
        fontWeight="600"
        letterSpacing="0.8"
        style={{ fontFamily: "var(--font-display), Poppins, sans-serif" }}
      >
        EST. 2026
      </text>
    </svg>
  );
}
