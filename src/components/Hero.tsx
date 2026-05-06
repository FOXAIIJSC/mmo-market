import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Headset } from "lucide-react";

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-10">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-bg-card via-bg-card to-bg-elev p-8 md:p-12">
        <div
          aria-hidden
          className="absolute inset-0 bg-dots opacity-30"
        />
        <div
          aria-hidden
          className="absolute -right-16 -top-16 size-72 rounded-full bg-brand/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -left-10 size-72 rounded-full bg-accent/20 blur-3xl"
        />

        <div className="relative grid items-center gap-8 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-3 py-1 text-xs text-text-muted">
              <span className="size-1.5 rounded-full bg-success" />
              Đang có 10.842 sản phẩm số sẵn giao tự động
            </div>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-text md:text-5xl">
              Sàn TMĐT chuyên biệt cho cộng đồng{" "}
              <span className="bg-gradient-to-r from-brand via-fuchsia-400 to-accent bg-clip-text text-transparent">
                Make Money Online
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-text-muted md:text-base">
              Mua bán tài khoản AI, tool, khoá học, gift card, tài khoản & skin
              game an toàn với cơ chế escrow giữ tiền 3-7 ngày, kiểm tra trùng
              sản phẩm, hỗ trợ 24/7.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30"
              >
                Khám phá sản phẩm
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/seller/onboarding"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-card px-6 py-3 text-sm font-semibold text-text hover:border-brand"
              >
                Trở thành người bán
              </Link>
            </div>

            <div className="mt-8 grid gap-3 text-xs text-text-muted sm:grid-cols-3">
              {[
                {
                  icon: <ShieldCheck className="size-4 text-success" />,
                  title: "Escrow 3-7 ngày",
                  desc: "Bảo vệ buyer 100%",
                },
                {
                  icon: <Zap className="size-4 text-warning" />,
                  title: "Giao trong 5 giây",
                  desc: "Auto-delivery 24/7",
                },
                {
                  icon: <Headset className="size-4 text-accent" />,
                  title: "Hỗ trợ live 24/7",
                  desc: "Khiếu nại minh bạch",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-2 rounded-xl border border-border bg-bg-elev/60 p-3"
                >
                  {f.icon}
                  <div>
                    <div className="font-semibold text-text">{f.title}</div>
                    <div>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual: stat grid */}
          <div className="relative grid grid-cols-2 gap-4">
            <div className="card-glow rounded-2xl bg-bg-card/80 p-5 backdrop-blur">
              <div className="text-xs uppercase tracking-wider text-text-muted">
                GMV 30 ngày
              </div>
              <div className="num mt-2 text-2xl font-bold text-text">
                ₫24,8 tỷ
              </div>
              <div className="mt-1 text-xs text-success">+18.4% so với tháng trước</div>
            </div>
            <div className="card-glow rounded-2xl bg-bg-card/80 p-5 backdrop-blur">
              <div className="text-xs uppercase tracking-wider text-text-muted">
                Đơn auto-delivery
              </div>
              <div className="num mt-2 text-2xl font-bold text-text">128.402</div>
              <div className="mt-1 text-xs text-text-muted">Trong 30 ngày</div>
            </div>
            <div className="card-glow col-span-2 rounded-2xl bg-bg-card/80 p-5 backdrop-blur">
              <div className="text-xs uppercase tracking-wider text-text-muted">
                Top danh mục đang hot
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {[
                  ["AI Accounts", "+34%", "from-violet-500 to-fuchsia-500"],
                  ["Tool MMO", "+22%", "from-cyan-500 to-blue-500"],
                  ["Khoá học", "+15%", "from-emerald-500 to-teal-500"],
                  ["Gift Card", "+11%", "from-pink-500 to-rose-500"],
                ].map(([name, delta, grad]) => (
                  <span
                    key={name}
                    className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${grad} px-3 py-1.5 font-medium text-white shadow`}
                  >
                    {name}
                    <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px]">
                      {delta}
                    </span>
                  </span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-bg-elev p-3">
                  <div className="num text-lg font-bold text-text">99.5%</div>
                  <div className="text-text-muted">Uptime SLA</div>
                </div>
                <div className="rounded-lg bg-bg-elev p-3">
                  <div className="num text-lg font-bold text-text">4.86★</div>
                  <div className="text-text-muted">Avg rating</div>
                </div>
                <div className="rounded-lg bg-bg-elev p-3">
                  <div className="num text-lg font-bold text-text">7K+</div>
                  <div className="text-text-muted">Sellers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
