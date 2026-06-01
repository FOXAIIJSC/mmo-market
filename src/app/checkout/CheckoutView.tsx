"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, QrCode, CreditCard, Bitcoin, ShieldCheck, Loader2, AlertCircle, CheckCircle2, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MoMoPayModal } from "@/components/MoMoPayModal";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiCart, ApiMoMoPayResult, ApiOrder, ApiValidateResult } from "@/lib/apiTypes";
import { formatVND } from "@/lib/format";

type PaymentMethodOption = {
  v: "Wallet" | "VietQr" | "Momo" | "ZaloPay" | "VnPay" | "Usdt";
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  fee: number;
  badge?: string;
};

const methods: PaymentMethodOption[] = [
  { v: "Wallet", label: "Ví nội bộ MMO", desc: "Trừ trực tiếp số dư ví — duyệt tức thời", icon: Wallet, fee: 0, badge: "Khuyến nghị" },
  { v: "VietQr", label: "VietQR / Chuyển khoản", desc: "Mock — sẽ ghi nhận khi tích hợp SePay", icon: QrCode, fee: 0 },
  { v: "Momo", label: "Ví MoMo", desc: "Quét mã QR hoặc đăng nhập MoMo để thanh toán", icon: Wallet, fee: 0 },
  { v: "ZaloPay", label: "ZaloPay", desc: "Mock — chưa tích hợp gateway", icon: Wallet, fee: 0 },
  { v: "VnPay", label: "VNPay", desc: "Mock — chưa tích hợp gateway", icon: CreditCard, fee: 5_000 },
  { v: "Usdt", label: "USDT (TRC20)", desc: "Mock — chưa tích hợp gateway", icon: Bitcoin, fee: 0 },
];

