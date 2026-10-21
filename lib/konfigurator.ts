// Stanje konfiguratorja, privzete vrednosti, branje iz URL-ja in povzetek za povpraševanje.
import type { TipOgraje, Polnilo, Montaza, Vrata } from './risbe/ograja';
import type { TipNadstreska, Postavitev, Kritina } from './risbe/nadstresek';
import { polnilaNazivi } from './moznosti';
import { RAL } from './ral';

export type Material = 'aluminij' | 'inox' | 'jeklo';

export type OgrajaStanje = {
  tip: TipOgraje;
  polnilo: Polnilo;
  dolzina: number; // m (pri stopniščih: dolžina ob stopnicah)
  podest: number; // m, vodoravni del ograje na podestu (samo stopnišča)
  visina: number; // cm
  montaza: Montaza;
  material: Material;
  ral: string;
  vrata: Vrata;
  sirinaVrat: number; // m
  osebniPrehod: boolean;
  pogon: boolean;
  /** razmik nosilnih stebrov, m */
  razmikStebrov: number;
  /** svetli razmik med vmesnimi letvicami oz. palicami, cm */
  razmikPolnila: number;
  /** pri palicah: vodoravni ročaj čez palice ali odprte palice z vodoravno šipko */
  zakljucek: Zakljucek;
  /** višina vodoravne šipke pri odprtih palicah, cm od tal (največ polovica višine) */
  sipka: number;
  /** montaža s strani: ograja pritrjena neposredno na nosilno ploščo, brez stebričkov */
  brezStebrickov: boolean;
  /** montaža s strani: koliko ograja sega pod nivo tal balkona, cm (0 = poravnano s tlemi) */
  podaljsek: number;
};

export type Zakljucek = 'rocaj' | 'odprto';
export type StenaTip = 'lamele' | 'mehanske';
export type StenaSmer = 'vertikalne' | 'horizontalne';

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
  stenaTip: StenaTip;
  stenaSmer: StenaSmer;
};

export const tipiOgraj: { id: TipOgraje; naziv: string; opis: string }[] = [
  { id: 'balkonska', naziv: 'Balkonska ograja', opis: 'Balkoni in terase' },
  { id: 'dvoriscna', naziv: 'Dvoriščna ograja', opis: 'Z vrati in prehodom' },
  { id: 'stopniscna-zunanja', naziv: 'Zunanja stopniščna', opis: 'Ob stopnicah in podestih' },
  { id: 'stopniscna-notranja', naziv: 'Notranja stopniščna', opis: 'V hiši, tudi z lesom' },
];

// brez stekla; perforirana pločevina samo pri dvoriščnih ograjah
export const polnilaZaTip: Record<TipOgraje, Polnilo[]> = {
  balkonska: ['vertikalne', 'palicna', 'horizontalne', 'zarki'],
  dvoriscna: ['horizontalne', 'vertikalne', 'palicna', 'perforirana', 'zarki'],
  'stopniscna-zunanja': ['palicna', 'vertikalne', 'horizontalne', 'zarki'],
  'stopniscna-notranja': ['palicna', 'vertikalne', 'horizontalne', 'zarki'],
};

/** razmik nosilnih stebrov (m) */
export const razmikStebrovZaTip: Record<TipOgraje, { min: number; max: number; privzeto: number }> = {
  balkonska: { min: 0.8, max: 2, privzeto: 1.3 },
  dvoriscna: { min: 1.2, max: 2.5, privzeto: 2 },
  'stopniscna-zunanja': { min: 0.8, max: 1.6, privzeto: 1.2 },
  'stopniscna-notranja': { min: 0.8, max: 1.6, privzeto: 1.2 },
};

/** svetli razmik med letvicami / palicami (cm); polnila brez letvic (pločevina) nimajo drsnika */
export const razmikPolnilaZaPolnilo: Partial<Record<Polnilo, { min: number; max: number; privzeto: number; korak: number; oznaka: string }>> = {
  vertikalne: { min: 1, max: 8, privzeto: 2.5, korak: 0.5, oznaka: 'Razmik med letvicami' },
  palicna: { min: 4, max: 10, privzeto: 9, korak: 0.5, oznaka: 'Razmik med palicami' },
  horizontalne: { min: 0.5, max: 6, privzeto: 1.5, korak: 0.5, oznaka: 'Razmik med lamelami' },
  zarki: { min: 8, max: 20, privzeto: 13, korak: 1, oznaka: 'Razmik med žarki' },
};

