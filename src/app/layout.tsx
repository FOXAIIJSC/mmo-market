import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { WishlistProvider } from "@/lib/WishlistContext";
import { NotificationProvider } from "@/lib/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MMO Market — Sàn TMĐT chuyên biệt MMO",
  description:
    "Sàn thương mại điện tử cho cộng đồng Make Money Online: tài khoản AI, tool, khoá học, gift card, tài khoản & skin game. Giao dịch escrow an toàn, minh bạch.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg text-text" suppressHydrationWarning>
        <AuthProvider><WishlistProvider><NotificationProvider>{children}</NotificationProvider></WishlistProvider></AuthProvider>
      </body>
    </html>
  );
}
