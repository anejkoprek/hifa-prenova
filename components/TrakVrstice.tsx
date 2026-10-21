import Link from 'next/link';
import Foto from './Foto';
import s from './Sekcije.module.css';

type Slika = { pot: string; alt: string; pokoncna: boolean };

/** Dve vrstici fotografij, ki tečeta v nasprotni smeri. Ustavita se ob prehodu z miško ali fokusu. */
export default function TrakVrstice({ vrstice }: { vrstice: Slika[][] }) {
  return (
    <div className="wrap">
      <div className={s.tekoci}>
        {vrstice.map((vrsta, v) => (
          <div key={v} className={s.vrsta} data-smer={v % 2 ? 'desno' : 'levo'} style={{ '--trajanje': `${vrsta.length * 7}s` } as React.CSSProperties}>
            {[0, 1].map((kopija) => (
              <ul key={kopija} className={s.vrstaNiz} aria-hidden={kopija === 1 || undefined}>
                {vrsta.map((t) => (
                  <li key={t.pot} data-pokoncna={t.pokoncna || undefined}>
                    <Link href="/galerije" tabIndex={kopija === 1 ? -1 : undefined} aria-label={kopija === 1 ? undefined : `${t.alt} – odpri galerijo`}>
                      <Foto pot={t.pot} alt={kopija === 1 ? '' : t.alt} sizes="(min-width: 1024px) 320px, 220px" okvir={false} style={{ height: '100%' }} />
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