export function CheckoutView() {
  const { user, token, loading: authLoading, refresh } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<PaymentMethodOption["v"]>("Wallet");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number; message: string } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponErr, setCouponErr] = useState<string | null>(null);
  const [momoModal, setMomoModal] = useState<{ order: ApiOrder; result: ApiMoMoPayResult } | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
      return;
    }
    if (!token) return;
    apiFetch<ApiCart>("/api/cart", { token })
      .then(setCart)
      .catch((e) => setErr(e instanceof Error ? e.message : "Lỗi tải giỏ"))
      .finally(() => setLoading(false));
  }, [token, authLoading, router]);

  const applyCoupon = async () => {
    if (!token || !couponInput.trim() || !cart) return;
    setCouponChecking(true);
    setCouponErr(null);
    try {
      const result = await apiFetch<ApiValidateResult>("/api/coupons/validate", {
        method: "POST",
        token,
        body: JSON.stringify({ code: couponInput.trim(), orderAmount: cart.subtotal }),
      });
      if (result.valid) {
        setCouponApplied({ code: couponInput.trim().toUpperCase(), discount: result.discount, message: result.message ?? "" });
        setCouponInput("");
      } else {
        setCouponErr(result.error ?? "Mã không hợp lệ");
      }
    } catch (e) {
      setCouponErr(e instanceof Error ? e.message : "Lỗi kiểm tra mã");
    } finally {
      setCouponChecking(false);
    }
  };

  const removeCoupon = () => { setCouponApplied(null); setCouponErr(null); };

  const placeOrder = async () => {
    if (!token) return;
    setSubmitting(true);
    setErr(null);
    try {
      const order = await apiFetch<ApiOrder>("/api/orders/checkout", {
        method: "POST",
        token,
        body: JSON.stringify({ paymentMethod: method, note, couponCode: couponApplied?.code ?? null }),
      });

      if (method === "Momo") {
        const momoResult = await apiFetch<ApiMoMoPayResult>(`/api/orders/${order.id}/momo-pay`, {
          method: "POST",
          token,
        });
        await refresh();
        setMomoModal({ order, result: momoResult });
      } else {
        await refresh();
        router.push(`/account/orders?just=${order.id}`);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="size-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-border bg-bg-card p-12 text-center text-text-muted">
        Giỏ hàng trống. <Link href="/marketplace" className="text-accent hover:underline">Khám phá Marketplace</Link>
      </div>
    );
  }

  const fee = methods.find((m) => m.v === method)?.fee ?? 0;
  const discount = couponApplied?.discount ?? 0;
  const total = cart.subtotal - discount + fee;
  const canPay = method !== "Wallet" || (user && user.walletBalance >= total);

  return (
    <>
    {momoModal && token && (
      <MoMoPayModal
        orderId={momoModal.order.id}
        orderCode={momoModal.order.code}
        total={momoModal.order.total}
        momoResult={momoModal.result}
        token={token}
        onSuccess={() => {
          setMomoModal(null);
          router.push(`/account/orders?just=${momoModal.order.id}`);
        }}
        onCancel={() => {
          setMomoModal(null);
          router.push(`/account/orders?just=${momoModal.order.id}`);
        }}
      />
    )}
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-4">
        {err && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{err}</span>
          </div>
        )}
        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <h2 className="mb-3 text-base font-bold text-text">Phương thức thanh toán</h2>
          <div className="space-y-2">
            {methods.map((m) => {
              const active = m.v === method;
              const isWallet = m.v === "Wallet";
              const insufficient = isWallet && user && user.walletBalance < total;
              return (
                <button
                  key={m.v}
                  onClick={() => setMethod(m.v)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${active ? "border-brand bg-brand/5" : "border-border bg-bg-elev hover:border-brand/40"}`}
                >
                  <m.icon className="mt-0.5 size-5 text-brand" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text">{m.label}</span>
                      {m.badge && (
                        <span className="rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-bold text-success">{m.badge}</span>
                      )}
                      {insufficient && (
                        <span className="rounded-full bg-danger/20 px-2 py-0.5 text-[10px] font-bold text-danger">SỐ DƯ KHÔNG ĐỦ</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {isWallet && user ? `Số dư: ${formatVND(user.walletBalance)} • ${m.desc}` : m.desc}
                    </p>
                  </div>
                  {m.fee > 0 && <span className="num text-xs text-text-muted">+{formatVND(m.fee)}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Coupon input */}
        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <h2 className="mb-3 text-base font-bold text-text">Mã giảm giá</h2>
          {couponApplied ? (
            <div className="flex items-center justify-between rounded-xl border border-success/40 bg-success/10 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="size-4" />
                <span className="font-mono font-bold">{couponApplied.code}</span>
                <span className="text-xs">{couponApplied.message}</span>
              </div>
              <button onClick={removeCoupon} className="text-text-muted hover:text-danger">
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <input
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponErr(null); }}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder="Nhập mã giảm giá..."
                    className="h-10 w-full rounded-lg border border-border bg-bg-elev pl-9 pr-3 font-mono text-sm uppercase text-text outline-none focus:border-brand"
                  />
                </div>
                <Button variant="outline" onClick={applyCoupon} disabled={couponChecking || !couponInput.trim()}>
                  {couponChecking ? <Loader2 className="size-4 animate-spin" /> : "Áp dụng"}
                </Button>
              </div>
              {couponErr && (
                <p className="flex items-center gap-1.5 text-xs text-danger">
                  <AlertCircle className="size-3.5" />{couponErr}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <h2 className="mb-3 text-base font-bold text-text">Ghi chú đơn hàng (tuỳ chọn)</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Yêu cầu thêm cho người bán..."
            className="w-full rounded-lg border border-border bg-bg-elev p-3 text-sm text-text placeholder:text-text-dim focus:border-brand focus:outline-none"
          />
        </div>
      </div>

      <aside className="lg:col-span-4">
        <div className="sticky top-24 space-y-4 rounded-2xl border border-border bg-bg-card p-5">
          <h3 className="text-base font-bold text-text">Đơn hàng của bạn</h3>
          <div className="space-y-3 max-h-72 overflow-auto pr-1">
            {cart.lines.map((l) => (
              <div key={l.cartItemId} className="flex items-center gap-3 text-sm">
                <div className="grid size-10 place-items-center rounded-md text-sm font-bold text-white" style={{ background: l.product.thumbnailColor }}>
                  {l.product.thumbnailIcon ?? l.product.title[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="line-clamp-1 text-text">{l.product.title}</div>
                  <div className="text-xs text-text-muted">x{l.quantity} • @{l.product.seller.username}</div>
                </div>
                <div className="num text-sm font-semibold text-accent">{formatVND(l.subtotal)}</div>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-text-muted"><span>Tạm tính</span><span className="num text-text">{formatVND(cart.subtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span className="flex items-center gap-1"><Tag className="size-3.5" />Giảm giá ({couponApplied?.code})</span>
                <span className="num font-semibold">-{formatVND(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-text-muted"><span>Phí gateway</span><span className="num text-text">{fee > 0 ? formatVND(fee) : "Miễn phí"}</span></div>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm font-semibold text-text">Tổng</span>
            <span className="num text-2xl font-extrabold text-accent">{formatVND(total)}</span>
          </div>
          <Button onClick={placeOrder} size="lg" className="w-full" disabled={submitting || !canPay}>
            {submitting ? (
              <><Loader2 className="size-4 animate-spin mr-2 inline" />Đang xử lý...</>
            ) : !canPay ? (
              "Số dư ví không đủ"
            ) : method === "Momo" ? (
              "Thanh toán bằng MoMo"
            ) : (
              "Đặt hàng"
            )}
          </Button>
          <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-xs text-text-muted">
            <ShieldCheck className="mb-1 inline size-4 text-success" /> Tiền sẽ được giữ trong escrow đến khi bạn xác nhận đã nhận hàng (tối đa 3-7 ngày tự động giải phóng).
          </div>
        </div>
      </aside>
    </div>
    </>
  );
}
