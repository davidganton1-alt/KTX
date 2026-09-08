import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/console',
          '/pastor',
          '/admin',
          '/login',
          '/register',
          '/api/',
          '/waitlist' 
        ],
      },
    ],
    sitemap: 'https://kingdomtradex.com/sitemap.xml',
  };
}
