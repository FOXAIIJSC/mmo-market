"use client";
import { Settings } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { sellerNav } from "@/lib/sellerNav";

export function SellerSettingsClient() {
  return (
    <DashboardLayout variant="seller" groups={sellerNav} title="Cài đặt shop" subtitle="Quản lý thông tin và cài đặt gian hàng">
      <div className="rounded-2xl border-2 border-dashed border-border py-20 text-center">
        <Settings className="mx-auto mb-4 size-12 text-text-muted" />
        <p className="text-base font-semibold text-text">Tính năng đang phát triển</p>
        <p className="mt-2 text-sm text-text-muted">Cài đặt gian hàng chi tiết sẽ sớm ra mắt.</p>
      </div>
    </DashboardLayout>
  );
}
