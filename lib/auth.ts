import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db, type User } from "./store";

export const AUTH_COOKIE = "ktx_session";
const SECRET =
  process.env.KTX_JWT_SECRET || "dev-secret-change-me-in-production-ktx";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isPastor?: boolean;
};

export function signSession(user: User): string {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, isPastor: user.isPastor || false },
    SECRET,
    { expiresIn: "7d" }
  );
}

export function verifySession(token: string): SessionUser | null {
  try {
    const p = jwt.verify(token, SECRET) as SessionUser;
    return p;
  } catch {
    return null;
  }
}

export function getSession(): SessionUser | null {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

// Returns the live DB record for the session, or null if missing/suspended.
// Use for actions that must honor an admin suspension.
export function requireActiveSession(): User | null {
  const s = getSession();
  if (!s) return null;
  const u = db.findById(s.id);
  if (!u || u.suspended) return null;
  return u;
}

export function publicUser(u: User): SessionUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}
