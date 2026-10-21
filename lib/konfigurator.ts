// Stanje konfiguratorja, privzete vrednosti, branje iz URL-ja in povzetek za povpraševanje.
import type { TipOgraje, Polnilo, Montaza, Vrata } from './risbe/ograja';
import type { TipNadstreska, Postavitev, Kritina } from './risbe/nadstresek';
import { polnilaNazivi } from './moznosti';
import { RAL } from './ral';

export type Material = 'aluminij' | 'inox' | 'jeklo';

export type OgrajaStanje = {
  tip: TipOgraje;
  polnilo: Polnilo;
  dolzina: number; // m
  visina: number; // cm
  montaza: Montaza;
  material: Material;
  ral: string;
  vrata: Vrata;
  sirinaVrat: number; // m
  osebniPrehod: boolean;
  pogon: boolean;
};

export type NadstresekStanje = {
  tip: TipNadstreska;
  postavitev: Postavitev;
  sirina: number;
  globina: number;
  visina: number;
  kritina: Kritina;
  material: Exclude<Material, 'inox'> | 'inox';
  ral: string;
  stranLevo: boolean;
  stranDesno: boolean;
};

export const tipiOgraj: { id: TipOgraje; naziv: string; opis: string }[] = [
  { id: 'balkonska', naziv: 'Balkonska ograja', opis: 'Balkoni in terase' },
  { id: 'dvoriscna', naziv: 'Dvoriščna ograja', opis: 'Z vrati in prehodom' },
  { id: 'stopniscna-zunanja', naziv: 'Zunanja stopniščna', opis: 'Ob stopnicah in podestih' },
  { id: 'stopniscna-notranja', naziv: 'Notranja stopniščna', opis: 'V hiši, tudi z lesom' },
];

export const polnilaZaTip: Record<TipOgraje, Polnilo[]> = {
  balkonska: ['vertikalne', 'palicna', 'horizontalne', 'steklo', 'zarki', 'perforirana'],
  dvoriscna: ['horizontalne', 'vertikalne', 'palicna', 'perforirana', 'zarki'],
  'stopniscna-zunanja': ['palicna', 'vertikalne', 'horizontalne', 'steklo', 'zarki'],
  'stopniscna-notranja': ['palicna', 'vertikalne', 'horizontalne', 'steklo', 'zarki'],
};

export const visinaZaTip: Record<TipOgraje, { min: number; max: number; privzeto: number }> = {
  balkonska: { min: 90, max: 130, privzeto: 110 },
  dvoriscna: { min: 80, max: 200, privzeto: 120 },
  'stopniscna-zunanja': { min: 90, max: 120, privzeto: 100 },
  'stopniscna-notranja': { min: 90, max: 120, privzeto: 100 },
};

/** razpon dolžine ograje po vrsti: od kratkega balkona do ograje okoli celega dvorišča */
export const dolzinaZaTip: Record<TipOgraje, { min: number; max: number; privzeto: number }> = {
  balkonska: { min: 1, max: 30, privzeto: 8 },
  dvoriscna: { min: 2, max: 80, privzeto: 15 },
  'stopniscna-zunanja': { min: 1.5, max: 15, privzeto: 5 },
  'stopniscna-notranja': { min: 1.5, max: 15, privzeto: 5 },
};

export const montazeZaTip: Record<TipOgraje, { id: Montaza; naziv: string; opis: string }[]> = {
  balkonska: [
    { id: 'vrh', naziv: 'Z vrha', opis: 'Stebri stojijo na plošči' },
    { id: 'stran', naziv: 'S strani', opis: 'Pritrjeno na čelo plošče' },
  ],
  dvoriscna: [
    { id: 'podzidek', naziv: 'Na podzidek', opis: 'Betonski zid pod ograjo' },
    { id: 'temelj', naziv: 'Na temelje', opis: 'Točkovni temelji za stebre' },
  ],
  'stopniscna-zunanja': [],
  'stopniscna-notranja': [],
};

export const materiali: { id: Material; naziv: string; opis: string }[] = [
  { id: 'aluminij', naziv: 'Aluminij', opis: 'Lahek, ne rjavi, prašno barvan' },
  { id: 'jeklo', naziv: 'Jeklo', opis: 'Vroče cinkano in prašno barvano' },
  { id: 'inox', naziv: 'Inox', opis: 'Nerjavno jeklo, brušeno ali barvano' },
];

