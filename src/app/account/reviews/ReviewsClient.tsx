"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle, CheckCircle2, Loader2, MessageSquare,
  Pencil, Star, X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiOwnReview } from "@/lib/apiTypes";
import { formatRelativeTime } from "@/lib/format";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`size-7 transition-colors ${
              s <= (hovered || value) ? "fill-warning text-warning" : "text-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`size-3.5 ${s <= rating ? "fill-warning text-warning" : "text-border"}`}
        />
      ))}
    </div>
  );
}

const RATING_LABELS = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"];

export function ReviewsClient() {
  const { user, token, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<ApiOwnReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Edit modal state
  const [editing, setEditing] = useState<ApiOwnReview | null>(null);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await apiFetch<ApiOwnReview[]>("/api/reviews/mine", { token });
      setReviews(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi tải đánh giá");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  const openEdit = (r: ApiOwnReview) => {
    setEditing(r);
    setForm({ rating: r.rating, comment: r.comment });
    setSaveMsg(null);
  };

  const closeEdit = () => { setEditing(null); setSaveMsg(null); };

  const submitEdit = async () => {
    if (!token || !editing) return;
    if (!form.comment.trim()) { setSaveMsg({ ok: false, text: "Vui lòng nhập nhận xét" }); return; }
    setSaving(true);
    setSaveMsg(null);
    try {
      const updated = await apiFetch<ApiOwnReview>(`/api/reviews/${editing.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ rating: form.rating, comment: form.comment.trim() }),
      });
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSaveMsg({ ok: true, text: "Đã cập nhật đánh giá!" });
      setTimeout(closeEdit, 1200);
    } catch (e) {
      setSaveMsg({ ok: false, text: e instanceof Error ? e.message : "Lỗi cập nhật" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
        <p className="text-sm text-text-muted">
          Vui lòng <Link href="/login" className="text-accent hover:underline">đăng nhập</Link> để xem đánh giá.
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

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-16 text-center">
        <Star className="mx-auto size-12 text-border" />
        <p className="mt-4 text-base font-semibold text-text">Chưa có đánh giá nào</p>
        <p className="mt-1 text-sm text-text-muted">Hoàn thành đơn hàng và viết đánh giá để giúp người mua khác.</p>
        <Link href="/account/orders" className="mt-6 inline-block rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white hover:bg-brand/90">
          Xem đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-text-muted">{reviews.length} đánh giá</p>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              {/* Left: product + rating */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StarDisplay rating={r.rating} />
                  <span className="text-xs font-semibold text-warning">{RATING_LABELS[r.rating]}</span>
                  <span className="text-xs text-text-dim">·</span>
                  <span className="text-xs text-text-dim">{formatRelativeTime(r.createdAt)}</span>
                </div>

                {r.productSlug ? (
                  <Link
                    href={`/p/${r.productSlug}`}
                    className="mt-1.5 line-clamp-1 text-sm font-semibold text-text hover:text-accent"
                  >
                    {r.productTitle}
                  </Link>
                ) : (
                  <p className="mt-1.5 line-clamp-1 text-sm font-semibold text-text">{r.productTitle}</p>
                )}

                <p className="mt-2 text-sm leading-relaxed text-text-muted">{r.comment}</p>

                {/* Seller reply */}
                {r.reply && (
                  <div className="mt-3 flex gap-2.5 rounded-xl border border-brand/20 bg-brand/5 p-3">
                    <MessageSquare className="mt-0.5 size-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-xs font-semibold text-brand">Phản hồi từ người bán</p>
                      <p className="mt-1 text-sm text-text-muted">{r.reply}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit button */}
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Pencil className="size-3.5" />}
                onClick={() => openEdit(r)}
              >
                Sửa
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg-card p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-text">Sửa đánh giá</h2>
                <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">{editing.productTitle}</p>
              </div>
              <button onClick={closeEdit} className="rounded-lg p-1 text-text-muted hover:bg-bg-elev hover:text-text">
                <X className="size-5" />
              </button>
            </div>

            {/* Star picker */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-text-muted">Đánh giá của bạn</p>
              <div className="flex items-center gap-3">
                <StarPicker value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
                <span className="text-sm font-semibold text-warning">{RATING_LABELS[form.rating]}</span>
              </div>
            </div>

            {/* Comment textarea */}
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-medium text-text-muted">Nhận xét</p>
              <textarea
                rows={4}
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                className="w-full resize-none rounded-xl border border-border bg-bg-elev px-3 py-2.5 text-sm text-text outline-none focus:border-brand"
              />
              <p className="mt-1 text-right text-[10px] text-text-dim">{form.comment.length}/500</p>
            </div>

            {/* Save message */}
            {saveMsg && (
              <div className={`mt-3 flex items-center gap-2 rounded-lg border p-2.5 text-sm ${saveMsg.ok ? "border-success/40 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger"}`}>
                {saveMsg.ok ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
                {saveMsg.text}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={closeEdit} disabled={saving}>Hủy</Button>
              <Button onClick={submitEdit} disabled={saving || !form.comment.trim()}>
                {saving ? <><Loader2 className="mr-1.5 inline size-4 animate-spin" />Đang lưu...</> : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
