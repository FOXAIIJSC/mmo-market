import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata = { title: "Đăng nhập | MMO Market" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Chào mừng bạn quay lại MMO Market — sàn TMĐT chuyên biệt MMO."
    >
      <form className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">
            Email hoặc Username
          </label>
          <Input
            leftIcon={<Mail className="size-4" />}
            placeholder="email@gmail.com"
            type="email"
            defaultValue="hientv2272@gmail.com"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <label className="font-medium text-text-muted">Mật khẩu</label>
            <Link
              href="/forgot-password"
              className="text-accent hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <Input
            leftIcon={<Lock className="size-4" />}
            placeholder="••••••••"
            type="password"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input type="checkbox" className="size-4 accent-brand" defaultChecked />
          Ghi nhớ đăng nhập trên thiết bị này
        </label>

        <Button size="lg" className="w-full">
          Đăng nhập
        </Button>

        <div className="relative my-6 text-center text-xs text-text-muted">
          <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <span className="relative bg-bg px-3">hoặc đăng nhập bằng</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="md">
            <span className="text-base">G</span> Google
          </Button>
          <Button variant="outline" size="md">
            <span className="text-base">f</span> Facebook
          </Button>
        </div>

        <p className="pt-2 text-center text-sm text-text-muted">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-accent hover:underline">
            Đăng ký miễn phí
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
