import Link from "next/link";
import { Star } from "lucide-react";
import { sellers } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export function SellerStrip() {
  return (
    <section className="mx-auto mt-12 max-w-7xl px-4">
      <div className="rounded-3xl border border-border bg-bg-card/60 p-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-text md:text-2xl">
              👑 Người bán nổi bật
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Top seller có doanh thu, rating cao, đã KYC và phục vụ &gt; 5,000 đơn.
            </p>
          </div>
          <Link
            href="/sellers"
            className="text-sm font-medium text-accent hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {sellers.slice(0, 6).map((s) => (
            <Link
              key={s.id}
              href={`/seller/${s.username}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-bg-elev/60 p-4 text-center transition hover:-translate-y-0.5 hover:border-brand/60"
            >
              <div
                className="grid size-14 place-items-center rounded-full text-lg font-bold text-white shadow-lg"
                style={{ background: s.avatarColor }}
              >
                {s.username[0].toUpperCase()}
              </div>
              <div className="font-semibold text-text">@{s.username}</div>
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Star className="size-3 fill-warning text-warning" />
                {s.rating.toFixed(2)} •{" "}
                <span className="num">{formatNumber(s.totalSold)}</span>
              </div>
              {s.badge && (
                <span className="rounded-full border border-brand/40 bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
                  {s.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
