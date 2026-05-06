import Link from "next/link";
import { Star } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Badge } from "@/components/ui/Badge";
import { sellers } from "@/lib/data";
import { formatNumber } from "@/lib/format";

export const metadata = { title: "Người bán nổi bật | MMO Market" };

export default function SellersPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-text">Người bán nổi bật</h1>
        <p className="mt-2 text-text-muted">
          Top seller có doanh số cao, rating ≥ 4.5★ và đã KYC đầy đủ.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {sellers.map((s) => (
            <Link
              key={s.id}
              href={`/seller/${s.username}`}
              className="rounded-2xl border border-border bg-bg-card p-5 transition hover:-translate-y-0.5 hover:border-brand/60"
            >
              <div className="flex items-center gap-4">
                <div
                  className="grid size-14 place-items-center rounded-2xl text-xl font-bold text-white shadow-lg"
                  style={{ background: s.avatarColor }}
                >
                  {s.username[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-text">@{s.username}</span>
                    {s.badge === "top" && <Badge tone="brand">TOP</Badge>}
                    {s.kycStatus === "approved" && (
                      <Badge tone="success">KYC</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                    {s.displayName}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-warning text-warning" />
                      {s.rating.toFixed(2)}
                    </span>
                    <span>{formatNumber(s.totalSold)} đã bán</span>
                    <span>{s.responseTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
