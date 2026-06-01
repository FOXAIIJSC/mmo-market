import { SellerGuard } from "@/components/SellerGuard";
import { SellerCouponsClient } from "./SellerCouponsClient";

export const metadata = { title: "Mã giảm giá | Seller" };

export default function SellerCouponsPage() {
  return <SellerGuard><SellerCouponsClient /></SellerGuard>;
}
