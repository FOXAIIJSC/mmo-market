"use client";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { ChatView } from "@/components/ChatView";

export function BuyerChatClient() {
  const { token, user } = useAuth();
  const params = useSearchParams();
  const seller = params.get("seller") ?? undefined;

  if (!user || !token) return null;

  return (
    <ChatView
      token={token}
      userId={user.id}
      myRole="Buyer"
      listUrl="/api/messages"
      getUrl={(id) => `/api/messages/${id}`}
      sendUrl={(id) => `/api/messages/${id}`}
      startUrl="/api/messages/start"
      initSellerUsername={seller}
    />
  );
}
