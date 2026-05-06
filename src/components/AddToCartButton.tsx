"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/AuthContext";
import { apiFetch } from "@/lib/api";

export function AddToCartButton({
  productId,
  variant = "primary",
  size = "lg",
  redirectTo,
  className,
  label = "Thêm vào giỏ",
}: {
  productId: string;
  variant?: "primary" | "outline" | "ghost" | "danger" | "success" | "soft";
  size?: "sm" | "md" | "lg";
  redirectTo?: string;
  className?: string;
  label?: string;
}) {
  const { token } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [err, setErr] = useState<string | null>(null);

  const onClick = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setState("loading");
    setErr(null);
    try {
      await apiFetch("/api/cart", {
        method: "POST",
        token,
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setState("ok");
      if (redirectTo) router.push(redirectTo);
      else setTimeout(() => setState("idle"), 1500);
    } catch (e) {
      setState("err");
      setErr(e instanceof Error ? e.message : "Lỗi");
      setTimeout(() => setState("idle"), 2500);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={onClick}
        disabled={state === "loading"}
        variant={variant}
        size={size}
        className={className}
        leftIcon={
          state === "loading" ? <Loader2 className="size-4 animate-spin" /> :
          state === "ok" ? <Check className="size-4" /> :
          <ShoppingCart className="size-4" />
        }
      >
        {state === "ok" ? "Đã thêm!" : state === "err" ? "Lỗi, thử lại" : label}
      </Button>
      {err && <p className="text-xs text-danger">{err}</p>}
    </div>
  );
}
