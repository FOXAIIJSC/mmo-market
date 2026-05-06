import { AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { buyerNav } from "@/lib/buyerNav";
import { formatVND } from "@/lib/format";

export const metadata = { title: "Khiếu nại đơn hàng | MMO Market" };

const disputes = [
  {
    id: "DSP-2025-1024",
    orderId: "ORD-2025-0498",
    title: "Tài khoản ChatGPT Plus bị thay mật khẩu sau 2 ngày",
    amount: 549_000,
    status: "investigating",
    statusLabel: "Đang xử lý",
    createdAt: "2 ngày trước",
    sla: "Còn 22h",
    seller: "kimchi",
  },
  {
    id: "DSP-2025-1019",
    orderId: "ORD-2025-0420",
    title: "Tài khoản Capcut Pro không đúng mô tả",
    amount: 199_000,
    status: "buyer_won",
    statusLabel: "Buyer thắng — đã hoàn tiền",
    createdAt: "1 tuần trước",
    sla: "Hoàn tất",
    seller: "vyhan",
  },
];

export default function DisputesPage() {
  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Khiếu nại đơn hàng"
      subtitle="Mọi tranh chấp được Admin giải quyết trong 48-72h, có ghi log đầy đủ"
    >
      <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning">
        <AlertTriangle className="mb-1 size-4" />
        <span className="font-semibold text-text">Khi nào nên khiếu nại?</span>{" "}
        Sản phẩm sai mô tả, không sử dụng được, tài khoản bị thay mật khẩu trong
        thời gian bảo hành. Hệ thống sẽ giữ tiền cho đến khi giải quyết.
      </div>

      <ul className="mt-4 space-y-3">
        {disputes.map((d) => (
          <li
            key={d.id}
            className="rounded-2xl border border-border bg-bg-card p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono font-semibold text-text">
                    {d.id}
                  </span>
                  <span className="text-text-muted">|</span>
                  <span className="text-xs text-text-muted">
                    Đơn liên quan: <span className="font-mono">{d.orderId}</span>
                  </span>
                  <Badge
                    tone={
                      d.status === "buyer_won"
                        ? "success"
                        : d.status === "investigating"
                          ? "warning"
                          : "muted"
                    }
                  >
                    {d.statusLabel}
                  </Badge>
                </div>
                <h3 className="mt-2 font-semibold text-text">{d.title}</h3>
                <div className="mt-1 text-xs text-text-muted">
                  Seller: @{d.seller} · Mở {d.createdAt} · SLA: {d.sla}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-muted">Số tiền tranh chấp</div>
                <div className="num text-lg font-extrabold text-text">
                  {formatVND(d.amount)}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Xem hội thoại
              </Button>
              <Button variant="ghost" size="sm">
                Tải bằng chứng
              </Button>
              {d.status === "investigating" && (
                <Button variant="soft" size="sm">
                  Bổ sung chứng cứ
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl border border-border bg-bg-card p-5">
        <h3 className="font-semibold text-text">Quy trình xử lý khiếu nại</h3>
        <ol className="mt-3 grid gap-3 md:grid-cols-4">
          {[
            ["1. Buyer gửi yêu cầu", "Đính kèm bằng chứng (ảnh, video, log...)"],
            ["2. Seller phản hồi 24h", "Đối chiếu kho, lịch sử truy cập"],
            ["3. Admin trọng tài 48h", "Đối soát, xem chat, xét hash sản phẩm"],
            ["4. Quyết định cuối", "Hoàn tiền / Đổi sản phẩm / Reject"],
          ].map(([t, d]) => (
            <li key={t} className="rounded-xl border border-border bg-bg-elev/40 p-3">
              <div className="text-xs font-bold text-brand">{t}</div>
              <div className="mt-1 text-xs text-text-muted">{d}</div>
            </li>
          ))}
        </ol>
      </div>
    </DashboardLayout>
  );
}
