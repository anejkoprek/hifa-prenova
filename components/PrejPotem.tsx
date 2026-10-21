'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { galerija, prejPotemPari } from '@/lib/galerije';
import { slika } from '@/lib/slike';
import s from './PrejPotem.module.css';

const g = galerija('prej-potem')!;
const pot = (st: number) => slika(g.slike[st - 1].pot);

/** Drsnik prej / potem: črto vlečete čez fotografijo. */
export default function PrejPotem() {
  const [i, setI] = useState(0);
  const [poz, setPoz] = useState(50);
  const par = prejPotemPari[i];
  const trak = useRef<HTMLDivElement>(null);
  const prvic = useRef(true);
  const n = prejPotemPari.length;
  const izberi = (j: number) => {
    setI((j + n) % n);
    setPoz(50);
  };
  // izbrani projekt pomaknemo v vidni del traku (brez premika cele strani)
  useEffect(() => {
    if (prvic.current) {
      prvic.current = false;
      return;
    }
    const t = trak.current;
    const gumb = t?.children[i] as HTMLElement | undefined;
    if (!t || !gumb) return;
    const odmik = gumb.getBoundingClientRect().left - t.getBoundingClientRect().left;
    const cilj = t.scrollLeft + odmik - (t.clientWidth - gumb.offsetWidth) / 2;
    t.scrollTo({ left: cilj, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [i]);

  return (
    <div className={s.pp}>
      <div className={s.okno} style={{ ['--poz' as string]: `${poz}%` }}>
        <Image src={pot(par.prej)} alt={`Prej: ${par.naslov}`} fill sizes="(min-width: 1024px) 60vw, 100vw" className={s.img} />
        <Image src={pot(par.potem)} alt={`Potem: ${par.naslov}`} fill sizes="(min-width: 1024px) 60vw, 100vw" className={`${s.img} ${s.potem}`} />
        <span className={`napis ${s.oznaka} ${s.levo}`} aria-hidden>Prej</span>
        <span className={`napis ${s.oznaka} ${s.desno}`} aria-hidden>Potem</span>
        <span className={s.crta} aria-hidden>
          <span className={s.rocaj} />
        </span>
        <input
          className={s.range}
          type="range"
          min={0}
          max={100}
          value={poz}
          onChange={(e) => setPoz(+e.target.value)}
          aria-label={`Primerjava prej in potem: ${par.naslov}`}
          aria-valuetext={`${poz} % fotografije potem`}
        />
      </div>
      <div className={s.izbira}>
        <button type="button" className={s.puscica} onClick={() => izberi(i - 1)} aria-label="Prejšnji projekt">
          <CaretLeft size={18} weight="bold" aria-hidden />
        </button>
        <div className={s.pari} ref={trak} role="group" aria-label="Izberite projekt">
          {prejPotemPari.map((p, j) => (
            <button
              key={p.naslov}
              type="button"
              className={s.par}
              aria-pressed={i === j}
              onClick={() => izberi(j)}
            >
              <span className={s.slicica}>
                <Image src={pot(p.potem)} alt="" fill sizes="120px" />
              </span>
              <span>{p.naslov}</span>
            </button>
          ))}
        </div>
        <button type="button" className={s.puscica} onClick={() => izberi(i + 1)} aria-label="Naslednji projekt">
          <CaretRight size={18} weight="bold" aria-hidden />
        </button>
        <span className={s.stevec} aria-live="polite">
          {i + 1} / {n}
        </span>
      </div>
    </div>
  );
}
