import type { MetadataRoute } from 'next';
import { podjetje } from '@/lib/podjetje';

// osnutek (npr. na Vercelu) je zaprt za iskalnike; ob objavi na hifa.si nastavi NEXT_PUBLIC_OBJAVA=1
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_OBJAVA !== '1') return { rules: [{ userAgent: '*', disallow: '/' }] };
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }], sitemap: `${podjetje.url}/sitemap.xml` };
}
