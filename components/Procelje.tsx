'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowsOut, Phone, SlidersHorizontal } from '@phosphor-icons/react';
import {
  risiProcelje,
  oblacek,
  obmocja,
  oznake,
  okvirDela,
  privzetaIzbira,
  vOdstotkih,
  VIEWBOX,
  VIEWBOX_OZEK,
  type DelId,
  type ProceljeIzbira,
} from '@/lib/risbe/procelje';
import { deli, polnilaNazivi, oblikeNazivi, vrataNazivi } from '@/lib/moznosti';
import { RAL, ralHex } from '@/lib/ral';
import { podjetje } from '@/lib/podjetje';
import PolniloIkona from './PolniloIkona';
import s from './Procelje.module.css';

type Vb = { x: number; y: number; w: number; h: number };
const IDS: DelId[] = ['A', 'B', 'C', 'D'];
const ozkiZaslon = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches;

type Kode = {
  A: { polnilo: ProceljeIzbira['A']['polnilo']; ral: string };
  B: { oblika: ProceljeIzbira['B']['oblika']; ral: string };
  C: { polnilo: ProceljeIzbira['C']['polnilo']; ral: string };
  D: { polnilo: ProceljeIzbira['D']['polnilo']; vrata: ProceljeIzbira['D']['vrata']; ral: string };
};

const zacetek: Kode = {
  A: { polnilo: privzetaIzbira.A.polnilo, ral: '7016' },
  B: { oblika: privzetaIzbira.B.oblika, ral: '7016' },
  C: { polnilo: privzetaIzbira.C.polnilo, ral: '7016' },
  D: { polnilo: privzetaIzbira.D.polnilo, vrata: privzetaIzbira.D.vrata, ral: '7016' },
};

