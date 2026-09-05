import fs from "fs";
import path from "path";
import type { Trade } from "./strategy";

const DATA_DIR = path.join(process.cwd(), "data");
const TRADES_FILE = path.join(DATA_DIR, "trades.json");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TRADES_FILE)) fs.writeFileSync(TRADES_FILE, "[]");
}

function read(): Trade[] {
  ensure();
  try {
    const raw = fs.readFileSync(TRADES_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function write(trades: Trade[]) {
  ensure();
  fs.writeFileSync(TRADES_FILE, JSON.stringify(trades, null, 2));
}

export function getTrades(): Trade[] {
  return read();
}

export function addTrades(newTrades: Trade[]) {
  const all = read();
  const updated = [...newTrades, ...all].slice(0, 200); // keep last 200
  write(updated);
}

export function getRecent(count = 20): Trade[] {
  return read().slice(0, count);
}
