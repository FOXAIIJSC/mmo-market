"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { sellerNav } from "@/lib/sellerNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiNotification } from "@/lib/apiTypes";
import { useNotifications } from "@/lib/NotificationContext";

export function SellerNotificationsClient() {
  const { token } = useAuth();
  const { markAllRead } = useNotifications();
  const [notifs, setNotifs] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<ApiNotification[]>("/api/notifications", { token })
      .then(setNotifs).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  async function handleMarkAll() {
    await markAllRead();
    setNotifs(ns => ns.map(n => ({ ...n, isRead: true })));
  }

  async function markOne(id: string) {
    await apiFetch(`/api/notifications/${id}/read`, { token, method: "POST" });
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, isRead: true } : n));
  }

  return (
    <DashboardLayout variant="seller" groups={sellerNav} title="Thông báo" subtitle="Cập nhật hoạt động của shop">
      {loading && <div className="grid place-items-center py-20"><Loader2 className="size-8 animate-spin text-text-muted" /></div>}
      {!loading && (
        <>
          <div className="mb-4 flex justify-end">
            <button onClick={handleMarkAll}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-bg-elev">
              <CheckCheck className="size-3.5" /> Đánh dấu tất cả đã đọc
            </button>
          </div>
          {notifs.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
              <Bell className="mx-auto mb-3 size-10 text-text-muted" />
              <p className="text-sm text-text-muted">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifs.map(n => (
                <div key={n.id} onClick={() => !n.isRead && markOne(n.id)}
                  className={`rounded-2xl border p-4 cursor-pointer transition-colors ${n.isRead ? "border-border bg-bg-card" : "border-brand/30 bg-brand/5 hover:bg-brand/10"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${n.isRead ? "text-text" : "text-brand"}`}>{n.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{n.body}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <p className="text-[11px] text-text-dim">
                        {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                      {!n.isRead && <span className="size-2 rounded-full bg-brand" />}
                    </div>
                  </div>
                  {n.link && (
                    <Link href={n.link} className="mt-2 text-xs text-brand hover:underline" onClick={e => e.stopPropagation()}>
                      Xem chi tiết →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
