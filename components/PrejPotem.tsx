'use client';

import Image from 'next/image';
import { useState } from 'react';
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
      <div className={s.pari} role="group" aria-label="Izberite projekt">
        {prejPotemPari.map((p, j) => (
          <button
            key={p.naslov}
            type="button"
            className={s.par}
            aria-pressed={i === j}
            onClick={() => {
              setI(j);
              setPoz(50);
            }}
          >
            <span className={s.slicica}>
              <Image src={pot(p.potem)} alt="" fill sizes="120px" />
            </span>
            <span>{p.naslov}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
