"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2, Copy, Edit2, Loader2,
  Plus, Tag, Trash2, X, Zap,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { sellerNav } from "@/lib/sellerNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiSellerCoupon } from "@/lib/apiTypes";
import { formatVND } from "@/lib/format";

// ── Helpers ───────────────────────────────────────────────────────────────────
function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}
function isExpired(iso?: string | null) {
  return !!iso && new Date(iso) < new Date();
}
function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ── Form ──────────────────────────────────────────────────────────────────────
type CouponForm = {
  code: string; description: string; type: "Percent" | "Fixed";
  value: number; minOrderAmount: number; maxDiscount: number;
  maxUses: number; expiresAt: string; isActive: boolean;
};
const defaultForm = (): CouponForm => ({
  code: "", description: "", type: "Percent",
  value: 10, minOrderAmount: 0, maxDiscount: 0,
  maxUses: 100, expiresAt: "", isActive: true,
});

function CouponModal({
  initial, onClose, onSave,
}: {
  initial: (CouponForm & { id?: string }) | null;
  onClose: () => void;
  onSave: (data: CouponForm & { id?: string }) => Promise<void>;
}) {
  const [form, setForm] = useState<CouponForm>(initial ?? defaultForm());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof CouponForm, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code.trim()) { setErr("Vui lòng nhập mã giảm giá"); return; }
    setSaving(true); setErr(null);
    try { await onSave({ ...form, id: initial?.id }); onClose(); }
    catch (e: unknown) { setErr((e as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={submit} className="w-full max-w-lg rounded-2xl border border-border bg-bg-card p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-bold text-text">{initial?.id ? "Chỉnh sửa" : "Tạo"} mã giảm giá</h3>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text"><X className="size-5" /></button>
        </div>

        {/* Code */}
        <div>
          <label className="text-xs font-medium text-text-muted">Mã coupon *</label>
          <div className="mt-1 flex gap-2">
            <input required value={form.code}
              onChange={e => set("code", e.target.value.toUpperCase().replace(/\s/g, ""))}
              placeholder="VD: SALE10, FREESHIP"
              className="flex-1 rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm font-mono text-text outline-none focus:border-brand uppercase" />
            <button type="button" onClick={() => set("code", genCode())}
              className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs text-text-muted hover:bg-bg-elev">
              Tự tạo
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-text-muted">Mô tả</label>
          <input value={form.description} onChange={e => set("description", e.target.value)}
            placeholder="VD: Giảm 10% cho đơn từ 200K"
            className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand" />
        </div>

        {/* Type + Value */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-text-muted">Loại giảm giá</label>
            <select value={form.type} onChange={e => set("type", e.target.value as "Percent" | "Fixed")}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand">
              <option value="Percent">Phần trăm (%)</option>
              <option value="Fixed">Số tiền cố định (₫)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted">
              Giá trị {form.type === "Percent" ? "(%)" : "(₫)"}
            </label>
            <input type="number" min={0.01} step={form.type === "Percent" ? 1 : 1000}
              max={form.type === "Percent" ? 99 : undefined}
              value={form.value} onChange={e => set("value", parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand" />
          </div>
        </div>

        {/* Min order + Max discount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-text-muted">Đơn tối thiểu (₫)</label>
            <input type="number" min={0} step={10000} value={form.minOrderAmount}
              onChange={e => set("minOrderAmount", parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand" />
          </div>
          {form.type === "Percent" && (
            <div>
              <label className="text-xs font-medium text-text-muted">Giảm tối đa (₫, 0 = không giới hạn)</label>
              <input type="number" min={0} step={10000} value={form.maxDiscount}
                onChange={e => set("maxDiscount", parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand" />
            </div>
          )}
        </div>

        {/* Max uses + Expires */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-text-muted">Số lượt tối đa (0 = không giới hạn)</label>
            <input type="number" min={0} value={form.maxUses}
              onChange={e => set("maxUses", parseInt(e.target.value) || 0)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-xs font-medium text-text-muted">Hết hạn (tuỳ chọn)</label>
            <input type="datetime-local" value={form.expiresAt}
              onChange={e => set("expiresAt", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand" />
          </div>
        </div>

        {/* Active toggle (edit only) */}
        {initial?.id && (
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3">
            <div className={`relative h-6 w-11 rounded-full transition-colors ${form.isActive ? "bg-brand" : "bg-text-muted/30"}`}
              onClick={() => set("isActive", !form.isActive)}>
              <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.isActive ? "left-5" : "left-0.5"}`} />
            </div>
            <span className="text-sm text-text">{form.isActive ? "Đang hoạt động" : "Đã tắt"}</span>
          </label>
        )}

        {/* Live preview */}
        {form.value > 0 && (
          <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-xs text-text-muted">
            <span className="font-semibold text-brand">Xem trước: </span>
            {form.type === "Percent"
              ? `Giảm ${form.value}%${form.maxDiscount > 0 ? `, tối đa ${formatVND(form.maxDiscount)}` : ""}`
              : `Giảm ${formatVND(form.value)}`}
            {form.minOrderAmount > 0 && ` · Đơn từ ${formatVND(form.minOrderAmount)}`}
            {form.maxUses > 0 && ` · ${form.maxUses} lượt`}
          </div>
        )}

        {err && <p className="text-xs text-danger">{err}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:bg-bg-elev">Hủy</button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60">
            {saving ? "Đang lưu..." : initial?.id ? "Cập nhật" : "Tạo mã"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────
function ConfirmDelete({ code, onConfirm, onClose }: { code: string; onConfirm: () => Promise<void>; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6 shadow-xl text-center space-y-4">
        <Trash2 className="mx-auto size-10 text-danger" />
        <p className="text-sm text-text">Xóa mã <strong className="font-mono">{code}</strong>?</p>
        <div className="flex gap-2 justify-center">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:bg-bg-elev">Hủy</button>
          <button onClick={async () => { setLoading(true); await onConfirm(); onClose(); }}
            disabled={loading}
            className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-medium text-white shadow-xl">
      <CheckCircle2 className="size-4" /> {msg}
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function CouponStatus({ coupon }: { coupon: ApiSellerCoupon }) {
  if (!coupon.isActive) return <span className="rounded-full bg-text-muted/15 px-2 py-0.5 text-[11px] font-bold text-text-muted">Tắt</span>;
  if (isExpired(coupon.expiresAt)) return <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[11px] font-bold text-danger">Hết hạn</span>;
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-bold text-warning">Hết lượt</span>;
  return <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">Đang chạy</span>;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function SellerCouponsClient() {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState<ApiSellerCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<(CouponForm & { id?: string }) | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; code: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  async function load() {
    if (!token) return;
    setLoading(true);
    try { setCoupons(await apiFetch<ApiSellerCoupon[]>("/api/seller/coupons", { token })); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveCoupon(data: CouponForm & { id?: string }) {
    const body = JSON.stringify({
      code: data.code.trim().toUpperCase(),
      description: data.description,
      type: data.type,
      value: data.value,
      minOrderAmount: data.minOrderAmount,
      maxDiscount: data.type === "Percent" && data.maxDiscount > 0 ? data.maxDiscount : null,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      isActive: data.isActive,
    });
    if (data.id) {
      const updated = await apiFetch<ApiSellerCoupon>(`/api/seller/coupons/${data.id}`, { token, method: "PUT", body });
      setCoupons(cs => cs.map(c => c.id === data.id ? updated : c));
      showToast("Đã cập nhật mã giảm giá");
    } else {
      const created = await apiFetch<ApiSellerCoupon>("/api/seller/coupons", { token, method: "POST", body });
      setCoupons(cs => [created, ...cs]);
      showToast("Đã tạo mã giảm giá");
    }
  }

  async function toggleCoupon(id: string) {
    const updated = await apiFetch<ApiSellerCoupon>(`/api/seller/coupons/${id}/toggle`, { token, method: "POST" });
    setCoupons(cs => cs.map(c => c.id === id ? updated : c));
  }

  async function deleteCoupon(id: string) {
    await apiFetch(`/api/seller/coupons/${id}`, { token, method: "DELETE" });
    setCoupons(cs => cs.filter(c => c.id !== id));
    showToast("Đã xóa mã giảm giá");
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  function openEdit(c: ApiSellerCoupon) {
    setModal({
      id: c.id, code: c.code, description: c.description,
      type: c.type, value: c.value, minOrderAmount: c.minOrderAmount,
      maxDiscount: c.maxDiscount ?? 0, maxUses: c.maxUses,
      expiresAt: toLocalInput(c.expiresAt), isActive: c.isActive,
    });
  }

  const active = coupons.filter(c => c.isActive && !isExpired(c.expiresAt) && !(c.maxUses > 0 && c.usedCount >= c.maxUses)).length;
  const totalUses = coupons.reduce((s, c) => s + c.usedCount, 0);

  return (
    <DashboardLayout variant="seller" groups={sellerNav} title="Mã giảm giá" subtitle="Tạo và quản lý coupon riêng cho shop của bạn">

      {/* Stats + Add */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex gap-3 flex-1">
          {[
            { label: "Tổng mã", value: coupons.length, color: "text-text" },
            { label: "Đang chạy", value: active, color: "text-success" },
            { label: "Tổng lượt dùng", value: totalUses, color: "text-brand" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-border bg-bg-card px-4 py-3 text-center min-w-[90px]">
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className={`mt-0.5 text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setModal("new")}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand/90">
          <Plus className="size-4" /> Tạo mã giảm giá
        </button>
      </div>

      {loading && (
        <div className="grid place-items-center py-20"><Loader2 className="size-8 animate-spin text-text-muted" /></div>
      )}

      {!loading && coupons.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <Tag className="mx-auto mb-4 size-12 text-text-muted" />
          <p className="text-base font-semibold text-text">Chưa có mã giảm giá nào</p>
          <p className="mt-2 text-sm text-text-muted">Tạo coupon để thu hút khách hàng mua sản phẩm của bạn</p>
          <button onClick={() => setModal("new")}
            className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90">
            Tạo mã đầu tiên
          </button>
        </div>
      )}

      {!loading && coupons.length > 0 && (
        <div className="rounded-2xl border border-border bg-bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-elev">
                  {["Mã coupon", "Loại / Giá trị", "Đơn tối thiểu", "Lượt dùng", "Hết hạn", "Trạng thái", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-bg-elev/40 transition-colors">
                    {/* Code */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-text">{c.code}</span>
                        <button onClick={() => copyCode(c.code)}
                          className="text-text-muted hover:text-brand transition-colors"
                          title="Sao chép">
                          {copied === c.code
                            ? <CheckCircle2 className="size-3.5 text-success" />
                            : <Copy className="size-3.5" />}
                        </button>
                      </div>
                      {c.description && <p className="text-xs text-text-muted mt-0.5 max-w-[180px] truncate">{c.description}</p>}
                    </td>

                    {/* Type / Value */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {c.type === "Percent"
                          ? <span className="flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-bold text-brand">
                              <Zap className="size-3" />{c.value}%
                            </span>
                          : <span className="flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-bold text-success">
                              -{formatVND(c.value)}
                            </span>
                        }
                      </div>
                      {c.type === "Percent" && c.maxDiscount && c.maxDiscount > 0 && (
                        <p className="text-[11px] text-text-dim mt-0.5">tối đa {formatVND(c.maxDiscount)}</p>
                      )}
                    </td>

                    {/* Min order */}
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {c.minOrderAmount > 0 ? formatVND(c.minOrderAmount) : "—"}
                    </td>

                    {/* Uses */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text">{c.usedCount}</span>
                        {c.maxUses > 0 && (
                          <>
                            <span className="text-xs text-text-muted">/ {c.maxUses}</span>
                            <div className="w-16 h-1.5 rounded-full bg-bg-elev overflow-hidden">
                              <div className="h-full rounded-full bg-brand transition-all"
                                style={{ width: `${Math.min((c.usedCount / c.maxUses) * 100, 100)}%` }} />
                            </div>
                          </>
                        )}
                        {c.maxUses === 0 && <span className="text-xs text-text-dim">∞</span>}
                      </div>
                    </td>

                    {/* Expires */}
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {c.expiresAt
                        ? <span className={isExpired(c.expiresAt) ? "text-danger" : ""}>
                            {new Date(c.expiresAt).toLocaleDateString("vi-VN")}
                          </span>
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <CouponStatus coupon={c} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => toggleCoupon(c.id)}
                          className="rounded-lg bg-bg-elev px-2.5 py-1.5 text-xs text-text-muted hover:bg-border">
                          {c.isActive ? "Tắt" : "Bật"}
                        </button>
                        <button onClick={() => openEdit(c)}
                          className="rounded-lg bg-brand/10 p-1.5 text-brand hover:bg-brand/20">
                          <Edit2 className="size-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget({ id: c.id, code: c.code })}
                          className="rounded-lg bg-danger/10 p-1.5 text-danger hover:bg-danger/20">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-4 py-2.5 text-right text-xs text-text-muted">
            {coupons.length} mã giảm giá
          </div>
        </div>
      )}

      {/* Modals */}
      {modal !== null && (
        <CouponModal
          initial={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={saveCoupon}
        />
      )}
      {deleteTarget && (
        <ConfirmDelete
          code={deleteTarget.code}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteCoupon(deleteTarget.id)}
        />
      )}
      {toast && <Toast msg={toast} />}
    </DashboardLayout>
  );
}
