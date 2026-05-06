import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

type Tone = "brand" | "accent" | "success" | "warning" | "danger" | "muted";

const tones: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand border-brand/40",
  accent: "bg-accent-soft text-accent border-accent/40",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
  muted: "bg-bg-elev text-text-muted border-border",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: ReactNode;
}

export function Badge({
  className,
  tone = "muted",
  icon,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
