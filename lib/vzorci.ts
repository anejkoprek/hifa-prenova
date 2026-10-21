// Vzorci izrezov za perforirano pločevino. Vsak vzorec je opisan z oblikami v metrih na ploščici širine 1 m
// in višine H (y gre od spodnjega roba navzgor). Iste oblike rišeta 2D risba (SVG) in 3D model (maska na platnu),
// zato se pogleda vedno ujemata.

export type Vzorec = 'kvadrati' | 'reze' | 'trava' | 'veje' | 'trak' | 'po-meri';

export const vzorci: { id: Vzorec; naziv: string; opis: string }[] = [
  { id: 'kvadrati', naziv: 'Kvadratki', opis: 'Gosta mreža kvadratnih lukenj' },
  { id: 'reze', naziv: 'Reže', opis: 'Navpične reže različnih dolžin' },
  { id: 'trava', naziv: 'Trava', opis: 'Bilke ob spodnjem robu' },
  { id: 'veje', naziv: 'Vejice', opis: 'Vejice z listi, motiv iz narave' },
  { id: 'trak', naziv: 'Trak luknjic', opis: 'Polna pločevina s trakom perforacije' },
  { id: 'po-meri', naziv: 'Po vaši želji', opis: 'Izrez po vaši skici ali logotipu' },
];

export type Oblika =
  | { t: 'rect'; x: number; y: number; w: number; h: number }
  | { t: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rot: number }
  | { t: 'path'; d: (['M', number, number] | ['L', number, number] | ['Q', number, number, number, number] | ['Z'])[] };

