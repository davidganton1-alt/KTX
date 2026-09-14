'use client';

// Design system sidebar: grouped nav, quiet icons, one active accent.
// Naming discipline: each item is a single word (or two max); section
// labels are 11px uppercase; the active item uses the gold tint, no bold
// color spam.

export type NavItem = {
  id: string;
  label: string;
  icon?: string; // svg path data
  badge?: number | string;
};

export type NavSection = {
  heading?: string;
  items: NavItem[];
};

export function Sidebar({
  brand,
  brandSub,
  sections,
  active,
  onSelect,
  footer,
}: {
  brand: string;
  brandSub?: string;
  sections: NavSection[];
  active: string;
  onSelect: (id: string) => void;
  footer?: React.ReactNode;
}) {
  return (
    <nav className="flex h-full w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--bg-soft)]">
      <div className="px-6 py-6">
        <p className="text-[16px] font-semibold tracking-[-0.01em] text-[var(--fg)]">{brand}</p>
        {brandSub && <p className="mt-0.5 text-[11px] uppercase tracking-[0.05em] text-[var(--muted)]">{brandSub}</p>}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {sections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-5' : ''}>
            {section.heading && (
              <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)]">
                {section.heading}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = active === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onSelect(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-colors ${
                        isActive
                          ? 'bg-[var(--gold)]/10 font-medium text-[var(--gold)]'
                          : 'text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--fg)]'
                      }`}
                    >
                      {item.icon && (
                        <svg className={`h-4 w-4 shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      )}
                      <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                      {item.badge !== undefined && item.badge !== 0 && (
                        <span className="rounded-full bg-[var(--gold)] px-1.5 py-0.5 text-[10px] font-semibold text-black">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {footer && <div className="border-t border-[var(--border)] px-3 py-4">{footer}</div>}
    </nav>
  );
}
