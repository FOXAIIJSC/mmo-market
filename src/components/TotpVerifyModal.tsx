"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  title?: string;
  description?: string;
  error?: string | null;
  loading?: boolean;
  onConfirm: (code: string) => void;
  onCancel: () => void;
}

export function TotpVerifyModal({
  title = "Xác thực bảo mật 2 lớp",
  description = "Nhập mã 6 chữ số từ ứng dụng Google Authenticator.",
  error,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const code = digits.join("");

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const d = [...digits]; d[i] = ""; setDigits(d);
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
      }
    }
  };

  const handleChange = (i: number, val: string) => {
    const num = val.replace(/\D/g, "");
    if (!num) return;
    const d = [...digits];
    // Handle paste of full code
    if (num.length === 6) {
      setDigits(num.split(""));
      refs.current[5]?.focus();
      return;
    }
    d[i] = num[num.length - 1];
    setDigits(d);
    if (i < 5) refs.current[i + 1]?.focus();
  };

  const submit = () => {
    if (code.length === 6 && !loading) onConfirm(code);
  };

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (code.length === 6) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-full bg-brand/10">
              <Shield className="size-4 text-brand" />
            </div>
            <span className="font-bold text-text">{title}</span>
          </div>
          <button
            onClick={onCancel}
            className="opacity-60 transition hover:opacity-100"
            disabled={loading}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-text-muted">{description}</p>

          {/* 6-digit boxes */}
          <div className="flex justify-center gap-2">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                disabled={loading}
                className={`h-12 w-10 rounded-xl border text-center text-xl font-bold text-text outline-none transition
                  ${d ? "border-brand bg-brand/5" : "border-border bg-bg-elev"}
                  focus:border-brand disabled:opacity-50`}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-danger">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
              Huỷ
            </Button>
            <Button
              className="flex-1"
              disabled={code.length < 6 || loading}
              onClick={submit}
            >
              {loading
                ? <><Loader2 className="mr-2 size-4 animate-spin" />Đang xác thực...</>
                : "Xác nhận"}
            </Button>
          </div>

          <p className="text-center text-[11px] text-text-dim">
            Mã thay đổi mỗi 30 giây · Dùng app Google Authenticator
          </p>
        </div>
      </div>
    </div>
  );
}
