"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { categories } from "@/lib/data";
import { cn } from "@/lib/cn";

const priceRanges = [
  { label: "Dưới 100K", min: 0, max: 100_000 },
  { label: "100K - 500K", min: 100_000, max: 500_000 },
  { label: "500K - 1tr", min: 500_000, max: 1_000_000 },
  { label: "1tr - 5tr", min: 1_000_000, max: 5_000_000 },
  { label: "Trên 5tr", min: 5_000_000, max: Infinity },
];

const ratings = [5, 4, 3, 2];
const deliveries = [
  { v: "auto", label: "Auto-delivery" },
  { v: "manual", label: "Manual" },
  { v: "hybrid", label: "Hybrid" },
];

export function FilterSidebar() {
  const [open, setOpen] = useState({
    cat: true,
    price: true,
    rating: true,
    deliv: true,
  });

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <div className="rounded-2xl border border-border bg-bg-card">
        <Section
          title="Danh mục"
          isOpen={open.cat}
          onToggle={() => setOpen({ ...open, cat: !open.cat })}
        >
          <ul className="space-y-1.5 text-sm">
            {categories.map((c) => (
              <li
                key={c.slug}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-text-muted hover:bg-bg-elev hover:text-text"
              >
                <span>{c.name}</span>
                <span className="text-xs text-text-dim">{c.productCount}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Khoảng giá"
          isOpen={open.price}
          onToggle={() => setOpen({ ...open, price: !open.price })}
        >
          <div className="space-y-1.5">
            {priceRanges.map((r) => (
              <label
                key={r.label}
                className="flex cursor-pointer items-center gap-2 text-sm text-text-muted"
              >
                <input
                  type="checkbox"
                  className="size-4 accent-brand"
                />
                {r.label}
              </label>
            ))}
            <div className="mt-3 flex gap-2">
              <input
                placeholder="Từ"
                className="num h-9 w-full rounded-lg border border-border bg-bg-elev px-3 text-xs text-text placeholder:text-text-dim"
              />
              <input
                placeholder="Đến"
                className="num h-9 w-full rounded-lg border border-border bg-bg-elev px-3 text-xs text-text placeholder:text-text-dim"
              />
            </div>
          </div>
        </Section>

        <Section
          title="Đánh giá"
          isOpen={open.rating}
          onToggle={() => setOpen({ ...open, rating: !open.rating })}
        >
          <div className="space-y-1.5 text-sm">
            {ratings.map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-center gap-2 text-text-muted"
              >
                <input type="checkbox" className="size-4 accent-brand" />
                <span className="text-warning">
                  {"★".repeat(r)}
                  <span className="text-text-dim">{"★".repeat(5 - r)}</span>
                </span>
                <span className="ml-auto text-xs text-text-dim">trở lên</span>
              </label>
            ))}
          </div>
        </Section>

        <Section
          title="Phương thức giao"
          isOpen={open.deliv}
          onToggle={() => setOpen({ ...open, deliv: !open.deliv })}
          last
        >
          <div className="space-y-1.5 text-sm">
            {deliveries.map((d) => (
              <label
                key={d.v}
                className="flex cursor-pointer items-center gap-2 text-text-muted"
              >
                <input type="checkbox" className="size-4 accent-brand" />
                {d.label}
              </label>
            ))}
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-text-muted">
              <input type="checkbox" className="size-4 accent-brand" defaultChecked />
              Còn hàng
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-text-muted">
              <input type="checkbox" className="size-4 accent-brand" />
              Có bảo hành
            </label>
          </div>
        </Section>
      </div>

      <button className="mt-3 w-full rounded-full border border-border bg-bg-card py-2 text-xs text-text-muted hover:border-brand hover:text-text">
        Xoá bộ lọc
      </button>
    </aside>
  );
}

function Section({
  title,
  isOpen,
  onToggle,
  children,
  last,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={cn(!last && "border-b border-border")}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-text"
      >
        {title}
        <ChevronDown
          className={cn("size-4 transition", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
