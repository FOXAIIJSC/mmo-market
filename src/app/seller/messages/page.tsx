import { SellerGuard } from "@/components/SellerGuard";
import { SellerMessagesClient } from "./SellerMessagesClient";

export const metadata = { title: "Tin nhắn | Seller" };

export default function SellerMessagesPage() {
  return <SellerGuard><SellerMessagesClient /></SellerGuard>;
}
