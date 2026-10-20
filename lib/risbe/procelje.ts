// Pročelje družinske hiše v merilu (SVG kot niz).
// Vse mere so v metrih, viewBox je v centimetrih: x = (m + X0) * 100, y = (ZTOP - z) * 100.
// Štirje deli so izdelki HIFA in se rišejo iz izbir: A balkonska ograja, B nadstrešek,
// C stopnišče z ograjo, D dvoriščna ograja z vrati.

export type DelId = 'A' | 'B' | 'C' | 'D';
export type PolniloP = 'palicna' | 'vertikalne' | 'horizontalne' | 'zarki' | 'steklo' | 'perforirana';
export type OblikaNadstreska = 'box' | 'enokapnica';
export type VrataP = 'drsna' | 'samonosna' | 'krilna';

export interface ProceljeIzbira {
  A: { polnilo: PolniloP; ral: string };
  B: { oblika: OblikaNadstreska; ral: string };
  C: { polnilo: PolniloP; ral: string };
  D: { polnilo: PolniloP; vrata: VrataP; ral: string };
}

export const X0 = 0.9; // levi rob scene v m (scena se začne pri x = -0.9)
export const SIRINA = 22.0; // m
export const ZTOP = 9.5; // m
export const VIEWBOX = { x: 0, y: 0, w: SIRINA * 100, h: (ZTOP + 0.45) * 100 };
// na telefonu brez skrajnega desnega dela ograje, da je hiša večja
export const VIEWBOX_OZEK = { x: 50, y: 30, w: 1760, h: 950 };

const X = (x: number) => r((x + X0) * 100);
const Y = (z: number) => r((ZTOP - z) * 100);
const r = (v: number) => Math.round(v * 10) / 10;
const pt = (x: number, z: number) => `${X(x)},${Y(z)}`;
const rect = (x1: number, z1: number, x2: number, z2: number, attrs: string) =>
  `<rect x="${X(x1)}" y="${Y(z2)}" width="${r((x2 - x1) * 100)}" height="${r((z2 - z1) * 100)}" ${attrs}/>`;
const line = (x1: number, z1: number, x2: number, z2: number, attrs: string) =>
  `<line x1="${X(x1)}" y1="${Y(z1)}" x2="${X(x2)}" y2="${Y(z2)}" ${attrs}/>`;

const L = 'vector-effect="non-scaling-stroke"';
const CRTA = `stroke="var(--p-crta)" stroke-width="1.15" ${L}`;
const TANKA = `stroke="var(--p-crta)" stroke-width="0.6" ${L}`;
const ROB = `stroke="var(--p-rob)" stroke-width="0.7" ${L}`;

// ---------- območja delov (za zadetke, oblačke sprememb in zoom) ----------
export const obmocja: Record<DelId, { x1: number; z1: number; x2: number; z2: number }> = {
  A: { x1: 2.05, z1: 3.25, x2: 7.55, z2: 4.85 },
  B: { x1: 11.0, z1: 2.2, x2: 16.8, z2: 3.35 },
  C: { x1: 6.65, z1: -0.05, x2: 10.55, z2: 1.85 },
  D: { x1: 11.3, z1: -0.05, x2: 16.5, z2: 1.62 },
};

// Točke, kjer stojijo oznake detajlov (krog s črko) in kam kaže kazalna črta.
export const oznake: Record<DelId, { x: number; z: number; tx: number; tz: number }> = {
  A: { x: -0.05, z: 5.0, tx: 2.3, tz: 4.35 },
  B: { x: 12.45, z: 3.62, tx: 13.4, tz: 2.72 },
  C: { x: 7.3, z: 2.8, tx: 7.35, tz: 1.15 },
  D: { x: 16.95, z: 2.0, tx: 15.9, tz: 1.2 },
};

/** Pretvori metre scene v odstotke viewBoxa (za HTML oznake čez SVG). */
export function vOdstotkih(x: number, z: number, vb = VIEWBOX) {
  return { left: ((X(x) - vb.x) / vb.w) * 100, top: ((Y(z) - vb.y) / vb.h) * 100 };
}

