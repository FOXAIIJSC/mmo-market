import { SellerGuard } from "@/components/SellerGuard";
import { SellerWithdrawClient } from "./SellerWithdrawClient";

export const metadata = { title: "Rút tiền | MMO Market Seller" };

export default function WithdrawPage() {
  return <SellerGuard><SellerWithdrawClient /></SellerGuard>;
}
