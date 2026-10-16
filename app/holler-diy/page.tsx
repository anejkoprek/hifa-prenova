import type { Metadata } from 'next';
import { FilePdf, ArrowSquareOut } from '@phosphor-icons/react/ssr';
import IzdelekStran from '@/components/IzdelekStran';
import { bannerji, ostaleSlike } from '@/lib/galerije';
import s from './holler.module.css';

export const metadata: Metadata = {
  title: 'Aluminijasta vrata in ograje Holler DIY',
  description:
    'Holler DIY: dvoriščna samonosna drsna vrata do 6 m, eno- ali dvokrilna vrata do 4,34 m, osebni prehodi in ograje iz aluminija. Pogon v stebru, CE EN 13241-1. Svetovanje, izmera in montaža HIFA.',
  alternates: { canonical: '/holler-diy' },
};

const katalog =
  process.env.NEXT_PUBLIC_SLIKE === 'lokalno' ? '/files/holler-diy-katalog.pdf' : `https://www.hifa.si/${ostaleSlike.hollerKatalog}`;

const mere = [
  ['Samonosna drsna vrata', 'do 6 m širine in 2 m višine'],
  ['Eno- ali dvokrilna vrata', 'do 4,34 m širine in 2 m višine'],
  ['Osebni prehodi', 'v enakem polnilu kot vrata'],
  ['Ograje', 'navpične palice, vodoravne letvice, pločevina'],
];

export default function Holler() {
  return (
    <IzdelekStran
      naslov="Vrata in ograje Holler DIY"
      uvod="Kakovosten sistem aluminijastih in jeklenih vrat ter ograj avstrijskega proizvajalca Holler, za hišo ali poslovni prostor. Svetujemo, izmerimo in montiramo."
      banner={bannerji.holler}
      bannerAlt="Aluminijasta drsna vrata Holler DIY"
      izdelki={['Holler DIY', 'Dvoriščna vrata']}
      galerije={['holler-diy']}
      vsebina={[
        {
          naslov: 'Sistem',
          odstavki: [
            'Pri polnilih vrat in ograj izbirate med navpičnimi palicami, vodoravnimi letvicami ter popolnoma neprosojno pločevino ali pločevino s trakom perforacije, če želite več zasebnosti. Polnila so iz aluminija ali jeklene pločevine, odvisno od motiva.',
            'Vsi okvirji vrat so iz aluminija in so trikrat lažji od železnih. To pomeni manjšo obremenitev pogona in daljšo življenjsko dobo motorja.',
            'Standardne barve polnil so antracit, srebrna in zelena, za doplačilo so na voljo tudi druge barve po RAL lestvici.',
          ],
          legenda: mere as [string, string][],
        },
        {
          naslov: 'Prednosti',
          odstavki: [
            'Pogoni so vgrajeni v steber, zato jih ni videti in so bolje zaščiteni pred umazanijo in vremenom. Aluminijasta vrata in ograje ne rjavijo. Razmerje med kakovostjo in ceno je odlično, vrata imajo avstrijsko kakovost in certifikat CE EN 13241-1.',
            'HIFA vam nudi celotno storitev, od svetovanja do izmere in montaže sistema Holler DIY.',
          ],
        },
        {
          naslov: 'O proizvajalcu',
          odstavki: [
            'Holler je avstrijsko podjetje in največji proizvajalec aluminijastih dvoriščnih vrat v Evropi. Izdeluje tudi samonosna vrata do širine 25 m in letno proizvede več kot 7000 drsnih samonosnih vrat za industrijo in dom, pod blagovnimi znamkami Holler Pro, Holler Home in Holler DIY.',
          ],
        },
      ]}
      dodatek={
        <div className={s.povezave}>
          <a className="gumb gumb--obroba" href={katalog} target="_blank" rel="noopener">
            <FilePdf size={20} aria-hidden /> Katalog Holler DIY (PDF)
          </a>
          <a className="povezava" href="https://www.holler-tore.at/sl/" target="_blank" rel="noopener noreferrer">
            Spletna stran proizvajalca <ArrowSquareOut size={16} aria-hidden />
          </a>
        </div>
      }
    />
  );
}