/** Okvir za približan pogled na del, v enotah viewBoxa, z danim razmerjem stranic. */
export function okvirDela(id: DelId, razmerje: number) {
  const o = obmocja[id];
  const pad = 1.4;
  let x1 = X(o.x1 - pad), x2 = X(o.x2 + pad);
  let y1 = Y(o.z2 + pad), y2 = Y(o.z1 - 0.6);
  let w = x2 - x1, h = y2 - y1;
  if (w / h > razmerje) {
    const nh = w / razmerje;
    y1 -= (nh - h) / 2;
    h = nh;
  } else {
    const nw = h * razmerje;
    x1 -= (nw - w) / 2;
    w = nw;
  }
  x1 = Math.max(0, Math.min(x1, VIEWBOX.w - w));
  y1 = Math.max(0, Math.min(y1, VIEWBOX.h - h));
  return { x: x1, y: y1, w, h };
}

// ---------- polnila ograj ----------
type Fn = (x: number) => number; // z v metrih glede na x

function polnilo(
  out: string[],
  defs: string[],
  key: string,
  p: PolniloP,
  barva: string,
  xa: number,
  xb: number,
  spodaj: Fn,
  zgoraj: Fn,
  okvir = false,
) {
  const poly = [pt(xa, spodaj(xa)), pt(xb, spodaj(xb)), pt(xb, zgoraj(xb)), pt(xa, zgoraj(xa))].join(' ');
  const cid = `pc-${key}`;
  defs.push(`<clipPath id="${cid}"><polygon points="${poly}"/></clipPath>`);
  const zMin = Math.min(spodaj(xa), spodaj(xb));
  const zMax = Math.max(zgoraj(xa), zgoraj(xb));
  const slope = (spodaj(xb) - spodaj(xa)) / Math.max(xb - xa, 0.001);
  const g: string[] = [];
  switch (p) {
    case 'palicna':
      for (let x = xa + 0.06; x < xb - 0.02; x += 0.12) g.push(rect(x - 0.015, zMin - 0.05, x + 0.015, zMax + 0.05, `fill="${barva}" ${ROB}`));
      break;
    case 'vertikalne':
      for (let x = xa + 0.04; x < xb - 0.02; x += 0.07) g.push(rect(x - 0.016, zMin - 0.05, x + 0.016, zMax + 0.05, `fill="${barva}" ${ROB}`));
      okvir = true;
      break;
    case 'horizontalne': {
      const h = zgoraj(xa) - spodaj(xa);
      for (let d = 0.04; d < h + 0.3; d += 0.085) {
        const z1 = spodaj(xa) + d;
        g.push(
          `<polygon points="${[pt(xa - 0.05, z1), pt(xb + 0.05, z1 + slope * (xb - xa + 0.1)), pt(xb + 0.05, z1 + slope * (xb - xa + 0.1) + 0.05), pt(xa - 0.05, z1 + 0.05)].join(' ')}" fill="${barva}" ${ROB}/>`,
        );
      }
      okvir = true;
      break;
    }
    case 'zarki': {
      const h = zMax - zMin;
      const dx = h / 1.6;
      for (let t = xa - dx; t < xb + dx; t += 0.22) {
        g.push(line(t, zMin, t + dx, zMax, `stroke="${barva}" stroke-width="1.6" ${L}`));
        g.push(line(t, zMax, t + dx, zMin, `stroke="${barva}" stroke-width="1.6" ${L}`));
      }
      break;
    }
    case 'steklo': {
      g.push(`<polygon points="${poly}" fill="var(--p-steklo)" ${ROB}/>`);
      const w = xb - xa;
      g.push(line(xa + w * 0.12, zMin + 0.12, xa + w * 0.26, zMax - 0.1, `stroke="var(--p-odsev)" stroke-width="3" stroke-linecap="round" ${L}`));
      g.push(line(xa + w * 0.2, zMin + 0.1, xa + w * 0.28, zMin + (zMax - zMin) * 0.5, `stroke="var(--p-odsev)" stroke-width="1.4" stroke-linecap="round" ${L}`));
      break;
    }
    case 'perforirana': {
      const pid = `pp-${key}`;
      defs.push(`<pattern id="${pid}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.15" fill="var(--p-zid)"/></pattern>`);
      g.push(`<polygon points="${poly}" fill="${barva}" ${ROB}/>`);
      const h = zMax - zMin;
      g.push(rect(xa, zMin + h * 0.5, xb, zMin + h * 0.72, `fill="url(#${pid})"`));
      break;
    }
  }
  out.push(`<g clip-path="url(#${cid})">${g.join('')}</g>`);
  if (okvir) out.push(`<polygon points="${poly}" fill="none" stroke="${barva}" stroke-width="2.4" ${L}/>`);
}

