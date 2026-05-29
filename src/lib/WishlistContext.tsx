"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiFetch } from "./api";
import { useAuth } from "./AuthContext";

type WishlistCtx = {
  ids: Set<string>;
  isInWishlist: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  loading: boolean;
};

const Ctx = createContext<WishlistCtx | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { token, loading: authLoading } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!token) { setIds(new Set()); return; }
    try {
      setLoading(true);
      const data = await apiFetch<string[]>("/api/wishlist/ids", { token });
      setIds(new Set(data));
    } catch {
      // silently fail — wishlist is non-critical
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const toggle = useCallback(async (productId: string) => {
    if (!token) return;
    // Optimistic update
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
    try {
      await apiFetch(`/api/wishlist/${productId}`, { method: "POST", token });
    } catch {
      // Rollback on failure
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId);
        else next.add(productId);
        return next;
      });
    }
  }, [token]);

  return (
    <Ctx.Provider value={{ ids, isInWishlist: (id) => ids.has(id), toggle, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
