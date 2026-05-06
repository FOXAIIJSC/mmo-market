"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, Plus, Wallet, History, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiWalletState } from "@/lib/apiTypes";
import { formatRelativeTime, formatVND } from "@/lib/format";

const presetAmounts = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

export function WalletClient() {
  const { user, token, loading: authLoading, refresh } = useAuth();
  const [wallet, setWallet] = useState<ApiWalletState | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(500_000);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await apiFetch<ApiWalletState>("/api/wallet", { token });
      setWallet(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi tải ví");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (!authLoading) reload(); }, [authLoading, reload]);

  const topup = async () => {
    if (!token || amount <= 0) return;
    setSubmitting(true);
    setErr(null);
    try {
      await apiFetch("/api/wallet/topup", {
        method: "POST",
        token,
        body: JSON.stringify({ amount, method: "VietQr" }),
      });
      await refresh();
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi nạp tiền");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>;
  }

  if (!user || !wallet) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
        <p className="text-sm text-text-muted">Vui lòng <Link href="/login" className="text-accent hover:underline">đăng nhập</Link>.</p>
      </div>
    );
  }

  const totalIn = wallet.transactions
    .filter((t) => t.type === "Topup" && t.status === "Completed")
    .reduce((s, t) => s + t.amount, 0);
  const numTopups = wallet.transactions.filter((t) => t.type === "Topup").length;

  return (
    <>
      {err && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{err}</span>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl border border-border bg-gradient-to-br from-brand/30 via-bg-card to-accent/20 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                <Wallet className="size-4" /> Số dư khả dụng
              </div>
              <div className="num mt-3 text-4xl font-extrabold text-text">{formatVND(wallet.balance)}</div>
              <div className="mt-1 text-xs text-text-muted">
                Đang chờ giải phóng (escrow): {formatVND(wallet.heldBalance)}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button leftIcon={<Plus className="size-4" />} onClick={() => document.getElementById("topup")?.scrollIntoView({ behavior: "smooth" })}>
              Nạp tiền
            </Button>
            <Button variant="outline" leftIcon={<ArrowUpFromLine className="size-4" />} disabled>Rút tiền (sắp có)</Button>
            <Button variant="ghost" leftIcon={<History className="size-4" />}>Lịch sử</Button>
          </div>
        </div>

        <Stat
          label="Tổng đã nạp"
          value={formatVND(totalIn)}
          delta={`${numTopups} lần nạp${numTopups > 0 ? ` · trung bình ${formatVND(Math.round(totalIn / numTopups))}` : ""}`}
          icon={<ArrowDownToLine className="size-4" />}
          tone="success"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section id="topup" className="rounded-2xl border border-border bg-bg-card p-5 lg:col-span-2">
          <h2 className="text-base font-bold text-text">Nạp nhanh (Mock VietQR)</h2>
          <p className="mt-1 text-xs text-text-muted">
            Backend mô phỏng — không gọi gateway thật. Click "Xác nhận nạp" để tăng số dư ngay.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
            {presetAmounts.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`rounded-xl border p-3 text-center text-sm font-semibold transition ${amount === a ? "border-brand bg-brand-soft text-text" : "border-border bg-bg-elev text-text-muted hover:border-brand/40 hover:text-text"}`}
              >
                <div className="num">{formatVND(a)}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="number"
              min={10000}
              step={10000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="flex-1 rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand"
            />
            <Button onClick={topup} disabled={submitting || amount < 10000}>
              {submitting ? <><Loader2 className="size-4 animate-spin mr-2 inline" />Đang nạp...</> : "Xác nhận nạp"}
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-bg-card p-5">
          <h2 className="text-base font-bold text-text">Lịch sử giao dịch</h2>
          {wallet.transactions.length === 0 ? (
            <p className="mt-3 text-xs text-text-muted">Chưa có giao dịch.</p>
          ) : (
            <ul className="mt-3 space-y-2 max-h-96 overflow-auto">
              {wallet.transactions.slice(0, 20).map((t) => (
                <li key={t.id} className="flex items-center gap-2 rounded-lg border border-border bg-bg-elev p-2.5 text-xs">
                  <div className="grid size-7 place-items-center rounded-full">
                    {t.status === "Completed" ? <CheckCircle2 className="size-4 text-success" /> :
                     t.status === "Pending" ? <Clock className="size-4 text-warning" /> :
                     <AlertCircle className="size-4 text-danger" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="line-clamp-1 text-text">{t.note}</div>
                    <div className="text-[10px] text-text-dim">{formatRelativeTime(t.createdAt)} · {t.type}</div>
                  </div>
                  <div className={`num font-semibold ${t.amount >= 0 ? "text-success" : "text-danger"}`}>
                    {t.amount >= 0 ? "+" : ""}{formatVND(t.amount)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
