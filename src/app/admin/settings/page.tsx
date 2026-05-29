import { AdminGuard } from "@/components/AdminGuard";
import { AdminSettingsClient } from "./AdminSettingsClient";

export const metadata = { title: "Cấu hình hệ thống | Admin" };

export default function AdminSettingsPage() {
  return <AdminGuard><AdminSettingsClient /></AdminGuard>;
}
