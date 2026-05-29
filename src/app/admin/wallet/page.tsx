import { AdminGuard } from "@/components/AdminGuard";
import { AdminWalletClient } from "./AdminWalletClient";

export const metadata = { title: "Ví & Nạp tiền | Admin" };

export default function AdminWalletPage() {
  return <AdminGuard><AdminWalletClient /></AdminGuard>;
}
