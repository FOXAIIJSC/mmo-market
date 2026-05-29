import { AdminGuard } from "@/components/AdminGuard";
import { AdminBannersClient } from "./AdminBannersClient";

export const metadata = { title: "Banner & Flash Sale | Admin" };

export default function AdminBannersPage() {
  return <AdminGuard><AdminBannersClient /></AdminGuard>;
}
