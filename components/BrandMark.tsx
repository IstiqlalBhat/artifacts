import { cn } from "@/lib/utils";

/**
 * The Artifacts mark: a circular vintage badge — sun over gulf water
 * inside a double ring, like a postmark. Pure SVG — safe in server and
 * client trees.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        "bg-teal text-sand",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_14px_-6px_rgba(14,65,66,0.7)]",
        className,
      )}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="h-full w-full"
        aria-hidden="true"
      >
        {/* double badge ring */}
        <circle cx="20" cy="20" r="17.5" stroke="var(--sand)" strokeWidth="1.6" />
        <circle
          cx="20"
          cy="20"
          r="14.6"
          stroke="var(--sand)"
          strokeWidth="0.8"
          strokeDasharray="2.4 2.2"
          opacity="0.75"
        />
        {/* rising sun */}
        <path d="M15.4 22.4a4.6 4.6 0 0 1 9.2 0Z" fill="var(--sand)" />
        <g stroke="var(--sand)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M20 13.2v2.1" />
          <path d="M14.6 15.4l1.5 1.5" />
          <path d="M25.4 15.4l-1.5 1.5" />
        </g>
        {/* gulf water */}
        <path
          d="M12.5 25.4c1.9 0 1.9 1.3 3.8 1.3s1.9-1.3 3.7-1.3 1.9 1.3 3.8 1.3 1.9-1.3 3.7-1.3"
          stroke="var(--sand)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M15 28.6c1.6 0 1.6-1 3.3-1s1.6 1 3.3 1 1.6-1 3.3-1"
          stroke="var(--sand)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    </span>
  );
}
