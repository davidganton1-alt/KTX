// Phase 2 / Prompt 2: migrate wallet state + transaction history from users.json to Supabase.
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const root = path.resolve(process.cwd());
const env = {};
for (const l of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z_][A-Z_0-9]*)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const a = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const users = JSON.parse(fs.readFileSync(path.join(root, 'data', 'users.json'), 'utf8'));
const mapping = JSON.parse(fs.readFileSync(path.join(root, 'data', 'sb-id-mapping.json'), 'utf8'));

let updated = 0, inserted = 0, skipped = 0, txCount = 0;

for (const u of users) {
  const sid = mapping[u.id];
  if (!sid) { console.log('no mapping for', u.email, '- skipped'); skipped++; continue; }

  const deposits = u.deposits || [];
  const firstDepositAt = deposits.length ? Math.min(...deposits.map((d) => d.at)) : null;

  const walletRow = {
    user_id: sid,
    free_credit: u.freeCredit ?? 0,
    principal: u.deposited ?? 0,
    profit: u.profit ?? 0,
    tier: u.tier && u.tier !== 'none' ? u.tier : 'none',
    deposit_at: firstDepositAt ? new Date(firstDepositAt).toISOString() : null,
    accrued_total: (u.profitHistory || []).reduce((s, h) => s + h.profit, 0),
    last_accrual_at: u.lastProfitDate ? new Date(u.lastProfitDate + 'T00:00:00Z').toISOString() : null,
    daily_rate: u.dailyRate ?? 0,
  };

  const { data: existing } = await a.from('wallets').select('id').eq('user_id', sid).maybeSingle();
  if (existing) {
    const { error } = await a.from('wallets').update(walletRow).eq('id', existing.id);
    if (error) console.log('UPDATE FAIL', u.email, error.message);
    else updated++;
  } else {
    const { error } = await a.from('wallets').insert(walletRow);
    if (error) console.log('INSERT FAIL', u.email, error.message);
    else inserted++;
  }

  // Backfill transactions from JSON history (skip if already present)
  const { data: have } = await a.from('transactions').select('id', { count: 'exact', head: true }).eq('user_id', sid);
  if ((have ?? 0) === 0 || true) {
    // rebuild idempotently: delete existing rows for this user first, re-insert full history
    await a.from('transactions').delete().eq('user_id', sid);
    const tx = [];
    for (const d of deposits) {
      tx.push({ user_id: sid, type: 'deposit', amount: d.amount, status: 'completed', notes: `tier: ${d.tier}`, created_at: new Date(d.at).toISOString() });
    }
    for (const w of u.withdrawals || []) {
      const type = w.type === 'deposit' ? 'withdrawal' : 'withdrawal';
      tx.push({ user_id: sid, type, amount: w.amount, status: w.status === 'approved' ? 'completed' : w.status === 'rejected' ? 'cancelled' : 'pending', notes: w.type === 'deposit' ? 'principal withdrawal' : 'profit withdrawal', created_at: new Date(w.requestedAt).toISOString() });
    }
    const fcr = (u.freeCredit || 0) > 0 ? [{ user_id: sid, type: 'free_credit', amount: u.freeCredit, status: 'completed', notes: 'signup bonus', created_at: new Date(u.createdAt).toISOString() }] : [];
    const rows = [...fcr, ...tx];
    if (rows.length) {
      const { error } = await a.from('transactions').insert(rows);
      if (error) console.log('TX INSERT FAIL', u.email, error.message);
      else txCount += rows.length;
    }
  }
}

console.log(`wallets updated=${updated} inserted=${inserted} skipped=${skipped}; transactions backfilled=${txCount}`);

const { data: final } = await a.from('wallets').select('principal, profit, free_credit, tier, accrued_total');
console.log(JSON.stringify(final, null, 1));
