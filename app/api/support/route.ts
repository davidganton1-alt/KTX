import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const SUPPORT_FILE = path.join(DATA_DIR, "support.json");

type SupportMessage = {
  id: string;
  email: string;
  subject: string;
  message: string;
  createdAt: number;
  status: "open";
};

function readAll(): SupportMessage[] {
  try {
    if (!fs.existsSync(SUPPORT_FILE)) return [];
    return JSON.parse(fs.readFileSync(SUPPORT_FILE, "utf8"));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  const { email, subject, message } = await req.json().catch(() => ({}));
  if (!email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  const entry: SupportMessage = {
    id: Math.random().toString(36).slice(2, 10),
    email: String(email).slice(0, 200),
    subject: String(subject).slice(0, 200),
    message: String(message).slice(0, 5000),
    createdAt: Date.now(),
    status: "open",
  };
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const all = readAll();
    all.unshift(entry);
    fs.writeFileSync(SUPPORT_FILE, JSON.stringify(all.slice(0, 500), null, 2));
  } catch (e) {
    console.error("support write failed", e);
  }
  return NextResponse.json({ ok: true });
}
