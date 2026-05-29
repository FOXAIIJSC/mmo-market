import { AdminGuard } from "@/components/AdminGuard";
import { AdminFeesClient } from "./AdminFeesClient";

export const metadata = { title: "Phí sàn & Loyalty | Admin" };

export default function AdminFeesPage() {
  return <AdminGuard><AdminFeesClient /></AdminGuard>;
}
