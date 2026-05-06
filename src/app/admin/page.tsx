import {
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingBag,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";
import { adminNav } from "@/lib/adminNav";
import { adminMetrics, orders, sellers } from "@/lib/data";
import { formatNumber, formatRelativeTime, formatVND } from "@/lib/format";

export const metadata = { title: "Admin | MMO Market" };

const trend = [40, 52, 48, 65, 72, 88, 84, 96, 110, 124, 118, 142, 158, 168];

export default function AdminDashboard() {
  return (
    <DashboardLayout
      variant="admin"
      groups={adminNav}
      title="Admin Dashboard"
      subtitle="Tổng quan toàn sàn — cập nhật realtime"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="GMV 30 ngày"
          value={formatVND(adminMetrics.gmv)}
          delta={
            <span className="inline-flex items-center gap-0.5 text-success">
              <ArrowUpRight className="size-3" /> +24.6%
            </span>
          }
          icon={<DollarSign className="size-4" />}
          tone="success"
        />
        <Stat
          label="Doanh thu sàn"
          value={formatVND(adminMetrics.revenue)}
          delta="Phí 4-6%"
          icon={<DollarSign className="size-4" />}
          tone="brand"
        />
        <Stat
          label="Đơn hoàn tất"
          value={formatNumber(adminMetrics.ordersCompleted)}
          delta="98.4% success rate"
          icon={<ShoppingBag className="size-4" />}
          tone="accent"
        />
        <Stat
          label="Người dùng mới"
          value={formatNumber(adminMetrics.newUsers)}
          delta={
            <span className="inline-flex items-center gap-0.5 text-success">
              <ArrowUpRight className="size-3" /> +12% so với tháng trước
            </span>
          }
          icon={<Users className="size-4" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Trend */}
        <section className="lg:col-span-2 rounded-2xl border border-border bg-bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text">GMV theo ngày</h2>
              <p className="text-xs text-text-muted">14 ngày gần nhất</p>
            </div>
            <div className="flex gap-1 text-xs">
              {["7D", "14D", "30D", "90D", "1Y"].map((p, i) => (
                <button
                  key={p}
                  className={`rounded-md px-2.5 py-1 ${
                    i === 1
                      ? "bg-brand text-white"
                      : "bg-bg-elev text-text-muted hover:text-text"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex h-56 items-end gap-1.5">
            {trend.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-brand/40 via-fuchsia-500/40 to-accent transition hover:from-brand/60"
                style={{ height: `${(v / Math.max(...trend)) * 100}%` }}
              />
            ))}
          </div>
        </section>

        {/* Top categories */}
        <section className="rounded-2xl border border-border bg-bg-card p-5">
          <h2 className="text-base font-bold text-text">GMV theo danh mục</h2>
          <ul className="mt-4 space-y-3">
            {[
              ["Tài khoản AI", 32, "from-violet-500 to-fuchsia-500"],
              ["Tool / Phần mềm", 24, "from-cyan-500 to-blue-500"],
              ["Khoá học", 16, "from-emerald-500 to-teal-500"],
              ["Gift Card", 12, "from-pink-500 to-rose-500"],
              ["Game", 9, "from-orange-500 to-red-500"],
              ["Khác", 7, "from-slate-500 to-slate-600"],
            ].map(([name, pct, grad]) => (
              <li key={String(name)}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text">{name}</span>
                  <span className="num text-text-muted">{pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg-elev">
                  <div
                    className={`h-full bg-gradient-to-r ${grad}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Action queues */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "KYC chờ duyệt",
            value: adminMetrics.kycPending,
            icon: <ShieldCheck className="size-4" />,
            tone: "warning" as const,
            href: "/admin/sellers",
          },
          {
            title: "Sản phẩm chờ duyệt",
            value: adminMetrics.productsPending,
            icon: <Package className="size-4" />,
            tone: "brand" as const,
            href: "/admin/products",
          },
          {
            title: "Tranh chấp đang mở",
            value: adminMetrics.openDisputes,
            icon: <AlertTriangle className="size-4" />,
            tone: "danger" as const,
            href: "/admin/disputes",
          },
        ].map((q) => (
          <Link
            key={q.title}
            href={q.href}
            className="rounded-2xl border border-border bg-bg-card p-5 transition hover:border-brand/60"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-text-muted">
                {q.title}
              </div>
              <ArrowUpRight className="size-4 text-text-muted" />
            </div>
            <div className="num mt-2 text-3xl font-extrabold text-text">{q.value}</div>
            <div className="mt-1 text-xs text-text-muted">Cần xử lý ngay</div>
          </Link>
        ))}
      </div>

      {/* Recent orders + top sellers */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-text">Đơn hàng mới nhất</h2>
            <Link href="/admin/orders" className="text-xs text-accent hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-text-muted">
              <tr>
                <th className="px-5 py-3">Mã</th>
                <th className="px-5 py-3">Buyer</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Tổng</th>
                <th className="px-5 py-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-bg-elev/30">
                  <td className="px-5 py-3 font-mono text-text">{o.id}</td>
                  <td className="px-5 py-3 text-text-muted">@{o.buyerName}</td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="num px-5 py-3 text-right font-semibold text-text">
                    {formatVND(o.total)}
                  </td>
                  <td className="px-5 py-3 text-right text-xs text-text-muted">
                    {formatRelativeTime(o.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-2xl border border-border bg-bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-text">Top seller</h2>
            <Link href="/admin/sellers" className="text-xs text-accent hover:underline">
              Quản lý →
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {sellers.slice(0, 6).map((s, i) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                <span className="num size-5 grid place-items-center rounded-md bg-bg-elev text-[10px] font-bold text-text-muted">
                  {i + 1}
                </span>
                <div
                  className="grid size-9 place-items-center rounded-full text-xs font-bold text-white"
                  style={{ background: s.avatarColor }}
                >
                  {s.username[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-text">@{s.username}</div>
                  <div className="text-[11px] text-text-muted">
                    {formatNumber(s.totalSold)} đơn · {s.rating}★
                  </div>
                </div>
                {s.badge && (
                  <Badge tone={s.badge === "top" ? "brand" : "success"}>
                    {s.badge.toUpperCase()}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}
