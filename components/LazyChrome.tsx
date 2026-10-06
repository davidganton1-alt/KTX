'use client';

import dynamic from 'next/dynamic';

// Phase O.1: decorative site chrome (scroll buttons, progress bar, orb
// background, social icons) all pull framer-motion. Dynamically importing
// them here keeps framer-motion OUT of the global base bundle — each page
// ships it only if its own content uses motion. These are purely visual,
// so client-only mount (ssr:false) is safe: they appear right after hydrate.
const ScrollToBottom = dynamic(() => import('./ScrollToBottom').then((m) => ({ default: m.ScrollToBottom })), { ssr: false });
const ScrollProgress = dynamic(() => import('./ScrollProgress').then((m) => ({ default: m.ScrollProgress })), { ssr: false });
const ParallaxOrbs = dynamic(() => import('./ParallaxOrbs').then((m) => ({ default: m.ParallaxOrbs })), { ssr: false });
const ChatWidgetConditional = dynamic(() => import('./ChatWidget').then((m) => ({ default: m.ChatWidgetConditional })), { ssr: false });

export function LazyChrome() {
  return (
    <>
      <ScrollProgress />
      <ParallaxOrbs />
      <ScrollToBottom />
      <ChatWidgetConditional />
    </>
  );
}