export const vrataMoznosti: { id: Vrata; naziv: string }[] = [
  { id: 'brez', naziv: 'Brez vrat' },
  { id: 'drsna', naziv: 'Drsna' },
  { id: 'samonosna', naziv: 'Samonosna' },
  { id: 'krilna', naziv: 'Krilna' },
];

export const tipiNadstreskov: { id: TipNadstreska; naziv: string; opis: string }[] = [
  { id: 'box', naziv: 'Box', opis: 'Ravna streha, skrita v okvirju' },
  { id: 'enokapnica', naziv: 'Enokapnica', opis: 'Streha z naklonom in žlebom' },
];

export const postavitve: { id: Postavitev; naziv: string; opis: string }[] = [
  { id: 'ob-objektu', naziv: 'Ob objektu', opis: 'Pritrjen na hišo' },
  { id: 'samostojen', naziv: 'Samostojen', opis: 'Na štirih ali več stebrih' },
];

export const kritine: { id: Kritina; naziv: string; opis: string }[] = [
  { id: 'steklo', naziv: 'Kaljeno steklo', opis: 'Največ svetlobe' },
  { id: 'polikarbonat', naziv: 'Polikarbonat', opis: 'Lahek, razpršena svetloba' },
  { id: 'trapezna', naziv: 'Trapezna pločevina', opis: 'Z izolacijo, senca' },
  { id: 'folija', naziv: 'Folija', opis: 'Ravna streha' },
];

export const privzetaOgraja: OgrajaStanje = {
  tip: 'balkonska',
  polnilo: 'vertikalne',
  dolzina: 8,
  visina: 110,
  montaza: 'vrh',
  material: 'aluminij',
  ral: '7016',
  vrata: 'drsna',
  sirinaVrat: 4,
  osebniPrehod: true,
  pogon: true,
};

export const privzetNadstresek: NadstresekStanje = {
  tip: 'box',
  postavitev: 'ob-objektu',
  sirina: 5.5,
  globina: 3,
  visina: 2.4,
  kritina: 'steklo',
  material: 'aluminij',
  ral: '7016',
  stranLevo: false,
  stranDesno: false,
};

const omeji = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const stevilo = (q: URLSearchParams, k: string, d: number) => {
  const v = Number(q.get(k)?.replace(',', '.'));
  return Number.isFinite(v) && q.has(k) ? v : d;
};
const izbira = <T extends string>(v: string | null, dovoljeno: readonly T[], d: T): T => (v && (dovoljeno as readonly string[]).includes(v) ? (v as T) : d);
const ralKoda = (v: string | null, d: string) => (v && /^\d{4}$/.test(v) ? v : d);

export function ograjaIzUrl(q: URLSearchParams): OgrajaStanje {
  const tip = izbira(q.get('tip'), tipiOgraj.map((t) => t.id), privzetaOgraja.tip);
  const v = visinaZaTip[tip];
  const montaze = montazeZaTip[tip].map((m) => m.id);
  return {
    tip,
    polnilo: izbira(q.get('polnilo'), polnilaZaTip[tip], polnilaZaTip[tip][0]),
    dolzina: omeji(stevilo(q, 'dolzina', dolzinaZaTip[tip].privzeto), dolzinaZaTip[tip].min, dolzinaZaTip[tip].max),
    visina: omeji(stevilo(q, 'visina', v.privzeto), v.min, v.max),
    montaza: montaze.length ? izbira(q.get('montaza'), montaze, montaze[0]) : 'vrh',
    material: izbira(q.get('material'), materiali.map((m) => m.id), 'aluminij'),
    ral: ralKoda(q.get('ral'), '7016'),
    vrata: izbira(q.get('vrata'), vrataMoznosti.map((m) => m.id), privzetaOgraja.vrata),
    sirinaVrat: omeji(stevilo(q, 'sirinaVrat', 4), 1, 8),
    osebniPrehod: q.get('prehod') !== '0',
    pogon: q.get('pogon') !== '0',
  };
}

