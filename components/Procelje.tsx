'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowsOut, DoorOpen, Phone, SlidersHorizontal } from '@phosphor-icons/react';
import {
  risiProcelje,
  risiNotranjost,
  izbor,
  NOTRI,
  VHOD,
  ZUNAJ,
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
type Prostor = 'zunaj' | 'notri';
/** faze vstopa: približanje vratom, odpiranje vrat, nato notranjost na istem mestu */
type Prehod = null | 'vrata' | 'odpira';
const brezGibanja = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const cm = (x: number) => (x + 0.9) * 100;
const cz = (z: number) => (9.5 - z) * 100;
const ozkiZaslon = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches;

type Kode = {
  A: { polnilo: ProceljeIzbira['A']['polnilo']; ral: string };
  B: { oblika: ProceljeIzbira['B']['oblika']; ral: string };
  C: { polnilo: ProceljeIzbira['C']['polnilo']; ral: string };
  D: { polnilo: ProceljeIzbira['D']['polnilo']; vrata: ProceljeIzbira['D']['vrata']; ral: string };
  E: { polnilo: ProceljeIzbira['E']['polnilo']; ral: string };
  F: { polnilo: ProceljeIzbira['F']['polnilo']; ral: string };
};

const zacetek: Kode = {
  A: { polnilo: privzetaIzbira.A.polnilo, ral: '7016' },
  B: { oblika: privzetaIzbira.B.oblika, ral: '7016' },
  C: { polnilo: privzetaIzbira.C.polnilo, ral: '7016' },
  D: { polnilo: privzetaIzbira.D.polnilo, vrata: privzetaIzbira.D.vrata, ral: '7016' },
  E: { polnilo: privzetaIzbira.E.polnilo, ral: '9005' },
  F: { polnilo: privzetaIzbira.F.polnilo, ral: '9005' },
};

export default function Procelje() {
  const [izbran, setIzbran] = useState<DelId>('A');
  const [prostor, setProstor] = useState<Prostor>('zunaj');
  const [prehod, setPrehod] = useState<Prehod>(null);
  const casovniki = useRef<number[]>([]);
  const [lebdi, setLebdi] = useState<DelId | null>(null);
  const [kode, setKode] = useState<Kode>(zacetek);
  // dokler obiskovalec ne izbere dela, oznake A–D rahlo utripajo kot povabilo h kliku
  const [namig, setNamig] = useState(true);
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
      E: { polnilo: kode.E.polnilo, ral: ralHex(kode.E.ral) },
      F: { polnilo: kode.F.polnilo, ral: ralHex(kode.F.ral) },
    }),
    [kode],
  );
  const svg = useMemo(() => (prostor === 'notri' ? risiNotranjost(izbira) : risiProcelje(izbira)), [izbira, prostor]);
  const IDS = prostor === 'notri' ? NOTRI : ZUNAJ;

  // gladek prehod viewBoxa (približanje dela na telefonu)
  const premakni = useCallback((cilj: Vb, T = 520) => {
    cancelAnimationFrame(anim.current);
    if (brezGibanja()) {
      setVb(cilj);
      return;
    }
    let od: Vb | null = null;
    const t0 = performance.now();
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
      else setVb(cilj);
    };
    anim.current = requestAnimationFrame(korak);
  }, []);

  const izberi = useCallback(
    (id: DelId, priblizaj = true) => {
      setIzbran(id);
      setNamig(false);
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

  const pocakaj = (ms: number, fn: () => void) => casovniki.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => casovniki.current.forEach(clearTimeout), []);

  // vstop v hišo: približamo se vratom, vrata se odprejo, na istem mestu se pokaže notranjost
  const vstopi = () => {
    if (prehod) return;
    setNamig(false);
    setPriblizano(false);
    const razmerje = osnova.w / osnova.h;
    const priVratih = okvirDela('vhod', razmerje, 0.55);
    if (brezGibanja()) {
      setProstor('notri');
      setIzbran('E');
      setVb(osnova);
      return;
    }
    setPrehod('vrata');
    premakni(priVratih, 750);
    pocakaj(800, () => setPrehod('odpira'));
    // skozi odprta vrata: še bližje, v toplo svetlobo
    pocakaj(1350, () => premakni(okvirDela('vhod', razmerje, 0.02), 450));
    pocakaj(1800, () => {
      setProstor('notri');
      setIzbran('E');
      setRisano((n) => n + 1);
      setPrehod(null);
      setVb(priVratih);
      premakni(osnova, 950);
    });
  };

  const izstopi = () => {
    if (prehod) return;
    setProstor('zunaj');
    setIzbran('A');
    setRisano((n) => n + 1);
    if (brezGibanja()) {
      setVb(osnova);
      return;
    }
    setVb(okvirDela('vhod', osnova.w / osnova.h, 0.55));
    premakni(osnova, 850);
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
    <section id="oblikuj" className={s.hero} aria-labelledby="hero-naslov" data-namig={namig || undefined} data-prehod={prehod || undefined}>
      <div className={s.list}>
        <div className={s.scena}>
        <div className={s.uvod}>
          <h2 id="hero-naslov" className={`display ${s.naslov}`}>{prostor === 'notri' ? 'Notranjost hiše' : 'Oblikujte svojo hišo'}</h2>
          <p className={s.lead}>
            {prostor === 'notri'
              ? 'Ograja ob notranjem stopnišču in zgornji etaži ter ograja galerije. Izberite polnilo in barvo.'
              : 'Kliknite balkon, nadstrešek, stopnišče ali dvoriščno ograjo ter izberite polnilo, obliko in barvo. Skozi vhodna vrata vstopite v hišo.'}
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
            aria-label={`${prostor === 'notri' ? 'Notranjost hiše' : 'Pročelje hiše'} z izdelki HIFA. Izbrano: ${del.naziv}.`}
            preserveAspectRatio="xMidYMid meet"
          >
            <g key={prostor} className={s.prostor} dangerouslySetInnerHTML={{ __html: svg }} />
            {/* vrata med vstopom: za njimi topla svetloba, krilo se odpre navznoter */}
            {prehod ? (
              <g className={s.vhod} data-odprto={prehod === 'odpira' || undefined} aria-hidden>
                <rect x={cm(VHOD.x1 + 0.07)} y={cz(VHOD.z2 - 0.07)} width={(VHOD.x2 - VHOD.x1 - 0.14) * 100} height={(VHOD.z2 - VHOD.z1 - 0.1) * 100} className={s.vhodLuc} />
                <g className={s.krilo}>
                  <rect x={cm(VHOD.x1 + 0.07)} y={cz(VHOD.z2 - 0.07)} width={(VHOD.x2 - VHOD.x1 - 0.14) * 100} height={(VHOD.z2 - VHOD.z1 - 0.1) * 100} fill="var(--p-vrata)" stroke="var(--p-crta)" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
                  <rect x={cm(8.78)} y={cz(2.6)} width={20} height={160} fill="var(--p-okno)" />
                  <rect x={cm(9.45)} y={cz(2.05)} width={5} height={50} fill="var(--p-crta)" />
                </g>
              </g>
            ) : null}
            {/* kazalne črte do oznak */}
            {IDS.map((id) => {
              const o = id === 'B' && (kode.B as { oblika?: string }).oblika === 'enokapnica' ? { ...oznake.B, tz: 2.93 } : oznake[id];
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
            {/* izbrani del: rahlo obarvano polje, črtkan okvir in vogalne oznake, ki se »ujamejo« na del */}
            {(() => {
              const b = izbor(izbran);
              return (
                <g key={`${izbran}-${risano}`} className={s.izbor}>
                  <rect x={b.x} y={b.y} width={b.w} height={b.h} className={s.izborPolje} />
                  <rect x={b.x} y={b.y} width={b.w} height={b.h} className={s.izborOkvir} vectorEffect="non-scaling-stroke" />
                  <path d={b.koti} className={s.izborKoti} strokeWidth={(3 * vb.w) / sirina} />
                </g>
              );
            })()}
            {lebdi && lebdi !== izbran ? (() => {
              const b = izbor(lebdi);
              return <path d={b.koti} className={s.izborLebdi} strokeWidth={(2 * vb.w) / sirina} />;
            })() : null}
            {/* zadetki za miško in prst */}
            {(prostor === 'notri' ? NOTRI : (['B', 'A', 'C', 'D'] as DelId[])).map((id) => {
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
            {prostor === 'zunaj' && !prehod ? (
              <rect
                x={cm(VHOD.x1)}
                y={cz(VHOD.z2)}
                width={(VHOD.x2 - VHOD.x1) * 100}
                height={(VHOD.z2 - 1.9) * 100}
                className={s.zadetek}
                onClick={vstopi}
                aria-hidden
              />
            ) : null}
          </svg>

          {prehod ? null : IDS.map((id) => {
            const o = id === 'B' && (kode.B as { oblika?: string }).oblika === 'enokapnica' ? { ...oznake.B, tz: 2.93 } : oznake[id];
            const p = vOdstotkih(o.x, o.z, vb);
            if (p.left < -2 || p.left > 102 || p.top < -2 || p.top > 102) return null;
            // oznaka ne sme pasti čez rob risbe (na telefonu je risba obrezana)
            const rob = osnova.w !== VIEWBOX.w ? 7.5 : 4.5; // na telefonu v okvirju risbe malo več prostora
            p.left = Math.min(100 - rob, Math.max(rob, p.left));
            p.top = Math.min(100 - rob, Math.max(rob, p.top));
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

          {prostor === 'zunaj' && !prehod ? (() => {
            const p = vOdstotkih((VHOD.x1 + VHOD.x2) / 2, 1.95, vb);
            if (p.left < 0 || p.left > 100 || p.top < 0 || p.top > 100) return null;
            return (
              <button type="button" className={s.vstopi} style={{ left: `${p.left}%`, top: `${p.top}%` }} onClick={vstopi}>
                <DoorOpen size={18} weight="bold" aria-hidden /> <span className={s.dolgo}>Vstopite v hišo</span><span className={s.kratko}>Vstopi</span>
              </button>
            );
          })() : null}
          {prostor === 'notri' ? (
            <button type="button" className={`gumb gumb--svetel gumb--mal ${s.nazaj}`} onClick={izstopi}>
              <ArrowLeft size={16} weight="bold" aria-hidden /> Nazaj pred hišo
            </button>
          ) : null}

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
            {prostor === 'zunaj' ? (
              <button type="button" className={s.zavihek} onClick={vstopi}>
                <span className={`detajl ${s.zavihekVrata}`} aria-hidden><DoorOpen size={18} weight="bold" /></span>
                <span>Notranjost</span>
              </button>
            ) : (
              <button type="button" className={s.zavihek} onClick={izstopi}>
                <span className={`detajl ${s.zavihekVrata}`} aria-hidden><ArrowLeft size={18} weight="bold" /></span>
                <span>Pred hišo</span>
              </button>
            )}
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
              Pošljite povpraševanje <ArrowRight size={18} weight="bold" className="puscica" aria-hidden />
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
