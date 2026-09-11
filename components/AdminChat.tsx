'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  id: string;
  conversationId: string;
  senderType: 'visitor' | 'admin';
  senderId: string;
  senderName: string;
  text: string;
  at: number;
};

type Conversation = {
  id: string;
  visitorId: string;
  lastMessageAt: number;
  lastMessagePreview: string;
  unread: number;
  status: 'open' | 'closed';
};

type Visitor = {
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
  name: string | null;
  email: string | null;
  online: boolean;
};

export function AdminChat({ me }: { me: any }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedConvIdRef = useRef<string | null>(null);
  useEffect(() => { selectedConvIdRef.current = selectedConvId; }, [selectedConvId]);

  // Fetch initial data
  useEffect(() => {
    fetch('/api/chat/conversations')
      .then((r) => r.json())
      .then((data) => {
        setConversations(data.conversations || []);
        setVisitors(data.visitors || []);
      });
  }, []);

  // Connect to WebSocket as admin
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL
      || (window.location.protocol === 'https:'
        ? `wss://${window.location.hostname}:3002`
        : `ws://${window.location.hostname}:3002`);

    let reconnectTimer: ReturnType<typeof setTimeout>;
    let unmounted = false;

    const connect = () => {
      if (unmounted) return;
      const ws = new WebSocket(`${wsUrl}?type=admin`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        console.log('[Admin Chat] Connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.event === 'chat_message') {
            const msg = data.payload;
            setMessages((prev) => (msg.conversationId === selectedConvIdRef.current ? [...prev, msg] : prev));
            setConversations((prev) => {
              const idx = prev.findIndex((c) => c.id === msg.conversationId);
              if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = {
                  ...updated[idx],
                  lastMessageAt: msg.at,
                  lastMessagePreview: msg.text.slice(0, 100),
                  unread:
                    msg.senderType === 'visitor' && msg.conversationId !== selectedConvIdRef.current
                      ? updated[idx].unread + 1
                      : updated[idx].unread,
                };
                return updated.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
              }
              return [
                {
                  id: msg.conversationId,
                  visitorId: msg.conversationId,
                  lastMessageAt: msg.at,
                  lastMessagePreview: msg.text.slice(0, 100),
                  unread: msg.senderType === 'visitor' ? 1 : 0,
                  status: 'open',
                },
                ...prev,
              ];
            });
          }

          if (data.event === 'visitor_online') {
            const { visitor, online } = data.payload;
            setVisitors((prev) => {
              if (visitor && visitor.id) {
                const idx = prev.findIndex((v) => v.id === visitor.id);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = { ...updated[idx], ...visitor, online };
                  return updated;
                }
                return [visitor, ...prev];
              }
              // offline events carry only { visitorId, online }
              const vid = data.payload.visitorId;
              if (vid) {
                return prev.map((v) => (v.id === vid ? { ...v, online } : v));
              }
              return prev;
            });
          }

          if (data.event === 'pageview') {
            const { visitorId, page } = data.payload;
            setVisitors((prev) =>
              prev.map((v) =>
                v.id === visitorId ? { ...v, currentPage: page, lastSeen: Date.now() } : v
              )
            );
          }

          if (data.event === 'conversation_updated') {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === data.payload.conversationId ? { ...c, ...data.payload } : c
              )
            );
          }
        } catch (err) {
          console.error('[Admin Chat] Parse error:', err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Gentle reconnect: fresh socket with full handlers, no page reload
        if (!unmounted) {
          reconnectTimer = setTimeout(() => {
            if (!unmounted) connect();
          }, 5000);
        }
      };

      ws.onerror = () => {
        setConnected(false);
      };
    };

    connect();

    return () => {
      unmounted = true;
      clearTimeout(reconnectTimer);
      const ws = wsRef.current;
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      wsRef.current = null;
    };
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConvId) return;
    fetch(`/api/chat/messages?conversationId=${selectedConvId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        // Mark as read
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'mark_read', conversationId: selectedConvId }));
        }
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConvId ? { ...c, unread: 0 } : c))
        );
      });
  }, [selectedConvId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !selectedConvId || wsRef.current?.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type: 'chat_message',
      conversationId: selectedConvId,
      adminId: me?.id || 'admin',
      adminName: me?.name || 'Admin',
      text,
    }));
    setInput('');
  };

  const handleClose = () => {
    if (!selectedConvId || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'close_conversation', conversationId: selectedConvId }));
  };

  const selectedVisitor = visitors.find((v) => v.id === selectedConvId);

  return (
    <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-6 md:grid-cols-12">
      {/* Sidebar: conversations + online visitors */}
      <div className="col-span-12 flex flex-col overflow-hidden rounded-xl border md:col-span-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>
            Conversations ({conversations.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-center text-sm" style={{ color: 'var(--muted)' }}>No conversations yet</p>
          ) : (
            conversations.map((conv) => {
              const visitor = visitors.find((v) => v.id === conv.visitorId);
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full border-b p-4 text-left transition hover:bg-[var(--bg-soft)] ${
                    selectedConvId === conv.id ? 'bg-[var(--bg-soft)]' : ''
                  }`}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="truncate text-sm font-bold" style={{ color: 'var(--fg)' }}>
                      {visitor?.name || visitor?.email || 'Anonymous Visitor'}
                    </span>
                    {conv.unread > 0 && (
                      <span className="rounded-full bg-[var(--gold)] px-2 py-0.5 text-xs font-bold text-black">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                    {conv.lastMessagePreview}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${visitor?.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
        <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
          <h4 className="mb-2 text-xs font-bold" style={{ color: 'var(--fg)' }}>
            Online Visitors ({visitors.filter((v) => v.online).length})
          </h4>
          <div className="max-h-32 space-y-1 overflow-y-auto">
            {visitors.filter((v) => v.online).map((v) => (
              <div key={v.id} className="text-xs" style={{ color: 'var(--muted)' }}>
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />
                {v.name || v.ip} — {v.currentPage}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="col-span-12 flex flex-col overflow-hidden rounded-xl border md:col-span-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        {selectedConvId ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>
                  {selectedVisitor?.name || selectedVisitor?.email || 'Anonymous Visitor'}
                </h3>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {selectedVisitor?.ip} · {selectedVisitor?.currentPage}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg border px-3 py-1 text-xs font-medium transition hover:border-red-500 hover:text-red-500"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                Close Conversation
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  No messages yet
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.senderType === 'admin' ? 'rounded-br-none' : 'rounded-bl-none'
                      }`}
                      style={{
                        backgroundColor: msg.senderType === 'admin' ? 'var(--gold)' : 'var(--bg-soft)',
                        color: msg.senderType === 'admin' ? 'black' : 'var(--fg)',
                      }}
                    >
                      <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                      <p className="mt-1 text-xs opacity-60">
                        {msg.senderName} · {new Date(msg.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type your reply..."
                  disabled={!connected}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--gold)] disabled:opacity-50"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)', color: 'var(--fg)' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!connected || !input.trim()}
                  className="rounded-lg px-4 py-2 text-sm font-bold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: 'var(--gold)', color: 'black' }}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Select a conversation to view messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
