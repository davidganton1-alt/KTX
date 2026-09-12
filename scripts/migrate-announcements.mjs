// Phase 2 / Prompt 4: migrate data/announcements.json into Supabase announcements.
// Keeps the same uuid id so both stores agree (admin delete-by-id works on either).
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

const anns = JSON.parse(fs.readFileSync(path.join(root, 'data', 'announcements.json'), 'utf8'));
const mapping = JSON.parse(fs.readFileSync(path.join(root, 'data', 'sb-id-mapping.json'), 'utf8'));
let inserted = 0, dupes = 0;

for (const an of anns) {
  const { data: existing } = await a.from('announcements').select('id').eq('id', an.id).maybeSingle();
  if (existing) { dupes++; continue; }
  const { error } = await a.from('announcements').insert({
    id: an.id, // preserve uuid
    title: an.title,
    body: an.body || '',
    created_by: null, // legacy announcements predate creator tracking
    created_at: new Date(an.createdAt).toISOString(),
  });
  if (error) {
    if (/duplicate/i.test(error.message)) dupes++;
    else console.log('INSERT FAIL', an.id, error.message);
  } else {
    inserted++;
    mapping[an.id] = an.id; // announcement ids are shared; recorded explicitly
  }
}
fs.writeFileSync(path.join(root, 'data', 'sb-id-mapping.json'), JSON.stringify(mapping, null, 2));
console.log(`announcements migrated: inserted=${inserted} skipped=${dupes} (source had ${anns.length})`);
const { data } = await a.from('announcements').select('id,title');
console.log('supabase announcements now:', JSON.stringify(data));
