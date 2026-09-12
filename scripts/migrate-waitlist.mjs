// Phase 2 / Prompt 4: migrate data/waitlist.json (string[] of emails) into Supabase waitlist.
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

const emails = JSON.parse(fs.readFileSync(path.join(root, 'data', 'waitlist.json'), 'utf8'));

let inserted = 0, dupes = 0, bad = 0;
for (const email of emails) {
  const e = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { bad++; continue; }
  const { data: existing } = await a.from('waitlist').select('id').eq('email', e).maybeSingle();
  if (existing) { dupes++; continue; }
  const { error } = await a.from('waitlist').insert({ email: e });
  if (error) {
    if (/duplicate/i.test(error.message)) dupes++;
    else console.log('INSERT FAIL', e, error.message);
  } else inserted++;
}
console.log(`waitlist migrated: inserted=${inserted} skipped_dup=${dupes} invalid=${bad} (source had ${emails.length})`);
const { data } = await a.from('waitlist').select('email');
console.log('supabase waitlist now:', JSON.stringify((data || []).map((r) => r.email)));
