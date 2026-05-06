import Link from "next/link";
import {
  Sparkles,
  Wrench,
  GraduationCap,
  Gift,
  Gamepad2,
  Users,
  TrendingUp,
  Flame,
} from "lucide-react";
import type { Category } from "@/lib/types";
import { formatNumber } from "@/lib/format";

const iconMap = {
  sparkles: Sparkles,
  wrench: Wrench,
  "graduation-cap": GraduationCap,
  gift: Gift,
  gamepad: Gamepad2,
  users: Users,
  "trending-up": TrendingUp,
  flame: Flame,
} as const;

export function CategoryTile({ category }: { category: Category }) {
  const Icon = iconMap[category.iconKey as keyof typeof iconMap] ?? Sparkles;
  return (
    <Link
      href={`/c/${category.slug}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-bg-card p-4 transition hover:-translate-y-0.5 hover:border-brand/60"
    >
      <div
        aria-hidden
        className={`absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br ${category.color} opacity-20 blur-2xl transition group-hover:opacity-40`}
      />
      <div
        className={`relative grid size-11 place-items-center rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg`}
      >
        <Icon className="size-5" />
      </div>
      <div className="relative">
        <div className="text-sm font-semibold text-text">{category.name}</div>
        <div className="mt-0.5 text-xs text-text-muted line-clamp-1">
          {category.description}
        </div>
      </div>
      <div className="relative mt-1 text-xs text-text-dim">
        {formatNumber(category.productCount)} sản phẩm
      </div>
    </Link>
  );
}
