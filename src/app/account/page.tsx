import { DashboardLayout } from "@/components/DashboardLayout";
import { buyerNav } from "@/lib/buyerNav";
import { AccountOverviewClient } from "./AccountOverviewClient";

export const metadata = { title: "Tài khoản | MMO Market" };

export default function AccountOverviewPage() {
  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Tổng quan tài khoản"
      subtitle="Xem nhanh số dư, đơn hàng, hoạt động ví"
    >
      <AccountOverviewClient />
    </DashboardLayout>
  );
}
