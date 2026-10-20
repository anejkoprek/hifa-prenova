// Vse fotografije izvedenih del s stare strani hifa.si.
// Poti so relativne na https://www.hifa.si/. `npm run slike` jih prenese v public/hifa/,
// nato jih Next.js pri prikazu stisne v AVIF/WebP (glej lib/slike.ts).

export type Slika = { pot: string; alt?: string };
export type KategorijaId = 'ograje' | 'nadstreski' | 'stopnisca' | 'konstrukcije' | 'holler' | 'prej-potem';
export type Galerija = {
  slug: string;
  naziv: string;
  opis: string;
  kategorija: KategorijaId;
  altPredpona: string;
  naslovnica: string;
  slike: Slika[];
};

function zaporedje(slug: string, prviId: number, stevilo: number): Slika[] {
  return Array.from({ length: stevilo }, (_, i) => ({
    pot: `media/${prviId + i}/${slug}-hifa-${String(i + 1).padStart(2, '0')}.jpg`,
  }));
}

export const galerije: Galerija[] = [
  {
    slug: 'zunanje-balkonske-ograje',
    naziv: 'Balkonske ograje',
    opis: 'Aluminijaste in jeklene ograje za balkone in terase, s palicami, letvicami, pločevino ali steklom.',
    kategorija: 'ograje',
    altPredpona: 'Zunanja balkonska ograja HIFA',
    naslovnica: 'media/galleries/15/featured/zunanje-balkonske-ograje-hifa-23.jpg',
    slike: zaporedje('zunanje-balkonske-ograje', 154, 78),
  },
  {
    slug: 'zunanje-dvoriscne-ograje',
    naziv: 'Dvoriščne ograje in vrata',
    opis: 'Ograje okoli hiše in dvorišča, drsna, samonosna in krilna vrata ter osebni prehodi.',
    kategorija: 'ograje',
    altPredpona: 'Dvoriščna ograja HIFA',
    naslovnica: 'files/media/novi-vstop-ograje-vrata.jpg',
    slike: zaporedje('zunanje-dvoriscne-ograje', 232, 64),
  },
  {
    slug: 'notranje-ograje',
    naziv: 'Notranje ograje',
    opis: 'Ograje za notranja stopnišča in galerije, pogosto v kombinaciji z lesom ali steklom.',
    kategorija: 'ograje',
    altPredpona: 'Notranja stopniščna ograja HIFA',
    naslovnica: 'media/galleries/14/featured/notranje-ograje-hifa-31.jpg',
    slike: zaporedje('notranje-ograje', 95, 59),
  },
  {
    slug: 'zunanje-stopniscne-ograje',
    naziv: 'Zunanje stopniščne ograje',
    opis: 'Ograje ob zunanjih stopnicah in klančinah, prašno barvane po RAL lestvici.',
    kategorija: 'ograje',
    altPredpona: 'Zunanja stopniščna ograja HIFA',
    naslovnica: 'files/media/novi-vstop-zunanje-stopniscne-ograje.jpg',
    slike: zaporedje('zunanje-stopniscne-ograje', 296, 14),
  },
  {
    slug: 'nadstreski',
    naziv: 'Nadstreški',
    opis: 'Nadstreški za avtomobile, vhode, terase in balkone, s steklom, polikarbonatom ali pločevino.',
    kategorija: 'nadstreski',
    altPredpona: 'Nadstrešek HIFA',
    naslovnica: 'media/35/nadstreski-hifa-09.jpg',
    slike: zaporedje('nadstreski', 27, 68),
  },
  {
    slug: 'stopnisca',
    naziv: 'Stopnišča',
    opis: 'Kovinska stopnišča za zunanjo in notranjo uporabo, tudi z lesenimi stopnicami.',
    kategorija: 'stopnisca',
    altPredpona: 'Kovinsko stopnišče HIFA',
    naslovnica: 'files/media/novi-vstop-stopnisca.jpg',
    slike: zaporedje('stopnisca', 310, 29),
  },
  {
    slug: 'ostalo',
    naziv: 'Konstrukcije',
    opis: 'Kovinske konstrukcije po meri: nosilci, podesti, pohištvo in oprema lokalov.',
    kategorija: 'konstrukcije',
    altPredpona: 'Kovinska konstrukcija HIFA',
    naslovnica: 'files/media/novi-vstop-konstrukcije.jpg',
    slike: zaporedje('ostalo', 339, 33),
  },
  {
    slug: 'prej-potem',
    naziv: 'Prej in potem',
    opis: 'Kako je bilo pred montažo in kako je danes.',
    kategorija: 'prej-potem',
    altPredpona: 'Prej in potem, projekt HIFA',
    naslovnica: 'media/galleries/20/featured/prej-potem-hifa-15.jpg',
    slike: zaporedje('prej-potem', 372, 24),
  },
  {
    slug: 'holler-diy',
    naziv: 'Holler DIY',
    opis: 'Aluminijasta vrata in ograje avstrijskega proizvajalca Holler, ki jih izmerimo in montiramo.',
    kategorija: 'holler',
    altPredpona: 'Holler DIY',
    naslovnica: 'media/galleries/22/featured/vrata-holler-thumb.jpg',
    slike: [
      { pot: 'media/425/alu-precne-letve-65mm.jpg', alt: 'Ograja Q65 s prečnimi letvami 65 mm, antracit' },
      { pot: 'media/426/drsna-vrata-z-osebnim-prehodom-diy-gladka-plocevina-s-trakom-perforacije.jpg', alt: 'Osebni prehod in ograja iz gladke pločevine s trakom perforacije, antracit' },
      { pot: 'media/427/dvokrilna-vrata-diy-s-pogonom-srebrna-in-antracit.jpg', alt: 'Dvokrilna vrata s pogonom, jeklene prečne letve 100 mm' },
      { pot: 'media/428/gladka-plocevina-s-trakom-perforacije-antracit.jpg', alt: 'Drsna vrata in osebni prehod, gladka pločevina s trakom perforacije' },
      { pot: 'media/429/gladka-plocevina-s-trakom-perforacije-srebrna-in-antracit.jpg', alt: 'Jeklena ograja, antracit s srebrnim trakom perforacije' },
      { pot: 'media/430/holler-diy-drsna-vrata-gladka-plocevina-s-trakom-perforacije-antracit.jpg', alt: 'Drsna vrata iz gladke pločevine s trakom perforacije, antracit' },
      { pot: 'media/431/holler-diy-drsna-vrata-in-osebni-prehod-gladka-plocevina-s-trakom-perforacije.jpg', alt: 'Osebni prehod in drsna vrata s trakom perforacije' },
      { pot: 'media/432/holler-diy-drsna-vrata-polnilo-navpicne-aluminijaste-palice-110-srebrna.jpg', alt: 'Drsna vrata z navpičnimi aluminijastimi palicami 110 mm, srebrna' },
      { pot: 'media/436/holler-diy-osebni-prehod-gladka-plocevina-s-trakom-perforacije.jpg', alt: 'Drsna vrata in osebni prehod, gladka pločevina, antracit' },
      { pot: 'media/433/holler-diy-gladka-plocevina-vrata-in-osebni-prehod-antracit.jpg', alt: 'Vrata in osebni prehod iz gladke pločevine, srebrna in antracit' },
      { pot: 'media/434/holler-diy-ograja-gladka-plocevina-s-trakom-perforacije-dvobarvna.jpg', alt: 'Osebni prehod in dvobarvna ograja s perforirano pločevino' },
      { pot: 'media/435/holler-diy-ograja-perforirana-plocevina-srebrna.jpg', alt: 'Ograja iz perforirane pločevine, srebrna' },
      { pot: 'media/439/ograja-navpicne-aluminijaste-palice-32-mm.jpg', alt: 'Ograja z navpičnimi aluminijastimi palicami 32 mm' },
      { pot: 'media/442/precne-vodoravne-alu-letve-110-mm-antracit.jpg', alt: 'Vodoravne aluminijaste letve 110 mm, antracit' },
      { pot: 'media/438/drsna-vrata-precne-alu-letvice-32-mm.jpg', alt: 'Drsna vrata s prečnimi aluminijastimi letvicami 32 mm' },
      { pot: 'media/437/drsna-vrata-navpicne-alu-palice-32-mm.jpg', alt: 'Drsna vrata z navpičnimi aluminijastimi palicami 32 mm' },
      { pot: 'media/440/ograja-precne-alu-letvice-32-mm-antracit.jpg', alt: 'Ograja s prečnimi aluminijastimi letvicami 32 mm, antracit' },
      { pot: 'media/441/ograja-precne-alu-letvice-65-mm-srebrna.jpg', alt: 'Ograja s prečnimi aluminijastimi letvicami 65 mm, srebrna' },
    ],
  },
];

