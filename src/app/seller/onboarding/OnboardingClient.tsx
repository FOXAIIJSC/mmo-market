"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle, ArrowRight, Award, BadgeCheck,
  CheckCircle2, ChevronRight, Clock, Loader2,
  Lock, PackageCheck, ShieldCheck, Star,
  TrendingUp, Upload, User, Wallet, X,
} from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";

type KycStatus = "none" | "pending" | "approved" | "rejected";
type KycDto = {
  id: string; status: string; fullName: string;
  idNumber: string; address: string; phoneNumber: string;
  createdAt: string; rejectionReason?: string | null;
};

type Step = 1 | 2 | 3;

const BENEFITS = [
  { icon: <Wallet className="size-5" />,       title: "Thu nhập thụ động",    desc: "Bán tự động 24/7 không cần trực" },
  { icon: <ShieldCheck className="size-5" />,  title: "Escrow an toàn",        desc: "Tiền được giữ escrow, không lo tranh chấp" },
  { icon: <TrendingUp className="size-5" />,   title: "Tăng trưởng nhanh",    desc: "Tiếp cận hàng nghìn người mua mỗi ngày" },
  { icon: <PackageCheck className="size-5" />, title: "Giao hàng tự động",    desc: "Hệ thống tự giao key/account khi đơn được thanh toán" },
  { icon: <Star className="size-5" />,         title: "Phí thấp nhất thị trường", desc: "Chỉ 4–5% hoa hồng, không phí ẩn" },
  { icon: <Award className="size-5" />,        title: "Chương trình thưởng",  desc: "Top seller nhận thêm ưu đãi và badge đặc biệt" },
];

const STEPS_META = [
  { label: "Giới thiệu" },
  { label: "Xác minh KYC" },
  { label: "Hoàn tất" },
];

