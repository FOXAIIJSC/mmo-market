import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function SectionHeader({
  title,
  subtitle,
  href,
  cta = "Xem tất cả",
  accent,
  className,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  cta?: string;
  accent?: string; // e.g. emoji
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex items-end justify-between gap-4",
        className,
      )}
    >
      <div>
        <h2 className="flex items-center gap-2 text-xl font-bold text-text md:text-2xl">
          {accent && <span aria-hidden>{accent}</span>}
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          {cta}
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
