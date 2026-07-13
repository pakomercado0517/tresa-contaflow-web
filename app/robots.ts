import type { MetadataRoute } from 'next';

const SITE_URL = 'https://contafy.com.mx';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/privacidad', '/auth/register'],
      disallow: [
        '/dashboard/',
        '/auth/',
        '/subscription/',
        '/internal/',
        '/public/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
