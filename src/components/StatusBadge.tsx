import type { OrderStatus } from "@/lib/types";
import { Badge } from "./ui/Badge";

const statusMap: Record<OrderStatus, { label: string; tone: "muted" | "warning" | "accent" | "success" | "brand" | "danger" }> = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", tone: "warning" },
  PAID: { label: "Đã thanh toán", tone: "accent" },
  PROCESSING: { label: "Đang xử lý", tone: "brand" },
  DELIVERED: { label: "Đã giao", tone: "accent" },
  COMPLETED: { label: "Hoàn thành", tone: "success" },
  DISPUTE: { label: "Tranh chấp", tone: "danger" },
  REFUNDED: { label: "Đã hoàn tiền", tone: "muted" },
  CANCELLED: { label: "Đã huỷ", tone: "muted" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, tone } = statusMap[status];
  return <Badge tone={tone}>{label}</Badge>;
}
