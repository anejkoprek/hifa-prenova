'use client';

import { useEffect, useRef, useState } from 'react';

/** Število, ki se ob prvem prikazu prešteje do končne vrednosti (enkrat, brez zmanjšanega gibanja takoj). */
export default function Stevec({ do: koncno, trajanje = 1100 }: { do: number; trajanje?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(koncno);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const korak = (t: number) => {
        const k = Math.min(1, (t - t0) / trajanje);
        setV(Math.round(koncno * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(korak);
      };
      setV(0);
      raf = requestAnimationFrame(korak);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [koncno, trajanje]);
  return <span ref={ref}>{v}</span>;
}