export const kategorije: { id: 'vse' | KategorijaId; naziv: string }[] = [
  { id: 'vse', naziv: 'Vse' },
  { id: 'ograje', naziv: 'Ograje' },
  { id: 'nadstreski', naziv: 'Nadstreški' },
  { id: 'stopnisca', naziv: 'Stopnišča' },
  { id: 'konstrukcije', naziv: 'Konstrukcije' },
  { id: 'holler', naziv: 'Holler DIY' },
  { id: 'prej-potem', naziv: 'Prej in potem' },
];

// Pari fotografij za drsnik prej/potem (zaporedne številke slik v galeriji prej-potem).
export const prejPotemPari = [
  { prej: 14, potem: 15, naslov: 'Nadstrešek nad vhodom in teraso' },
  { prej: 20, potem: 21, naslov: 'Pergola nad dvoriščem' },
  { prej: 18, potem: 19, naslov: 'Vhod z novim nadstreškom' },
  { prej: 22, potem: 23, naslov: 'Zunanje kovinsko stopnišče' },
  { prej: 6, potem: 7, naslov: 'Balkonska ograja s steklom' },
];

// Široke panoramske fotografije (2000 × 626) s stare naslovnice.
export const bannerji = {
  ograje: 'media/sliders/6/featured/banner-ograje-2.jpg',
  nadstreski: 'media/sliders/7/featured/banner-nadstreski-2.jpg',
  stopnisca: 'media/sliders/11/featured/banner-stopnisca-2.jpg',
  konstrukcije: 'media/sliders/10/featured/banner-konstrukcije-2.jpg',
  holler: 'media/sliders/12/featured/banner-vrata-in-ograje-holler-diy.jpg',
} as const;

