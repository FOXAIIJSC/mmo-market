import Link from "next/link";
import { Eye, MessageCircle, AlertTriangle, Star } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/Button";
import { buyerNav } from "@/lib/buyerNav";
import { orders } from "@/lib/data";
import { formatRelativeTime, formatVND } from "@/lib/format";

export const metadata = { title: "Đơn hàng của tôi | MMO Market" };

const tabs = [
  { v: "all", label: "Tất cả" },
  { v: "pending", label: "Chờ thanh toán" },
  { v: "processing", label: "Đang xử lý" },
  { v: "delivered", label: "Đã giao" },
  { v: "completed", label: "Hoàn thành" },
  { v: "dispute", label: "Tranh chấp" },
  { v: "cancelled", label: "Đã huỷ" },
];

export default function OrdersPage() {
  return (
    <DashboardLayout variant="buyer" groups={buyerNav} title="Đơn hàng">
      <div className="rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-2 text-sm">
          {tabs.map((t, i) => (
            <button
              key={t.v}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 ${
                i === 0
                  ? "bg-brand text-white"
                  : "text-text-muted hover:bg-bg-elev hover:text-text"
              }`}
            >
              {t.label}
            </button>
          ))}
          <input
            placeholder="Tìm theo mã đơn / sản phẩm..."
            className="ml-auto h-9 w-64 rounded-full border border-border bg-bg-elev px-4 text-xs text-text placeholder:text-text-dim outline-none focus:border-brand"
          />
        </div>

        <ul className="divide-y divide-border">
          {orders.map((o) => (
            <li key={o.id} className="p-5">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-mono font-semibold text-text">
                  {o.id}
                </span>
                <OrderStatusBadge status={o.status} />
                <span className="text-text-dim">|</span>
                <span className="text-text-muted">
                  Đặt lúc {formatRelativeTime(o.createdAt)}
                </span>
                {(o.status === "PAID" || o.status === "DELIVERED") && (
                  <span className="rounded-md bg-warning/10 px-2 py-0.5 text-[11px] text-warning">
                    🔒 Escrow 72h
                  </span>
                )}
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
                <ul className="space-y-2">
                  {o.lines.map((l) => (
                    <li
                      key={l.productId}
                      className="flex items-center gap-3 rounded-xl border border-border bg-bg-elev/40 p-3"
                    >
                      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand text-white text-base font-bold">
                        {l.title[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm font-medium text-text">
                          {l.title}
                        </div>
                        <div className="text-xs text-text-muted">
                          SL {l.quantity} · {l.delivery === "auto" ? "⚡ Auto" : "👤 Manual"}
                        </div>
                        {l.deliveredItems && l.deliveredItems.length > 0 && (
                          <div className="mt-1 font-mono text-[11px] text-success">
                            ✓ Đã nhận: {l.deliveredItems[0].account}
                            {l.deliveredItems.length > 1 && ` (+${l.deliveredItems.length - 1})`}
                          </div>
                        )}
                      </div>
                      <div className="num text-sm font-semibold text-text">
                        {formatVND(l.unitPrice * l.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col items-end justify-between gap-3">
                  <div className="text-right">
                    <div className="text-xs text-text-muted">Tổng</div>
                    <div className="num text-xl font-extrabold text-accent">
                      {formatVND(o.total)}
                    </div>
                    <div className="text-xs text-text-muted">
                      {o.paymentMethod === "wallet"
                        ? "Ví nội bộ"
                        : o.paymentMethod.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/account/orders/${o.id}`}>
                      <Button variant="outline" size="sm" leftIcon={<Eye className="size-3.5" />}>
                        Chi tiết
                      </Button>
                    </Link>
                    {o.status === "DELIVERED" && (
                      <>
                        <Button variant="success" size="sm">Xác nhận đã nhận</Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<AlertTriangle className="size-3.5" />}
                        >
                          Khiếu nại
                        </Button>
                      </>
                    )}
                    {o.status === "COMPLETED" && (
                      <Button variant="soft" size="sm" leftIcon={<Star className="size-3.5" />}>
                        Đánh giá
                      </Button>
                    )}
                    {o.status === "PROCESSING" && (
                      <Button variant="outline" size="sm" leftIcon={<MessageCircle className="size-3.5" />}>
                        Chat seller
                      </Button>
                    )}
                    {o.status === "PENDING_PAYMENT" && (
                      <Button size="sm">Thanh toán ngay</Button>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-text-muted">
          <span>Hiển thị {orders.length} / 42 đơn</span>
          <div className="flex items-center gap-1">
            <button className="rounded-md border border-border px-2 py-1 hover:border-brand">‹</button>
            <button className="rounded-md bg-brand px-2 py-1 text-white">1</button>
            <button className="rounded-md border border-border px-2 py-1 hover:border-brand">2</button>
            <button className="rounded-md border border-border px-2 py-1 hover:border-brand">3</button>
            <button className="rounded-md border border-border px-2 py-1 hover:border-brand">›</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
