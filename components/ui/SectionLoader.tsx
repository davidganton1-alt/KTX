'use client';

export function SectionLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
          <div className="absolute inset-2 animate-spin rounded-full border-2 border-[var(--border)] border-b-transparent [animation-direction:reverse]" />
        </div>
        <span className="text-[12px] uppercase tracking-[0.1em] text-[var(--muted)]">{label}</span>
      </div>
    </div>
  );
}
