import { DashboardLayout } from "@/components/DashboardLayout";
import { buyerNav } from "@/lib/buyerNav";
import { WalletClient } from "./WalletClient";

export const metadata = { title: "Ví & nạp tiền | MMO Market" };

export default function WalletPage() {
  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Ví nội bộ"
      subtitle="Quản lý số dư, nạp/rút tiền và lịch sử giao dịch"
    >
      <WalletClient />
    </DashboardLayout>
  );
}
