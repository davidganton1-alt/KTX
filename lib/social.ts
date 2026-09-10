export type PlatformId = 'x' | 'facebook' | 'instagram' | 'tiktok' | 'whatsapp' | 'github' | 'trustpilot';

// ── SWAP THESE WITH REAL PROFILE URLs IN THE FINAL PASS ──
export const SOCIAL_URLS: Record<string, string> = {
  x: 'https://x.com/KingdomTradeX',
  github: 'https://github.com/KingdomTradeX',
  trustpilot: 'https://www.trustpilot.com/review/kingdomtradex.com',
  instagram: 'https://instagram.com/KingdomTradeX',
  tiktok: 'https://tiktok.com/@KingdomTradeX',
};

export interface PlatformMeta {
  id: PlatformId;
  label: string;
  bg: string;
  fg: string;
}

export const PLATFORM_META: Record<PlatformId, PlatformMeta> = {
  x: { id: 'x', label: 'X', bg: '#000000', fg: '#ffffff' },
  facebook: { id: 'facebook', label: 'Facebook', bg: '#1877F2', fg: '#ffffff' },
  instagram: { id: 'instagram', label: 'Instagram', bg: '#E4405F', fg: '#ffffff' },
  tiktok: { id: 'tiktok', label: 'TikTok', bg: '#010101', fg: '#ffffff' },
  whatsapp: { id: 'whatsapp', label: 'WhatsApp', bg: '#25D366', fg: '#ffffff' },
  github: { id: 'github', label: 'GitHub', bg: '#181717', fg: '#ffffff' },
  trustpilot: { id: 'trustpilot', label: 'Trustpilot', bg: '#00B67A', fg: '#ffffff' },
};

export function getShareUrl(platform: PlatformId, pageUrl: string, text: string): string {
  switch (platform) {
    case 'x':
      return 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(pageUrl);
    case 'facebook':
      return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrl);
    case 'whatsapp':
      return 'https://wa.me/?text=' + encodeURIComponent(text + ' ' + pageUrl);
    case 'instagram':
      return SOCIAL_URLS.instagram;
    case 'tiktok':
      return SOCIAL_URLS.tiktok;
    case 'trustpilot':
      return SOCIAL_URLS.trustpilot;
    default:
      return pageUrl;
  }
}