export const zakljucki: { id: Zakljucek; naziv: string; opis: string }[] = [
  { id: 'rocaj', naziv: 'Z ročajem', opis: 'Vodoravni ročaj pokrije palice zgoraj' },
  { id: 'odprto', naziv: 'Odprte palice', opis: 'Palice proste navzgor, povezuje jih vodoravna šipka' },
];
/** šipka pri odprtih palicah: največ na polovici višine, najmanj na četrtini */
export const sipkaRazpon = (visina: number) => ({ min: Math.round(visina * 0.25), max: Math.floor(visina / 2) });
export const podaljsekRazpon = { min: 0, max: 40, privzeto: 0 };

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
  'stopniscna-zunanja': { min: 1, max: 12, privzeto: 3.5 },
  'stopniscna-notranja': { min: 1, max: 12, privzeto: 4 },
};

export const jeStopnisce = (t: TipOgraje) => t === 'stopniscna-zunanja' || t === 'stopniscna-notranja';
/** vodoravni del ograje na podestu oz. ob zgornji etaži */
export const podestRazpon = { min: 0, max: 10, privzeto: 1.5 };
/** skupna dolžina ograje za ponudbo */
export const skupnaDolzina = (o: OgrajaStanje) => o.dolzina + (jeStopnisce(o.tip) ? o.podest : 0);

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
  { id: 'jeklo', naziv: 'Jeklo', opis: 'Prašno barvano' },
  { id: 'inox', naziv: 'Inox, barvan', opis: 'Nerjavno jeklo, prašno barvano po RAL' },
];
/** pri nadstreških je jeklo zunaj vroče cinkano */
export const materialiNadstreska = materiali.map((m) => (m.id === 'jeklo' ? { ...m, opis: 'Vroče cinkano in prašno barvano' } : m));
/** zunanje ograje so brez jekla; jeklo ostane pri notranjih ograjah in nadstreških */
export const materialiZaTip = (t: TipOgraje) => (t === 'stopniscna-notranja' ? materiali : materiali.filter((m) => m.id !== 'jeklo'));

export const vrataMoznosti: { id: Vrata; naziv: string; opis: string }[] = [
  { id: 'brez', naziv: 'Brez vrat', opis: 'Samo ograja' },
  { id: 'drsna', naziv: 'Drsna', opis: 'Kolesca na tirnici, vgrajeni v tla' },
  { id: 'samonosna', naziv: 'Samonosna', opis: 'Brez tirnice, krilo nosijo vozički za ograjo' },
  { id: 'krilna', naziv: 'Krilna', opis: 'Dve krili na tečajih' },
];

export const tipiNadstreskov: { id: TipNadstreska; naziv: string; opis: string }[] = [
  { id: 'box', naziv: 'Box', opis: 'Ravna streha v okvirju, odtok skozi steber' },
  { id: 'enokapnica', naziv: 'Enokapnica', opis: 'Streha z naklonom, viden žleb in odtočna cev' },
];

export const postavitve: { id: Postavitev; naziv: string; opis: string }[] = [
  { id: 'ob-objektu', naziv: 'Ob objektu', opis: 'Pritrjen na hišo' },
  { id: 'samostojen', naziv: 'Samostojen', opis: 'Na štirih ali več stebrih' },
];

export const kritine: { id: Kritina; naziv: string; opis: string }[] = [
  { id: 'steklo', naziv: 'Kaljeno steklo', opis: 'Največ svetlobe' },
  { id: 'polikarbonat', naziv: 'Polikarbonat', opis: 'Lahek, razpršena svetloba' },
  { id: 'trapezna', naziv: 'Sendvič panel', opis: 'Izoliran, polna senca' },
  { id: 'folija', naziv: 'Folija Sikaplan', opis: 'Vodotesna membrana za ravno streho' },
];

