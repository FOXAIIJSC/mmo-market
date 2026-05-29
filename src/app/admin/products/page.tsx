import { AdminGuard } from "@/components/AdminGuard";
import { AdminProductsClient } from "./AdminProductsClient";

export const metadata = { title: "Duyệt sản phẩm | Admin" };

export default function AdminProductsPage() {
  return <AdminGuard><AdminProductsClient /></AdminGuard>;
}