export function OnboardingClient() {
  const { user, token, loading: authLoading, refresh } = useAuth();
  const router = useRouter();

  const [kycStatus, setKycStatus] = useState<KycStatus>("none");
  const [kycData, setKycData] = useState<KycDto | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [step, setStep] = useState<Step>(1);

  // KYC form
  const [form, setForm] = useState({ fullName: "", idNumber: "", address: "", phoneNumber: "" });
  const [images, setImages] = useState<{ front: string | null; back: string | null }>({ front: null, back: null });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onPickImage = (side: "front" | "back") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setErr("Ảnh tối đa 3MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setImages((p) => ({ ...p, [side]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const loadKyc = useCallback(async () => {
    if (!token) { setStatusLoading(false); return; }
    try {
      const data = await apiFetch<KycDto>("/api/kyc/me", { token });
      setKycData(data);
      setKycStatus(data.status.toLowerCase() as KycStatus);
    } catch (e: unknown) {
      if ((e as { status?: number })?.status !== 404) console.error(e);
      setKycStatus("none");
    } finally {
      setStatusLoading(false);
    }
  }, [token]);

  useEffect(() => { if (!authLoading) loadKyc(); }, [authLoading, loadKyc]);

  const submitKyc = async () => {
    if (!token) return;
    const { fullName, idNumber, address, phoneNumber } = form;
    if (!fullName.trim() || !idNumber.trim() || !address.trim() || !phoneNumber.trim()) {
      setErr("Vui lòng điền đầy đủ thông tin"); return;
    }
    setSubmitting(true); setErr(null);
    try {
      await apiFetch("/api/kyc", {
        method: "POST", token,
        body: JSON.stringify({ fullName, idNumber, address, phoneNumber, frontImage: images.front, backImage: images.back }),
      });
      await refresh();
      setKycStatus("pending");
      setStep(3);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi gửi hồ sơ");
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof form, label: string, placeholder: string, icon: React.ReactNode) => (
    <div>
      <label className="text-xs font-medium text-text-muted">{label} <span className="text-danger">*</span></label>
      <div className="relative mt-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span>
        <input
          value={form[key]}
          onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg border border-border bg-bg-elev pl-9 pr-3 text-sm text-text outline-none focus:border-brand"
        />
      </div>
    </div>
  );

  // ── Already approved ──────────────────────────────────────────────────────
  if (!statusLoading && kycStatus === "approved") {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-success/10">
            <BadgeCheck className="size-10 text-success" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-text">KYC đã được duyệt!</h1>
          <p className="mt-2 text-sm text-text-muted">
            Tài khoản của bạn đã được xác minh. Bạn có thể bắt đầu bán hàng ngay.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button leftIcon={<ArrowRight className="size-4" />} onClick={() => router.push("/seller/products")}>
              Đăng sản phẩm ngay
            </Button>
            <Button variant="outline" onClick={() => router.push("/seller/dashboard")}>
              Về trang bán hàng
            </Button>
          </div>
        </div>
      </SiteShell>
    );
  }

  // ── Pending ───────────────────────────────────────────────────────────────
  if (!statusLoading && kycStatus === "pending") {
    return (
      <SiteShell>
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-full bg-warning/10">
            <Clock className="size-10 text-warning" />
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-text">Hồ sơ đang được xét duyệt</h1>
          <p className="mt-2 text-sm text-text-muted">
            Chúng tôi sẽ xem xét hồ sơ KYC trong vòng 1–3 ngày làm việc. Bạn sẽ nhận thông báo qua email khi có kết quả.
          </p>
          <div className="mt-6 rounded-2xl border border-border bg-bg-card p-5 text-left text-sm">
            <p className="font-semibold text-text">Thông tin đã nộp</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-text-muted">
              {kycData && [
                ["Họ tên", kycData.fullName],
                ["Số CMND/CCCD", kycData.idNumber],
                ["SĐT", kycData.phoneNumber],
                ["Ngày nộp", new Date(kycData.createdAt).toLocaleDateString("vi-VN")],
              ].map(([k, v]) => (
                <div key={k}><span className="text-text-dim">{k}:</span> <span className="font-medium text-text">{v}</span></div>
              ))}
            </div>
          </div>
          <Link href="/" className="mt-6 inline-block text-sm text-accent hover:underline">
            Quay về trang chủ
          </Link>
        </div>
      </SiteShell>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (authLoading || statusLoading) {
    return (
      <SiteShell>
        <div className="grid place-items-center py-32">
          <Loader2 className="size-8 animate-spin text-text-muted" />
        </div>
      </SiteShell>
    );
  }

  // ── Main onboarding flow ──────────────────────────────────────────────────
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-10">

        {/* Progress steps */}
        <div className="mb-8 flex items-center justify-center gap-0">
          {STEPS_META.map((s, i) => {
            const n = (i + 1) as Step;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`grid size-8 place-items-center rounded-full text-sm font-bold transition ${
                    done ? "bg-success text-white" : active ? "bg-brand text-white" : "bg-bg-elev text-text-muted"
                  }`}>
                    {done ? <CheckCircle2 className="size-4" /> : n}
                  </div>
                  <span className={`text-[10px] ${active ? "text-brand font-semibold" : "text-text-muted"}`}>{s.label}</span>
                </div>
                {i < STEPS_META.length - 1 && (
                  <div className={`mx-2 mb-4 h-0.5 w-16 ${step > n ? "bg-success" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Welcome ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-text">Bắt đầu bán hàng trên MMO Market</h1>
              <p className="mt-2 text-sm text-text-muted">
                Tham gia cộng đồng hơn 5.000 sellers đang kiếm thu nhập từ sản phẩm số.
              </p>
            </div>

            {/* Rejected notice */}
            {kycStatus === "rejected" && kycData?.rejectionReason && (
              <div className="flex gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4">
                <X className="mt-0.5 size-5 shrink-0 text-danger" />
                <div>
                  <p className="text-sm font-semibold text-danger">Hồ sơ bị từ chối</p>
                  <p className="mt-1 text-xs text-danger/80">{kycData.rejectionReason}</p>
                  <p className="mt-1 text-xs text-text-muted">Vui lòng sửa và nộp lại bên dưới.</p>
                </div>
              </div>
            )}

            {/* Benefits grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((b) => (
                <div key={b.title} className="flex gap-3 rounded-2xl border border-border bg-bg-card p-4">
                  <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                    {b.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{b.title}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fee table */}
            <div className="rounded-2xl border border-border bg-bg-card p-5">
              <h3 className="text-sm font-bold text-text">Phí sàn cạnh tranh</h3>
              <div className="mt-3 divide-y divide-border text-sm">
                {[
                  ["Buyer → Seller thường",    "5% / đơn"],
                  ["Seller đã KYC",             "4% / đơn"],
                  ["Thanh toán ví nội bộ",      "0% phí chuyển"],
                  ["Rút tiền về ngân hàng",     "Miễn phí (min 100K)"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2.5 text-text-muted">
                    <span>{k}</span>
                    <span className="font-semibold text-text">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {!user ? (
              <div className="text-center">
                <p className="text-sm text-text-muted">Bạn cần đăng nhập để đăng ký bán hàng.</p>
                <Button className="mt-3" onClick={() => router.push("/login?redirect=/seller/onboarding")}>
                  Đăng nhập / Đăng ký
                </Button>
              </div>
            ) : (
              <Button size="lg" className="w-full" rightIcon={<ChevronRight className="size-4" />} onClick={() => setStep(2)}>
                Bắt đầu xác minh KYC
              </Button>
            )}
          </div>
        )}

        {/* ── Step 2: KYC form ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-extrabold text-text">Xác minh danh tính (KYC)</h2>
              <p className="mt-1 text-sm text-text-muted">
                Thông tin này chỉ dùng để xác minh và được bảo mật tuyệt đối theo chính sách của chúng tôi.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-5 space-y-4">
              {field("fullName",    "Họ và tên đầy đủ",  "Nguyễn Văn A",              <User className="size-4" />)}
              {field("idNumber",    "Số CMND / CCCD",     "012345678901",               <Lock className="size-4" />)}
              {field("phoneNumber", "Số điện thoại",      "0912 345 678",               <ShieldCheck className="size-4" />)}
              {field("address",     "Địa chỉ thường trú", "123 Đường ABC, Q.1, TP.HCM", <AlertCircle className="size-4" />)}
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-5">
              <p className="text-sm font-semibold text-text">Ảnh CCCD/CMND (2 mặt)</p>
              <p className="mt-0.5 text-xs text-text-muted">Tải ảnh rõ nét, tối đa 3MB mỗi mặt.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {([["front", "Mặt trước"], ["back", "Mặt sau"]] as const).map(([side, label]) => (
                  <label key={side} className="group cursor-pointer">
                    <span className="text-xs text-text-muted">{label}</span>
                    <div className="mt-1 flex aspect-[3/2] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-bg-elev transition group-hover:border-brand">
                      {images[side] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={images[side]!} alt={label} className="size-full object-cover" />
                      ) : (
                        <span className="flex flex-col items-center gap-1 text-text-muted">
                          <Upload className="size-6" /><span className="text-xs">Chọn ảnh</span>
                        </span>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={onPickImage(side)} />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 text-xs text-text-muted">
              <Lock className="mb-1 inline size-3.5 text-brand" />{" "}
              Dữ liệu KYC được mã hoá AES-256. Chỉ Compliance Team được truy cập theo audit log đầy đủ.
            </div>

            {err && (
              <div className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Quay lại</Button>
              <Button className="flex-1" onClick={submitKyc} disabled={submitting}>
                {submitting ? <><Loader2 className="mr-2 inline size-4 animate-spin" />Đang gửi...</> : "Gửi hồ sơ"}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Success ── */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-success/10">
              <CheckCircle2 className="size-10 text-success" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-text">Hồ sơ đã được gửi!</h2>
              <p className="mt-2 text-sm text-text-muted">
                Chúng tôi sẽ xét duyệt trong <strong>1–3 ngày làm việc</strong>. Bạn sẽ nhận thông báo khi có kết quả.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-5 text-left">
              <p className="text-sm font-semibold text-text">Các bước tiếp theo</p>
              <ul className="mt-3 space-y-2.5 text-sm text-text-muted">
                {[
                  "Admin xem xét và xác minh thông tin KYC",
                  "Tài khoản được nâng lên quyền Seller",
                  "Bạn nhận được email xác nhận",
                  "Bắt đầu đăng sản phẩm và bán hàng",
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => router.push("/account/notifications")}>
                Xem thông báo
              </Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Về trang chủ
              </Button>
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
