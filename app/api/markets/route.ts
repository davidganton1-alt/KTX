import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Asset = {
  id: string;
  symbol: string;
  name: string;
  class: "Crypto" | "US Stocks" | "Commodities";
  price: number;
  change24h: number | null;
  marketCap: number | null;
  image?: string;
};

// Fallback data so the page always renders (used if a live fetch fails).
const FALLBACK: Asset[] = [
  // Crypto
  { id: "btc", symbol: "BTC", name: "Bitcoin", class: "Crypto", price: 78314, change24h: 2.1, marketCap: 1546000000000 },
  { id: "eth", symbol: "ETH", name: "Ethereum", class: "Crypto", price: 2522, change24h: 1.8, marketCap: 303000000000 },
  { id: "sol", symbol: "SOL", name: "Solana", class: "Crypto", price: 184, change24h: -0.9, marketCap: 86000000000 },
  { id: "usdc", symbol: "USDC", name: "USD Coin", class: "Crypto", price: 1, change24h: 0.0, marketCap: 34000000000 },
  // US Stocks
  { id: "aapl", symbol: "AAPL", name: "Apple Inc.", class: "US Stocks", price: 229.87, change24h: 1.2, marketCap: 3480000000000 },
  { id: "msft", symbol: "MSFT", name: "Microsoft Corp.", class: "US Stocks", price: 421.32, change24h: 0.8, marketCap: 3130000000000 },
  { id: "nvda", symbol: "NVDA", name: "NVIDIA Corp.", class: "US Stocks", price: 138.45, change24h: 2.6, marketCap: 3390000000000 },
  { id: "tsla", symbol: "TSLA", name: "Tesla Inc.", class: "US Stocks", price: 248.91, change24h: -1.4, marketCap: 793000000000 },
  { id: "amzn", symbol: "AMZN", name: "Amazon.com", class: "US Stocks", price: 201.3, change24h: 0.5, marketCap: 2110000000000 },
  { id: "googl", symbol: "GOOGL", name: "Alphabet Inc.", class: "US Stocks", price: 175.6, change24h: 0.9, marketCap: 2150000000000 },
  { id: "meta", symbol: "META", name: "Meta Platforms", class: "US Stocks", price: 562.4, change24h: 1.7, marketCap: 1420000000000 },
  { id: "jpm", symbol: "JPM", name: "JPMorgan Chase", class: "US Stocks", price: 243.1, change24h: -0.3, marketCap: 690000000000 },
  { id: "v", symbol: "V", name: "Visa Inc.", class: "US Stocks", price: 312.8, change24h: 0.4, marketCap: 620000000000 },
  { id: "wmt", symbol: "WMT", name: "Walmart Inc.", class: "US Stocks", price: 94.2, change24h: 0.6, marketCap: 760000000000 },
  { id: "dis", symbol: "DIS", name: "Walt Disney Co.", class: "US Stocks", price: 112.5, change24h: -0.8, marketCap: 203000000000 },
  { id: "ko", symbol: "KO", name: "Coca-Cola Co.", class: "US Stocks", price: 62.3, change24h: 0.2, marketCap: 268000000000 },
  // Commodities
  { id: "gold", symbol: "XAU", name: "Gold (oz)", class: "Commodities", price: 2648.5, change24h: 0.3, marketCap: null },
  { id: "silver", symbol: "XAG", name: "Silver (oz)", class: "Commodities", price: 30.8, change24h: -0.2, marketCap: null },
  { id: "oil", symbol: "WTI", name: "Crude Oil (WTI)", class: "Commodities", price: 71.2, change24h: 1.1, marketCap: null },
  { id: "natgas", symbol: "NG", name: "Natural Gas", class: "Commodities", price: 3.05, change24h: -1.8, marketCap: null },
  { id: "wheat", symbol: "WHEAT", name: "Wheat", class: "Commodities", price: 5.62, change24h: 0.6, marketCap: null },
  { id: "copper", symbol: "COPPER", name: "Copper", class: "Commodities", price: 4.18, change24h: 0.9, marketCap: null },
  { id: "corn", symbol: "CORN", name: "Corn", class: "Commodities", price: 4.31, change24h: -0.4, marketCap: null },
  { id: "coffee", symbol: "COFFEE", name: "Coffee", class: "Commodities", price: 2.42, change24h: 1.3, marketCap: null },
  { id: "sugar", symbol: "SUGAR", name: "Sugar", class: "Commodities", price: 0.19, change24h: -0.7, marketCap: null },
];

async function cryptoLive(): Promise<Asset[]> {
  try {
    const url =
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=false&price_change_percentage=24h";
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(t);
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    return (data as any[]).slice(0, 6).map((c) => ({
      id: c.id,
      symbol: (c.symbol || "").toUpperCase(),
      name: c.name,
      class: "Crypto" as const,
      price: c.current_price,
      change24h: c.price_change_percentage_24h ?? null,
      marketCap: c.market_cap ?? null,
      image: c.image,
    }));
  } catch {
    return FALLBACK.filter((a) => a.class === "Crypto");
  }
}

export async function GET() {
  const crypto = await cryptoLive();
  const stocks = FALLBACK.filter((a) => a.class === "US Stocks");
  const commodities = FALLBACK.filter((a) => a.class === "Commodities");
  const all = [...crypto, ...stocks, ...commodities];
  return NextResponse.json(
    { assets: all, classes: ["Crypto", "US Stocks", "Commodities"] },
    { headers: { "Cache-Control": "no-store" } }
  );
}
