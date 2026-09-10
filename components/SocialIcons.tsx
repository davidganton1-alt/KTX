'use client';

import { motion } from 'framer-motion';
import { SOCIAL_URLS } from '@/lib/social';

const icons = [
  {
    id: 'email',
    label: 'Email',
    url: 'mailto:support@kingdomtradex.com',
    hoverColor: '#EA4335',
    path: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  },
  {
    id: 'x',
    label: 'X',
    url: SOCIAL_URLS.x,
    hoverColor: '#000000',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    id: 'github',
    label: 'GitHub',
    url: SOCIAL_URLS.github,
    hoverColor: '#181717',
    path: 'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z',
  },
  {
    id: 'trustpilot',
    label: 'Trustpilot',
    url: SOCIAL_URLS.trustpilot,
    hoverColor: '#00B67A',
    path: 'M12 0l2.6 8h8.4l-6.8 4.94L18.8 21 12 16.06 5.2 21l2.6-8.06L1 8h8.4z',
  },
];

export function SocialIcons() {
  return (
    <div className="flex items-center gap-4">
      {icons.map((icon) => (
        <motion.a
          key={icon.id}
          href={icon.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={icon.label}
          className="group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300"
          style={{ backgroundColor: 'var(--bg-soft)', borderColor: 'var(--border)', borderWidth: '1px' }}
          whileHover={{ scale: 1.15, y: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-20"
            style={{ backgroundColor: icon.hoverColor }}
          />
          <svg
            className="relative h-5 w-5 transition-all duration-300"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: 'var(--muted)' }}
          >
            <path d={icon.path} className="transition-all duration-300 group-hover:fill-current" />
          </svg>
          <div
            className="absolute inset-0 rounded-full opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-50"
            style={{ backgroundColor: icon.hoverColor }}
          />
        </motion.a>
      ))}
    </div>
  );
}
