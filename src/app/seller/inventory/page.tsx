import { SellerGuard } from "@/components/SellerGuard";
import { SellerInventoryClient } from "./SellerInventoryClient";

export const metadata = { title: "Kho auto-delivery | MMO Market" };

export default function SellerInventoryPage() {
  return <SellerGuard><SellerInventoryClient /></SellerGuard>;
}
