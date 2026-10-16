'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { MagnifyingGlassPlus } from '@phosphor-icons/react';
import { kategorije, type KategorijaId, type SlikaZ } from '@/lib/galerije';
import { slika } from '@/lib/slike';
import s from './Galerija.module.css';

const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

type Props = {
  slike: SlikaZ[];
  /** Pokaži filtre po kategorijah. */
  filtri?: boolean;
  /** Koliko fotografij pokažemo pred gumbom "Pokaži več". */
  zacetno?: number;
};

export default function Galerija({ slike, filtri = false, zacetno = 27 }: Props) {
  const [kat, setKat] = useState<'vse' | KategorijaId>('vse');
  const [stevilo, setStevilo] = useState(zacetno);
  const [odprta, setOdprta] = useState(-1);

  const izbrane = useMemo(() => (kat === 'vse' ? slike : slike.filter((x) => x.kategorija === kat)), [slike, kat]);
  const vidne = izbrane.slice(0, stevilo);
  const steje = useMemo(() => {
    const m: Record<string, number> = { vse: slike.length };
    slike.forEach((x) => (m[x.kategorija] = (m[x.kategorija] ?? 0) + 1));
    return m;
  }, [slike]);

  return (
    <div className={s.galerija}>
      {filtri ? (
        <div className={`cipi ${s.filtri}`} role="group" aria-label="Filtriraj po vrsti izdelka">
          {kategorije
            .filter((k) => steje[k.id])
            .map((k) => (
              <button
                key={k.id}
                type="button"
                className="cip"
                aria-pressed={kat === k.id}
                onClick={() => {
                  setKat(k.id);
                  setStevilo(zacetno);
                }}
              >
                {k.naziv} <span className={s.stevec}>{steje[k.id]}</span>
              </button>
            ))}
        </div>
      ) : null}

      <ul className={s.mreza}>
        {vidne.map((x, i) => (
          <li key={x.pot} className={s.plosca} data-velika={i % 9 === 0 || undefined}>
            <button type="button" className={s.gumb} onClick={() => setOdprta(i)} aria-label={`Povečaj: ${x.alt}`}>
              <Image src={slika(x.pot)} alt={x.alt} fill sizes={i % 9 === 0 ? '(min-width: 1000px) 50vw, 100vw' : '(min-width: 1000px) 25vw, 50vw'} className={s.img} />
              <span className={s.lupa} aria-hidden>
                <MagnifyingGlassPlus size={20} weight="bold" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {izbrane.length > stevilo ? (
        <div className={s.vec}>
          <button type="button" className="gumb gumb--obroba" onClick={() => setStevilo((n) => n + 27)}>
            Pokaži več fotografij <span className="muted">({izbrane.length - stevilo})</span>
          </button>
        </div>
      ) : null}

      {odprta >= 0 ? <Lightbox slike={izbrane} indeks={odprta} zapri={() => setOdprta(-1)} /> : null}
    </div>
  );
}
