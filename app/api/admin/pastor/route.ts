import { NextRequest, NextResponse } from "next/server";
import { pastorsDb } from "@/lib/pastorStore";
import { db } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { sendEmail, pastorApprovalEmail, pastorRejectionEmail } from "@/lib/email";
import { mirrorApplication, syncRosterFromJson } from "@/lib/pastorMirror";
import { ensureSupabasePastorAccount } from "@/lib/pastorAccounts";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Admin only: approve/reject pastor applications, edit share rates, and
// approve/reject pastor payout requests. JSON stays the operational store
// during the migration window; every mutation mirrors to Supabase so the
// pastor_applications + pastors tables are the record of truth.
async function finalizeApproval(appId: string) {
  const p = pastorsDb.findById(appId);
  if (!p) return null;
  let credentials: { email: string; password: string } | undefined;
  try {
    // the JSON login account created by ensurePastorAccount has its own id
    // (not the pastor-record id) — map THAT to the Supabase profile id
    const jsonUser = db.findByEmail(p.email);
    const acct = await ensureSupabasePastorAccount(
      jsonUser?.id || p.id,
      p.email,
      p.name
    );
    if (acct.created && acct.password) credentials = { email: p.email, password: acct.password };
    else if (acct.created) credentials = undefined; // pre-existing account: no recoverable pw
  } catch (e: any) {
    console.error("[admin/pastor] Supabase account step failed:", e.message);
  }
  // link roster row to the Supabase profile
  try {
    await syncRosterFromJson({ ...p, status: "approved" } as any);
  } catch {}
  await mirrorApplication(p as any, "approved");
  const { data: prof } = await supabaseAdmin.from("profiles").select("id").ilike("email", p.email).maybeSingle();
  if (prof) {
    await supabaseAdmin.from("pastors").update({ user_id: prof.id }).eq("email", p.email);
  }
  return { pastor: p, credentials };
}

export async function POST(req: NextRequest) {
  const admin = await getSession();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (admin.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id, status, shareRate, name, email, action, payoutId, ids } = await req.json();

    // Bulk approve/reject pastor applications
    if (action === "bulk-review") {
      if (!Array.isArray(ids) || ids.length === 0 || !["approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "ids (non-empty array) and status (approved|rejected) are required." }, { status: 400 });
      }
      const credentials: { name: string; email: string; password: string }[] = [];
      let processed = 0;
      for (const appId of ids) {
        const p = pastorsDb.setStatus(appId, status);
        if (!p) continue; // application vanished mid-loop; skip rather than fail the batch
        processed += 1;
        if (status === 'approved') {
          const fin = await finalizeApproval(appId);
          const cred = fin?.credentials || p.credentials;
          if (cred) {
            credentials.push({ name: p.name, email: cred.email, password: cred.password });
            try {
              const msg = pastorApprovalEmail({ name: p.name, email: cred.email, password: cred.password });
              await sendEmail(msg);
            } catch (emailErr) {
              console.error(`[EMAIL] Failed to send to ${p.email}:`, emailErr);
            }
          }
        } else if (status === 'rejected') {
          await mirrorApplication(p as any, "rejected");
          try {
            const msg = pastorRejectionEmail({ name: p.name });
            msg.to = p.email;
            await sendEmail(msg);
          } catch (emailErr) {
            console.error(`[EMAIL] Failed to send rejection to ${p.email}:`, emailErr);
          }
        }
      }
      return NextResponse.json({ ok: true, processed, credentials });
    }

    // Share-rate editor
    if (action === "set-rate") {
      if (!id || typeof shareRate !== "number") {
        return NextResponse.json({ error: "id and shareRate are required." }, { status: 400 });
      }
      const p = pastorsDb.setShareRate(id, shareRate);
      if (!p) return NextResponse.json({ error: "Pastor not found." }, { status: 404 });
      // mirror roster rate + flock members' share rate into Supabase profiles
      try {
        await syncRosterFromJson(p);
        const members = db.findAll().filter((u) => u.referredBy === id);
        for (const m of members) {
          const { data: prof } = await supabaseAdmin.from("profiles").select("id").ilike("email", m.email).maybeSingle();
          if (prof) await supabaseAdmin.from("profiles").update({ pastor_share_rate: shareRate }).eq("id", prof.id);
        }
      } catch (e: any) {
        console.error("[admin/pastor] set-rate mirror failed:", e.message);
      }
      return NextResponse.json({ ok: true, pastor: { id: p.id, shareRate: p.shareRate } });
    }

    // Payout review
    if (action === "payout") {
      if (!id || !payoutId || !status || !["approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "id, payoutId and status are required." }, { status: 400 });
      }
      const p = pastorsDb.setPayoutStatus(id, payoutId, status);
      if (!p) return NextResponse.json({ error: "Pastor or payout not found." }, { status: 404 });
      await syncRosterFromJson(p);
      return NextResponse.json({ ok: true });
    }

    // Single review (default)
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required." }, { status: 400 });
    }
    const p = pastorsDb.setStatus(id, status, shareRate, name, email);
    if (!p) return NextResponse.json({ error: "Pastor not found." }, { status: 404 });

    let effectiveCreds = p.credentials;
    if (status === "approved") {
      const fin = await finalizeApproval(id);
      if (fin?.credentials) effectiveCreds = fin.credentials;
    } else if (status === "rejected") {
      await mirrorApplication(p as any, "rejected");
    }

    // Emails (non-blocking; don't fail the action on email error)
    try {
      if (status === "approved" && effectiveCreds) {
        await sendEmail(pastorApprovalEmail({ name: p.name, email: effectiveCreds.email, password: effectiveCreds.password }));
      } else if (status === "rejected") {
        const msg = pastorRejectionEmail({ name: p.name });
        msg.to = p.email;
        await sendEmail(msg);
      }
    } catch (emailErr) {
      console.error(`[EMAIL] Failed to send to ${p.email}:`, emailErr);
    }
    return NextResponse.json({ ok: true, pastor: { ...p, credentials: effectiveCreds } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed." }, { status: 400 });
  }
}
