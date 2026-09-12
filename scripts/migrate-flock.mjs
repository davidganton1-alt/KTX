// Phase 2 / Prompt 5: link flock relationships from data/users.json into Supabase flock_members.
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

const users = JSON.parse(fs.readFileSync(path.join(root, 'data', 'users.json'), 'utf8'));
const mapping = JSON.parse(fs.readFileSync(path.join(root, 'data', 'sb-id-mapping.json'), 'utf8'));
const { data: pastors } = await a.from('pastors').select('id,email,name,user_id');

// Prompt 3 seeded roster rows before accounts were bridged: link user_id now.
for (const p of pastors || []) {
  if (p.user_id) continue;
  const ju = users.find((u) => (u.email || '').toLowerCase() === (p.email || '').toLowerCase());
  const supa = ju && mapping[ju.id];
  if (supa) {
    await a.from('pastors').update({ user_id: supa }).eq('id', p.id);
    p.user_id = supa;
    console.log('roster linked to profile:', p.name, supa.slice(0, 8));
  }
}

let linked = 0, skipped = 0, missing = 0;
for (const u of users) {
  if (!u.referredBy) continue;
  const memberSupa = mapping[u.id];
  if (!memberSupa) { missing++; continue; }
  // pastor: roster row matched by the user's pastorName or by JSON pastor id->email
  const jsonPastors = JSON.parse(fs.readFileSync(path.join(root, 'data', 'pastors.json'), 'utf8'));
  const jp = jsonPastors.find((p) => p.id === u.referredBy);
  const pname = (jp && jp.name) || u.pastorName || '';
  const pastor = (pastors || []).find((p) => p.name.toLowerCase() === String(pname).toLowerCase());
  if (!pastor) { missing++; continue; }
  const { error } = await a
    .from('flock_members')
    .upsert(
      { pastor_id: pastor.id, user_id: memberSupa, joined_at: new Date(u.createdAt || Date.now()).toISOString() },
      { onConflict: 'pastor_id,user_id' }
    );
  if (error) console.log('FLOCK FAIL', u.email, error.message);
  else linked++;
}
console.log(`flock linked=${linked} skipped=${skipped} missing-refs=${missing}`);
const { data } = await a.from('flock_members').select('pastor_id,user_id,total_contributed');
console.log('flock_members rows:', JSON.stringify(data));
