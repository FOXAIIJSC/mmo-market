import { AlertTriangle, MessageCircle } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { adminNav } from "@/lib/adminNav";
import { formatVND } from "@/lib/format";

export const metadata = { title: "Tranh chấp | Admin" };

const cases = [
  {
    id: "DSP-2025-1024",
    orderId: "ORD-2025-0498",
    buyer: "hientv2272",
    seller: "kimchi",
    amount: 549_000,
    title: "Tài khoản ChatGPT Plus bị thay mật khẩu sau 2 ngày",
    sla: "Còn 22h",
    status: "investigating",
    priority: "high",
    messages: 12,
  },
  {
    id: "DSP-2025-1023",
    orderId: "ORD-2025-0496",
    buyer: "minhdz",
    seller: "tooltgvn",
    amount: 199_000,
    title: "Capcut Pro kích hoạt báo lỗi license",
    sla: "Còn 14h",
    status: "investigating",
    priority: "medium",
    messages: 7,
  },
  {
    id: "DSP-2025-1022",
    orderId: "ORD-2025-0490",
    buyer: "trangvy",
    seller: "gameshark",
    amount: 2_400_000,
    title: "Tài khoản Liên Quân không đúng rank cam kết",
    sla: "Quá hạn 3h",
    status: "investigating",
    priority: "urgent",
    messages: 24,
  },
  {
    id: "DSP-2025-1018",
    orderId: "ORD-2025-0480",
    buyer: "namphan",
    seller: "vyhan",
    amount: 89_000,
    title: "Gift card Steam không nạp được",
    sla: "Hoàn tất",
    status: "resolved",
    priority: "low",
    messages: 5,
  },
];

export default function AdminDisputesPage() {
  return (
    <DashboardLayout
      variant="admin"
      groups={adminNav}
      title="Trung tâm tranh chấp"
      subtitle="5 đang mở · 1 quá hạn SLA"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Đang mở" value="5" tone="warning" icon={<AlertTriangle className="size-4" />} />
        <Stat label="Quá hạn SLA" value="1" tone="danger" />
        <Stat label="Giải quyết tháng này" value="48" tone="success" />
        <Stat label="Tỷ lệ buyer thắng" value="62%" tone="brand" />
      </div>

      <ul className="mt-6 space-y-3">
        {cases.map((c) => (
          <li key={c.id} className="rounded-2xl border border-border bg-bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono font-semibold text-text">{c.id}</span>
                  <span className="text-text-muted">|</span>
                  <span className="text-xs text-text-muted">
                    Đơn: <span className="font-mono">{c.orderId}</span>
                  </span>
                  <Badge tone={c.status === "resolved" ? "success" : "warning"}>
                    {c.status === "resolved" ? "Đã xử lý" : "Đang điều tra"}
                  </Badge>
                  <Badge
                    tone={
                      c.priority === "urgent"
                        ? "danger"
                        : c.priority === "high"
                          ? "warning"
                          : c.priority === "medium"
                            ? "accent"
                            : "muted"
                    }
                  >
                    {c.priority.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="mt-2 font-semibold text-text">{c.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
                  <span>
                    Buyer: <span className="font-semibold text-text">@{c.buyer}</span>
                  </span>
                  <span>
                    Seller: <span className="font-semibold text-text">@{c.seller}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="size-3" /> {c.messages} tin nhắn
                  </span>
                  <span className={c.sla.startsWith("Quá hạn") ? "text-danger" : ""}>
                    SLA: {c.sla}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-muted">Số tiền</div>
                <div className="num text-lg font-extrabold text-text">
                  {formatVND(c.amount)}
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Xem chi tiết
              </Button>
              {c.status !== "resolved" && (
                <>
                  <Button variant="success" size="sm">
                    Buyer thắng (hoàn tiền)
                  </Button>
                  <Button variant="danger" size="sm">
                    Seller thắng
                  </Button>
                  <Button variant="soft" size="sm">
                    Yêu cầu thêm bằng chứng
                  </Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </DashboardLayout>
  );
}
