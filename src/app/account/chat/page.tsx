import { DashboardLayout } from "@/components/DashboardLayout";
import { buyerNav } from "@/lib/buyerNav";
import { BuyerChatClient } from "./BuyerChatClient";

export const metadata = { title: "Tin nhắn | MMO Market" };

export default function BuyerChatPage() {
  return (
    <DashboardLayout variant="buyer" groups={buyerNav} title="Tin nhắn" subtitle="Nhắn tin trực tiếp với người bán">
      <BuyerChatClient />
    </DashboardLayout>
  );
}
