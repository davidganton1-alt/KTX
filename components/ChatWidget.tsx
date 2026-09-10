'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useChatSocket } from '@/hooks/useChatSocket';

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [showIdentifyForm, setShowIdentifyForm] = useState(false);
  const [identifyName, setIdentifyName] = useState('');
  const [identifyEmail, setIdentifyEmail] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { connected, visitorId, messages, sendMessage, identifyVisitor, visitorName, visitorEmail } = useChatSocket();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Prompt for identification on first open if not identified
  useEffect(() => {
    if (open && !visitorName && !showIdentifyForm) {
      setShowIdentifyForm(true);
    }
  }, [open, visitorName, showIdentifyForm]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !connected) return;
    
    sendMessage(text);
    setInput('');
  };

  const handleIdentify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifyName.trim() || !identifyEmail.trim()) return;
    
    identifyVisitor(identifyName.trim(), identifyEmail.trim());
    setShowIdentifyForm(false);
  };

  // Don't render if no visitor ID yet (still connecting)
  if (!visitorId) return null;

  return (
    <>
      {/* Floating chat button */}
      {!open && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all hover:scale-110"
          style={{ backgroundColor: 'var(--gold)' }}
          aria-label="Open chat"
        >
          <svg className="mx-auto h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {messages.filter(m => m.senderType === 'admin').length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {messages.filter(m => m.senderType === 'admin').length}
            </span>
          )}
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] max-w-md rounded-2xl border shadow-2xl"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
              height: 'min(80vh, 600px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>
                  {connected ? 'KingdomTradeX Support' : 'Connecting...'}
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 transition hover:bg-[var(--bg-soft)]"
                aria-label="Close chat"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: 'calc(100% - 140px)' }}>
              {showIdentifyForm ? (
                <form onSubmit={handleIdentify} className="space-y-3">
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    Please tell us your name and email so we can assist you better.
                  </p>
                  <input
                    type="text"
                    value={identifyName}
                    onChange={(e) => setIdentifyName(e.target.value)}
                    placeholder="Your name"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)', color: 'var(--fg)' }}
                  />
                  <input
                    type="email"
                    value={identifyEmail}
                    onChange={(e) => setIdentifyEmail(e.target.value)}
                    placeholder="Your email"
                    required
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)', color: 'var(--fg)' }}
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg px-4 py-2 text-sm font-bold transition hover:brightness-110"
                    style={{ backgroundColor: 'var(--gold)', color: 'black' }}
                  >
                    Start Chat
                  </button>
                </form>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Hi {visitorName || 'there'}! How can we help you today?
                      </p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderType === 'visitor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          msg.senderType === 'visitor'
                            ? 'rounded-br-none'
                            : 'rounded-bl-none'
                        }`}
                        style={{
                          backgroundColor: msg.senderType === 'visitor' ? 'var(--gold)' : 'var(--bg-soft)',
                          color: msg.senderType === 'visitor' ? 'black' : 'var(--fg)',
                        }}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className="mt-1 text-xs opacity-60">
                          {new Date(msg.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            {!showIdentifyForm && (
              <div className="border-t p-3" style={{ borderColor: 'var(--border)' }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type your message..."
                    disabled={!connected}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--gold)] disabled:opacity-50"
                    style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)', color: 'var(--fg)' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!connected || !input.trim()}
                    className="rounded-lg px-4 py-2 text-sm font-bold transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--gold)', color: 'black' }}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function ChatWidgetConditional() {
  const pathname = usePathname();
  const isAuthedRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/console') || pathname?.startsWith('/pastor');
  if (isAuthedRoute) return null;
  return <ChatWidget />;
}
