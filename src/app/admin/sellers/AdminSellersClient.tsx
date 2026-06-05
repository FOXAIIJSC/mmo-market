"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminNav } from "@/lib/adminNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiAdminUser, ApiKycSubmission } from "@/lib/apiTypes";
import { formatRelativeTime, formatVND } from "@/lib/format";

export function AdminSellersClient() {
  const { token, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<ApiAdminUser[]>([]);
  const [kyc, setKyc] = useState<ApiKycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async (tk?: string | null) => {
    if (!tk) return;
    try {
      const [u, k] = await Promise.all([
        apiFetch<ApiAdminUser[]>("/api/admin/users?role=Seller", { token: tk }),
        apiFetch<ApiKycSubmission[]>("/api/admin/kyc/pending", { token: tk }),
      ]);
      setUsers(u);
      setKyc(k);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    void reload(token).finally(() => setLoading(false));
  }, [token]);

  const onApproveKyc = async (id: string) => {
    if (!token) return;
    try {
      await apiFetch(`/api/admin/kyc/${id}/approve`, { method: "POST", token });
      await reload(token);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const onRejectKyc = async (id: string) => {
    const reason = prompt("Lý do từ chối KYC?");
    if (!token || !reason) return;
    try {
      await apiFetch(`/api/admin/kyc/${id}/reject`, {
        method: "POST",
        token,
        body: JSON.stringify({ reason }),
      });
      await reload(token);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout variant="admin" groups={adminNav} title="Sellers & KYC" subtitle="Đang tải...">
        <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>
      </DashboardLayout>
    );
  }

  if (!token) {
    return (
      <DashboardLayout variant="admin" groups={adminNav} title="Sellers & KYC" subtitle="">
        <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
          <p className="text-sm text-text-muted">Vui lòng <Link href="/login" className="text-accent hover:underline">đăng nhập</Link> bằng tài khoản admin.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      variant="admin"
      groups={adminNav}
      title="Sellers & KYC"
      subtitle={`${users.length} seller · ${kyc.length} KYC chờ duyệt`}
    >
      {error && <div className="mb-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">{error}</div>}

      <section className="rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold text-text">KYC chờ duyệt ({kyc.length})</h3>
        </div>
        {kyc.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-text-muted">Không có KYC chờ duyệt.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">CCCD</th>
                <th className="px-4 py-3">SĐT</th>
                <th className="px-4 py-3">Giấy tờ</th>
                <th className="px-4 py-3 text-right">Gửi lúc</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {kyc.map((k) => (
                <tr key={k.id} className="hover:bg-bg-elev/30">
                  <td className="px-4 py-3 font-medium text-text">{k.fullName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{k.idNumber}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{k.phoneNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {([["frontImage", "Trước"], ["backImage", "Sau"]] as const).map(([key, lbl]) =>
                        k[key] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <a key={key} href={k[key]!} target="_blank" rel="noopener noreferrer" title={`CCCD mặt ${lbl}`}>
                            <img src={k[key]!} alt={lbl} className="h-9 w-14 rounded border border-border object-cover hover:ring-2 hover:ring-brand" />
                          </a>
                        ) : (
                          <span key={key} className="grid h-9 w-14 place-items-center rounded border border-dashed border-border text-[10px] text-text-dim">{lbl}: —</span>
                        )
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-text-muted">{formatRelativeTime(k.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="success" className="!h-8 !w-8 !px-0" onClick={() => onApproveKyc(k.id)} title="Duyệt"><Check className="size-3.5" /></Button>
                      <Button size="sm" variant="danger" className="!h-8 !w-8 !px-0" onClick={() => onRejectKyc(k.id)} title="Từ chối"><X className="size-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-bold text-text">Tất cả Seller ({users.length})</h3>
        </div>
        {users.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-text-muted">Chưa có seller nào.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Tên hiển thị</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3 text-center">KYC</th>
                <th className="px-4 py-3 text-right">Ví</th>
                <th className="px-4 py-3 text-right">Tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-bg-elev/30">
                  <td className="px-4 py-3 font-medium text-text">{u.displayName}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">@{u.username}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge tone={u.kycStatus === "Approved" ? "success" : u.kycStatus === "Pending" ? "warning" : "muted"}>{u.kycStatus}</Badge>
                  </td>
                  <td className="num px-4 py-3 text-right text-text-muted">{formatVND(u.walletBalance)}</td>
                  <td className="px-4 py-3 text-right text-xs text-text-muted">{formatRelativeTime(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </DashboardLayout>
  );
}
