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
      "flex h-11 w-full rounded-xl border border-sea/25 bg-shell-bright px-3.5 py-2 text-sm text-ink",
      "placeholder:text-ink-mute/70",
      "transition-[border-color,box-shadow] focus-visible:border-sea focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
