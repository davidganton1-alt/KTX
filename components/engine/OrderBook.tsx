'use client';

export type OrderBookRow = { price: number; qty: number; total: number };
export type OrderBookData = { base: number; asks: OrderBookRow[]; bids: OrderBookRow[] };

export function OrderBook({ data }: { data: OrderBookData | null }) {
  if (!data) return <div className="py-10 text-center text-sm text-[var(--muted)]">Loading order book…</div>;
  const maxQty = Math.max(...data.asks.map((a) => a.qty), ...data.bids.map((b) => b.qty), 0.0001);
  const row = (o: OrderBookRow, side: 'ask' | 'bid') => (
    <div key={`${side}-${o.price}`} className="relative grid grid-cols-3 px-3 py-[3px] font-mono text-[11.5px] tabular-nums">
      <div className="absolute inset-y-0 right-0" style={{ width: `${(o.qty / maxQty) * 100}%`, background: side === 'ask' ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.12)' }} />
      <span className={side === 'ask' ? 'text-[#f87171]' : 'text-[#34d399]'}>{o.price.toFixed(2)}</span>
      <span className="text-right text-[var(--fg)]">{o.qty.toFixed(4)}</span>
      <span className="text-right text-[var(--muted)]">{o.total.toFixed(4)}</span>
    </div>
  );
  return (
    <div>
      <div className="grid grid-cols-3 px-3 pb-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
        <span>Price</span><span className="text-right">Qty</span><span className="text-right">Total</span>
      </div>
      <div>{data.asks.slice().reverse().map((a) => row(a, 'ask'))}</div>
      <div className="my-1 flex items-center justify-center gap-2 border-y border-[var(--border)] py-1.5">
        <span className="font-mono text-[15px] font-semibold tabular-nums text-[var(--fg)]">{data.base.toFixed(2)}</span>
        <span className="text-[10px] uppercase text-[var(--muted)]">BTC/USDT</span>
      </div>
      <div>{data.bids.map((b) => row(b, 'bid'))}</div>
    </div>
  );
}
