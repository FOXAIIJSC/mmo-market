import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import logoMmoMarket from "@/assets/images/logo_mmo_market.png";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-semibold text-text",
        className,
      )}
    >
      <Image
        src={logoMmoMarket}
        alt="MMO Market"
        priority
        className="h-9 w-9 rounded-xl object-contain shadow-lg shadow-brand/30"
      />
      <span className="leading-tight">
        <span className="block text-xs uppercase tracking-widest text-text-muted">
          Sàn
        </span>
        <span className="block text-base font-bold">MMO Market</span>
      </span>
    </Link>
  );
}
