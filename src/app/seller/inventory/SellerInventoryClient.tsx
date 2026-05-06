"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Database, Loader2, Upload } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { sellerNav } from "@/lib/sellerNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiSellerInventoryView, ApiSellerProduct } from "@/lib/apiTypes";
import { formatRelativeTime } from "@/lib/format";

export function SellerInventoryClient() {
  const { token, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<ApiSellerProduct[]>([]);
  const [productId, setProductId] = useState<string | null>(null);
  const [view, setView] = useState<ApiSellerInventoryView | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<ApiSellerProduct[]>("/api/seller/products", { token })
      .then((p) => {
        setProducts(p);
        const first = p.find((pp) => pp.delivery === "Auto" || pp.delivery === "Hybrid") ?? p[0];
        if (first) setProductId(first.id);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !productId) return;
    apiFetch<ApiSellerInventoryView>(`/api/seller/inventory/${productId}`, { token })
      .then((v) => setView(v))
      .catch((e: Error) => setError(e.message));
  }, [token, productId]);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !productId) return;
    const lines = items.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      alert("Hãy nhập ít nhất 1 mục (mỗi dòng = 1 tài khoản/code).");
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await apiFetch<{ added: number }>(`/api/seller/inventory/${productId}/upload`, {
        method: "POST",
        token,
        body: JSON.stringify({ items: lines }),
      });
      setMsg(`Đã thêm ${res.added}/${lines.length} mục (loại trùng tự động).`);
      setItems("");
      const v = await apiFetch<ApiSellerInventoryView>(`/api/seller/inventory/${productId}`, { token });
      setView(v);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout variant="seller" groups={sellerNav} title="Kho auto-delivery" subtitle="Đang tải...">
        <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>
      </DashboardLayout>
    );
  }

  if (!token) {
    return (
      <DashboardLayout variant="seller" groups={sellerNav} title="Kho auto-delivery" subtitle="">
        <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
          <p className="text-sm text-text-muted">Vui lòng <Link href="/login" className="text-accent hover:underline">đăng nhập</Link>.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout variant="seller" groups={sellerNav} title="Kho auto-delivery" subtitle="">
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-6 text-sm text-warning">{error}</div>
      </DashboardLayout>
    );
  }

  if (products.length === 0) {
    return (
      <DashboardLayout variant="seller" groups={sellerNav} title="Kho auto-delivery" subtitle="">
        <div className="rounded-2xl border border-border bg-bg-card p-12 text-center text-sm text-text-muted">
          Bạn chưa có sản phẩm nào. <Link href="/seller/products" className="text-accent hover:underline">Tạo sản phẩm</Link> trước.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      variant="seller"
      groups={sellerNav}
      title="Kho auto-delivery"
      subtitle="Mỗi dòng = 1 tài khoản / gift code · trùng SHA-256 sẽ bị bỏ"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Có sẵn" value={String(view?.available ?? 0)} icon={<Database className="size-4" />} tone="brand" />
        <Stat label="Đang giữ chỗ" value={String(view?.reserved ?? 0)} tone="warning" />
        <Stat label="Đã giao" value={String(view?.soldCount ?? 0)} tone="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <form onSubmit={onUpload} className="lg:col-span-1 rounded-2xl border border-border bg-bg-card p-5">
          <h3 className="text-sm font-bold text-text">Upload kho</h3>
          <label className="mt-3 block text-xs text-text-muted">
            Sản phẩm
            <select
              className="mt-1 h-9 w-full rounded-lg border border-border bg-bg-elev px-3 text-sm text-text outline-none focus:border-brand"
              value={productId ?? ""}
              onChange={(e) => setProductId(e.target.value || null)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-xs text-text-muted">
            Mỗi dòng = 1 tài khoản (định dạng tự do, ví dụ: <code>email|password</code> hoặc gift code)
            <textarea
              rows={10}
              className="mt-1 w-full rounded-lg border border-border bg-bg-elev p-3 font-mono text-xs text-text outline-none focus:border-brand"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="user1@mail.com|pass123\nXXXX-YYYY-ZZZZ-1234"
            />
          </label>
          <Button type="submit" size="sm" className="mt-3 w-full" disabled={submitting} leftIcon={<Upload className="size-3.5" />}>
            {submitting ? "Đang tải..." : "Upload"}
          </Button>
          {msg && <p className="mt-2 text-xs text-success">{msg}</p>}
        </form>

        <section className="lg:col-span-2 rounded-2xl border border-border bg-bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-sm font-bold text-text">Mục trong kho · {view?.items.length ?? 0}</h3>
          </div>
          {!view || view.items.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-text-muted">Kho trống.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-text-muted">
                <tr>
                  <th className="px-4 py-3">Mã</th>
                  <th className="px-4 py-3">Preview</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Tạo lúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {view.items.slice(0, 50).map((it) => (
                  <tr key={it.id} className="hover:bg-bg-elev/30">
                    <td className="px-4 py-3 font-mono text-[11px] text-text-muted">{it.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text">{it.preview}</td>
                    <td className="px-4 py-3 text-center">
                      {it.sold ? <Badge tone="success">Đã giao</Badge> : it.reserved ? <Badge tone="warning">Đang giữ</Badge> : <Badge tone="muted">Có sẵn</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-text-muted">{formatRelativeTime(it.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
