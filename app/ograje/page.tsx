import type { Metadata } from 'next';
import IzdelekStran from '@/components/IzdelekStran';
import { bannerji } from '@/lib/galerije';
import { podjetje } from '@/lib/podjetje';

export const metadata: Metadata = {
  title: 'Aluminijaste ograje in dvoriščna vrata po meri',
  description:
    'Notranje in zunanje aluminijaste ograje za balkone, terase, stopnice in dvorišča ter drsna, samonosna in krilna dvoriščna vrata s pogonom. Prašno barvanje po RAL lestvici, montaža po vsej Sloveniji.',
  alternates: { canonical: '/ograje' },
};

export default function Ograje() {
  return (
    <IzdelekStran
      crka="A"
      naslov="Ograje in dvoriščna vrata"
      uvod="Notranje in zunanje ograje iz aluminija, inoxa ali vroče cinkanega jekla, po meri in v barvi po RAL lestvici. Z drsnimi, samonosnimi ali krilnimi vrati za dvorišče."
      banner={bannerji.ograje}
      bannerAlt="Aluminijasta dvoriščna ograja HIFA"
      konfigurator="/konfigurator?izdelek=ograja&tip=balkonska"
      izdelki={['Ograja', 'Dvoriščna vrata']}
      galerije={['zunanje-balkonske-ograje', 'zunanje-dvoriscne-ograje', 'notranje-ograje', 'zunanje-stopniscne-ograje']}
      vsebina={[
        {
          id: 'balkonske',
          naslov: 'Zunanje ograje',
          odstavki: [
            'Zunanje ograje so primerne za balkone, terase, dvorišča, stopnice in vrtove. Vsako izdelamo po naročilu, v izvedbi, ki jo izberete.',
            'Za odpornost na vreme poskrbi vroče cinkanje, prašno barvanje v katerikoli barvi po RAL lestvici ali kombinacija obojega. Vrsta zaščite je odvisna od kovine: črnega jekla, nerjavnega jekla ali aluminija.',
          ],
          legenda: [
            ['Materiali', 'aluminij, inox, črno jeklo'],
            ['Polnila', 'palice, letvice, steklo, žarki, perforirana pločevina'],
            ['Montaža', 'z vrha ali s strani plošče, na podzidek ali temelje'],
            ['Zaščita', 'vroče cinkanje, prašno barvanje po RAL'],
          ],
        },
        {
          id: 'notranje',
          naslov: 'Notranje ograje',
          odstavki: [
            'Notranje ograje iz aluminija prašno barvamo v barvi, ki jo izberete po RAL lestvici. Lahko jih kombiniramo z lesom, steklom ali drugimi materiali, da se ujemajo s prostorom.',
            'Svetujemo, kako ograjo oblikovati, da poleg estetskih in tehničnih zahtev ustreza tudi vsem varnostnim zahtevam, na primer pri višini in razmikih polnila.',
          ],
        },
        {
          id: 'dvoriscne',
          naslov: 'Dvoriščna vrata',
          odstavki: [
            'Vsaka dvoriščna ograja potrebuje vrata za vstop z avtomobilom ali peš. Izdelujemo drsna vrata, motorizirana drsna vrata na talnem vodilu, samonosna in krilna vrata različnih oblik in velikosti.',
            'Motorizirana vrata opremimo z varnostno fotocelico, daljinskim upravljalnikom in signalno lučjo, ki opozarja, da se vrata odpirajo ali zapirajo. Pogoni imajo evropski certifikat kakovosti.',
            <>Cena ograje in vrat je odvisna od materiala, terena in vaših zahtev. Za informativno ponudbo pošljite povpraševanje ali pokličite na <a href={podjetje.telefonHref}>{podjetje.telefon}</a>.</>,
          ],
          legenda: [
            ['Vrata', 'drsna, samonosna, krilna'],
            ['Osebni prehod', 'v enakem polnilu kot ograja'],
            ['Pogon', 'fotocelica, daljinec, signalna luč'],
          ],
        },
      ]}
    />
  );
}
