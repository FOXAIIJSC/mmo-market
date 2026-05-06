import { notFound } from "next/navigation";
import Link from "next/link";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ProductCard } from "@/components/ProductCard";
import { SiteShell } from "@/components/SiteShell";
import { SortBar } from "@/components/SortBar";
import { fetchCategories, fetchProducts } from "@/lib/serverData";

export const revalidate = 30;

export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [categories, list] = await Promise.all([
    fetchCategories(),
    fetchProducts({ category: slug, pageSize: 60 }),
  ]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <SiteShell>
      {/* Hero banner */}
      <div className={`bg-gradient-to-br ${category.color} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-dots opacity-20 mix-blend-overlay" />
        <div className="mx-auto max-w-7xl px-4 py-10 text-white">
          <nav className="flex items-center gap-2 text-xs text-white/80">
            <Link href="/" className="hover:underline">
              Trang chủ
            </Link>
            <span>/</span>
            <span>Danh mục</span>
            <span>/</span>
            <span className="font-medium text-white">{category.name}</span>
          </nav>
          <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">
            {category.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90 md:text-base">
            {category.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
              {category.productCount} sản phẩm
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
              {list.length} sản phẩm hiển thị
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1 backdrop-blur">
              ⚡ {list.filter((p) => p.delivery === "auto").length} auto-delivery
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <FilterSidebar />

          <div className="min-w-0 flex-1 space-y-4">
            <SortBar total={list.length} />
            {list.length === 0 ? (
              <div className="rounded-2xl border border-border bg-bg-card p-12 text-center text-sm text-text-muted">
                Chưa có sản phẩm trong danh mục này.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {list.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
