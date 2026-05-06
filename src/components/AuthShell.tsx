import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  side,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  side?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="relative flex flex-col p-6 md:p-10">
          <Logo />
          <div className="my-auto w-full max-w-md self-center">
            <h1 className="text-3xl font-extrabold leading-tight text-text">
              {title}
            </h1>
            <p className="mt-2 text-sm text-text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
          <div className="mt-6 text-xs text-text-muted">
            © {new Date().getFullYear()} MMO Market —{" "}
            <Link href="/policy/terms" className="hover:text-text">
              Điều khoản
            </Link>{" "}
            ·{" "}
            <Link href="/policy/privacy" className="hover:text-text">
              Bảo mật
            </Link>
          </div>
        </div>

        <div className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-brand via-fuchsia-700 to-accent" />
          <div className="absolute inset-0 bg-dots opacity-20 mix-blend-overlay" />
          <div className="absolute -right-24 top-1/3 size-96 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute bottom-10 left-10 right-10 text-white">
            {side ?? (
              <>
                <h2 className="text-3xl font-extrabold">
                  Sàn TMĐT chuyên biệt cho cộng đồng MMO
                </h2>
                <p className="mt-3 max-w-md text-white/80">
                  Mua bán an toàn với cơ chế escrow giữ tiền 3-7 ngày, kiểm tra
                  trùng tài khoản, hỗ trợ 24/7.
                </p>
                <ul className="mt-6 grid gap-3 text-sm text-white/90 md:grid-cols-2">
                  {[
                    "✅ Escrow 72h bảo vệ buyer",
                    "⚡ Auto-delivery < 5 giây",
                    "🔐 Mã hoá AES-256 dữ liệu kho",
                    "💰 Hoa hồng affiliate trọn đời",
                  ].map((b) => (
                    <li
                      key={b}
                      className="rounded-xl bg-white/10 p-3 backdrop-blur"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
