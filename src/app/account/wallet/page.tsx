import { ArrowDownToLine, ArrowUpFromLine, Plus, QrCode, Wallet, History } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { buyerNav } from "@/lib/buyerNav";
import { walletTxns } from "@/lib/data";
import { formatRelativeTime, formatVND } from "@/lib/format";

export const metadata = { title: "Ví & nạp tiền | MMO Market" };

const topupMethods = [
  { v: "vietqr", label: "VietQR", desc: "Tự động ghi nhận", fee: 0 },
  { v: "momo", label: "MoMo", desc: "Quét QR / deeplink", fee: 0 },
  { v: "zalopay", label: "ZaloPay", desc: "Qua app ZaloPay", fee: 0 },
  { v: "vnpay", label: "VNPay", desc: "Thẻ ATM/Visa", fee: 5_000 },
  { v: "usdt", label: "USDT", desc: "TRC20/ERC20", fee: 0 },
];

export default function WalletPage() {
  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Ví nội bộ"
      subtitle="Quản lý số dư, nạp/rút tiền và lịch sử giao dịch"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl border border-border bg-gradient-to-br from-brand/30 via-bg-card to-accent/20 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                <Wallet className="size-4" /> Số dư khả dụng
              </div>
              <div className="num mt-3 text-4xl font-extrabold text-text">
                {formatVND(2_075_000)}
              </div>
              <div className="mt-1 text-xs text-text-muted">
                Tiền giữ escrow: {formatVND(450_000)} · Bonus chưa lock: {formatVND(50_000)}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-bg-card/80 p-3 backdrop-blur">
              <QrCode className="size-12 text-text-muted" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button leftIcon={<Plus className="size-4" />}>Nạp tiền</Button>
            <Button variant="outline" leftIcon={<ArrowUpFromLine className="size-4" />}>
              Rút tiền
            </Button>
            <Button variant="soft" leftIcon={<ArrowDownToLine className="size-4" />}>
              Chuyển ví
            </Button>
            <Button variant="ghost" leftIcon={<History className="size-4" />}>
              Lịch sử
            </Button>
          </div>
        </div>

        <Stat
          label="Tổng đã nạp"
          value={formatVND(8_950_000)}
          delta="42 lần nạp · trung bình 213K"
          icon={<ArrowDownToLine className="size-4" />}
          tone="success"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Topup */}
        <section className="rounded-2xl border border-border bg-bg-card p-5 lg:col-span-2">
          <h2 className="text-base font-bold text-text">Nạp nhanh</h2>
          <p className="mt-1 text-xs text-text-muted">
            Chọn phương thức và mệnh giá. Nhận bonus 5% khi nạp ≥ 1 triệu.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
            {[100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000].map(
              (a, i) => (
                <button
                  key={a}
                  className={`rounded-xl border p-3 text-center text-sm font-semibold transition ${
                    i === 2
                      ? "border-brand bg-brand-soft text-text"
                      : "border-border bg-bg-elev text-text-muted hover:border-brand/40 hover:text-text"
                  }`}
                >
                  <div className="num">{formatVND(a)}</div>
                  {a >= 1_000_000 && (
                    <div className="mt-0.5 text-[10px] text-success">
                      +{formatVND(a * 0.05)} bonus
                    </div>
                  )}
                </button>
              ),
            )}
          </div>

          <div className="mt-4 grid gap-2">
            {topupMethods.map((m, i) => (
              <label
                key={m.v}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${
                  i === 0 ? "border-brand bg-brand-soft" : "border-border bg-bg-elev/50"
                }`}
              >
                <input
                  type="radio"
                  name="topup"
                  defaultChecked={i === 0}
                  className="size-4 accent-brand"
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-text">{m.label}</div>
                  <div className="text-xs text-text-muted">{m.desc}</div>
                </div>
                <div className="text-xs">
                  {m.fee === 0 ? (
                    <span className="text-success">Miễn phí</span>
                  ) : (
                    <span className="text-text-muted">+ {formatVND(m.fee)}</span>
                  )}
                </div>
              </label>
            ))}
          </div>

          <Button size="lg" className="mt-4 w-full">
            Tạo lệnh nạp
          </Button>
        </section>

        {/* History */}
        <section className="rounded-2xl border border-border bg-bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-bold text-text">Giao dịch gần đây</h2>
          </div>
          <ul className="divide-y divide-border">
            {walletTxns.map((t) => (
              <li key={t.id} className="px-5 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text capitalize">
                    {t.type === "topup"
                      ? "Nạp tiền"
                      : t.type === "purchase"
                        ? "Mua hàng"
                        : t.type === "bonus"
                          ? "Thưởng"
                          : t.type === "commission"
                            ? "Hoa hồng"
                            : t.type}
                  </span>
                  <span
                    className={`num font-semibold ${
                      t.amount > 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {t.amount > 0 ? "+" : ""}
                    {formatVND(t.amount)}
                  </span>
                </div>
                <div className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                  {t.note}
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[11px] text-text-dim">
                  <span>{formatRelativeTime(t.createdAt)}</span>
                  <span
                    className={
                      t.status === "completed"
                        ? "text-success"
                        : t.status === "pending"
                          ? "text-warning"
                          : "text-danger"
                    }
                  >
                    {t.status === "completed"
                      ? "Hoàn tất"
                      : t.status === "pending"
                        ? "Đang giữ"
                        : "Thất bại"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}
