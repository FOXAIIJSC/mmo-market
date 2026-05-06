import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-semibold text-text",
        className,
      )}
    >
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-accent shadow-lg shadow-brand/30"
      >
        <span className="text-base font-black text-white">M</span>
      </span>
      <span className="leading-tight">
        <span className="block text-xs uppercase tracking-widest text-text-muted">
          Sàn
        </span>
        <span className="block text-base font-bold">MMO Market</span>
      </span>
    </Link>
  );
}
