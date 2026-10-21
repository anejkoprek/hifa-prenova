'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getImageProps } from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, Images } from '@phosphor-icons/react';
import { bannerji, izGalerije } from '@/lib/galerije';
import { slika } from '@/lib/slike';
import s from './Uvodnik.module.css';

// Fotografije v uvodniku. Ko HIFA pošlje nove fotografije v visoki ločljivosti (vsaj 2000 px), jih dodamo sem.
// Na računalniku široke fotografije (2000 px), na telefonu fotografije 4 : 3 iz galerije, ki se v pokončnem zaslonu ne razvlečejo.
const SLIKE = [
  { pot: bannerji.ograje, mob: izGalerije('zunanje-dvoriscne-ograje', 29), naziv: 'Dvoriščne ograje', alt: 'Dvoriščna ograja z drsnimi vrati ob kamnitem zidu', poz: '58% 50%' },
  { pot: bannerji.nadstreski, mob: izGalerije('nadstreski', 9), naziv: 'Nadstreški', alt: 'Nadstrešek nad vhodom v hišo', poz: '50% 55%' },
  { pot: bannerji.holler, mob: 'media/442/precne-vodoravne-alu-letve-110-mm-antracit.jpg', naziv: 'Holler DIY ograje', alt: 'Ograja z vodoravnimi letvami in drsnimi vrati', poz: '62% 50%' },
  { pot: bannerji.stopnisca, mob: izGalerije('stopnisca', 13), naziv: 'Stopnišča', alt: 'Kovinsko stopnišče z lesenimi stopnicami', poz: '62% 40%' },
];

function Slika({ x, prva }: { x: (typeof SLIKE)[number]; prva: boolean }) {
  const skupno = { alt: x.alt, quality: 80, priority: prva };
  const { props: { srcSet: namizje } } = getImageProps({ ...skupno, src: slika(x.pot), width: 2000, height: 626, sizes: '100vw' });
  const { props: { srcSet: mobilno, ...ostalo } } = getImageProps({ ...skupno, src: slika(x.mob), width: 800, height: 600, sizes: '100vw' });
  return (
    <picture>
      <source media="(min-width: 761px)" srcSet={namizje} />
      <source media="(max-width: 760px)" srcSet={mobilno} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...ostalo} className={s.img} style={{ objectPosition: x.poz }} loading={prva ? 'eager' : 'lazy'} fetchPriority={prva ? 'high' : 'auto'} />
    </picture>
  );
}
const TRAJANJE = 6500;

/** Uvodnik naslovne strani: fotografije izvedenih del se nežno menjavajo, napis ostane. */
export default function Uvodnik() {
  const [i, setI] = useState(0);
  const [ustavljeno, setUstavljeno] = useState(false);
  const [gibanje, setGibanje] = useState(true);
  const odsek = useRef<HTMLElement>(null);

  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nastavi = () => setGibanje(!m.matches);
    nastavi();
    m.addEventListener('change', nastavi);
    return () => m.removeEventListener('change', nastavi);
  }, []);

  // ne menjaj, ko uvodnik ni na zaslonu ali je zavihek skrit
  const [viden, setViden] = useState(true);
  useEffect(() => {
    const el = odsek.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setViden(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    const vid = () => setViden(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', vid);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', vid);
    };
  }, []);

  const tece = gibanje && !ustavljeno && viden;
  useEffect(() => {
    if (!tece) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % SLIKE.length), TRAJANJE);
    return () => window.clearTimeout(t);
  }, [i, tece]);

  const izberi = useCallback((n: number) => setI(n), []);

  return (
    <section
      ref={odsek}
      className={s.uvodnik}
      aria-labelledby="uvod-naslov"
      aria-roledescription="predstavitev"
      data-tece={tece || undefined}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setUstavljeno(true)}
      onPointerLeave={() => setUstavljeno(false)}
      onFocus={() => setUstavljeno(true)}
      onBlur={() => setUstavljeno(false)}
    >
      <div className={s.slike} aria-live="off">
        {SLIKE.map((x, n) => (
          <div key={x.pot} className={s.slika} data-aktivna={n === i || undefined} aria-hidden={n !== i}>
            <Slika x={x} prva={n === 0} />
          </div>
        ))}
        <div className={s.senca} aria-hidden />
      </div>

      <div className={`wrap ${s.vsebina}`}>
        <p className={s.nadnapis}>Z vami od leta 1990</p>
        <h1 id="uvod-naslov" className={`display ${s.naslov}`}>
          Ograje, nadstreški in stopnišča po meri
        </h1>
        <p className={s.lead}>
          Izdelamo jih v lastni delavnici v Njivercah pri Kidričevem in montiramo po vsej Sloveniji.
        </p>
        <div className={s.akcije}>
          <Link className="gumb gumb--zelen" href="/konfigurator">
            Oblikujte svojo ograjo <ArrowRight size={18} weight="bold" className="puscica" aria-hidden />
          </Link>
          <Link className={`gumb ${s.gumbSteklo}`} href="/galerije">
            <Images size={18} weight="bold" aria-hidden /> Galerija izdelkov
          </Link>
        </div>
      </div>

      <div className={`wrap ${s.dno}`}>
        <div className={s.kazalci} role="group" aria-label="Fotografije">
          {SLIKE.map((x, n) => (
            <button
              key={x.pot}
              type="button"
              className={s.kazalec}
              aria-pressed={n === i}
              aria-label={`${n + 1}. fotografija: ${x.naziv}`}
              onClick={() => izberi(n)}
            >
              <span className={s.crta} aria-hidden>
                <span key={n === i ? `t${i}` : 'x'} className={s.polnilo} style={{ animationDuration: `${TRAJANJE}ms` }} />
              </span>
              <span className={s.oznaka}>
                <span className={s.st}>{String(n + 1).padStart(2, '0')}</span> {x.naziv}
              </span>
            </button>
          ))}
        </div>
        <a className={s.navzdol} href="#oblikuj">
          Oblikujte svojo hišo <ArrowDown size={16} weight="bold" aria-hidden />
        </a>
      </div>

    </section>
  );
}
