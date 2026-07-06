import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[160px] w-full rounded-xl border border-sea/25 bg-shell-bright px-3.5 py-2.5 text-sm code-font text-ink",
      "placeholder:text-ink-mute/70",
      "transition-[border-color,box-shadow] focus-visible:border-sea focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "scroll-thin",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
