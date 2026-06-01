"use client";
import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { sellerNav } from "@/lib/sellerNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";

type SellerReview = {
  id: string; productId: string; productTitle: string;
  buyerName: string; rating: number; comment: string;
  createdAt: string; reply?: string | null;
};

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`size-3.5 ${i <= n ? "fill-warning text-warning" : "text-border"}`} />
      ))}
    </span>
  );
}

export function SellerReviewsClient() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<SellerReview[]>("/api/seller/reviews", { token })
      .then(setReviews).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <DashboardLayout variant="seller" groups={sellerNav} title="Đánh giá" subtitle="Xem phản hồi khách hàng về sản phẩm của bạn">
      {loading && <div className="grid place-items-center py-20"><Loader2 className="size-8 animate-spin text-text-muted" /></div>}

      {!loading && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Tổng đánh giá", value: reviews.length.toString() },
              { label: "Điểm trung bình", value: avg },
              { label: "5 sao", value: reviews.filter(r => r.rating === 5).length.toString() },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-border bg-bg-card p-4">
                <p className="text-xs text-text-muted">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-text">{s.value}</p>
              </div>
            ))}
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
              <Star className="mx-auto mb-3 size-10 text-text-muted" />
              <p className="text-sm text-text-muted">Chưa có đánh giá nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="rounded-2xl border border-border bg-bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-text-muted">{r.productTitle}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Stars n={r.rating} />
                        <span className="text-xs text-text-muted">{r.buyerName}</span>
                      </div>
                    </div>
                    <p className="text-xs text-text-muted shrink-0">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-text">{r.comment}</p>
                  {r.reply && (
                    <div className="mt-2 rounded-xl border border-border bg-bg-elev px-3 py-2">
                      <p className="text-[11px] text-text-muted mb-0.5">Phản hồi của bạn:</p>
                      <p className="text-xs text-text">{r.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
