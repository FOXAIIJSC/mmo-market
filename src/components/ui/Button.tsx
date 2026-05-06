import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger" | "success" | "soft";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-brand to-accent text-white shadow-lg shadow-brand/30 hover:opacity-95",
  outline:
    "border border-border bg-bg-card text-text hover:border-brand hover:text-text",
  ghost: "text-text-muted hover:bg-bg-elev hover:text-text",
  danger: "bg-danger text-white hover:opacity-95",
  success: "bg-success text-black hover:opacity-95",
  soft: "bg-brand-soft text-brand hover:bg-brand/20",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
