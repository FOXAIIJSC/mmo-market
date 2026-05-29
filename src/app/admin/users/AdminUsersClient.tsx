"use client";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle, CheckCircle2, ChevronDown, Loader2,
  Search, Shield, ShieldCheck, Star, Users, Wallet, X,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminNav } from "@/lib/adminNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiAdminUser } from "@/lib/apiTypes";
import { formatRelativeTime, formatVND } from "@/lib/format";

// ── Config ────────────────────────────────────────────────────────────────
type RoleTab = "all" | "Buyer" | "Seller" | "Ctv" | "Admin";

const ROLE_TABS: { v: RoleTab; label: string }[] = [
  { v: "all",    label: "Tất cả"   },
  { v: "Buyer",  label: "Người mua" },
  { v: "Seller", label: "Người bán" },
  { v: "Ctv",    label: "CTV"       },
  { v: "Admin",  label: "Admin"     },
];

const ROLE_OPTIONS: { v: string; label: string }[] = [
  { v: "Buyer",  label: "Người mua (Buyer)"  },
  { v: "Seller", label: "Người bán (Seller)" },
  { v: "Ctv",    label: "CTV / Affiliate"    },
  { v: "Admin",  label: "Admin"              },
];

const ROLE_TONE: Record<string, "brand" | "success" | "accent" | "danger" | "warning"> = {
  Buyer:      "accent",
  Seller:     "brand",
  Ctv:        "warning",
  Admin:      "danger",
  SuperAdmin: "danger",
};

const KYC_TONE: Record<string, "success" | "warning" | "danger" | "muted"> = {
  Approved: "success",
  Pending:  "warning",
  Rejected: "danger",
  None:     "muted",
};
const KYC_LABEL: Record<string, string> = {
  Approved: "Đã KYC",
  Pending:  "Chờ duyệt",
  Rejected: "Bị từ chối",
  None:     "Chưa KYC",
};

