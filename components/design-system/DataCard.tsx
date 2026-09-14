// Design system data card: title row + optional actions + content.
// 24px padding, hairline border, no shadows, no hover animation.

export function DataCard({
  title,
  subtitle,
  actions,
  children,
  className = '',
  padded = true,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] ${className}`}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-1">
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
