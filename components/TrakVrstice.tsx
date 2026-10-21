'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pause, Play } from '@phosphor-icons/react';
import Foto from './Foto';
import s from './Sekcije.module.css';

type Slika = { pot: string; alt: string; pokoncna: boolean };

/** Dve vrstici fotografij, ki tečeta v nasprotni smeri. Ustavita se ob prehodu z miško, fokusu ali s gumbom. */
export default function TrakVrstice({ vrstice }: { vrstice: Slika[][] }) {
  const [ustavljeno, setUstavljeno] = useState(false);
  return (
    <div className={s.tekoci} data-ustavljeno={ustavljeno || undefined}>
      <button
        type="button"
        className={s.trakGumb}
        onClick={() => setUstavljeno((u) => !u)}
        aria-pressed={ustavljeno}
        aria-label={ustavljeno ? 'Zaženi premikanje fotografij' : 'Ustavi premikanje fotografij'}
      >
        {ustavljeno ? <Play size={14} weight="fill" aria-hidden /> : <Pause size={14} weight="fill" aria-hidden />}
      </button>
      {vrstice.map((vrsta, v) => (
        <div key={v} className={s.vrsta} data-smer={v % 2 ? 'desno' : 'levo'} style={{ '--trajanje': `${vrsta.length * 7}s` } as React.CSSProperties}>
          {[0, 1].map((kopija) => (
            <ul key={kopija} className={s.vrstaNiz} aria-hidden={kopija === 1 || undefined}>
              {vrsta.map((t) => (
                <li key={t.pot} data-pokoncna={t.pokoncna || undefined}>
                  <Link href="/galerije" tabIndex={kopija === 1 ? -1 : undefined} aria-label={kopija === 1 ? undefined : `${t.alt} – odpri galerijo`}>
                    <Foto pot={t.pot} alt={kopija === 1 ? '' : t.alt} sizes="(min-width: 1024px) 380px, 260px" okvir={false} style={{ height: '100%' }} />
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      ))}
    </div>
  );
}