// ── Change Role Modal ─────────────────────────────────────────────────────
function ChangeRoleModal({
  user, token, onClose, onDone,
}: {
  user: ApiAdminUser;
  token: string;
  onClose: () => void;
  onDone: (updated: ApiAdminUser) => void;
}) {
  const [newRole, setNewRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    if (newRole === user.role) { onClose(); return; }
    setSaving(true); setErr(null);
    try {
      const updated = await apiFetch<ApiAdminUser>(`/api/admin/users/${user.id}/role`, {
        method: "PUT", token,
        body: JSON.stringify({ role: newRole }),
      });
      onDone(updated);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi thay đổi vai trò");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-text">Thay đổi vai trò</h2>
            <p className="mt-0.5 text-xs text-text-muted">@{user.username} · {user.email}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-text-muted hover:bg-bg-elev">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {ROLE_OPTIONS.map((opt) => (
            <label
              key={opt.v}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                newRole === opt.v ? "border-brand bg-brand/5" : "border-border hover:border-brand/40"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={opt.v}
                checked={newRole === opt.v}
                onChange={() => setNewRole(opt.v)}
                className="accent-brand"
              />
              <span className="text-sm font-medium text-text">{opt.label}</span>
              {user.role === opt.v && (
                <span className="ml-auto text-xs text-text-muted">Hiện tại</span>
              )}
            </label>
          ))}
        </div>

        {err && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            <AlertCircle className="size-4 shrink-0" />{err}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Hủy</Button>
          <Button className="flex-1" onClick={save} disabled={saving || newRole === user.role}>
            {saving ? <><Loader2 className="mr-1.5 inline size-4 animate-spin" />Đang lưu...</> : "Xác nhận"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export function AdminUsersClient() {
  const { token } = useAuth();
  const [users, setUsers] = useState<ApiAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<RoleTab>("all");
  const [search, setSearch] = useState("");
  const [roleTarget, setRoleTarget] = useState<ApiAdminUser | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setErr(null);
    try {
      const roleParam = tab !== "all" ? `&role=${tab}` : "";
      const searchParam = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : "";
      const data = await apiFetch<ApiAdminUser[]>(`/api/admin/users?${roleParam}${searchParam}`, { token });
      setUsers(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [token, tab, search]);

  useEffect(() => { load(); }, [load]);

  const handleRoleDone = (updated: ApiAdminUser) => {
    setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
    setRoleTarget(null);
    setSuccessMsg(`Đã cập nhật vai trò @${updated.username} → ${updated.role}`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Stats
  const total = users.length;
  const buyers  = users.filter((u) => u.role === "Buyer").length;
  const sellers = users.filter((u) => u.role === "Seller").length;
  const admins  = users.filter((u) => u.role === "Admin" || u.role === "SuperAdmin").length;

  return (
    <DashboardLayout
      variant="admin"
      groups={adminNav}
      title="Người dùng"
      subtitle="Quản lý toàn bộ tài khoản trên hệ thống"
    >
      {/* Success toast */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="size-4 shrink-0" />{successMsg}
        </div>
      )}

      {/* Stats row */}
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Tổng người dùng", value: total,   icon: <Users className="size-4" />,        color: "bg-accent/10 text-accent"   },
          { label: "Người mua",       value: buyers,  icon: <Wallet className="size-4" />,        color: "bg-brand/10 text-brand"     },
          { label: "Người bán",       value: sellers, icon: <Star className="size-4" />,          color: "bg-success/10 text-success" },
          { label: "Admin",           value: admins,  icon: <Shield className="size-4" />,        color: "bg-danger/10 text-danger"   },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border bg-bg-card p-4">
            <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-xs text-text-muted">{s.label}</p>
              <p className="text-xl font-bold text-text">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Role tabs */}
        <div className="flex gap-1 rounded-xl border border-border bg-bg-elev p-1 text-sm">
          {ROLE_TABS.map((t) => (
            <button
              key={t.v}
              onClick={() => setTab(t.v)}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                tab === t.v ? "bg-bg-card text-text shadow-sm" : "text-text-muted hover:text-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm email, username, tên..."
            className="h-9 w-full rounded-lg border border-border bg-bg-elev pl-9 pr-3 text-sm text-text outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-bg-card">
        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="size-6 animate-spin text-text-muted" />
          </div>
        ) : err ? (
          <div className="p-6 text-sm text-danger">{err}</div>
        ) : users.length === 0 ? (
          <div className="grid place-items-center gap-2 py-16 text-center">
            <Users className="size-10 text-border" />
            <p className="text-sm text-text-muted">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="px-4 py-3">Người dùng</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">KYC</th>
                  <th className="px-4 py-3 text-right">Số dư ví</th>
                  <th className="px-4 py-3 text-right">Điểm</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-bg-elev/30">
                    {/* Avatar + info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                          style={{ background: u.avatarColor }}
                        >
                          {u.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-text">{u.displayName}</p>
                          <p className="truncate text-xs text-text-muted">@{u.username} · {u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <Badge tone={ROLE_TONE[u.role] ?? "muted"}>{u.role}</Badge>
                    </td>

                    {/* KYC */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {u.kycStatus === "Approved" && <ShieldCheck className="size-3.5 text-success" />}
                        <Badge tone={KYC_TONE[u.kycStatus] ?? "muted"}>
                          {KYC_LABEL[u.kycStatus] ?? u.kycStatus}
                        </Badge>
                      </div>
                    </td>

                    {/* Wallet */}
                    <td className="px-4 py-3 text-right">
                      <span className="num font-semibold text-text">{formatVND(u.walletBalance)}</span>
                    </td>

                    {/* Loyalty */}
                    <td className="px-4 py-3 text-right">
                      <span className="num text-warning">{u.loyaltyPoints.toLocaleString("vi")}</span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {formatRelativeTime(u.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<ChevronDown className="size-3.5" />}
                          onClick={() => setRoleTarget(u)}
                        >
                          Vai trò
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && users.length > 0 && (
          <div className="border-t border-border px-4 py-2.5 text-xs text-text-muted">
            Hiển thị {users.length} người dùng
            {tab !== "all" ? ` · Lọc: ${tab}` : ""}
            {search ? ` · Tìm kiếm: "${search}"` : ""}
          </div>
        )}
      </div>

      {/* Change role modal */}
      {roleTarget && token && (
        <ChangeRoleModal
          user={roleTarget}
          token={token}
          onClose={() => setRoleTarget(null)}
          onDone={handleRoleDone}
        />
      )}
    </DashboardLayout>
  );
}
