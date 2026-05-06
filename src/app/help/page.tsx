import Link from "next/link";
import { ChevronRight, MessageCircle, Mail, Phone, ShieldCheck, Wallet, ShoppingBag, Users } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

export const metadata = { title: "Trung tâm hỗ trợ | MMO Market" };

const topics = [
  { icon: ShoppingBag, title: "Mua hàng & thanh toán", count: 24, slug: "buy" },
  { icon: Wallet, title: "Ví, nạp & rút tiền", count: 18, slug: "wallet" },
  { icon: ShieldCheck, title: "Cơ chế Escrow & bảo vệ", count: 12, slug: "escrow" },
  { icon: Users, title: "Bán hàng & KYC", count: 32, slug: "sell" },
];

const popular = [
  "Tôi đã thanh toán nhưng chưa nhận tài khoản, làm sao?",
  "Tài khoản bị thay mật khẩu, có được hoàn tiền không?",
  "Quy trình khiếu nại đơn hàng?",
  "Phí sàn cho người bán là bao nhiêu?",
  "Khi nào tiền được giải phóng cho seller?",
  "Cách upload kho auto-delivery cho seller?",
];

export default function HelpPage() {
  return (
    <SiteShell>
      <div className="bg-gradient-to-b from-bg-card to-bg">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold text-text md:text-5xl">
            Chúng tôi có thể giúp gì?
          </h1>
          <p className="mt-3 text-text-muted">
            Câu trả lời cho các câu hỏi phổ biến — phần còn lại chat với chúng tôi 24/7.
          </p>
          <div className="mx-auto mt-6 max-w-2xl">
            <input
              placeholder="Nhập câu hỏi của bạn..."
              className="h-14 w-full rounded-2xl border border-border bg-bg-card px-5 text-base text-text placeholder:text-text-dim outline-none focus:border-brand"
            />
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-xl font-bold text-text">Chủ đề thường gặp</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {topics.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.slug}
                href={`/help/${t.slug}`}
                className="rounded-2xl border border-border bg-bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand/60"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-3 font-semibold text-text">{t.title}</h3>
                <p className="mt-1 text-xs text-text-muted">{t.count} bài viết</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10">
        <h2 className="text-xl font-bold text-text">Câu hỏi phổ biến</h2>
        <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-bg-card">
          {popular.map((q) => (
            <li key={q}>
              <Link
                href="#"
                className="flex items-center justify-between px-5 py-4 text-sm text-text-muted hover:bg-bg-elev hover:text-text"
              >
                <span>{q}</span>
                <ChevronRight className="size-4" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { icon: MessageCircle, label: "Live chat 24/7", value: "Trả lời trong 2 phút", tone: "bg-brand-soft text-brand" },
            { icon: Mail, label: "Email", value: "support@mmomkt.vn", tone: "bg-accent-soft text-accent" },
            { icon: Phone, label: "Hotline", value: "1900 5478 (8h-22h)", tone: "bg-success/10 text-success" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-bg-card p-4"
              >
                <div className={`grid size-11 place-items-center rounded-xl ${c.tone}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="text-xs text-text-muted">{c.label}</div>
                  <div className="font-semibold text-text">{c.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}
