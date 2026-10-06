import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { PriceTicker } from "@/components/PriceTicker";
import Link from "next/link";
import { SiteBackground } from "@/components/SiteBackground";
import { JsonLd } from "@/components/JsonLd";
import { LazyChrome } from "@/components/LazyChrome";
import Script from "next/script";

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kingdomtradex.com'),
  title: {
    default: "KingdomTradeX: Faith-aligned AI Trade Engine",
    template: '%s | KingdomTradeX',
  },
  description:
    "KingdomTradeX puts AI to work on your crypto, US stocks and commodities. Fund a plan, watch profit grow daily, and withdraw your earnings with wisdom.",
  keywords: ['AI trading', 'crypto trading', 'USDT', 'automated trading', 'profit sharing'],
  authors: [{ name: 'KingdomTradeX' }],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/logo-128.png", sizes: "128x128", type: "image/png" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "KingdomTradeX: Faith-aligned AI Trade Engine",
    description:
      "AI trading with wisdom, not hype. Fund a plan, watch profit grow daily, and withdraw your earnings with stewardship.",
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "KingdomTradeX: Faith-aligned AI Trade Engine",
    description:
      "AI trading with wisdom, not hype. Fund a plan, watch profit grow daily, and withdraw your earnings with stewardship.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0e27',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`theme-night ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <JsonLd />
        <ThemeProvider>
          <SiteBackground />
          <LazyChrome />
          <PriceTicker />
          <Navbar />
          {children}
          <SiteFooter />
        </ThemeProvider>
        <Script
          src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

