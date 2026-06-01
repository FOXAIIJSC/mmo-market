import { SellerGuard } from "@/components/SellerGuard";
import { SellerFinanceClient } from "./SellerFinanceClient";

export const metadata = { title: "Doanh thu | Seller" };

export default function SellerFinancePage() {
  return <SellerGuard><SellerFinanceClient /></SellerGuard>;
}
