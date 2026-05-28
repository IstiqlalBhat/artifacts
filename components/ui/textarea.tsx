import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[160px] w-full rounded-lg border-[1.5px] border-ink/30 bg-paper-soft px-3.5 py-2.5 text-sm code-font text-ink",
      "placeholder:text-ink-mute/70",
      "transition-[border-color,box-shadow] focus-visible:border-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt/25",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "scroll-thin",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
