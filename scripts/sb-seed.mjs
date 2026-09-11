import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const line of fs
  .readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
  .split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z_0-9]*)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const users = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data", "users.json"), "utf8")
);

// Legacy passwords that the JSON stack currently accepts
const LEGACY = {};
for (const u of users) {
  LEGACY[u.email] =
    u.email === "admin@kingdomtradex.com"
      ? "admin1234"
      : u.email === "user@kingdomtradex.com"
      ? "user1234"
      : "pastor1234";
}

(async () => {
  let created = 0, skipped = 0;
  const mapping = {};
  for (const u of users) {
    const { data: existing } = await admin.auth.admin.listUsers();
    const hit = existing.users.find((x) => x.email === u.email);
    if (hit) {
      mapping[u.id] = hit.id;
      console.log("skip (exists):", u.email);
      skipped++;
      continue;
    }
    const password = LEGACY[u.email];
    if (!password) { console.log("no known password for", u.email, "- skipped"); skipped++; continue; }
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: u.email,
      password,
      email_confirm: true,
      user_metadata: { name: u.name },
    });
    if (authError) {
      console.log("auth create FAILED:", u.email, authError.message);
      skipped++;
      continue;
    }
    mapping[u.id] = authData.user.id;
    const { error: pe } = await admin.from("profiles").insert({
      id: authData.user.id,
      email: u.email,
      name: u.name,
      role: u.role,
      is_pastor: u.isPastor || false,
      email_verified: !!u.emailVerified,
      two_factor_enabled: !!u.twoFactorEnabled,
      referred_by: u.referredBy || null,
      pastor_name: u.pastorName || null,
      pastor_share_rate: u.pastorShareRate ?? 0,
      has_seen_tour: !!u.hasSeenTour,
      has_signed_agreement: !!u.hasSignedAgreement,
      agreement_signed_at: u.agreementSignedAt ? new Date(u.agreementSignedAt).toISOString() : null,
      has_shared_first_withdrawal: !!u.hasSharedFirstWithdrawal,
    });
    if (pe) console.log("profile insert FAILED:", u.email, pe.message);
    const { error: we } = await admin.from("wallets").insert({
      user_id: authData.user.id,
      free_credit: u.freeCredit ?? 50,
    });
    if (we) console.log("wallet insert FAILED:", u.email, we.message);
    console.log("created:", u.email, "->", authData.user.id.slice(0, 8));
    created++;
  }
  fs.writeFileSync(
    path.join(process.cwd(), "data", "sb-id-mapping.json"),
    JSON.stringify(mapping, null, 2)
  );
  console.log(`DONE. created=${created} skipped=${skipped}; mapping saved to data/sb-id-mapping.json`);
})();
