// Tehnična risba ograje v pogledu od spredaj (SVG kot niz). Brez odvisnosti, deluje v brskalniku in ob buildu.
// Vse mere so v metrih, s = merilo v px na meter.

import { obl, oblikeSvg, type Vzorec } from '../vzorci';
import { odsekiZarkov, type VzorecZarkov } from '../zarki';

export type TipOgraje = 'balkonska' | 'dvoriscna' | 'stopniscna-zunanja' | 'stopniscna-notranja';
export type Polnilo = 'palicna' | 'vertikalne' | 'horizontalne' | 'zarki' | 'steklo' | 'perforirana';
export type Montaza = 'vrh' | 'stran' | 'podzidek' | 'temelj';
export type Vrata = 'brez' | 'krilna' | 'drsna' | 'samonosna';

export interface OgrajaOpts {
  tip: TipOgraje;
  polnilo: Polnilo;
  dolzina: number;
  /** vodoravni del na podestu (stopnišča), m */
  podest?: number;
  visina: number; // cm, od tal do vrha
  barva: string;
  montaza: Montaza;
  vrata?: Vrata;
  sirinaVrat?: number;
  osebniPrehod?: boolean;
  pogon?: boolean;
  /** razmik nosilnih stebrov, m */
  razmikStebrov?: number;
  /** svetli razmik med letvicami / palicami, cm */
  razmikPolnila?: number;
  /** palice: ročaj zgoraj ali odprte palice z vodoravno šipko */
  zakljucek?: 'rocaj' | 'odprto';
  /** višina vodoravne šipke od tal, cm */
  sipka?: number;
  /** perforirana pločevina: vzorec izreza */
  vzorec?: Vzorec;
  /** žarki: izvedba */
  zarki?: VzorecZarkov;
  /** montaža s strani: polja na nosilni plošči brez stebričkov */
  brezStebrickov?: boolean;
  /** montaža s strani: ograja sega pod nivo tal, cm */
  podaljsek?: number;
  w?: number;
  h?: number;
  id?: string;
  brezKot?: boolean;
}

const n = (v: number) => Math.round(v * 10) / 10;
export const fmtM = (m: number) =>
  `${m.toLocaleString('sl-SI', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} m`;

