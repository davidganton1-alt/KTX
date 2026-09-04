import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { PriceTicker } from "@/components/PriceTicker";
import Link from "next/link";
import { SiteBackground } from "@/components/SiteBackground";

export const metadata: Metadata = {
  title: "KingdomTradeX — Faith-aligned AI Trade Engine",
  description:
    "KingdomTradeX puts AI to work on your crypto, US stocks and commodities. Fund a plan, watch profit grow daily, and withdraw your earnings with wisdom.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/logo-128.png", sizes: "128x128", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "KingdomTradeX — Faith-aligned AI Trade Engine",
    description:
      "AI trading with wisdom, not hype. Fund a plan, watch profit grow daily, and withdraw your earnings with stewardship.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="theme-night" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SiteBackground />
          <PriceTicker />
          <Navbar />
          {children}
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}

