import {
  ArrowRight,
  Gift,
  Package,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { buyerNav } from "@/lib/buyerNav";
import { orders, walletTxns } from "@/lib/data";
import { formatRelativeTime, formatVND } from "@/lib/format";

export const metadata = { title: "Tài khoản | MMO Market" };

export default function AccountOverview() {
  const recentOrders = orders.slice(0, 4);
  const recentTxns = walletTxns.slice(0, 4);

  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Xin chào, Hiển 👋"
      subtitle="Hôm nay là một ngày tốt để săn deal!"
      topRight={
        <Link href="/marketplace">
          <Button variant="soft" size="sm">
            Tiếp tục mua sắm
          </Button>
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Số dư ví"
          value={formatVND(2_075_000)}
          delta="↑ +50K bonus tuần này"
          icon={<Wallet className="size-4" />}
          tone="accent"
        />
        <Stat
          label="Tổng đơn"
          value="42"
          delta="38 hoàn thành · 2 dispute"
          icon={<Package className="size-4" />}
          tone="brand"
        />
        <Stat
          label="Điểm thưởng"
          value="4.820"
          delta="Hạng Vàng — đổi thêm 10K điểm"
          icon={<Gift className="size-4" />}
          tone="warning"
        />
        <Stat
          label="Hoa hồng affiliate"
          value={formatVND(485_000)}
          delta="14 ref đã mua hàng"
          icon={<Users className="size-4" />}
          tone="success"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Orders */}
        <section className="lg:col-span-2 rounded-2xl border border-border bg-bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-text">Đơn hàng gần đây</h2>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              Xem tất cả <ArrowRight className="size-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentOrders.map((o) => (
              <li
                key={o.id}
                className="flex items-center gap-4 px-5 py-3 hover:bg-bg-elev/30"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-bg-elev text-text-muted">
                  <ShoppingBag className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-text">{o.id}</span>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                    {o.lines.map((l) => l.title).join(", ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="num text-sm font-semibold text-text">
                    {formatVND(o.total)}
                  </div>
                  <div className="text-xs text-text-muted">
                    {formatRelativeTime(o.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Wallet activity */}
        <section className="rounded-2xl border border-border bg-bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-text">Hoạt động ví</h2>
            <Link
              href="/account/wallet"
              className="text-xs text-accent hover:underline"
            >
              Chi tiết →
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentTxns.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className={`grid size-8 place-items-center rounded-lg text-xs ${
                    t.amount > 0
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {t.amount > 0 ? "+" : "−"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-xs text-text">
                    {t.note}
                  </div>
                  <div className="text-[11px] text-text-muted">
                    {formatRelativeTime(t.createdAt)} · {t.status === "pending" ? "Đang giữ" : "Hoàn tất"}
                  </div>
                </div>
                <div
                  className={`num text-sm font-semibold ${
                    t.amount > 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {t.amount > 0 ? "+" : ""}
                  {formatVND(t.amount)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Promo & loyalty */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-brand/30 to-bg-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">
            Hạng thành viên
          </div>
          <h3 className="mt-2 text-2xl font-extrabold text-text">Vàng 🥇</h3>
          <p className="mt-1 text-xs text-text-muted">
            Mua thêm {formatVND(2_500_000)} để lên hạng Kim cương — giảm 5% mọi đơn.
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-elev">
            <div className="h-full w-[65%] bg-gradient-to-r from-warning to-warning/60" />
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-text-muted">
            <span>4.820 / 7.500</span>
            <span>65%</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-accent/30 to-bg-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">
            Đổi điểm
          </div>
          <h3 className="mt-2 text-base font-bold text-text">
            100 điểm = 1.000₫ giảm giá
          </h3>
          <p className="mt-1 text-xs text-text-muted">
            Bạn có thể đổi tối đa {formatVND(48_000)} từ điểm hiện có.
          </p>
          <Button variant="soft" size="sm" className="mt-3">
            Đổi ngay
          </Button>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-success/20 to-bg-card p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-success">
            Affiliate
          </div>
          <h3 className="mt-2 text-base font-bold text-text">
            Link ref của bạn
          </h3>
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-bg-elev px-3 py-2 text-xs">
            <span className="font-mono text-accent">mmomkt.vn/ref/hientv2272</span>
            <button className="ml-auto rounded-md bg-bg-card px-2 py-1 text-text hover:bg-bg-card/60">
              Copy
            </button>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Đã giới thiệu 14 người · Hoa hồng tích luỹ {formatVND(485_000)}.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