/** sendvič panel samo pri enokapnici; folija Sikaplan samo pri ravni strehi (box) */
export const kritineZaTip: Record<TipNadstreska, Kritina[]> = {
  box: ['steklo', 'polikarbonat', 'folija'],
  enokapnica: ['steklo', 'polikarbonat', 'trapezna'],
};

export const steneTipi: { id: StenaTip; naziv: string; opis: string }[] = [
  { id: 'lamele', naziv: 'Lamele', opis: 'Fiksne aluminijaste lamele' },
  { id: 'mehanske', naziv: 'Mehanske lamele', opis: 'Nastavljiv naklon, več ali manj svetlobe' },
];
export const steneSmeri: { id: StenaSmer; naziv: string }[] = [
  { id: 'vertikalne', naziv: 'Vertikalne' },
  { id: 'horizontalne', naziv: 'Horizontalne' },
];
/** stranska stena je razdeljena na prekate po 1,5 m */
export const PREKAT = 1.5;

export const privzetaOgraja: OgrajaStanje = {
  tip: 'balkonska',
  polnilo: 'vertikalne',
  dolzina: 8,
  podest: 1.5,
  visina: 110,
  montaza: 'vrh',
  material: 'aluminij',
  ral: '7016',
  vrata: 'drsna',
  sirinaVrat: 4,
  osebniPrehod: true,
  pogon: true,
  razmikStebrov: 1.3,
  razmikPolnila: 2.5,
  zakljucek: 'rocaj',
  sipka: 55,
  brezStebrickov: false,
  podaljsek: 0,
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
  stenaTip: 'lamele',
  stenaSmer: 'vertikalne',
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
    podest: omeji(stevilo(q, 'podest', podestRazpon.privzeto), podestRazpon.min, podestRazpon.max),
    visina: omeji(stevilo(q, 'visina', v.privzeto), v.min, v.max),
    montaza: montaze.length ? izbira(q.get('montaza'), montaze, montaze[0]) : 'vrh',
    material: izbira(q.get('material'), materiali.map((m) => m.id), 'aluminij'),
    ral: ralKoda(q.get('ral'), '7016'),
    vrata: izbira(q.get('vrata'), vrataMoznosti.map((m) => m.id), privzetaOgraja.vrata),
    sirinaVrat: omeji(stevilo(q, 'sirinaVrat', 4), 1, 8),
    osebniPrehod: q.get('prehod') !== '0',
    pogon: q.get('pogon') !== '0',
    ...dodatkiIzUrl(q, tip),
  };
}

function dodatkiIzUrl(q: URLSearchParams, tip: TipOgraje) {
  const polnilo = izbira(q.get('polnilo'), polnilaZaTip[tip], polnilaZaTip[tip][0]);
  const rs = razmikStebrovZaTip[tip];
  const rp = razmikPolnilaZaPolnilo[polnilo];
  const visina = omeji(stevilo(q, 'visina', visinaZaTip[tip].privzeto), visinaZaTip[tip].min, visinaZaTip[tip].max);
  const sr = sipkaRazpon(visina);
  return {
    razmikStebrov: omeji(stevilo(q, 'stebri', rs.privzeto), rs.min, rs.max),
    razmikPolnila: rp ? omeji(stevilo(q, 'razmik', rp.privzeto), rp.min, rp.max) : 0,
    zakljucek: izbira(q.get('zakljucek'), ['rocaj', 'odprto'] as const, 'rocaj'),
    sipka: omeji(stevilo(q, 'sipka', sr.max), sr.min, sr.max),
    brezStebrickov: q.get('brezStebrickov') === '1',
    podaljsek: omeji(stevilo(q, 'podaljsek', 0), podaljsekRazpon.min, podaljsekRazpon.max),
  };
}

