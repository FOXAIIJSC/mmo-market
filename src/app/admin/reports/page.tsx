import { AdminGuard } from "@/components/AdminGuard";
import { AdminReportsClient } from "./AdminReportsClient";

export const metadata = { title: "Báo cáo | Admin" };

export default function AdminReportsPage() {
  return <AdminGuard><AdminReportsClient /></AdminGuard>;
}
