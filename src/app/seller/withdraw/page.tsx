import { ArrowDownToLine, CreditCard, Wallet } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { sellerNav } from "@/lib/sellerNav";
import { formatVND } from "@/lib/format";

export const metadata = { title: "Rút tiền | MMO Market Seller" };

const withdrawals = [
  { id: "WD-2025-0142", amount: 8_500_000, method: "Vietcombank", status: "completed", at: "2 giờ trước" },
  { id: "WD-2025-0141", amount: 12_400_000, method: "MB Bank", status: "completed", at: "3 ngày trước" },
  { id: "WD-2025-0140", amount: 4_200_000, method: "Vietcombank", status: "processing", at: "Hôm nay" },
  { id: "WD-2025-0139", amount: 980_000, method: "USDT TRC20", status: "completed", at: "1 tuần trước" },
];

export default function WithdrawPage() {
  return (
    <DashboardLayout
      variant="seller"
      groups={sellerNav}
      title="Rút tiền"
      subtitle="Tiền có thể rút sau khi đơn hoàn tất escrow (3-7 ngày)"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl border border-border bg-gradient-to-br from-brand/30 via-bg-card to-accent/20 p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Số dư có thể rút
          </div>
          <div className="num mt-2 text-4xl font-extrabold text-text">
            {formatVND(48_250_000)}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3 text-xs text-text-muted">
            <div>
              <div className="num text-base font-bold text-text">
                {formatVND(12_400_000)}
              </div>
              Tiền đang giữ escrow
            </div>
            <div>
              <div className="num text-base font-bold text-text">
                {formatVND(8_400_000)}
              </div>
              Tiền chờ duyệt rút
            </div>
            <div>
              <div className="num text-base font-bold text-text">
                {formatVND(425_000)}
              </div>
              Phí sàn 30 ngày
            </div>
          </div>
        </div>

        <Stat
          label="Đã rút năm 2025"
          value={formatVND(842_000_000)}
          delta="48 lệnh thành công"
          icon={<ArrowDownToLine className="size-4" />}
          tone="success"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <section className="rounded-2xl border border-border bg-bg-card p-5 lg:col-span-2">
          <h2 className="text-base font-bold text-text">Tạo lệnh rút tiền</h2>
          <p className="mt-1 text-xs text-text-muted">
            Lệnh được duyệt trong 1-2h vào giờ hành chính. Phí rút 0% qua ngân hàng VN.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">
                Số tiền cần rút
              </label>
              <input
                defaultValue="10.000.000"
                className="num h-12 w-full rounded-xl border border-border bg-bg-elev px-4 text-lg font-semibold text-text outline-none focus:border-brand"
              />
              <div className="mt-1 flex justify-between text-xs text-text-muted">
                <span>Tối thiểu {formatVND(100_000)}</span>
                <button className="text-accent hover:underline">Rút toàn bộ</button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-text-muted">
                Phương thức
              </label>
              <div className="grid gap-2 md:grid-cols-2">
                {[
                  { v: "bank", label: "Ngân hàng VN", desc: "0% phí, 1-2h", icon: CreditCard },
                  { v: "usdt", label: "USDT (TRC20)", desc: "Phí 1 USDT, < 30 phút", icon: Wallet },
                ].map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <label
                      key={m.v}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                        i === 0 ? "border-brand bg-brand-soft" : "border-border bg-bg-elev"
                      }`}
                    >
                      <input
                        type="radio"
                        name="method"
                        defaultChecked={i === 0}
                        className="size-4 accent-brand"
                      />
                      <Icon className="size-5 text-text-muted" />
                      <div>
                        <div className="text-sm font-semibold text-text">{m.label}</div>
                        <div className="text-xs text-text-muted">{m.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                  Ngân hàng
                </label>
                <select className="h-11 w-full rounded-xl border border-border bg-bg-elev px-3 text-sm text-text outline-none focus:border-brand">
                  <option>Vietcombank — Kim Chi (1023****8920)</option>
                  <option>MB Bank — Kim Chi (8240****1182)</option>
                  <option>Techcombank — Kim Chi (1900****5621)</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-text-muted">
                  Mã 2FA
                </label>
                <input
                  placeholder="6 số từ Authenticator"
                  className="num h-11 w-full rounded-xl border border-border bg-bg-elev px-3 text-text placeholder:text-text-dim outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-bg-elev p-3 text-xs text-text-muted">
              Bạn sẽ nhận: <span className="num font-semibold text-text">{formatVND(10_000_000)}</span> · Phí: 0₫ · Dự kiến: 1-2h.
            </div>

            <Button size="lg" className="w-full">
              Xác nhận rút tiền
            </Button>
          </div>
        </section>

        {/* History */}
        <section className="rounded-2xl border border-border bg-bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-text">Lệnh gần đây</h2>
          </div>
          <ul className="divide-y divide-border">
            {withdrawals.map((w) => (
              <li key={w.id} className="px-5 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-text">{w.id}</span>
                  <Badge tone={w.status === "completed" ? "success" : "warning"}>
                    {w.status === "completed" ? "Đã chuyển" : "Đang xử lý"}
                  </Badge>
                </div>
                <div className="mt-1 num text-base font-bold text-text">
                  {formatVND(w.amount)}
                </div>
                <div className="text-xs text-text-muted">
                  {w.method} · {w.at}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}
