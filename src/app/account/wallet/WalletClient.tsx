"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Clock,
  Gift,
  History,
  Loader2,
  Plus,
  Star,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiWalletState } from "@/lib/apiTypes";
import { formatRelativeTime, formatVND } from "@/lib/format";

const PRESET_AMOUNTS = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000];
const MIN_AMOUNT = 10_000;

const TXN_TYPE_LABEL: Record<string, string> = {
  Topup: "Nạp ví",
  Purchase: "Mua hàng",
  Refund: "Hoàn tiền",
  Withdraw: "Rút tiền",
  Commission: "Hoa hồng",
  Bonus: "Khuyến mãi",
  Deposit: "Cọc đăng tin",
  DepositRefund: "Hoàn cọc",
};

const TXN_TYPE_ICON: Record<string, React.ReactNode> = {
  Topup: <ArrowDownToLine className="size-3.5" />,
  Purchase: <ArrowUpFromLine className="size-3.5" />,
  Refund: <ArrowDownLeft className="size-3.5" />,
  Withdraw: <ArrowUpFromLine className="size-3.5" />,
  Commission: <Gift className="size-3.5" />,
  Bonus: <Star className="size-3.5" />,
  Deposit: <ArrowUpFromLine className="size-3.5" />,
  DepositRefund: <ArrowDownLeft className="size-3.5" />,
};

