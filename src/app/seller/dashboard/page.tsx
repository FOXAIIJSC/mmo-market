import {
  ArrowDownRight,
  ArrowUpRight,
  Box,
  DollarSign,
  Package,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { sellerNav } from "@/lib/sellerNav";
import { orders, products } from "@/lib/data";
import { formatNumber, formatRelativeTime, formatVND } from "@/lib/format";

export const metadata = { title: "Seller Dashboard | MMO Market" };

const trendData = [62, 78, 65, 90, 85, 110, 125, 98, 132, 140, 128, 156, 170, 165];

export default function SellerDashboard() {
  return (
    <DashboardLayout
      variant="seller"
      groups={sellerNav}
      title="Kênh người bán"
      subtitle="Tổng quan kinh doanh 30 ngày · Cập nhật 1 phút trước"
      topRight={
        <>
          <Button variant="outline" size="sm">
            Xuất báo cáo
          </Button>
          <Link href="/seller/products/new">
            <Button size="sm">+ Thêm sản phẩm</Button>
          </Link>
        </>
      }
    >
      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Doanh thu 30 ngày"
          value={formatVND(124_580_000)}
          delta={
            <span className="inline-flex items-center gap-0.5 text-success">
              <ArrowUpRight className="size-3" /> 18.4%
            </span>
          }
          icon={<DollarSign className="size-4" />}
          tone="success"
        />
        <Stat
          label="Đơn hoàn thành"
          value="842"
          delta={
            <span className="inline-flex items-center gap-0.5 text-success">
              <ArrowUpRight className="size-3" /> 12 đơn hôm nay
            </span>
          }
          icon={<ShoppingBag className="size-4" />}
          tone="brand"
        />
        <Stat
          label="Tỷ lệ huỷ"
          value="1.2%"
          delta={
            <span className="inline-flex items-center gap-0.5 text-success">
              <ArrowDownRight className="size-3" /> -0.3%
            </span>
          }
          tone="warning"
        />
        <Stat
          label="Rating shop"
          value={
            <span className="flex items-center gap-1">
              4.92 <Star className="size-4 fill-warning text-warning" />
            </span>
          }
          delta="2.843 đánh giá · 96% 5 sao"
          tone="accent"
        />
      </div>

      {/* Trend chart */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text">Doanh thu theo ngày</h2>
              <p className="text-xs text-text-muted">14 ngày gần nhất</p>
            </div>
            <div className="flex gap-1 text-xs">
              {["7D", "14D", "30D", "90D"].map((p, i) => (
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
          <div className="mt-6 flex h-48 items-end gap-1.5">
            {trendData.map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md bg-gradient-to-t from-brand/40 to-accent transition hover:from-brand/60"
                style={{ height: `${(v / Math.max(...trendData)) * 100}%` }}
                title={`Day ${i + 1}: ${v}`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
            <span>10 ngày trước</span>
            <span>Hôm nay</span>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-bg-card p-5">
          <h2 className="text-base font-bold text-text">Sản phẩm bán chạy</h2>
          <ul className="mt-3 space-y-3">
            {products.slice(0, 5).map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="num size-5 shrink-0 grid place-items-center rounded-md bg-bg-elev text-[10px] font-bold text-text-muted">
                  {i + 1}
                </span>
                <div
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold text-white"
                  style={{ background: p.thumbnailColor }}
                >
                  {p.thumbnailIcon ?? p.title[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-xs text-text">{p.title}</div>
                  <div className="text-[11px] text-text-muted">
                    {formatNumber(p.sold)} đã bán
                  </div>
                </div>
                <div className="num text-xs font-semibold text-success">
                  {formatVND(p.price * p.sold).replace(/\s?₫/, "")}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Stat
          label="Sản phẩm đang bán"
          value={products.length}
          delta="3 đang chờ duyệt"
          icon={<Box className="size-4" />}
        />
        <Stat
          label="Kho auto-delivery"
          value="2.480"
          delta="124 sản phẩm sắp hết"
          icon={<Package className="size-4" />}
        />
        <Stat
          label="Khách quay lại"
          value="38.6%"
          delta="312 khách trong tháng"
          icon={<Users className="size-4" />}
        />
        <Stat
          label="Tỷ lệ phản hồi"
          value="98%"
          delta="Trung bình 12 phút"
        />
      </div>

      {/* Recent orders */}
      <section className="mt-6 rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-text">Đơn hàng cần xử lý</h2>
          <Link href="/seller/orders" className="text-xs text-accent hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">Mã đơn</th>
              <th className="px-5 py-3">Sản phẩm</th>
              <th className="px-5 py-3">Khách</th>
              <th className="px-5 py-3">Trạng thái</th>
              <th className="px-5 py-3 text-right">Tổng</th>
              <th className="px-5 py-3 text-right">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.slice(0, 5).map((o) => (
              <tr key={o.id} className="hover:bg-bg-elev/30">
                <td className="px-5 py-3">
                  <span className="font-mono text-text">{o.id}</span>
                </td>
                <td className="px-5 py-3 line-clamp-1 max-w-xs text-text-muted">
                  {o.lines[0].title}
                </td>
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
    </DashboardLayout>
  );
}
