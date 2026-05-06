import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export const metadata = { title: "Quên mật khẩu | MMO Market" };

export default function ForgotPage() {
  return (
    <AuthShell
      title="Khôi phục mật khẩu"
      subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP 6 số (hết hạn 15 phút)."
    >
      <form className="space-y-4">
        <Input leftIcon={<Mail className="size-4" />} placeholder="email@gmail.com" />
        <Button size="lg" className="w-full">
          Gửi mã OTP
        </Button>
        <p className="text-center text-sm text-text-muted">
          Nhớ mật khẩu rồi?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