export function WalletClient() {
  const { user, token, loading: authLoading, refresh } = useAuth();
  const [wallet, setWallet] = useState<ApiWalletState | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(500_000);
  const [customInput, setCustomInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const historyRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (!authLoading) reload();
  }, [authLoading, reload]);

  const handlePreset = (a: number) => {
    setAmount(a);
    setCustomInput("");
  };

  const handleCustom = (v: string) => {
    setCustomInput(v);
    const n = Number(v);
    if (!isNaN(n) && n > 0) setAmount(n);
  };

  const topup = async () => {
    if (!token || amount < MIN_AMOUNT) return;
    setSubmitting(true);
    setErr(null);
    setSuccess(false);
    try {
      await apiFetch("/api/wallet/topup", {
        method: "POST",
        token,
        body: JSON.stringify({ amount, method: "VietQR" }),
      });
      setSuccess(true);
      await refresh();
      await reload();
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi nạp tiền");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="size-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
        <p className="text-sm text-text-muted">
          Vui lòng{" "}
          <Link href="/login" className="text-accent hover:underline">
            đăng nhập
          </Link>{" "}
          để xem ví.
        </p>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-12 text-center space-y-3">
        <AlertCircle className="mx-auto size-8 text-danger" />
        <p className="text-sm font-medium text-text">Không thể tải dữ liệu ví</p>
        <p className="text-xs text-text-muted">{err ?? "Lỗi không xác định"}</p>
        <div className="flex justify-center gap-3 pt-1">
          <Button variant="outline" onClick={reload}>Thử lại</Button>
        </div>
      </div>
    );
  }

  const totalIn = wallet.transactions
    .filter((t) => t.type === "Topup" && t.status === "Completed")
    .reduce((s, t) => s + t.amount, 0);
  const numTopups = wallet.transactions.filter((t) => t.type === "Topup").length;
  const amountValid = amount >= MIN_AMOUNT;
  const balanceAfter = wallet.balance + (amountValid ? amount : 0);

  return (
    <>
      {err && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{err}</span>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>Nạp tiền thành công! Số dư đã được cập nhật.</span>
        </div>
      )}

      {/* Balance + Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Balance card */}
        <div className="md:col-span-2 rounded-3xl border border-border bg-gradient-to-br from-brand/30 via-bg-card to-accent/20 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                <Wallet className="size-4" />
                Số dư khả dụng
              </div>
              <div className="num mt-3 text-4xl font-extrabold text-text">
                {formatVND(wallet.balance)}
              </div>
              {wallet.heldBalance > 0 && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                  <Clock className="size-3" />
                  Đang giữ escrow: {formatVND(wallet.heldBalance)}
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              leftIcon={<Plus className="size-4" />}
              onClick={() =>
                document.getElementById("topup-section")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Nạp tiền
            </Button>
            <Button
              variant="outline"
              leftIcon={<ArrowUpFromLine className="size-4" />}
              disabled
            >
              Rút tiền (sắp có)
            </Button>
            <Button
              variant="ghost"
              leftIcon={<History className="size-4" />}
              onClick={() => historyRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              Lịch sử
            </Button>
          </div>
        </div>

        {/* Stats column */}
        <div className="flex flex-col gap-4">
          <Stat
            label="Tổng đã nạp"
            value={formatVND(totalIn)}
            delta={
              numTopups > 0
                ? `${numTopups} lần · trung bình ${formatVND(Math.round(totalIn / numTopups))}`
                : "Chưa có giao dịch nạp"
            }
            icon={<ArrowDownToLine className="size-4" />}
            tone="success"
          />
          <Stat
            label="Điểm tích lũy"
            value={wallet.loyaltyPoints.toLocaleString("vi")}
            delta="Dùng để đổi ưu đãi"
            icon={<Star className="size-4" />}
            tone="warning"
          />
        </div>
      </div>

      {/* Topup + History */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Topup form */}
        <section id="topup-section" className="rounded-2xl border border-border bg-bg-card p-5 lg:col-span-2">
          <h2 className="text-base font-bold text-text">Nạp tiền qua VietQR</h2>
          <p className="mt-1 text-xs text-text-muted">
            Chọn mệnh giá hoặc nhập số tiền tùy chỉnh (tối thiểu {formatVND(MIN_AMOUNT)}).
          </p>

          {/* Preset amounts */}
          <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => handlePreset(a)}
                className={`rounded-xl border p-3 text-center text-sm font-semibold transition ${
                  amount === a && !customInput
                    ? "border-brand bg-brand/10 text-text"
                    : "border-border bg-bg-elev text-text-muted hover:border-brand/40 hover:text-text"
                }`}
              >
                <div className="num text-xs">{formatVND(a)}</div>
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="mt-3 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min={MIN_AMOUNT}
                step={10_000}
                placeholder="Nhập số tiền khác..."
                value={customInput}
                onChange={(e) => handleCustom(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-bg-elev px-3 pr-10 text-sm text-text outline-none focus:border-brand"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                ₫
              </span>
            </div>
          </div>

          {/* Validation */}
          {amount > 0 && amount < MIN_AMOUNT && (
            <p className="mt-1.5 text-xs text-danger">
              Số tiền tối thiểu là {formatVND(MIN_AMOUNT)}.
            </p>
          )}

          {/* Preview */}
          {amountValid && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-brand/30 bg-brand/5 px-4 py-2.5 text-sm">
              <span className="text-text-muted">Số dư sau nạp:</span>
              <span className="num font-bold text-text">{formatVND(balanceAfter)}</span>
            </div>
          )}

          {/* Confirm button */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-text-dim">
              Phương thức: <span className="font-medium text-text-muted">VietQR (mock)</span>
            </p>
            <Button
              onClick={topup}
              disabled={submitting || !amountValid}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 inline size-4 animate-spin" />
                  Đang nạp...
                </>
              ) : (
                `Xác nhận nạp ${amountValid ? formatVND(amount) : ""}`
              )}
            </Button>
          </div>
        </section>

        {/* Transaction history */}
        <section ref={historyRef} className="rounded-2xl border border-border bg-bg-card p-5">
          <h2 className="text-base font-bold text-text">Lịch sử giao dịch</h2>
          {wallet.transactions.length === 0 ? (
            <p className="mt-3 text-xs text-text-muted">Chưa có giao dịch nào.</p>
          ) : (
            <ul className="mt-3 max-h-[480px] space-y-2 overflow-auto pr-1">
              {wallet.transactions.map((t) => (
                <li
                  key={t.id}
                  className="flex items-start gap-2.5 rounded-lg border border-border bg-bg-elev p-2.5 text-xs"
                >
                  {/* Status icon */}
                  <div
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                      t.status === "Completed"
                        ? "bg-success/10 text-success"
                        : t.status === "Pending"
                        ? "bg-warning/10 text-warning"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    {t.status === "Completed" ? (
                      <CheckCircle2 className="size-3.5" />
                    ) : t.status === "Pending" ? (
                      <Clock className="size-3.5" />
                    ) : (
                      <AlertCircle className="size-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 font-medium text-text">{t.note}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-text-dim">
                      <span className="flex items-center gap-0.5">
                        {TXN_TYPE_ICON[t.type]}
                        {TXN_TYPE_LABEL[t.type] ?? t.type}
                      </span>
                      <span>·</span>
                      <span>{formatRelativeTime(t.createdAt)}</span>
                    </div>
                  </div>
                  <div
                    className={`num shrink-0 font-semibold ${
                      t.amount >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {t.amount >= 0 ? "+" : ""}
                    {formatVND(t.amount)}
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
