import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

type Message = {
  id: string;
  conversationId: string;
  senderType: 'visitor' | 'admin';
  senderId: string;
  senderName: string;
  text: string;
  at: number;
};

export function useChatSocket() {
  const pathname = usePathname();
  const wsRef = useRef<WebSocket | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [visitorEmail, setVisitorEmail] = useState<string | null>(null);

  // Load visitor ID from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('ktx_visitor_id');
    if (stored) {
      setVisitorId(stored);
    }
  }, []);

  // Connect to WebSocket server
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL
      || (window.location.protocol === 'https:'
        ? `wss://${window.location.hostname}:3002`
        : `ws://${window.location.hostname}:3002`);

    const params = new URLSearchParams({
      type: 'visitor',
      page: pathname || '/',
    });
    if (visitorId) {
      params.set('visitorId', visitorId);
    }

    const ws = new WebSocket(`${wsUrl}?${params.toString()}`);
    wsRef.current = ws;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    ws.onopen = () => {
      setConnected(true);
      console.log('[Chat] Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.event === 'hello' && data.payload.visitorId) {
          // Server assigned or confirmed visitor ID
          const newId = data.payload.visitorId;
          setVisitorId(newId);
          localStorage.setItem('ktx_visitor_id', newId);
        }

        if (data.event === 'chat_message') {
          setMessages((prev) => [...prev, data.payload]);
        }
      } catch (err) {
        console.error('[Chat] Failed to parse message:', err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('[Chat] Disconnected from WebSocket server');
      // Auto-reconnect after 5 seconds
      reconnectTimer = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          window.location.reload(); // Simple reconnect strategy
        }
      }, 5000);
    };

    ws.onerror = (err) => {
      console.error('[Chat] WebSocket error:', err);
      setConnected(false);
    };

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws.onclose = null;
      ws.close();
    };
  }, [visitorId]); // Reconnect if visitor ID changes

  // Send page view on route change
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && visitorId) {
      wsRef.current.send(JSON.stringify({
        type: 'pageview',
        page: pathname,
      }));
    }
  }, [pathname, visitorId]);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN || !visitorId) return;

    wsRef.current.send(JSON.stringify({
      type: 'chat_message',
      text,
      name: visitorName || 'Visitor',
      email: visitorEmail,
    }));
  }, [visitorId, visitorName, visitorEmail]);

  const identifyVisitor = useCallback((name: string, email: string) => {
    setVisitorName(name);
    setVisitorEmail(email);
  }, []);

  return {
    connected,
    visitorId,
    messages,
    sendMessage,
    identifyVisitor,
    visitorName,
    visitorEmail,
  };
}
