import type { OrderStatus } from "@/lib/types";
import { Badge } from "./ui/Badge";

const statusMap: Record<OrderStatus, { label: string; tone: "muted" | "warning" | "accent" | "success" | "brand" | "danger" }> = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", tone: "warning" },
  ESCROW_LOCKED: { label: "Đã vào escrow", tone: "accent" },
  DELIVERING: { label: "Đang bàn giao", tone: "brand" },
  CHECKING: { label: "Đang kiểm tra", tone: "accent" },
  COMPLETED: { label: "Hoàn thành", tone: "success" },
  DISPUTED: { label: "Tranh chấp", tone: "danger" },
  REFUNDED: { label: "Đã hoàn tiền", tone: "muted" },
  CANCELLED: { label: "Đã huỷ", tone: "muted" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, tone } = statusMap[status];
  return <Badge tone={tone}>{label}</Badge>;
}