export function nadstresekIzUrl(q: URLSearchParams): NadstresekStanje {
  return {
    tip: izbira(q.get('tip') ?? q.get('oblika'), tipiNadstreskov.map((t) => t.id), privzetNadstresek.tip),
    postavitev: izbira(q.get('postavitev'), postavitve.map((p) => p.id), privzetNadstresek.postavitev),
    sirina: omeji(stevilo(q, 'sirina', privzetNadstresek.sirina), 2, 12),
    globina: omeji(stevilo(q, 'globina', privzetNadstresek.globina), 1.5, 8),
    visina: omeji(stevilo(q, 'visina', privzetNadstresek.visina), 2.1, 3.2),
    kritina: izbira(q.get('kritina'), kritineZaTip[izbira(q.get('tip') ?? q.get('oblika'), tipiNadstreskov.map((t) => t.id), privzetNadstresek.tip)], 'steklo'),
    material: izbira(q.get('material'), ['aluminij', 'jeklo', 'inox'] as const, 'aluminij'),
    ral: ralKoda(q.get('ral'), '7016'),
    stranLevo: q.get('levo') === '1',
    stranDesno: q.get('desno') === '1',
    stenaTip: izbira(q.get('stena'), ['lamele', 'mehanske'] as const, 'lamele'),
    stenaSmer: izbira(q.get('smer'), ['vertikalne', 'horizontalne'] as const, 'vertikalne'),
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
  if (jeStopnisce(o.tip)) q.set('podest', String(o.podest));
  q.set('stebri', String(o.razmikStebrov));
  if (razmikPolnilaZaPolnilo[o.polnilo]) q.set('razmik', String(o.razmikPolnila));
  if (o.polnilo === 'palicna') {
    q.set('zakljucek', o.zakljucek);
    if (o.zakljucek === 'odprto') q.set('sipka', String(o.sipka));
  }
  if (o.tip === 'balkonska' && o.montaza === 'stran') {
    if (o.brezStebrickov) q.set('brezStebrickov', '1');
    if (o.podaljsek) q.set('podaljsek', String(o.podaljsek));
  }
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
  if (n.stranLevo || n.stranDesno) {
    q.set('stena', n.stenaTip);
    q.set('smer', n.stenaSmer);
  }
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
    jeStopnisce(o.tip)
      ? `Dolžina ${m(skupnaDolzina(o))} (${m(o.dolzina)} ob stopnicah + ${m(o.podest)} na podestu), višina ${o.visina} cm`
      : `Dolžina ${m(o.dolzina)}, višina ${o.visina} cm`,
    `Material: ${naziv(materiali, o.material).toLowerCase()}, ${ralTekst(o.ral)}`,
  ];
  vrstice.push(`Razmik nosilnih stebrov: ${m(o.razmikStebrov)}`);
  const rp = razmikPolnilaZaPolnilo[o.polnilo];
  if (rp) vrstice.push(`${rp.oznaka}: ${o.razmikPolnila.toLocaleString('sl-SI')} cm`);
  if (o.polnilo === 'palicna') {
    vrstice.push(o.zakljucek === 'rocaj' ? 'Palice z vodoravnim ročajem zgoraj' : `Odprte palice, vodoravna šipka na višini ${o.sipka} cm`);
  }
  if (montazeZaTip[o.tip].length) vrstice.push(`Montaža: ${naziv(montazeZaTip[o.tip], o.montaza).toLowerCase()}`);
  if (o.tip === 'balkonska' && o.montaza === 'stran') {
    vrstice.push(o.brezStebrickov ? 'Brez stebričkov, pritrjeno na nosilno ploščo' : 'S stebrički na nosilni plošči');
    vrstice.push(o.podaljsek ? `Ograja sega ${o.podaljsek} cm pod nivo tal balkona` : 'Spodnji rob poravnan s tlemi balkona');
  }
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
    n.tip === 'enokapnica' ? 'Viden žleb z odtočno cevjo' : 'Žleb v okvirju, odtok skozi steber',
    `Material: ${naziv(materiali, n.material).toLowerCase()}, ${ralTekst(n.ral)}`,
    ...(stene
      ? [`Stranska stena ${stene}: ${naziv(steneTipi, n.stenaTip).toLowerCase()}, ${naziv(steneSmeri, n.stenaSmer).toLowerCase()}, prekati po ${m(PREKAT)}`]
      : []),
    ...(n.sirina >= 6 ? ['Vmesni steber na sredini širine'] : []),
  ];
}
