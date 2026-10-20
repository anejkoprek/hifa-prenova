// Statični izseki pročelja (A–D) kot SVG slike: /procelje/A ... /procelje/D.
// Ločeno od HTML-ja, da se risba ne pošilja z vsako stranjo in se shrani v predpomnilnik.
import { izbor, okvirDela, privzetaIzbira, risiProcelje, type DelId } from '@/lib/risbe/procelje';

export const dynamic = 'force-static';
const DELI: DelId[] = ['A', 'B', 'C', 'D'];

export function generateStaticParams() {
  return DELI.map((del) => ({ del }));
}

// Barve iz app/globals.css (zunanja SVG slika ne vidi CSS spremenljivk strani).
const BARVE: Record<string, string> = {
  '--p-crta': '#262b2e',
  '--p-rob': 'rgba(0,0,0,0.45)',
  '--p-zid': '#f7f7f3',
  '--p-cokl': '#d3d6cf',
  '--p-beton': '#cdd0c9',
  '--p-streha': '#575c60',
  '--p-streha-crta': '#414649',
  '--p-dimnik': '#e2e3de',
  '--p-okvir': '#2f3437',
  '--p-okno': '#a4b5ba',
  '--p-rolo': '#e4e5e0',
  '--p-polica': '#c6c9c3',
  '--p-vrata': '#52575a',
  '--p-steklo': 'rgba(120,165,180,0.34)',
  '--p-odsev': 'rgba(255,255,255,0.78)',
};

export async function GET(_: Request, { params }: { params: Promise<{ del: string }> }) {
  const { del } = await params;
  if (!DELI.includes(del as DelId)) return new Response('Ni najdeno', { status: 404 });
  const d = del as DelId;
  const vb = okvirDela(d, 4 / 3);
  const telo = risiProcelje(privzetaIzbira)
    .replace(/var\((--p-[a-z-]+)\)/g, (_m, k: string) => BARVE[k] ?? '#000')
    .replace(/vector-effect="non-scaling-stroke"/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" width="${Math.round(vb.w)}" height="${Math.round(vb.h)}"><rect x="${vb.x}" y="${vb.y}" width="${vb.w}" height="${vb.h}" fill="#fbfbf9"/>${telo}${(() => { const b = izbor(d); return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="#91bd30" fill-opacity="0.1" stroke="#45620f" stroke-opacity="0.7" stroke-dasharray="${(vb.w / 120).toFixed(1)} ${(vb.w / 120).toFixed(1)}" stroke-width="${(vb.w / 700).toFixed(2)}"/><path d="${b.koti}" fill="none" stroke="#91bd30" stroke-width="${(vb.w / 200).toFixed(1)}" stroke-linecap="square"/>`; })()}</svg>`;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' },
  });
}
