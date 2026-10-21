// Žarki: palice premera 8–12 mm, ki se križajo. Štiri izvedbe po fotografijah izvedenih ograj.
// Generator vrne odseke v koordinatah polja (x po dolžini, v navpično od spodnjega roba polja), zato ga
// uporabljata 2D risba in 3D model; pri stopniščih se v preslika v naklon.

export type VzorecZarkov = 'pokoncni' | 'vodoravni' | 'pahljaca' | 'krizni';

export const vzorciZarkov: { id: VzorecZarkov; naziv: string; opis: string }[] = [
  { id: 'pokoncni', naziv: 'Pokončni', opis: 'Skoraj navpične palice, nagnjene levo in desno' },
  { id: 'vodoravni', naziv: 'Vodoravni', opis: 'Palice od stebra do stebra pod različnimi koti' },
  { id: 'pahljaca', naziv: 'Pahljača', opis: 'Palice izhajajo iz vogala polja' },
  { id: 'krizni', naziv: 'Križni', opis: 'Enakomerna mreža poševnih palic' },
];

export type Odsek = [number, number, number, number];

function nakljucno(seme: number) {
  let a = (seme * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** obreže daljico na pravokotnik [0,L] × [0,h] (Liang–Barsky) */
function obrezi(x1: number, y1: number, x2: number, y2: number, L: number, h: number): Odsek | null {
  const dx = x2 - x1, dy = y2 - y1;
  let t0 = 0, t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1, L - x1, y1, h - y1];
  for (let i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-12) {
      if (q[i] < 0) return null;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
    }
  }
  if (t1 - t0 < 1e-4) return null;
  return [x1 + dx * t0, y1 + dy * t0, x1 + dx * t1, y1 + dy * t1];
}

/**
 * Odseki palic za eno polje dolžine L in višine h.
 * razmik: povprečen razmik med palicami (m), seme: zaporedna številka polja (da so polja različna, a vedno enaka).
 */
export function odsekiZarkov(vzorec: VzorecZarkov, L: number, h: number, razmik: number, seme = 0): Odsek[] {
  const rnd = nakljucno(Math.round(L * 1000) + seme * 7919 + vzorec.length * 131);
  const g = Math.max(0.05, razmik);
  const out: Odsek[] = [];
  const dodaj = (a: Odsek | null) => {
    if (a && Math.hypot(a[2] - a[0], a[3] - a[1]) > 0.05) out.push(a);
  };

  if (vzorec === 'pokoncni') {
    // palice začnejo tudi malo izven polja, da so robovi enako gosti kot sredina
    const sirsi = L + h * 0.5;
    const n = Math.max(3, Math.round(sirsi / g));
    for (let i = 0; i < n; i++) {
      const xb = -h * 0.25 + ((i + 0.15 + rnd() * 0.7) * sirsi) / n;
      const nagib = (rnd() < 0.5 ? -1 : 1) * h * (0.06 + rnd() * 0.32);
      dodaj(obrezi(xb, 0, xb + nagib, h, L, h));
    }
  } else if (vzorec === 'vodoravni') {
    const n = Math.max(3, Math.round(h / (g * 0.9)));
    const desno = Array.from({ length: n }, (_, i) => i).sort(() => rnd() - 0.5);
    for (let i = 0; i < n; i++) {
      const yl = ((i + 0.15 + rnd() * 0.7) * h) / n;
      const yr = ((desno[i] + 0.15 + rnd() * 0.7) * h) / n;
      dodaj(obrezi(0, yl, L, yr, L, h));
    }
  } else if (vzorec === 'pahljaca') {
    // izhodišče v spodnjem vogalu; sosednji polji sta zrcalni, da se pahljače lepo nadaljujejo
    const levo = seme % 2 === 0;
    const ox = levo ? 0 : L;
    const obseg = L + h;
    const n = Math.max(4, Math.round(obseg / g));
    for (let i = 1; i <= n; i++) {
      // ciljna točka po zgornjem robu in nasprotni stranici
      const t = (i / (n + 0.5)) * obseg;
      const tx = t <= L ? (levo ? t : L - t) : levo ? L : 0;
      const ty = t <= L ? h : h - (t - L);
      dodaj(obrezi(ox, 0, tx, ty, L, h));
    }
  } else {
    const dxk = h * 0.58;
    for (let s = -dxk; s < L + dxk; s += g * 1.15) {
      dodaj(obrezi(s, 0, s + dxk, h, L, h));
      dodaj(obrezi(s + dxk, 0, s, h, L, h));
    }
  }
  return out;
}
