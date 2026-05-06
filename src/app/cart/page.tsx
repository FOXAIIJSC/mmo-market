import Link from "next/link";
import { Trash2, Tag, ShieldCheck, ChevronRight } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/Button";
import { products, sellers } from "@/lib/data";
import { formatVND } from "@/lib/format";

export const metadata = { title: "Giỏ hàng | MMO Market" };

const lines = [
  { product: products[0], qty: 1 },
  { product: products[5], qty: 2 },
  { product: products[12], qty: 1 },
];

export default function CartPage() {
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discount = 50000;
  const total = subtotal - discount;

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-extrabold text-text md:text-3xl">
          Giỏ hàng
        </h1>
        <p className="mb-6 text-sm text-text-muted">
          {lines.length} sản phẩm từ {new Set(lines.map((l) => l.product.sellerId)).size} người bán
        </p>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {/* Group by seller */}
            {Array.from(new Set(lines.map((l) => l.product.sellerId))).map(
              (sid) => {
                const seller = sellers.find((s) => s.id === sid)!;
                const sellerLines = lines.filter((l) => l.product.sellerId === sid);
                return (
                  <div
                    key={sid}
                    className="overflow-hidden rounded-2xl border border-border bg-bg-card"
                  >
                    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                      <input type="checkbox" defaultChecked className="size-4 accent-brand" />
                      <div
                        className="grid size-7 place-items-center rounded-full text-xs font-bold text-white"
                        style={{ background: seller.avatarColor }}
                      >
                        {seller.username[0].toUpperCase()}
                      </div>
                      <Link
                        href={`/seller/${seller.username}`}
                        className="font-semibold text-text hover:text-accent"
                      >
                        @{seller.username}
                      </Link>
                      <span className="rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                        ĐÃ KYC
                      </span>
                      <Link
                        href="#"
                        className="ml-auto text-xs text-text-muted hover:text-text"
                      >
                        Xem shop →
                      </Link>
                    </div>
                    <div className="divide-y divide-border">
                      {sellerLines.map((l) => (
                        <div
                          key={l.product.id}
                          className="flex items-center gap-4 p-4"
                        >
                          <input
                            type="checkbox"
                            defaultChecked
                            className="size-4 accent-brand"
                          />
                          <div
                            className="grid size-16 shrink-0 place-items-center rounded-xl text-2xl font-bold text-white shadow"
                            style={{ background: l.product.thumbnailColor }}
                          >
                            {l.product.thumbnailIcon ?? l.product.title[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/p/${l.product.slug}`}
                              className="line-clamp-2 text-sm font-semibold text-text hover:text-accent"
                            >
                              {l.product.title}
                            </Link>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                              <span>
                                {l.product.delivery === "auto" ? "⚡ Auto" : "👤 Manual"}
                              </span>
                              <span>BH {l.product.warrantyDays}d</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="num text-base font-extrabold text-accent">
                              {formatVND(l.product.price)}
                            </div>
                            {l.product.comparePrice && (
                              <div className="num text-xs text-text-dim line-through">
                                {formatVND(l.product.comparePrice)}
                              </div>
                            )}
                          </div>
                          <div className="flex h-9 items-center gap-1 rounded-xl border border-border bg-bg-elev px-1">
                            <button className="grid size-7 place-items-center rounded-lg text-text-muted hover:bg-bg-card">
                              −
                            </button>
                            <span className="num w-8 text-center text-sm font-semibold text-text">
                              {l.qty}
                            </span>
                            <button className="grid size-7 place-items-center rounded-lg text-text-muted hover:bg-bg-card">
                              +
                            </button>
                          </div>
                          <button className="grid size-9 place-items-center rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 border-t border-border bg-bg-elev/40 px-4 py-3 text-xs text-text-muted">
                      <Tag className="size-4 text-accent" />
                      <span>Mã shop:</span>
                      <span className="font-mono rounded-md bg-bg-elev px-2 py-0.5 text-text">
                        SHOP10K
                      </span>
                      <span className="ml-auto">Giảm 10K toàn shop</span>
                    </div>
                  </div>
                );
              },
            )}

            {/* Recommendations */}
            <div className="rounded-2xl border border-border bg-bg-card p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-text">
                💡 Có thể bạn cần thêm
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {products.slice(15, 19).map((p) => (
                  <Link
                    key={p.id}
                    href={`/p/${p.slug}`}
                    className="flex items-center gap-2 rounded-xl border border-border bg-bg-elev/50 p-2 hover:border-brand/60"
                  >
                    <div
                      className="grid size-10 shrink-0 place-items-center rounded-lg text-sm font-bold text-white"
                      style={{ background: p.thumbnailColor }}
                    >
                      {p.thumbnailIcon ?? p.title[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-2 text-xs text-text">{p.title}</div>
                      <div className="num mt-0.5 text-xs font-bold text-accent">
                        {formatVND(p.price)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <aside className="space-y-4 lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-border bg-bg-card p-5">
                <h3 className="text-base font-bold text-text">Tóm tắt đơn hàng</h3>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Tạm tính ({lines.length} sp)</dt>
                    <dd className="num font-medium text-text">{formatVND(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Giảm giá</dt>
                    <dd className="num font-medium text-success">-{formatVND(discount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Phí giao dịch</dt>
                    <dd className="num font-medium text-text">Miễn phí</dd>
                  </div>
                  <div className="my-2 h-px bg-border" />
                  <div className="flex justify-between">
                    <dt className="font-semibold text-text">Thành tiền</dt>
                    <dd className="num text-lg font-extrabold text-accent">
                      {formatVND(total)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-xl border border-success/30 bg-success/5 p-3 text-xs text-text-muted">
                  <ShieldCheck className="mb-1 size-4 text-success" />
                  Tiền của bạn được bảo vệ bởi cơ chế escrow. Nếu sản phẩm
                  không đúng mô tả, bạn sẽ được hoàn 100%.
                </div>

                <Link href="/checkout" className="mt-4 block">
                  <Button size="lg" className="w-full">
                    Tiến hành thanh toán
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>
              </div>

              <div className="rounded-2xl border border-border bg-bg-card p-5">
                <h3 className="text-sm font-semibold text-text">
                  Mã giảm giá (sàn)
                </h3>
                <div className="mt-3 flex gap-2">
                  <input
                    placeholder="Nhập mã..."
                    className="h-10 flex-1 rounded-xl border border-border bg-bg-elev px-3 text-sm text-text placeholder:text-text-dim outline-none focus:border-brand"
                  />
                  <Button variant="soft" size="md">Áp dụng</Button>
                </div>
                <div className="mt-3 space-y-1.5">
                  {[
                    { code: "MMOWELCOME", desc: "Giảm 50K cho đơn đầu tiên" },
                    { code: "AI100K", desc: "Giảm 100K cho danh mục AI" },
                  ].map((c) => (
                    <button
                      key={c.code}
                      className="flex w-full items-center justify-between rounded-lg border border-dashed border-brand/40 bg-brand-soft px-3 py-2 text-xs"
                    >
                      <span className="font-mono font-semibold text-brand">
                        {c.code}
                      </span>
                      <span className="text-text-muted">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
