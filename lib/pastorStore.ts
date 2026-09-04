import fs from "fs";
import path from "path";
import crypto from "crypto";
import { db } from "./store";

// Functional pastor roster, persisted separately from the marketing
// "featured shepherds" list in lib/team.ts. These pastors can refer members
// and earn a (demo) share of the profit those members accrue.

export type PastorStatus = "pending" | "approved" | "rejected";

export type PastorEvent = {
  id: string;
  text: string;
  kind: "joined" | "deposit" | "earn" | "payout";
  at: number;
};

export type Payout = {
  id: string;
  amount: number;
  requestedAt: number;
  status: "pending" | "approved" | "rejected";
};

export type Pastor = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ministry: string;
  message: string;
  status: PastorStatus;
  shareRate: number; // % of a referred member's accrued profit
  createdAt: number;
  reviewedAt?: number;
  earnedTotal: number; // total pastor earnings (demo, tracked live)
  referrals: number; // count of members referred
  events: PastorEvent[]; // flock activity feed
  payouts: Payout[]; // payout requests against earnings
  profitHistory: { date: string; profit: number }[]; // daily earnings (chart)
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "pastors.json");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");
}
function read(): Pastor[] {
  ensure();
  try {
    const list: Pastor[] = JSON.parse(fs.readFileSync(FILE, "utf8"));
    // Defensive defaults: older records may lack newer fields.
    return list.map((p) => ({
      ...p,
      events: p.events || [],
      payouts: p.payouts || [],
      profitHistory: p.profitHistory || [],
    }));
  } catch {
    return [];
  }
}
function write(list: Pastor[]) {
  ensure();
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
}

