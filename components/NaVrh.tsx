'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import s from './NaVrh.module.css';

/** Gumb »na vrh«: pokaže se, ko je obiskovalec odšel dlje od dveh zaslonov navzdol. */
export default function NaVrh() {
  const [vidno, setVidno] = useState(false);
  useEffect(() => {
    let caka = false;
    const preveri = () => {
      caka = false;
      setVidno(window.scrollY > window.innerHeight * 1.8);
    };
    const ob = () => {
      if (caka) return;
      caka = true;
      requestAnimationFrame(preveri);
    };
    preveri();
    window.addEventListener('scroll', ob, { passive: true });
    window.addEventListener('resize', ob, { passive: true });
    return () => {
      window.removeEventListener('scroll', ob);
      window.removeEventListener('resize', ob);
    };
  }, []);
  return (
    <button
      type="button"
      className={s.gumb}
      data-vidno={vidno || undefined}
      tabIndex={vidno ? 0 : -1}
      aria-hidden={!vidno}
      aria-label="Na vrh strani"
      onClick={() => {
        const mirno = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: mirno ? 'auto' : 'smooth' });
        // fokus nazaj na začetek strani za tipkovnico in bralnike zaslona
        document.querySelector<HTMLElement>('.preskok')?.focus({ preventScroll: true });
      }}
    >
      <ArrowUp size={20} weight="bold" aria-hidden />
    </button>
  );
}
