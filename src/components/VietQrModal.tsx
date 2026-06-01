"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { CheckCircle2, Loader2, X, Clock, Copy, Check, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { ApiVietQrResult, ApiOrder } from "@/lib/apiTypes";
import { formatVND } from "@/lib/format";

const VIETQR_COLOR = "#00b14f";
const TIMEOUT_SECS = 30 * 60; // 30 minutes

const BANK_NAMES: Record<string, string> = {
  TPB: "TPBank", VCB: "Vietcombank", BIDV: "BIDV", TCB: "Techcombank",
  MB: "MBBank", ACB: "ACB", VPB: "VPBank", STB: "Sacombank",
  VIB: "VIB", VIETINBANK: "VietinBank", SHB: "SHB", MSB: "MSB",
  OCB: "OCB", HDB: "HDBank", SCB: "SCB", SEAB: "SeABank",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="ml-2 inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs text-text-muted transition hover:bg-bg-elev"
    >
      {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
      {copied ? "Đã copy" : "Copy"}
    </button>
  );
}

export function VietQrModal({
  orderId,
  orderCode,
  total,
  vietqrResult,
  token,
  onSuccess,
  onCancel,
}: {
  orderId: string;
  orderCode: string;
  total: number;
  vietqrResult: ApiVietQrResult;
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [phase, setPhase] = useState<"waiting" | "success" | "failed">("waiting");
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECS);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { stopAll(); setPhase("failed"); return 0; }
        return t - 1;
      });
    }, 1000);

    pollRef.current = setInterval(async () => {
      try {
        const order = await apiFetch<ApiOrder>(`/api/orders/${orderId}`, { token });
        if (order.status !== "PendingPayment") {
          stopAll();
          setPhase(order.status === "Cancelled" ? "failed" : "success");
        }
      } catch { /* ignore transient errors */ }
    }, 3000);

    return stopAll;
  }, [orderId, token, stopAll]);

  useEffect(() => {
    if (phase === "success") {
      const t = setTimeout(onSuccess, 1500);
      return () => clearTimeout(t);
    }
  }, [phase, onSuccess]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const bankName = BANK_NAMES[vietqrResult.bankId.toUpperCase()] ?? vietqrResult.bankId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-bg-card shadow-2xl">
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 text-white"
          style={{ background: VIETQR_COLOR }}
        >
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-full bg-white/20 text-xs font-black">QR</div>
            <span className="font-bold tracking-wide">VietQR / Chuyển khoản</span>
          </div>
          {phase === "waiting" && (
            <button onClick={onCancel} className="opacity-70 transition hover:opacity-100">
              <X className="size-5" />
            </button>
          )}
        </div>

        <div className="px-5 py-4">
          {phase === "waiting" && (
            <>
              <div className="mb-3 text-center">
                <p className="text-xs text-text-muted">
                  Đơn hàng <span className="font-mono font-bold text-text">{orderCode}</span>
                </p>
                <p className="num mt-0.5 text-2xl font-extrabold text-accent">{formatVND(total)}</p>
              </div>

              {/* QR code */}
              <div className="mb-3 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={vietqrResult.qrImageUrl}
                  alt="VietQR Code"
                  width={200}
                  height={200}
                  className="rounded-xl border border-border"
                />
              </div>

              {/* Bank account info */}
              <div className="mb-3 rounded-xl border border-border bg-bg-elev p-3 text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-muted">Ngân hàng</span>
                  <span className="font-semibold text-text">{bankName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Số tài khoản</span>
                  <span className="flex items-center font-mono font-bold text-text">
                    {vietqrResult.accountNo}
                    <CopyButton text={vietqrResult.accountNo} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Tên tài khoản</span>
                  <span className="font-semibold text-text">{vietqrResult.accountName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Số tiền</span>
                  <span className="num font-bold text-accent">{formatVND(total)}</span>
                </div>
              </div>

              {/* Transfer note — CRITICAL */}
              <div className="mb-3 rounded-xl border border-warning/40 bg-warning/10 p-3">
                <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-warning">
                  <AlertTriangle className="size-3.5" />
                  Bắt buộc nhập đúng nội dung chuyển khoản
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-3 py-2">
                  <span className="font-mono text-sm font-bold text-text">{vietqrResult.transferNote}</span>
                  <CopyButton text={vietqrResult.transferNote} />
                </div>
                <p className="mt-1.5 text-[11px] text-text-muted">
                  Hệ thống tự động xác nhận khi nhận được đúng nội dung này
                </p>
              </div>

              {/* Countdown */}
              <div className="mb-3 flex items-center justify-center gap-1.5 text-sm text-text-muted">
                <Clock className="size-4" />
                Hết hạn sau{" "}
                <span className="font-mono font-bold text-text">{mins}:{secs}</span>
              </div>

              <p className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
                <Loader2 className="size-3 animate-spin" />
                Đang chờ xác nhận chuyển khoản...
              </p>
            </>
          )}

          {phase === "success" && (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto mb-3 size-16 text-success" />
              <p className="text-xl font-bold text-text">Thanh toán thành công!</p>
              <p className="mt-1 text-sm text-text-muted">Đang chuyển đến đơn hàng…</p>
            </div>
          )}

          {phase === "failed" && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-danger/10">
                <X className="size-8 text-danger" />
              </div>
              <p className="text-xl font-bold text-text">Hết thời gian chờ</p>
              <p className="mt-1 text-sm text-text-muted">
                Nếu đã chuyển khoản, đơn sẽ được xác nhận tự động trong vài phút.
              </p>
              <button
                onClick={onCancel}
                className="mt-5 rounded-xl border border-border px-8 py-2.5 text-sm font-semibold text-text transition hover:bg-bg-elev"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
