// Stanje konfiguratorja, privzete vrednosti, branje iz URL-ja in povzetek za povpraševanje.
import { naPlosci, type TipOgraje, type Polnilo, type Montaza, type Vrata, type SmerLesa, type Rocaj } from './risbe/ograja';
import type { TipNadstreska, Postavitev, Kritina } from './risbe/nadstresek';
import { polnilaNazivi } from './moznosti';
import { RAL } from './ral';
import { vzorci, type Vzorec } from './vzorci';
import { vzorciZarkov, type VzorecZarkov } from './zarki';

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
  /** pri palicah in navpičnih letvicah: zgornja letev čez palice ali odprte palice s tanko vodoravno šipko */
  zakljucek: Zakljucek;
  /** perforirana pločevina: vzorec izreza */
  vzorec: Vzorec;
  /** žarki: izvedba */
  zarki: VzorecZarkov;
  /** lesene deske: pokončne ali vodoravne */
  smerLesa: SmerLesa;
  /** notranje ograje: kovinski ali lesen ročaj */
  rocaj: Rocaj;
  /** višina vezne palice pri izvedbi brez zgornjega ročaja, cm od tal (od polovice višine navzgor) */
  sipka: number;
  /** montaža s strani: ograja pritrjena neposredno na nosilno ploščo, brez stebričkov */
  /** montaža s strani: koliko ograja sega pod nivo tal balkona, cm (0 = poravnano s tlemi) */
  podaljsek: number;
};

export type Zakljucek = 'rocaj' | 'odprto';
export type StenaTip = 'lamele' | 'mehanske' | 'les';
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
  /** zadnja stena (samo samostojen nadstrešek; ob objektu je zadaj objekt) */
  stranZadaj: boolean;
  stenaTip: StenaTip;
  stenaSmer: StenaSmer;
  /** samo box ob objektu, brez stranskih sten: stebra ob straneh pomaknjena nazaj proti objektu, s trikotno konzolo */
  konzole: boolean;
  /** lesena obloga stropa pod kritino */
  lesenStrop: boolean;
};

export const tipiOgraj: { id: TipOgraje; naziv: string; opis: string }[] = [
  { id: 'balkonska', naziv: 'Balkonska ograja', opis: 'Balkoni in terase' },
  { id: 'dvoriscna', naziv: 'Dvoriščna ograja', opis: 'Z vrati in prehodom' },
  { id: 'stopniscna-zunanja', naziv: 'Zunanja stopniščna', opis: 'Ob stopnicah in podestih' },
  { id: 'stopniscna-notranja', naziv: 'Notranja stopniščna', opis: 'Ob stopnicah in ob zgornji etaži' },
  { id: 'galerijska', naziv: 'Galerijska ograja', opis: 'Notranja galerija ali odprta etaža' },
];
export { naPlosci };

// brez stekla; perforirana pločevina samo zunaj: ograje okoli hiše in zunanji balkoni (v hiši je ne dajemo)
export const polnilaZaTip: Record<TipOgraje, Polnilo[]> = {
  balkonska: ['vertikalne', 'palicna', 'horizontalne', 'zarki', 'perforirana', 'les'],
  dvoriscna: ['horizontalne', 'vertikalne', 'palicna', 'perforirana', 'zarki', 'les'],
  'stopniscna-zunanja': ['palicna', 'vertikalne', 'horizontalne', 'zarki', 'les'],
  'stopniscna-notranja': ['palicna', 'vertikalne', 'horizontalne', 'zarki'],
  galerijska: ['palicna', 'vertikalne', 'horizontalne', 'zarki', 'les'],
};

/** razmik nosilnih stebrov (m) */
export const razmikStebrovZaTip: Record<TipOgraje, { min: number; max: number; privzeto: number }> = {
  balkonska: { min: 0.8, max: 2, privzeto: 1.3 },
  dvoriscna: { min: 1, max: 3, privzeto: 2 },
  'stopniscna-zunanja': { min: 0.8, max: 1.6, privzeto: 1.2 },
  'stopniscna-notranja': { min: 0.8, max: 1.6, privzeto: 1.2 },
  galerijska: { min: 0.8, max: 2, privzeto: 1.3 },
};

/** svetli razmik med letvicami / palicami (cm); polnila brez letvic (pločevina) nimajo drsnika */
export const razmikPolnilaZaPolnilo: Partial<Record<Polnilo, { min: number; max: number; privzeto: number; korak: number; oznaka: string }>> = {
  vertikalne: { min: 1, max: 20, privzeto: 2.5, korak: 0.5, oznaka: 'Razmik med vmesnimi letvicami' },
  palicna: { min: 4, max: 20, privzeto: 9, korak: 0.5, oznaka: 'Razmik med palicami' },
  horizontalne: { min: 0.5, max: 15, privzeto: 1.5, korak: 0.5, oznaka: 'Razmik med lamelami' },
  zarki: { min: 5, max: 30, privzeto: 9, korak: 1, oznaka: 'Razmik med žarki' },
  les: { min: 0.5, max: 5, privzeto: 1.5, korak: 0.5, oznaka: 'Razmik med deskami' },
};

