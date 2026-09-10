import { WebSocketServer, WebSocket } from "ws";
import { chatDb } from "../lib/chatStore";
import { IncomingMessage } from "http";

const PORT = parseInt(process.env.WS_PORT || "3002", 10);

// Map of connected clients: ws → { type, id, conversationId }
const clients = new Map<WebSocket, { type: "visitor" | "admin"; id: string; conversationId?: string }>();

function getIp(req: IncomingMessage): string {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  return req.socket.remoteAddress || "unknown";
}

function broadcast(toType: "visitor" | "admin" | "all", data: any, opts?: { onlyConversationId?: string; onlyVisitorId?: string }) {
  clients.forEach((meta, ws) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    if (toType !== "all" && meta.type !== toType) return;
    if (opts?.onlyConversationId && meta.conversationId !== opts.onlyConversationId) return;
    if (opts?.onlyVisitorId && meta.type === "visitor" && meta.id !== opts.onlyVisitorId) return;
    try {
      ws.send(JSON.stringify(data));
    } catch {}
  });
}

function broadcastAdminEvent(event: string, payload: any) {
  // Admin-only broadcast (new message, new visitor, page view, etc.)
  clients.forEach((meta, ws) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    if (meta.type !== "admin") return;
    try {
      ws.send(JSON.stringify({ event, payload }));
    } catch {}
  });
}

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`[WS] Live chat server listening on port ${PORT}`);
});

wss.on("connection", (ws, req) => {
  const ip = getIp(req);
  const ua = String(req.headers["user-agent"] || "unknown");
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const clientType = url.searchParams.get("type") === "admin" ? "admin" : "visitor";

  if (clientType === "visitor") {
    const referrer = req.headers.referer ? String(req.headers.referer) : null;
    const landingPage = url.searchParams.get("page") || "/";

    // Create or resume visitor
    const existingId = url.searchParams.get("visitorId");
    const visitor = chatDb.upsertVisitor({
      id: existingId || undefined,
      ip,
      userAgent: ua,
      referrer,
      landingPage,
      currentPage: landingPage,
      country: null,
      city: null,
      name: null,
      email: null,
      online: true,
    });

    clients.set(ws, { type: "visitor", id: visitor.id });

    // Send hello with visitor id so client can persist
    ws.send(JSON.stringify({
      event: "hello",
      payload: { visitorId: visitor.id, type: "visitor" },
    }));

    broadcastAdminEvent("visitor_online", { visitor, online: true });
  } else {
    // Admin connection — no visitor record needed
    clients.set(ws, { type: "admin", id: `admin-${Date.now()}` });
    ws.send(JSON.stringify({
      event: "hello",
      payload: { type: "admin" },
    }));
  }

  ws.on("message", (raw) => {
    const meta = clients.get(ws);
    if (!meta) return;

    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    // ── Visitor → chat message
    if (meta.type === "visitor" && msg.type === "chat_message") {
      const text = String(msg.text || "").trim();
      if (!text) return;

      const conversationId = meta.id; // visitor id IS conversation id
      const saved = chatDb.addMessage({
        conversationId,
        senderType: "visitor",
        senderId: meta.id,
        senderName: msg.name || "Visitor",
        text,
      });

      // If visitor just identified, persist it
      if (msg.name && msg.email) {
        chatDb.identifyVisitor(meta.id, msg.name, msg.email);
      }

      // Echo back to sender
      ws.send(JSON.stringify({ event: "chat_message", payload: saved }));

      // Broadcast to all admins
      broadcastAdminEvent("chat_message", saved);
    }

    // ── Admin → chat message
    if (meta.type === "admin" && msg.type === "chat_message") {
      const text = String(msg.text || "").trim();
      const conversationId = String(msg.conversationId || "");
      if (!text || !conversationId) return;

      const saved = chatDb.addMessage({
        conversationId,
        senderType: "admin",
        senderId: String(msg.adminId || "admin"),
        senderName: String(msg.adminName || "Admin"),
        text,
      });

      // Mark conversation read for admin
      chatDb.markConversationRead(conversationId);

      // Echo to all admins
      broadcastAdminEvent("chat_message", saved);

      // Send to the specific visitor (their conversation id = their visitor id)
      broadcast("visitor", { event: "chat_message", payload: saved }, { onlyVisitorId: conversationId });
    }

    // ── Visitor → page view (navigation tracking)
    if (meta.type === "visitor" && msg.type === "pageview") {
      chatDb.updateVisitorPage(meta.id, String(msg.page || "/"));
      broadcastAdminEvent("pageview", {
        visitorId: meta.id,
        page: msg.page,
        at: Date.now(),
      });
    }

    // ── Admin → mark read
    if (meta.type === "admin" && msg.type === "mark_read") {
      chatDb.markConversationRead(String(msg.conversationId || ""));
      broadcastAdminEvent("conversation_updated", { conversationId: msg.conversationId, unread: 0 });
    }

    // ── Admin → close conversation
    if (meta.type === "admin" && msg.type === "close_conversation") {
      chatDb.closeConversation(String(msg.conversationId || ""));
      broadcastAdminEvent("conversation_updated", { conversationId: msg.conversationId, status: "closed" });
    }
  });

  ws.on("close", () => {
    const meta = clients.get(ws);
    if (meta?.type === "visitor") {
      chatDb.setVisitorOffline(meta.id);
      broadcastAdminEvent("visitor_online", { visitorId: meta.id, online: false });
    }
    clients.delete(ws);
  });

  ws.on("error", (err) => {
    console.error("[WS] client error:", err.message);
  });
});

// Heartbeat: mark visitors offline if WS dropped without close event
setInterval(() => {
  const cutoff = Date.now() - 60000;
  chatDb.getVisitors().forEach((v) => {
    if (v.online && v.lastSeen < cutoff) {
      chatDb.setVisitorOffline(v.id);
      broadcastAdminEvent("visitor_online", { visitorId: v.id, online: false });
    }
  });
}, 30000);

process.on("SIGTERM", () => {
  console.log("[WS] shutting down");
  wss.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  console.log("[WS] shutting down");
  wss.close(() => process.exit(0));
});
