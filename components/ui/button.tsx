import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-cobalt text-paper-soft border-[1.5px] border-ink shadow-[2px_2px_0_var(--ink)] hover:bg-cobalt-deep hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--ink)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_var(--ink)]",
  secondary:
    "bg-paper-soft text-ink border-[1.5px] border-ink shadow-[2px_2px_0_var(--ink)] hover:bg-white hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--orange)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_var(--ink)]",
  outline:
    "border-[1.5px] border-ink bg-transparent text-ink hover:bg-paper-deep",
  ghost: "text-ink hover:bg-paper-deep",
  destructive:
    "bg-destructive text-white border-[1.5px] border-ink shadow-[2px_2px_0_var(--ink)] hover:brightness-95 active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_var(--ink)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-9 px-4 text-sm rounded-lg",
  lg: "h-11 px-5 text-sm rounded-[11px]",
  icon: "h-9 w-9 rounded-lg",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em]",
    "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none",
    variants[variant],
    sizes[size],
    className,
  );
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  ),
);
Button.displayName = "Button";
