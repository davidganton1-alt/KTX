'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ScrollToBottom() {
  const [show, setShow] = useState(false);
  const [pageHeight, setPageHeight] = useState(0);

  useEffect(() => {
    const checkHeight = () => {
      const height = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      setPageHeight(height);
      setShow(false);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const distanceFromBottom = docHeight - (scrollY + viewportHeight);

      if (docHeight > viewportHeight * 1.5 && scrollY < 300) {
        setShow(true);
      } else if (distanceFromBottom < 200) {
        setShow(false);
      }
    };

    checkHeight();
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkHeight);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkHeight);
    };
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  if (pageHeight > 0 && pageHeight < window.innerHeight * 1.5) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToBottom}
          className="fixed top-24 right-6 z-50 group flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-all duration-300 hover:shadow-xl"
          style={{
            backgroundColor: 'var(--bg-soft)',
            borderColor: 'var(--border)',
            borderWidth: '1px',
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <svg
              className="h-5 w-5 transition-colors duration-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--gold)' }}
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </motion.div>
          <span
            className="text-sm font-semibold transition-colors duration-300"
            style={{ color: 'var(--fg)' }}
          >
            Scroll to bottom
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
