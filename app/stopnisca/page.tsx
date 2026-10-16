import type { Metadata } from 'next';
import IzdelekStran from '@/components/IzdelekStran';
import { bannerji } from '@/lib/galerije';

export const metadata: Metadata = {
  title: 'Kovinska stopnišča in stopniščne ograje',
  description:
    'Zunanja in notranja kovinska stopnišča ter stopniščne ograje iz inoxa ali vroče cinkanega jekla, v kombinaciji z lesom ali steklom. Izdelava in montaža po meri.',
  alternates: { canonical: '/stopnisca' },
};

export default function Stopnisca() {
  return (
    <IzdelekStran
      crka="C"
      naslov="Stopnišča in stopniščne ograje"
      uvod="Kovinska stopnišča za zunanjo in notranjo namestitev, iz preverjenih materialov. Z ograjo in ročajem, ki ju prilagodimo prostoru."
      banner={bannerji.stopnisca}
      bannerAlt="Kovinsko stopnišče HIFA z lesenimi stopnicami"
      konfigurator="/konfigurator?izdelek=ograja&tip=stopniscna-notranja"
      izdelki={['Stopnišče', 'Ograja']}
      galerije={['stopnisca', 'zunanje-stopniscne-ograje', 'notranje-ograje']}
      vsebina={[
        {
          naslov: 'Konstrukcija',
          odstavki: [
            'Kovinsko konstrukcijo stopnišča izdelamo iz nerjavnega jekla ali drugih kovin višjega kakovostnega razreda in jo po potrebi zaščitimo pred korozijo z vročim cinkanjem, prašnim barvanjem ali kombinacijo obojega.',
          ],
          legenda: [
            ['Uporaba', 'zunanja in notranja'],
            ['Materiali', 'inox, vroče cinkano jeklo'],
            ['Stopnice', 'kovinske, lesene ali kamnite'],
          ],
        },
        {
          naslov: 'Ograja in ročaj',
          odstavki: [
            'Stopnišče lahko dopolnimo z različnimi kombinacijami naravnih in umetnih materialov, predvsem pri polnilih ograje in ročajih. Zelo priljubljen je les.',
            'Tako vsako stopnišče postane varno, udobno in lepo, ne glede na to, ali je v hiši ali ob njej.',
          ],
        },
      ]}
    />
  );
}
