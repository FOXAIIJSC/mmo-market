import { SellerGuard } from "@/components/SellerGuard";
import { SellerOrdersClient } from "./SellerOrdersClient";

export const metadata = { title: "Đơn hàng | Seller" };

export default function SellerOrdersPage() {
  return <SellerGuard><SellerOrdersClient /></SellerGuard>;
}
