import { SellerGuard } from "@/components/SellerGuard";
import { SellerProductsClient } from "./SellerProductsClient";

export const metadata = { title: "Sản phẩm — Seller | MMO Market" };

export default function SellerProductsPage() {
  return <SellerGuard><SellerProductsClient /></SellerGuard>;
}
