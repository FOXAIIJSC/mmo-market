"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Search,
  ShoppingBag,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { adminNav } from "@/lib/adminNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type {
  ApiAdminWalletOverview,
  ApiAdminWalletTxn,
  ApiAdminWalletUser,
} from "@/lib/apiTypes";
import { formatRelativeTime, formatVND } from "@/lib/format";

const presetAmounts = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

const txnTone: Record<string, "success" | "warning" | "danger" | "muted"> = {
  Completed: "success",
  Pending: "warning",
  Failed: "danger",
};

export function AdminWalletClient() {
  const { token, loading: authLoading } = useAuth();
  const [overview, setOverview] = useState<ApiAdminWalletOverview | null>(null);
  const [users, setUsers] = useState<ApiAdminWalletUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [topupUserId, setTopupUserId] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState(500_000);
  const [topupNote, setTopupNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [txnUserId, setTxnUserId] = useState<string | null>(null);
  const [txnUsername, setTxnUsername] = useState("");
  const [txns, setTxns] = useState<ApiAdminWalletTxn[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);

  const reload = useCallback(
    async (tk?: string | null, q?: string) => {
      if (!tk) return;
      try {
        const filter = (q ?? search) ? `?search=${encodeURIComponent(q ?? search)}` : "";
        const [ov, ul] = await Promise.all([
          apiFetch<ApiAdminWalletOverview>("/api/admin/wallets/overview", { token: tk }),
          apiFetch<ApiAdminWalletUser[]>(`/api/admin/wallets${filter}`, { token: tk }),
        ]);
        setOverview(ov);
        setUsers(ul);
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [search],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!token) { setLoading(false); return; }
    void reload(token).finally(() => setLoading(false));
  }, [token, reload]);

  const onSearch = () => {
    void reload(token, search);
  };

  const openTopup = (userId: string) => {
    setTopupUserId(userId);
    setTopupAmount(500_000);
    setTopupNote("");
  };

  const doTopup = async () => {
    if (!token || !topupUserId || topupAmount <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/wallets/${topupUserId}/topup`, {
        method: "POST",
        token,
        body: JSON.stringify({ amount: topupAmount, note: topupNote }),
      });
      setTopupUserId(null);
      await reload(token, search);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const viewTxns = async (userId: string, username: string) => {
    if (!token) return;
    setTxnUserId(userId);
    setTxnUsername(username);
    setTxnLoading(true);
    try {
      const data = await apiFetch<ApiAdminWalletTxn[]>(
        `/api/admin/wallets/${userId}/transactions`,
        { token },
      );
      setTxns(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setTxnLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout variant="admin" groups={adminNav} title="Ví & Nạp tiền" subtitle="Đang tải...">
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-text-muted" />
        </div>
      </DashboardLayout>
    );
  }

  if (!token) {
    return (
      <DashboardLayout variant="admin" groups={adminNav} title="Ví & Nạp tiền" subtitle="">
        <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
          <p className="text-sm text-text-muted">
            Vui lòng{" "}
            <Link href="/login" className="text-accent hover:underline">
              đăng nhập
            </Link>{" "}
            bằng tài khoản admin.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const topupUser = topupUserId ? users.find((u) => u.id === topupUserId) : null;

  return (
    <DashboardLayout
      variant="admin"
      groups={adminNav}
      title="Ví & Nạp tiền"
      subtitle="Quản lý ví người dùng · Nạp tiền thủ công"
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Tổng số dư hệ thống"
          value={formatVND(overview?.totalBalance ?? 0)}
          icon={<Wallet className="size-4" />}
          tone="brand"
        />
        <Stat
          label="User có số dư"
          value={String(overview?.totalUsers ?? 0)}
          icon={<Users className="size-4" />}
          tone="accent"
        />
        <Stat
          label="Tổng đã nạp"
          value={formatVND(overview?.totalTopup ?? 0)}
          icon={<ArrowDownToLine className="size-4" />}
          tone="success"
        />
        <Stat
          label="Tổng chi tiêu"
          value={formatVND(overview?.totalSpent ?? 0)}
          icon={<ShoppingBag className="size-4" />}
          tone="warning"
        />
      </div>

      {/* Search bar */}
      <div className="mt-6 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm theo username, email hoặc tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="h-11 w-full rounded-xl border border-border bg-bg-elev pl-10 pr-4 text-sm text-text placeholder:text-text-dim outline-none transition focus:border-brand"
          />
        </div>
        <Button variant="outline" onClick={onSearch}>
          Tìm kiếm
        </Button>
      </div>

      {/* Users table */}
      <div className="mt-4 rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold text-text">
            Danh sách ví người dùng ({users.length})
          </h3>
        </div>
        {users.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-text-muted">
            Không tìm thấy người dùng.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3 text-right">Số dư</th>
                  <th className="px-4 py-3 text-right">Điểm</th>
                  <th className="px-4 py-3 text-right">GD</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-bg-elev/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text">@{u.username}</div>
                      <div className="text-[10px] text-text-dim">{u.displayName}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={u.role === "Admin" || u.role === "SuperAdmin" ? "danger" : u.role === "Seller" ? "brand" : "muted"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="num px-4 py-3 text-right font-semibold text-text">
                      {formatVND(u.walletBalance)}
                    </td>
                    <td className="num px-4 py-3 text-right text-text-muted">
                      {u.loyaltyPoints}
                    </td>
                    <td className="num px-4 py-3 text-right text-text-muted">
                      {u.txnCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => openTopup(u.id)}
                          title="Nạp tiền"
                        >
                          <Plus className="size-3.5" />
                          Nạp
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewTxns(u.id, u.username)}
                          title="Xem giao dịch"
                        >
                          Lịch sử
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Topup modal */}
      {topupUserId && topupUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text">
                Nạp tiền cho @{topupUser.username}
              </h3>
              <button
                onClick={() => setTopupUserId(null)}
                className="rounded-full p-1 text-text-muted hover:bg-bg-elev hover:text-text"
              >
                <X className="size-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Số dư hiện tại:{" "}
              <span className="font-semibold text-text">
                {formatVND(topupUser.walletBalance)}
              </span>
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {presetAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setTopupAmount(a)}
                  className={`rounded-xl border p-3 text-center text-sm font-semibold transition ${
                    topupAmount === a
                      ? "border-brand bg-brand-soft text-text"
                      : "border-border bg-bg-elev text-text-muted hover:border-brand/40 hover:text-text"
                  }`}
                >
                  <div className="num">{formatVND(a)}</div>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-text-muted">Số tiền</label>
              <input
                type="number"
                min={10000}
                step={10000}
                value={topupAmount}
                onChange={(e) => setTopupAmount(Number(e.target.value) || 0)}
                className="mt-1 h-11 w-full rounded-xl border border-border bg-bg-elev px-4 text-sm text-text outline-none transition focus:border-brand"
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-text-muted">Ghi chú</label>
              <input
                type="text"
                placeholder="Admin nạp tiền"
                value={topupNote}
                onChange={(e) => setTopupNote(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-border bg-bg-elev px-4 text-sm text-text placeholder:text-text-dim outline-none transition focus:border-brand"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTopupUserId(null)}>
                Huỷ
              </Button>
              <Button onClick={doTopup} disabled={submitting || topupAmount < 10000}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Plus className="size-4" />
                    Xác nhận nạp {formatVND(topupAmount)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction history modal */}
      {txnUserId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-base font-bold text-text">
                Lịch sử giao dịch — @{txnUsername}
              </h3>
              <button
                onClick={() => setTxnUserId(null)}
                className="rounded-full p-1 text-text-muted hover:bg-bg-elev hover:text-text"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto p-5">
              {txnLoading ? (
                <div className="grid place-items-center py-12">
                  <Loader2 className="size-6 animate-spin text-text-muted" />
                </div>
              ) : txns.length === 0 ? (
                <p className="py-12 text-center text-sm text-text-muted">
                  Chưa có giao dịch.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase text-text-muted">
                    <tr>
                      <th className="px-3 py-2">Loại</th>
                      <th className="px-3 py-2">Ghi chú</th>
                      <th className="px-3 py-2 text-center">Trạng thái</th>
                      <th className="px-3 py-2 text-right">Số tiền</th>
                      <th className="px-3 py-2 text-right">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {txns.map((t) => (
                      <tr key={t.id} className="hover:bg-bg-elev/30">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1.5">
                            {t.status === "Completed" ? (
                              <CheckCircle2 className="size-3.5 text-success" />
                            ) : t.status === "Pending" ? (
                              <Clock className="size-3.5 text-warning" />
                            ) : (
                              <AlertCircle className="size-3.5 text-danger" />
                            )}
                            <span className="text-text">{t.type}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-text-muted">{t.note}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge tone={txnTone[t.status] ?? "muted"}>{t.status}</Badge>
                        </td>
                        <td
                          className={`num px-3 py-2 text-right font-semibold ${
                            t.amount >= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {t.amount >= 0 ? "+" : ""}
                          {formatVND(t.amount)}
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-text-muted">
                          {formatRelativeTime(t.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
