'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Site-wide scroll pair: round down-arrow (to bottom) + up-arrow (to top),
// fixed bottom-left, on every page (mounted in app/layout.tsx).
// Dashboard pages scroll inside an overflow-y-auto container, not the
// window; scroll events don't bubble but they reach window listeners in the
// capture phase with e.target = the container, so both cases are handled.
export function ScrollToBottom() {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [scrollable, setScrollable] = useState(false);
  const targetRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    const metrics = (t: EventTarget | null) => {
      if (!t || t === window || t === document || t === document.documentElement) {
        const doc = document.documentElement;
        return {
          y: window.scrollY,
          vh: window.innerHeight,
          dh: doc.scrollHeight,
          scrollable: doc.scrollHeight > window.innerHeight * 1.2,
        };
      }
      const el = t as HTMLElement;
      return {
        y: el.scrollTop,
        vh: el.clientHeight,
        dh: el.scrollHeight,
        scrollable: el.scrollHeight > el.clientHeight * 1.2,
      };
    };

    const check = (t: EventTarget | null) => {
      targetRef.current = t ?? window;
      const m = metrics(t);
      setScrollable(m.scrollable);
      setAtTop(m.y < 80);
      setAtBottom(m.dh - (m.y + m.vh) < 80);
    };

    const onScroll = (e: Event) => check(e.target);
    const onResize = () => check(targetRef.current);

    check(window);
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const scrollTo = (end: 'top' | 'bottom') => {
    const t = targetRef.current;
    if (!t || t === window || t === document || t === document.documentElement) {
      window.scrollTo({
        top: end === 'bottom' ? document.documentElement.scrollHeight : 0,
        behavior: 'smooth',
      });
      return;
    }
    const el = t as HTMLElement;
    el.scrollTo({ top: end === 'bottom' ? el.scrollHeight : 0, behavior: 'smooth' });
  };

  const btnClass =
    'flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-shadow hover:shadow-xl';
  const btnStyle = {
    backgroundColor: 'var(--bg-soft)',
    borderColor: 'var(--border)',
  } as const;
  const iconProps = {
    className: 'h-5 w-5',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { color: 'var(--gold)' },
  };

  if (!scrollable) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {!atBottom && (
          <motion.button
            key="down"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => scrollTo('bottom')}
            aria-label="Scroll to bottom"
            title="Scroll to bottom"
            className={btnClass}
            style={btnStyle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <svg {...iconProps}>
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!atTop && (
          <motion.button
            key="up"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => scrollTo('top')}
            aria-label="Scroll to top"
            title="Scroll to top"
            className={btnClass}
            style={btnStyle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <svg {...iconProps}>
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
