import { Check, Eye, MoreVertical, X } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminNav } from "@/lib/adminNav";
import { sellers } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export const metadata = { title: "Quản lý Seller / KYC | Admin" };

export default function AdminSellersPage() {
  return (
    <DashboardLayout
      variant="admin"
      groups={adminNav}
      title="Quản lý người bán & KYC"
      subtitle="12 hồ sơ đang chờ duyệt"
    >
      <div className="rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-2 text-sm">
          {["Tất cả", "Đã KYC", "Chờ duyệt", "Bị từ chối", "Đình chỉ"].map(
            (t, i) => (
              <button
                key={t}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 ${
                  i === 0
                    ? "bg-brand text-white"
                    : "text-text-muted hover:bg-bg-elev hover:text-text"
                }`}
              >
                {t}
              </button>
            ),
          )}
          <input
            placeholder="Tìm seller..."
            className="ml-auto h-9 w-64 rounded-full border border-border bg-bg-elev px-4 text-xs text-text outline-none focus:border-brand"
          />
        </div>

        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">Seller</th>
              <th className="px-5 py-3 text-right">Đã bán</th>
              <th className="px-5 py-3 text-right">Rating</th>
              <th className="px-5 py-3 text-right">Doanh thu</th>
              <th className="px-5 py-3 text-center">KYC</th>
              <th className="px-5 py-3 text-center">Badge</th>
              <th className="px-5 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sellers.map((s) => (
              <tr key={s.id} className="hover:bg-bg-elev/30">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid size-9 place-items-center rounded-full text-xs font-bold text-white"
                      style={{ background: s.avatarColor }}
                    >
                      {s.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-text">@{s.username}</div>
                      <div className="text-xs text-text-muted">
                        {s.displayName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="num px-5 py-3 text-right text-text-muted">
                  {formatNumber(s.totalSold)}
                </td>
                <td className="num px-5 py-3 text-right">
                  <span className="text-warning">{s.rating.toFixed(2)}★</span>
                </td>
                <td className="num px-5 py-3 text-right text-text-muted">
                  {formatNumber(s.totalSold * 280_000).toLocaleString()}₫
                </td>
                <td className="px-5 py-3 text-center">
                  {s.kycStatus === "approved" ? (
                    <Badge tone="success">Đã duyệt</Badge>
                  ) : s.kycStatus === "pending" ? (
                    <Badge tone="warning">Chờ duyệt</Badge>
                  ) : (
                    <Badge tone="danger">Từ chối</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-center">
                  {s.badge ? (
                    <Badge tone={s.badge === "top" ? "brand" : "accent"}>
                      {s.badge.toUpperCase()}
                    </Badge>
                  ) : (
                    <span className="text-text-dim">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {s.kycStatus === "pending" ? (
                      <>
                        <Button variant="success" size="sm" leftIcon={<Check className="size-3" />}>
                          Duyệt
                        </Button>
                        <Button variant="outline" size="sm" leftIcon={<X className="size-3" />}>
                          Từ chối
                        </Button>
                      </>
                    ) : (
                      <button className="grid size-8 place-items-center rounded-lg text-text-muted hover:bg-bg-elev hover:text-text">
                        <Eye className="size-4" />
                      </button>
                    )}
                    <button className="grid size-8 place-items-center rounded-lg text-text-muted hover:bg-bg-elev hover:text-text">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
