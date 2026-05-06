"use client";
import { Grid2x2, List, ArrowUpDown } from "lucide-react";

const sorts = [
  { v: "popular", label: "Bán chạy" },
  { v: "newest", label: "Mới nhất" },
  { v: "bestseller", label: "Top bán" },
  { v: "price-asc", label: "Giá ↑" },
  { v: "price-desc", label: "Giá ↓" },
  { v: "rating", label: "Đánh giá" },
];

export function SortBar({
  total,
  value = "popular",
  onChange,
}: {
  total: number;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-bg-card p-3">
      <span className="flex items-center gap-2 text-xs text-text-muted">
        <ArrowUpDown className="size-3.5" />
        Sắp xếp:
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {sorts.map((s) => (
          <button
            key={s.v}
            onClick={() => onChange?.(s.v)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              s.v === value
                ? "bg-brand text-white"
                : "bg-bg-elev text-text-muted hover:bg-bg-elev/80 hover:text-text"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3 text-xs text-text-muted">
        <span>
          <span className="num font-semibold text-text">{total}</span> sản phẩm
        </span>
        <div className="flex items-center gap-1 rounded-full bg-bg-elev p-1">
          <button className="rounded-full bg-brand p-1.5 text-white">
            <Grid2x2 className="size-3.5" />
          </button>
          <button className="rounded-full p-1.5 text-text-muted hover:text-text">
            <List className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
