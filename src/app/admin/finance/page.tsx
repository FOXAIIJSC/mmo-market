import { ArrowDownToLine, ArrowUpFromLine, DollarSign, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Stat";
import { adminNav } from "@/lib/adminNav";
import { formatVND } from "@/lib/format";

export const metadata = { title: "Tài chính | Admin" };

const flows = [
  { type: "topup", label: "Buyer nạp tiền (VietQR)", in: 248_500_000, out: 0, count: 412 },
  { type: "purchase", label: "Mua hàng (escrow vào)", in: 184_280_000, out: 0, count: 842 },
  { type: "release", label: "Giải phóng escrow → Seller", in: 0, out: 142_580_000, count: 740 },
  { type: "withdraw", label: "Seller rút tiền", in: 0, out: 124_280_000, count: 84 },
  { type: "refund", label: "Hoàn tiền tranh chấp", in: 0, out: 8_240_000, count: 12 },
  { type: "fee", label: "Phí sàn ghi nhận", in: 12_482_000, out: 0, count: 740 },
  { type: "commission", label: "Hoa hồng affiliate", in: 0, out: 4_125_000, count: 142 },
];

export default function AdminFinancePage() {
  return (
    <DashboardLayout
      variant="admin"
      groups={adminNav}
      title="Tài chính sàn"
      subtitle="Đối soát & dòng tiền 30 ngày"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Tiền vào"
          value={formatVND(445_262_000)}
          delta="3 nguồn chính"
          icon={<ArrowDownToLine className="size-4" />}
          tone="success"
        />
        <Stat
          label="Tiền ra"
          value={formatVND(279_225_000)}
          delta="3 lệnh đang chờ duyệt"
          icon={<ArrowUpFromLine className="size-4" />}
          tone="danger"
        />
        <Stat
          label="Số dư hệ thống"
          value={formatVND(166_037_000)}
          icon={<DollarSign className="size-4" />}
          tone="brand"
        />
        <Stat
          label="Doanh thu sàn"
          value={formatVND(12_482_000)}
          delta="+24.6% so với tháng trước"
          icon={<TrendingUp className="size-4" />}
          tone="accent"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-text">Dòng tiền theo loại giao dịch</h2>
          <select className="h-9 rounded-md border border-border bg-bg-elev px-3 text-xs text-text-muted outline-none">
            <option>30 ngày</option>
            <option>7 ngày</option>
            <option>90 ngày</option>
          </select>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">Loại</th>
              <th className="px-5 py-3 text-right">Số lượng</th>
              <th className="px-5 py-3 text-right">Tiền vào</th>
              <th className="px-5 py-3 text-right">Tiền ra</th>
              <th className="px-5 py-3 text-right">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {flows.map((f) => {
              const net = f.in - f.out;
              return (
                <tr key={f.type} className="hover:bg-bg-elev/30">
                  <td className="px-5 py-3 font-medium text-text">{f.label}</td>
                  <td className="num px-5 py-3 text-right text-text-muted">{f.count}</td>
                  <td className="num px-5 py-3 text-right text-success">
                    {f.in > 0 ? `+${formatVND(f.in)}` : "—"}
                  </td>
                  <td className="num px-5 py-3 text-right text-danger">
                    {f.out > 0 ? `-${formatVND(f.out)}` : "—"}
                  </td>
                  <td
                    className={`num px-5 py-3 text-right font-semibold ${
                      net >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {net >= 0 ? "+" : ""}
                    {formatVND(net)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-bg-elev/50 text-sm font-semibold">
              <td className="px-5 py-3 text-text">Tổng cộng</td>
              <td className="num px-5 py-3 text-right text-text">2.972</td>
              <td className="num px-5 py-3 text-right text-success">
                +{formatVND(445_262_000)}
              </td>
              <td className="num px-5 py-3 text-right text-danger">
                -{formatVND(279_225_000)}
              </td>
              <td className="num px-5 py-3 text-right text-accent">
                +{formatVND(166_037_000)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <h3 className="text-base font-bold text-text">Lệnh rút chờ duyệt</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { user: "kimchi", amount: 18_400_000 },
              { user: "tooltgvn", amount: 8_200_000 },
              { user: "courseaff", amount: 4_120_000 },
            ].map((w) => (
              <li
                key={w.user}
                className="flex items-center justify-between rounded-xl border border-border bg-bg-elev/40 px-3 py-2"
              >
                <div>
                  <span className="font-medium text-text">@{w.user}</span>
                  <Badge tone="success" className="ml-2">ĐÃ KYC</Badge>
                </div>
                <span className="num text-sm font-semibold text-text">
                  {formatVND(w.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-bg-card p-5">
          <h3 className="text-base font-bold text-text">Đối soát ngân hàng</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { bank: "Vietcombank — 1023****8920", balance: 142_400_000, status: "ok" },
              { bank: "MB Bank — 8240****1182", balance: 24_280_000, status: "ok" },
              { bank: "Crypto Wallet (USDT)", balance: 8_000_000, status: "warn" },
            ].map((b) => (
              <li
                key={b.bank}
                className="flex items-center justify-between rounded-xl border border-border bg-bg-elev/40 px-3 py-2"
              >
                <div>
                  <div className="text-xs text-text-muted">{b.bank}</div>
                  <div className="num text-sm font-semibold text-text">
                    {formatVND(b.balance)}
                  </div>
                </div>
                <Badge tone={b.status === "ok" ? "success" : "warning"}>
                  {b.status === "ok" ? "Khớp" : "Lệch 0.02%"}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
