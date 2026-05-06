"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, AlertTriangle, Star, Loader2, CheckCircle2 } from "lucide-react";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiOrder } from "@/lib/apiTypes";
import type { OrderStatus } from "@/lib/types";
import { formatRelativeTime, formatVND } from "@/lib/format";

const tabs = [
  { v: "", label: "Tất cả" },
  { v: "PendingPayment", label: "Chờ thanh toán" },
  { v: "Processing", label: "Đang xử lý" },
  { v: "Delivered", label: "Đã giao" },
  { v: "Completed", label: "Hoàn thành" },
  { v: "Dispute", label: "Tranh chấp" },
];

const apiToFrontStatus: Record<string, OrderStatus> = {
  PendingPayment: "PENDING_PAYMENT",
  Paid: "PAID",
  Processing: "PROCESSING",
  Delivered: "DELIVERED",
  Completed: "COMPLETED",
  Dispute: "DISPUTE",
  Refunded: "REFUNDED",
  Cancelled: "CANCELLED",
};

export function OrdersClient() {
  const { user, token, loading: authLoading, refresh } = useAuth();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [tab, setTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await apiFetch<ApiOrder[]>(`/api/orders${tab ? `?status=${tab}` : ""}`, { token });
      setOrders(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không tải được đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [token, tab]);

  useEffect(() => { if (!authLoading) reload(); }, [authLoading, reload]);

  const confirm = async (id: string) => {
    if (!token) return;
    setBusy(id);
    try {
      await apiFetch(`/api/orders/${id}/confirm`, { method: "POST", token });
      await refresh();
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusy(null);
    }
  };

  const pay = async (id: string) => {
    if (!token) return;
    setBusy(id);
    try {
      await apiFetch(`/api/orders/${id}/pay`, { method: "POST", token });
      await refresh();
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusy(null);
    }
  };

  if (authLoading || loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
        <p className="text-sm text-text-muted">Vui lòng <Link href="/login" className="text-accent hover:underline">đăng nhập</Link> để xem đơn hàng.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-bg-card">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-2 text-sm">
        {tabs.map((t) => (
          <button
            key={t.v}
            onClick={() => setTab(t.v)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 ${tab === t.v ? "bg-brand text-white" : "text-text-muted hover:bg-bg-elev hover:text-text"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {err && <div className="m-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{err}</div>}

      {orders.length === 0 ? (
        <div className="p-12 text-center text-sm text-text-muted">
          Không có đơn nào. <Link href="/marketplace" className="text-accent hover:underline">Đi mua sắm</Link>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {orders.map((o) => {
            const feStatus = apiToFrontStatus[o.status] || "PENDING_PAYMENT";
            return (
              <li key={o.id} className="p-5">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-mono font-semibold text-text">{o.code}</span>
                  <OrderStatusBadge status={feStatus} />
                  <span className="text-text-dim">|</span>
                  <span className="text-text-muted">Đặt {formatRelativeTime(o.createdAt)}</span>
                  {(o.status === "Paid" || o.status === "Delivered") && o.escrowReleaseAt && (
                    <span className="rounded-md bg-warning/10 px-2 py-0.5 text-[11px] text-warning">
                      🔒 Escrow đến {new Date(o.escrowReleaseAt).toLocaleString("vi-VN")}
                    </span>
                  )}
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
                  <ul className="space-y-2">
                    {o.lines.map((l) => (
                      <li key={l.id} className="flex items-center gap-3 rounded-xl border border-border bg-bg-elev/40 p-3">
                        <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand text-white text-base font-bold">{l.title[0]}</div>
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-1 text-sm font-medium text-text">{l.title}</div>
                          <div className="text-xs text-text-muted">SL {l.quantity} · {l.delivery === "Auto" ? "⚡ Auto" : "👤 Manual"}</div>
                          {l.deliveredItems && l.deliveredItems.length > 0 && (
                            <div className="mt-1 break-all font-mono text-[11px] text-success">
                              ✓ {l.deliveredItems[0].slice(0, 100)}{l.deliveredItems[0].length > 100 ? "..." : ""}
                            </div>
                          )}
                        </div>
                        <div className="num text-sm font-semibold text-text">{formatVND(l.unitPrice * l.quantity)}</div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col items-end justify-between gap-3">
                    <div className="text-right">
                      <div className="text-xs text-text-muted">Tổng</div>
                      <div className="num text-xl font-extrabold text-accent">{formatVND(o.total)}</div>
                      <div className="text-xs text-text-muted">{o.paymentMethod}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {o.status === "Delivered" && (
                        <Button variant="success" size="sm" disabled={busy === o.id} onClick={() => confirm(o.id)} leftIcon={busy === o.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}>
                          Xác nhận đã nhận
                        </Button>
                      )}
                      {o.status === "PendingPayment" && (
                        <Button size="sm" disabled={busy === o.id} onClick={() => pay(o.id)}>
                          {busy === o.id ? "Đang xử lý..." : "Thanh toán ngay"}
                        </Button>
                      )}
                      {o.status === "Completed" && (
                        <Button variant="soft" size="sm" leftIcon={<Star className="size-3.5" />}>Đánh giá</Button>
                      )}
                      {o.status === "Dispute" && (
                        <Button variant="outline" size="sm" leftIcon={<AlertTriangle className="size-3.5" />}>Đang khiếu nại</Button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
