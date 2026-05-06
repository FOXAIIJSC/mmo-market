"use client";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SortBar } from "@/components/SortBar";
import type { Product } from "@/lib/types";

export function MarketplaceClient({ initialProducts }: { initialProducts: Product[] }) {
  const [sort, setSort] = useState("popular");

  const sorted = useMemo(() => {
    const arr = [...initialProducts];
    switch (sort) {
      case "newest":
        return arr.reverse();
      case "price-asc":
        return arr.sort((a, b) => a.price - b.price);
      case "price-desc":
        return arr.sort((a, b) => b.price - a.price);
      case "rating":
        return arr.sort((a, b) => b.rating - a.rating);
      case "bestseller":
        return arr.sort((a, b) => b.sold - a.sold);
      default:
        return arr;
    }
  }, [initialProducts, sort]);

  return (
    <>
      <SortBar total={sorted.length} value={sort} onChange={setSort} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {sorted.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
