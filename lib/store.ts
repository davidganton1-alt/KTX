import fs from "fs";
import path from "path";
import crypto from "crypto";
import { pastorsDb } from "./pastorStore";

export type Role = "user" | "admin";
export type Tier = "none" | "faithful" | "steward" | "ambassador";

export type ProfitDay = { date: string; profit: number };

export type UserNotification = {
  id: string;
  text: string;
  kind: "system" | "withdrawal" | "referral" | "announcement";
  at: number;
};

export type Withdrawal = {
  id: string;
  amount: number;
  type?: "profit" | "deposit";
  fee?: number;
  requestedAt: number;
  status: "pending" | "approved" | "rejected";
};

export type Deposit = {
  id: string;
  amount: number;
  tier: Tier;
  at: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string; // salt:hash
  role: Role;
  createdAt: number;
  // Wallet
  tier: Tier;
  freeCredit: number; // $50 signup bonus, locked until user deposits
  deposited: number; // total user-funded deposits
  balance: number; // freeCredit + deposited + accrued profit
  profit: number; // total accrued profit (withdrawable)
  dailyRate: number; // expected daily profit rate (from tier)
  lastProfitDate: string; // YYYY-MM-DD of last accrual
  profitHistory: ProfitDay[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  // Pastor referral (a member brought in by a pastor earns the pastor a share)
  referredBy?: string; // pastor id
  pastorName?: string; // denormalized for display
  pastorShareRate?: number; // % of this member's accrued profit
  isPastor?: boolean; // true once a pastor application is approved and a login exists
  // Member referral program
  referralCode?: string; // unique code for "invite a friend" links
  memberReferredBy?: string; // user id of the member who invited this user
  memberReferrals: string[]; // ids of members this user invited
  referralBonusEarned: number; // total bonus earned from member referrals
  // Admin controls
  suspended?: boolean;
  // Notifications feed (merged with platform announcements client-side)
  notifications: UserNotification[];
  lastSeenNotifs: number;
};

export const TIERS: Record<
  Exclude<Tier, "none">,
  { label: string; min: number; max: number; rate: number; perk: string; assetClasses: string[]; holdMonths: number }
> = {
  faithful: {
    label: "Faithful",
    min: 100,
    max: 500,
    rate: 0.005, // 0.5%/day
    perk: "Starter AI across crypto, US stocks & commodities.",
    assetClasses: ["Crypto", "US Stocks", "Commodities"],
    holdMonths: 6,
  },
  steward: {
    label: "Steward",
    min: 650,
    max: 1500,
    rate: 0.0075, // 0.75%/day
    perk: "Advanced AI models, priority rebalancing across all markets.",
    assetClasses: ["Crypto", "US Stocks", "Commodities"],
    holdMonths: 9,
  },
  ambassador: {
    label: "Ambassador",
    min: 2000,
    max: 1000000,
    rate: 0.01, // 1.0%/day
    perk: "Elite AI desk, dedicated risk guardrails across all markets.",
    assetClasses: ["Crypto", "US Stocks", "Commodities"],
    holdMonths: 12,
  },
};

const FREE_CREDIT = 50;
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE))
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

function read(): User[] {
  ensure();
  try {
    const users: User[] = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    // Defensive defaults: older records may lack newer fields.
    return users.map((u) => ({
      ...u,
      memberReferrals: u.memberReferrals || [],
      referralBonusEarned: u.referralBonusEarned || 0,
      notifications: u.notifications || [],
      lastSeenNotifs: u.lastSeenNotifs || 0,
    }));
  } catch {
    return [];
  }
}

