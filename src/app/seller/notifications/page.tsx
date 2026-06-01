import { SellerGuard } from "@/components/SellerGuard";
import { SellerNotificationsClient } from "./SellerNotificationsClient";

export const metadata = { title: "Thông báo | Seller" };

export default function SellerNotificationsPage() {
  return <SellerGuard><SellerNotificationsClient /></SellerGuard>;
}
