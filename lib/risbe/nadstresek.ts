// Aksonometrična risba nadstreška (SVG kot niz). Mere v metrih.
import { fmtM } from './ograja';

export type TipNadstreska = 'box' | 'enokapnica';
export type Postavitev = 'ob-objektu' | 'samostojen';
export type Kritina = 'steklo' | 'polikarbonat' | 'trapezna' | 'folija';

export interface NadstresekOpts {
  tip: TipNadstreska;
  postavitev: Postavitev;
  sirina: number;
  globina: number;
  visina?: number; // svetla višina v m
  kritina: Kritina;
  barva: string;
  stranLevo?: boolean;
  stranDesno?: boolean;
  stenaTip?: 'lamele' | 'mehanske';
  stenaSmer?: 'vertikalne' | 'horizontalne';
  w?: number;
  h?: number;
  id?: string;
  brezKot?: boolean;
}

type P3 = [number, number, number];
const n = (v: number) => Math.round(v * 10) / 10;

export function risiNadstresek(o: NadstresekOpts): string {
  const W = o.w ?? 1000;
  const H = o.h ?? 620;
  const uid = o.id ?? 'ns';
  const Wm = Math.min(Math.max(o.sirina, 2), 12);
  const Dm = Math.min(Math.max(o.globina, 1.5), 8);
  const hp = Math.min(Math.max(o.visina ?? 2.4, 2.1), 3.2);
  const tF = o.tip === 'box' ? 0.24 : 0.14;
  const rise = o.tip === 'enokapnica' ? Math.max(0.2, Dm * 0.07) : 0;
  const ob = o.postavitev === 'ob-objektu';
  const kos = Math.cos((32 * Math.PI) / 180) * 0.5;
  const ksi = Math.sin((32 * Math.PI) / 180) * 0.5;
  const fs = Math.max(W * 0.024, 22);

  // ---- normalizacija: najprej zberemo ključne točke ----
  const raw = ([x, y, z]: P3): [number, number] => [x + y * kos, -(z + y * ksi)];
  const key: P3[] = [
    [0, 0, 0], [Wm, 0, 0], [Wm, Dm, 0], [0, Dm, 0],
    [0, 0, hp + tF + rise + 0.05], [Wm, Dm, hp + tF + rise + 0.05],
    [-0.5, 0, -0.55], [Wm + 0.9, 0, -0.55],
  ];
  if (ob) key.push([-0.7, Dm, hp + tF + rise + 0.9], [Wm + 0.7, Dm, 0]);
  const rp = key.map(raw);
  const minX = Math.min(...rp.map((p) => p[0])) - 0.75;
  const maxX = Math.max(...rp.map((p) => p[0])) + 0.15;
  const minY = Math.min(...rp.map((p) => p[1])) - 0.1;
  const maxY = Math.max(...rp.map((p) => p[1])) + 0.25;
  const pad = W * 0.05;
  const s = Math.min((W - 2 * pad) / (maxX - minX), (H - 2 * pad) / (maxY - minY));
  const offX = pad + (W - 2 * pad - (maxX - minX) * s) / 2 - minX * s;
  const offY = pad + (H - 2 * pad - (maxY - minY) * s) / 2 - minY * s;
  const P = (p: P3): [number, number] => {
    const [a, b] = raw(p);
    return [offX + a * s, offY + b * s];
  };
  const pts = (arr: P3[]) => arr.map((p) => P(p).map(n).join(',')).join(' ');
  const line = (a: P3, b: P3, attrs: string) => {
    const [x1, y1] = P(a), [x2, y2] = P(b);
    return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ${attrs}/>`;
  };

  const barva = o.barva;
  const edge = 'stroke="var(--draw-edge)" stroke-width="0.8"';
  const out: string[] = [];
  const defs: string[] = [];

  // tla
  out.push(`<polygon points="${pts([[-0.6, -0.4, 0], [Wm + 0.6, -0.4, 0], [Wm + 0.6, Dm + (ob ? 0 : 0.5), 0], [-0.6, Dm + (ob ? 0 : 0.5), 0]])}" fill="var(--draw-ground)" stroke="var(--draw-line)" stroke-width="1"/>`);

  // stena objekta
  if (ob) {
    const zTop = hp + tF + rise + 0.9;
    out.push(`<polygon points="${pts([[-0.7, Dm, 0], [Wm + 0.7, Dm, 0], [Wm + 0.7, Dm, zTop], [-0.7, Dm, zTop]])}" fill="var(--draw-concrete)" stroke="var(--draw-line)" stroke-width="1"/>`);
    const dx = Math.min(Wm * 0.5, Wm - 1.2);
    out.push(`<polygon points="${pts([[dx, Dm, 0], [dx + 1.0, Dm, 0], [dx + 1.0, Dm, 2.1], [dx, Dm, 2.1]])}" fill="var(--draw-line)" opacity="0.55"/>`);
    if (Wm > 3.2) out.push(`<polygon points="${pts([[0.6, Dm, 0.95], [1.9, Dm, 0.95], [1.9, Dm, 2.2], [0.6, Dm, 2.2]])}" fill="var(--draw-glass)" stroke="var(--draw-line)" stroke-width="1"/>`);
  }

  // stebri: od širine 6 m dalje vmesni steber na sredini
  const nSpans = Wm >= 6 ? 2 : 1;
  const xs = Array.from({ length: nSpans + 1 }, (_, i) => (i * Wm) / nSpans);
  const pw = 0.11;
  const steber = (x: number, y: number) => {
    const x0 = Math.min(Math.max(x - pw / 2, 0), Wm - pw);
    out.push(`<polygon points="${pts([[x0 + pw, y, 0], [x0 + pw, y + pw, 0], [x0 + pw, y + pw, hp], [x0 + pw, y, hp]])}" fill="${barva}" ${edge} style="filter:brightness(0.8)"/>`);
    out.push(`<polygon points="${pts([[x0, y, 0], [x0 + pw, y, 0], [x0 + pw, y, hp], [x0, y, hp]])}" fill="${barva}" ${edge}/>`);
  };
  if (!ob) xs.forEach((x) => steber(x, Dm - pw));

  // stranske stene: lamele v okvirju, prekati po 1,5 m
  const stena = (x: number) => {
    const zTopF = hp, zTopB = hp + (o.tip === 'enokapnica' ? rise : 0);
    const zTop = (y: number) => zTopF + ((zTopB - zTopF) * y) / Dm;
    const z0 = 0.06;
    const y0 = 0.05, y1 = Dm - 0.05;
    const meh = o.stenaTip === 'mehanske';
    const sid = `${uid}-st-${Math.round(x * 100)}`;
    const obris: P3[] = [[x, y0, z0], [x, y1, z0], [x, y1, zTop(y1)], [x, y0, zTop(y0)]];
    defs.push(`<clipPath id="${sid}"><polygon points="${pts(obris)}"/></clipPath>`);
    const lam: string[] = [];
    lam.push(`<polygon points="${pts(obris)}" fill="var(--draw-bg)" opacity="0.55"/>`);
    if (o.stenaSmer === 'horizontalne') {
      const korak = meh ? 0.11 : 0.085;
      for (let z = z0 + 0.03; z < zTopB; z += korak) {
        lam.push(line([x, y0, z], [x, y1, z], `stroke="${barva}" stroke-width="${n(Math.max(2, (meh ? 0.05 : 0.04) * s))}"`));
        if (meh) lam.push(line([x, y0, z + 0.025], [x, y1, z + 0.025], 'stroke="var(--draw-glare)" stroke-width="1" opacity="0.8"'));
      }
    } else {
      const korak = meh ? 0.12 : 0.09;
      for (let y = y0 + 0.04; y < y1; y += korak) {
        lam.push(line([x, y, z0], [x, y, zTop(y)], `stroke="${barva}" stroke-width="${n(Math.max(2, (meh ? 0.05 : 0.035) * s))}"`));
        if (meh) lam.push(line([x, y + 0.03, z0], [x, y + 0.03, zTop(y)], 'stroke="var(--draw-glare)" stroke-width="1" opacity="0.8"'));
      }
    }
    out.push(`<g clip-path="url(#${sid})">${lam.join('')}</g>`);
    // okvir in prekati po 1,5 m
    const nP = Math.max(1, Math.ceil((y1 - y0) / 1.5));
    for (let i = 0; i <= nP; i++) {
      const y = y0 + ((y1 - y0) * i) / nP;
      out.push(line([x, y, z0], [x, y, zTop(y)], `stroke="${barva}" stroke-width="${n(Math.max(3, 0.06 * s))}" style="filter:brightness(0.85)"`));
    }
    out.push(line([x, y0, z0], [x, y1, z0], `stroke="${barva}" stroke-width="${n(Math.max(3, 0.05 * s))}" style="filter:brightness(0.85)"`));
  };
  if (o.stranLevo) stena(0.02);

  // ---- streha ----
  const zF = hp + tF; // vrh strehe spredaj
  const zB = hp + tF + rise; // vrh strehe zadaj
  const roof: P3[] = [[0, 0, zF], [Wm, 0, zF], [Wm, Dm, zB], [0, Dm, zB]];
  const ins = o.tip === 'box' ? 0.14 : 0.02;
  const zAt = (y: number) => zF + (rise * y) / Dm;
  const inner: P3[] = [[ins, ins, zAt(ins)], [Wm - ins, ins, zAt(ins)], [Wm - ins, Dm - ins, zAt(Dm - ins)], [ins, Dm - ins, zAt(Dm - ins)]];

  // okvir: zgornja ploskev (obroč okoli kritine)
  const pathOf = (arr: P3[]) => 'M ' + arr.map((p) => P(p).map(n).join(' ')).join(' L ') + ' Z';
  out.push(`<path d="${pathOf(roof)} ${pathOf(inner)}" fill="${barva}" fill-rule="evenodd" ${edge}/>`);
  // kritina
  const cid = `${uid}-kr`;
  defs.push(`<clipPath id="${cid}"><polygon points="${pts(inner)}"/></clipPath>`);
  const kr: string[] = [];
  const along = (x: number, attrs: string) => line([x, ins, zAt(ins)], [x, Dm - ins, zAt(Dm - ins)], attrs);
  const across = (y: number, attrs: string) => line([ins, y, zAt(y)], [Wm - ins, y, zAt(y)], attrs);
  switch (o.kritina) {
    case 'steklo':
      kr.push(`<polygon points="${pts(inner)}" fill="var(--draw-bg)"/>`);
      kr.push(`<polygon points="${pts(inner)}" fill="var(--draw-glass)"/>`);
      for (let i = 0.15; i < 0.9; i += 0.35) kr.push(line([Wm * i, Dm * 0.15, zAt(Dm * 0.15)], [Wm * (i + 0.12), Dm * 0.85, zAt(Dm * 0.85)], 'stroke="var(--draw-glare)" stroke-width="2.5" stroke-linecap="round"'));
      break;
    case 'polikarbonat':
      kr.push(`<polygon points="${pts(inner)}" fill="var(--draw-opal)"/>`);
      for (let x = ins; x < Wm; x += 0.1) kr.push(along(x, 'stroke="var(--draw-line)" stroke-width="0.6" opacity="0.7"'));
      break;
    case 'trapezna':
      kr.push(`<polygon points="${pts(inner)}" fill="var(--draw-metal)"/>`);
      for (let x = ins; x < Wm; x += 0.19) kr.push(along(x, 'stroke="var(--draw-edge)" stroke-width="2.2"'), along(x + 0.06, 'stroke="var(--draw-glare)" stroke-width="1"'));
      break;
    case 'folija':
      kr.push(`<polygon points="${pts(inner)}" fill="var(--draw-membrane)"/>`);
      for (let y = 1.2; y < Dm; y += 1.2) kr.push(across(y, 'stroke="var(--draw-edge)" stroke-width="0.8"'));
      break;
  }
  if (o.kritina === 'steklo' || o.kritina === 'polikarbonat') {
    const nR = Math.max(2, Math.ceil(Wm / 0.95));
    for (let i = 1; i < nR; i++) kr.push(along((i * Wm) / nR, `stroke="${barva}" stroke-width="${n(Math.max(2.5, 0.05 * s))}"`));
  }
  out.push(`<g clip-path="url(#${cid})">${kr.join('')}</g>`);
  if (o.tip === 'box') out.push(`<polygon points="${pts(inner)}" fill="none" stroke="var(--draw-edge)" stroke-width="1"/>`);

  // okvir: sprednja in desna ploskev
  out.push(`<polygon points="${pts([[Wm, 0, hp], [Wm, Dm, hp + rise], [Wm, Dm, zB], [Wm, 0, zF]])}" fill="${barva}" ${edge} style="filter:brightness(0.82)"/>`);
  out.push(`<polygon points="${pts([[0, 0, hp], [Wm, 0, hp], [Wm, 0, zF], [0, 0, zF]])}" fill="${barva}" ${edge}/>`);
  if (o.tip === 'enokapnica') {
    // viden žleb spredaj
    out.push(`<polygon points="${pts([[-0.1, -0.16, hp - 0.06], [Wm + 0.36, -0.16, hp - 0.06], [Wm + 0.36, -0.16, hp + 0.1], [-0.1, -0.16, hp + 0.1]])}" fill="${barva}" ${edge} style="filter:brightness(1.4)"/>`);
    out.push(line([-0.1, -0.16, hp + 0.1], [Wm + 0.36, -0.16, hp + 0.1], 'stroke="var(--draw-glare)" stroke-width="1.4"'));
  }

  if (o.stranDesno) stena(Wm - 0.02);

  // sprednji stebri
  xs.forEach((x) => steber(x, 0));
  if (o.tip === 'enokapnica') {
    // odtočna cev ob desnem sprednjem stebru
    const cx = Wm + 0.3;
    out.push(line([cx, -0.16, hp - 0.06], [cx, -0.16, 0.18], `stroke="${barva}" stroke-width="${n(Math.max(3, 0.07 * s))}" stroke-linecap="round" style="filter:brightness(1.4)"`));
    out.push(line([cx, -0.16, 0.18], [cx, -0.36, 0.06], `stroke="${barva}" stroke-width="${n(Math.max(3, 0.07 * s))}" stroke-linecap="round" style="filter:brightness(1.4)"`));
  } else {
    // box: odtok skozi steber, spodaj kratka cevka
    for (const x of [xs[0], xs[xs.length - 1]]) {
      const xc = Math.min(Math.max(x, pw / 2), Wm - pw / 2);
      out.push(line([xc, 0, 0.16], [xc, -0.16, 0.16], `stroke="${barva}" stroke-width="${n(Math.max(2.5, 0.045 * s))}" stroke-linecap="round" style="filter:brightness(1.15)"`));
    }
  }

  // ---- kote ----
  if (!o.brezKot) {
    const kota = (a: P3, b: P3, label: string, off: P3, spodaj = false) => {
      const A = P([a[0] + off[0], a[1] + off[1], a[2] + off[2]]);
      const B = P([b[0] + off[0], b[1] + off[1], b[2] + off[2]]);
      const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      const ang = (Math.atan2(B[1] - A[1], B[0] - A[0]) * 180) / Math.PI;
      const t = 8;
      const nx = -Math.sin((ang * Math.PI) / 180) * t, ny = Math.cos((ang * Math.PI) / 180) * t;
      return `<g class="kota"><line x1="${n(A[0])}" y1="${n(A[1])}" x2="${n(B[0])}" y2="${n(B[1])}"/><line x1="${n(A[0] - nx)}" y1="${n(A[1] - ny)}" x2="${n(A[0] + nx)}" y2="${n(A[1] + ny)}"/><line x1="${n(B[0] - nx)}" y1="${n(B[1] - ny)}" x2="${n(B[0] + nx)}" y2="${n(B[1] + ny)}"/><text x="${n(mx)}" y="${n(spodaj ? my + fs + 4 : my - 10)}" text-anchor="middle" font-size="${n(fs)}" transform="rotate(${n(Math.abs(ang) > 90 ? ang + 180 : ang)} ${n(mx)} ${n(my)})">${label}</text></g>`;
    };
    out.push(kota([0, 0, 0], [Wm, 0, 0], fmtM(Wm), [0, -0.75, 0], true));
    out.push(kota([Wm, 0, 0], [Wm, Dm, 0], fmtM(Dm), [0.75, 0, 0]));
    out.push(kota([0, 0, 0], [0, 0, hp], `${hp.toLocaleString('sl-SI', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} m`, [-0.55, 0, 0]));
  }

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="risba" role="img" aria-label="Risba nadstreška"><defs>${defs.join('')}</defs>${out.join('')}</svg>`;
}
