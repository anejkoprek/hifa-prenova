// Osnovni podatki podjetja. Vse na enem mestu: telefon ali naslov se spremeni samo tukaj.
export const podjetje = {
  ime: 'HIFA d.o.o.',
  kratko: 'HIFA',
  od: 1990,
  telefon: '031 688 704',
  telefonHref: 'tel:+38631688704',
  email: 'info@hifa.si',
  ulica: 'Preglova ulica 3',
  kraj: 'Njiverce',
  posta: '2325',
  obcina: 'Kidričevo',
  delovniCas: 'pon–pet, 8.00–16.00',
  facebook: 'https://www.facebook.com/profile.php?id=100044144323649',
  // ocena na Google Zemljevidih (stanje 21. 10. 2026; ob objavi preveri in posodobi)
  google: {
    ocena: 5,
    stevilo: 14,
    url: 'https://www.google.com/maps/search/?api=1&query=Hifa%20Njiverce&query_place_id=ChIJl-VJQQ8tZUcRudP2WwR6ONQ',
  },
  mapsLink:
    'https://www.google.com/maps/search/?api=1&query=HIFA+d.o.o.+Preglova+ulica+3+2325+Kidri%C4%8Devo',
  mapsEmbed:
    'https://www.google.com/maps?q=Preglova+ulica+3,+2325+Kidri%C4%8Devo&z=14&output=embed',
  geo: { lat: 46.4057, lng: 15.7967 },
  url: 'https://www.hifa.si',
} as const;

export const naslovVrstica = `${podjetje.ulica}, ${podjetje.kraj}, ${podjetje.posta} ${podjetje.obcina}`;

export type Izdelek = {
  slug: string;
  href: string;
  naziv: string;
  kratko: string;
};

// Slugi so ohranjeni s stare strani (SEO).
export const izdelki: Izdelek[] = [
  { slug: 'ograje', href: '/ograje', naziv: 'Ograje in dvoriščna vrata', kratko: 'Ograje' },
  { slug: 'nadstreski', href: '/nadstreski', naziv: 'Nadstreški', kratko: 'Nadstreški' },
  { slug: 'stopnisca', href: '/stopnisca', naziv: 'Stopnišča', kratko: 'Stopnišča' },
  { slug: 'storitve', href: '/storitve', naziv: 'Kovinske konstrukcije', kratko: 'Konstrukcije' },
  { slug: 'holler-diy', href: '/holler-diy', naziv: 'Vrata in ograje Holler DIY', kratko: 'Holler DIY' },
];

/** Izdelki v spustnem meniju glave: kratek opis in fotografija */
export const izdelkiMeni = [
  { href: '/ograje', naziv: 'Ograje in vrata', opis: 'Balkonske, dvoriščne, notranje', slika: 'media/galleries/15/featured/zunanje-balkonske-ograje-hifa-23.jpg' },
  { href: '/nadstreski', naziv: 'Nadstreški', opis: 'Za avto, vhod in teraso', slika: 'media/35/nadstreski-hifa-09.jpg' },
  { href: '/stopnisca', naziv: 'Stopnišča', opis: 'Zunanja in notranja', slika: 'files/media/novi-vstop-stopnisca.jpg' },
  { href: '/storitve', naziv: 'Konstrukcije', opis: 'Nosilci, podesti, lokali', slika: 'media/357/ostalo-hifa-19.jpg' },
  { href: '/holler-diy', naziv: 'Holler DIY', opis: 'Avstrijska alu vrata', slika: 'media/galleries/22/featured/vrata-holler-thumb.jpg' },
];

export const navigacija = [
  { href: '/galerije', naziv: 'Galerija' },
  { href: '/o-nas', naziv: 'O nas' },
  { href: '/kontakt', naziv: 'Kontakt' },
];

