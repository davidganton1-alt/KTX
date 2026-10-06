'use client';

import { motion } from 'framer-motion';
import { RND_ROADMAP, type RoadmapQuarter } from '@/lib/rnd';

const STATUS: Record<RoadmapQuarter['status'], { color: string; label: string; pulse: boolean }> = {
  complete: { color: '#34d399', label: 'Complete', pulse: false },
  active: { color: '#fbbf24', label: 'In Progress', pulse: true },
  planned: { color: '#64748b', label: 'Planned', pulse: false },
};

export function RoadmapTimeline() {
  return (
    <div className="relative mx-auto max-w-4xl px-4">
      <div className="absolute bottom-0 left-4 top-0 w-px bg-[var(--border)] md:left-1/2" />
      <motion.div
        className="absolute left-4 top-0 w-px md:left-1/2"
        style={{
          height: '100%',
          transformOrigin: 'top',
          background: 'linear-gradient(180deg, #fbbf24, #38bdf8 60%, transparent)',
        }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
      />
      <div className="space-y-12 py-8">
        {RND_ROADMAP.map((q, i) => {
          const s = STATUS[q.status];
          const left = i % 2 === 0;
          return (
            <motion.div
              key={q.id}
              className="relative md:grid md:grid-cols-2 md:gap-12"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <span className="absolute left-4 top-2 z-10 -ml-[7px] md:left-1/2" style={{ width: 14, height: 14 }}>
                <span className="block h-full w-full rounded-full" style={{ background: s.color, boxShadow: `0 0 12px ${s.color}` }} />
                {s.pulse && (
                  <span className="absolute inset-0 animate-ping rounded-full" style={{ background: s.color, opacity: 0.5 }} />
                )}
              </span>
              <div className={`pl-10 ${left ? 'md:col-start-1 md:pl-0 md:pr-10 md:text-right' : 'md:col-start-2 md:pl-10'}`}>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
                  <div className={`flex items-center gap-3 ${left ? 'md:justify-end' : ''}`}>
                    <span className="font-mono text-[13px] font-semibold" style={{ color: s.color }}>{q.label}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.08em]" style={{ color: s.color, border: `1px solid ${s.color}55` }}>
                      {s.label}
                    </span>
                  </div>
                  <h3 className="mt-2 text-[18px] font-semibold text-[var(--fg)]">{q.theme}</h3>
                  <ul className="mt-4 space-y-2">
                    {q.items.map((it) => (
                      <li key={it.title} className={`flex gap-2 text-[13px] ${left ? 'md:flex-row-reverse md:text-right' : ''}`}>
                        <span className="mt-0.5 shrink-0" style={{ color: it.done ? '#34d399' : 'var(--muted)' }}>
                          {it.done ? '✓' : '○'}
                        </span>
                        <span>
                          <span className="font-medium text-[var(--fg)]">{it.title}</span>
                          <span className="block text-[var(--muted)]">{it.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