function write(users: User[]) {
  ensure();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function hash(password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const h = crypto.scryptSync(password, s, 64).toString("hex");
  return `${s}:${h}`;
}

function verify(password: string, stored: string) {
  const [salt, hashv] = stored.split(":");
  const h = crypto.scryptSync(password, salt, 64).toString("hex");
  return h === hashv;
}

function dayStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const db = {
  findByEmail(email: string): User | undefined {
    return read().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findById(id: string): User | undefined {
    return read().find((u) => u.id === id);
  },
  setEmailVerified(id: string, value: boolean): User {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) throw new Error("User not found");
    users[i].emailVerified = value;
    write(users);
    return users[i];
  },
  setTwoFactor(id: string, enabled: boolean, secret?: string): User {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) throw new Error("User not found");
    users[i].twoFactorEnabled = enabled;
    if (secret !== undefined) users[i].twoFactorSecret = secret;
    if (!enabled) users[i].twoFactorSecret = undefined;
    write(users);
    return users[i];
  },
  // Create (or upgrade) a login account for an approved pastor. Returns the
  // account + a generated password the admin can share. If an account already
  // exists for the email, it is simply flagged isPastor.
  ensurePastorAccount(input: {
    name: string;
    email: string;
  }): { user: User; password?: string } {
    const users = read();
    const existing = users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      existing.isPastor = true;
      write(users);
      return { user: existing };
    }
    const password = `pastor${crypto.randomBytes(3).toString("hex")}`;
    const user: User = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      password: hash(password),
      role: "user",
      createdAt: Date.now(),
      tier: "none",
      freeCredit: FREE_CREDIT,
      deposited: 0,
      balance: FREE_CREDIT,
      profit: 0,
      dailyRate: 0,
      lastProfitDate: yesterdayStr(),
      profitHistory: [],
      deposits: [],
      withdrawals: [],
      emailVerified: false,
      twoFactorEnabled: false,
      isPastor: true,
      memberReferrals: [],
      referralBonusEarned: 0,
      notifications: [],
      lastSeenNotifs: Date.now(),
    };
    users.push(user);
    write(users);
    return { user, password };
  },
  findAll(): User[] {
    return read();
  },
  create(input: { name: string; email: string; password: string; role?: Role }): User {
    const users = read();
    if (users.find((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("An account with that email already exists.");
    }
    const user: User = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      password: hash(input.password),
      role: input.role ?? "user",
      createdAt: Date.now(),
      tier: "none",
      freeCredit: FREE_CREDIT,
      deposited: 0,
      balance: FREE_CREDIT,
      profit: 0,
      dailyRate: 0,
      lastProfitDate: yesterdayStr(),
      profitHistory: [],
      deposits: [],
      withdrawals: [],
      emailVerified: false,
      twoFactorEnabled: false,
      memberReferrals: [],
      referralBonusEarned: 0,
      notifications: [],
      lastSeenNotifs: Date.now(),
    };
    users.push(user);
    write(users);
    return user;
  },
  verifyPassword(email: string, password: string): User | undefined {
    const u = this.findByEmail(email);
    if (!u) return undefined;
    return verify(password, u.password) ? u : undefined;
  },
  update(id: string, patch: Partial<User>): User {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) throw new Error("User not found");
    users[i] = { ...users[i], ...patch };
    write(users);
    return users[i];
  },
  // Deposit: unlocks the free credit and sets tier + daily rate
  deposit(id: string, amount: number, tier: Exclude<Tier, "none">): User {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) throw new Error("User not found");
    const u = users[i];
    const t = TIERS[tier];
    u.deposited += amount;
    u.balance += amount;
    u.deposits.push({ id: crypto.randomUUID(), amount, tier, at: Date.now() });
    // free credit becomes withdrawable-eligible once user has deposited
    u.tier = tier;
    u.dailyRate = t.rate;
    write(users);
    return u;
  },
  // Accrue a specific fractional amount to today's profit (live tick).
  accrueAmount(id: string, amount: number) {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) return null;
    const u = users[i];
    if (amount <= 0) return u;
    const today = dayStr();
    u.profit = +(u.profit + amount).toFixed(4);
    u.balance = +(u.balance + amount).toFixed(4);
    u.lastProfitDate = today;
    const existing = u.profitHistory.find((h) => h.date === today);
    if (existing) existing.profit = +(existing.profit + amount).toFixed(4);
    else u.profitHistory.push({ date: today, profit: amount });
    if (u.profitHistory.length > 90) u.profitHistory = u.profitHistory.slice(-90);
    write(users);
    // Pastor share: credit the referring pastor with their % of this accrual.
    if (u.referredBy && u.pastorShareRate && amount > 0) {
      const share = +(amount * (u.pastorShareRate / 100)).toFixed(4);
      if (share > 0) pastorsDb.credit(u.referredBy, share, u.name);
    }
    return u;
  },
  // Accrue daily profit based on deposited + freeCredit principal
  accrueDaily(id: string): User {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) throw new Error("User not found");
    const u = users[i];
    const today = dayStr();
    if (u.lastProfitDate === today) return u; // already accrued today
    if (u.dailyRate <= 0 || u.deposited <= 0) {
      u.lastProfitDate = today;
      write(users);
      return u;
    }
    const principal = u.deposited + (u.deposited > 0 ? u.freeCredit : 0);
    const gained = +(principal * u.dailyRate).toFixed(2);
    u.profit += gained;
    u.balance += gained;
    u.lastProfitDate = today;
    u.profitHistory.push({ date: today, profit: gained });
    if (u.profitHistory.length > 60) u.profitHistory = u.profitHistory.slice(-60);
    write(users);
    // Pastor share: credit the referring pastor with their % of today's gain.
    if (u.referredBy && u.pastorShareRate && gained > 0) {
      const share = +(gained * (u.pastorShareRate / 100)).toFixed(4);
      if (share > 0) pastorsDb.credit(u.referredBy, share, u.name);
    }
    return u;
  },
  requestWithdrawal(id: string, amount: number): Withdrawal {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) throw new Error("User not found");
    const u = users[i];
    if (amount <= 0) throw new Error("Enter a valid amount.");
    if (amount > u.profit) throw new Error("You can only withdraw profit.");
    const w: Withdrawal = {
      id: crypto.randomUUID(),
      amount,
      type: "profit",
      fee: 0,
      requestedAt: Date.now(),
      status: "pending",
    };
    u.withdrawals.push(w);
    u.profit -= amount; // reserve; restored if rejected by admin
    u.balance -= amount;
    write(users);
    return w;
  },
  setWithdrawalStatus(userId: string, wId: string, status: "approved" | "rejected") {
    const users = read();
    const i = users.findIndex((u) => u.id === userId);
    if (i < 0) return;
    const u = users[i];
    const w = u.withdrawals.find((x) => x.id === wId);
    if (!w || w.status !== "pending") return;
    if (status === "rejected") {
      u.profit += w.amount;
      u.balance += w.amount;
    }
    w.status = status;
    write(users);
  },
  // Withdraw part or all of the deposited principal.
  // Free (no penalty) once the earliest deposit is older than the tier's
  // holding period. Before that, a 25% early-withdrawal deduction applies.
  withdrawDeposit(id: string, amount: number): { ok: boolean; penalty: number; net: number; error?: string } {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) return { ok: false, penalty: 0, net: 0, error: "User not found" };
    const u = users[i];
    if (amount <= 0) return { ok: false, penalty: 0, net: 0, error: "Enter a valid amount." };
    if (amount > u.deposited) return { ok: false, penalty: 0, net: 0, error: "Amount exceeds your deposit." };

    const t = TIERS[u.tier as Exclude<Tier, "none">];
    const heldMonths = t ? t.holdMonths : 12;
    const earliest = (u.deposits && u.deposits.length) ? Math.min(...u.deposits.map((d) => d.at)) : u.createdAt;
    const holdUntil = earliest + heldMonths * 30 * 24 * 60 * 60 * 1000;
    const penalty = Date.now() >= holdUntil ? 0 : 0.25;

    const net = +(amount * (1 - penalty)).toFixed(2);
    u.deposited = +(u.deposited - amount).toFixed(2);
    u.balance = +(u.balance - amount).toFixed(2);
    u.withdrawals.push({
      id: crypto.randomUUID(),
      amount,
      type: "deposit",
      fee: +(amount * penalty).toFixed(2),
      requestedAt: Date.now(),
      status: "pending",
    });
    write(users);
    return { ok: true, penalty, net };
  },
  seedAdmin() {
    const users = read();
    if (!users.find((u) => u.role === "admin")) {
      users.push({
        id: "admin-0000-0000-0000-000000000000",
        name: "Admin",
        email: "admin@kingdomtradex.com",
        password: hash("admin1234"),
        role: "admin",
        createdAt: Date.now(),
        tier: "none",
        freeCredit: 0,
        deposited: 0,
        balance: 0,
        profit: 0,
        dailyRate: 0,
        lastProfitDate: yesterdayStr(),
        profitHistory: [],
        deposits: [],
        withdrawals: [],
        emailVerified: true,
        twoFactorEnabled: false,
        memberReferrals: [],
        referralBonusEarned: 0,
        notifications: [],
        lastSeenNotifs: Date.now(),
      });
      write(users);
    }
  },
  // Demo user account so the owner can preview the member experience.
  seedDemoUser() {
    const users = read();
    if (!users.find((u) => u.email === "user@kingdomtradex.com")) {
      const principal = 1000;
      const free = FREE_CREDIT;
      const rate = 0.013;
      // Establish an account that is ~40 days old with accrued profit,
      // so the demo never starts from zero.
      const START_DAYS = 40;
      const createdAt = Date.now() - START_DAYS * 86400_000;
      let profit = 0;
      const profitHistory: { date: string; profit: number }[] = [];
      for (let d = START_DAYS; d >= 1; d--) {
        const dayProfit = +(principal * rate).toFixed(2);
        profit = +(profit + dayProfit).toFixed(2);
        const dt = new Date(Date.now() - d * 86400_000);
        profitHistory.push({ date: dt.toISOString().slice(0, 10), profit: dayProfit });
      }
      const u: User = {
        id: "demo-0000-0000-0000-000000000001",
        name: "Demo Member",
        email: "user@kingdomtradex.com",
        password: hash("user1234"),
        role: "user",
        createdAt,
        tier: "steward",
        freeCredit: free,
        deposited: principal,
        balance: +(principal + free + profit).toFixed(2),
        profit,
        dailyRate: rate,
        lastProfitDate: yesterdayStr(),
        profitHistory,
        deposits: [
          { id: crypto.randomUUID(), amount: principal, tier: "steward", at: createdAt },
        ],
        withdrawals: [],
        emailVerified: true,
        twoFactorEnabled: false,
        memberReferrals: [],
        referralBonusEarned: 0,
        notifications: [],
        lastSeenNotifs: Date.now(),
      };
      users.push(u);
      write(users);
    }
  },
  // --- Notifications ---
  notify(id: string, text: string, kind: UserNotification["kind"] = "system"): void {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) return;
    users[i].notifications.unshift({ id: crypto.randomUUID(), text, kind, at: Date.now() });
    if (users[i].notifications.length > 40) users[i].notifications = users[i].notifications.slice(0, 40);
    write(users);
  },
  markNotifsSeen(id: string): void {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) return;
    users[i].lastSeenNotifs = Date.now();
    write(users);
  },
  // --- Admin user management ---
  setSuspended(id: string, value: boolean): User | null {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) return null;
    users[i].suspended = value;
    if (value) this.notify(id, "Your account has been suspended by the admin.", "system");
    else this.notify(id, "Your account has been reactivated. Welcome back.", "system");
    write(users);
    return users[i];
  },
  setTier(id: string, tier: Tier): User | null {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) return null;
    users[i].tier = tier;
    if (tier !== "none") {
      users[i].dailyRate = TIERS[tier].rate;
      this.notify(id, `Your plan was updated to ${TIERS[tier].label} by the admin.`, "system");
    } else {
      users[i].dailyRate = 0;
    }
    write(users);
    return users[i];
  },
  adjustProfit(id: string, amount: number): User | null {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) return null;
    const u = users[i];
    if (amount < 0 && -amount > u.profit) amount = -u.profit;
    u.profit = +(u.profit + amount).toFixed(2);
    u.balance = +(u.balance + amount).toFixed(2);
    this.notify(id, `An admin adjusted your profit by ${amount >= 0 ? "+" : ""}$${amount.toFixed(2)}.`, "system");
    write(users);
    return u;
  },
  // --- Member referral program ---
  ensureReferralCode(id: string): string {
    const users = read();
    const i = users.findIndex((u) => u.id === id);
    if (i < 0) throw new Error("User not found");
    if (!users[i].referralCode) {
      users[i].referralCode = crypto.randomBytes(4).toString("hex");
      write(users);
    }
    return users[i].referralCode as string;
  },
  findByReferralCode(code: string): User | undefined {
    return read().find((u) => u.referralCode === code && !u.suspended);
  },
  // Link a newly-registered member to the member who invited them.
  linkMemberReferral(newUserId: string, referrerId: string, newMemberName: string): void {
    const users = read();
    const i = users.findIndex((u) => u.id === newUserId);
    const j = users.findIndex((u) => u.id === referrerId);
    if (i < 0 || j < 0) return;
    users[i].memberReferredBy = referrerId;
    users[j].memberReferrals.push(newUserId);
    users[j].notifications.unshift({
      id: crypto.randomUUID(),
      text: `${newMemberName} joined through your invite link. You earn a bonus when they fund their first plan.`,
      kind: "referral",
      at: Date.now(),
    });
    write(users);
  },
  // One-time bonus to the referrer when a referred member funds their plan.
  MEMBER_REFERRAL_BONUS: 25,
  creditMemberReferralBonus(referredUserId: string): number {
    const users = read();
    const i = users.findIndex((u) => u.id === referredUserId);
    if (i < 0) return 0;
    const referrerId = users[i].memberReferredBy;
    if (!referrerId) return 0;
    const j = users.findIndex((u) => u.id === referrerId);
    if (j < 0) return 0;
    const bonus = db.MEMBER_REFERRAL_BONUS;
    users[j].balance = +(users[j].balance + bonus).toFixed(2);
    users[j].referralBonusEarned = +(users[j].referralBonusEarned + bonus).toFixed(2);
    users[j].notifications.unshift({
      id: crypto.randomUUID(),
      text: `${users[i].name} funded a plan. Your $${bonus} referral bonus was credited.`,
      kind: "referral",
      at: Date.now(),
    });
    write(users);
    return bonus;
  },
};
