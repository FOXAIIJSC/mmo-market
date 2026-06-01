import { SellerGuard } from "@/components/SellerGuard";
import { KycPageContent } from "./KycPageContent";

export const metadata = { title: "Xác minh KYC | MMO Market" };

export default function KYCPage() {
  return <SellerGuard><KycPageContent /></SellerGuard>;
}
