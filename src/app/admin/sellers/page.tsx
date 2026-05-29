import { AdminGuard } from "@/components/AdminGuard";
import { AdminSellersClient } from "./AdminSellersClient";

export const metadata = { title: "Sellers & KYC | Admin" };

export default function AdminSellersPage() {
  return <AdminGuard><AdminSellersClient /></AdminGuard>;
}
