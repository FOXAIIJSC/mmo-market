import Link from "next/link";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Về MMO Market",
    links: [
      { label: "Giới thiệu", href: "/about" },
      { label: "Tuyển dụng", href: "/careers" },
      { label: "Liên hệ", href: "/contact" },
      { label: "Tin tức", href: "/blog" },
    ],
  },
  {
    title: "Hỗ trợ khách hàng",
    links: [
      { label: "Trung tâm hỗ trợ", href: "/help" },
      { label: "Hướng dẫn mua hàng", href: "/help/buy" },
      { label: "Hướng dẫn bán hàng", href: "/help/sell" },
      { label: "Khiếu nại đơn hàng", href: "/help/dispute" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Chính sách",
    links: [
      { label: "Điều khoản sử dụng", href: "/policy/terms" },
      { label: "Chính sách bảo mật", href: "/policy/privacy" },
      { label: "Chính sách hoàn tiền", href: "/policy/refund" },
      { label: "Cơ chế Escrow", href: "/policy/escrow" },
    ],
  },
  {
    title: "Cộng tác",
    links: [
      { label: "Đăng ký bán hàng", href: "/seller/onboarding" },
      { label: "Chương trình Affiliate", href: "/affiliate" },
      { label: "Reseller Program", href: "/reseller" },
      { label: "API Developer", href: "/developers" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-bg-elev/40">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo />
            <p className="mt-4 text-sm leading-6 text-text-muted">
              Sàn thương mại điện tử chuyên biệt cho cộng đồng MMO Việt Nam.
              Giao dịch escrow, kiểm tra trùng tài khoản, hỗ trợ 24/7.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-muted">
              <span className="rounded-md border border-border bg-bg-card px-2 py-1">
                🛡 Escrow 3-7 ngày
              </span>
              <span className="rounded-md border border-border bg-bg-card px-2 py-1">
                🔒 AES-256
              </span>
              <span className="rounded-md border border-border bg-bg-card px-2 py-1">
                ⚡ Auto-delivery
              </span>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h4 className="mb-3 text-sm font-semibold text-text">
                {col.title}
              </h4>
              <ul className="space-y-2 text-sm text-text-muted">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-text">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-text-muted md:flex-row md:items-center">
          <div>
            © {new Date().getFullYear()} MMO Market. Sản phẩm minh hoạ build từ
            spec — chưa phải sàn thương mại thật.
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span>Phương thức thanh toán:</span>
            {[
              "VietQR",
              "MoMo",
              "ZaloPay",
              "VNPay",
              "Ví nội bộ",
              "USDT",
            ].map((p) => (
              <span
                key={p}
                className="rounded-md border border-border bg-bg-card px-2 py-1 text-text"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
