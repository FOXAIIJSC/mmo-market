import { Database, Download, Lock, Upload, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { sellerNav } from "@/lib/sellerNav";

export const metadata = { title: "Kho auto-delivery | MMO Market" };

const stocks = [
  {
    product: "Tài khoản ChatGPT Plus 1 tháng",
    available: 124,
    reserved: 8,
    sold: 1842,
    duplicate: 0,
    status: "ok",
  },
  {
    product: "Tài khoản Capcut Pro 1 năm",
    available: 12,
    reserved: 2,
    sold: 540,
    duplicate: 1,
    status: "low",
  },
  {
    product: "Steam Wallet 100K",
    available: 850,
    reserved: 12,
    sold: 4280,
    duplicate: 0,
    status: "ok",
  },
  {
    product: "Microsoft 365 Family",
    available: 0,
    reserved: 0,
    sold: 412,
    duplicate: 0,
    status: "out",
  },
  {
    product: "Cursor Pro Max Mode",
    available: 38,
    reserved: 4,
    sold: 218,
    duplicate: 0,
    status: "ok",
  },
];

export default function InventoryPage() {
  return (
    <DashboardLayout
      variant="seller"
      groups={sellerNav}
      title="Kho auto-delivery"
      subtitle="Mã hoá AES-256, kiểm tra trùng SHA-256, log truy cập đầy đủ"
      topRight={
        <>
          <Button variant="outline" size="sm" leftIcon={<Download className="size-3.5" />}>
            Xuất kho
          </Button>
          <Button size="sm" leftIcon={<Upload className="size-3.5" />}>
            Upload TXT/CSV
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Tổng còn lại"
          value="2.480"
          icon={<Database className="size-4" />}
          tone="brand"
        />
        <Stat label="Đang reserve" value="124" tone="warning" />
        <Stat label="Đã giao 30 ngày" value="14.820" tone="success" />
        <Stat
          label="Trùng đã loại"
          value="38"
          delta="Bằng SHA-256 hash"
          icon={<Lock className="size-4" />}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-text">Tồn kho theo sản phẩm</h2>
          <input
            placeholder="Tìm sản phẩm..."
            className="h-9 w-56 rounded-full border border-border bg-bg-elev px-3 text-xs text-text placeholder:text-text-dim outline-none focus:border-brand"
          />
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">Sản phẩm</th>
              <th className="px-5 py-3 text-right">Còn lại</th>
              <th className="px-5 py-3 text-right">Reserve</th>
              <th className="px-5 py-3 text-right">Đã bán</th>
              <th className="px-5 py-3 text-right">Trùng</th>
              <th className="px-5 py-3 text-center">Trạng thái</th>
              <th className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stocks.map((s) => (
              <tr key={s.product} className="hover:bg-bg-elev/30">
                <td className="px-5 py-3 font-medium text-text">{s.product}</td>
                <td
                  className={`num px-5 py-3 text-right font-semibold ${
                    s.status === "out"
                      ? "text-danger"
                      : s.status === "low"
                        ? "text-warning"
                        : "text-text"
                  }`}
                >
                  {s.available}
                </td>
                <td className="num px-5 py-3 text-right text-text-muted">{s.reserved}</td>
                <td className="num px-5 py-3 text-right text-text-muted">{s.sold}</td>
                <td className="num px-5 py-3 text-right">
                  {s.duplicate > 0 ? (
                    <span className="text-danger">{s.duplicate}</span>
                  ) : (
                    <span className="text-text-dim">0</span>
                  )}
                </td>
                <td className="px-5 py-3 text-center">
                  {s.status === "ok" ? (
                    <Badge tone="success">Đủ kho</Badge>
                  ) : s.status === "low" ? (
                    <Badge tone="warning">Sắp hết</Badge>
                  ) : (
                    <Badge tone="danger">Hết hàng</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <Button variant="ghost" size="sm">
                    Nạp thêm
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
        <AlertTriangle className="mb-1 size-4" />
        <span className="font-semibold text-text">Lưu ý bảo mật:</span>{" "}
        Toàn bộ dữ liệu kho (tài khoản, mật khẩu, key) đều được mã hoá AES-256
        ngay tại điểm upload. Sàn chỉ giải mã khi giao tới buyer. Mỗi tài khoản
        có hash SHA-256 chống trùng — bạn không thể bán cùng 1 tài khoản 2 lần.
      </div>
    </DashboardLayout>
  );
}
