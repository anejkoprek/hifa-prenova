// Skupni nazivi izbir za pročelje, konfigurator in povpraševanje.
import type { DelId, PolniloP, OblikaNadstreska, VrataP } from './risbe/procelje';

export const polnilaNazivi: Record<PolniloP, string> = {
  vertikalne: 'Navpične letvice',
  palicna: 'Palice',
  horizontalne: 'Vodoravne letvice',
  steklo: 'Steklo',
  zarki: 'Žarki',
  perforirana: 'Perforirana pločevina',
};

export const polnilaOpisi: Record<PolniloP, string> = {
  vertikalne: 'Letvice iz pravokotne cevi 30 × 10 mm v okvirju.',
  palicna: 'Navpični profili 50 × 30 mm, klasična in pregledna izvedba.',
  horizontalne: 'Lamele iz cevi 50 × 20 mm v okvirju, sodoben videz.',
  steklo: 'Kaljeno varnostno steklo v kovinskem okvirju.',
  zarki: 'Križajoče se palice premera 8 mm, lahek in prepoznaven vzorec.',
  perforirana: 'Polna pločevina s trakom perforacije, za več zasebnosti.',
};

export const oblikeNazivi: Record<OblikaNadstreska, string> = {
  box: 'Box (ravna streha)',
  enokapnica: 'Enokapnica',
};

export const vrataNazivi: Record<VrataP, string> = {
  drsna: 'Drsna',
  samonosna: 'Samonosna',
  krilna: 'Krilna',
};

export type DelOpis = {
  id: DelId;
  naziv: string;
  kratko: string;
  opis: string;
  href: string;
  galerija: string;
  polnila?: PolniloP[];
  oblike?: OblikaNadstreska[];
  vrata?: VrataP[];
  /** parameter za konfigurator */
  konfigurator: string;
};

export const deli: Record<DelId, DelOpis> = {
  A: {
    id: 'A',
    naziv: 'Balkonska ograja',
    kratko: 'Balkon',
    opis: 'Aluminij, inox ali vroče cinkano jeklo, montaža z vrha ali s strani plošče.',
    href: '/ograje',
    galerija: 'zunanje-balkonske-ograje',
    polnila: ['vertikalne', 'palicna', 'horizontalne', 'steklo', 'zarki', 'perforirana'],
    konfigurator: 'izdelek=ograja&tip=balkonska',
  },
  B: {
    id: 'B',
    naziv: 'Nadstrešek',
    kratko: 'Nadstrešek',
    opis: 'Za avto, vhod ali teraso, ob hiši ali samostojen, s steklom, polikarbonatom ali pločevino.',
    href: '/nadstreski',
    galerija: 'nadstreski',
    oblike: ['box', 'enokapnica'],
    konfigurator: 'izdelek=nadstresek',
  },
  C: {
    id: 'C',
    naziv: 'Stopnišče in ograja',
    kratko: 'Stopnice',
    opis: 'Ograja ob zunanjih stopnicah in podestu, prašno barvana v barvi balkona ali vrat.',
    href: '/stopnisca',
    galerija: 'zunanje-stopniscne-ograje',
    polnila: ['steklo', 'palicna', 'horizontalne', 'vertikalne', 'zarki'],
    konfigurator: 'izdelek=ograja&tip=stopniscna-zunanja',
  },
  D: {
    id: 'D',
    naziv: 'Dvoriščna ograja in vrata',
    kratko: 'Dvorišče',
    opis: 'Ograja na podzidku ali temeljih, drsna, samonosna ali krilna vrata, pogon in osebni prehod.',
    href: '/ograje#dvoriscne',
    galerija: 'zunanje-dvoriscne-ograje',
    polnila: ['horizontalne', 'vertikalne', 'perforirana', 'palicna'],
    vrata: ['drsna', 'samonosna', 'krilna'],
    konfigurator: 'izdelek=ograja&tip=dvoriscna',
  },
};
