import { Copy, Share2, TrendingUp, Users } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { buyerNav } from "@/lib/buyerNav";
import { formatVND } from "@/lib/format";

export const metadata = { title: "Affiliate / Giới thiệu bạn | MMO Market" };

const refs = [
  { user: "minhdz", joined: "2 ngày", orders: 5, commission: 125_000 },
  { user: "huyit", joined: "5 ngày", orders: 3, commission: 89_000 },
  { user: "trangvy", joined: "1 tuần", orders: 12, commission: 285_000 },
  { user: "namphan", joined: "2 tuần", orders: 1, commission: 18_000 },
];

export default function ReferralPage() {
  return (
    <DashboardLayout
      variant="buyer"
      groups={buyerNav}
      title="Affiliate / Giới thiệu bạn"
      subtitle="Mời bạn bè – nhận đến 10% hoa hồng cho mỗi đơn họ mua"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Tổng người đã ref"
          value="14"
          delta="+3 trong 7 ngày"
          icon={<Users className="size-4" />}
          tone="brand"
        />
        <Stat
          label="Hoa hồng tích luỹ"
          value={formatVND(485_000)}
          delta="Đã nhận 350K · Pending 135K"
          tone="success"
        />
        <Stat label="Đơn ref tháng này" value="21" delta="GMV 4.2M₫" tone="accent" />
        <Stat
          label="Tỷ lệ chuyển đổi"
          value="18.4%"
          delta="↑ 2.3% tuần trước"
          icon={<TrendingUp className="size-4" />}
          tone="warning"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-brand/30 bg-gradient-to-br from-brand/30 via-bg-card to-accent/20 p-6">
        <h3 className="text-base font-semibold text-text">Link giới thiệu của bạn</h3>
        <p className="mt-1 text-xs text-text-muted">
          Chia sẻ link để bạn bè đăng ký. Hoa hồng cộng vào ví ngay khi họ hoàn tất đơn đầu tiên.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code className="flex-1 rounded-xl border border-border bg-bg-card px-4 py-3 font-mono text-sm text-accent">
            https://mmomkt.vn/ref/hientv2272
          </code>
          <Button leftIcon={<Copy className="size-4" />}>Copy</Button>
          <Button variant="outline" leftIcon={<Share2 className="size-4" />}>Share</Button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            { tier: "Bronze", min: 0, rate: "5%", color: "from-amber-700 to-amber-500" },
            { tier: "Silver", min: 10, rate: "7%", color: "from-slate-400 to-slate-200" },
            { tier: "Gold", min: 30, rate: "10%", color: "from-yellow-500 to-yellow-300" },
          ].map((t) => (
            <div
              key={t.tier}
              className={`rounded-2xl bg-gradient-to-br ${t.color} p-4 text-bg-card`}
            >
              <div className="text-xs font-bold uppercase opacity-80">
                {t.tier}
              </div>
              <div className="num mt-1 text-2xl font-extrabold">{t.rate}</div>
              <div className="text-xs opacity-80">
                Cần ≥ {t.min} ref active / tháng
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-bold text-text">Người được giới thiệu</h2>
          <Button variant="ghost" size="sm">Xuất CSV</Button>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-text-muted">
            <tr>
              <th className="px-5 py-3">Username</th>
              <th className="px-5 py-3">Đã tham gia</th>
              <th className="px-5 py-3">Số đơn</th>
              <th className="px-5 py-3 text-right">Hoa hồng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {refs.map((r) => (
              <tr key={r.user} className="hover:bg-bg-elev/30">
                <td className="px-5 py-3">
                  <span className="font-medium text-text">@{r.user}</span>
                </td>
                <td className="px-5 py-3 text-text-muted">{r.joined}</td>
                <td className="px-5 py-3 num text-text">{r.orders}</td>
                <td className="px-5 py-3 num text-right font-semibold text-success">
                  +{formatVND(r.commission)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
