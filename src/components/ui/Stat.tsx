import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Stat({
  label,
  value,
  delta,
  icon,
  tone,
}: {
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  icon?: ReactNode;
  tone?: "brand" | "accent" | "success" | "warning" | "danger";
}) {
  const toneBg: Record<NonNullable<typeof tone>, string> = {
    brand: "bg-brand-soft text-brand",
    accent: "bg-accent-soft text-accent",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
  };
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </div>
        {icon && (
          <div
            className={cn(
              "grid size-8 place-items-center rounded-xl",
              tone ? toneBg[tone] : "bg-bg-elev text-text-muted",
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="num mt-2 text-2xl font-bold text-text">{value}</div>
      {delta && (
        <div className="mt-1 text-xs text-text-muted">{delta}</div>
      )}
    </div>
  );
}
