import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { Logo } from "./Logo";
import { categories } from "@/lib/data";
import { HeaderUserActions } from "./HeaderUserActions";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
      {/* Top bar */}
      <div className="hidden border-b border-border/60 bg-bg-elev/50 text-xs text-text-muted lg:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-success" />
              Hệ thống đang hoạt động bình thường
            </span>
            <span>Hỗ trợ 24/7</span>
            <Link href="/help" className="hover:text-text">
              Trung tâm hỗ trợ
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/seller/onboarding" className="hover:text-text">
              Đăng ký bán hàng
            </Link>
            <Link href="/affiliate" className="hover:text-text">
              Affiliate / CTV
            </Link>
            <Link href="/help/buy" className="hover:text-text">
              Hướng dẫn mua hàng
            </Link>
            <span className="text-text-dim">|</span>
            <span>VND 🇻🇳</span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Logo />

        {/* Search */}
        <form
          action="/search"
          className="relative hidden flex-1 md:block"
          role="search"
        >
          <input
            name="q"
            type="search"
            placeholder="Tìm tài khoản AI, tool, gift card, khoá học..."
            className="h-11 w-full rounded-full border border-border bg-bg-elev pl-11 pr-32 text-sm text-text placeholder:text-text-dim outline-none ring-0 transition focus:border-brand focus:bg-bg-card"
          />
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 h-8 rounded-full bg-gradient-to-r from-brand to-accent px-4 text-xs font-semibold text-white shadow-md shadow-brand/40"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Actions — role-aware, rendered client-side */}
        <HeaderUserActions />
      </div>

      {/* Category nav */}
      <div className="hidden border-t border-border bg-bg-elev/40 md:block">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 overflow-x-auto px-2 text-sm no-scrollbar">
          <Link
            href="/marketplace"
            className="whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-text hover:bg-bg-elev"
          >
            Tất cả sản phẩm
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/c/${c.slug}`}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-text-muted hover:bg-bg-elev hover:text-text"
            >
              {c.name}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/flash-sale"
              className="whitespace-nowrap rounded-full bg-warning/10 px-3 py-1.5 font-medium text-warning hover:bg-warning/20"
            >
              ⚡ Flash Sale
            </Link>
            <Link
              href="/seller/dashboard"
              className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-text-muted hover:bg-bg-elev hover:text-text"
            >
              Kênh người bán
              <ChevronDown className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
