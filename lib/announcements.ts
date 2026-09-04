import fs from "fs";
import path from "path";
import crypto from "crypto";

// Platform announcements: created by the admin, shown on every member and
// pastor panel via the notifications feed.

export type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAt: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "announcements.json");

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]");
}
function read(): Announcement[] {
  ensure();
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return [];
  }
}
function write(list: Announcement[]) {
  ensure();
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2));
}

export const announcementsDb = {
  all: (): Announcement[] =>
    read().sort((a, b) => b.createdAt - a.createdAt),
  create(title: string, body: string): Announcement {
    const list = read();
    const a: Announcement = {
      id: crypto.randomUUID(),
      title,
      body,
      createdAt: Date.now(),
    };
    list.push(a);
    write(list);
    return a;
  },
  remove(id: string) {
    const list = read().filter((a) => a.id !== id);
    write(list);
  },
};
