import Link from "next/link";
import {
  Wallet,
  QrCode,
  CreditCard,

  Bitcoin,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/Button";
import { products, sellers } from "@/lib/data";
import { formatVND } from "@/lib/format";

export const metadata = { title: "Thanh toán | MMO Market" };

const paymentMethods = [
  {
    v: "wallet",
    label: "Ví nội bộ MMO",
    desc: "Số dư khả dụng: 2.075.000₫ — bonus +50K khi nạp",
    icon: Wallet,
    badge: "Khuyến nghị",
    fee: 0,
  },
  {
    v: "vietqr",
    label: "VietQR / Chuyển khoản",
    desc: "Tự động ghi nhận qua SePay (Vietcombank, MB, Techcombank...)",
    icon: QrCode,
    fee: 0,
  },
  {
    v: "momo",
    label: "Ví MoMo",
    desc: "Quét QR hoặc deeplink, kích hoạt tức thì",
    icon: Wallet,
    fee: 0,
  },
  {
    v: "zalopay",
    label: "ZaloPay",
    desc: "Thanh toán bằng ZaloPay app, không phí",
    icon: Wallet,
    fee: 0,
  },
  {
    v: "vnpay",
    label: "VNPay (đa ngân hàng)",
    desc: "Thẻ ATM nội địa & Visa/Mastercard",
    icon: CreditCard,
    fee: 5_000,
  },
  {
    v: "usdt",
    label: "USDT (TRC20 / ERC20)",
    desc: "Webhook xác nhận sau 1 block",
    icon: Bitcoin,
    fee: 0,
  },
];

const lines = [
  { product: products[0], qty: 1 },
  { product: products[5], qty: 2 },
  { product: products[12], qty: 1 },
];

export default function CheckoutPage() {
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const discount = 50_000;
  const total = subtotal - discount;
  const groupedSellers = Array.from(new Set(lines.map((l) => l.product.sellerId)));

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-text md:text-3xl">
            Thanh toán
          </h1>
          <ol className="flex items-center gap-2 text-xs">
            {[
              ["Giỏ hàng", true],
              ["Thanh toán", true],
              ["Hoàn tất", false],
            ].map(([label, active], i) => (
              <li key={String(label)} className="flex items-center gap-2">
                <span
                  className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${
                    active
                      ? "bg-brand text-white"
                      : "bg-bg-elev text-text-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={
                    active ? "font-semibold text-text" : "text-text-muted"
                  }
                >
                  {label}
                </span>
                {i < 2 && <span className="text-text-dim">›</span>}
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            {/* Buyer info */}
            <section className="rounded-2xl border border-border bg-bg-card p-5">
              <h2 className="mb-4 text-base font-bold text-text">
                Thông tin nhận hàng
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Email nhận tài khoản">
                  <input
                    defaultValue="hientv2272@gmail.com"
                    className="h-11 w-full rounded-xl border border-border bg-bg-elev px-3 text-sm text-text"
                  />
                </Field>
                <Field label="Số điện thoại (OTP nếu cần)">
                  <input
                    defaultValue="0987 *** ***"
                    className="h-11 w-full rounded-xl border border-border bg-bg-elev px-3 text-sm text-text"
                  />
                </Field>
                <Field label="Ghi chú cho seller (tuỳ chọn)" full>
                  <textarea
                    rows={2}
                    placeholder="Ví dụ: gửi tài khoản dùng riêng, không dùng email .edu..."
                    className="w-full rounded-xl border border-border bg-bg-elev p-3 text-sm text-text placeholder:text-text-dim"
                  />
                </Field>
              </div>
            </section>

            {/* Order items by seller */}
            {groupedSellers.map((sid) => {
              const seller = sellers.find((s) => s.id === sid)!;
              const sellerLines = lines.filter((l) => l.product.sellerId === sid);
              return (
                <section
                  key={sid}
                  className="rounded-2xl border border-border bg-bg-card p-5"
                >
                  <div className="mb-3 flex items-center gap-2 text-sm">
                    <div
                      className="grid size-7 place-items-center rounded-full text-xs font-bold text-white"
                      style={{ background: seller.avatarColor }}
                    >
                      {seller.username[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-text">
                      @{seller.username}
                    </span>
                    <span className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-bold text-success">
                      ĐÃ KYC
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {sellerLines.map((l) => (
                      <li
                        key={l.product.id}
                        className="flex items-center gap-3 py-3"
                      >
                        <div
                          className="grid size-12 shrink-0 place-items-center rounded-lg text-base font-bold text-white"
                          style={{ background: l.product.thumbnailColor }}
                        >
                          {l.product.thumbnailIcon ?? l.product.title[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="line-clamp-1 text-sm font-medium text-text">
                            {l.product.title}
                          </div>
                          <div className="text-xs text-text-muted">
                            {l.product.delivery === "auto" ? "⚡ Auto" : "👤 Manual"}{" "}
                            • BH {l.product.warrantyDays}d • SL {l.qty}
                          </div>
                        </div>
                        <div className="num text-sm font-semibold text-text">
                          {formatVND(l.product.price * l.qty)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            {/* Payment methods */}
            <section className="rounded-2xl border border-border bg-bg-card p-5">
              <h2 className="mb-4 text-base font-bold text-text">
                Phương thức thanh toán
              </h2>
              <div className="grid gap-2 md:grid-cols-2">
                {paymentMethods.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <label
                      key={m.v}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                        i === 0
                          ? "border-brand bg-brand-soft"
                          : "border-border bg-bg-elev/50 hover:border-brand/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        defaultChecked={i === 0}
                        className="mt-1 size-4 accent-brand"
                      />
                      <div
                        className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                          i === 0
                            ? "bg-brand text-white"
                            : "bg-bg-elev text-text-muted"
                        }`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-semibold text-text">
                            {m.label}
                          </span>
                          {m.badge && (
                            <span className="rounded bg-brand/30 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                              {m.badge}
                            </span>
                          )}
                          {m.fee > 0 ? (
                            <span className="text-[10px] text-text-muted">
                              + phí {formatVND(m.fee)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-success">
                              Miễn phí
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-text-muted">{m.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="space-y-4 lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-border bg-bg-card p-5">
                <h3 className="text-base font-bold text-text">Tóm tắt</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Tạm tính</dt>
                    <dd className="num">{formatVND(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Giảm giá (MMOWELCOME)</dt>
                    <dd className="num text-success">-{formatVND(discount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Phí cổng thanh toán</dt>
                    <dd className="num">0₫</dd>
                  </div>
                  <div className="my-2 h-px bg-border" />
                  <div className="flex justify-between">
                    <dt className="font-semibold text-text">Tổng cộng</dt>
                    <dd className="num text-xl font-extrabold text-accent">
                      {formatVND(total)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 space-y-2 text-xs text-text-muted">
                  <div className="flex items-start gap-2 rounded-xl border border-success/30 bg-success/5 p-3">
                    <ShieldCheck className="mt-0.5 size-4 text-success" />
                    <div>
                      <div className="font-semibold text-text">
                        Escrow 72 giờ
                      </div>
                      Tiền giữ lại đến khi bạn xác nhận hoặc hết 72h.
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/5 p-3">
                    <CheckCircle2 className="mt-0.5 size-4 text-accent" />
                    <div>
                      <div className="font-semibold text-text">
                        Auto-delivery
                      </div>
                      Sản phẩm auto sẽ giao ngay sau thanh toán {"<"} 5 giây.
                    </div>
                  </div>
                </div>

                <Button size="lg" className="mt-4 w-full">
                  Đặt hàng & Thanh toán
                </Button>
                <p className="mt-2 text-center text-[11px] text-text-muted">
                  Bằng việc đặt hàng, bạn đồng ý với{" "}
                  <Link href="/policy/terms" className="text-accent hover:underline">
                    Điều khoản
                  </Link>{" "}
                  và{" "}
                  <Link
                    href="/policy/escrow"
                    className="text-accent hover:underline"
                  >
                    Cơ chế Escrow
                  </Link>
                  .
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-text-muted">{label}</span>
      {children}
    </label>
  );
}
