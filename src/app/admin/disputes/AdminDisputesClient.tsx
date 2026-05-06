"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageSquare } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { adminNav } from "@/lib/adminNav";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ApiDisputeDetail, ApiDisputeListItem } from "@/lib/apiTypes";
import { formatRelativeTime } from "@/lib/format";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "Open", label: "Mở" },
  { key: "Investigating", label: "Đang điều tra" },
  { key: "Resolved", label: "Đã giải quyết" },
];

const tone: Record<string, "success" | "warning" | "danger" | "muted"> = {
  Open: "warning",
  Investigating: "warning",
  Resolved: "success",
  Rejected: "danger",
};

export function AdminDisputesClient() {
  const { token, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState<ApiDisputeListItem[]>([]);
  const [active, setActive] = useState<ApiDisputeDetail | null>(null);
  const [reply, setReply] = useState("");
  const [resolution, setResolution] = useState("");
  const [action, setAction] = useState("release_seller");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = async (tk?: string | null, t?: string) => {
    if (!tk) return;
    try {
      const filter = (t ?? tab) === "all" ? "" : `?status=${t ?? tab}`;
      const list = await apiFetch<ApiDisputeListItem[]>(`/api/admin/disputes${filter}`, { token: tk });
      setItems(list);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    void reload(token, tab).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tab]);

  const openDetail = async (id: string) => {
    if (!token) return;
    try {
      const d = await apiFetch<ApiDisputeDetail>(`/api/disputes/${id}`, { token });
      setActive(d);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const sendReply = async () => {
    if (!token || !active || !reply.trim()) return;
    setBusy(true);
    try {
      await apiFetch(`/api/disputes/${active.id}/messages`, {
        method: "POST",
        token,
        body: JSON.stringify({ body: reply }),
      });
      setReply("");
      await openDetail(active.id);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const resolve = async () => {
    if (!token || !active) return;
    if (!resolution.trim()) {
      alert("Hãy điền kết luận trước khi resolve.");
      return;
    }
    setBusy(true);
    try {
      await apiFetch(`/api/admin/disputes/${active.id}/resolve`, {
        method: "POST",
        token,
        body: JSON.stringify({ resolution, action }),
      });
      setActive(null);
      setResolution("");
      await reload(token, tab);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout variant="admin" groups={adminNav} title="Tranh chấp" subtitle="Đang tải...">
        <div className="grid place-items-center py-20"><Loader2 className="size-6 animate-spin text-text-muted" /></div>
      </DashboardLayout>
    );
  }

  if (!token) {
    return (
      <DashboardLayout variant="admin" groups={adminNav} title="Tranh chấp" subtitle="">
        <div className="rounded-2xl border border-border bg-bg-card p-12 text-center">
          <p className="text-sm text-text-muted">Vui lòng <Link href="/login" className="text-accent hover:underline">đăng nhập</Link>.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      variant="admin"
      groups={adminNav}
      title="Tranh chấp"
      subtitle={`${items.length} dispute`}
    >
      {error && <div className="mb-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-2 rounded-2xl border border-border bg-bg-card">
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
          {items.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-text-muted">Không có dispute.</div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((d) => (
                <li
                  key={d.id}
                  onClick={() => openDetail(d.id)}
                  className={`cursor-pointer px-4 py-3 hover:bg-bg-elev/40 ${active?.id === d.id ? "bg-bg-elev/60" : ""}`}
                >
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span className="font-mono">{d.code}</span>
                    <Badge tone={tone[d.status] ?? "muted"}>{d.status}</Badge>
                  </div>
                  <div className="mt-1 line-clamp-1 text-sm font-medium text-text">{d.title}</div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-text-muted">
                    <span className="font-mono">Đơn: {d.orderCode}</span>
                    <span>{formatRelativeTime(d.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-3 rounded-2xl border border-border bg-bg-card p-5">
          {!active ? (
            <div className="grid h-64 place-items-center text-sm text-text-muted">
              <div className="text-center">
                <MessageSquare className="mx-auto mb-3 size-10 text-text-dim" />
                <p>Chọn 1 dispute từ bên trái để xem chi tiết.</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-text-muted font-mono">{active.code} · Đơn {active.orderCode}</div>
                  <h3 className="mt-1 text-base font-bold text-text">{active.title}</h3>
                </div>
                <Badge tone={tone[active.status] ?? "muted"}>{active.status}</Badge>
              </div>
              <p className="mt-3 rounded-lg border border-border bg-bg-elev p-3 text-sm text-text-muted">
                {active.body}
              </p>

              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
                {active.messages.length === 0 ? (
                  <p className="text-xs text-text-muted">Chưa có tin nhắn.</p>
                ) : (
                  active.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`rounded-lg p-3 text-sm ${
                        m.authorRole === "Admin" ? "bg-brand/10 border border-brand/30" :
                        m.authorRole === "Buyer" ? "bg-bg-elev" :
                        "bg-accent/10 border border-accent/30"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span className="font-medium">{m.authorRole} · {m.authorName}</span>
                        <span>{formatRelativeTime(m.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-text whitespace-pre-wrap">{m.body}</p>
                    </div>
                  ))
                )}
              </div>

              {active.status !== "Resolved" && (
                <>
                  <div className="mt-4 space-y-2">
                    <textarea
                      rows={2}
                      placeholder="Tin nhắn admin..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg-elev p-3 text-sm text-text outline-none focus:border-brand"
                    />
                    <Button size="sm" variant="outline" onClick={sendReply} disabled={busy || !reply.trim()}>Gửi tin nhắn</Button>
                  </div>

                  <div className="mt-6 rounded-lg border border-warning/30 bg-warning/5 p-3">
                    <h4 className="text-sm font-bold text-warning">Resolve dispute</h4>
                    <select
                      className="mt-2 h-9 w-full rounded-lg border border-border bg-bg-card px-3 text-sm text-text"
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                    >
                      <option value="release_seller">Giải phóng cho seller (escrow → seller)</option>
                      <option value="refund_buyer">Hoàn tiền 100% cho buyer</option>
                      <option value="partial_refund">Hoàn tiền một phần (50/50)</option>
                    </select>
                    <textarea
                      rows={2}
                      placeholder="Kết luận của admin (sẽ public)"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-border bg-bg-card p-3 text-sm text-text outline-none focus:border-brand"
                    />
                    <Button size="sm" variant="danger" className="mt-2 w-full" onClick={resolve} disabled={busy}>Kết thúc dispute</Button>
                  </div>
                </>
              )}

              {active.resolution && (
                <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
                  <p className="font-bold text-success">Kết luận</p>
                  <p className="mt-1 text-text">{active.resolution}</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
