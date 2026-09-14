import { Label, Num } from './Typography';

// Stat card — the answer to "ugly big numbers".
// Hierarchy is label (11px uppercase) > value (20px) > context (12px).
// The value is NEVER the biggest thing on the page; only page titles
// use Display/hero size. Tone is used sparingly: one accent at a time.

export type StatTone = 'default' | 'profit' | 'gold' | 'warning' | 'error' | 'muted';

const toneClass: Record<StatTone, string> = {
  default: 'text-[var(--fg)]',
  profit: 'text-[var(--profit)]',
  gold: 'text-[var(--gold)]',
  warning: 'text-[var(--gold)]',
  error: 'text-[#F87171]',
  muted: 'text-[var(--muted)]',
};

export function StatCard({
  label,
  value,
  context,
  tone = 'default',
  align = 'left',
  className = '',
}: {
  label: string;
  value: React.ReactNode;
  context?: React.ReactNode;
  tone?: StatTone;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] px-5 py-4 ${align === 'right' ? 'text-right' : ''} ${className}`}>
      <Label>{label}</Label>
      <div className="mt-1.5">
        <Num className={toneClass[tone]}>{value}</Num>
      </div>
      {context && <p className="mt-1 text-[12px] leading-[1.5] text-[var(--muted)]">{context}</p>}
    </div>
  );
}

// Compact inline stat for headers/summaries (no card, value+label on one row)
export function StatInline({ label, value, tone = 'default' }: { label: string; value: React.ReactNode; tone?: StatTone }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[12px] text-[var(--muted)]">{label}</span>
      <span className={`text-[14px] font-medium tabular-nums ${toneClass[tone]}`}>{value}</span>
    </div>
  );
}
