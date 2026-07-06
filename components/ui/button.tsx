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
    "bg-teal text-white border border-teal-deep shadow-[0_10px_20px_-12px_rgba(14,65,66,0.7),inset_0_1px_0_rgba(255,255,255,0.16)] hover:bg-teal-deep hover:-translate-y-0.5 hover:shadow-[0_14px_26px_-12px_rgba(14,65,66,0.78),0_0_0_3px_rgba(255,171,23,0.22)] active:translate-y-0 active:shadow-none",
  secondary:
    "bg-white text-teal border-[1.5px] border-teal/20 hover:bg-teal hover:border-teal hover:text-white hover:-translate-y-0.5 active:translate-y-0",
  outline:
    "border-[1.5px] border-teal/25 bg-transparent text-teal hover:bg-teal hover:border-teal hover:text-white",
  ghost: "text-ink-soft hover:bg-teal-tint hover:text-teal",
  destructive:
    "bg-rust text-white border border-rust-deep shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-rust-deep active:translate-y-px",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-xs rounded-[10px]",
  md: "h-9 px-4 text-sm rounded-xl",
  lg: "h-11 px-6 text-sm rounded-[14px]",
  icon: "h-9 w-9 rounded-xl",
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
    "display inline-flex items-center justify-center gap-2 font-semibold tracking-[0.005em]",
    "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