export const pastorsDb = {
  all: (): Pastor[] => read(),
  approved: (): Pastor[] => read().filter((p) => p.status === "approved"),
  findById: (id: string): Pastor | undefined => read().find((p) => p.id === id),
  findApprovedByName: (name: string): Pastor | undefined =>
    read().find(
      (p) => p.status === "approved" && p.name.toLowerCase() === name.trim().toLowerCase()
    ),
  createApplication(input: {
    name: string;
    email: string;
    phone?: string;
    ministry?: string;
    message?: string;
  }): Pastor {
    const list = read();
    const p: Pastor = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      ministry: input.ministry || "General ministry",
      message: input.message || "",
      status: "pending",
      shareRate: 5, // default illustrative share
      createdAt: Date.now(),
      earnedTotal: 0,
      referrals: 0,
      events: [],
      payouts: [],
      profitHistory: [],
    };
    list.push(p);
    write(list);
    return p;
  },
  setStatus(
    id: string,
    status: PastorStatus,
    shareRate?: number,
    name?: string,
    email?: string
  ): (Pastor & { credentials?: { email: string; password: string } }) | null {
    const list = read();
    const i = list.findIndex((p) => p.id === id);
    if (i < 0) return null;
    list[i].status = status;
    list[i].reviewedAt = Date.now();
    if (shareRate != null) list[i].shareRate = shareRate;
    write(list);
    // On approval, provision a login account so the pastor can sign in and use
    // their own panel. The generated password is returned to the admin once.
    let credentials: { email: string; password: string } | undefined;
    if (status === "approved") {
      const acct = db.ensurePastorAccount({
        name: name || list[i].name,
        email: email || list[i].email,
      });
      if (acct.password) credentials = { email: acct.user.email, password: acct.password };
    }
    return { ...list[i], credentials };
  },
  // Credit a pastor with their share of a member's accrued profit.
  credit(id: string, amount: number, memberName?: string): Pastor | null {
    if (amount <= 0) return null;
    const list = read();
    const i = list.findIndex((p) => p.id === id);
    if (i < 0) return null;
    list[i].earnedTotal = +(list[i].earnedTotal + amount).toFixed(4);
    // Daily earnings history (for the earnings chart)
    const today = new Date().toISOString().slice(0, 10);
    const existing = list[i].profitHistory.find((h) => h.date === today);
    if (existing) existing.profit = +(existing.profit + amount).toFixed(4);
    else list[i].profitHistory.push({ date: today, profit: amount });
    if (list[i].profitHistory.length > 90)
      list[i].profitHistory = list[i].profitHistory.slice(-90);
    // Feed event
    list[i].events.unshift({
      id: crypto.randomUUID(),
      text: `Your share +$${amount.toFixed(4)} from ${memberName || "a member"}'s profit`,
      kind: "earn",
      at: Date.now(),
    });
    if (list[i].events.length > 60) list[i].events = list[i].events.slice(0, 60);
    write(list);
    return list[i];
  },
  // Count a new referral once, when the member signs up.
  addReferral(id: string, memberName?: string): Pastor | null {
    const list = read();
    const i = list.findIndex((p) => p.id === id);
    if (i < 0) return null;
    list[i].referrals += 1;
    list[i].events.unshift({
      id: crypto.randomUUID(),
      text: `${memberName || "A new member"} joined your flock`,
      kind: "joined",
      at: Date.now(),
    });
    write(list);
    return list[i];
  },
  // Record a member deposit in the pastor's feed.
  addDepositEvent(id: string, memberName: string, amount: number): void {
    const list = read();
    const i = list.findIndex((p) => p.id === id);
    if (i < 0) return;
    list[i].events.unshift({
      id: crypto.randomUUID(),
      text: `${memberName} deposited $${amount.toLocaleString("en-US")}`,
      kind: "deposit",
      at: Date.now(),
    });
    if (list[i].events.length > 60) list[i].events = list[i].events.slice(0, 60);
    write(list);
  },
  // Earnings available for payout: earned minus approved and pending payouts
  // (pending are reserved so they can't be requested twice).
  available(p: Pastor): number {
    const committed = p.payouts
      .filter((x) => x.status === "approved" || x.status === "pending")
      .reduce((s, x) => s + x.amount, 0);
    return +(p.earnedTotal - committed).toFixed(4);
  },
  requestPayout(id: string, amount: number): { ok: boolean; payout?: Payout; error?: string } {
    const list = read();
    const i = list.findIndex((p) => p.id === id);
    if (i < 0) return { ok: false, error: "Pastor not found" };
    const avail = this.available(list[i]);
    if (typeof amount !== "number" || amount <= 0)
      return { ok: false, error: "Enter a valid amount." };
    // Round DOWN so the stored payout never exceeds what is available.
    const rounded = Math.floor(amount * 100) / 100 || +amount.toFixed(4);
    if (rounded > avail)
      return { ok: false, error: `Amount exceeds available earnings ($${avail.toFixed(2)}).` };
    if (rounded <= 0)
      return { ok: false, error: "Enter a valid amount." };
    const payout: Payout = {
      id: crypto.randomUUID(),
      amount: rounded,
      requestedAt: Date.now(),
      status: "pending",
    };
    list[i].payouts.unshift(payout);
    list[i].events.unshift({
      id: crypto.randomUUID(),
      text: `Payout of $${payout.amount.toFixed(2)} requested`,
      kind: "payout",
      at: Date.now(),
    });
    write(list);
    return { ok: true, payout };
  },
  setPayoutStatus(id: string, payoutId: string, status: "approved" | "rejected"): Pastor | null {
    const list = read();
    const i = list.findIndex((p) => p.id === id);
    if (i < 0) return null;
    const x = list[i].payouts.find((p) => p.id === payoutId);
    if (!x || x.status !== "pending") return null;
    x.status = status;
    write(list);
    return list[i];
  },
  setShareRate(id: string, shareRate: number): Pastor | null {
    const list = read();
    const i = list.findIndex((p) => p.id === id);
    if (i < 0) return null;
    list[i].shareRate = Math.max(0, Math.min(50, shareRate));
    write(list);
    return list[i];
  },
};
