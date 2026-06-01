import { SellerGuard } from "@/components/SellerGuard";
import { SellerDashboardClient } from "./SellerDashboardClient";

export const metadata = { title: "Seller Dashboard | MMO Market" };

export default function SellerDashboardPage() {
  return <SellerGuard><SellerDashboardClient /></SellerGuard>;
}
