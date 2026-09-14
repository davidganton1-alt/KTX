'use client';

import { useMemo, useState } from 'react';

// Design system table: 11px uppercase header, 14px rows, hairline borders,
// hover state, optional client-side sort + pagination. Dense but calm.

export type Column<T> = {
  key: string;
  header: string;
  align?: 'left' | 'right';
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  value?: (row: T) => string | number; // for sorting; falls back to row[key]
  width?: string;
};

export function DataTable<T extends Record<string, any>>({
  columns,
  rows,
  pageSize = 10,
  emptyText = 'Nothing to show yet.',
  keyField = 'id',
}: {
  columns: Column<T>[];
  rows: T[];
  pageSize?: number;
  emptyText?: string;
  keyField?: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const val = (r: T) => (col.value ? col.value(r) : r[col.key]);
    return [...rows].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sort.dir;
      return String(va ?? '').localeCompare(String(vb ?? '')) * sort.dir;
    });
  }, [rows, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className={`px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--muted)] ${c.align === 'right' ? 'text-right' : ''}`}
                >
                  {c.sortable ? (
                    <button
                      className="inline-flex items-center gap-1 hover:text-[var(--fg)]"
                      onClick={() =>
                        setSort((s) => (s?.key === c.key ? (s.dir === 1 ? { key: c.key, dir: -1 } : null) : { key: c.key, dir: 1 }))
                      }
                    >
                      {c.header}
                      <span className="text-[9px]">{sort?.key === c.key ? (sort.dir === 1 ? '▲' : '▼') : '↕'}</span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-[12px] text-[var(--muted)]">
                  {emptyText}
                </td>
              </tr>
            )}
            {pageRows.map((r, i) => (
              <tr key={r[keyField] ?? i} className="border-b border-[var(--border)] last:border-0 transition-colors hover:bg-[var(--card)]">
                {columns.map((c) => (
                  <td key={c.key} className={`px-3 py-2.5 tabular-nums ${c.align === 'right' ? 'text-right' : ''}`}>
                    {c.render ? c.render(r) : String(r[c.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between px-3 pt-3 text-[12px] text-[var(--muted)]">
          <span>
            Page {page + 1} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-md border border-[var(--border)] px-2.5 py-1 hover:border-[var(--gold)] disabled:opacity-30"
            >
              Prev
            </button>
            <button
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              className="rounded-md border border-[var(--border)] px-2.5 py-1 hover:border-[var(--gold)] disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Small status pill used in table cells
export function StatusPill({ tone, children }: { tone: 'green' | 'gold' | 'red' | 'cyan' | 'muted'; children: React.ReactNode }) {
  const cls = {
    green: 'border-[var(--profit)]/40 text-[var(--profit)]',
    gold: 'border-[var(--gold)]/40 text-[var(--gold)]',
    red: 'border-[#F87171]/40 text-[#F87171]',
    cyan: 'border-[#22D3EE]/40 text-[#22D3EE]',
    muted: 'border-[var(--border)] text-[var(--muted)]',
  }[tone];
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.04em] ${cls}`}>
      {children}
    </span>
  );
}
