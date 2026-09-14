import { Label, Num } from './Typography';

// Stat card — the answer to "ugly big numbers".
// Hierarchy: label (11px uppercase) > value (20px) > context (12px).
// Phase 1.5: ds-card surface with micro-gradient + shadow.

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
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  context?: React.ReactNode;
  tone?: StatTone;
  align?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
}) {
  const Comp: any = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={`ds-card rounded-xl px-5 py-4 text-left ${onClick ? 'ds-card-interactive cursor-pointer' : ''} ${
        align === 'right' ? 'text-right' : ''
      } ${className}`}
    >
      <Label>{label}</Label>
      <div className="mt-1.5">
        <Num className={toneClass[tone]}>{value}</Num>
      </div>
      {context && <p className="mt-1 text-[12px] leading-[1.5] text-[var(--muted)]">{context}</p>}
    </Comp>
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