export default function Procelje() {
  const [izbran, setIzbran] = useState<DelId>('A');
  const [lebdi, setLebdi] = useState<DelId | null>(null);
  const [kode, setKode] = useState<Kode>(zacetek);
  const [vb, setVb] = useState<Vb>(VIEWBOX);
  const [osnova, setOsnova] = useState<Vb>(VIEWBOX);
  const [priblizano, setPriblizano] = useState(false);
  const [risano, setRisano] = useState(0); // ključ za ponovno risanje oblačka
  const anim = useRef<number>(0);
  const okvir = useRef<HTMLDivElement>(null);
  const [sirina, setSirina] = useState(1200);

  useEffect(() => {
    const el = okvir.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSirina(e.contentRect.width || 1200));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const izbira: ProceljeIzbira = useMemo(
    () => ({
      A: { polnilo: kode.A.polnilo, ral: ralHex(kode.A.ral) },
      B: { oblika: kode.B.oblika, ral: ralHex(kode.B.ral) },
      C: { polnilo: kode.C.polnilo, ral: ralHex(kode.C.ral) },
      D: { polnilo: kode.D.polnilo, vrata: kode.D.vrata, ral: ralHex(kode.D.ral) },
    }),
    [kode],
  );
  const svg = useMemo(() => risiProcelje(izbira), [izbira]);

  // gladek prehod viewBoxa (približanje dela na telefonu)
  const premakni = useCallback((cilj: Vb) => {
    cancelAnimationFrame(anim.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVb(cilj);
      return;
    }
    let od: Vb | null = null;
    const t0 = performance.now();
    const T = 520;
    const korak = (t: number) => {
      setVb((trenutni) => {
        od ??= trenutni;
        const p = Math.min(1, (t - t0) / T);
        const e = 1 - Math.pow(1 - p, 4);
        return {
          x: od.x + (cilj.x - od.x) * e,
          y: od.y + (cilj.y - od.y) * e,
          w: od.w + (cilj.w - od.w) * e,
          h: od.h + (cilj.h - od.h) * e,
        };
      });
      if (t - t0 < T) anim.current = requestAnimationFrame(korak);
    };
    anim.current = requestAnimationFrame(korak);
  }, []);

  const izberi = useCallback(
    (id: DelId, priblizaj = true) => {
      setIzbran(id);
      setRisano((n) => n + 1);
      if (priblizaj && ozkiZaslon()) {
        setPriblizano(true);
        premakni(okvirDela(id, VIEWBOX_OZEK.w / VIEWBOX_OZEK.h));
      }
    },
    [premakni],
  );

  const celaHisa = () => {
    setPriblizano(false);
    premakni(osnova);
  };

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const f = () => {
      const o = mq.matches ? VIEWBOX_OZEK : VIEWBOX;
      setOsnova(o);
      setPriblizano(false);
      setVb(o);
    };
    f();
    mq.addEventListener('change', f);
    return () => {
      mq.removeEventListener('change', f);
      cancelAnimationFrame(anim.current);
    };
  }, []);

  const del = deli[izbran];
  const trenutno = kode[izbran] as Record<string, string>;
  const nastavi = (kljuc: string, vrednost: string) =>
    setKode((k) => ({ ...k, [izbran]: { ...k[izbran], [kljuc]: vrednost } }));

  const parametri = new URLSearchParams({ del: izbran, ...trenutno });
  const povprasevanje = `/kontakt?${parametri.toString()}#povprasevanje`;
  const vKonfigurator = `/konfigurator?${del.konfigurator}&${new URLSearchParams(trenutno).toString()}`;

  const viewBox = `${vb.x} ${vb.y} ${vb.w} ${vb.h}`;

  return (
    <section className={s.hero} aria-labelledby="hero-naslov">
      <div className={s.list}>
        <div className={s.scena}>
        <div className={s.uvod}>
          <h1 id="hero-naslov" className={`display ${s.naslov}`}>Ograje, nadstreški in stopnišča po meri</h1>
          <p className={s.lead}>
            Izdelamo jih v lastni delavnici v Njivercah pri Kidričevem in montiramo po vsej Sloveniji. Z vami od leta 1990.
          </p>
          <p className={s.namig}>
            <SlidersHorizontal size={18} weight="bold" aria-hidden />
            Izberite del hiše in ga oblikujte
          </p>
        </div>

        <div className={s.risba} ref={okvir}>
          <svg
            viewBox={viewBox}
            className={s.svg}
            role="img"
            aria-label={`Pročelje hiše z izdelki HIFA. Izbrano: ${del.naziv}.`}
            preserveAspectRatio="xMidYMid meet"
          >
            <g dangerouslySetInnerHTML={{ __html: svg }} />
            {/* kazalne črte do oznak */}
            {IDS.map((id) => {
              const o = oznake[id];
              const x1 = (o.x + 0.9) * 100, y1 = (9.5 - o.z) * 100;
              const x2 = (o.tx + 0.9) * 100, y2 = (9.5 - o.tz) * 100;
              const aktivna = id === izbran;
              return (
                <g key={id} className={s.kazalo} data-aktivna={aktivna || undefined}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} vectorEffect="non-scaling-stroke" />
                  <circle cx={x2} cy={y2} r={9} />
                </g>
              );
            })}
            {/* oblaček spremembe okoli izbranega dela */}
            <path key={`${izbran}-${risano}`} d={oblacek(izbran)} className={s.oblacek} pathLength={1} strokeWidth={(2.6 * vb.w) / sirina} />
            {lebdi && lebdi !== izbran ? <path d={oblacek(lebdi)} className={s.oblacekLebdi} strokeWidth={(1.6 * vb.w) / sirina} /> : null}
            {/* zadetki za miško in prst */}
            {(['B', 'A', 'C', 'D'] as DelId[]).map((id) => {
              const o = obmocja[id];
              return (
                <rect
                  key={id}
                  x={(o.x1 + 0.9) * 100}
                  y={(9.5 - o.z2) * 100}
                  width={(o.x2 - o.x1) * 100}
                  height={(o.z2 - o.z1) * 100}
                  className={s.zadetek}
                  onClick={() => izberi(id)}
                  onMouseEnter={() => setLebdi(id)}
                  onMouseLeave={() => setLebdi(null)}
                  aria-hidden
                />
              );
            })}
          </svg>

          {IDS.map((id) => {
            const o = oznake[id];
            const p = vOdstotkih(o.x, o.z, vb);
            if (p.left < -2 || p.left > 102 || p.top < -2 || p.top > 102) return null;
            // oznaka ne sme pasti čez rob risbe (na telefonu je risba obrezana)
            p.left = Math.min(95.5, Math.max(4.5, p.left));
            return (
              <button
                key={id}
                type="button"
                className={`detajl ${s.oznaka} ${id === izbran ? 'detajl--zelen' : ''}`}
                style={{ left: `${p.left}%`, top: `${p.top}%` }}
                aria-pressed={id === izbran}
                aria-label={`${id}: ${deli[id].naziv}`}
                onClick={() => izberi(id)}
                onMouseEnter={() => setLebdi(id)}
                onMouseLeave={() => setLebdi(null)}
              >
                {id}
              </button>
            );
          })}

          {priblizano ? (
            <button type="button" className={`gumb gumb--svetel gumb--mal ${s.cela}`} onClick={celaHisa}>
              <ArrowsOut size={16} weight="bold" aria-hidden /> Cela hiša
            </button>
          ) : null}
        </div>
        </div>

        {/* glava risbe: izbrani del in njegove izbire */}
        <div className={s.plosca}>
          <div className={s.zavihki} role="tablist" aria-label="Del hiše">
            {IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={id === izbran}
                aria-controls="procelje-izbire"
                className={s.zavihek}
                onClick={() => izberi(id)}
              >
                <span className={`detajl ${id === izbran ? 'detajl--zelen' : ''}`} aria-hidden>{id}</span>
                <span>{deli[id].kratko}</span>
              </button>
            ))}
          </div>

          <div className={s.celica + ' ' + s.opisCelica}>
            <h2 className={s.delNaslov}>
              <span className="detajl detajl--zelen" aria-hidden>{izbran}</span>
              {del.naziv}
            </h2>
            <p className={s.delOpis}>{del.opis}</p>
          </div>

          <div id="procelje-izbire" role="tabpanel" className={s.celica + ' ' + s.izbireCelica} aria-label={`Izbire: ${del.naziv}`}>
            {del.polnila ? (
              <fieldset className={s.skupina}>
                <legend className="napis">Polnilo</legend>
                <div className="cipi">
                  {del.polnila.map((p) => (
                    <button key={p} type="button" className="cip" aria-pressed={trenutno.polnilo === p} onClick={() => nastavi('polnilo', p)}>
                      <PolniloIkona tip={p} />
                      {polnilaNazivi[p]}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}
            {del.oblike ? (
              <fieldset className={s.skupina}>
                <legend className="napis">Oblika</legend>
                <div className="cipi">
                  {del.oblike.map((p) => (
                    <button key={p} type="button" className="cip" aria-pressed={trenutno.oblika === p} onClick={() => nastavi('oblika', p)}>
                      {oblikeNazivi[p]}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}
            {del.vrata ? (
              <fieldset className={s.skupina}>
                <legend className="napis">Vrata</legend>
                <div className="cipi">
                  {del.vrata.map((p) => (
                    <button key={p} type="button" className="cip" aria-pressed={trenutno.vrata === p} onClick={() => nastavi('vrata', p)}>
                      {vrataNazivi[p]}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <fieldset className={s.skupina}>
              <legend className="napis">
                Barva <span className={s.ralIme}>RAL {trenutno.ral} {RAL.find((r) => r.koda === trenutno.ral)?.ime.toLowerCase()}</span>
              </legend>
              <div className="vzorci" role="radiogroup" aria-label="Barva po RAL lestvici">
                {RAL.map((r) => (
                  <button
                    key={r.koda}
                    type="button"
                    role="radio"
                    aria-checked={trenutno.ral === r.koda}
                    aria-label={`RAL ${r.koda} ${r.ime}`}
                    title={`RAL ${r.koda} ${r.ime}`}
                    className="vzorec"
                    style={{ ['--sw' as string]: r.hex }}
                    onClick={() => nastavi('ral', r.koda)}
                  />
                ))}
              </div>
            </fieldset>
          </div>

          <div className={s.celica + ' ' + s.akcijeCelica}>
            <Link className="gumb gumb--zelen gumb--poln" href={povprasevanje}>
              Povpraševanje za ta del <ArrowRight size={18} weight="bold" className="puscica" aria-hidden />
            </Link>
            <Link className="gumb gumb--obroba gumb--poln" href={vKonfigurator}>
              Podrobno v konfiguratorju
            </Link>
            <div className={s.povezave}>
              <Link className="povezava" href={del.href}>
                {del.naziv}
              </Link>
              <a className={s.tel} href={podjetje.telefonHref}>
                <Phone size={16} weight="bold" aria-hidden /> {podjetje.telefon}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