/** Ograja med stebri na ravni ali poševni podlagi. */
function ograja(
  out: string[],
  defs: string[],
  key: string,
  p: PolniloP,
  barva: string,
  x1: number,
  x2: number,
  spodaj: Fn, // spodnji rob polnila
  visina: number,
  razpon: number,
  stebri = 0.05,
  rocaj = true,
) {
  const zgoraj: Fn = (x) => spodaj(x) + visina;
  const n = Math.max(1, Math.ceil((x2 - x1) / razpon));
  const xs = Array.from({ length: n + 1 }, (_, i) => x1 + ((x2 - x1) * i) / n);
  for (let i = 0; i < n; i++) polnilo(out, defs, `${key}${i}`, p, barva, xs[i] + stebri / 2, xs[i + 1] - stebri / 2, (x) => spodaj(x) + 0.04, (x) => zgoraj(x) - 0.04);
  // spodnji profil in ročaj
  const trak = (fn: Fn, d: number) =>
    out.push(`<polygon points="${[pt(x1, fn(x1)), pt(x2, fn(x2)), pt(x2, fn(x2) + d), pt(x1, fn(x1) + d)].join(' ')}" fill="${barva}" ${ROB}/>`);
  trak(spodaj, 0.045);
  if (rocaj) trak((x) => zgoraj(x) - 0.01, 0.055);
  else trak((x) => zgoraj(x) - 0.04, 0.04);
  for (const x of xs) {
    out.push(`<polygon points="${[pt(x - stebri / 2, spodaj(x) - 0.06), pt(x + stebri / 2, spodaj(x) - 0.06), pt(x + stebri / 2, zgoraj(x) + 0.045), pt(x - stebri / 2, zgoraj(x) + 0.045)].join(' ')}" fill="${barva}" ${ROB}/>`);
  }
}

// ---------- okna in vrata ----------
function okno(out: string[], x1: number, z1: number, x2: number, z2: number, deljeno = false) {
  out.push(rect(x1 - 0.06, z2, x2 + 0.06, z2 + 0.2, `fill="var(--p-rolo)" ${TANKA}`)); // roletna omarica
  out.push(rect(x1, z1, x2, z2, `fill="var(--p-okvir)" ${CRTA}`));
  const f = 0.07;
  if (deljeno) {
    const m = (x1 + x2) / 2;
    out.push(rect(x1 + f, z1 + f, m - f / 2, z2 - f, `fill="var(--p-okno)" ${TANKA}`));
    out.push(rect(m + f / 2, z1 + f, x2 - f, z2 - f, `fill="var(--p-okno)" ${TANKA}`));
  } else {
    out.push(rect(x1 + f, z1 + f, x2 - f, z2 - f, `fill="var(--p-okno)" ${TANKA}`));
  }
  out.push(line(x1 + 0.18, z1 + 0.25, x1 + 0.42, z2 - 0.2, `stroke="var(--p-odsev)" stroke-width="2" stroke-linecap="round" ${L}`));
  out.push(rect(x1 - 0.05, z1 - 0.05, x2 + 0.05, z1, `fill="var(--p-polica)" ${TANKA}`)); // polica
}

