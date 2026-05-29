"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/NotificationContext";

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Link
      href="/account/notifications"
      className="relative hidden rounded-full p-2 hover:bg-bg-elev hover:text-text md:block"
      aria-label="Thông báo"
    >
      <Bell className="size-5" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
