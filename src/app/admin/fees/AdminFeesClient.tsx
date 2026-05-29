"use client";
import { useEffect, useState } from "react";
import {
  CheckCircle2, Crown, Edit2, Gift, Loader2,
  Percent, Plus, Star, Trash2, Trophy, Zap,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { adminNav } from "@/lib/adminNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiFeeConfig, ApiLoyaltyConfig, ApiLoyaltyReward } from "@/lib/apiTypes";
import { formatVND } from "@/lib/format";

// ── Tier visual config ────────────────────────────────────────────────────────
const TIER_COLORS = ["#cd7f32", "#aab0bc", "#f59e0b", "#06b6d4"];
const TIER_LABELS = ["Đồng", "Bạc", "Vàng", "Kim cương"];
const TIER_ICONS  = [
  <Star key="b" className="size-4" />,
  <Star key="s" className="size-4" />,
  <Trophy key="g" className="size-4" />,
  <Crown key="d" className="size-4" />,
];

// ── Reward modal ──────────────────────────────────────────────────────────────
type RewardForm = {
  title: string; description: string; pointsCost: number;
  type: string; voucherAmount: number; isComingSoon: boolean; position: number; isActive: boolean;
};
const defaultRewardForm = (): RewardForm => ({
  title: "", description: "", pointsCost: 100,
  type: "Voucher", voucherAmount: 0, isComingSoon: false, position: 1, isActive: true,
});

function RewardModal({
  initial, onClose, onSave,
}: {
  initial: (RewardForm & { id?: string }) | null;
  onClose: () => void;
  onSave: (data: RewardForm & { id?: string }) => Promise<void>;
}) {
  const [form, setForm] = useState<RewardForm>(initial ?? defaultRewardForm());
  const [saving, setSaving] = useState(false);

  const set = (k: keyof RewardForm, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSave({ ...form, id: initial?.id }); onClose(); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-border bg-bg-card p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-text">{initial?.id ? "Chỉnh sửa" : "Thêm"} phần thưởng</h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-text-muted">Tên phần thưởng *</label>
            <input required value={form.title} onChange={e => set("title", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-text-muted">Mô tả</label>
            <input value={form.description} onChange={e => set("description", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-xs text-text-muted">Điểm đổi</label>
            <input type="number" min={1} value={form.pointsCost} onChange={e => set("pointsCost", parseInt(e.target.value) || 1)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-xs text-text-muted">Loại</label>
            <select value={form.type} onChange={e => set("type", e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand">
              <option value="Voucher">Voucher</option>
              <option value="Shipping">Miễn phí vận chuyển</option>
              <option value="Product">Sản phẩm</option>
            </select>
          </div>
          {form.type === "Voucher" && (
            <div>
              <label className="text-xs text-text-muted">Giá trị voucher (₫)</label>
              <input type="number" min={0} value={form.voucherAmount} onChange={e => set("voucherAmount", parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand" />
            </div>
          )}
          <div>
            <label className="text-xs text-text-muted">Vị trí (thứ tự)</label>
            <input type="number" min={1} value={form.position} onChange={e => set("position", parseInt(e.target.value) || 1)}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elev px-3 py-2 text-sm text-text outline-none focus:border-brand" />
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
            <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)}
              className="size-4 accent-brand" />
            Hiển thị
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
            <input type="checkbox" checked={form.isComingSoon} onChange={e => set("isComingSoon", e.target.checked)}
              className="size-4 accent-brand" />
            Coming soon
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:bg-bg-elev">Hủy</button>
          <button type="submit" disabled={saving}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60">
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmDelete({ label, onConfirm, onClose }: { label: string; onConfirm: () => Promise<void>; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6 shadow-xl text-center space-y-4">
        <Trash2 className="mx-auto size-10 text-danger" />
        <p className="text-sm text-text">Xóa phần thưởng <strong>{label}</strong>?</p>
        <div className="flex gap-2 justify-center">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-text-muted hover:bg-bg-elev">Hủy</button>
          <button onClick={async () => { setLoading(true); await onConfirm(); onClose(); }} disabled={loading}
            className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90 disabled:opacity-60">
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

// ── Main ──────────────────────────────────────────────────────────────────────
export function AdminFeesClient() {
  const { token } = useAuth();
  const [tab, setTab] = useState<"fee" | "loyalty" | "rewards">("fee");

  // Fee state
  const [feePercent, setFeePercent] = useState(5);
  const [savingFee, setSavingFee] = useState(false);

  // Loyalty state
  const [loyalty, setLoyalty] = useState<ApiLoyaltyConfig>({
    ptsPer1000: 1, signupBonus: 100, reviewBonus: 50, referralBonus: 200,
    tierSilver: 1000, tierGold: 5000, tierDiamond: 15000,
  });
  const [savingLoyalty, setSavingLoyalty] = useState(false);

  // Rewards state
  const [rewards, setRewards] = useState<ApiLoyaltyReward[]>([]);
  const [rewardModal, setRewardModal] = useState<(RewardForm & { id?: string }) | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    try {
      const [fee, loy, rws] = await Promise.all([
        apiFetch<ApiFeeConfig>("/api/admin/config/fee", { token }),
        apiFetch<ApiLoyaltyConfig>("/api/admin/config/loyalty", { token }),
        apiFetch<ApiLoyaltyReward[]>("/api/admin/config/rewards", { token }),
      ]);
      setFeePercent(fee.feePercent);
      setLoyalty(loy);
      setRewards(rws);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveFee() {
    setSavingFee(true);
    try {
      const updated = await apiFetch<ApiFeeConfig>("/api/admin/config/fee", {
        token, method: "PUT", body: JSON.stringify({ feePercent }),
      });
      setFeePercent(updated.feePercent);
      showToast("Đã lưu phí sàn");
    } finally { setSavingFee(false); }
  }

  async function saveLoyalty() {
    setSavingLoyalty(true);
    try {
      const updated = await apiFetch<ApiLoyaltyConfig>("/api/admin/config/loyalty", {
        token, method: "PUT", body: JSON.stringify(loyalty),
      });
      setLoyalty(updated);
      showToast("Đã lưu cấu hình loyalty");
    } finally { setSavingLoyalty(false); }
  }

  async function saveReward(data: RewardForm & { id?: string }) {
    const body = JSON.stringify({
      title: data.title, description: data.description, pointsCost: data.pointsCost,
      type: data.type, voucherAmount: data.voucherAmount,
      isComingSoon: data.isComingSoon, position: data.position, isActive: data.isActive,
    });
    if (data.id) {
      const updated = await apiFetch<ApiLoyaltyReward>(`/api/admin/config/rewards/${data.id}`, { token, method: "PUT", body });
      setRewards(rs => rs.map(r => r.id === data.id ? updated : r));
    } else {
      const created = await apiFetch<ApiLoyaltyReward>("/api/admin/config/rewards", { token, method: "POST", body });
      setRewards(rs => [...rs, created]);
    }
    showToast("Đã lưu phần thưởng");
  }

  async function toggleReward(id: string) {
    const updated = await apiFetch<ApiLoyaltyReward>(`/api/admin/config/rewards/${id}/toggle`, { token, method: "POST" });
    setRewards(rs => rs.map(r => r.id === id ? updated : r));
  }

  async function deleteReward(id: string) {
    await apiFetch(`/api/admin/config/rewards/${id}`, { token, method: "DELETE" });
    setRewards(rs => rs.filter(r => r.id !== id));
    showToast("Đã xóa phần thưởng");
  }

  function openEditReward(r: ApiLoyaltyReward) {
    setRewardModal({ id: r.id, title: r.title, description: r.description, pointsCost: r.pointsCost,
      type: r.type, voucherAmount: r.voucherAmount, isComingSoon: r.isComingSoon, position: r.position, isActive: r.isActive });
  }

  const loy = loyalty;
  const tierThresholds = [0, loy.tierSilver, loy.tierGold, loy.tierDiamond];

  return (
    <DashboardLayout variant="admin" groups={adminNav} title="Phí sàn & Loyalty" subtitle="Cấu hình tỉ lệ phí, điểm thưởng và phần thưởng đổi điểm">

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-bg-elev p-1 w-fit">
        {(["fee", "loyalty", "rewards"] as const).map(t => {
          const labels: Record<string, string> = { fee: "Phí sàn", loyalty: "Điểm thưởng", rewards: "Phần thưởng" };
          const icons: Record<string, React.ReactNode> = {
            fee: <Percent className="size-4" />,
            loyalty: <Star className="size-4" />,
            rewards: <Gift className="size-4" />,
          };
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t ? "bg-bg-card text-brand shadow" : "text-text-muted hover:text-text"}`}>
              {icons[t]}{labels[t]}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-8 animate-spin text-text-muted" />
        </div>
      )}

      {/* ── Tab: Phí sàn ── */}
      {!loading && tab === "fee" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Config */}
          <div className="rounded-2xl border border-border bg-bg-card p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-text mb-1">Tỉ lệ phí sàn</h3>
              <p className="text-xs text-text-muted">Phần trăm sàn giữ lại từ mỗi giao dịch thành công. Ảnh hưởng đến số tiền người bán nhận được.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="range" min={0} max={30} step={0.5} value={feePercent}
                  onChange={e => setFeePercent(parseFloat(e.target.value))}
                  className="flex-1 accent-brand"
                />
                <div className="flex w-24 items-center rounded-lg border border-border bg-bg-elev">
                  <input
                    type="number" min={0} max={30} step={0.5} value={feePercent}
                    onChange={e => setFeePercent(Math.min(30, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-14 bg-transparent px-2 py-2 text-right text-sm font-mono text-text outline-none"
                  />
                  <span className="pr-2 text-sm text-text-muted">%</span>
                </div>
              </div>

              {/* Quick presets */}
              <div className="flex gap-2">
                {[3, 5, 8, 10, 15].map(v => (
                  <button key={v} onClick={() => setFeePercent(v)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${feePercent === v ? "bg-brand text-white" : "bg-bg-elev text-text-muted hover:bg-border hover:text-text"}`}>
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            <button onClick={saveFee} disabled={savingFee}
              className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60">
              {savingFee ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>

          {/* Right: Impact preview */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-bg-card p-5">
              <h4 className="text-sm font-semibold text-text mb-4">Ví dụ tác động</h4>
              <div className="space-y-3">
                {[500_000, 1_000_000, 5_000_000, 10_000_000].map(orderVal => {
                  const fee = orderVal * (feePercent / 100);
                  const sellerGet = orderVal - fee;
                  return (
                    <div key={orderVal} className="flex items-center justify-between rounded-xl border border-border bg-bg-elev p-3">
                      <div>
                        <p className="text-xs text-text-muted">Đơn {formatVND(orderVal)}</p>
                        <p className="text-sm text-text">Người bán nhận: <span className="font-semibold text-success">{formatVND(sellerGet)}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-text-muted">Sàn thu</p>
                        <p className="text-base font-bold text-brand">{formatVND(fee)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-5">
              <h4 className="text-sm font-semibold text-text mb-3">Dự kiến doanh thu</h4>
              <div className="space-y-2 text-sm">
                {[{ gmv: 100_000_000, label: "GMV 100M" }, { gmv: 500_000_000, label: "GMV 500M" }, { gmv: 1_000_000_000, label: "GMV 1 tỷ" }].map(({ gmv, label }) => (
                  <div key={gmv} className="flex justify-between">
                    <span className="text-text-muted">{label}</span>
                    <span className="font-semibold text-text">{formatVND(gmv * feePercent / 100)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-text-dim">* Ước tính, chưa tính đơn hủy/hoàn tiền</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Điểm thưởng ── */}
      {!loading && tab === "loyalty" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Rates */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-bg-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-text">Tỉ lệ tích điểm</h3>

              {[
                { key: "ptsPer1000" as const,    label: "Điểm / 1.000₫ mua hàng", icon: <Zap className="size-4 text-brand" />,    min: 1, max: 10 },
                { key: "signupBonus" as const,   label: "Thưởng đăng ký tài khoản", icon: <Star className="size-4 text-success" />, min: 0, max: 1000 },
                { key: "reviewBonus" as const,   label: "Thưởng viết đánh giá",     icon: <Star className="size-4 text-warning" />, min: 0, max: 500  },
                { key: "referralBonus" as const, label: "Thưởng giới thiệu bạn",    icon: <Star className="size-4 text-accent" />,  min: 0, max: 1000 },
              ].map(({ key, label, icon, min, max }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-bg-elev">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted truncate">{label}</p>
                  </div>
                  <input
                    type="number" min={min} max={max} value={loy[key]}
                    onChange={e => setLoyalty(l => ({ ...l, [key]: parseInt(e.target.value) || 0 }))}
                    className="w-20 rounded-lg border border-border bg-bg-elev px-2 py-1.5 text-center text-sm font-semibold text-text outline-none focus:border-brand"
                  />
                  <span className="w-10 text-xs text-text-muted shrink-0">điểm</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-bg-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-text">Ngưỡng thăng hạng</h3>
              {[
                { key: "tierSilver" as const,  label: "Bạc", color: "#aab0bc" },
                { key: "tierGold" as const,    label: "Vàng", color: "#f59e0b" },
                { key: "tierDiamond" as const, label: "Kim cương", color: "#06b6d4" },
              ].map(({ key, label, color }) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg" style={{ background: color + "20" }}>
                    <Star className="size-4" style={{ color }} />
                  </div>
                  <p className="flex-1 text-sm font-medium text-text">Hạng {label}</p>
                  <input
                    type="number" min={1} value={loy[key]}
                    onChange={e => setLoyalty(l => ({ ...l, [key]: parseInt(e.target.value) || 0 }))}
                    className="w-24 rounded-lg border border-border bg-bg-elev px-2 py-1.5 text-center text-sm font-semibold text-text outline-none focus:border-brand"
                  />
                  <span className="w-10 text-xs text-text-muted shrink-0">điểm</span>
                </div>
              ))}
            </div>

            <button onClick={saveLoyalty} disabled={savingLoyalty}
              className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60">
              {savingLoyalty ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </div>

          {/* Right: Tier ladder preview */}
          <div className="rounded-2xl border border-border bg-bg-card p-5">
            <h3 className="text-sm font-bold text-text mb-5">Xem trước hạng thành viên</h3>
            <div className="space-y-3">
              {TIER_LABELS.map((label, i) => {
                const min = tierThresholds[i];
                const max = tierThresholds[i + 1] ?? null;
                const color = TIER_COLORS[i];
                return (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-border bg-bg-elev p-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl text-white"
                      style={{ background: color }}>
                      {TIER_ICONS[i]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-text">Hạng {label}</p>
                      <p className="text-xs text-text-muted">
                        {min.toLocaleString("vi")} {max ? `→ ${max.toLocaleString("vi")}` : "điểm trở lên"}
                        {max ? ` điểm` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-text" style={{ color }}>
                        {max ? `${(max - min).toLocaleString("vi")} điểm` : "∞"}
                      </p>
                      <p className="text-[10px] text-text-dim">
                        {max ? "dải điểm" : "không giới hạn"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-border bg-bg-elev p-3">
              <p className="text-xs font-medium text-text-muted mb-2">Điểm tích lũy ví dụ</p>
              {[
                { spend: 1_000_000, label: "Chi tiêu 1M₫" },
                { spend: 5_000_000, label: "Chi tiêu 5M₫" },
                { spend: 15_000_000, label: "Chi tiêu 15M₫" },
              ].map(({ spend, label }) => {
                const pts = (spend / 1000) * loy.ptsPer1000 + loy.signupBonus;
                const tier = pts >= loy.tierDiamond ? "Kim cương" : pts >= loy.tierGold ? "Vàng" : pts >= loy.tierSilver ? "Bạc" : "Đồng";
                return (
                  <div key={spend} className="flex justify-between text-xs text-text-muted py-0.5">
                    <span>{label}</span>
                    <span className="font-semibold text-text">{pts.toLocaleString("vi")} điểm → <span className="text-brand">{tier}</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Phần thưởng ── */}
      {!loading && tab === "rewards" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="rounded-xl border border-border bg-bg-card px-4 py-2 text-center">
                <p className="text-xs text-text-muted">Tổng</p>
                <p className="text-lg font-bold text-text">{rewards.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-card px-4 py-2 text-center">
                <p className="text-xs text-text-muted">Đang hiển thị</p>
                <p className="text-lg font-bold text-success">{rewards.filter(r => r.isActive && !r.isComingSoon).length}</p>
              </div>
            </div>
            <button onClick={() => setRewardModal("new")}
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">
              <Plus className="size-4" /> Thêm phần thưởng
            </button>
          </div>

          {rewards.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
              <Gift className="mx-auto mb-3 size-10 text-text-muted" />
              <p className="text-sm text-text-muted">Chưa có phần thưởng nào</p>
            </div>
          )}

          {/* Table */}
          {rewards.length > 0 && (
            <div className="rounded-2xl border border-border bg-bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-bg-elev">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">Phần thưởng</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Điểm đổi</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Loại</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Giá trị</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Trạng thái</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">Vị trí</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rewards.map(r => (
                      <tr key={r.id} className="hover:bg-bg-elev/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-text">{r.title}</p>
                          {r.description && <p className="text-xs text-text-muted mt-0.5">{r.description}</p>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                            {r.pointsCost.toLocaleString("vi")} pts
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-text-muted">
                            {r.type === "Voucher" ? "Voucher" : r.type === "Shipping" ? "Vận chuyển" : "Sản phẩm"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-semibold text-text">
                            {r.type === "Voucher" ? formatVND(r.voucherAmount) : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {r.isComingSoon ? (
                            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-bold text-warning">Sắp ra mắt</span>
                          ) : r.isActive ? (
                            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">Hiển thị</span>
                          ) : (
                            <span className="rounded-full bg-text-muted/15 px-2 py-0.5 text-[11px] font-bold text-text-muted">Ẩn</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-text-muted">#{r.position}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => toggleReward(r.id)}
                              className="rounded-lg bg-bg-elev px-2.5 py-1.5 text-xs text-text-muted hover:bg-border">
                              {r.isActive ? "Ẩn" : "Hiện"}
                            </button>
                            <button onClick={() => openEditReward(r)}
                              className="rounded-lg bg-brand/10 px-2.5 py-1.5 text-xs text-brand hover:bg-brand/20">
                              <Edit2 className="size-3.5" />
                            </button>
                            <button onClick={() => setDeleteTarget({ id: r.id, label: r.title })}
                              className="rounded-lg bg-danger/10 px-2.5 py-1.5 text-xs text-danger hover:bg-danger/20">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {rewardModal !== null && (
        <RewardModal
          initial={rewardModal === "new" ? null : rewardModal}
          onClose={() => setRewardModal(null)}
          onSave={saveReward}
        />
      )}
      {deleteTarget && (
        <ConfirmDelete
          label={deleteTarget.label}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteReward(deleteTarget.id)}
        />
      )}
      {toast && <Toast msg={toast} />}
    </DashboardLayout>
  );
}
