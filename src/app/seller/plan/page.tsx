import { SellerGuard } from "@/components/SellerGuard";
import { SellerPlanClient } from "./SellerPlanClient";

export const metadata = { title: "Gói thành viên | MMO Market Seller" };

export default function SellerPlanPage() {
  return <SellerGuard><SellerPlanClient /></SellerGuard>;
}
