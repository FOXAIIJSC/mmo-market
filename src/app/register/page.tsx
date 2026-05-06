import Link from "next/link";
import { Mail, Lock, User, Phone } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata = { title: "Đăng ký | MMO Market" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Đăng ký miễn phí"
      subtitle="Mở tài khoản trong 30 giây. Nhận ngay 50K vào ví khi nạp lần đầu."
    >
      <form className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              Họ tên
            </label>
            <Input leftIcon={<User className="size-4" />} placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              Số điện thoại
            </label>
            <Input leftIcon={<Phone className="size-4" />} placeholder="0987 xxx xxx" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Email
          </label>
          <Input leftIcon={<Mail className="size-4" />} placeholder="email@gmail.com" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              Mật khẩu
            </label>
            <Input
              leftIcon={<Lock className="size-4" />}
              placeholder="≥ 8 ký tự, có số & ký tự đặc biệt"
              type="password"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              Nhập lại mật khẩu
            </label>
            <Input
              leftIcon={<Lock className="size-4" />}
              placeholder="••••••••"
              type="password"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Mã giới thiệu (tuỳ chọn)
          </label>
          <Input placeholder="Nhập username người giới thiệu" />
        </div>

        <label className="flex items-start gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-brand"
            defaultChecked
          />
          <span>
            Tôi đồng ý với{" "}
            <Link href="/policy/terms" className="text-accent hover:underline">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link href="/policy/privacy" className="text-accent hover:underline">
              Chính sách bảo mật
            </Link>
            .
          </span>
        </label>

        <Button size="lg" className="w-full">
          Tạo tài khoản
        </Button>

        <p className="pt-2 text-center text-sm text-text-muted">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
