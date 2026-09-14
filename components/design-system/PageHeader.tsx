import { Label } from './Typography';

// Design system page header: breadcrumbs (optional), H1, description,
// right-aligned actions. Consistent 24/32px rhythm across all dashboards.

export function PageHeader({
  crumbs,
  title,
  description,
  actions,
}: {
  crumbs?: string[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <Label className="mb-1.5">
            {crumbs.join(' / ')}
          </Label>
        )}
        <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.01em] text-[var(--fg)]">{title}</h1>
        {description && <p className="mt-1 max-w-xl text-[14px] leading-[1.5] text-[var(--muted)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </header>
  );
}
