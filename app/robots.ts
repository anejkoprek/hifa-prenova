import type { MetadataRoute } from 'next';
import { podjetje } from '@/lib/podjetje';

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }], sitemap: `${podjetje.url}/sitemap.xml` };
}
