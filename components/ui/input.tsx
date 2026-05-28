import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-11 w-full rounded-lg border-[1.5px] border-ink/30 bg-paper-soft px-3.5 py-2 text-sm text-ink",
      "placeholder:text-ink-mute/70",
      "transition-[border-color,box-shadow] focus-visible:border-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt/25",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
