import { Clock, Zap } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { SiteShell } from "@/components/SiteShell";
import { flashSaleProducts, products } from "@/lib/data";

export const metadata = { title: "Flash Sale | MMO Market" };

export default function FlashSalePage() {
  const flash = flashSaleProducts();
  const all = [...flash, ...products.slice(0, 12)];
  return (
    <SiteShell>
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-rose-600 to-pink-600">
        <div className="absolute inset-0 bg-dots opacity-25 mix-blend-overlay" />
        <div className="mx-auto max-w-7xl px-4 py-12 text-white">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest">
            <Zap className="size-5" />
            Flash sale 24h
          </div>
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">
            Giảm sốc đến <span className="text-yellow-200">70%</span>
          </h1>
          <p className="mt-3 max-w-xl text-white/85">
            Số lượng có hạn — dành cho 100 đơn đầu tiên mỗi sản phẩm. Áp dụng đến 23:59 hôm nay.
          </p>

          <div className="mt-6 flex items-center gap-2">
            <Clock className="size-5" />
            <span className="text-sm font-semibold">Kết thúc trong:</span>
            <div className="flex items-center gap-2">
              {["04", "21", "35"].map((n, i) => (
                <span
                  key={i}
                  className="num grid h-12 min-w-12 place-items-center rounded-xl bg-white/20 px-3 text-2xl font-extrabold backdrop-blur"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {all.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
