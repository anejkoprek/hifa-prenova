import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/ssr';
import Foto from '@/components/Foto';
import { GlavaPodstrani, SekcijaPovprasevanje } from '@/components/Sekcije';
import { bannerji, galerija } from '@/lib/galerije';
import s from './proizvodi.module.css';

export const metadata: Metadata = {
  title: 'Izdelki: ograje, nadstreški, stopnišča in kovinske konstrukcije',
  description:
    'Zunanje in notranje ograje, dvoriščna vrata, nadstreški, stopnišča in kovinske konstrukcije po meri iz aluminija, inoxa in jekla. Načrtovano in izdelano v lastni delavnici.',
  alternates: { canonical: '/proizvodi' },
};

const seznam = [
  { href: '/ograje', naziv: 'Ograje in dvoriščna vrata', opis: 'Balkonske, dvoriščne, stopniščne in notranje ograje ter drsna, samonosna in krilna vrata.', slika: bannerji.ograje, g: 'zunanje-balkonske-ograje' },
  { href: '/nadstreski', naziv: 'Nadstreški', opis: 'Za avto, vhod, teraso ali balkon, s steklom, polikarbonatom ali pločevino.', slika: bannerji.nadstreski, g: 'nadstreski' },
  { href: '/stopnisca', naziv: 'Stopnišča', opis: 'Zunanja in notranja kovinska stopnišča, tudi z lesenimi stopnicami.', slika: bannerji.stopnisca, g: 'stopnisca' },
  { href: '/storitve', naziv: 'Kovinske konstrukcije', opis: 'Nosilci, podesti, pohištvo, oprema lokalov in montaža tujih izdelkov.', slika: bannerji.konstrukcije, g: 'ostalo' },
  { href: '/holler-diy', naziv: 'Vrata in ograje Holler DIY', opis: 'Avstrijska aluminijasta vrata s pogonom v stebru.', slika: bannerji.holler, g: 'holler-diy' },
];

export default function Proizvodi() {
  return (
    <>
      <GlavaPodstrani
        naslov="Izdelki po meri"
        uvod="Ograje, nadstreške, stopnišča in konstrukcije skrbno načrtujemo, izdelamo v lastni delavnici, zaščitimo pred korozijo pri preverjenih partnerjih in strokovno montiramo na vašem objektu."
      />
      <div className={`wrap ${s.seznam}`}>
        {seznam.map((x, i) => (
          <Link key={x.href} href={x.href} className={s.vrstica} data-prva={i === 0 || undefined}>
            <span className={s.slika}>
              <Foto pot={x.slika} alt="" sizes="(min-width: 900px) 50vw, 100vw" okvir={false} style={{ height: '100%' }} />
            </span>
            <span className={s.besedilo}>
              <span className="h3">{x.naziv}</span>
              <span className="muted">{x.opis}</span>
              <span className="small">{galerija(x.g)!.slike.length} fotografij izvedenih del</span>
              <span className={s.puscica} aria-hidden><ArrowRight size={22} weight="bold" /></span>
            </span>
          </Link>
        ))}
      </div>
      <SekcijaPovprasevanje />
    </>
  );
}
