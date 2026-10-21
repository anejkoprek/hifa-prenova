import type { Metadata } from 'next';
import IzdelekStran from '@/components/IzdelekStran';
import { bannerji } from '@/lib/galerije';

export const metadata: Metadata = {
  title: 'Nadstreški po meri za avto, vhod in teraso',
  description:
    'Kovinski in inox nadstreški HIFA po meri: za avtomobile, vhode, terase in balkone. Kritina iz kaljenega stekla, polikarbonata, trapezne pločevine ali folije, vroče cinkano in prašno barvano.',
  alternates: { canonical: '/nadstreski' },
};

export default function Nadstreski() {
  return (
    <IzdelekStran
      crka="B"
      naslov="Nadstreški"
      uvod="Nadstreški za vozila, vhode, terase, stopnišča in balkone, izdelani po meri. Stabilna in nosilna konstrukcija z zaščito pred korozijo za dolgo življenjsko dobo."
      banner={bannerji.nadstreski}
      bannerAlt="Nadstrešek HIFA ob hiši"
      konfigurator="/konfigurator?izdelek=nadstresek"
      izdelki={['Nadstrešek']}
      galerije={['nadstreski']}
      vsebina={[
        {
          naslov: 'Material in barva',
          odstavki: [
            'Nadstreške najpogosteje izdelamo iz nerjavnega jekla, aluminija ali črnega jekla, ki ga zaščitimo z vročim cinkanjem, prašnim barvanjem v poljubni RAL barvi ali obojim.',
            'Kovino lahko kombiniramo z naravnimi ali umetnimi materiali, ki imajo funkcijski ali estetski namen, na primer z lesom na stropu. Stranske stene izdelamo iz fiksnih ali mehanskih lamel.',
          ],
          legenda: [
            ['Oblike', 'box (ravna streha), enokapnica'],
            ['Materiali', 'inox, aluminij, vroče cinkano jeklo'],
            ['Barva', 'katerakoli po RAL lestvici'],
          ],
        },
        {
          naslov: 'Kritina',
          odstavki: [
            'Kritino izberemo skupaj glede na namen nadstreška: koliko svetlobe želite pod njim, kakšne obremenitve s snegom pričakujemo in kako naj se ujema s hišo.',
          ],
          legenda: [
            ['Kaljeno steklo', 'največ svetlobe, eleganten videz'],
            ['Polikarbonat', 'lahek in cenovno ugoden'],
            ['Sendvič panel', 'izoliran, brez kapljanja; pri enokapnicah'],
            ['Folija Sikaplan', 'vodotesna membrana za box z ravno streho'],
          ],
        },
        {
          naslov: 'Postavitev',
          odstavki: [
            'Nadstrešek lahko pritrdimo na objekt ali ga postavimo kot samostojen kovinski nadstrešek na dvorišču ali vrtu. Po želji ga delno zapremo s strani, za boljšo zaščito pred vetrom in dežjem.',
            'Svetujemo pri izbiri materialov in postavitvi, na podlagi dolgoletnih izkušenj s podobnimi objekti.',
          ],
        },
      ]}
    />
  );
}
