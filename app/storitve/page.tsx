import type { Metadata } from 'next';
import IzdelekStran from '@/components/IzdelekStran';
import { bannerji } from '@/lib/galerije';

export const metadata: Metadata = {
  title: 'Kovinske konstrukcije po meri, varjenje in montaža',
  description:
    'Izdelava in montaža kovinskih konstrukcij po meri: nosilci, podesti, pohištvo, oprema lokalov. Montiramo tudi konstrukcije, vrata, stopnišča in ograje, ki niso kupljene pri nas.',
  alternates: { canonical: '/storitve' },
};

export default function Konstrukcije() {
  return (
    <IzdelekStran
      naslov="Kovinske konstrukcije"
      uvod="Izdelamo in montiramo kovinske konstrukcije po vaših željah in potrebah, z enako nosilnostjo in obstojnostjo kot naše ograje in nadstreški."
      banner={bannerji.konstrukcije}
      bannerAlt="Kovinska konstrukcija HIFA"
      izdelki={['Konstrukcija']}
      galerije={['ostalo']}
      vsebina={[
        {
          naslov: 'Po meri in namenu',
          odstavki: [
            'Kakovostne kovinske materiale obdelujemo na različne načine, konstrukcije pa izdelamo povsem po merah in potrebah naročnika. Delavnico smo opremili z robotsko varilno celico in laserskim varilnim aparatom.',
            'Po dogovoru montiramo tudi konstrukcije, dvoriščna vrata, stopnišča in ograje, ki niso bili kupljeni pri nas.',
          ],
          legenda: [
            ['Primeri', 'nosilci, podesti, pohištvo, oprema lokalov'],
            ['Storitve', 'izdelava, varjenje, montaža, vzdrževanje'],
            ['Stranke', 'fizične in pravne osebe'],
          ],
        },
      ]}
    />
  );
}
