import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export function Input({
  className,
  leftIcon,
  rightSlot,
  ...props
}: InputProps) {
  return (
    <div className={cn("relative", className)}>
      {leftIcon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          {leftIcon}
        </div>
      )}
      <input
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-bg-elev px-4 text-sm text-text placeholder:text-text-dim outline-none transition focus:border-brand",
          leftIcon && "pl-10",
          rightSlot && "pr-32",
        )}
        {...props}
      />
      {rightSlot && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {rightSlot}
        </div>
      )}
    </div>
  );
}
