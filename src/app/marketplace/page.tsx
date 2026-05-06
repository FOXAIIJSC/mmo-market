import { FilterSidebar } from "@/components/FilterSidebar";
import { ProductCard } from "@/components/ProductCard";
import { SiteShell } from "@/components/SiteShell";
import { SortBar } from "@/components/SortBar";
import { products } from "@/lib/data";
import Link from "next/link";

export const metadata = {
  title: "Marketplace — Tất cả sản phẩm | MMO Market",
};

export default function MarketplacePage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-text">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-text">Tất cả sản phẩm</span>
        </nav>

        <h1 className="mb-1 text-2xl font-extrabold text-text md:text-3xl">
          Marketplace
        </h1>
        <p className="mb-6 text-sm text-text-muted">
          Khám phá toàn bộ {products.length * 350}+ sản phẩm số đã được kiểm
          duyệt.
        </p>

        <div className="flex flex-col gap-6 lg:flex-row">
          <FilterSidebar />

          <div className="min-w-0 flex-1 space-y-4">
            <SortBar total={products.length} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`grid size-9 place-items-center rounded-lg text-sm font-semibold transition ${
                    n === 1
                      ? "bg-brand text-white"
                      : "border border-border bg-bg-card text-text-muted hover:border-brand hover:text-text"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="text-text-muted">...</span>
              <button className="grid size-9 place-items-center rounded-lg border border-border bg-bg-card text-sm font-semibold text-text-muted hover:border-brand">
                12
              </button>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
