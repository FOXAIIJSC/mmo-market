import Link from "next/link";
import { banners } from "@/lib/data";

export function BannerGrid() {
  return (
    <section className="mx-auto mt-10 max-w-7xl px-4">
      <div className="grid gap-3 md:grid-cols-4">
        {banners.map((b, i) => (
          <Link
            key={b.id}
            href={b.href}
            className={`group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${b.gradient} p-4 text-white transition hover:-translate-y-0.5 ${
              i === 0 ? "md:row-span-2 md:aspect-auto" : ""
            }`}
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-dots opacity-30 mix-blend-overlay"
            />
            <div className="absolute -right-10 -top-10 size-32 rounded-full bg-white/20 blur-2xl" />
            <div>
              {b.badge && (
                <span className="rounded-md bg-white/25 px-2 py-0.5 text-[10px] font-bold backdrop-blur">
                  {b.badge}
                </span>
              )}
              <div
                className={`mt-2 font-extrabold leading-tight ${i === 0 ? "text-2xl md:text-3xl" : "text-base"}`}
              >
                {b.title}
              </div>
              <div className={`mt-1 ${i === 0 ? "max-w-[60%] text-sm" : "text-xs"} opacity-90`}>
                {b.subtitle}
              </div>
            </div>
            <div className="text-xs font-semibold underline-offset-2 group-hover:underline">
              Mua ngay →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
