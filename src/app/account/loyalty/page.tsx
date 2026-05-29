import { DashboardLayout } from "@/components/DashboardLayout";
import { buyerNav } from "@/lib/buyerNav";
import { LoyaltyClient } from "./LoyaltyClient";

export const metadata = { title: "Điểm thưởng | MMO Market" };

export default function LoyaltyPage() {
  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Điểm thưởng"
      subtitle="Tích điểm mỗi khi mua hàng và đổi lấy ưu đãi hấp dẫn"
    >
      <LoyaltyClient />
    </DashboardLayout>
  );
}
