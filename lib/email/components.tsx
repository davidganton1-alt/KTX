import * as React from 'react';

// Email-safe building blocks: tables only, inline styles only, no flex/grid.
// Design tokens mirror the dashboard system (ivory/ink/gold/green).

export const INK = '#1a1e33';
export const MUTED = '#6b7086';
export const GOLD = '#a8760a';
export const GREEN = '#059669';
export const RED = '#dc2626';
export const LINE = '#e5e7eb';
export const IVORY = '#f7f6f1';

export function Heading({ children, level = 2 }: { children: React.ReactNode; level?: 1 | 2 | 3 }) {
  const sizes = { 1: '28px', 2: '22px', 3: '18px' };
  const weights = { 1: 600, 2: 600, 3: 500 };
  return React.createElement(`h${level}`, {
    style: { margin: '0 0 16px', fontSize: sizes[level], fontWeight: weights[level], color: INK, lineHeight: 1.3 },
  }, children);
}

export function Text({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p style={{ margin: '0 0 16px', fontSize: '15px', lineHeight: 1.6, color: muted ? MUTED : INK }}>
      {children}
    </p>
  );
}

export function Button({ href, children, variant = 'primary' }: { href: string; children: React.ReactNode; variant?: 'primary' | 'secondary' }) {
  const fill = variant === 'primary' ? { backgroundColor: GOLD, color: '#ffffff' } : { backgroundColor: '#ffffff', color: GOLD, border: '1px solid ' + GOLD };
  return (
    <table role="presentation" style={{ borderCollapse: 'separate', margin: '24px 0' }}>
      <tr>
        <td style={{ borderRadius: '8px', ...fill }}>
          <a href={href} style={{ display: 'inline-block', padding: '12px 24px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', ...fill }}>
            {children}
          </a>
        </td>
      </tr>
    </table>
  );
}

export function StatRow({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'profit' | 'warning' | 'error' }) {
  const colors = { default: INK, profit: GREEN, warning: GOLD, error: RED };
  return (
    <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse' }}>
      <tr>
        <td style={{ fontSize: '13px', color: MUTED, padding: '8px 0' }}>{label}</td>
        <td style={{ fontSize: '15px', fontWeight: 600, color: colors[tone], textAlign: 'right', padding: '8px 0' }}>{value}</td>
      </tr>
    </table>
  );
}

export function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <table role="presentation" style={{ width: '100%', borderCollapse: 'collapse', margin: '16px 0' }}>
      <tr>
        <td style={{ backgroundColor: IVORY, border: '1px solid ' + LINE, borderRadius: '8px', padding: '16px 20px' }}>
          {children}
        </td>
      </tr>
    </table>
  );
}

export function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid ' + LINE, margin: '24px 0' }} />;
}

export const money = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const usd = (n: number) => '$' + money(n);
