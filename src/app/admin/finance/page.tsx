import { AdminGuard } from "@/components/AdminGuard";
import { AdminFinanceClient } from "./AdminFinanceClient";

export const metadata = { title: "Tài chính | Admin" };

export default function AdminFinancePage() {
  return <AdminGuard><AdminFinanceClient /></AdminGuard>;
}
