import { SiteShell } from "@/components/SiteShell";
import { CartView } from "./CartView";

export const metadata = { title: "Giỏ hàng | MMO Market" };

export default function CartPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-extrabold text-text md:text-3xl">Giỏ hàng</h1>
        <CartView />
      </div>
    </SiteShell>
  );
}
