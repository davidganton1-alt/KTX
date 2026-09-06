"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FAQS, FAQ_CATEGORIES } from "@/lib/faqs";
import { SectionIcon } from "@/components/SectionIcon";
import { Verse } from "@/components/Verse";

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = FAQS.filter((f) => {
    const matchCat = category === "All" || f.category === category;
    const matchSearch =
      !search ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="container-wide pb-24 pt-14">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex w-fit justify-center"><SectionIcon name="book" size={56} /></div>
        <p className="eyebrow">Help Center</p>
        <h1 className="section-title mt-2 text-4xl md:text-6xl">Answers to <span className="gradient-text">every question</span></h1>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">
          Everything you need to know about KingdomTradeX — plans, trading, withdrawals, security, and more.
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mt-10 max-w-2xl">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] py-4 pl-12 pr-4 text-[var(--fg)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
        <button onClick={() => setCategory("All")}
          className={`pill font-mono text-xs transition ${category === "All" ? "!border-[var(--gold)] !text-[var(--gold)] bg-[var(--gold)]/10" : ""}`}>
          All
        </button>
        {FAQ_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`pill font-mono text-xs transition ${category === c ? "!border-[var(--gold)] !text-[var(--gold)] bg-[var(--gold)]/10" : ""}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Showing {filtered.length} {filtered.length === 1 ? "question" : "questions"}
      </p>

      {/* FAQ Accordions */}
      <div className="mx-auto mt-6 max-w-3xl space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-10 text-center">
              <p className="text-lg text-[var(--muted)]">No questions match your search.</p>
              <Link href="/support" className="mt-3 inline-block text-[var(--gold)] hover:underline">Contact support instead →</Link>
            </motion.div>
          ) : (
            filtered.map((f, i) => {
              const isOpen = open === i;
              return (
                <motion.div
                  key={f.q}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)]"
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-[var(--card)]"
                  >
                    <div className="flex-1">
                      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">{f.category}</span>
                      <span className="text-base font-semibold text-[var(--fg)]">{f.q}</span>
                    </div>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--gold)] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
                      +
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <p className="px-5 pb-5 leading-relaxed text-[var(--muted)]">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Still need help */}
      <div className="card-grad mx-auto mt-16 max-w-2xl p-8 text-center md:p-10">
        <h2 className="section-title text-2xl md:text-3xl">Still have <span className="gradient-text">questions?</span></h2>
        <p className="mt-3 text-[var(--muted)]">Our support team is ready to help you with anything not covered here.</p>
        <Link href="/support" className="btn-primary mt-6 inline-flex">Contact Support</Link>
      </div>

      {/* Closing verse */}
      <div className="mt-16 text-center">
        <Verse variant="random" />
      </div>
    </main>
  );
}
