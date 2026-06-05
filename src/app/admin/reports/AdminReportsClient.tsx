"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle, BarChart2, DollarSign, Loader2,
  Package, ShoppingBag, Star, TrendingUp, Users, Wallet,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Stat } from "@/components/ui/Stat";
import { adminNav } from "@/lib/adminNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiAdminReport, KvDecimal, KvInt, TopProductDto, TopUserDto } from "@/lib/apiTypes";
import { formatVND } from "@/lib/format";

// ── Helpers ───────────────────────────────────────────────────────────────
const STATUS_VI: Record<string, string> = {
  PendingPayment: "Chờ TT", EscrowLocked: "Đã vào escrow", Delivering: "Đang bàn giao",
  Checking: "Đang kiểm tra", Completed: "Hoàn thành", Disputed: "Tranh chấp",
  Refunded: "Hoàn tiền", Cancelled: "Đã hủy",
  Buyer: "Người mua", Seller: "Người bán", Ctv: "CTV", Admin: "Admin", SuperAdmin: "Super Admin",
  None: "Chưa KYC", Pending: "Chờ duyệt", Approved: "Đã KYC", Rejected: "Bị từ chối",
  Draft: "Nháp", Active: "Đang bán", Hidden: "Ẩn", OutOfStock: "Hết hàng", Banned: "Đã khóa",
  Open: "Mở", Investigating: "Đang xử lý", Resolved: "Đã giải quyết", Closed: "Đóng",
  Wallet: "Ví nội bộ", VietQr: "VietQR", Momo: "MoMo", ZaloPay: "ZaloPay",
  VnPay: "VNPay", Usdt: "USDT", Btc: "BTC",
};

const BAR_COLORS = [
  "bg-brand", "bg-accent", "bg-success", "bg-warning",
  "bg-danger", "bg-brand/60", "bg-accent/60", "bg-success/60",
];