export const zakljucki: { id: Zakljucek; naziv: string; opis: string }[] = [
  { id: 'rocaj', naziv: 'Z zgornjim ročajem', opis: 'Palice so zgoraj zaključene z vodoravnim ročajem' },
  { id: 'odprto', naziv: 'Brez zgornjega ročaja', opis: 'Prosto stoječe palice, povezane z vezno palico' },
];
/** polnila, pri katerih lahko palice zgoraj ostanejo odprte */
export const imaZakljucek = (p: Polnilo) => p === 'palicna' || p === 'vertikalne';
export { vzorci, vzorciZarkov };
/** šipka pri odprtih palicah: od polovice višine navzgor do tik pod vrhom letev (ne nižje od polovice) */
export const sipkaRazpon = (visina: number) => ({ min: Math.ceil(visina / 2), max: Math.max(Math.ceil(visina / 2), visina - 8) });
export const sipkaPrivzeto = (visina: number) => visina - 12;
export const smeriLesa: { id: SmerLesa; naziv: string; opis: string }[] = [
  { id: 'navpicne', naziv: 'Pokončne deske', opis: 'Širina 12 cm, kot pri dvoriščnih ograjah' },
  { id: 'vodoravne', naziv: 'Vodoravne deske', opis: 'Višina 9 cm, kot pri balkonih' },
];
export const rocaji: { id: Rocaj; naziv: string; opis: string }[] = [
  { id: 'kovina', naziv: 'Kovinski ročaj', opis: 'V barvi ograje' },
  { id: 'les', naziv: 'Lesen ročaj', opis: 'Masiven les čez vrh ograje' },
];
/** lesen ročaj samo pri notranjih ograjah */
export const imaLesenRocaj = (t: TipOgraje) => t === 'stopniscna-notranja' || t === 'galerijska';
export const podaljsekRazpon = { min: 0, max: 40, privzeto: 0 };

export const visinaZaTip: Record<TipOgraje, { min: number; max: number; privzeto: number }> = {
  balkonska: { min: 90, max: 130, privzeto: 110 },
  dvoriscna: { min: 80, max: 200, privzeto: 120 },
  'stopniscna-zunanja': { min: 90, max: 120, privzeto: 100 },
  'stopniscna-notranja': { min: 90, max: 120, privzeto: 100 },
  galerijska: { min: 90, max: 130, privzeto: 100 },
};

/** razpon dolžine ograje po vrsti: od kratkega balkona do ograje okoli celega dvorišča */
export const dolzinaZaTip: Record<TipOgraje, { min: number; max: number; privzeto: number }> = {
  balkonska: { min: 1, max: 30, privzeto: 8 },
  dvoriscna: { min: 2, max: 80, privzeto: 15 },
  'stopniscna-zunanja': { min: 1, max: 12, privzeto: 3.5 },
  'stopniscna-notranja': { min: 1, max: 12, privzeto: 4 },
  galerijska: { min: 1, max: 20, privzeto: 5 },
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
  galerijska: [
    { id: 'vrh', naziv: 'Z vrha', opis: 'Stebri stojijo na plošči galerije' },
    { id: 'stran', naziv: 'S strani', opis: 'Pritrjeno na čelo plošče, tla ostanejo prosta' },
  ],
};

export const materiali: { id: Material; naziv: string; opis: string }[] = [
  { id: 'aluminij', naziv: 'Aluminij', opis: 'Lahek, ne rjavi, prašno barvan' },
  { id: 'jeklo', naziv: 'Jeklo', opis: 'Prašno barvano' },
  { id: 'inox', naziv: 'Inox, barvan', opis: 'Nerjavno jeklo, prašno barvano po RAL' },
];
/** pri nadstreških je jeklo zunaj vroče cinkano */
export const materialiNadstreska = materiali.map((m) => (m.id === 'jeklo' ? { ...m, opis: 'Vroče cinkano in prašno barvano' } : m));
/** zunanje ograje so brez jekla; jeklo ostane pri notranjih ograjah in nadstreških */
/** jeklo samo v notranjosti, zunaj aluminij ali inox */
export const materialiZaTip = (t: TipOgraje) => (t === 'stopniscna-notranja' || t === 'galerijska' ? materiali : materiali.filter((m) => m.id !== 'jeklo'));