/** ponovljiv psevdonaključni generator, da je vzorec vedno enak */
function nakljucno(seme: number) {
  let a = seme >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const predpomnilnik = new Map<string, Oblika[]>();

/** oblike lukenj na ploščici 1 m × H (m) */
export function obl(vzorec: Vzorec, H: number): Oblika[] {
  const kljuc = `${vzorec}|${Math.round(H * 100)}`;
  const shranjeno = predpomnilnik.get(kljuc);
  if (shranjeno) return shranjeno;
  const o: Oblika[] = [];
  const rnd = nakljucno(vzorec.length * 7919 + 13);
  const rob = 0.05;

  if (vzorec === 'kvadrati') {
    const a = 0.022, korak = 0.042;
    for (let x = korak / 2; x < 1; x += korak) for (let y = rob; y < H - rob - a; y += korak) o.push({ t: 'rect', x: x - a / 2, y, w: a, h: a });
  } else if (vzorec === 'reze') {
    const w = 0.012;
    for (let x = 0.03; x < 1; x += 0.05) {
      let y = rob + rnd() * 0.12;
      while (y < H - rob - 0.05) {
        const d = 0.05 + rnd() * 0.2;
        const yy = Math.min(d, H - rob - y);
        if (yy > 0.03) o.push({ t: 'rect', x: x - w / 2 + (rnd() - 0.5) * 0.01, y, w, h: yy });
        y += yy + 0.03 + rnd() * 0.1;
      }
    }
  } else if (vzorec === 'trava') {
    const vmax = Math.min(H * 0.5, 0.6);
    for (let i = 0; i < 26; i++) {
      const x = (i + rnd() * 0.8) / 26;
      const w = 0.014 + rnd() * 0.02;
      const h = vmax * (0.3 + rnd() * 0.7);
      const nagib = (rnd() - 0.5) * 0.16;
      const y0 = rob * 0.6;
      o.push({ t: 'path', d: [['M', x - w / 2, y0], ['Q', x - w / 2 + nagib * 0.3, y0 + h * 0.55, x + nagib, y0 + h], ['Q', x + w / 2 + nagib * 0.35, y0 + h * 0.5, x + w / 2, y0], ['Z']] });
    }
  } else if (vzorec === 'veje') {
    // vejice z listi kot na fotografiji: dve do tri vejice na meter, listi ob steblu izmenično levo in desno
    const nVej = 2;
    for (let i = 0; i < nVej; i++) {
      for (const zamik of [-0.09, 0.08]) {
        const x0 = (i + 0.5) / nVej + zamik + (rnd() - 0.5) * 0.05;
        const hs = H * (0.42 + rnd() * 0.22);
        const nag = (rnd() - 0.5) * 0.14;
        const deb = 0.007;
        const y0 = rob * 0.8;
        o.push({ t: 'path', d: [['M', x0 - deb, y0], ['Q', x0 - deb + nag * 0.6, y0 + hs * 0.55, x0 + nag, y0 + hs], ['Q', x0 + deb + nag * 0.6, y0 + hs * 0.55, x0 + deb, y0], ['Z']] });
        let strana = rnd() < 0.5 ? 1 : -1;
        for (let t = 0.2; t < 0.98; t += 0.1) {
          const yy = y0 + hs * t;
          const xx = x0 + nag * t * t;
          const vel = 0.034 + rnd() * 0.014;
          const kot = strana * 0.55 + (rnd() - 0.5) * 0.25;
          // list stoji poševno navzgor od stebla
          o.push({ t: 'ellipse', cx: xx + strana * vel * Math.cos(kot), cy: yy + vel * Math.sin(Math.abs(kot)) * 0.9, rx: vel, ry: vel * 0.38, rot: strana > 0 ? kot : Math.PI - Math.abs(kot) });
          strana = -strana;
        }
        o.push({ t: 'ellipse', cx: x0 + nag, cy: y0 + hs + 0.03, rx: 0.03, ry: 0.012, rot: Math.PI / 2 + nag * 2 });
      }
    }
    // posamezni listi, ki letijo v zgornjem delu
    for (let i = 0; i < 9; i++) {
      const vel = 0.02 + rnd() * 0.014;
      o.push({ t: 'ellipse', cx: 0.03 + rnd() * 0.94, cy: H * (0.66 + rnd() * 0.26), rx: vel, ry: vel * 0.45, rot: rnd() * Math.PI });
    }
  } else if (vzorec === 'trak') {
    const r = 0.009, korak = 0.035;
    const y0 = H * 0.58, y1 = Math.min(H * 0.8, H - rob);
    let vrsta = 0;
    for (let y = y0; y < y1; y += korak, vrsta++) for (let x = (vrsta % 2) * korak / 2 + korak / 2; x < 1; x += korak) o.push({ t: 'ellipse', cx: x, cy: y, rx: r, ry: r, rot: 0 });
  }
  predpomnilnik.set(kljuc, o);
  return o;
}

/** SVG elementi oblik v px: px = x*s + ox, py = oy - y*s (y navzgor) */
export function oblikeSvg(oblike: Oblika[], s: number, ox: number, oy: number, fill: string) {
  const n = (v: number) => Math.round(v * 10) / 10;
  const X = (x: number) => n(ox + x * s);
  const Y = (y: number) => n(oy - y * s);
  return oblike
    .map((o) => {
      if (o.t === 'rect') return `<rect x="${X(o.x)}" y="${Y(o.y + o.h)}" width="${n(o.w * s)}" height="${n(o.h * s)}" fill="${fill}"/>`;
      if (o.t === 'ellipse') return `<ellipse cx="${X(o.cx)}" cy="${Y(o.cy)}" rx="${n(o.rx * s)}" ry="${n(o.ry * s)}" transform="rotate(${n((-o.rot * 180) / Math.PI)} ${X(o.cx)} ${Y(o.cy)})" fill="${fill}"/>`;
      const d = o.d
        .map((c) => (c[0] === 'Z' ? 'Z' : c[0] === 'Q' ? `Q${X(c[1])} ${Y(c[2])} ${X(c[3])} ${Y(c[4])}` : `${c[0]}${X(c[1])} ${Y(c[2])}`))
        .join(' ');
      return `<path d="${d}" fill="${fill}"/>`;
    })
    .join('');
}

/** nariše oblike na 2D platno (za 3D masko): 1 m = ppm px, y navzgor */
export function oblikeNaPlatno(g: CanvasRenderingContext2D, oblike: Oblika[], ppm: number, visinaPx: number) {
  const X = (x: number) => x * ppm;
  const Y = (y: number) => visinaPx - y * ppm;
  for (const o of oblike) {
    g.beginPath();
    if (o.t === 'rect') g.rect(X(o.x), Y(o.y + o.h), o.w * ppm, o.h * ppm);
    else if (o.t === 'ellipse') g.ellipse(X(o.cx), Y(o.cy), o.rx * ppm, o.ry * ppm, -o.rot, 0, Math.PI * 2);
    else
      for (const c of o.d) {
        if (c[0] === 'M') g.moveTo(X(c[1]), Y(c[2]));
        else if (c[0] === 'L') g.lineTo(X(c[1]), Y(c[2]));
        else if (c[0] === 'Q') g.quadraticCurveTo(X(c[1]), Y(c[2]), X(c[3]), Y(c[4]));
        else g.closePath();
      }
    g.fill();
  }
}
