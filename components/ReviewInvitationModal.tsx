'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TRUSTPILOT_CONFIG, INVITATION_MESSAGES } from '@/lib/trustpilot';

interface ReviewInvitationModalProps {
  open: boolean;
  triggerType: keyof typeof INVITATION_MESSAGES;
  onClose: () => void;
  onInvited: () => void;
}

export function ReviewInvitationModal({ open, triggerType, onClose, onInvited }: ReviewInvitationModalProps) {
  const message = INVITATION_MESSAGES[triggerType];

  const handleWriteReview = async () => {
    try {
      const res = await fetch('/api/trustpilot/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ triggerType }),
      });
      
      if (res.ok) {
        window.open(TRUSTPILOT_CONFIG.profileUrl, '_blank', 'noopener,noreferrer');
        onInvited();
      } else {
        // Not eligible / cooling down: still allow the user to write a review (compliant, no filtering)
        window.open(TRUSTPILOT_CONFIG.profileUrl, '_blank', 'noopener,noreferrer');
        onInvited();
      }
    } catch (error) {
      console.error('Failed to send invitation:', error);
      window.open(TRUSTPILOT_CONFIG.profileUrl, '_blank', 'noopener,noreferrer');
      onInvited();
    }
  };

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
            className="w-full max-w-md rounded-2xl border p-8"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)' }}
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#00B67A' }}>
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0l2.6 8h8.4l-6.8 4.94L18.8 21 12 16.06 5.2 21l2.6-8.06L1 8h8.4z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--fg)' }}>
                {message.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {message.message}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleWriteReview}
                className="w-full rounded-xl px-6 py-3 text-sm font-bold transition hover:brightness-110"
                style={{ backgroundColor: '#00B67A', color: 'white' }}
              >
                Write a Review on Trustpilot
              </button>
              <button
                onClick={onClose}
                className="w-full rounded-xl border px-6 py-3 text-sm font-medium transition hover:border-[var(--gold)]"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                Maybe Later
              </button>
            </div>

            <p className="mt-4 text-xs text-center" style={{ color: 'var(--muted)' }}>
              Reviews are posted on Trustpilot, an independent review platform.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
