'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getShareUrl, PLATFORM_META, PlatformId } from '@/lib/social';

interface ShareGateProps {
  open: boolean;
  title: string;
  subtitle: string;
  platforms: PlatformId[];
  shareUrl: string;
  shareText: string;
  mandatory: boolean;
  onShared: () => void;
  onSkip?: () => void;
  secondaryAction?: { label: string; url: string };
}

export function ShareGate({ open, title, subtitle, platforms, shareUrl, shareText, mandatory, onShared, onSkip, secondaryAction }: ShareGateProps) {
  const [hasShared, setHasShared] = useState(false);

  const handleShare = (platform: PlatformId) => {
    const url = getShareUrl(platform, shareUrl, shareText);
    window.open(url, '_blank', 'noopener,noreferrer');
    setHasShared(true);
    onShared();
  };

  const canClose = !mandatory || hasShared;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md rounded-2xl border p-8 text-center"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
          >
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>{title}</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>{subtitle}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {platforms.map((pid) => {
                const meta = PLATFORM_META[pid];
                return (
                  <button
                    key={pid}
                    onClick={() => handleShare(pid)}
                    className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition hover:brightness-110"
                    style={{ backgroundColor: meta.bg, color: meta.fg }}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {secondaryAction && (
              <a
                href={secondaryAction.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-xl border px-4 py-3 text-sm font-bold transition hover:border-[var(--gold)]"
                style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
              >
                {secondaryAction.label}
              </a>
            )}

            <div className="mt-6">
              {canClose ? (
                <button
                  onClick={onShared}
                  className="text-sm font-medium underline"
                  style={{ color: 'var(--muted)' }}
                >
                  {mandatory ? 'Done, close' : 'Close'}
                </button>
              ) : (
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Choose one platform above to continue.
                </p>
              )}
              {!mandatory && onSkip && (
                <button onClick={onSkip} className="mt-2 block mx-auto text-xs" style={{ color: 'var(--muted)' }}>
                  Skip for now
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
