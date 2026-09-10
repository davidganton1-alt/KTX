import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const CHAT_FILE = path.join(DATA_DIR, "chat.json");
const VISITORS_FILE = path.join(DATA_DIR, "visitors.json");

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderType: "visitor" | "admin";
  senderId: string; // visitor id or admin user id
  senderName: string;
  text: string;
  at: number;
};

export type Visitor = {
  id: string;
  ip: string;
  userAgent: string;
  referrer: string | null;
  landingPage: string;
  currentPage: string;
  country: string | null;
  city: string | null;
  firstSeen: number;
  lastSeen: number;
  name: string | null; // set if visitor identifies themselves
  email: string | null;
  online: boolean;
};

export type Conversation = {
  id: string;
  visitorId: string;
  lastMessageAt: number;
  lastMessagePreview: string;
  unread: number; // unread by admin
  status: "open" | "closed";
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readChats(): { messages: ChatMessage[]; conversations: Conversation[] } {
  ensureDir();
  if (!fs.existsSync(CHAT_FILE)) return { messages: [], conversations: [] };
  try {
    return JSON.parse(fs.readFileSync(CHAT_FILE, "utf8"));
  } catch {
    return { messages: [], conversations: [] };
  }
}

function writeChats(data: { messages: ChatMessage[]; conversations: Conversation[] }) {
  ensureDir();
  // Cap messages at 5000 to prevent unbounded growth
  data.messages = data.messages.slice(-5000);
  fs.writeFileSync(CHAT_FILE, JSON.stringify(data, null, 2));
}

function readVisitors(): Visitor[] {
  ensureDir();
  if (!fs.existsSync(VISITORS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(VISITORS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeVisitors(list: Visitor[]) {
  ensureDir();
  fs.writeFileSync(VISITORS_FILE, JSON.stringify(list, null, 2));
}

export const chatDb = {
  // ── Conversations ──
  getConversations: (): Conversation[] => {
    const data = readChats();
    return data.conversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },

  getConversation: (id: string): Conversation | undefined => {
    const data = readChats();
    return data.conversations.find((c) => c.id === id);
  },

  getMessages: (conversationId: string): ChatMessage[] => {
    const data = readChats();
    return data.messages.filter((m) => m.conversationId === conversationId);
  },

  addMessage: (msg: Omit<ChatMessage, "id" | "at">): ChatMessage => {
    const data = readChats();
    const newMsg: ChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
      at: Date.now(),
    };
    data.messages.push(newMsg);

    // Update or create conversation
    const convIdx = data.conversations.findIndex((c) => c.id === msg.conversationId);
    if (convIdx >= 0) {
      data.conversations[convIdx].lastMessageAt = newMsg.at;
      data.conversations[convIdx].lastMessagePreview = newMsg.text.slice(0, 100);
      if (newMsg.senderType === "visitor") {
        data.conversations[convIdx].unread += 1;
      }
      data.conversations[convIdx].status = "open";
    } else {
      data.conversations.push({
        id: msg.conversationId,
        visitorId: msg.senderType === "visitor" ? msg.senderId : msg.conversationId,
        lastMessageAt: newMsg.at,
        lastMessagePreview: newMsg.text.slice(0, 100),
        unread: msg.senderType === "visitor" ? 1 : 0,
        status: "open",
      });
    }

    writeChats(data);
    return newMsg;
  },

  markConversationRead: (conversationId: string): void => {
    const data = readChats();
    const conv = data.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.unread = 0;
      writeChats(data);
    }
  },

  closeConversation: (conversationId: string): void => {
    const data = readChats();
    const conv = data.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.status = "closed";
      writeChats(data);
    }
  },

  // ── Visitors ──
  getVisitors: (): Visitor[] => readVisitors(),

  getVisitor: (id: string): Visitor | undefined => {
    return readVisitors().find((v) => v.id === id);
  },

  upsertVisitor: (v: Omit<Visitor, "id" | "firstSeen" | "lastSeen"> & { id?: string; lastSeen?: number }): Visitor => {
    const list = readVisitors();
    const now = Date.now();

    if (v.id) {
      const idx = list.findIndex((x) => x.id === v.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...v, lastSeen: now };
        writeVisitors(list);
        return list[idx];
      }
    }

    const newVisitor: Visitor = {
      id: v.id || crypto.randomUUID(),
      ip: v.ip,
      userAgent: v.userAgent,
      referrer: v.referrer,
      landingPage: v.landingPage,
      currentPage: v.currentPage,
      country: v.country,
      city: v.city,
      firstSeen: now,
      lastSeen: now,
      name: v.name,
      email: v.email,
      online: true,
    };
    list.push(newVisitor);
    writeVisitors(list);
    return newVisitor;
  },

  updateVisitorPage: (id: string, page: string): void => {
    const list = readVisitors();
    const v = list.find((x) => x.id === id);
    if (v) {
      v.currentPage = page;
      v.lastSeen = Date.now();
      v.online = true;
      writeVisitors(list);
    }
  },

  setVisitorOffline: (id: string): void => {
    const list = readVisitors();
    const v = list.find((x) => x.id === id);
    if (v) {
      v.online = false;
      writeVisitors(list);
    }
  },

  identifyVisitor: (id: string, name: string, email: string): void => {
    const list = readVisitors();
    const v = list.find((x) => x.id === id);
    if (v) {
      v.name = name;
      v.email = email;
      writeVisitors(list);
    }
  },

  // Online visitors = seen in last 60 seconds
  getOnlineVisitors: (): Visitor[] => {
    const cutoff = Date.now() - 60000;
    return readVisitors().filter((v) => v.lastSeen > cutoff);
  },
};
