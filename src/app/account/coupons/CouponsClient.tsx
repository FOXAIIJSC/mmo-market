"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle, CheckCircle2, ChevronRight, Clock,
  Copy, Loader2, Percent, Tag, Ticket, X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiCoupon, ApiValidateResult } from "@/lib/apiTypes";
import { formatVND } from "@/lib/format";

type TabKey = "all" | "available" | "used" | "expired";

function isCouponExpired(c: ApiCoupon) {
  return !!c.expiresAt && new Date(c.expiresAt) < new Date();
}
function isCouponAvailable(c: ApiCoupon) {
  return c.isActive && !c.usedByMe && !isCouponExpired(c) &&
    (c.maxUses === 0 || c.usedCount < c.maxUses);
}

function CouponCard({ c, onCopy }: { c: ApiCoupon; onCopy: (code: string) => void }) {
  const expired = isCouponExpired(c);
  const available = isCouponAvailable(c);
  const remaining = c.maxUses > 0 ? c.maxUses - c.usedCount : null;

  const statusColor = c.usedByMe
    ? "border-text-dim/30 bg-bg-elev opacity-60"
    : expired || (remaining !== null && remaining <= 0)
    ? "border-text-dim/30 bg-bg-elev opacity-60"
    : "border-brand/30 bg-bg-card hover:border-brand/60";

  const badgeEl = c.usedByMe ? (
    <span className="rounded-full bg-text-dim/20 px-2 py-0.5 text-[10px] font-bold text-text-muted">Đã dùng</span>
  ) : expired ? (
    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger">Hết hạn</span>
  ) : remaining !== null && remaining <= 0 ? (
    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger">Hết lượt</span>
  ) : remaining !== null && remaining <= 10 ? (
    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning">Còn {remaining} lượt</span>
  ) : (
    <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">Khả dụng</span>
  );

  return (
    <div className={`relative flex overflow-hidden rounded-2xl border transition ${statusColor}`}>
      {/* Left accent bar */}
      <div className={`w-1.5 shrink-0 ${available ? "bg-gradient-to-b from-brand to-accent" : "bg-border"}`} />

      {/* Icon */}
      <div className="flex items-center px-4">
        <div className={`grid size-10 place-items-center rounded-xl ${available ? "bg-brand/10 text-brand" : "bg-bg-elev text-text-muted"}`}>
          {c.type === "Percent" ? <Percent className="size-5" /> : <Tag className="size-5" />}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 py-3 pr-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-base font-bold tracking-widest text-text">{c.code}</span>
          {badgeEl}
        </div>
        <p className="text-xs text-text-muted">{c.description}</p>

        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-text-dim">
          <span>
            Giảm{" "}
            <span className="font-semibold text-accent">
              {c.type === "Percent" ? `${c.value}%` : formatVND(c.value)}
            </span>
            {c.maxDiscount && c.type === "Percent" ? ` (tối đa ${formatVND(c.maxDiscount)})` : ""}
          </span>
          {c.minOrderAmount > 0 && (
            <span>Đơn tối thiểu <span className="font-semibold text-text">{formatVND(c.minOrderAmount)}</span></span>
          )}
          {c.expiresAt && (
            <span className="flex items-center gap-0.5">
              <Clock className="size-3" />
              HSD: {new Date(c.expiresAt).toLocaleDateString("vi-VN")}
            </span>
          )}
        </div>
      </div>

      {/* Copy button */}
      {available && (
        <div className="flex items-center pr-4">
          <button
            onClick={() => onCopy(c.code)}
            className="flex items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/10 transition"
          >
            <Copy className="size-3.5" />
            Sao chép
          </button>
        </div>
      )}
    </div>
  );
}