export const vrataMoznosti: { id: Vrata; naziv: string; opis: string }[] = [
  { id: 'brez', naziv: 'Brez vrat', opis: 'Samo ograja' },
  { id: 'drsna', naziv: 'Drsna', opis: 'Na kolesih po vodilu, vgrajenem v tla' },
  { id: 'samonosna', naziv: 'Samonosna', opis: 'Brez talnega vodila, na nosilnih vozičkih' },
  { id: 'krilna', naziv: 'Krilna', opis: 'Dve krili na tečajih' },
];

export const tipiNadstreskov: { id: TipNadstreska; naziv: string; opis: string }[] = [
  { id: 'box', naziv: 'Box', opis: 'Ravna streha, odvodnjavanje skozi steber' },
  { id: 'enokapnica', naziv: 'Enokapnica', opis: 'Streha v naklonu, zunanji žleb z odtočno cevjo' },
];

export const postavitve: { id: Postavitev; naziv: string; opis: string }[] = [
  { id: 'ob-objektu', naziv: 'Ob objektu', opis: 'Pritrjen na hišo' },
  { id: 'samostojen', naziv: 'Samostojen', opis: 'Na štirih ali več stebrih' },
];

export const kritine: { id: Kritina; naziv: string; opis: string }[] = [
  { id: 'steklo', naziv: 'Kaljeno steklo', opis: 'Največ svetlobe' },
  { id: 'polikarbonat', naziv: 'Polikarbonat', opis: 'Lahek, razpršena svetloba' },
  { id: 'trapezna', naziv: 'Sendvič panel', opis: 'Toplotno izoliran, neprosojen' },
  { id: 'folija', naziv: 'Folija Sikaplan', opis: 'Vodotesna membrana za ravno streho' },
];

/** sendvič panel samo pri enokapnici; folija Sikaplan samo pri ravni strehi (box) */
export const kritineZaTip: Record<TipNadstreska, Kritina[]> = {
  box: ['steklo', 'polikarbonat', 'folija'],
  enokapnica: ['steklo', 'polikarbonat', 'trapezna'],
};

