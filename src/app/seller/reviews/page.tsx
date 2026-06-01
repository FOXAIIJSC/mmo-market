import { SellerGuard } from "@/components/SellerGuard";
import { SellerReviewsClient } from "./SellerReviewsClient";

export const metadata = { title: "Đánh giá | Seller" };

export default function SellerReviewsPage() {
  return <SellerGuard><SellerReviewsClient /></SellerGuard>;
}