export function risiOgrajo(o: OgrajaOpts): string {
  const W = o.w ?? 1000;
  const H = o.h ?? 560;
  const uid = o.id ?? 'og';
  const stopnice = o.tip === 'stopniscna-zunanja' || o.tip === 'stopniscna-notranja';
  const dvorisce = o.tip === 'dvoriscna';
  const r = stopnice ? 0.6 : 0;
  const stopOff = stopnice ? 0.168 : 0;
  const visina = Math.min(Math.max(o.visina, 60), 220) / 100;
  const stran = o.tip === 'balkonska' && o.montaza === 'stran';
  const podaljsek = stran ? Math.min(Math.max(o.podaljsek ?? 0, 0), 40) / 100 : 0;
  // s strani: spodnji rob poravnan s tlemi (0) ali nižje čez čelo plošče
  // odprte palice: brez stebrov in spodnje letve, vse palice enake in sidrane posebej (od tal oz. plošče)
  const odprte = (o.polnilo === 'palicna' || o.polnilo === 'vertikalne') && o.zakljucek === 'odprto';
  const clearance = stran ? -podaljsek : odprte ? 0 : dvorisce ? 0.05 : 0.06;
  const brezStebrov = stran && !!o.brezStebrickov;
  const razmik = (privzeto: number) => (o.razmikPolnila && o.razmikPolnila > 0 ? o.razmikPolnila / 100 : privzeto);
  const hm = visina - clearance;
  const vrata = dvorisce ? o.vrata ?? 'brez' : 'brez';
  const gate = vrata !== 'brez' ? Math.min(Math.max(o.sirinaVrat ?? 4, 1), 8) : 0;
  const prehod = dvorisce && o.osebniPrehod ? 1.0 : 0;
  const gap = 0.14;
  const maxPrikaz = stopnice ? 12 : dvorisce ? Math.max(3, 12 - gate - prehod) : 10;
  const dolzina = Math.max(o.dolzina, 0.5);
  const Ls = Math.min(dolzina, maxPrikaz);
  // stopnišča: poševni del se ob dolgih stopnicah ne prekine, kota pove pravo mero
  const prekinjeno = !stopnice && dolzina > maxPrikaz + 0.001;
  const podestPravi = stopnice ? Math.max(0, o.podest ?? 0) : 0;
  const P = Math.min(podestPravi, 4);
  const xPrehod = Ls + gap;
  const xVrata = Ls + gap + (prehod ? prehod + gap : 0);
  const skupaj = Ls + P + (prehod ? prehod + gap : 0) + (gate ? gate + gap : 0);

  // podlaga pod ograjo
  const D = o.tip === 'balkonska' ? 0.22 : o.montaza === 'podzidek' ? 0.3 : 0.12;
  const totalH = D + stopOff + visina + Ls * r + 0.04;

  const mL = W * 0.1;
  const mR = W * 0.04;
  const mT = H * 0.07;
  const mB = H * 0.19;
  const s = Math.min((W - mL - mR) / (skupaj + 0.3), (H - mT - mB) / totalH);
  const ox = mL + (W - mL - mR - (skupaj + 0.3) * s) / 2 + 0.15 * s;
  const Fy = H - mB - D * s;

  const X = (x: number) => ox + x * s;
  const Yb = (x: number) => Fy - (stopOff + clearance + Math.min(x, Ls) * r) * s; // spodnji rob ograje (na podestu vodoraven)
  const Yt = (x: number) => Yb(x) - hm * s; // vrh ograje

  const barva = o.barva;
  const edge = 'var(--draw-edge)';
  const fs = Math.max(W * 0.026, 22);
  const parts: string[] = [];
  const defs: string[] = [];

  // ---------- podlaga ----------
  if (o.tip === 'balkonska') {
    parts.push(`<rect x="${n(X(-0.35))}" y="${n(Fy)}" width="${n((Ls + 0.7) * s)}" height="${n(0.22 * s)}" fill="var(--draw-concrete)" stroke="var(--draw-line)" stroke-width="1"/>`);
  } else if (dvorisce) {
    const end = skupaj + 0.35;
    if (o.montaza === 'podzidek') {
      parts.push(`<rect x="${n(X(-0.3))}" y="${n(Fy)}" width="${n((Ls + 0.3) * s)}" height="${n(0.3 * s)}" fill="var(--draw-concrete)" stroke="var(--draw-line)" stroke-width="1"/>`);
    }
    const gy = o.montaza === 'podzidek' ? Fy + 0.3 * s : Fy;
    parts.push(`<line x1="${n(X(-0.4))}" y1="${n(gy)}" x2="${n(X(end))}" y2="${n(gy)}" stroke="var(--draw-line)" stroke-width="2"/>`);
    parts.push(`<rect x="${n(X(-0.4))}" y="${n(gy)}" width="${n((end + 0.4) * s)}" height="${n(0.1 * s)}" fill="url(#${uid}-teren)"/>`);
    defs.push(`<pattern id="${uid}-teren" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="var(--draw-line)" stroke-width="1"/></pattern>`);
  } else {
    // stopnice
    const tread = 0.28;
    const rise = 0.168;
    const steps = Math.ceil(Ls / tread);
    let d = `M ${n(X(-0.45))} ${n(Fy)} L ${n(X(0))} ${n(Fy)}`;
    for (let i = 0; i < steps; i++) {
      d += ` L ${n(X(i * tread))} ${n(Fy - (i + 1) * rise * s)} L ${n(X((i + 1) * tread))} ${n(Fy - (i + 1) * rise * s)}`;
    }
    const topX = Math.max(steps * tread + 0.45, Ls + P + 0.25);
    d += ` L ${n(X(topX))} ${n(Fy - steps * rise * s)} L ${n(X(topX))} ${n(Fy)} Z`;
    parts.push(`<path d="${d}" fill="${o.tip === 'stopniscna-notranja' ? 'var(--draw-wood)' : 'var(--draw-concrete)'}" stroke="var(--draw-line)" stroke-width="1"/>`);
    parts.push(`<line x1="${n(X(-0.45))}" y1="${n(Fy)}" x2="${n(X(topX))}" y2="${n(Fy)}" stroke="var(--draw-line)" stroke-width="2"/>`);
  }

  // ---------- polnila ----------
  const poly = (pts: [number, number][]) => pts.map((p) => `${n(p[0])},${n(p[1])}`).join(' ');

  function polnilo(xa: number, xb: number, bottomFn: (x: number) => number, topFn: (x: number) => number, key: string, okvir = false) {
    const br = 0.04 * s;
    const tr = 0.03 * s;
    const p: [number, number][] = [
      [X(xa), bottomFn(xa) - br],
      [X(xb), bottomFn(xb) - br],
      [X(xb), topFn(xb) + tr],
      [X(xa), topFn(xa) + tr],
    ];
    const minX = X(xa), maxX = X(xb);
    const minY = Math.min(topFn(xa), topFn(xb)) + tr;
    const maxY = Math.max(bottomFn(xa), bottomFn(xb)) - br;
    const cid = `${uid}-c-${key}`;
    defs.push(`<clipPath id="${cid}"><polygon points="${poly(p)}"/></clipPath>`);
    const g: string[] = [];
    const slope = (bottomFn(xb) - bottomFn(xa)) / Math.max(xb - xa, 0.001);
    switch (o.polnilo) {
      case 'palicna': {
        const pb = odprte ? 0.04 : 0.03; // proste palice so kvadratne cevi 40 × 40
        const bw = Math.max(2, pb * s);
        for (let x = xa + (odprte ? 0.04 : 0.06); x < xb - 0.02; x += pb + razmik(0.09)) g.push(`<rect x="${n(X(x) - bw / 2)}" y="${n(minY - 2)}" width="${n(bw)}" height="${n(maxY - minY + 4)}" fill="${barva}" stroke="${edge}" stroke-width="0.6"/>`);
        break;
      }
      case 'vertikalne': {
        const pb = odprte ? 0.04 : 0.03;
        const bw = Math.max(1.6, pb * s);
        for (let x = xa + 0.04; x < xb - 0.02; x += pb + razmik(0.025)) g.push(`<rect x="${n(X(x) - bw / 2)}" y="${n(minY - 2)}" width="${n(bw)}" height="${n(maxY - minY + 4)}" fill="${barva}" stroke="${edge}" stroke-width="0.5"/>`);
        if (!odprte) okvir = true; // odprte letvice: brez okvirja zgoraj
        break;
      }
      case 'horizontalne': {
        const sw = Math.max(2, 0.05 * s);
        for (let d = 0.035; d < hm + 0.1; d += 0.05 + razmik(0.015)) {
          const y1 = bottomFn(xa) - d * s, y2 = y1 + slope * (xb - xa);
          g.push(`<line x1="${n(X(xa) - 2)}" y1="${n(y1)}" x2="${n(X(xb) + 2)}" y2="${n(y2)}" stroke="${barva}" stroke-width="${n(sw)}"/>`);
          g.push(`<line x1="${n(X(xa) - 2)}" y1="${n(y1 - sw / 2)}" x2="${n(X(xb) + 2)}" y2="${n(y2 - sw / 2)}" stroke="${edge}" stroke-width="0.6"/>`);
        }
        okvir = true;
        break;
      }
      case 'zarki': {
        const sw = Math.max(1.4, 0.012 * s);
        const visPolja = (bottomFn(xa) - topFn(xa)) / s;
        const seme = Number(key.replace(/\D/g, '')) || 0;
        for (const [x1, v1, x2, v2] of odsekiZarkov(o.zarki ?? 'pokoncni', xb - xa, visPolja, razmik(0.13), seme)) {
          g.push(`<line x1="${n(X(xa + x1))}" y1="${n(bottomFn(xa + x1) - v1 * s)}" x2="${n(X(xa + x2))}" y2="${n(bottomFn(xa + x2) - v2 * s)}" stroke="${barva}" stroke-width="${n(sw)}" stroke-linecap="round"/>`);
        }
        okvir = true;
        break;
      }
      case 'steklo': {
        g.push(`<polygon points="${poly(p)}" fill="var(--draw-glass)" stroke="${edge}" stroke-width="0.8"/>`);
        const w = maxX - minX, hgt = maxY - minY;
        g.push(`<line x1="${n(minX + w * 0.18)}" y1="${n(maxY - hgt * 0.15)}" x2="${n(minX + w * 0.42)}" y2="${n(minY + hgt * 0.2)}" stroke="var(--draw-glare)" stroke-width="${n(Math.max(2, 0.025 * s))}" stroke-linecap="round"/>`);
        g.push(`<line x1="${n(minX + w * 0.3)}" y1="${n(maxY - hgt * 0.12)}" x2="${n(minX + w * 0.46)}" y2="${n(minY + hgt * 0.42)}" stroke="var(--draw-glare)" stroke-width="${n(Math.max(1, 0.01 * s))}" stroke-linecap="round"/>`);
        break;
      }
      case 'perforirana': {
        // polna pločevina z izrezi izbranega vzorca; ploščica 1 m se ponavlja po dolžini in sledi naklonu
        g.push(`<polygon points="${poly(p)}" fill="${barva}" stroke="${edge}" stroke-width="0.6"/>`);
        const vz = o.vzorec ?? 'kvadrati';
        const Hm = Math.max(0.2, (bottomFn(xa) - topFn(xa)) / s - 0.04);
        if (vz === 'po-meri') {
          const cx = (X(xa) + X(xb)) / 2, cy = (bottomFn((xa + xb) / 2) + topFn((xa + xb) / 2)) / 2;
          const fsm = Math.max(10, Math.min(0.09 * s, (X(xb) - X(xa)) / 9));
          g.push(`<rect x="${n(cx - (X(xb) - X(xa)) * 0.36)}" y="${n(cy - Hm * s * 0.28)}" width="${n((X(xb) - X(xa)) * 0.72)}" height="${n(Hm * s * 0.56)}" rx="6" fill="none" stroke="var(--draw-bg)" stroke-width="1.5" stroke-dasharray="6 5" opacity="0.8"/>`);
          g.push(`<text x="${n(cx)}" y="${n(cy + fsm * 0.35)}" text-anchor="middle" font-size="${n(fsm)}" fill="var(--draw-bg)" opacity="0.9">vaš motiv</text>`);
        } else {
          const tid = `${uid}-vz-${vz}-${Math.round(Hm * 100)}`;
          if (!defs.some((d) => d.includes(`id="${tid}"`))) defs.push(`<g id="${tid}">${oblikeSvg(obl(vz, Hm), s, 0, 0, 'var(--draw-bg)')}</g>`);
          const k = slope / s; // naklon v px na px
          const uses: string[] = [];
          for (let t = 0; t < xb - xa; t += 1) uses.push(`<use href="#${tid}" x="${n(t * s)}"/>`);
          g.push(`<g transform="matrix(1 ${n(k * 1000) / 1000} 0 1 ${n(X(xa))} ${n(bottomFn(xa) - 0.02 * s)})">${uses.join('')}</g>`);
        }
        break;
      }
    }
    parts.push(`<g clip-path="url(#${cid})">${g.join('')}</g>`);
    if (okvir) parts.push(`<polygon points="${poly(p)}" fill="none" stroke="${barva}" stroke-width="${n(Math.max(2, 0.025 * s))}"/>`);
  }

  // ---------- ograja ----------
  const balkonSlog = !dvorisce;
  const maxSpan = o.razmikStebrov && o.razmikStebrov > 0 ? o.razmikStebrov : dvorisce ? 2.0 : 1.3;
  const spans = Math.max(1, Math.ceil(Ls / maxSpan));
  const pw = dvorisce ? 0.08 : 0.05;
  const posts = Array.from({ length: spans + 1 }, (_, i) => (i * Ls) / spans);
  if (prekinjeno) posts.pop();
  if (P > 0.05) {
    const sp = Math.max(1, Math.ceil(P / maxSpan));
    for (let i = 1; i <= sp; i++) posts.push(Ls + (i * P) / sp);
  }

  // polnila med stebri
  const meje = prekinjeno ? [...posts, Ls] : posts;
  if (odprte) {
    // ena neprekinjena vrsta enakih palic (na stopnišču ločeno ob stopnicah in na podestu)
    const odseki: [number, number][] = P > 0.05 ? [[0, Ls], [Ls, Ls + P]] : [[0, Ls]];
    odseki.forEach(([a, b], i) => polnilo(a, b, Yb, Yt, `p${i}`));
  } else {
    for (let i = 0; i < meje.length - 1; i++) {
      polnilo(meje[i] + pw / 2, meje[i + 1] - (i === meje.length - 2 && prekinjeno ? 0 : pw / 2), Yb, Yt, `p${i}`);
    }
  }

  // spodnji in zgornji profil
  const rail = (yFn: (x: number) => number, debelina: number, cls = '') => {
    const odseki: [number, number][] = P > 0.05 ? [[0, Ls], [Ls, Ls + P]] : [[0, Ls]];
    for (const [x1, x2] of odseki) {
      const pts: [number, number][] = [[X(x1), yFn(x1)], [X(x2), yFn(x2)], [X(x2), yFn(x2) + debelina * s], [X(x1), yFn(x1) + debelina * s]];
      parts.push(`<polygon class="${cls}" points="${poly(pts)}" fill="${barva}" stroke="${edge}" stroke-width="0.7"/>`);
    }
  };
  if (odprte) {
    // brez spodnje letve
  } else if (o.polnilo !== 'steklo') rail((x) => Yb(x) - 0.04 * s, 0.04);
  else rail((x) => Yb(x) - 0.03 * s, 0.03);
  if (odprte) {
    // odprte palice: brez ročaja, palice povezuje vodoravna šipka
    const hs = Math.min(Math.max((o.sipka ?? visina * 100 - 12) / 100, visina / 2), visina - 0.06);
    rail((x) => Fy - (stopOff + Math.min(x, Ls) * r + hs) * s - 0.006 * s, 0.012);
  } else if (balkonSlog) {
    // ročaj nekoliko nad polnilom
    rail((x) => Yt(x) - 0.012 * s, 0.05);
  } else {
    rail((x) => Yt(x), 0.035);
  }

  // nosilna plošča na čelu balkona (montaža s strani), v barvi ograje
  if (stran) {
    parts.push(`<rect x="${n(X(-0.05))}" y="${n(Fy + 0.015 * s)}" width="${n((Ls + 0.1) * s)}" height="${n(0.19 * s)}" fill="${barva}" stroke="${edge}" stroke-width="0.8" style="filter:brightness(0.92)"/>`);
  }

  // brez stebričkov: samo končna profila polja, pritrjena na ploščo
  if (brezStebrov) {
    for (const x of [0, Ls]) parts.push(`<rect x="${n(X(x) - 0.015 * s)}" y="${n(Yt(x) - 0.012 * s)}" width="${n(0.03 * s)}" height="${n(Yb(x) - Yt(x) + 0.012 * s)}" fill="${barva}" stroke="${edge}" stroke-width="0.7"/>`);
  }

  // stebri
  for (const x of brezStebrov || odprte ? [] : posts) {
    const top = balkonSlog ? Yt(x) - 0.012 * s : Yt(x) - 0.01 * s;
    let bottom = stopnice ? Yb(x) + clearance * s : Fy;
    if (stran) bottom = Math.max(Fy + 0.17 * s, Yb(x) + 0.02 * s);
    const px = X(x) - (pw * s) / 2;
    parts.push(`<rect x="${n(px)}" y="${n(top)}" width="${n(pw * s)}" height="${n(bottom - top)}" fill="${barva}" stroke="${edge}" stroke-width="0.8"/>`);
    if (o.tip === 'balkonska' && o.montaza === 'stran') {
      for (const yy of [Fy + 0.05 * s, Fy + 0.12 * s]) parts.push(`<circle cx="${n(X(x))}" cy="${n(yy)}" r="${n(Math.max(1.5, 0.012 * s))}" fill="var(--draw-bg)"/>`);
    } else if (!stopnice && !(dvorisce && o.montaza === 'temelj')) {
      parts.push(`<rect x="${n(X(x) - 0.06 * s)}" y="${n(bottom - 0.012 * s)}" width="${n(0.12 * s)}" height="${n(0.012 * s)}" fill="${barva}"/>`);
    }
    if (dvorisce && o.montaza === 'temelj') {
      parts.push(`<rect x="${n(px)}" y="${n(Fy)}" width="${n(pw * s)}" height="${n(0.35 * s)}" fill="none" stroke="var(--draw-line)" stroke-dasharray="4 3" stroke-width="1"/>`);
    }
  }

  // prekinitev
  if (prekinjeno) {
    const xb = X(Ls);
    const y1 = Yt(Ls) - 0.08 * s, y2 = Yb(Ls) + 0.06 * s;
    const zz = `M ${n(xb)} ${n(y1)} L ${n(xb)} ${n(y1 + (y2 - y1) * 0.42)} L ${n(xb + 9)} ${n(y1 + (y2 - y1) * 0.48)} L ${n(xb - 9)} ${n(y1 + (y2 - y1) * 0.54)} L ${n(xb)} ${n(y1 + (y2 - y1) * 0.6)} L ${n(xb)} ${n(y2)}`;
    parts.push(`<path d="${zz}" fill="none" stroke="var(--draw-bg)" stroke-width="7"/><path d="${zz}" fill="none" stroke="var(--draw-ink)" stroke-width="1.4"/>`);
  }

  // ---------- osebni prehod ----------
  if (prehod) {
    const a = xPrehod, b = xPrehod + prehod;
    const flatB = () => Fy - 0.05 * s;
    const flatT = () => Fy - visina * s + 0.01 * s;
    for (const x of [a, b]) parts.push(`<rect x="${n(X(x) - 0.04 * s)}" y="${n(flatT() - 0.03 * s)}" width="${n(0.08 * s)}" height="${n(Fy - flatT() + 0.03 * s)}" fill="${barva}" stroke="${edge}" stroke-width="0.8"/>`);
    polnilo(a + 0.07, b - 0.07, flatB, flatT, 'prehod', true);
    parts.push(`<rect x="${n(X(a + 0.07))}" y="${n(flatT())}" width="${n((prehod - 0.14) * s)}" height="${n(flatB() - flatT())}" fill="none" stroke="${barva}" stroke-width="${n(Math.max(2.5, 0.04 * s))}"/>`);
    parts.push(`<rect x="${n(X(b - 0.2))}" y="${n(Fy - 1.05 * s)}" width="${n(0.1 * s)}" height="${n(Math.max(3, 0.025 * s))}" rx="2" fill="var(--draw-ink)"/>`);
  }

  // ---------- dvoriščna vrata ----------
  if (gate) {
    const a = xVrata, b = xVrata + gate;
    const flatB = () => Fy - 0.06 * s;
    const flatT = () => Fy - visina * s + 0.01 * s;
    for (const x of [a, b]) parts.push(`<rect x="${n(X(x) - 0.06 * s)}" y="${n(flatT() - 0.06 * s)}" width="${n(0.12 * s)}" height="${n(Fy - flatT() + 0.06 * s)}" fill="${barva}" stroke="${edge}" stroke-width="0.8"/>`);
    const krila = vrata === 'krilna' ? [[a + 0.08, (a + b) / 2 - 0.015], [(a + b) / 2 + 0.015, b - 0.08]] : [[a + 0.08, b - 0.08]];
    krila.forEach(([ka, kb], i) => {
      polnilo(ka, kb, flatB, flatT, `vrata${i}`, true);
      parts.push(`<rect x="${n(X(ka))}" y="${n(flatT())}" width="${n((kb - ka) * s)}" height="${n(flatB() - flatT())}" fill="none" stroke="${barva}" stroke-width="${n(Math.max(3, 0.06 * s))}"/>`);
    });
    const arrowY = flatT() - 0.22 * s;
    if (vrata === 'drsna' || vrata === 'samonosna') {
      const ax1 = X(b - gate * 0.25), ax2 = X(a + gate * 0.25);
      parts.push(`<path d="M ${n(ax1)} ${n(arrowY)} L ${n(ax2)} ${n(arrowY)} M ${n(ax2 + 10)} ${n(arrowY - 7)} L ${n(ax2)} ${n(arrowY)} L ${n(ax2 + 10)} ${n(arrowY + 7)}" fill="none" stroke="var(--draw-ink)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    if (vrata === 'drsna') {
      // tirnica, vgrajena v tla, in kolesca krila
      parts.push(`<line x1="${n(X(a - gate * 0.9))}" y1="${n(Fy + 1)}" x2="${n(X(b))}" y2="${n(Fy + 1)}" stroke="var(--draw-ink)" stroke-width="2.4"/>`);
      for (const x of [a + 0.35, b - 0.35]) parts.push(`<circle cx="${n(X(x))}" cy="${n(Fy - 0.035 * s)}" r="${n(Math.max(4, 0.035 * s))}" fill="var(--draw-ink)"/><circle cx="${n(X(x))}" cy="${n(Fy - 0.035 * s)}" r="${n(Math.max(1.5, 0.012 * s))}" fill="var(--draw-bg)"/>`);
    }
    if (vrata === 'samonosna') {
      const tail = gate * 0.4;
      parts.push(`<rect x="${n(X(a - tail))}" y="${n(flatB() - 0.12 * s)}" width="${n(tail * s)}" height="${n(0.12 * s)}" fill="none" stroke="${barva}" stroke-width="2" stroke-dasharray="6 4"/>`);
    }
    if (vrata === 'krilna') {
      for (const x of [a + 0.08, b - 0.08]) for (const yy of [flatT() + 0.15 * s, flatB() - 0.2 * s]) parts.push(`<rect x="${n(X(x) - 3)}" y="${n(yy)}" width="6" height="${n(0.08 * s)}" rx="2" fill="var(--draw-ink)"/>`);
    }
    if (o.pogon) {
      const mx = X(b) + 0.09 * s;
      parts.push(`<rect x="${n(mx)}" y="${n(Fy - 0.32 * s)}" width="${n(0.3 * s)}" height="${n(0.32 * s)}" rx="3" fill="var(--draw-ink)"/><circle cx="${n(mx + 0.15 * s)}" cy="${n(Fy - 0.2 * s)}" r="${n(0.04 * s)}" fill="var(--green)"/>`);
    }
  }

  // ---------- kote ----------
  if (!o.brezKot) {
    const dimY = H - mB * 0.42;
    const kota = (x1: number, x2: number, label: string) => {
      const a = X(x1), b = X(x2);
      parts.push(`<g class="kota"><line x1="${n(a)}" y1="${n(dimY)}" x2="${n(b)}" y2="${n(dimY)}"/><line x1="${n(a)}" y1="${n(dimY - 9)}" x2="${n(a)}" y2="${n(dimY + 9)}"/><line x1="${n(b)}" y1="${n(dimY - 9)}" x2="${n(b)}" y2="${n(dimY + 9)}"/><text x="${n((a + b) / 2)}" y="${n(dimY - 12)}" text-anchor="middle" font-size="${n(fs)}">${label}</text></g>`);
    };
    kota(0, Ls, fmtM(dolzina));
    if (P > 0.05) kota(Ls, Ls + P, fmtM(podestPravi));
    if (prehod) kota(xPrehod, xPrehod + prehod, fmtM(prehod));
    if (gate) kota(xVrata, xVrata + gate, fmtM(gate));

    const vx = X(0) - Math.max(W * 0.045, 26);
    const yTop = Yt(0) - (balkonSlog ? 0.012 * s : 0.01 * s);
    const yBot = Fy - stopOff * s;
    parts.push(`<g class="kota"><line x1="${n(vx)}" y1="${n(yTop)}" x2="${n(vx)}" y2="${n(yBot)}"/><line x1="${n(vx - 9)}" y1="${n(yTop)}" x2="${n(vx + 9)}" y2="${n(yTop)}"/><line x1="${n(vx - 9)}" y1="${n(yBot)}" x2="${n(vx + 9)}" y2="${n(yBot)}"/><text x="${n(vx - 10)}" y="${n((yTop + yBot) / 2)}" text-anchor="middle" font-size="${n(fs)}" transform="rotate(-90 ${n(vx - 10)} ${n((yTop + yBot) / 2)})">${Math.round(o.visina)} cm</text></g>`);
  }

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="risba" role="img" aria-label="Risba ograje"><defs>${defs.join('')}</defs>${parts.join('')}</svg>`;
}