export function CouponsClient() {
  const { user, token, loading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState<ApiCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("all");
  const [copied, setCopied] = useState<string | null>(null);

  // Check coupon input
  const [checkCode, setCheckCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<ApiValidateResult | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await apiFetch<ApiCoupon[]>("/api/coupons", { token });
      setCoupons(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi tải mã giảm giá");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCheck = async () => {
    if (!token || !checkCode.trim()) return;
    setChecking(true);
    setCheckResult(null);
    try {
      const result = await apiFetch<ApiValidateResult>("/api/coupons/validate", {
        method: "POST",
        token,
        body: JSON.stringify({ code: checkCode.trim(), orderAmount: 999_999_999 }),
      });
      setCheckResult(result);
    } catch (e) {
      setCheckResult({ valid: false, error: e instanceof Error ? e.message : "Lỗi kiểm tra", discount: 0 });
    } finally {
      setChecking(false);
    }
  };

  const filtered = coupons.filter((c) => {
    if (tab === "available") return isCouponAvailable(c);
    if (tab === "used")      return c.usedByMe;
    if (tab === "expired")   return isCouponExpired(c) || (!c.isActive);
    return true;
  });

  const availableCount = coupons.filter(isCouponAvailable).length;

  if (authLoading || loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
        <p className="text-sm text-text-muted">
          Vui lòng <Link href="/login" className="text-accent hover:underline">đăng nhập</Link> để xem mã giảm giá.
        </p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-12 text-center space-y-3">
        <AlertCircle className="mx-auto size-8 text-danger" />
        <p className="text-sm text-danger">{err}</p>
        <Button variant="outline" onClick={load}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Check coupon section */}
      <div className="rounded-2xl border border-border bg-bg-card p-5">
        <h2 className="mb-3 text-sm font-bold text-text">Kiểm tra mã giảm giá</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Ticket className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input
              value={checkCode}
              onChange={(e) => { setCheckCode(e.target.value.toUpperCase()); setCheckResult(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              placeholder="Nhập mã giảm giá..."
              className="h-10 w-full rounded-lg border border-border bg-bg-elev pl-9 pr-3 font-mono text-sm uppercase text-text outline-none focus:border-brand"
            />
          </div>
          <Button onClick={handleCheck} disabled={checking || !checkCode.trim()}>
            {checking ? <Loader2 className="size-4 animate-spin" /> : "Kiểm tra"}
          </Button>
        </div>
        {checkResult && (
          <div className={`mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm ${
            checkResult.valid
              ? "border-success/40 bg-success/10 text-success"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}>
            {checkResult.valid
              ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              : <AlertCircle className="mt-0.5 size-4 shrink-0" />}
            <span>{checkResult.valid ? checkResult.message : checkResult.error}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-xl border border-border bg-bg-elev p-1 text-sm">
          {(["all", "available", "used", "expired"] as TabKey[]).map((t) => {
            const labels: Record<TabKey, string> = { all: "Tất cả", available: "Khả dụng", used: "Đã dùng", expired: "Hết hạn" };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition ${
                  tab === t ? "bg-bg-card text-text shadow-sm" : "text-text-muted hover:text-text"
                }`}
              >
                {labels[t]}
                {t === "available" && availableCount > 0 && (
                  <span className="rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">{availableCount}</span>
                )}
              </button>
            );
          })}
        </div>
        <Link href="/checkout" className="flex items-center gap-1 text-xs text-accent hover:underline">
          Thanh toán ngay <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* Copied toast */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full border border-success/40 bg-bg-card px-4 py-2 text-sm font-medium text-success shadow-xl">
          <CheckCircle2 className="size-4" /> Đã sao chép <span className="font-mono font-bold">{copied}</span>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-card p-16 text-center">
          <Ticket className="mx-auto size-12 text-border" />
          <p className="mt-4 text-sm font-semibold text-text">
            {tab === "available" ? "Không có mã khả dụng" :
             tab === "used"      ? "Chưa dùng mã nào" :
             tab === "expired"   ? "Không có mã hết hạn" :
             "Chưa có mã giảm giá"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <CouponCard key={c.id} c={c} onCopy={handleCopy} />
          ))}
        </div>
      )}
    </div>
  );
}
