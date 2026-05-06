"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, ShieldCheck, ShoppingCart, Plus, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiCart } from "@/lib/apiTypes";
import { formatVND } from "@/lib/format";

export function CartView() {
  const { user, token, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await apiFetch<ApiCart>("/api/cart", { token });
      setCart(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không tải được giỏ hàng");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && token) reload();
    else if (!authLoading) setLoading(false);
  }, [token, authLoading, reload]);

  const update = async (id: string, qty: number) => {
    if (!token) return;
    setBusy(id);
    try {
      const data = await apiFetch<ApiCart>(`/api/cart/${id}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ quantity: qty }),
      });
      setCart(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi cập nhật");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!token) return;
    setBusy(id);
    try {
      const data = await apiFetch<ApiCart>(`/api/cart/${id}`, { method: "DELETE", token });
      setCart(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi xoá");
    } finally {
      setBusy(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="size-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mt-8 rounded-2xl border border-border bg-bg-card p-12 text-center">
        <ShoppingCart className="mx-auto size-12 text-text-muted" />
        <h2 className="mt-4 text-lg font-bold text-text">Đăng nhập để xem giỏ hàng</h2>
        <p className="mt-2 text-sm text-text-muted">Bạn cần đăng nhập để thêm sản phẩm và thanh toán.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login"><Button>Đăng nhập</Button></Link>
          <Link href="/register"><Button variant="outline">Đăng ký miễn phí</Button></Link>
        </div>
      </div>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-border bg-bg-card p-12 text-center">
        <ShoppingCart className="mx-auto size-12 text-text-muted" />
        <h2 className="mt-4 text-lg font-bold text-text">Giỏ hàng trống</h2>
        <p className="mt-2 text-sm text-text-muted">Hãy chọn sản phẩm và quay lại đây.</p>
        <Link href="/marketplace" className="mt-6 inline-block">
          <Button>Khám phá Marketplace</Button>
        </Link>
      </div>
    );
  }

  const fee = 0;
  const total = cart.subtotal + fee;

  return (
    <>
      <p className="mb-6 text-sm text-text-muted">
        {cart.totalItems} sản phẩm từ {new Set(cart.lines.map((l) => l.product.seller.id)).size} người bán
      </p>
      {err && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {err}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {Array.from(new Set(cart.lines.map((l) => l.product.seller.id))).map((sid) => {
            const sellerLines = cart.lines.filter((l) => l.product.seller.id === sid);
            const seller = sellerLines[0].product.seller;
            return (
              <div key={sid} className="overflow-hidden rounded-2xl border border-border bg-bg-card">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <div
                    className="grid size-7 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ background: seller.avatarColor }}
                  >
                    {seller.username[0].toUpperCase()}
                  </div>
                  <Link href={`/seller/${seller.username}`} className="font-semibold text-text hover:text-accent">
                    @{seller.username}
                  </Link>
                  <span className="rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                    {seller.kycStatus === "Approved" ? "ĐÃ KYC" : "MỚI"}
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {sellerLines.map((l) => (
                    <div key={l.cartItemId} className="flex items-center gap-4 p-4">
                      <div
                        className="grid size-16 shrink-0 place-items-center rounded-xl text-2xl font-bold text-white shadow"
                        style={{ background: l.product.thumbnailColor }}
                      >
                        {l.product.thumbnailIcon ?? l.product.title[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/p/${l.product.slug}`} className="line-clamp-2 text-sm font-semibold text-text hover:text-accent">
                          {l.product.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                          <span>{l.product.delivery === "Auto" ? "⚡ Auto" : "👤 Manual"}</span>
                          <span>BH {l.product.warrantyDays}d</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            disabled={busy === l.cartItemId || l.quantity <= 1}
                            onClick={() => update(l.cartItemId, l.quantity - 1)}
                            className="grid size-7 place-items-center rounded-md border border-border bg-bg-elev text-text-muted hover:text-text disabled:opacity-50"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="num w-8 text-center text-sm font-semibold text-text">{l.quantity}</span>
                          <button
                            disabled={busy === l.cartItemId}
                            onClick={() => update(l.cartItemId, l.quantity + 1)}
                            className="grid size-7 place-items-center rounded-md border border-border bg-bg-elev text-text-muted hover:text-text disabled:opacity-50"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="num text-base font-extrabold text-accent">{formatVND(l.subtotal)}</div>
                        {l.product.comparePrice && (
                          <div className="num text-xs text-text-dim line-through">
                            {formatVND(l.product.comparePrice * l.quantity)}
                          </div>
                        )}
                      </div>
                      <button
                        disabled={busy === l.cartItemId}
                        onClick={() => remove(l.cartItemId)}
                        className="rounded-md p-2 text-text-muted hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                      >
                        {busy === l.cartItemId ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-3 rounded-2xl border border-border bg-bg-card p-5">
            <h3 className="text-base font-bold text-text">Tóm tắt đơn hàng</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Tạm tính</span>
                <span className="num text-text">{formatVND(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Phí xử lý</span>
                <span className="num text-success">Miễn phí</span>
              </div>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-text">Tổng thanh toán</span>
              <span className="num text-2xl font-extrabold text-accent">{formatVND(total)}</span>
            </div>
            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full">Tiến hành thanh toán</Button>
            </Link>
            <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-xs text-text-muted">
              <ShieldCheck className="mb-1 inline size-4 text-success" /> Mọi giao dịch được bảo vệ bằng cơ chế escrow. Tiền chỉ chuyển cho người bán khi bạn xác nhận.
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
