"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TotpVerifyModal } from "@/components/TotpVerifyModal";
import { sellerNav } from "@/lib/sellerNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiSellerDashboard, ApiSellerWithdraw } from "@/lib/apiTypes";
import { formatRelativeTime, formatVND } from "@/lib/format";

const statusTone: Record<string, "success" | "warning" | "danger" | "muted"> = {
  Paid: "success",
  Approved: "success",
  Pending: "warning",
  Rejected: "danger",
};

export function SellerWithdrawClient() {
  const { user, token, loading: authLoading } = useAuth();
  const [dash, setDash] = useState<ApiSellerDashboard | null>(null);
  const [withdraws, setWithdraws] = useState<ApiSellerWithdraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ amount: 0, method: "Bank", account: "", note: "" });
  const [totpModal, setTotpModal] = useState(false);
  const [totpErr, setTotpErr] = useState<string | null>(null);

  const reload = async () => {
    if (!token) return;
    try {
      const [d, w] = await Promise.all([
        apiFetch<ApiSellerDashboard>("/api/seller/dashboard", { token }),
        apiFetch<ApiSellerWithdraw[]>("/api/seller/withdraws", { token }),
      ]);
      setDash(d);
      setWithdraws(w);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    void reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const submitWithdraw = async (totpCode?: string) => {
    if (!token) return;
    setSubmitting(true);
    try {
      await apiFetch<ApiSellerWithdraw>("/api/seller/withdraws", {
        method: "POST",
        token,
        body: JSON.stringify({
          amount: Number(form.amount),
          method: form.method,
          account: form.account,
          note: form.note,
          totpCode: totpCode ?? null,
        }),
      });
      setForm({ amount: 0, method: form.method, account: "", note: "" });
      setTotpModal(false);
      await reload();
    } catch (e) {
      throw e;
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (user?.twoFactorEnabled) {
      setTotpErr(null);
      setTotpModal(true);
      return;
    }
    try { await submitWithdraw(); }
    catch (e) { alert((e as Error).message); }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout variant="seller" groups={sellerNav} title="Rút tiền" subtitle="Đang tải...">
        <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>
      </DashboardLayout>
    );
  }

  if (!token) {
    return (
      <DashboardLayout variant="seller" groups={sellerNav} title="Rút tiền" subtitle="">
        <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
          <p className="text-sm text-text-muted">Vui lòng <Link href="/login" className="text-accent hover:underline">đăng nhập</Link>.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout variant="seller" groups={sellerNav} title="Rút tiền" subtitle="">
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-6 text-sm text-warning">{error}</div>
      </DashboardLayout>
    );
  }

  const balance = dash?.availableBalance ?? 0;

  return (
    <DashboardLayout
      variant="seller"
      groups={sellerNav}
      title="Rút tiền"
      subtitle="Sàn giữ 5% phí · sẽ thanh toán trong 1-2 ngày làm việc"
    >
      {totpModal && (
        <TotpVerifyModal
          title="Xác thực 2FA — Rút tiền"
          description="Nhập mã 6 chữ số từ Google Authenticator để xác nhận yêu cầu rút tiền."
          error={totpErr}
          loading={submitting}
          onConfirm={async (code) => {
            setTotpErr(null);
            try { await submitWithdraw(code); }
            catch (e) { setTotpErr((e as Error).message || "Mã không đúng, vui lòng thử lại."); }
          }}
          onCancel={() => { setTotpModal(false); setTotpErr(null); }}
        />
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl border border-border bg-gradient-to-br from-brand/30 via-bg-card to-accent/20 p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-text-muted">Số dư có thể rút</div>
          <div className="mt-2 num text-4xl font-bold text-text">{formatVND(balance)}</div>
          <p className="mt-2 text-xs text-text-muted">
            Đã trừ 5% phí sàn · còn {dash?.pendingWithdrawals ?? 0} yêu cầu đang chờ duyệt
          </p>
        </div>
        <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-bg-card p-5">
          <h3 className="text-sm font-bold text-text">Yêu cầu rút mới</h3>
          <label className="mt-3 block text-xs text-text-muted">
            Số tiền (VND)
            <input type="number" min={50000} max={balance} required className="mt-1 h-9 w-full rounded-lg border border-border bg-bg-elev px-3 text-sm text-text outline-none focus:border-brand" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          </label>
          <label className="mt-2 block text-xs text-text-muted">
            Phương thức
            <select className="mt-1 h-9 w-full rounded-lg border border-border bg-bg-elev px-3 text-sm text-text outline-none focus:border-brand" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option value="Bank">Ngân hàng</option>
              <option value="Momo">MoMo</option>
              <option value="Usdt">USDT TRC20</option>
            </select>
          </label>
          <label className="mt-2 block text-xs text-text-muted">
            Số tài khoản / SĐT / Ví
            <input required className="mt-1 h-9 w-full rounded-lg border border-border bg-bg-elev px-3 text-sm text-text outline-none focus:border-brand" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} />
          </label>
          <label className="mt-2 block text-xs text-text-muted">
            Ghi chú
            <input className="mt-1 h-9 w-full rounded-lg border border-border bg-bg-elev px-3 text-sm text-text outline-none focus:border-brand" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>
          <Button type="submit" size="sm" className="mt-3 w-full" disabled={submitting || balance < 50000} leftIcon={<ArrowDownToLine className="size-3.5" />}>
            {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </Button>
        </form>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold text-text">Lịch sử yêu cầu</h3>
        </div>
        {withdraws.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-text-muted">Chưa có yêu cầu nào.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3">Phương thức</th>
                <th className="px-4 py-3">Tài khoản</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {withdraws.map((w) => (
                <tr key={w.id} className="hover:bg-bg-elev/30">
                  <td className="px-4 py-3 font-mono text-[11px] text-text-muted">WD-{w.id.slice(0, 6)}</td>
                  <td className="num px-4 py-3 text-right font-semibold text-text">{formatVND(w.amount)}</td>
                  <td className="px-4 py-3 text-text-muted">{w.method}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{w.account}</td>
                  <td className="px-4 py-3 text-center"><Badge tone={statusTone[w.status] ?? "muted"}>{w.status}</Badge></td>
                  <td className="px-4 py-3 text-right text-xs text-text-muted">{formatRelativeTime(w.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </DashboardLayout>
  );
}
