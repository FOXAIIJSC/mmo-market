import { DashboardLayout } from "@/components/DashboardLayout";
import { buyerNav } from "@/lib/buyerNav";
import { CouponsClient } from "./CouponsClient";

export const metadata = { title: "Mã giảm giá | MMO Market" };

export default function CouponsPage() {
  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Mã giảm giá"
      subtitle="Danh sách mã giảm giá và voucher của bạn"
    >
      <CouponsClient />
    </DashboardLayout>
  );
}
