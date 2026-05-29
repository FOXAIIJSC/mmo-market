"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle, Bell, CheckCheck, ChevronRight,
  Loader2, PackageCheck, ShieldAlert, Star, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/lib/NotificationContext";
import { apiFetch } from "@/lib/api";
import type { ApiNotification } from "@/lib/apiTypes";
import { formatRelativeTime } from "@/lib/format";

const TYPE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  order:   { icon: <PackageCheck className="size-4" />, color: "bg-accent/10 text-accent" },
  wallet:  { icon: <Wallet className="size-4" />,       color: "bg-success/10 text-success" },
  review:  { icon: <Star className="size-4" />,         color: "bg-warning/10 text-warning" },
  dispute: { icon: <ShieldAlert className="size-4" />,  color: "bg-danger/10 text-danger" },
  kyc:     { icon: <ShieldAlert className="size-4" />,  color: "bg-brand/10 text-brand" },
  system:  { icon: <Bell className="size-4" />,         color: "bg-bg-elev text-text-muted" },
};

export function NotificationsClient() {
  const { user, token, loading: authLoading } = useAuth();
  const { markRead, markAllRead, refresh: refreshCount } = useNotifications();

  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "unread">("all");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await apiFetch<ApiNotification[]>("/api/notifications", { token });
      setItems(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi tải thông báo");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  const handleMarkRead = async (n: ApiNotification) => {
    if (n.isRead) return;
    await markRead(n.id);
    setItems((prev) => prev.map((i) => i.id === n.id ? { ...i, isRead: true } : i));
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
  };

  if (authLoading || loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
        <p className="text-sm text-text-muted">
          Vui lòng <Link href="/login" className="text-accent hover:underline">đăng nhập</Link> để xem thông báo.
        </p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-12 text-center space-y-3">
        <AlertCircle className="mx-auto size-8 text-danger" />
        <p className="text-sm text-danger">{err}</p>
        <Button variant="outline" onClick={load}>Thử lại</Button>
      </div>
    );
  }

  const displayed = tab === "unread" ? items.filter((i) => !i.isRead) : items;
  const unreadCount = items.filter((i) => !i.isRead).length;

  return (
    <div className="max-w-2xl space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-xl border border-border bg-bg-elev p-1">
          {(["all", "unread"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                tab === t ? "bg-bg-card text-text shadow-sm" : "text-text-muted hover:text-text"
              }`}
            >
              {t === "all" ? "Tất cả" : "Chưa đọc"}
              {t === "unread" && unreadCount > 0 && (
                <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<CheckCheck className="size-4" />}
            onClick={handleMarkAllRead}
          >
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-card p-16 text-center">
          <Bell className="mx-auto size-12 text-border" />
          <p className="mt-4 text-sm font-semibold text-text">
            {tab === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
          {displayed.map((n, idx) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.system;
            const inner = (
              <div
                className={`flex items-start gap-3 px-4 py-3.5 transition hover:bg-bg-elev ${
                  !n.isRead ? "bg-brand/[0.03]" : ""
                } ${idx !== displayed.length - 1 ? "border-b border-border" : ""}`}
                onClick={() => handleMarkRead(n)}
              >
                {/* Unread dot */}
                <div className="relative mt-1 shrink-0">
                  <div className={`grid size-9 place-items-center rounded-xl ${meta.color}`}>
                    {meta.icon}
                  </div>
                  {!n.isRead && (
                    <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-bg-card bg-danger" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-snug ${!n.isRead ? "font-semibold text-text" : "font-medium text-text"}`}>
                    {n.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{n.body}</p>
                  <p className="mt-1 text-[10px] text-text-dim">{formatRelativeTime(n.createdAt)}</p>
                </div>

                {n.link && <ChevronRight className="mt-1 size-4 shrink-0 text-text-dim" />}
              </div>
            );

            return n.link ? (
              <Link key={n.id} href={n.link} className="block cursor-pointer">
                {inner}
              </Link>
            ) : (
              <div key={n.id} className="cursor-default">{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
