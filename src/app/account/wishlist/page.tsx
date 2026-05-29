import { DashboardLayout } from "@/components/DashboardLayout";
import { buyerNav } from "@/lib/buyerNav";
import { WishlistClient } from "./WishlistClient";

export const metadata = { title: "Yêu thích | MMO Market" };

export default function WishlistPage() {
  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Sản phẩm yêu thích"
      subtitle="Danh sách sản phẩm bạn đã lưu"
    >
      <WishlistClient />
    </DashboardLayout>
  );
}
