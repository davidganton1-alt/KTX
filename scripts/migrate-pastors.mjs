// Phase 2 / Prompt 3: migrate data/pastors.json into Supabase (applications + roster).
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

const pastors = JSON.parse(fs.readFileSync(path.join(root, 'data', 'pastors.json'), 'utf8'));
const mapping = JSON.parse(fs.readFileSync(path.join(root, 'data', 'sb-id-mapping.json'), 'utf8'));
const users = JSON.parse(fs.readFileSync(path.join(root, 'data', 'users.json'), 'utf8'));

let apps = 0, roster = 0, skipped = 0;

for (const p of pastors) {
  // 1) application row (upsert by email+created window; check dup by email)
  const { data: dup } = await a
    .from('pastor_applications')
    .select('id')
    .ilike('email', p.email)
    .maybeSingle();
  if (!dup) {
    const { error } = await a.from('pastor_applications').insert({
      name: p.name,
      email: p.email,
      phone: p.phone || null,
      ministry: p.ministry || null,
      message: p.message || null,
      status: p.status,
      share_rate: p.shareRate ?? 5,
      reviewed_at: p.reviewedAt ? new Date(p.reviewedAt).toISOString() : null,
      created_at: new Date(p.createdAt).toISOString(),
    });
    if (error) console.log('APP INSERT FAIL', p.email, error.message);
    else apps++;
  } else skipped++;

  // 2) approved → roster row
  if (p.status === 'approved') {
    const { data: rdup } = await a.from('pastors').select('id').ilike('email', p.email).maybeSingle();
    if (!rdup) {
      // link to the Supabase profile if mapped
      const jsonUser = users.find((u) => u.email.toLowerCase() === p.email.toLowerCase());
      const uid = jsonUser ? mapping[jsonUser.id] : null;
      const { error } = await a.from('pastors').insert({
        user_id: uid,
        name: p.name,
        email: p.email,
        ministry: p.ministry || null,
        share_rate: p.shareRate ?? 5,
        earned_total: p.earnedTotal ?? 0,
        referrals: p.referrals ?? 0,
        events: p.events || [],
        payouts: p.payouts || [],
        profit_history: p.profitHistory || [],
        created_at: new Date(p.createdAt).toISOString(),
      });
      if (error) console.log('ROSTER INSERT FAIL', p.email, error.message);
      else roster++;
    }
  }
}

console.log(`migrated apps=${apps} roster=${roster} skipped_existing=${skipped}`);
const { data: allApps } = await a.from('pastor_applications').select('email,status');
const { data: allRoster } = await a.from('pastors').select('email,user_id,share_rate');
console.log('pastor_applications now:', JSON.stringify(allApps));
console.log('pastors now:', JSON.stringify(allRoster));
