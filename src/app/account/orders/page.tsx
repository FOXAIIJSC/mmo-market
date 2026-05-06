import { DashboardLayout } from "@/components/DashboardLayout";
import { buyerNav } from "@/lib/buyerNav";
import { OrdersClient } from "./OrdersClient";

export const metadata = { title: "Đơn hàng của tôi | MMO Market" };

export default function OrdersPage() {
  return (
    <DashboardLayout variant="buyer" groups={buyerNav} title="Đơn hàng">
      <OrdersClient />
    </DashboardLayout>
  );
}
