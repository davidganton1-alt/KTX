// Phase 2 / Prompt 5: backfill pastors.earned_total + profit_history from data/pastors.json.
// Individual pastor_earnings rows cannot be reconstructed per-member (JSON
// profitHistory is day-merged with no memberId), so we mirror the aggregate:
// one 'member_profit' earnings row per day entry, attributed to the flock
// member list when there's exactly one (best effort), else to the pastor's
// own profile is NOT allowed (FK needs a member) -> we insert into
// profit_history jsonb + earned_total only when no member can be resolved.
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const root = process.cwd();
const env = {};
for (const l of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^([A-Z_][A-Z_0-9]*)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const a = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const pastorsJson = JSON.parse(fs.readFileSync(path.join(root, 'data', 'pastors.json'), 'utf8'));
const usersJson = JSON.parse(fs.readFileSync(path.join(root, 'data', 'users.json'), 'utf8'));
const mapping = JSON.parse(fs.readFileSync(path.join(root, 'data', 'sb-id-mapping.json'), 'utf8'));

let rosterRows = 0, earningsRows = 0;
for (const p of pastorsJson) {
  if (p.status !== "approved") continue;
  const { data: roster } = await a.from('pastors').select('id').ilike('email', p.email).maybeSingle();
  if (!roster) { console.log('no roster row for', p.email); continue; }
  rosterRows++;

  // pull current Supabase state to keep this idempotent
  const { data: cur } = await a.from('pastors').select('profit_history').eq('id', roster.id).single();
  const have = (cur?.profit_history || []).length;
  const entries = p.profitHistory || [];
  const todo = entries.slice(have);
  if (!todo.length) { console.log(p.name, 'already mirrored (', have, 'entries )'); continue; }

  // resolve the single flock member if any (best-effort attribution)
  const { data: flock } = await a.from('flock_members').select('user_id').eq('pastor_id', roster.id);
  const soleMember = (flock || []).length === 1 ? flock[0].user_id : null;

  const newHistory = todo.map((h) => ({
    date: h.date, profit: h.profit,
    memberId: h.memberId || (soleMember ? mapping && Object.keys(mapping).find((k) => mapping[k] === soleMember) : null),
    memberName: h.memberName || null,
  }));
  const { error: uh } = await a
    .from('pastors')
    .update({
      profit_history: [...(cur?.profit_history || []), ...newHistory],
      earned_total: entries.reduce((s, h) => s + h.profit, 0),
      updated_at: new Date().toISOString(),
    })
    .eq('id', roster.id);
  if (uh) console.log('history update fail', p.email, uh.message);

  if (soleMember) {
    const rows = todo.map((h) => ({
      pastor_id: roster.id, user_id: soleMember,
      amount: h.profit, source: 'member_profit',
      notes: `backfill ${h.date}`, created_at: new Date(h.date + 'T12:00:00Z').toISOString(),
    }));
    const { error: ie } = await a.from('pastor_earnings').insert(rows);
    if (ie) console.log('earnings insert fail', p.email, ie.message);
    else earningsRows += rows.length;
  }
  console.log(p.name, 'mirrored', newHistory.length, 'history entries, earned_total ->', entries.reduce((s, h) => s + h.profit, 0));
}
console.log(`pastor earnings backfill: roster=${rosterRows} earnings_rows=${earningsRows}`);
