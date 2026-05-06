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
import type { ApiAdminProduct } from "@/lib/apiTypes";
import { formatRelativeTime, formatVND } from "@/lib/format";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "Pending", label: "Chờ duyệt" },
  { key: "Active", label: "Đang bán" },
  { key: "Rejected", label: "Bị từ chối" },
  { key: "Hidden", label: "Đã ẩn" },
];

const tone: Record<string, "success" | "warning" | "danger" | "muted"> = {
  Active: "success",
  Pending: "warning",
  Rejected: "danger",
  Hidden: "muted",
};

export function AdminProductsClient() {
  const { token, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("Pending");
  const [items, setItems] = useState<ApiAdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async (tk?: string | null, t?: string) => {
    if (!tk) return;
    setLoading(true);
    try {
      const filter = (t ?? tab) === "all" ? "" : `?status=${t ?? tab}`;
      const list = await apiFetch<ApiAdminProduct[]>(`/api/admin/products${filter}`, { token: tk });
      setItems(list);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    void reload(token, tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tab]);

  const onApprove = async (id: string) => {
    if (!token) return;
    try {
      await apiFetch<ApiAdminProduct>(`/api/admin/products/${id}/approve`, { method: "POST", token });
      await reload(token, tab);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const onReject = async (id: string) => {
    const reason = prompt("Lý do từ chối?");
    if (!token || !reason) return;
    try {
      await apiFetch<ApiAdminProduct>(`/api/admin/products/${id}/reject`, {
        method: "POST",
        token,
        body: JSON.stringify({ reason }),
      });
      await reload(token, tab);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout variant="admin" groups={adminNav} title="Sản phẩm" subtitle="Đang tải...">
        <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>
      </DashboardLayout>
    );
  }

  if (!token) {
    return (
      <DashboardLayout variant="admin" groups={adminNav} title="Sản phẩm" subtitle="">
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
      title="Duyệt sản phẩm"
      subtitle={`${items.length} sản phẩm trong tab "${TABS.find((t) => t.key === tab)?.label}"`}
    >
      <div className="rounded-2xl border border-border bg-bg-card">
        <div className="flex items-center gap-1 overflow-x-auto border-b border-border px-2 py-2 text-sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 ${tab === t.key ? "bg-brand text-white" : "text-text-muted hover:bg-bg-elev hover:text-text"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>
        ) : error ? (
          <div className="px-5 py-12 text-center text-sm text-warning">{error}</div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-text-muted">Không có sản phẩm nào.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3 text-right">Giá</th>
                <th className="px-4 py-3 text-right">Tồn</th>
                <th className="px-4 py-3 text-right">Đã bán</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Tạo lúc</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-bg-elev/30">
                  <td className="px-4 py-3">
                    <Link href={`/p/${p.slug}`} className="line-clamp-1 max-w-xs font-medium text-text hover:text-brand">{p.title}</Link>
                    <div className="text-[11px] text-text-muted">{p.categorySlug}</div>
                  </td>
                  <td className="px-4 py-3 text-text-muted">@{p.sellerUsername}</td>
                  <td className="num px-4 py-3 text-right font-semibold text-text">{formatVND(p.price)}</td>
                  <td className="num px-4 py-3 text-right text-text-muted">{p.stock}</td>
                  <td className="num px-4 py-3 text-right text-text-muted">{p.sold}</td>
                  <td className="px-4 py-3 text-center"><Badge tone={tone[p.status] ?? "muted"}>{p.status}</Badge></td>
                  <td className="px-4 py-3 text-right text-xs text-text-muted">{formatRelativeTime(p.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {p.status !== "Active" && (
                        <Button size="sm" variant="success" className="!h-8 !w-8 !px-0" onClick={() => onApprove(p.id)} title="Duyệt">
                          <Check className="size-3.5" />
                        </Button>
                      )}
                      {p.status !== "Rejected" && (
                        <Button size="sm" variant="danger" className="!h-8 !w-8 !px-0" onClick={() => onReject(p.id)} title="Từ chối">
                          <X className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
