"use client";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Palette,
  Phone,
  Shield,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiUser } from "@/lib/apiTypes";

const AVATAR_COLORS = [
  "#7c3aed", "#6d28d9", "#4f46e5", "#2563eb", "#0891b2",
  "#0d9488", "#16a34a", "#ca8a04", "#ea580c", "#dc2626",
  "#db2777", "#9333ea",
];

const KYC_LABEL: Record<string, { label: string; cls: string }> = {
  None:     { label: "Chưa xác minh", cls: "text-text-muted bg-bg-elev" },
  Pending:  { label: "Đang xem xét",  cls: "text-warning bg-warning/10" },
  Approved: { label: "Đã xác minh",   cls: "text-success bg-success/10" },
  Rejected: { label: "Bị từ chối",    cls: "text-danger bg-danger/10"   },
};

type Tab = "profile" | "security";

function Alert({ type, msg }: { type: "success" | "error"; msg: string }) {
  const isOk = type === "success";
  return (
    <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${isOk ? "border-success/40 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger"}`}>
      {isOk ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <AlertCircle className="mt-0.5 size-4 shrink-0" />}
      <span>{msg}</span>
    </div>
  );
}

export function SettingsClient() {
  const { user, token, loading: authLoading, refresh } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  // --- Profile state ---
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarColor, setAvatarColor] = useState("#7c3aed");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // --- Password state ---
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setPhoneNumber(user.phoneNumber ?? "");
      setAvatarColor(user.avatarColor);
    }
  }, [user]);

  const saveProfile = async () => {
    if (!token || !displayName.trim()) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const updated = await apiFetch<ApiUser>("/api/auth/profile", {
        method: "PUT",
        token,
        body: JSON.stringify({ displayName: displayName.trim(), avatarColor, phoneNumber: phoneNumber || null }),
      });
      // Update local storage user
      localStorage.setItem("mmo_user", JSON.stringify(updated));
      await refresh();
      setProfileMsg({ type: "success", msg: "Cập nhật hồ sơ thành công!" });
    } catch (e) {
      setProfileMsg({ type: "error", msg: e instanceof Error ? e.message : "Lỗi cập nhật hồ sơ" });
    } finally {
      setProfileSaving(false);
    }
  };

  const changePassword = async () => {
    if (!token) return;
    if (newPw !== confirmPw) {
      setPwMsg({ type: "error", msg: "Mật khẩu xác nhận không khớp" });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ type: "error", msg: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await apiFetch("/api/auth/password", {
        method: "PUT",
        token,
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      setPwMsg({ type: "success", msg: "Đổi mật khẩu thành công!" });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (e) {
      setPwMsg({ type: "error", msg: e instanceof Error ? e.message : "Lỗi đổi mật khẩu" });
    } finally {
      setPwSaving(false);
    }
  };

  if (authLoading) {
    return <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
        <p className="text-sm text-text-muted">Vui lòng đăng nhập để xem trang này.</p>
      </div>
    );
  }

  const kyc = KYC_LABEL[user.kycStatus] ?? KYC_LABEL.None;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-border bg-bg-elev p-1">
        {(["profile", "security"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t ? "bg-bg-card text-text shadow-sm" : "text-text-muted hover:text-text"
            }`}
          >
            {t === "profile" ? <User className="size-4" /> : <Shield className="size-4" />}
            {t === "profile" ? "Hồ sơ" : "Bảo mật"}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ── */}
      {tab === "profile" && (
        <div className="rounded-2xl border border-border bg-bg-card p-6 space-y-6">
          {/* Avatar preview + color picker */}
          <div className="flex items-center gap-5">
            <div
              className="grid size-16 place-items-center rounded-full text-2xl font-bold text-white shadow-lg"
              style={{ backgroundColor: avatarColor }}
            >
              {displayName.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-text">Màu avatar</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAvatarColor(c)}
                    className={`size-7 rounded-full transition-transform hover:scale-110 ${avatarColor === c ? "ring-2 ring-offset-2 ring-offset-bg-card ring-white scale-110" : ""}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Read-only fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-text-muted">Email</label>
              <div className="mt-1 flex h-10 items-center rounded-lg border border-border bg-bg-elev px-3 text-sm text-text-dim">
                {user.email}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted">Username</label>
              <div className="mt-1 flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-elev px-3 text-sm text-text-dim">
                @{user.username}
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-text-muted">
                Tên hiển thị <span className="text-danger">*</span>
              </label>
              <div className="relative mt-1">
                <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={50}
                  placeholder="Tên hiển thị"
                  className="h-10 w-full rounded-lg border border-border bg-bg-elev pl-9 pr-3 text-sm text-text outline-none focus:border-brand"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted">Số điện thoại</label>
              <div className="relative mt-1">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0912 345 678"
                  type="tel"
                  className="h-10 w-full rounded-lg border border-border bg-bg-elev pl-9 pr-3 text-sm text-text outline-none focus:border-brand"
                />
              </div>
            </div>
          </div>

          {/* KYC status */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-bg-elev px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <ShieldCheck className="size-4" />
              Trạng thái xác minh KYC
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${kyc.cls}`}>
              {kyc.label}
            </span>
          </div>

          {profileMsg && <Alert type={profileMsg.type} msg={profileMsg.msg} />}

          <div className="flex justify-end">
            <Button
              onClick={saveProfile}
              disabled={profileSaving || !displayName.trim()}
            >
              {profileSaving ? <><Loader2 className="mr-2 inline size-4 animate-spin" />Đang lưu...</> : "Lưu thay đổi"}
            </Button>
          </div>
        </div>
      )}

      {/* ── Security Tab ── */}
      {tab === "security" && (
        <div className="space-y-4">
          {/* Change password */}
          <div className="rounded-2xl border border-border bg-bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-brand" />
              <h2 className="text-base font-bold text-text">Đổi mật khẩu</h2>
            </div>

            <div className="space-y-3">
              {/* Current password */}
              <div>
                <label className="text-xs font-medium text-text-muted">Mật khẩu hiện tại</label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-border bg-bg-elev pl-9 pr-10 text-sm text-text outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                  >
                    {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="text-xs font-medium text-text-muted">Mật khẩu mới</label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="h-10 w-full rounded-lg border border-border bg-bg-elev pl-9 pr-10 text-sm text-text outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                  >
                    {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {/* Strength indicator */}
                {newPw && (
                  <div className="mt-1.5 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          newPw.length >= i * 3
                            ? newPw.length < 6 ? "bg-danger" : newPw.length < 10 ? "bg-warning" : "bg-success"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-xs font-medium text-text-muted">Xác nhận mật khẩu mới</label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className={`h-10 w-full rounded-lg border bg-bg-elev pl-9 pr-3 text-sm text-text outline-none focus:border-brand ${
                      confirmPw && confirmPw !== newPw ? "border-danger" : "border-border"
                    }`}
                  />
                </div>
                {confirmPw && confirmPw !== newPw && (
                  <p className="mt-1 text-xs text-danger">Mật khẩu không khớp</p>
                )}
              </div>
            </div>

            {pwMsg && <Alert type={pwMsg.type} msg={pwMsg.msg} />}

            <div className="flex justify-end">
              <Button
                onClick={changePassword}
                disabled={pwSaving || !currentPw || !newPw || !confirmPw}
              >
                {pwSaving ? <><Loader2 className="mr-2 inline size-4 animate-spin" />Đang đổi...</> : "Đổi mật khẩu"}
              </Button>
            </div>
          </div>

          {/* Account info */}
          <div className="rounded-2xl border border-border bg-bg-card p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-brand" />
              <h2 className="text-base font-bold text-text">Thông tin tài khoản</h2>
            </div>
            <div className="divide-y divide-border">
              {[
                { label: "Email đăng nhập", value: user.email },
                { label: "Username", value: `@${user.username}` },
                { label: "Vai trò", value: user.role },
                { label: "Điểm tích lũy", value: `${user.loyaltyPoints.toLocaleString("vi")} điểm` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-text-muted">{label}</span>
                  <span className="font-medium text-text">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
