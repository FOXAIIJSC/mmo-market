"use client";
import { MessageSquare } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { sellerNav } from "@/lib/sellerNav";

export function SellerMessagesClient() {
  return (
    <DashboardLayout variant="seller" groups={sellerNav} title="Tin nhắn" subtitle="Nhắn tin với khách hàng">
      <div className="rounded-2xl border-2 border-dashed border-border py-20 text-center">
        <MessageSquare className="mx-auto mb-4 size-12 text-text-muted" />
        <p className="text-base font-semibold text-text">Tính năng đang phát triển</p>
        <p className="mt-2 text-sm text-text-muted">Hộp thư nhắn tin sẽ sớm ra mắt.</p>
      </div>
    </DashboardLayout>
  );
}
