import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Xác thực 2FA | MMO Market" };

export default function TwoFactorPage() {
  return (
    <AuthShell
      title="Xác thực 2 bước"
      subtitle="Nhập mã 6 số từ ứng dụng xác thực (Google Authenticator, Authy...). 2FA bắt buộc với Seller & CTV."
    >
      <form className="space-y-5">
        <div className="rounded-xl border border-border bg-bg-card p-4 text-sm text-text-muted">
          <ShieldCheck className="mb-1 size-4 text-success" />
          Hệ thống bảo mật bằng TOTP. Code thay đổi mỗi 30 giây.
        </div>

        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              maxLength={1}
              defaultValue={["1", "2", "8", "4", "0", "9"][i]}
              className="num size-12 rounded-xl border border-border bg-bg-elev text-center text-xl font-bold text-text outline-none focus:border-brand"
            />
          ))}
        </div>

        <Button size="lg" className="w-full">
          Xác nhận
        </Button>

        <p className="text-center text-xs text-text-muted">
          Không truy cập được app xác thực?{" "}
          <Link href="#" className="text-accent hover:underline">
            Dùng mã backup
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
