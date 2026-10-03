'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DataCard } from '@/components/design-system/DataCard';
import { StatCard } from '@/components/design-system/StatCard';
import { DataTable } from '@/components/design-system/DataTable';
import { AIEngineOrbit, OrbitPosition } from './AIEngineOrbit';

type Trade = {
  id: string;
  time: string;
  symbol: string;
  assetClass: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  pnl: number;
  status: 'open' | 'closed';
}

interface AIEngineDashboardProps {
  principal: number;
  platformCredit: number;
  tierRate: number;
  tier: string;
}

export function AIEngineDashboard({ principal, platformCredit, tierRate, tier }: AIEngineDashboardProps) {
  const [positions, setPositions] = useState<OrbitPosition[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [totalPnl, setTotalPnl] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const basis = principal + platformCredit;
  const dailyTarget = basis * tierRate;

  // Generate initial positions
  useEffect(() => {
    const assetClasses: Array<OrbitPosition['assetClass']> = ['crypto', 'stocks', 'commodities', 'forex'];
    const symbols: Record<OrbitPosition['assetClass'], string[]> = {
      crypto: ['BTC', 'ETH', 'SOL', 'XMR'],
      stocks: ['NVDA', 'AAPL', 'TSLA', 'MSFT'],
      commodities: ['XAU', 'XAG', 'CL', 'NG'],
      forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'],
    };
    const initialPositions: OrbitPosition[] = [];
    let idCounter = 0;
    for (let ring = 1; ring <= 4; ring++) {
      const assetClass = assetClasses[ring - 1];
      const classSymbols = symbols[assetClass];

      for (let i = 0; i < 3; i++) {
        const symbol = classSymbols[i];
        const side: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const entryPrice = Math.random() * 1000 + 100;
        const currentPrice = entryPrice * (1 + (Math.random() - 0.45) * 0.02);
        const quantity = Math.random() * 10;
        const pnl = (currentPrice - entryPrice) * quantity * (side === 'BUY' ? 1 : -1);
        initialPositions.push({
          id: `pos-${idCounter++}`,
          symbol,
          assetClass,
          side,
          quantity: parseFloat(quantity.toFixed(4)),
          entryPrice: parseFloat(entryPrice.toFixed(4)),
          currentPrice: parseFloat(currentPrice.toFixed(4)),
          pnl: parseFloat(pnl.toFixed(4)),
          pnlPercent: parseFloat(((pnl / (entryPrice * quantity)) * 100).toFixed(4)),
          orbitRadius: ring,
          orbitSpeed: 0.5 + Math.random() * 0.5,
          angle: Math.random() * Math.PI * 2,
        });
      }
    }
    setPositions(initialPositions);
    setTotalPnl(initialPositions.reduce((sum, p) => sum + p.pnl, 0));
  }, []);

  // Simulate trades to accumulate toward daily target
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTrades((prevTrades) => {
        const newTrade = generateTrade(dailyTarget, prevTrades.length);
        const updatedTrades = [...prevTrades, newTrade].slice(-20); // Keep last 20

        // Update total P&L to approach daily target
        setTotalPnl(updatedTrades.reduce((sum, t) => sum + t.pnl, 0));

        return updatedTrades;
      });
      // Update position prices slightly
      setPositions((prev) =>
        prev.map((pos) => {
          const priceChange = (Math.random() - 0.48) * 0.001;
          const newPrice = pos.currentPrice * (1 + priceChange);
          const newPnl = (newPrice - pos.entryPrice) * pos.quantity * (pos.side === 'BUY' ? 1 : -1);
          return {
            ...pos,
            currentPrice: parseFloat(newPrice.toFixed(4)),
            pnl: parseFloat(newPnl.toFixed(4)),
            pnlPercent: parseFloat(((newPnl / (pos.entryPrice * pos.quantity)) * 100).toFixed(4)),
          };
        })
      );
    }, 3000); // New trade every 3 seconds
    return () => clearInterval(interval);
  }, [isRunning, dailyTarget]);

  function generateTrade(target: number, tradeCount: number): Trade {
    const symbols = ['BTC', 'ETH', 'NVDA', 'AAPL', 'XAU', 'EUR/USD', 'SOL', 'TSLA'];
    const assetClasses = ['crypto', 'stocks', 'commodities', 'forex'];

    // Distribute target across ~24 trades per day
    const tradesPerDay = 24;
    const baseAmount = target / tradesPerDay;

    // Add variance: some trades win big, some lose small
    const isWin = Math.random() > 0.35; // 65% win rate
    const variance = 0.5 + Math.random() * 1.5;
    const pnl = isWin
      ? baseAmount * variance
      : -baseAmount * variance * 0.6; // Losses are smaller than wins
    return {
      id: `trade-${Date.now()}-${tradeCount}`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      assetClass: assetClasses[Math.floor(Math.random() * assetClasses.length)],
      side: Math.random() > 0.5 ? 'BUY' : 'SELL',
      quantity: parseFloat((Math.random() * 10).toFixed(4)),
      price: parseFloat((Math.random() * 1000 + 100).toFixed(4)),
      pnl: parseFloat(pnl.toFixed(4)),
      status: 'closed',
    };
  }

  const winRate = trades.length > 0
    ? (trades.filter((t) => t.pnl > 0).length / trades.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} context={`${trades.length} trades executed`} />
        <StatCard label="Open Positions" value={positions.length} context="Across 4 asset classes" />
        <StatCard
          label="Today's P&L"
          value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(4)}`}
          tone={totalPnl >= 0 ? 'profit' : 'error'}
          context={`Target: $${dailyTarget.toFixed(4)} (${(tierRate * 100).toFixed(2)}%)`}
        />
        <StatCard label="Basis" value={`$${basis.toFixed(2)}`} context={`${tier} tier @ ${(tierRate * 100).toFixed(2)}%/day`} />
      </div>

      {/* Orbital Visualization + Market Allocation */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DataCard title="AI Engine Orbital View" subtitle="Live positions across asset classes">
          <AIEngineOrbit positions={positions} isRunning={isRunning} />
        </DataCard>
        <DataCard title="Market Allocation" subtitle="Capital distribution by asset class">
          <div className="space-y-4">
            {(['crypto', 'stocks', 'commodities', 'forex'] as const).map((assetClass) => {
              const classPositions = positions.filter((p) => p.assetClass === assetClass);
              const classPnl = classPositions.reduce((sum, p) => sum + p.pnl, 0);
              const allocation = (classPositions.length / positions.length) * 100;
              return (
                <div key={assetClass} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium capitalize text-[var(--fg)]">{assetClass}</span>
                    <span className={`text-[13px] font-medium ${classPnl >= 0 ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}`}>
                      {classPnl >= 0 ? '+' : ''}${classPnl.toFixed(4)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--card)]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: assetClass === 'crypto' ? '#a855f7' : assetClass === 'stocks' ? '#3b82f6' : assetClass === 'commodities' ? '#f59e0b' : '#10b981',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${allocation}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">{allocation.toFixed(1)}% allocation · {classPositions.length} positions</p>
                </div>
              );
            })}
          </div>
        </DataCard>
      </div>

      {/* Trading History */}
      <DataCard title="Recent Trades" subtitle={`Accumulating toward $${dailyTarget.toFixed(4)} daily target`}>
        <DataTable
          rows={trades.slice(-10).reverse()}
          emptyText="No trades yet. The AI Engine is warming up..."
          columns={[
            { key: 'time', header: 'Time' },
            { key: 'symbol', header: 'Asset' },
            { key: 'side', header: 'Side', render: (r: Trade) => <span className={r.side === 'BUY' ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}>{r.side}</span> },
            { key: 'quantity', header: 'Quantity', align: 'right', render: (r: Trade) => r.quantity.toFixed(4) },
            { key: 'price', header: 'Price', align: 'right', render: (r: Trade) => `$${r.price.toFixed(4)}` },
            { key: 'pnl', header: 'P&L', align: 'right', render: (r: Trade) => (
              <span className={r.pnl >= 0 ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}>
                {r.pnl >= 0 ? '+' : ''}${r.pnl.toFixed(4)}
              </span>
            )},
          ]}
        />
      </DataCard>

      {/* Position Details */}
      <DataCard title="Open Positions" subtitle={`${positions.length} active positions`}>
        <DataTable
          rows={positions.slice(0, 8)}
          emptyText="No open positions."
          columns={[
            { key: 'symbol', header: 'Asset' },
            { key: 'assetClass', header: 'Class', render: (r: OrbitPosition) => <span className="capitalize">{r.assetClass}</span> },
            { key: 'side', header: 'Side', render: (r: OrbitPosition) => <span className={r.side === 'BUY' ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}>{r.side}</span> },
            { key: 'quantity', header: 'Qty', align: 'right', render: (r: OrbitPosition) => r.quantity.toFixed(4) },
            { key: 'entryPrice', header: 'Entry', align: 'right', render: (r: OrbitPosition) => `$${r.entryPrice.toFixed(4)}` },
            { key: 'currentPrice', header: 'Current', align: 'right', render: (r: OrbitPosition) => `$${r.currentPrice.toFixed(4)}` },
            { key: 'pnl', header: 'P&L', align: 'right', render: (r: OrbitPosition) => (
              <span className={r.pnl >= 0 ? 'text-[var(--profit)]' : 'text-[var(--loss)]'}>
                {r.pnl >= 0 ? '+' : ''}${r.pnl.toFixed(4)}
              </span>
            )},
          ]}
        />
      </DataCard>
    </div>
  );
}
