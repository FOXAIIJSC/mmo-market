import { AdminGuard } from "@/components/AdminGuard";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata = { title: "Admin | MMO Market" };

export default function AdminDashboardPage() {
  return <AdminGuard><AdminDashboardClient /></AdminGuard>;
}
