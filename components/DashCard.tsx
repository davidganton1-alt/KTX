// Static card for dashboards — NO hover animation, NO mouse tracking.
// Clean, sharp, professional. Just a glass panel with a border.

export function DashCard({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <div id={id} className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] ${className}`}>
      {children}
    </div>
  );
}
