import type { MetadataRoute } from 'next';
import { galerije } from '@/lib/galerije';
import { podjetje } from '@/lib/podjetje';

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (p: string, priority = 0.7) => ({ url: `${podjetje.url}${p}`, lastModified: new Date(), priority });
  return [
    u('', 1),
    u('/ograje', 0.9),
    u('/nadstreski', 0.9),
    u('/stopnisca', 0.9),
    u('/storitve', 0.8),
    u('/holler-diy', 0.8),
    u('/konfigurator', 0.8),
    u('/proizvodi'),
    u('/galerije', 0.8),
    ...galerije.map((g) => u(`/galerije/${g.slug}`, 0.6)),
    u('/o-nas'),
    u('/kontakt', 0.8),
    u('/sofinanciranje', 0.3),
    u('/pravno-obvestilo', 0.2),
  ];
}
