'use client';

import { useState, useMemo } from 'react';
import { HELP_CATEGORIES, HELP_ARTICLES, TUTORIALS } from '@/lib/help-center';

export default function HelpCenterClient() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredArticles = useMemo(() => {
    let articles = HELP_ARTICLES;
    if (activeCategory) {
      articles = articles.filter((a) => a.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      articles = articles.filter(
        (a) => a.q.toLowerCase().includes(q) || a.a.toLowerCase().includes(q)
      );
    }
    return articles;
  }, [query, activeCategory]);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <section className="container-wide py-16 md:py-24 text-center">
        <span className="inline-block px-4 py-1.5 mb-4 rounded-full border text-xs font-bold uppercase tracking-widest" style={{ borderColor: 'var(--border)', color: 'var(--gold)', backgroundColor: 'var(--card)' }}>
          Help Center
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          How can we help you <span style={{ color: 'var(--gold)' }}>today?</span>
        </h1>
        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for deposits, withdrawals, MetaMask, tiers..."
            className="w-full px-6 py-4 rounded-xl border text-base outline-none transition focus:border-[var(--gold)]"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)', color: 'var(--fg)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)] hover:text-[var(--fg)]"
            >
              Clear
            </button>
          )}
        </div>
      </section>

      <section className="container-wide pb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Tutorials</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-16">
          {TUTORIALS.map((t) => (
            <div key={t.id} className="rounded-xl border p-5 transition hover:border-[var(--gold)]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: t.type === 'video' ? 'var(--purple)' : 'var(--cyan)' }}>
                {t.type === 'video' ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                )}
              </div>
              <h3 className="font-bold mb-1" style={{ color: 'var(--fg)' }}>{t.title}</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-4 py-2 rounded-lg text-sm font-bold transition"
            style={{ 
              backgroundColor: activeCategory === null ? 'var(--gold)' : 'var(--card)',
              color: activeCategory === null ? 'black' : 'var(--fg)',
              borderColor: 'var(--border)'
            }}
          >
            All Topics
          </button>
          {HELP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-4 py-2 rounded-lg text-sm font-bold transition border"
              style={{ 
                backgroundColor: activeCategory === cat.id ? 'var(--gold)' : 'var(--card)',
                color: activeCategory === cat.id ? 'black' : 'var(--fg)',
                borderColor: 'var(--border)'
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
              <p className="text-[var(--muted)]">No articles found. Try a different search term.</p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <details key={article.id} className="group rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold text-[var(--fg)] hover:bg-[var(--bg-soft)] transition">
                  <span>{article.q}</span>
                  <span className="text-[var(--gold)] text-xl transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-relaxed text-[var(--muted)]">
                  {article.a}
                </div>
              </details>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
