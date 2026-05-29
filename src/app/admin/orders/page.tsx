import { AdminGuard } from "@/components/AdminGuard";
import { AdminOrdersClient } from "./AdminOrdersClient";

export const metadata = { title: "Đơn hàng | Admin" };

export default function AdminOrdersPage() {
  return <AdminGuard><AdminOrdersClient /></AdminGuard>;
}
