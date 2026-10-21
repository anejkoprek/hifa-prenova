'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, X } from '@phosphor-icons/react';
import { kategorije, vseSlike, type KategorijaId } from '@/lib/galerije';
import { slika } from '@/lib/slike';
import s from './IzbiraGalerije.module.css';

const VSE = vseSlike().filter((x) => x.kategorija !== 'prej-potem');
const KORAK = 48;

/** Okno z našo galerijo, iz katere obiskovalec izbere fotografije izdelkov, ki so mu všeč (največ `najvec`). */
export default function IzbiraGalerije({
  odprto,
  izbrane,
  najvec,
  potrdi,
  zapri,
}: {
  odprto: boolean;
  izbrane: string[];
  najvec: number;
  potrdi: (poti: string[]) => void;
  zapri: () => void;
}) {
  const okno = useRef<HTMLDialogElement>(null);
  const [kat, setKat] = useState<'vse' | KategorijaId>('vse');
  const [stevilo, setStevilo] = useState(KORAK);
  const [izbor, setIzbor] = useState<string[]>(izbrane);

  useEffect(() => {
    const d = okno.current;
    if (!d) return;
    if (odprto && !d.open) {
      setIzbor(izbrane);
      d.showModal();
    } else if (!odprto && d.open) d.close();
  }, [odprto, izbrane]);

  const seznam = useMemo(() => (kat === 'vse' ? VSE : VSE.filter((x) => x.kategorija === kat)), [kat]);
  const vidne = seznam.slice(0, stevilo);
  const poln = izbor.length >= najvec;
  const konec = useRef<HTMLDivElement>(null);
  const imaVec = seznam.length > stevilo;

  // samodejno nalaganje: ko se obiskovalec pomakne do konca mreže, dodamo naslednje fotografije
  useEffect(() => {
    const el = konec.current;
    if (!el || !odprto || !imaVec) return;
    const io = new IntersectionObserver(
      (v) => {
        if (v.some((x) => x.isIntersecting)) setStevilo((n) => n + KORAK);
      },
      { root: okno.current, rootMargin: '0px 0px 600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [odprto, imaVec, stevilo]);

  const preklopi = (pot: string) =>
    setIzbor((x) => (x.includes(pot) ? x.filter((y) => y !== pot) : x.length >= najvec ? x : [...x, pot]));

  return (
    <dialog ref={okno} className={s.okno} onClose={zapri} onCancel={zapri} aria-labelledby="izbira-galerije-h">
      <div className={s.glava}>
        <div>
          <h2 className="h3" id="izbira-galerije-h">Izberite iz naše galerije</h2>
          <p className="small muted">Označite do {najvec} fotografij izdelkov, ki so vam všeč. Dodamo jih k povpraševanju kot primer.</p>
        </div>
        <button type="button" className={s.zapri} onClick={zapri} aria-label="Zapri">
          <X size={20} weight="bold" aria-hidden />
        </button>
      </div>

      <div className={`cipi ${s.filtri}`} role="group" aria-label="Kategorija">
        {kategorije
          .filter((k) => k.id !== 'prej-potem')
          .map((k) => (
            <button
              key={k.id}
              type="button"
              className="cip"
              aria-pressed={kat === k.id}
              onClick={() => {
                setKat(k.id);
                setStevilo(KORAK);
              }}
            >
              {k.naziv}
            </button>
          ))}
      </div>

      <ul className={s.mreza}>
        {vidne.map((x) => {
          const izbrana = izbor.includes(x.pot);
          return (
            <li key={x.pot}>
              <button
                type="button"
                className={s.plosca}
                aria-pressed={izbrana}
                disabled={!izbrana && poln}
                onClick={() => preklopi(x.pot)}
                aria-label={`${izbrana ? 'Odstrani' : 'Izberi'}: ${x.alt}`}
              >
                <Image src={slika(x.pot)} alt="" fill sizes="(min-width: 900px) 180px, 45vw" className={s.img} />
                <span className={s.kljukica} aria-hidden>
                  <Check size={14} weight="bold" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div ref={konec} className={s.konec} aria-hidden />

      <div className={s.noga}>
        <p className="small" aria-live="polite">
          Izbrano: <strong>{izbor.length}</strong> / {najvec}
        </p>
        <div className={s.gumbi}>
          <button type="button" className="gumb gumb--obroba" onClick={zapri}>
            Prekliči
          </button>
          <button
            type="button"
            className="gumb gumb--zelen"
            onClick={() => {
              potrdi(izbor);
              zapri();
            }}
          >
            Dodaj k povpraševanju
          </button>
        </div>
      </div>
    </dialog>
  );
}