export const steneTipi: { id: StenaTip; naziv: string; opis: string }[] = [
  { id: 'lamele', naziv: 'Lamele', opis: 'Fiksne aluminijaste lamele' },
  { id: 'mehanske', naziv: 'Mehanske lamele', opis: 'Nastavljiv naklon lamel' },
  { id: 'les', naziv: 'Lesena obloga', opis: 'Lesene letvice v kovinskem okvirju' },
];
/** stranski konzoli: samo box ob objektu z globino vsaj 2 m (in brez stranskih sten) */
export const imaKonzole = (n: { postavitev: Postavitev; tip: TipNadstreska; globina: number }) => n.postavitev === 'ob-objektu' && n.tip === 'box' && n.globina >= 2;
export const konzoleVklopljene = (n: NadstresekStanje) => n.konzole && imaKonzole(n) && !n.stranLevo && !n.stranDesno;
/** lesen strop samo pod neprosojno kritino */
export const imaLesenStrop = (k: Kritina) => k === 'trapezna' || k === 'folija';
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
  vzorec: 'kvadrati',
  zarki: 'pokoncni',
  smerLesa: 'navpicne',
  rocaj: 'kovina',
  sipka: 98,
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
  stranZadaj: false,
  stenaTip: 'lamele',
  stenaSmer: 'vertikalne',
  konzole: false,
  lesenStrop: false,
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
    vzorec: izbira(q.get('vzorec'), vzorci.map((v) => v.id), 'kvadrati'),
    zarki: izbira(q.get('zarki'), vzorciZarkov.map((v) => v.id), 'pokoncni'),
    smerLesa: izbira(q.get('deske'), ['navpicne', 'vodoravne'] as const, 'navpicne'),
    rocaj: izbira(q.get('rocaj'), ['kovina', 'les'] as const, 'kovina'),
    sipka: omeji(stevilo(q, 'sipka', sipkaPrivzeto(visina)), sr.min, sr.max),
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
    stranZadaj: q.get('zadaj') === '1',
    stenaTip: izbira(q.get('stena'), ['lamele', 'mehanske', 'les'] as const, 'lamele'),
    stenaSmer: izbira(q.get('smer'), ['vertikalne', 'horizontalne'] as const, 'vertikalne'),
    konzole: q.get('konzole') === '1',
    lesenStrop: q.get('strop') === 'les',
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
  if (imaZakljucek(o.polnilo)) {
    q.set('zakljucek', o.zakljucek);
    if (o.zakljucek === 'odprto') q.set('sipka', String(o.sipka));
  }
  if (o.polnilo === 'perforirana') q.set('vzorec', o.vzorec);
  if (o.polnilo === 'zarki') q.set('zarki', o.zarki);
  if (o.polnilo === 'les') q.set('deske', o.smerLesa);
  if (imaLesenRocaj(o.tip) && o.rocaj === 'les') q.set('rocaj', 'les');
  if (naPlosci(o.tip) && o.montaza === 'stran') {
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
  const zadaj = n.stranZadaj && n.postavitev === 'samostojen';
  if (zadaj) q.set('zadaj', '1');
  if (n.stranLevo || n.stranDesno || zadaj) {
    q.set('stena', n.stenaTip);
    q.set('smer', n.stenaSmer);
  }
  if (konzoleVklopljene(n)) q.set('konzole', '1');
  if (n.lesenStrop && imaLesenStrop(n.kritina)) q.set('strop', 'les');
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
  const proste = imaZakljucek(o.polnilo) && o.zakljucek === 'odprto';
  vrstice.push(proste ? 'Izvedba brez stebrov, nosilne palice 40 × 40 mm' : `Razmik nosilnih stebrov: ${m(o.razmikStebrov)}`);
  const rp = razmikPolnilaZaPolnilo[o.polnilo];
  if (rp) vrstice.push(`${rp.oznaka}: ${o.razmikPolnila.toLocaleString('sl-SI')} cm`);
  if (imaZakljucek(o.polnilo)) {
    vrstice.push(o.zakljucek === 'rocaj' ? 'Z zgornjim ročajem' : `Brez zgornjega ročaja, vezna palica na višini ${o.sipka} cm`);
  }
  if (o.polnilo === 'zarki') vrstice.push(`Žarki: ${naziv(vzorciZarkov, o.zarki).toLowerCase()}`);
  if (o.polnilo === 'les') vrstice.push(naziv(smeriLesa, o.smerLesa));
  if (imaLesenRocaj(o.tip) && o.rocaj === 'les' && !(imaZakljucek(o.polnilo) && o.zakljucek === 'odprto')) vrstice.push('Lesen ročaj');
  if (o.polnilo === 'perforirana') {
    vrstice.push(o.vzorec === 'po-meri' ? 'Vzorec izreza: po meri (priložena skica)' : `Vzorec izreza: ${naziv(vzorci, o.vzorec).toLowerCase()}`);
  }
  if (montazeZaTip[o.tip].length) vrstice.push(`Montaža: ${naziv(montazeZaTip[o.tip], o.montaza).toLowerCase()}`);
  if (naPlosci(o.tip) && o.montaza === 'stran') {
    vrstice.push('Montaža s stebrički na nosilni profil');
    vrstice.push(o.podaljsek ? `Podaljšek pod nivo tal: ${o.podaljsek} cm` : o.tip === 'galerijska' ? 'Spodnji rob v ravnini tal galerije' : 'Spodnji rob v ravnini tal balkona');
  }
  if (o.tip === 'dvoriscna') {
    if (o.vrata !== 'brez') vrstice.push(`Vrata: ${naziv(vrataMoznosti, o.vrata).toLowerCase()}, širina ${m(o.sirinaVrat)}${o.pogon ? ', s pogonom' : ''}`);
    else vrstice.push('Brez dvoriščnih vrat');
    if (o.osebniPrehod) vrstice.push('Osebni prehod');
  }
  return vrstice;
}

export function povzetekNadstreska(n: NadstresekStanje): string[] {
  const stene = [n.stranLevo && 'levo', n.stranDesno && 'desno', n.stranZadaj && n.postavitev === 'samostojen' && 'zadaj'].filter(Boolean).join(', ').replace(/, ([^,]*)$/, ' in $1');
  return [
    `Nadstrešek ${naziv(tipiNadstreskov, n.tip).toLowerCase()}, ${naziv(postavitve, n.postavitev).toLowerCase()}`,
    `${m(n.sirina)} × ${m(n.globina)}, svetla višina ${m(n.visina)}`,
    `Kritina: ${naziv(kritine, n.kritina).toLowerCase()}`,
    n.tip === 'enokapnica' ? 'Zunanji žleb z odtočno cevjo' : 'Odvodnjavanje skozi steber',
    `Material: ${naziv(materiali, n.material).toLowerCase()}, ${ralTekst(n.ral)}`,
    ...(stene
      ? [`Stena ${stene}: ${naziv(steneTipi, n.stenaTip).toLowerCase()}, ${naziv(steneSmeri, n.stenaSmer).toLowerCase()}, prekati po ${m(PREKAT)}`]
      : []),
    ...(konzoleVklopljene(n)
      ? ['Stebra ob straneh pomaknjena nazaj proti objektu, s trikotnima konzolama (okvir iz konstrukcije, lesena obloga); spredaj brez stebrov']
      : []),
    ...(n.lesenStrop && imaLesenStrop(n.kritina) ? ['Lesena obloga stropa'] : []),
    ...(n.sirina >= 6 && !konzoleVklopljene(n) ? ['Vmesni steber na sredini razpona'] : []),
  ];
}
