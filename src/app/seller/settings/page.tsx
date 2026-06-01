import { SellerGuard } from "@/components/SellerGuard";
import { SellerSettingsClient } from "./SellerSettingsClient";

export const metadata = { title: "Cài đặt shop | Seller" };

export default function SellerSettingsPage() {
  return <SellerGuard><SellerSettingsClient /></SellerGuard>;
}
