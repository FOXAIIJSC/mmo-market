import { Megaphone } from "lucide-react";

const items = [
  "🛡 Mọi giao dịch được giữ tiền escrow tối đa 7 ngày",
  "⚡ Auto-delivery dưới 5 giây sau thanh toán",
  "🔒 Tài khoản kho mã hoá AES-256",
  "🎁 Nạp 500K tặng 50K cho thành viên mới",
  "🤝 Hoa hồng affiliate lên đến 10% trọn đời",
  "📞 Hỗ trợ 24/7 qua live chat trên sàn",
];

export function PromoStrip() {
  return (
    <div className="border-y border-border bg-bg-elev/40">
      <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 py-2 text-xs text-text-muted">
        <Megaphone className="size-4 shrink-0 text-accent" />
        <div className="flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
            {[...items, ...items].map((it, i) => (
              <span key={i} className="flex items-center gap-2">
                {it}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
