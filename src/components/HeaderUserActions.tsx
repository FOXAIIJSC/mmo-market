"use client";
import Link from "next/link";
import {
  Heart, LayoutDashboard, LogOut, Settings,
  ShoppingCart, User, Wallet,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { NotificationBell } from "./NotificationBell";
import { formatVND } from "@/lib/format";

export function HeaderUserActions() {
  const { user, logout } = useAuth();

  // ── Guest ────────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <nav className="ml-auto flex items-center gap-1.5 text-sm text-text-muted">
        <NotificationBell />
        <div className="ml-2 hidden h-9 w-px bg-border md:block"></div>
        <Link
          href="/login"
          className="hidden rounded-full border border-border bg-bg-elev px-4 py-2 text-text hover:border-brand md:block"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="hidden rounded-full bg-gradient-to-r from-brand to-accent px-4 py-2 font-semibold text-white shadow-lg shadow-brand/30 md:block"
        >
          Đăng ký
        </Link>
        <Link
          href="/account"
          className="grid h-9 w-9 place-items-center rounded-full bg-bg-elev text-text md:hidden"
          aria-label="Tài khoản"
        >
          <User className="size-4" />
        </Link>
      </nav>
    );
  }

  const isAdmin = user.role === "Admin" || user.role === "SuperAdmin";
  const isSeller = user.role === "Seller";

  // ── Admin / SuperAdmin ────────────────────────────────────────────────────
  if (isAdmin) {
    return (
      <nav className="ml-auto flex items-center gap-2 text-sm text-text-muted">
        <NotificationBell />
        <div className="ml-1 hidden h-9 w-px bg-border md:block"></div>
        <Link
          href="/admin"
          className="hidden items-center gap-2 rounded-full border border-danger/40 bg-danger/10 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/20 md:flex"
        >
          <LayoutDashboard className="size-4" />
          Admin Panel
        </Link>
        <div className="relative ml-1 flex items-center">
          <button className="flex items-center gap-2 rounded-full border border-border bg-bg-elev px-3 py-2 text-sm text-text hover:border-brand">
            <span
              className="grid size-6 place-items-center rounded-full text-[11px] font-extrabold text-white"
              style={{ background: user.avatarColor }}
            >
              {user.displayName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden max-w-24 truncate md:block">{user.displayName}</span>
          </button>
        </div>
        <button
          onClick={logout}
          className="hidden rounded-full p-2 text-text-muted hover:bg-bg-elev hover:text-danger md:block"
          aria-label="Đăng xuất"
          title="Đăng xuất"
        >
          <LogOut className="size-4" />
        </button>
      </nav>
    );
  }

  // ── Seller ────────────────────────────────────────────────────────────────
  if (isSeller) {
    return (
      <nav className="ml-auto flex items-center gap-1.5 text-sm text-text-muted">
        <Link
          href="/account/wallet"
          className="hidden items-center gap-2 rounded-full px-3 py-2 hover:bg-bg-elev hover:text-text md:flex"
        >
          <Wallet className="size-4" />
          <span className="num">{formatVND(user.walletBalance)}</span>
        </Link>
        <NotificationBell />
        <div className="ml-2 hidden h-9 w-px bg-border md:block"></div>
        <Link
          href="/seller/dashboard"
          className="hidden items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand hover:bg-brand/20 md:flex"
        >
          <LayoutDashboard className="size-4" />
          Kênh bán hàng
        </Link>
        <button
          onClick={logout}
          className="hidden rounded-full p-2 text-text-muted hover:bg-bg-elev hover:text-danger md:block"
          aria-label="Đăng xuất"
          title="Đăng xuất"
        >
          <LogOut className="size-4" />
        </button>
        <Link
          href="/account"
          className="grid h-9 w-9 place-items-center rounded-full bg-bg-elev text-text hover:border-brand md:hidden"
          aria-label="Tài khoản"
        >
          <User className="size-4" />
        </Link>
      </nav>
    );
  }

  // ── Buyer (logged in) ─────────────────────────────────────────────────────
  return (
    <nav className="ml-auto flex items-center gap-1.5 text-sm text-text-muted">
      <Link
        href="/account/wallet"
        className="hidden items-center gap-2 rounded-full px-3 py-2 hover:bg-bg-elev hover:text-text md:flex"
      >
        <Wallet className="size-4" />
        <span className="num">{formatVND(user.walletBalance)}</span>
      </Link>
      <NotificationBell />
      <Link
        href="/account/wishlist"
        className="hidden rounded-full p-2 hover:bg-bg-elev hover:text-text md:block"
        aria-label="Yêu thích"
      >
        <Heart className="size-5" />
      </Link>
      <Link
        href="/cart"
        className="relative rounded-full p-2 hover:bg-bg-elev hover:text-text"
        aria-label="Giỏ hàng"
      >
        <ShoppingCart className="size-5" />
      </Link>

      <div className="ml-2 hidden h-9 w-px bg-border md:block"></div>
      <Link
        href="/account"
        className="hidden items-center gap-2 rounded-full border border-border bg-bg-elev px-3 py-2 text-text hover:border-brand md:flex"
      >
        <span
          className="grid size-5 place-items-center rounded-full text-[10px] font-bold text-white"
          style={{ background: user.avatarColor }}
        >
          {user.displayName.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-20 truncate text-sm">{user.displayName}</span>
      </Link>
      <button
        onClick={logout}
        className="hidden rounded-full p-2 text-text-muted hover:bg-bg-elev hover:text-danger md:block"
        aria-label="Đăng xuất"
        title="Đăng xuất"
      >
        <LogOut className="size-4" />
      </button>
      <Link
        href="/account"
        className="grid h-9 w-9 place-items-center rounded-full bg-bg-elev text-text md:hidden"
        aria-label="Tài khoản"
      >
        <User className="size-4" />
      </Link>
    </nav>
  );
}
