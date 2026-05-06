import Link from "next/link";
import { Edit, Eye, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { sellerNav } from "@/lib/sellerNav";
import { products } from "@/lib/data";
import { formatNumber, formatVND } from "@/lib/format";

export const metadata = { title: "Sản phẩm — Seller | MMO Market" };

export default function SellerProductsPage() {
  return (
    <DashboardLayout
      variant="seller"
      groups={sellerNav}
      title="Quản lý sản phẩm"
      subtitle={`${products.length} sản phẩm · 2 chờ duyệt · 1 từ chối`}
      topRight={
        <Link href="/seller/products/new">
          <Button size="sm" leftIcon={<Plus className="size-3.5" />}>
            Thêm sản phẩm
          </Button>
        </Link>
      }
    >
      <div className="rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-2 text-sm">
          {["Tất cả", "Đang bán", "Hết hàng", "Chờ duyệt", "Bị từ chối", "Tạm ẩn"].map(
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
            placeholder="Tìm sản phẩm..."
            className="ml-auto h-9 w-64 rounded-full border border-border bg-bg-elev px-4 text-xs text-text placeholder:text-text-dim outline-none focus:border-brand"
          />
        </div>

        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-text-muted">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" className="size-4 accent-brand" />
              </th>
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3 text-right">Giá</th>
              <th className="px-4 py-3 text-right">Tồn kho</th>
              <th className="px-4 py-3 text-right">Đã bán</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.slice(0, 10).map((p, i) => (
              <tr key={p.id} className="hover:bg-bg-elev/30">
                <td className="px-4 py-3">
                  <input type="checkbox" className="size-4 accent-brand" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="grid size-10 shrink-0 place-items-center rounded-lg text-sm font-bold text-white"
                      style={{ background: p.thumbnailColor }}
                    >
                      {p.thumbnailIcon ?? p.title[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-1 max-w-xs font-medium text-text">
                        {p.title}
                      </div>
                      <div className="text-xs text-text-muted">
                        {p.delivery === "auto" ? "⚡ Auto" : "👤 Manual"} · BH{" "}
                        {p.warrantyDays}d
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="num font-semibold text-text">
                    {formatVND(p.price)}
                  </div>
                  {p.comparePrice && (
                    <div className="num text-xs text-text-dim line-through">
                      {formatVND(p.comparePrice)}
                    </div>
                  )}
                </td>
                <td className="num px-4 py-3 text-right text-text-muted">
                  {formatNumber(p.stock)}
                </td>
                <td className="num px-4 py-3 text-right text-text-muted">
                  {formatNumber(p.sold)}
                </td>
                <td className="px-4 py-3 text-center">
                  {i === 7 ? (
                    <Badge tone="warning">Chờ duyệt</Badge>
                  ) : i === 9 ? (
                    <Badge tone="danger">Bị từ chối</Badge>
                  ) : p.stock === 0 ? (
                    <Badge tone="muted">Hết hàng</Badge>
                  ) : (
                    <Badge tone="success">Đang bán</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/p/${p.slug}`}>
                      <button className="grid size-8 place-items-center rounded-lg text-text-muted hover:bg-bg-elev hover:text-text">
                        <Eye className="size-4" />
                      </button>
                    </Link>
                    <button className="grid size-8 place-items-center rounded-lg text-text-muted hover:bg-bg-elev hover:text-text">
                      <Edit className="size-4" />
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
