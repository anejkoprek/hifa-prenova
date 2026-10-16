import type { Metadata } from 'next';
import Link from 'next/link';
import Foto from '@/components/Foto';
import Galerija from '@/components/Galerija';
import { GlavaPodstrani, SekcijaPovprasevanje } from '@/components/Sekcije';
import { galerije, steviloSlik, vseSlike } from '@/lib/galerije';
import s from './galerije.module.css';

export const metadata: Metadata = {
  title: 'Galerija izvedenih del: ograje, nadstreški, stopnišča',
  description: `${steviloSlik} fotografij ograj, dvoriščnih vrat, nadstreškov, stopnišč in konstrukcij, ki smo jih izdelali in montirali po Sloveniji.`,
  alternates: { canonical: '/galerije' },
};

export default function Galerije() {
  return (
    <>
      <GlavaPodstrani
        naslov="Galerija izvedenih del"
        uvod={`${steviloSlik} fotografij ograj, vrat, nadstreškov, stopnišč in konstrukcij, ki smo jih izdelali v naši delavnici in montirali pri strankah.`}
      />
      <div className="wrap">
        <ul className={s.zbirke}>
          {galerije.map((g) => (
            <li key={g.slug}>
              <Link href={`/galerije/${g.slug}`} className={s.zbirka}>
                <span className={s.zbirkaSlika}>
                  <Foto pot={g.naslovnica} alt="" sizes="(min-width: 1100px) 15vw, 40vw" okvir={false} style={{ height: '100%' }} />
                </span>
                <span className={s.zbirkaIme}>{g.naziv}</span>
                <span className="small muted">{g.slike.length} fotografij</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <section className="sekcija" aria-label="Vse fotografije">
        <div className="wrap">
          <Galerija slike={vseSlike()} filtri zacetno={27} />
        </div>
      </section>
      <SekcijaPovprasevanje naslov="Vam je kaj od tega všeč?" uvod="Pošljite fotografijo obstoječega stanja in povezavo ali opis izdelka, ki vam je všeč. Pripravili bomo informativno ponudbo." />
    </>
  );
}