function BarChart({ data, valueFormat = (v: number) => String(v) }: {
  data: (KvInt | KvDecimal)[];
  valueFormat?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.key} className="flex items-center gap-3 text-sm">
          <div className="w-28 shrink-0 truncate text-xs text-text-muted">
            {STATUS_VI[d.key] ?? d.key}
          </div>
          <div className="flex-1 overflow-hidden rounded-full bg-bg-elev">
            <div
              className={`h-5 rounded-full transition-all ${BAR_COLORS[i % BAR_COLORS.length]}`}
              style={{ width: `${Math.max((d.value / max) * 100, 2)}%` }}
            />
          </div>
          <div className="w-24 shrink-0 text-right text-xs font-semibold text-text">
            {valueFormat(d.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-xl bg-brand/10 text-brand">{icon}</div>
        <h2 className="text-sm font-bold text-text">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export function AdminReportsClient() {
  const { token } = useAuth();
  const [data, setData] = useState<ApiAdminReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<ApiAdminReport>("/api/admin/reports", { token })
      .then(setData)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <DashboardLayout
      variant="admin"
      groups={adminNav}
      title="Báo cáo"
      subtitle="Phân tích toàn diện hoạt động của sàn"
    >
      {loading && (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-8 animate-spin text-text-muted" />
        </div>
      )}

      {err && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">{err}</div>
      )}

      {data && (
        <div className="space-y-6">

          {/* ── KPI Overview ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Tổng GMV"       value={formatVND(data.totalGmv)}     delta="Tất cả thời gian (không hủy)"  icon={<DollarSign className="size-4" />} tone="success" />
            <Stat label="Doanh thu sàn"  value={formatVND(data.totalRevenue)}  delta="5% của GMV"                    icon={<TrendingUp className="size-4" />} tone="brand"   />
            <Stat label="Tổng đơn hàng" value={data.totalOrders.toLocaleString("vi")} delta={`${data.orderByStatus.find(s => s.key === "Completed")?.value ?? 0} hoàn thành`} icon={<ShoppingBag className="size-4" />} tone="accent" />
            <Stat label="Người dùng"    value={data.totalUsers.toLocaleString("vi")} delta={`${data.totalSellers} người bán`} icon={<Users className="size-4" />} tone="warning" />
          </div>

          {/* ── Row 2: Orders + Users ── */}
          <div className="grid gap-6 lg:grid-cols-2">

            <Section title="Đơn hàng theo trạng thái" icon={<ShoppingBag className="size-4" />}>
              <BarChart data={data.orderByStatus} />
            </Section>

            <Section title="Người dùng theo vai trò" icon={<Users className="size-4" />}>
              <BarChart data={data.userByRole} />
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">Tình trạng KYC</p>
                <BarChart data={data.userByKyc} />
              </div>
            </Section>
          </div>

          {/* ── Row 3: Revenue + Wallet ── */}
          <div className="grid gap-6 lg:grid-cols-2">

            <Section title="Doanh thu theo phương thức TT" icon={<DollarSign className="size-4" />}>
              <BarChart data={data.revenueByPayment} valueFormat={formatVND} />
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">Số lượng đơn theo PTTT</p>
                <BarChart data={data.orderByPayment} />
              </div>
            </Section>

            <Section title="Tổng quan ví hệ thống" icon={<Wallet className="size-4" />}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Tổng nạp",      value: data.totalTopup,     color: "text-success" },
                  { label: "Tổng mua hàng", value: data.totalPurchase,  color: "text-brand"   },
                  { label: "Tổng hoàn tiền",value: data.totalRefund,    color: "text-warning" },
                  { label: "Tổng rút",      value: data.totalWithdraw,  color: "text-danger"  },
                  { label: "Số dư hệ thống",value: data.totalWalletBalance, color: "text-accent" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-bg-elev p-3">
                    <p className="text-xs text-text-muted">{item.label}</p>
                    <p className={`num mt-1 text-base font-bold ${item.color}`}>{formatVND(item.value)}</p>
                  </div>
                ))}
                <div className="rounded-xl border border-border bg-bg-elev p-3">
                  <p className="text-xs text-text-muted">Tranh chấp</p>
                  <p className="num mt-1 text-base font-bold text-danger">{data.totalDisputes}</p>
                </div>
              </div>
              {data.disputeByStatus.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">Tranh chấp theo trạng thái</p>
                  <BarChart data={data.disputeByStatus} />
                </div>
              )}
            </Section>
          </div>

          {/* ── Row 4: Products ── */}
          <div className="grid gap-6 lg:grid-cols-2">

            <Section title="Sản phẩm theo trạng thái / danh mục" icon={<Package className="size-4" />}>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Tổng SP",   value: data.totalProducts },
                  { label: "Đã bán",    value: data.totalSold     },
                  { label: "Đang bán",  value: data.productByStatus.find(s => s.key === "Active")?.value ?? 0 },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-bg-elev p-3 text-center">
                    <p className="text-xs text-text-muted">{s.label}</p>
                    <p className="mt-1 text-lg font-bold text-text">{s.value.toLocaleString("vi")}</p>
                  </div>
                ))}
              </div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">Theo danh mục</p>
              <BarChart data={data.productByCategory} />
            </Section>

            <Section title="Top 10 sản phẩm bán chạy" icon={<Star className="size-4" />}>
              <TopProductsTable items={data.topProducts} />
            </Section>
          </div>

          {/* ── Row 5: Top Buyers ── */}
          <Section title="Top 10 khách hàng chi tiêu nhiều nhất" icon={<BarChart2 className="size-4" />}>
            <TopBuyersTable items={data.topBuyers} />
          </Section>

        </div>
      )}
    </DashboardLayout>
  );
}

// ── Sub-tables ────────────────────────────────────────────────────────────
function TopProductsTable({ items }: { items: TopProductDto[] }) {
  if (items.length === 0) return <p className="text-xs text-text-muted">Chưa có dữ liệu</p>;
  const max = items[0]?.sold ?? 1;
  return (
    <div className="space-y-2">
      {items.map((p, i) => (
        <div key={p.title} className="flex items-center gap-3">
          <span className="w-5 shrink-0 text-center text-xs font-bold text-text-dim">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-text">{p.title}</p>
            <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-elev">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(p.sold / max) * 100}%` }} />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold text-text">{p.sold.toLocaleString("vi")} đã bán</p>
            <p className="text-[10px] text-text-muted">@{p.sellerUsername}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopBuyersTable({ items }: { items: TopUserDto[] }) {
  if (items.length === 0) return <p className="text-xs text-text-muted">Chưa có dữ liệu</p>;
  const max = items[0]?.total ?? 1;
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((u, i) => (
        <div key={u.username} className="flex items-center gap-3 rounded-xl border border-border bg-bg-elev p-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-white"
            style={{ background: u.avatarColor }}>
            {u.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-text">#{i + 1} @{u.username}</p>
            <p className="num text-xs text-accent">{formatVND(u.total)}</p>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-bg-card">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(u.total / max) * 100}%` }} />
            </div>
            <p className="mt-0.5 text-[10px] text-text-dim">{u.orderCount} đơn</p>
          </div>
        </div>
      ))}
    </div>
  );
}
