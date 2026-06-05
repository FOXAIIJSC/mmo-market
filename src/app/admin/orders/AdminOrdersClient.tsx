"use client";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle, CheckCircle2, ChevronDown, ChevronRight,
  Loader2, Package, Search, ShoppingBag, X,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminNav } from "@/lib/adminNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiAdminOrder } from "@/lib/apiTypes";
import { formatRelativeTime, formatVND } from "@/lib/format";

// ── Config ────────────────────────────────────────────────────────────────
type StatusTab = "all" | "PendingPayment" | "EscrowLocked" | "Delivering" | "Checking" | "Completed" | "Disputed" | "Refunded" | "Cancelled";

const STATUS_TABS: { v: StatusTab; label: string }[] = [
  { v: "all",            label: "Tất cả"       },
  { v: "PendingPayment", label: "Chờ TT"       },
  { v: "EscrowLocked",   label: "Đã vào escrow" },
  { v: "Delivering",     label: "Đang bàn giao" },
  { v: "Checking",       label: "Đang kiểm tra" },
  { v: "Completed",      label: "Hoàn thành"   },
  { v: "Disputed",       label: "Tranh chấp"   },
  { v: "Refunded",       label: "Hoàn tiền"    },
  { v: "Cancelled",      label: "Đã hủy"       },
];

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "brand" | "accent" | "muted"> = {
  PendingPayment: "warning",
  EscrowLocked:   "brand",
  Delivering:     "accent",
  Checking:       "success",
  Completed:      "success",
  Disputed:       "danger",
  Refunded:       "warning",
  Cancelled:      "muted",
};

const STATUS_VI: Record<string, string> = {
  PendingPayment: "Chờ thanh toán",
  EscrowLocked:   "Đã vào escrow",
  Delivering:     "Đang bàn giao",
  Checking:       "Đang kiểm tra",
  Completed:      "Hoàn thành",
  Disputed:       "Tranh chấp",
  Refunded:       "Đã hoàn tiền",
  Cancelled:      "Đã hủy",
};

// Actions allowed per status
const ACTIONS: Record<string, { label: string; newStatus: string; tone: "danger" | "warning" | "success" }[]> = {
  PendingPayment: [{ label: "Hủy đơn",    newStatus: "Cancelled",  tone: "danger"  }],
  EscrowLocked:   [{ label: "Hoàn tiền",  newStatus: "Refunded",   tone: "warning" },
                   { label: "Hủy đơn",    newStatus: "Cancelled",  tone: "danger"  }],
  Delivering:     [{ label: "Hoàn tiền",  newStatus: "Refunded",   tone: "warning" }],
  Checking:       [{ label: "Xác nhận hoàn thành", newStatus: "Completed", tone: "success" },
                   { label: "Hoàn tiền",  newStatus: "Refunded",   tone: "warning" }],
  Disputed:       [{ label: "Hoàn tiền",  newStatus: "Refunded",   tone: "warning" },
                   { label: "Đóng tranh chấp → Hoàn thành", newStatus: "Completed", tone: "success" }],
};

