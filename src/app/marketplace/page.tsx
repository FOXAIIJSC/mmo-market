import { FilterSidebar } from "@/components/FilterSidebar";
import { SiteShell } from "@/components/SiteShell";
import { fetchProducts } from "@/lib/serverData";
import Link from "next/link";
import { MarketplaceClient } from "./MarketplaceClient";

export const metadata = {
  title: "Marketplace — Tất cả sản phẩm | MMO Market",
};

export default async function MarketplacePage() {
  const products = await fetchProducts({ pageSize: 60 });
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-4 flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-text">Trang chủ</Link>
          <span>/</span>
          <span className="text-text">Tất cả sản phẩm</span>
        </nav>

        <h1 className="mb-1 text-2xl font-extrabold text-text md:text-3xl">Marketplace</h1>
        <p className="mb-6 text-sm text-text-muted">
          Khám phá toàn bộ {products.length} sản phẩm số đã được kiểm duyệt.
        </p>

        <div className="flex flex-col gap-6 lg:flex-row">
          <FilterSidebar />
          <div className="min-w-0 flex-1 space-y-4">
            <MarketplaceClient initialProducts={products} />
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
