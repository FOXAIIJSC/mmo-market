import { SiteShell } from "@/components/SiteShell";
import { CheckoutView } from "./CheckoutView";

export const metadata = { title: "Thanh toán | MMO Market" };

export default function CheckoutPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-1 text-2xl font-extrabold text-text md:text-3xl">Thanh toán</h1>
        <CheckoutView />
      </div>
    </SiteShell>
  );
}