export const ostaleSlike = {
  logo: 'img/logo-hifa.png',
  oPodjetju: 'img/o-podjetju-hifa.jpg',
  sofinanciranje: 'files/media/hifa-sofinanciranje.jpg',
  hollerLogo: 'files/media/holler-logo.png',
  hollerKatalog: 'files/media/slo-diy-2023-small.pdf',
} as const;

export type SlikaZ = Slika & { alt: string; galerija: string; kategorija: KategorijaId; st: number };

export function slikeGalerije(g: Galerija): SlikaZ[] {
  return g.slike.map((s, i) => ({
    ...s,
    alt: s.alt ?? `${g.altPredpona}, primer ${i + 1}`,
    galerija: g.slug,
    kategorija: g.kategorija,
    st: i + 1,
  }));
}

export function vseSlike(): SlikaZ[] {
  return galerije.flatMap(slikeGalerije);
}

export function galerija(slug: string) {
  return galerije.find((g) => g.slug === slug);
}

/** Pot do n-te slike (1-based) v galeriji. */
export function izGalerije(slug: string, st: number): string {
  const g = galerija(slug);
  if (!g) throw new Error(`Ni galerije ${slug}`);
  return g.slike[Math.min(st, g.slike.length) - 1].pot;
}

export const steviloSlik = galerije.reduce((n, g) => n + g.slike.length, 0);

/** Vse poti za prenos (galerije + naslovnice + bannerji + ostalo). */
export function vsePotiZaPrenos(): string[] {
  const set = new Set<string>();
  galerije.forEach((g) => {
    set.add(g.naslovnica);
    g.slike.forEach((s) => set.add(s.pot));
  });
  Object.values(bannerji).forEach((p) => set.add(p));
  [ostaleSlike.logo, ostaleSlike.oPodjetju, ostaleSlike.sofinanciranje, ostaleSlike.hollerLogo].forEach((p) => set.add(p));
  return [...set];
}