// ---------- izbor dela: okvir z vogalnimi oznakami (kot izbira na CAD načrtu) ----------
export function izbor(id: DelId, rob = 0.16) {
  const o = obmocja[id];
  const x = X(o.x1 - rob), y = Y(o.z2 + rob);
  const w = r((o.x2 - o.x1 + 2 * rob) * 100), h = r((o.z2 - o.z1 + 2 * rob) * 100);
  const d = r(Math.min(42, w * 0.18, h * 0.32)); // dolžina vogalne oznake
  const x2 = r(x + w), y2 = r(y + h);
  const koti = [
    `M ${x} ${r(y + d)} V ${y} H ${r(x + d)}`,
    `M ${r(x2 - d)} ${y} H ${x2} V ${r(y + d)}`,
    `M ${x2} ${r(y2 - d)} V ${y2} H ${r(x2 - d)}`,
    `M ${r(x + d)} ${y2} H ${x} V ${r(y2 - d)}`,
  ].join(' ');
  return { x, y, w, h, koti };
}

// ---------- glavna risba ----------
export function risiProcelje(iz: ProceljeIzbira): string {
  const o: string[] = [];
  const defs: string[] = [];

  // teren
  defs.push(
    `<pattern id="p-teren" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="14" stroke="var(--p-crta)" stroke-width="0.5" opacity="0.5"/></pattern>`,
  );
  o.push(rect(-0.9, -0.4, 21.1, 0, `fill="url(#p-teren)"`));
  o.push(line(-0.9, 0, 21.1, 0, `stroke="var(--p-crta)" stroke-width="2" ${L}`));

  // ---- hiša ----
  // streha (štirikapnica v pogledu): trapez s kritino
  const streha = [pt(0.35, 6.3), pt(11.65, 6.3), pt(8.45, 8.65), pt(3.55, 8.65)].join(' ');
  // dimnik za strešino
  o.push(`<polygon points="${[pt(8.9, 7.9), pt(8.9, 9.1), pt(9.45, 9.1), pt(9.45, 7.6)].join(' ')}" fill="var(--p-dimnik)" ${CRTA}/>`);
  o.push(rect(8.82, 9.1, 9.53, 9.2, `fill="var(--p-okvir)" ${TANKA}`));
  o.push(`<polygon points="${streha}" fill="var(--p-streha)" ${CRTA}/>`);
  // strešniki kot vzorec (ena celica namesto stotin črt): vrste po 24 cm, zamik 17 cm
  defs.push(
    `<pattern id="p-stresniki" width="34" height="48" patternUnits="userSpaceOnUse" x="${X(0.4)}" y="${Y(6.55)}"><g stroke="var(--p-streha-crta)" fill="none"><path d="M0 0H34M0 24H34" stroke-width="1.3"/><path d="M0 0V24M17 24V48" stroke-width="0.9"/></g></pattern>`,
  );
  o.push(`<polygon points="${streha}" fill="url(#p-stresniki)"/>`);
  o.push(rect(0.35, 6.12, 11.65, 6.3, `fill="var(--p-okvir)" ${CRTA}`)); // čelna deska / žleb

  // zidovi
  o.push(rect(1.0, 0, 11.0, 6.12, `fill="var(--p-zid)" ${CRTA}`));
  o.push(rect(1.0, 0, 11.0, 0.68, `fill="var(--p-cokl)" ${CRTA}`));
  o.push(line(1.0, 3.55, 11.0, 3.55, `stroke="var(--p-crta)" stroke-width="0.5" stroke-dasharray="6 5" ${L}`));

  // okna pritličja in vrata
  okno(o, 2.0, 1.55, 3.4, 2.95);
  okno(o, 4.2, 1.55, 5.6, 2.95);
  // vhodna vrata
  o.push(rect(8.55, 0.68, 9.75, 2.95, `fill="var(--p-okvir)" ${CRTA}`));
  o.push(rect(8.62, 0.72, 9.68, 2.88, `fill="var(--p-vrata)" ${TANKA}`));
  o.push(rect(8.78, 1.0, 8.98, 2.6, `fill="var(--p-okno)" ${TANKA}`));
  o.push(rect(9.45, 1.55, 9.5, 2.05, `fill="var(--p-crta)"`));

  // nadstropje
  okno(o, 2.85, 3.55, 4.35, 5.75, true);
  okno(o, 5.25, 3.55, 6.75, 5.75, true);
  okno(o, 8.55, 4.45, 9.75, 5.75);

  // ---- A: balkon ----
  o.push(rect(2.2, 3.35, 7.4, 3.55, `fill="var(--p-beton)" ${CRTA}`));
  o.push(line(2.2, 3.37, 7.4, 3.37, `stroke="var(--p-crta)" stroke-width="0.5" ${L}`));
  ograja(o, defs, 'a', iz.A.polnilo, iz.A.ral, 2.3, 7.3, () => 3.6, 1.05, 1.3);

  // ---- C: stopnišče in podest ----
  const stopnisce = [pt(6.8, 0), pt(6.8, 0.17), pt(7.1, 0.17), pt(7.1, 0.34), pt(7.4, 0.34), pt(7.4, 0.51), pt(7.7, 0.51), pt(7.7, 0.68), pt(10.45, 0.68), pt(10.45, 0)].join(' ');
  o.push(`<polygon points="${stopnisce}" fill="var(--p-beton)" ${CRTA}/>`);
  // poševni del ograje sledi robovom stopnic, nato raven del ob podestu
  const k = 0.51 / 0.9;
  ograja(o, defs, 'cs', iz.C.polnilo, iz.C.ral, 6.9, 7.72, (x) => 0.2 + (x - 6.8) * k + 0.05, 0.95, 1.0, 0.045);
  ograja(o, defs, 'cr', iz.C.polnilo, iz.C.ral, 7.72, 10.35, () => 0.73, 0.95, 1.4, 0.045);

  // ---- B: nadstrešek ob hiši ----
  const rb = iz.B.ral;
  const stebriB = [11.42, 16.42];
  if (iz.B.oblika === 'enokapnica') {
    // enokapnica: pritrjena visoko na zid hiše, strešina pada proti zunanjemu stebru, žleb na nizkem koncu
    const zZid = 3.08, zRob = 2.5, deb = 0.17;
    const zg = (x: number) => zZid + ((x - 11.0) * (zRob - zZid)) / (16.62 - 11.0);
    // stenska letev
    o.push(rect(11.0, zZid - 0.16, 11.1, zZid + 0.24, `fill="${rb}" ${ROB}`));
    // kritina (steklo) nad nosilcem, z odsevi
    const kritina = [pt(11.1, zg(11.1) + deb), pt(16.62, zg(16.62) + deb), pt(16.62, zg(16.62) + deb + 0.06), pt(11.1, zg(11.1) + deb + 0.06)].join(' ');
    o.push(`<polygon points="${kritina}" fill="var(--p-steklo)" ${TANKA}/>`);
    // poševni stranski nosilec
    const nosilec = [pt(11.1, zg(11.1)), pt(16.62, zg(16.62)), pt(16.62, zg(16.62) + deb), pt(11.1, zg(11.1) + deb)].join(' ');
    o.push(`<polygon points="${nosilec}" fill="${rb}" ${ROB}/>`);
    o.push(`<line x1="${X(11.1)}" y1="${Y(zg(11.1) + deb - 0.04)}" x2="${X(16.62)}" y2="${Y(zg(16.62) + deb - 0.04)}" stroke="var(--p-rob)" stroke-width="0.6" ${L}/>`);
    // žleb na nizkem koncu
    o.push(rect(16.58, zRob - 0.06, 16.78, zRob + deb + 0.04, `fill="${rb}" ${ROB} style="filter:brightness(1.18)"`));
    // zunanji steber nosi strešino, pri zidu ga ne potrebuje
    o.push(rect(16.36, 0, 16.48, zRob, `fill="${rb}" ${ROB}`));
  } else {
    o.push(rect(11.0, 2.4, 16.6, 2.74, `fill="${rb}" ${ROB}`));
    o.push(line(11.0, 2.7, 16.6, 2.7, `stroke="var(--p-rob)" stroke-width="0.6" ${L}`));
    o.push(rect(11.0, 2.74, 16.6, 2.78, `fill="${rb}" ${ROB} style="filter:brightness(1.2)"`));
    for (const x of stebriB) o.push(rect(x - 0.06, 0, x + 0.06, 2.42, `fill="${rb}" ${ROB}`));
    o.push(rect(11.0, 2.2, 11.08, 2.42, `fill="${rb}"`)); // pritrditev na zid
  }
  // ---- D: dvoriščna ograja, osebni prehod in vrata ----
  const rd = iz.D.ral;
  const podzidek = (x1: number, x2: number) => o.push(rect(x1, 0, x2, 0.3, `fill="var(--p-beton)" ${CRTA}`));
  podzidek(-0.7, 5.45);
  podzidek(16.55, 20.9);
  ograja(o, defs, 'dl', iz.D.polnilo, rd, -0.6, 5.4, () => 0.32, 1.1, 1.9, 0.08, false);
  ograja(o, defs, 'dd', iz.D.polnilo, rd, 16.65, 20.8, () => 0.32, 1.1, 2.1, 0.08, false);
  // osebni prehod
  for (const x of [5.53, 6.67]) o.push(rect(x - 0.06, 0, x + 0.06, 1.5, `fill="${rd}" ${ROB}`));
  polnilo(o, defs, 'dp', iz.D.polnilo, rd, 5.64, 6.56, () => 0.08, () => 1.38, true);
  o.push(rect(5.62, 0.06, 6.58, 1.4, `fill="none" stroke="${rd}" stroke-width="3" ${L}`));
  o.push(rect(6.42, 0.82, 6.52, 0.86, `fill="var(--p-crta)"`));
  // vrata
  for (const x of [11.48, 16.48]) o.push(rect(x - 0.08, 0, x + 0.08, 1.6, `fill="${rd}" ${ROB}`));
  const krila: [number, number][] = iz.D.vrata === 'krilna' ? [[11.6, 13.96], [14.0, 16.36]] : [[11.6, 16.36]];
  krila.forEach(([a, b], i) => {
    const spodaj = iz.D.vrata === 'samonosna' ? 0.16 : 0.08;
    polnilo(o, defs, `dv${i}`, iz.D.polnilo, rd, a, b, () => spodaj, () => 1.48, true);
    o.push(rect(a, spodaj - 0.02, b, 1.5, `fill="none" stroke="${rd}" stroke-width="3.2" ${L}`));
  });
  if (iz.D.vrata === 'drsna') o.push(line(11.3, 0.015, 16.6, 0.015, `stroke="var(--p-crta)" stroke-width="2.4" ${L}`));
  if (iz.D.vrata === 'samonosna') o.push(rect(11.6, 0.06, 16.36, 0.18, `fill="${rd}" ${ROB}`));

  // ---- višinske kote (kot na načrtu) ----
  const kota = (z: number, oznaka: string) => {
    const x = -0.55;
    o.push(`<g class="p-kota"><path d="M ${X(x)} ${Y(z)} l -9 -14 h 18 z" fill="none" ${TANKA}/>${line(x - 0.18, z, x + 0.9, z, TANKA)}<text x="${X(x) + 6}" y="${Y(z) - 8}">${oznaka}</text></g>`);
  };
  kota(3.55, '+3,55');
  kota(6.3, '+6,30');

  return `<defs>${defs.join('')}</defs>${o.join('')}`;
}

export const privzetaIzbira: ProceljeIzbira = {
  A: { polnilo: 'vertikalne', ral: '#383e42' },
  B: { oblika: 'box', ral: '#383e42' },
  C: { polnilo: 'steklo', ral: '#383e42' },
  D: { polnilo: 'horizontalne', vrata: 'drsna', ral: '#383e42' },
};