export function nadstresekIzUrl(q: URLSearchParams): NadstresekStanje {
  return {
    tip: izbira(q.get('tip') ?? q.get('oblika'), tipiNadstreskov.map((t) => t.id), privzetNadstresek.tip),
    postavitev: izbira(q.get('postavitev'), postavitve.map((p) => p.id), privzetNadstresek.postavitev),
    sirina: omeji(stevilo(q, 'sirina', privzetNadstresek.sirina), 2, 12),
    globina: omeji(stevilo(q, 'globina', privzetNadstresek.globina), 1.5, 8),
    visina: omeji(stevilo(q, 'visina', privzetNadstresek.visina), 2.1, 3.2),
    kritina: izbira(q.get('kritina'), kritine.map((k) => k.id), privzetNadstresek.kritina),
    material: izbira(q.get('material'), ['aluminij', 'jeklo', 'inox'] as const, 'aluminij'),
    ral: ralKoda(q.get('ral'), '7016'),
    stranLevo: q.get('levo') === '1',
    stranDesno: q.get('desno') === '1',
  };
}

export function ograjaVUrl(o: OgrajaStanje): string {
  const q = new URLSearchParams({
    izdelek: 'ograja',
    tip: o.tip,
    polnilo: o.polnilo,
    dolzina: String(o.dolzina),
    visina: String(o.visina),
    material: o.material,
    ral: o.ral,
  });
  if (montazeZaTip[o.tip].length) q.set('montaza', o.montaza);
  if (o.tip === 'dvoriscna') {
    q.set('vrata', o.vrata);
    if (o.vrata !== 'brez') {
      q.set('sirinaVrat', String(o.sirinaVrat));
      q.set('pogon', o.pogon ? '1' : '0');
    }
    q.set('prehod', o.osebniPrehod ? '1' : '0');
  }
  return q.toString();
}

export function nadstresekVUrl(n: NadstresekStanje): string {
  const q = new URLSearchParams({
    izdelek: 'nadstresek',
    tip: n.tip,
    postavitev: n.postavitev,
    sirina: String(n.sirina),
    globina: String(n.globina),
    visina: String(n.visina),
    kritina: n.kritina,
    material: n.material,
    ral: n.ral,
  });
  if (n.stranLevo) q.set('levo', '1');
  if (n.stranDesno) q.set('desno', '1');
  return q.toString();
}

const m = (v: number) => `${v.toLocaleString('sl-SI', { maximumFractionDigits: 2 })} m`;
const ralTekst = (k: string) => {
  const r = RAL.find((x) => x.koda === k);
  return r ? `RAL ${k} ${r.ime.toLowerCase()}` : `RAL ${k}`;
};
const naziv = <T extends { id: string; naziv: string }>(arr: T[], id: string) => arr.find((x) => x.id === id)?.naziv ?? id;

export function povzetekOgraje(o: OgrajaStanje): string[] {
  const vrstice = [
    naziv(tipiOgraj, o.tip),
    `Polnilo: ${polnilaNazivi[o.polnilo].toLowerCase()}`,
    `Dolžina ${m(o.dolzina)}, višina ${o.visina} cm`,
    `Material: ${naziv(materiali, o.material).toLowerCase()}, ${ralTekst(o.ral)}`,
  ];
  if (montazeZaTip[o.tip].length) vrstice.push(`Montaža: ${naziv(montazeZaTip[o.tip], o.montaza).toLowerCase()}`);
  if (o.tip === 'dvoriscna') {
    if (o.vrata !== 'brez') vrstice.push(`Vrata: ${naziv(vrataMoznosti, o.vrata).toLowerCase()}, širina ${m(o.sirinaVrat)}${o.pogon ? ', s pogonom' : ''}`);
    else vrstice.push('Brez dvoriščnih vrat');
    if (o.osebniPrehod) vrstice.push('Osebni prehod');
  }
  return vrstice;
}

export function povzetekNadstreska(n: NadstresekStanje): string[] {
  const stene = [n.stranLevo && 'levo', n.stranDesno && 'desno'].filter(Boolean).join(' in ');
  return [
    `Nadstrešek ${naziv(tipiNadstreskov, n.tip).toLowerCase()}, ${naziv(postavitve, n.postavitev).toLowerCase()}`,
    `${m(n.sirina)} × ${m(n.globina)}, svetla višina ${m(n.visina)}`,
    `Kritina: ${naziv(kritine, n.kritina).toLowerCase()}`,
    `Material: ${naziv(materiali, n.material).toLowerCase()}, ${ralTekst(n.ral)}`,
    ...(stene ? [`Steklena stranska stena ${stene}`] : []),
  ];
}
