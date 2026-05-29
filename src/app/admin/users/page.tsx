import { AdminGuard } from "@/components/AdminGuard";
import { AdminUsersClient } from "./AdminUsersClient";

export const metadata = { title: "Người dùng | Admin" };

export default function AdminUsersPage() {
  return <AdminGuard><AdminUsersClient /></AdminGuard>;
}
