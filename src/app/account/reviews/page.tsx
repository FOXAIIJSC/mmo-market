import { DashboardLayout } from "@/components/DashboardLayout";
import { buyerNav } from "@/lib/buyerNav";
import { ReviewsClient } from "./ReviewsClient";

export const metadata = { title: "Đánh giá của tôi | MMO Market" };

export default function ReviewsPage() {
  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Đánh giá của tôi"
      subtitle="Quản lý tất cả đánh giá bạn đã viết"
    >
      <ReviewsClient />
    </DashboardLayout>
  );
}
