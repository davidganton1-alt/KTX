// Design System — typography primitives (Dashboard Redesign Phase 1)
// One source of truth for type scale. Use these instead of ad-hoc
// text-3xl/4xl classes inside dashboards.

export function Display({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  // hero figure (page title area only) — 32px/600, tight tracking
  return <div className={`text-[32px] leading-[1.1] font-semibold tracking-[-0.02em] text-[var(--fg)] ${className}`}>{children}</div>;
}

export function H1({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h1 className={`text-[24px] leading-tight font-semibold tracking-[-0.01em] text-[var(--fg)] ${className}`}>{children}</h1>;
}

export function H2({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-[20px] leading-snug font-medium text-[var(--fg)] ${className}`}>{children}</h2>;
}

export function H3({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-[16px] leading-snug font-medium text-[var(--fg)] ${className}`}>{children}</h3>;
}

export function Body({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[14px] leading-[1.5] font-normal text-[var(--fg)] ${className}`}>{children}</p>;
}

export function Small({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[12px] leading-[1.5] font-normal text-[var(--muted)] ${className}`}>{children}</p>;
}

export function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`block text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)] ${className}`}>
      {children}
    </span>
  );
}

// Tabular figures for every money/number surface — columns must align.
export function Num({ children, className = '', size = 'value' }: { children: React.ReactNode; className?: string; size?: 'value' | 'hero' | 'inline' }) {
  const s = size === 'hero'
    ? 'text-[28px] leading-tight font-medium tracking-[-0.01em]'
    : size === 'inline'
      ? 'text-[14px] leading-[1.5] font-medium'
      : 'text-[20px] leading-snug font-medium tracking-[-0.01em]';
  return <span className={`font-inter tabular-nums text-[var(--fg)] ${s} ${className}`}>{children}</span>;
}
