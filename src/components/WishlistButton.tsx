"use client";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/WishlistContext";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export function WishlistButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const { user } = useAuth();
  const { isInWishlist, toggle } = useWishlist();
  const router = useRouter();
  const active = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { router.push("/login"); return; }
    toggle(productId);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={active ? "Bỏ yêu thích" : "Thêm yêu thích"}
      className={`grid place-items-center rounded-full transition-all ${className} ${
        active
          ? "bg-danger/15 text-danger hover:bg-danger/25"
          : "bg-black/30 text-white/70 hover:bg-black/50 hover:text-white"
      }`}
    >
      <Heart className={`size-4 transition-all ${active ? "fill-danger" : ""}`} />
    </button>
  );
}
