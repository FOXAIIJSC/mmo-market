"use client";
import { CheckCircle2, FileCheck, Lock, ShieldCheck, Upload } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { sellerNav } from "@/lib/sellerNav";

export function KycPageContent() {
  return (
    <DashboardLayout
      variant="seller"
      groups={sellerNav}
      title="Xác minh KYC (Know Your Customer)"
      subtitle="Bắt buộc với mọi seller để rút tiền và bán sản phẩm có giá trị cao"
    >
      <div className="rounded-2xl border border-success/30 bg-success/5 p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" />
          <div>
            <div className="text-base font-bold text-text">
              Hồ sơ KYC đã được duyệt
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Bạn được phép bán sản phẩm có giá trị tới 50 triệu/đơn và rút tiền tự do qua mọi kênh hỗ trợ.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Badge tone="success">CMND/CCCD ✓</Badge>
              <Badge tone="success">Selfie + giấy tờ ✓</Badge>
              <Badge tone="success">Số điện thoại ✓</Badge>
              <Badge tone="success">Tài khoản ngân hàng ✓</Badge>
              <Badge tone="success">Hợp đồng dịch vụ ✓</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-bg-card p-5">
          <h2 className="text-base font-bold text-text">Thông tin định danh</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              ["Họ và tên đầy đủ", "Nguyễn Kim Chi"],
              ["Số CMND/CCCD", "0123 ****  ****"],
              ["Ngày sinh", "12/06/1996"],
              ["Giới tính", "Nữ"],
              ["Địa chỉ thường trú", "Cầu Giấy, Hà Nội"],
              ["Số điện thoại", "0987 *** ***"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-xs font-medium uppercase tracking-wider text-text-muted">{k}</div>
                <div className="mt-1 text-sm text-text">{v}</div>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-base font-bold text-text">Giấy tờ đã upload</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {["Mặt trước CCCD", "Mặt sau CCCD", "Selfie cầm giấy tờ"].map(label => (
              <div key={label} className="rounded-xl border border-border bg-bg-elev p-4">
                <div className="flex aspect-[3/2] items-center justify-center rounded-lg bg-gradient-to-br from-brand/30 to-accent/30 text-text-muted">
                  <FileCheck className="size-8" />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-text">{label}</span>
                  <Badge tone="success">Hợp lệ</Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" size="sm">Yêu cầu cập nhật</Button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <ShieldCheck className="mb-2 size-5 text-success" />
            <h3 className="text-sm font-semibold text-text">Quyền lợi sau KYC</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-text-muted">
              <li>• Mở khoá rút tiền không giới hạn</li>
              <li>• Bán sản phẩm cao cấp ({">"}5 triệu/đơn)</li>
              <li>• Hiển thị badge xanh &ldquo;ĐÃ KYC&rdquo;</li>
              <li>• Phí sàn ưu đãi (chỉ 4% thay vì 6%)</li>
              <li>• Xếp hạng ưu tiên trong tìm kiếm</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <Lock className="mb-2 size-5 text-accent" />
            <h3 className="text-sm font-semibold text-text">Bảo mật dữ liệu</h3>
            <p className="mt-2 text-xs text-text-muted">
              Hồ sơ KYC được mã hoá AES-256 và lưu trên hệ thống tách riêng.
              Chỉ Compliance Team có quyền truy cập theo audit log.
            </p>
          </div>

          <Button variant="soft" size="md" className="w-full" leftIcon={<Upload className="size-4" />}>
            Upload giấy tờ bổ sung
          </Button>
        </aside>
      </div>
    </DashboardLayout>
  );
}
