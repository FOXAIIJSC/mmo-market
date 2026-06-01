"use client";
import { useAuth } from "@/lib/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ChatView } from "@/components/ChatView";
import { sellerNav } from "@/lib/sellerNav";

export function SellerMessagesClient() {
  const { token, user } = useAuth();

  if (!user || !token) return null;

  return (
    <DashboardLayout variant="seller" groups={sellerNav} title="Tin nhắn" subtitle="Trả lời khách hàng của bạn">
      <ChatView
        token={token}
        userId={user.id}
        myRole="Seller"
        listUrl="/api/seller/messages"
        getUrl={(id) => `/api/seller/messages/${id}`}
        sendUrl={(id) => `/api/seller/messages/${id}`}
      />
    </DashboardLayout>
  );
}