// ── Confirm Action Modal ──────────────────────────────────────────────────
function ConfirmModal({
  order, action, token, onClose, onDone,
}: {
  order: ApiAdminOrder;
  action: { label: string; newStatus: string; tone: "danger" | "warning" | "success" };
  token: string;
  onClose: () => void;
  onDone: (updated: ApiAdminOrder) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const confirm = async () => {
    setLoading(true); setErr(null);
    try {
      const updated = await apiFetch<ApiAdminOrder>(`/api/admin/orders/${order.id}/status`, {
        method: "PUT", token,
        body: JSON.stringify({ status: action.newStatus }),
      });
      onDone(updated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  const isRefund = action.newStatus === "Refunded" || action.newStatus === "Cancelled";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="text-base font-bold text-text">{action.label}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-text-muted hover:bg-bg-elev">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-bg-elev p-4 text-sm">
          <p className="font-mono font-bold text-text">{order.code}</p>
          <p className="mt-1 text-xs text-text-muted">@{order.buyerUsername} · {formatVND(order.total)}</p>
          <p className="mt-1 text-xs text-text-muted">
            {order.lines.map((l) => l.title).join(", ")}
          </p>
        </div>

        {isRefund && order.paymentMethod === "Wallet" && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-xs text-success">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>
              <strong>{formatVND(order.total)}</strong> sẽ được hoàn vào ví của{" "}
              <strong>@{order.buyerUsername}</strong>.
            </span>
          </div>
        )}

        {err && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="size-4 shrink-0" />{err}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button
            className="flex-1"
            variant={action.tone === "danger" ? "danger" : "primary"}
            onClick={confirm}
            disabled={loading}
          >
            {loading ? <><Loader2 className="mr-1.5 inline size-4 animate-spin" />Đang xử lý...</> : "Xác nhận"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Order Row ─────────────────────────────────────────────────────────────
function OrderRow({
  order, token, onUpdate,
}: {
  order: ApiAdminOrder;
  token: string;
  onUpdate: (updated: ApiAdminOrder) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(typeof ACTIONS)[string][0] | null>(null);
  const actions = ACTIONS[order.status] ?? [];

  return (
    <>
      <tr className="hover:bg-bg-elev/30">
        {/* Expand toggle + code */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setExpanded((v) => !v)} className="text-text-muted hover:text-text">
              {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
            <span className="font-mono text-sm font-semibold text-text">{order.code}</span>
          </div>
          <p className="ml-6 mt-0.5 text-xs text-text-muted">{formatRelativeTime(order.createdAt)}</p>
        </td>

        {/* Buyer */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className="grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
              style={{ background: order.buyerAvatarColor }}
            >
              {order.buyerUsername.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-text">@{order.buyerUsername}</p>
              <p className="text-xs text-text-muted">{order.buyerEmail}</p>
            </div>
          </div>
        </td>

        {/* Products summary */}
        <td className="px-4 py-3">
          <p className="line-clamp-1 text-sm text-text">
            {order.lines.map((l) => l.title).join(", ")}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            {order.lines.length} sản phẩm · {order.paymentMethod}
          </p>
        </td>

        {/* Total */}
        <td className="px-4 py-3 text-right">
          <p className="num font-bold text-text">{formatVND(order.total)}</p>
          {order.discount > 0 && (
            <p className="num text-xs text-success">-{formatVND(order.discount)}</p>
          )}
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <Badge tone={STATUS_TONE[order.status] ?? "muted"}>
            {STATUS_VI[order.status] ?? order.status}
          </Badge>
        </td>

        {/* Actions */}
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            {actions.map((a) => (
              <Button
                key={a.newStatus}
                size="sm"
                variant={a.tone === "danger" ? "danger" : a.tone === "warning" ? "outline" : "soft"}
                onClick={() => setConfirmAction(a)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr>
          <td colSpan={6} className="bg-bg-elev/20 px-4 py-3">
            <div className="ml-6 space-y-2 text-xs">
              {order.lines.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Package className="size-3.5 text-text-muted" />
                    <span className="font-medium text-text">{l.title}</span>
                    <span className="text-text-muted">x{l.quantity}</span>
                    <Badge tone="muted">{l.delivery}</Badge>
                  </div>
                  <span className="num font-semibold text-text">{formatVND(l.unitPrice * l.quantity)}</span>
                </div>
              ))}
              <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-text-muted">
                <span>Tạm tính: <span className="num text-text">{formatVND(order.subtotal)}</span></span>
                {order.discount > 0 && <span>Giảm giá: <span className="num text-success">-{formatVND(order.discount)}</span></span>}
                {order.fee > 0 && <span>Phí: <span className="num text-text">{formatVND(order.fee)}</span></span>}
                {order.note && <span>Ghi chú: <span className="italic text-text">{order.note}</span></span>}
                {order.paidAt && <span>Thanh toán: {new Date(order.paidAt).toLocaleString("vi-VN")}</span>}
                {order.deliveredAt && <span>Giao hàng: {new Date(order.deliveredAt).toLocaleString("vi-VN")}</span>}
                {order.completedAt && <span>Hoàn thành: {new Date(order.completedAt).toLocaleString("vi-VN")}</span>}
              </div>
            </div>
          </td>
        </tr>
      )}

      {confirmAction && (
        <ConfirmModal
          order={order}
          action={confirmAction}
          token={token}
          onClose={() => setConfirmAction(null)}
          onDone={(updated) => { onUpdate(updated); setConfirmAction(null); }}
        />
      )}
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export function AdminOrdersClient() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<ApiAdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<StatusTab>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setErr(null);
    try {
      const statusParam = tab !== "all" ? `&status=${tab}` : "";
      const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
      const data = await apiFetch<ApiAdminOrder[]>(`/api/admin/orders?${statusParam}${searchParam}`, { token });
      setOrders(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [token, tab, search]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = (updated: ApiAdminOrder) =>
    setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));

  // Stats
  const byStatus = (s: string) => orders.filter((o) => o.status === s).length;
  const stats = [
    { label: "Tổng đơn",     value: orders.length,            color: "bg-accent/10 text-accent"   },
    { label: "Hoàn thành",   value: byStatus("Completed"),    color: "bg-success/10 text-success" },
    { label: "Tranh chấp",   value: byStatus("Disputed"),     color: "bg-danger/10 text-danger"   },
    { label: "Chờ xử lý",   value: byStatus("Delivering") + byStatus("EscrowLocked") + byStatus("PendingPayment"), color: "bg-warning/10 text-warning" },
  ];

  return (
    <DashboardLayout
      variant="admin"
      groups={adminNav}
      title="Đơn hàng"
      subtitle="Quản lý và xử lý tất cả đơn hàng trên hệ thống"
    >
      {/* Stats */}
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border bg-bg-card p-4">
            <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${s.color}`}>
              <ShoppingBag className="size-4" />
            </div>
            <div>
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className="text-xl font-bold text-text">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-4 space-y-3">
        {/* Status tabs — scrollable */}
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-bg-elev p-1 text-sm no-scrollbar">
          {STATUS_TABS.map((t) => {
            const count = t.v === "all" ? orders.length : byStatus(t.v);
            return (
              <button
                key={t.v}
                onClick={() => setTab(t.v)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                  tab === t.v ? "bg-bg-card text-text shadow-sm" : "text-text-muted hover:text-text"
                }`}
              >
                {t.label}
                {count > 0 && tab !== t.v && (
                  <span className="rounded-full bg-bg-card px-1.5 text-[10px]">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn, username, email..."
            className="h-9 w-full rounded-lg border border-border bg-bg-elev pl-9 pr-3 text-sm text-text outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="size-6 animate-spin text-text-muted" />
          </div>
        ) : err ? (
          <div className="p-6 text-sm text-danger">{err}</div>
        ) : orders.length === 0 ? (
          <div className="grid place-items-center gap-2 py-16">
            <ShoppingBag className="size-10 text-border" />
            <p className="text-sm text-text-muted">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Người mua</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <OrderRow key={o.id} order={o} token={token!} onUpdate={handleUpdate} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="border-t border-border px-4 py-2.5 text-xs text-text-muted">
            {orders.length} đơn hàng{tab !== "all" ? ` · ${STATUS_VI[tab] ?? tab}` : ""}
            {search ? ` · Tìm kiếm: "${search}"` : ""}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
