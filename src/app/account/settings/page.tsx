import { DashboardLayout } from "@/components/DashboardLayout";
import { buyerNav } from "@/lib/buyerNav";
import { SettingsClient } from "./SettingsClient";

export const metadata = { title: "Hồ sơ & bảo mật | MMO Market" };

export default function SettingsPage() {
  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Hồ sơ & bảo mật"
      subtitle="Cập nhật thông tin cá nhân và cài đặt bảo mật tài khoản"
    >
      <SettingsClient />
    </DashboardLayout>
  );
}
