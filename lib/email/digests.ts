import * as React from 'react';
import { supabaseAdmin } from '@/lib/supabase';
import { db } from '@/lib/store';
import { legacyIdFor } from '@/lib/auth';
import { emails } from '@/lib/email/service';

const DAY = 24 * 3600 * 1000;

/**
 * Phase G digests (idempotent, safe to run from the daily profit cron):
 *  - Weekly profit summary: Mondays UTC, to users with profit in the last 7d.
 *    Dedupe via JSON notification "weekly-summary:YYYY-MM-DD".
 *  - Agreement reminder: users whose profile is >7d old, unsigned, and never
 *    reminded (profiles.agreement_reminder_sent_at).
 * Returns counts for the cron response.
 */
export async function runEmailDigests(): Promise<{ weekly: number; reminders: number; skipped: string }> {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  const out = { weekly: 0, reminders: 0, first: 0, skipped: ''};

  // ── weekly summaries (Mondays only) ──
  if (new Date().getUTCDay() === 1) {

    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, accumulated_profit, total_profit_withdrawn, platform_credit, wallets(principal, tier, daily_rate)');
    for (const p of profiles ?? []) {
      try {
        const lid = legacyIdFor(p.id);
        const ju = db.findById(lid);
        if (!ju || !ju.email) continue;
        if ((ju.notifications || []).some((n: any) => typeof n.text === 'string' && n.text === `Your week in review was emailed to you (${today}).`)) continue;
        const week = (ju.profitHistory || [])
          .filter((h: any) => Date.parse(h.date) >= now - 7 * DAY)
          .reduce((s: number, h: any) => s + Number(h.profit || 0), 0);
        if (week <= 0) continue;
        const principal = Number(p.wallets?.[0]?.principal ?? ju.deposited ?? 0);
        const available = Math.max(0, Number(p.accumulated_profit || 0) - Number(p.total_profit_withdrawn || 0));
        const rate = Number(p.wallets?.[0]?.daily_rate ?? ju.dailyRate ?? 0.0025);
        emails.weeklySummary(ju.email, {
          name: ju.name || 'there',
          weekProfit: +week.toFixed(2),
          lifetimeProfit: Number(p.accumulated_profit || 0),
          available: +available.toFixed(2),
          dailyRatePct: `${(rate * 100).toFixed(2)}`,
          principal,
        });
        db.notify(lid, `Your week in review was emailed to you (${today}).`, 'system'); // also the dedupe marker
        out.weekly++;
      } catch {}
    }
  } else {
    out.skipped = 'weekly: not Monday UTC';
  }

  // ── agreement reminders (any day, once per user) ──
  try {
    const { data: stale } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email')
      .eq('has_signed_agreement', false)
      .is('agreement_reminder_sent_at', null)
      .lt('created_at', new Date(now - 7 * DAY).toISOString())
      .limit(200);
    for (const p of stale ?? []) {
      try {
        const lid = legacyIdFor(p.id);
        const ju = db.findById(lid);
        const email = ju?.email || p.email;
        if (!email) continue;
        await supabaseAdmin.from('profiles').update({ agreement_reminder_sent_at: new Date().toISOString() }).eq('id', p.id);
        emails.agreementReminder(email, { name: ju?.name || p.name || 'there' });
        out.reminders++;
      } catch {}
    }
  } catch (e: any) {
    console.error('[digests] reminders failed:', e.message);
  }

  // ── first-deposit reminders: signed up >3 days ago, $50 credit idle ──
  try {
    const { data: idle } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, created_at, wallets(principal)')
      .eq('platform_credit', 50)
      .gt('created_at', new Date(now - 60 * DAY).toISOString())
      .lt('created_at', new Date(now - 3 * DAY).toISOString())
      .limit(200);
    for (const p of idle ?? []) {
      try {
        const w = Array.isArray((p as any).wallets) ? (p as any).wallets[0] : (p as any).wallets;
        if (Number(w?.principal || 0) > 0) continue;
        const lid = legacyIdFor(p.id);
        const ju = db.findById(lid);
        const email = ju?.email || p.email;
        if (!email) continue;
        const marker = `Your $50 platform credit is still waiting (${today}).`;
        if (ju && (ju.notifications || []).some((n: any) => typeof n.text === 'string' && n.text === marker)) continue;
        emails.firstDepositReminder(email, { name: ju?.name || p.name || 'there', platformCredit: 50 });
        if (lid && ju) db.notify(lid, marker, 'system');
        out.first = (out as any).first ?? 0;
        (out as any).first++;
      } catch {}
    }
  } catch (e: any) {
    console.error('[digests] first-deposit reminders failed:', e.message);
  }

  return out;
}
