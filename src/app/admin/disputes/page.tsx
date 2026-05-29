import { AdminGuard } from "@/components/AdminGuard";
import { AdminDisputesClient } from "./AdminDisputesClient";

export const metadata = { title: "Tranh chấp | Admin" };

export default function AdminDisputesPage() {
  return <AdminGuard><AdminDisputesClient /></AdminGuard>;
}
