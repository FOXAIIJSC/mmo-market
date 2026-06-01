"use client";
import { useEffect, useState } from "react";
import { BarChart2, DollarSign, Loader2, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { sellerNav } from "@/lib/sellerNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiSellerDashboard, ApiSellerOrderLine } from "@/lib/apiTypes";
import { formatVND } from "@/lib/format";

export function SellerFinanceClient() {
  const { token } = useAuth();
  const [dash, setDash] = useState<ApiSellerDashboard | null>(null);
  const [orders, setOrders] = useState<ApiSellerOrderLine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiFetch<ApiSellerDashboard>("/api/seller/dashboard", { token }),
      apiFetch<ApiSellerOrderLine[]>("/api/seller/orders?status=Completed", { token }),
    ]).then(([d, o]) => { setDash(d); setOrders(o); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <DashboardLayout variant="seller" groups={sellerNav} title="Doanh thu" subtitle="">
      <div className="grid place-items-center py-20"><Loader2 className="size-8 animate-spin text-text-muted" /></div>
    </DashboardLayout>
  );

  const totalRevenue = orders.reduce((s, o) => s + o.lineTotal, 0);
  const feeRate = 0.05;
  const netRevenue = totalRevenue * (1 - feeRate);

  return (
    <DashboardLayout variant="seller" groups={sellerNav} title="Doanh thu" subtitle="Thống kê tài chính và lịch sử giao dịch">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { label: "Doanh thu 30 ngày", value: formatVND(dash?.revenue30d ?? 0), icon: <TrendingUp className="size-4" />, color: "text-success" },
          { label: "Tổng doanh thu", value: formatVND(totalRevenue), icon: <DollarSign className="size-4" />, color: "text-brand" },
          { label: "Sau phí sàn (5%)", value: formatVND(netRevenue), icon: <BarChart2 className="size-4" />, color: "text-accent" },
          { label: "Số dư khả dụng", value: formatVND(dash?.availableBalance ?? 0), icon: <DollarSign className="size-4" />, color: "text-text" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-bg-card p-4">
            <div className="mb-2 grid size-8 place-items-center rounded-xl bg-bg-elev text-text-muted">{s.icon}</div>
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className={`mt-1 text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-bg-card p-5">
        <h3 className="text-sm font-bold text-text mb-4">Đơn hàng hoàn thành gần đây</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">Chưa có đơn hoàn thành</p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 20).map(o => (
              <div key={o.orderLineId} className="flex items-center justify-between rounded-xl border border-border bg-bg-elev px-4 py-2.5">
                <div>
                  <p className="text-xs font-mono text-brand">{o.orderCode}</p>
                  <p className="text-sm text-text">{o.productTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">{formatVND(o.lineTotal)}</p>
                  <p className="text-[11px] text-text-muted">
                    {new Date(o.completedAt ?? o.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
