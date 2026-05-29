import { DashboardLayout } from "@/components/DashboardLayout";
import { buyerNav } from "@/lib/buyerNav";
import { NotificationsClient } from "./NotificationsClient";

export const metadata = { title: "Thông báo | MMO Market" };

export default function NotificationsPage() {
  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Thông báo"
      subtitle="Cập nhật đơn hàng, ví và hoạt động tài khoản"
    >
      <NotificationsClient />
    </DashboardLayout>
  );
}
