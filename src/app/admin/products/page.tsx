import { Check, Eye, X } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminNav } from "@/lib/adminNav";
import { products, sellers, getCategory } from "@/lib/data";
import { formatVND } from "@/lib/format";

export const metadata = { title: "Duyệt sản phẩm | Admin" };

export default function AdminProductsPage() {
  return (
    <DashboardLayout
      variant="admin"
      groups={adminNav}
      title="Duyệt sản phẩm"
      subtitle="8 sản phẩm chờ duyệt — SLA 24h"
    >
      <div className="rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-2 text-sm">
          {["Chờ duyệt (8)", "Đang bán", "Bị từ chối", "Bị báo cáo", "Đã gỡ"].map((t, i) => (
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
          ))}
        </div>

        <ul className="divide-y divide-border">
          {products.slice(0, 6).map((p) => {
            const seller = sellers.find((s) => s.id === p.sellerId);
            const category = getCategory(p.category);
            return (
              <li key={p.id} className="flex flex-wrap items-start gap-4 p-5">
                <div
                  className="grid size-16 shrink-0 place-items-center rounded-2xl text-2xl font-bold text-white"
                  style={{ background: p.thumbnailColor }}
                >
                  {p.thumbnailIcon ?? p.title[0]}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-text">{p.title}</h3>
                    <Badge tone="muted">{category?.name}</Badge>
                    <Badge tone={p.delivery === "auto" ? "accent" : "muted"}>
                      {p.delivery === "auto" ? "⚡ Auto" : "👤 Manual"}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-text-muted">
                    {p.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    <span>
                      Seller:{" "}
                      <span className="font-semibold text-text">
                        @{seller?.username}
                      </span>
                    </span>
                    <span>
                      Giá: <span className="num font-semibold text-accent">{formatVND(p.price)}</span>
                    </span>
                    <span>
                      Bảo hành:{" "}
                      <span className="font-semibold text-text">{p.warrantyDays}d</span>
                    </span>
                    <span>Submit 2 giờ trước</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Eye className="size-3.5" />}>
                    Xem chi tiết
                  </Button>
                  <Button variant="success" size="sm" leftIcon={<Check className="size-3.5" />}>
                    Duyệt
                  </Button>
                  <Button variant="danger" size="sm" leftIcon={<X className="size-3.5" />}>
                    Từ chối
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </DashboardLayout>
  );
}