export const mnenja = [
  {
    besedilo:
      'Zahvaljujem se vam za odlično izvedbo, mislim, da smo lepo »osvežili našo hišo«. Z alu ograjami in delom vas in vaših sodelavcev smo zelo zadovoljni. Z veseljem vas bomo priporočili tudi drugim.',
    ime: 'Bojana',
    tema: 'aluminijaste ograje',
  },
  {
    besedilo:
      'Pohvale fantoma, ki ne hitita, vendar ves čas delata, in to je pravi in najhitrejši način, da je končni rezultat tak, kot mora biti. In spoštljivo ravnata z orodjem.',
    ime: 'Igor',
    tema: 'montaža',
  },
  {
    besedilo: 'Kvalitetno in zanesljivo. Bilo je končano pred dogovorjenim rokom.',
    ime: 'Karol',
    tema: 'rok izvedbe',
  },
];

export const postopek = [
  {
    naslov: 'Povpraševanje',
    opis: 'Pošljete fotografijo obstoječega stanja, približne mere in kraj montaže. Prek obrazca, konfiguratorja ali po telefonu.',
  },
  {
    naslov: 'Informativna ponudba',
    opis: 'Iz vaših podatkov pripravimo okvirno ponudbo, da veste, s kakšnim zneskom lahko računate.',
  },
  {
    naslov: 'Ogled in izmera',
    opis: 'Ko ponudbo potrdite, pridemo na objekt, natančno izmerimo in svetujemo pri materialu, barvi in tehničnih podrobnostih.',
  },
  {
    naslov: 'Načrt in končna ponudba',
    opis: 'Pripravimo izris projekta in končno ponudbo. Brez presenečenj pri končni ceni.',
  },
  {
    naslov: 'Izdelava in montaža',
    opis: 'Izdelek naredimo v lastni delavnici, ga zaščitimo pred korozijo in ga pri vas montiramo v dogovorjenem roku.',
  },
];

export const pogostaVprasanja = [
  {
    v: 'Kako pošljem povpraševanje?',
    o: 'Najhitreje prek obrazca na strani Kontakt ali na koncu konfiguratorja, kjer lahko priložite fotografije. Lahko nam pišete na info@hifa.si ali pokličete na 031 688 704. Pomagajo nam fotografije obstoječega stanja ali načrt objekta, slika želenega izdelka, približne mere in kraj montaže.',
  },
  {
    v: 'Kako poteka pridobitev ponudbe?',
    o: 'Iz podatkov, ki nam jih pošljete, izdelamo informativno ponudbo. Ko jo potrdite, pridemo na objekt, si ogledamo dejansko stanje, opravimo natančne meritve in svetujemo pri izbiri materialov, barv in tehničnih podrobnosti. Na tej podlagi pripravimo končno ponudbo in izris projekta.',
  },
  {
    v: 'Ali pridete na ogled in izmero?',
    o: 'Da. Po potrjeni informativni ponudbi pridemo na objekt, natančno izmerimo in svetujemo na mestu samem.',
  },
  {
    v: 'Katere materiale uporabljate?',
    o: 'Nerjavno jeklo (inox), črno jeklo in aluminij preverjenih proizvajalcev. Izbira je odvisna od namena in nosilnosti izdelka ter vaših želja. Zunanje ograje izdelujemo iz aluminija ali inoxa, ki ju prašno barvamo v katerikoli barvi po RAL lestvici. Zunanje konstrukcije iz črnega jekla vroče cinkamo in prašno barvamo.',
  },
  {
    v: 'Kakšne kritine so na voljo za nadstreške?',
    o: 'Kaljeno steklo, polikarbonat, sendvič panel (pri enokapnicah) in folija Sikaplan (pri boxu z ravno streho). Svetujemo glede na namen nadstreška in vaše želje.',
  },
  {
    v: 'Koliko stane meter ograje ali kvadratni meter nadstreška?',
    o: 'Vsak izdelek naredimo po meri, zato je cena odvisna od materiala, polnila, mer, terena in načina montaže. Pošljite nam povpraševanje in pripravili bomo informativno ponudbo.',
  },
  {
    v: 'Kje delujete?',
    o: 'Po vsej Sloveniji. Naše stranke so fizične in pravne osebe.',
  },
];
