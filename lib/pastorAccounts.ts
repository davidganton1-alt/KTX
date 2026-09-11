import fs from "fs";
import path from "path";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

// Ensures a pastor approved in the JSON stack also exists in Supabase
// (auth user + profile + wallet) so they can actually log in after the
// auth migration. Appends the new id pair to data/sb-id-mapping.json;
// lib/auth's mapping cache reloads on miss.

const MAPPING_FILE = path.join(process.cwd(), "data", "sb-id-mapping.json");

function appendMapping(jsonId: string, supaId: string) {
  try {
    const m = fs.existsSync(MAPPING_FILE)
      ? JSON.parse(fs.readFileSync(MAPPING_FILE, "utf8"))
      : {};
    if (m[jsonId] === supaId) return;
    m[jsonId] = supaId;
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(m, null, 2));
  } catch (e: any) {
    console.error("[pastor-accounts] mapping write failed:", e.message);
  }
}

export async function ensureSupabasePastorAccount(
  jsonId: string,
  email: string,
  name: string,
  password?: string
): Promise<{ id: string; created: boolean; password?: string }> {
  // 1) profile already there?
  const { data: prof } = await supabaseAdmin
    .from("profiles")
    .select("id, is_pastor")
    .ilike("email", email)
    .maybeSingle();
  if (prof) {
    if (!prof.is_pastor) {
      const { error } = await supabaseAdmin.from("profiles").update({ is_pastor: true }).eq("id", prof.id);
      if (error) console.error("[pastor-accounts] is_pastor update failed:", error.message);
    }
    appendMapping(jsonId, prof.id);
    return { id: prof.id, created: false };
  }

  // 2) auth user there without a profile? create the profile.
  let uid: string | null = null;
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const authUser = list?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (authUser) uid = authUser.id;

  // 3) create auth user (+ profile + wallet)
  const newPassword = password || `pastor${crypto.randomBytes(3).toString("hex")}`;
  if (!uid) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: newPassword,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error || !created.user) {
      console.error("[pastor-accounts] auth create failed:", error?.message);
      throw new Error(error?.message || "Supabase account creation failed");
    }
    uid = created.user.id;
  }

  const { error: pe } = await supabaseAdmin.from("profiles").insert({
    id: uid,
    email,
    name,
    role: "user",
    is_pastor: true,
    email_verified: true,
    two_factor_enabled: false,
    pastor_share_rate: 0,
    has_seen_tour: false,
    has_signed_agreement: false,
    has_shared_first_withdrawal: false,
  });
  if (pe) console.error("[pastor-accounts] profile insert failed:", pe.message);
  const { error: we } = await supabaseAdmin.from("wallets").insert({ user_id: uid, free_credit: 50, principal: 0, profit: 0, tier: "none" });
  if (we && !/duplicate/i.test(we.message)) console.error("[pastor-accounts] wallet insert failed:", we.message);

  appendMapping(jsonId, uid);
  return { id: uid, created: true, password: password ? undefined : newPassword };
}
