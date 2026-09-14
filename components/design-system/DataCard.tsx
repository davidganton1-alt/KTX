// Design system data card: title row + optional actions + content.
// Phase 1.5: ds-card surface (micro-gradient + soft shadow), rounded-xl
// consistent, optional interactive lift.

export function DataCard({
  title,
  subtitle,
  actions,
  children,
  className = '',
  padded = true,
  interactive = false,
  onClick,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}) {
  return (
    <section
      onClick={onClick}
      className={`ds-card rounded-xl ${interactive ? 'ds-card-interactive' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 px-6 pb-1 pt-5">
          <div className="min-w-0">
            {title && <h3 className="text-[16px] font-medium leading-snug text-[var(--fg)]">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[12px] text-[var(--muted)]">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={padded ? 'px-6 py-5' : 'py-1'}>{children}</div>
    </section>
  );
}
