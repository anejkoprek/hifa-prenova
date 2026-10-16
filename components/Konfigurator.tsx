'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, LinkSimple, ArrowCounterClockwise } from '@phosphor-icons/react';
import Povprasevanje from './Povprasevanje';
import PolniloIkona from './PolniloIkona';
import { risiOgrajo } from '@/lib/risbe/ograja';
import { risiNadstresek } from '@/lib/risbe/nadstresek';
import {
  kritine,
  materiali,
  montazeZaTip,
  nadstresekIzUrl,
  nadstresekVUrl,
  ograjaIzUrl,
  ograjaVUrl,
  polnilaZaTip,
  postavitve,
  povzetekNadstreska,
  povzetekOgraje,
  privzetaOgraja,
  privzetNadstresek,
  tipiNadstreskov,
  tipiOgraj,
  vrataMoznosti,
  visinaZaTip,
  type NadstresekStanje,
  type OgrajaStanje,
} from '@/lib/konfigurator';
import { polnilaNazivi, polnilaOpisi } from '@/lib/moznosti';
import { RAL, ralHex } from '@/lib/ral';
import s from './Konfigurator.module.css';

type Izdelek = 'ograja' | 'nadstresek';

/** vse možnosti na vrhu, v istem vrstnem redu kot na pročelju; izbrana s povezave je privzeta */
const IZDELKI: { id: OgrajaStanje['tip'] | 'nadstresek'; naziv: string }[] = [
  { id: 'balkonska', naziv: 'Balkonska ograja' },
  { id: 'nadstresek', naziv: 'Nadstrešek' },
  { id: 'stopniscna-zunanja', naziv: 'Zunanja stopniščna' },
  { id: 'stopniscna-notranja', naziv: 'Notranja stopniščna' },
  { id: 'dvoriscna', naziv: 'Dvoriščna ograja in vrata' },
];

/** Ikone polnil v izbrani RAL barvi; zelo svetle barve pokažemo temneje, da so vidne na beli kartici. */
function barvaIkone(koda: string) {
  const hex = ralHex(koda).replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const svetlost = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return svetlost > 0.62 ? '#7b8286' : `#${hex}`;
}

/* ---------- gradniki ---------- */
function Korak({ st, naslov, children, namig }: { st: number; naslov: string; namig?: string; children: React.ReactNode }) {
  return (
    <fieldset className={s.korak}>
      <legend className={s.korakNaslov}>
        <span className={s.st} aria-hidden>{st}</span>
        <span>{naslov}</span>
      </legend>
      {namig ? <p className={s.namig}>{namig}</p> : null}
      <div className={s.korakTelo}>{children}</div>
    </fieldset>
  );
}

function Kartice<T extends string>({
  ime,
  moznosti,
  vrednost,
  nastavi,
  ikona,
  stolpci = 2,
}: {
  ime: string;
  moznosti: { id: T; naziv: string; opis?: string }[];
  vrednost: T;
  nastavi: (v: T) => void;
  ikona?: (id: T) => React.ReactNode;
  stolpci?: number;
}) {
  return (
    <div className={s.kartice} style={{ ['--st' as string]: stolpci }} role="radiogroup" aria-label={ime}>
      {moznosti.map((m) => (
        <label key={m.id} className={s.kartica}>
          <input type="radio" name={ime} value={m.id} checked={vrednost === m.id} onChange={() => nastavi(m.id)} />
          {ikona ? <span className={s.karticaIkona}>{ikona(m.id)}</span> : null}
          <span className={s.karticaBesedilo}>
            <span className={s.karticaNaziv}>{m.naziv}</span>
            {m.opis ? <span className={s.karticaOpis}>{m.opis}</span> : null}
          </span>
          <span className={s.kljukica} aria-hidden><Check size={14} weight="bold" /></span>
        </label>
      ))}
    </div>
  );
}

function Mera({
  oznaka,
  vrednost,
  nastavi,
  min,
  max,
  korak,
  enota,
}: {
  oznaka: string;
  vrednost: number;
  nastavi: (v: number) => void;
  min: number;
  max: number;
  korak: number;
  enota: string;
}) {
  const [tekst, setTekst] = useState(String(vrednost).replace('.', ','));
  useEffect(() => setTekst(String(vrednost).replace('.', ',')), [vrednost]);
  const potrdi = (t: string) => {
    const v = Number(t.replace(',', '.'));
    if (Number.isFinite(v)) nastavi(Math.min(max, Math.max(min, Math.round(v / korak) * korak)));
    else setTekst(String(vrednost).replace('.', ','));
  };
  const id = `mera-${oznaka.replace(/\W+/g, '-')}`;
  return (
    <div className={s.mera}>
      <label htmlFor={id} className={s.meraOznaka}>{oznaka}</label>
      <div className={s.meraVrstica}>
        <input
          type="range"
          min={min}
          max={max}
          step={korak}
          value={vrednost}
          onChange={(e) => nastavi(+e.target.value)}
          aria-label={`${oznaka} (drsnik)`}
          className={s.drsnik}
          style={{ ['--p' as string]: `${((vrednost - min) / (max - min)) * 100}%` }}
        />
        <span className={s.meraVnos}>
          <input
            id={id}
            className="vnos"
            inputMode="decimal"
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            onBlur={(e) => potrdi(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && potrdi((e.target as HTMLInputElement).value)}
          />
          <span className={s.enota}>{enota}</span>
        </span>
      </div>
    </div>
  );
}

function Barve({ ral, nastavi }: { ral: string; nastavi: (k: string) => void }) {
  const znana = RAL.some((r) => r.koda === ral);
  const [druga, setDruga] = useState(znana ? '' : ral);
  return (
    <div className={s.barve}>
      <div className="vzorci" role="radiogroup" aria-label="Barva po RAL lestvici">
        {RAL.map((r) => (
          <button
            key={r.koda}
            type="button"
            role="radio"
            aria-checked={ral === r.koda}
            aria-label={`RAL ${r.koda} ${r.ime}`}
            title={`RAL ${r.koda} ${r.ime}`}
            className="vzorec"
            style={{ ['--sw' as string]: r.hex }}
            onClick={() => {
              nastavi(r.koda);
              setDruga('');
            }}
          />
        ))}
      </div>
      <p className={s.ralIzbrana}>
        {znana ? (
          <>
            <strong>RAL {ral}</strong> {RAL.find((r) => r.koda === ral)?.ime.toLowerCase()}
          </>
        ) : (
          <>
            <strong>RAL {ral}</strong> po vaši izbiri (risba je prikazana v antracitni)
          </>
        )}
      </p>
      <label className={s.drugaRal}>
        <span className="small">Druga barva po RAL lestvici</span>
        <span className={s.ralVnos}>
          <span aria-hidden>RAL</span>
          <input
            className="vnos"
            inputMode="numeric"
            maxLength={4}
            placeholder="npr. 7022"
            value={druga}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4);
              setDruga(v);
              if (v.length === 4) nastavi(v);
            }}
          />
        </span>
      </label>
    </div>
  );
}

/* ---------- glavna komponenta ---------- */
export default function Konfigurator() {
  const [izdelek, setIzdelek] = useState<Izdelek>('ograja');
  const [og, setOg] = useState<OgrajaStanje>(privzetaOgraja);
  const [ns, setNs] = useState<NadstresekStanje>(privzetNadstresek);
  const [nalozeno, setNalozeno] = useState(false);

  // izbira iz povezave (npr. s pročelja ali deljena povezava); stran je statična, zato beremo v brskalniku
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('izdelek') === 'nadstresek') {
      setIzdelek('nadstresek');
      setNs(nadstresekIzUrl(q));
    } else if (q.toString()) {
      setOg(ograjaIzUrl(q));
    }
    setNalozeno(true);
  }, []);
  const [kopirano, setKopirano] = useState(false);
  const povRef = useRef<HTMLDivElement>(null);

  const posodobiOg = <K extends keyof OgrajaStanje>(k: K, v: OgrajaStanje[K]) =>
    setOg((o) => {
      const n = { ...o, [k]: v };
      if (k === 'tip') {
        const t = v as OgrajaStanje['tip'];
        if (!polnilaZaTip[t].includes(n.polnilo)) n.polnilo = polnilaZaTip[t][0];
        const vis = visinaZaTip[t];
        n.visina = vis.privzeto;
        const mont = montazeZaTip[t];
        if (mont.length && !mont.some((m) => m.id === n.montaza)) n.montaza = mont[0].id;
        if (t === 'dvoriscna' && o.tip !== 'dvoriscna') n.dolzina = Math.max(n.dolzina, 12);
      }
      return n;
    });
  const posodobiNs = <K extends keyof NadstresekStanje>(k: K, v: NadstresekStanje[K]) => setNs((o) => ({ ...o, [k]: v }));

  // izbira je vedno v naslovu strani, da jo lahko delite ali shranite
  const iskanje = izdelek === 'ograja' ? ograjaVUrl(og) : nadstresekVUrl(ns);
  useEffect(() => {
    if (!nalozeno) return;
    const t = setTimeout(() => window.history.replaceState(null, '', `/konfigurator?${iskanje}`), 250);
    return () => clearTimeout(t);
  }, [iskanje, nalozeno]);

  const risba = useMemo(() => {
    if (izdelek === 'ograja') {
      return risiOgrajo({
        tip: og.tip,
        polnilo: og.polnilo,
        dolzina: og.dolzina,
        visina: og.visina,
        barva: ralHex(og.ral),
        montaza: montazeZaTip[og.tip].length ? og.montaza : 'vrh',
        vrata: og.tip === 'dvoriscna' ? og.vrata : 'brez',
        sirinaVrat: og.sirinaVrat,
        osebniPrehod: og.tip === 'dvoriscna' && og.osebniPrehod,
        pogon: og.pogon && og.vrata !== 'brez',
        id: 'konf-og',
        h: og.tip === 'dvoriscna' ? 400 : og.tip === 'balkonska' ? 430 : 560,
      });
    }
    return risiNadstresek({
      tip: ns.tip,
      postavitev: ns.postavitev,
      sirina: ns.sirina,
      globina: ns.globina,
      visina: ns.visina,
      kritina: ns.kritina,
      barva: ralHex(ns.ral),
      stranLevo: ns.stranLevo,
      stranDesno: ns.stranDesno,
      id: 'konf-ns',
    });
  }, [izdelek, og, ns]);

  const povzetek = izdelek === 'ograja' ? povzetekOgraje(og) : povzetekNadstreska(ns);
  const m = (v: number) => v.toLocaleString('sl-SI', { maximumFractionDigits: 2 });
  const ralTrenutni = izdelek === 'ograja' ? og.ral : ns.ral;
  const naziv = <T extends { id: string; naziv: string }>(arr: T[], id: string) => arr.find((x) => x.id === id)?.naziv ?? id;
  const polja: [string, string][] =
    izdelek === 'ograja'
      ? [
          ['Polnilo', polnilaNazivi[og.polnilo]],
          ['Mere', `${m(og.dolzina)} m × ${og.visina} cm`],
          ['Material', naziv(materiali, og.material)],
          ...(montazeZaTip[og.tip].length ? ([['Montaža', naziv(montazeZaTip[og.tip], og.montaza)]] as [string, string][]) : []),
          ...(og.tip === 'dvoriscna'
            ? ([['Vrata', og.vrata === 'brez' ? 'brez vrat' : `${naziv(vrataMoznosti, og.vrata)}, ${m(og.sirinaVrat)} m${og.pogon ? ', s pogonom' : ''}`], ['Prehod', og.osebniPrehod ? 'osebni prehod' : 'brez']] as [string, string][])
            : []),
        ]
      : [
          ['Postavitev', naziv(postavitve, ns.postavitev)],
          ['Mere', `${m(ns.sirina)} × ${m(ns.globina)} m`],
          ['Svetla višina', `${m(ns.visina)} m`],
          ['Kritina', naziv(kritine, ns.kritina)],
          ['Material', naziv(materiali, ns.material)],
          ['Stene', [ns.stranLevo && 'levo', ns.stranDesno && 'desno'].filter(Boolean).join(' in ') || 'brez'],
        ];
  const povzetekTekst = povzetek.join('; ');

  const kopiraj = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setKopirano(true);
      setTimeout(() => setKopirano(false), 2200);
    } catch {
      /* brskalnik ne dovoli */
    }
  };

  const ponastavi = () => (izdelek === 'ograja' ? setOg(privzetaOgraja) : setNs(privzetNadstresek));
  let st = 0;

  return (
    <div className={s.konf}>
      <div className={`wrap ${s.izdelekVrstica}`}>
        <div className={s.izdelekPreklop} role="group" aria-label="Kaj oblikujete">
          {IZDELKI.map(({ id, naziv: ime }) => {
            const aktiven = id === 'nadstresek' ? izdelek === 'nadstresek' : izdelek === 'ograja' && og.tip === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={aktiven}
                className={s.preklop}
                onClick={() => {
                  if (id === 'nadstresek') return setIzdelek('nadstresek');
                  setIzdelek('ograja');
                  if (og.tip !== id) posodobiOg('tip', id);
                }}
              >
                {ime}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`wrap ${s.mreza}`}>
        {/* ---------- risba (lepljiva) ---------- */}
        <div className={s.risbaStolpec}>
          <div className={s.risbaLepljiva}>
            <div className={`platno ${s.platno}`} aria-live="polite">
              <div key={iskanje} className={s.risba} dangerouslySetInnerHTML={{ __html: risba }} />
            </div>
            <div className={s.glavaRisbe}>
              <div className={s.grNaslov}>
                <span className="napis">{izdelek === 'ograja' ? 'Ograja · pogled' : 'Nadstrešek · aksonometrija'}</span>
                <strong>{izdelek === 'ograja' ? naziv(tipiOgraj, og.tip) : `Nadstrešek ${naziv(tipiNadstreskov, ns.tip).toLowerCase()}`}</strong>
              </div>
              <dl className={s.grPolja}>
                {polja.map(([k, v]) => (
                  <div key={k}>
                    <dt className="napis">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
                <div className={s.grBarva}>
                  <dt className="napis">Barva</dt>
                  <dd>
                    <span className={s.grVzorec} style={{ ['--sw' as string]: ralHex(ralTrenutni) }} aria-hidden />
                    RAL {ralTrenutni}
                    <span className={s.grRalIme}>{RAL.find((x) => x.koda === ralTrenutni)?.ime ?? 'po vaši izbiri'}</span>
                  </dd>
                </div>
              </dl>
              <div className={s.grAkcije}>
                <button type="button" className={s.malGumb} onClick={kopiraj}>
                  {kopirano ? <Check size={16} weight="bold" aria-hidden /> : <LinkSimple size={16} weight="bold" aria-hidden />}
                  {kopirano ? 'Povezava kopirana' : 'Kopiraj povezavo'}
                </button>
                <button type="button" className={s.malGumb} onClick={ponastavi}>
                  <ArrowCounterClockwise size={16} weight="bold" aria-hidden /> Ponastavi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- izbire ---------- */}
        <div className={s.izbire}>
          {izdelek === 'ograja' ? (
            <>
              

              <Korak st={++st} naslov="Polnilo">
                <Kartice
                  ime="polnilo"
                  moznosti={polnilaZaTip[og.tip].map((p) => ({ id: p, naziv: polnilaNazivi[p], opis: polnilaOpisi[p] }))}
                  vrednost={og.polnilo}
                  nastavi={(v) => posodobiOg('polnilo', v)}
                  ikona={(p) => (
                    <span style={{ color: barvaIkone(og.ral) }}>
                      <PolniloIkona tip={p} />
                    </span>
                  )}
                />
              </Korak>

              <Korak st={++st} naslov="Mere" namig="Približne mere so dovolj. Natančno izmerimo na objektu.">
                <Mera oznaka="Dolžina ograje" vrednost={og.dolzina} nastavi={(v) => posodobiOg('dolzina', v)} min={1} max={60} korak={0.1} enota="m" />
                <Mera
                  oznaka="Višina ograje"
                  vrednost={og.visina}
                  nastavi={(v) => posodobiOg('visina', v)}
                  min={visinaZaTip[og.tip].min}
                  max={visinaZaTip[og.tip].max}
                  korak={5}
                  enota="cm"
                />
              </Korak>

              {og.tip === 'dvoriscna' ? (
                <Korak st={++st} naslov="Vrata in prehod">
                  <Kartice ime="vrata" moznosti={vrataMoznosti} vrednost={og.vrata} nastavi={(v) => posodobiOg('vrata', v)} stolpci={4} />
                  {og.vrata !== 'brez' ? (
                    <Mera oznaka="Širina vrat" vrednost={og.sirinaVrat} nastavi={(v) => posodobiOg('sirinaVrat', v)} min={1} max={8} korak={0.1} enota="m" />
                  ) : null}
                  <div className={s.stikala}>
                    <label className="potrditev">
                      <input type="checkbox" checked={og.osebniPrehod} onChange={(e) => posodobiOg('osebniPrehod', e.target.checked)} />
                      <span><strong>Osebni prehod</strong> v enakem polnilu</span>
                    </label>
                    {og.vrata !== 'brez' ? (
                      <label className="potrditev">
                        <input type="checkbox" checked={og.pogon} onChange={(e) => posodobiOg('pogon', e.target.checked)} />
                        <span><strong>Pogon</strong> s fotocelico, daljincem in signalno lučjo</span>
                      </label>
                    ) : null}
                  </div>
                </Korak>
              ) : null}

              {montazeZaTip[og.tip].length ? (
                <Korak st={++st} naslov="Montaža">
                  <Kartice ime="montaza" moznosti={montazeZaTip[og.tip]} vrednost={og.montaza} nastavi={(v) => posodobiOg('montaza', v)} />
                </Korak>
              ) : null}

              <Korak st={++st} naslov="Material in barva">
                <Kartice ime="material" moznosti={materiali} vrednost={og.material} nastavi={(v) => posodobiOg('material', v)} stolpci={3} />
                <Barve ral={og.ral} nastavi={(k) => posodobiOg('ral', k)} />
              </Korak>
            </>
          ) : (
            <>
              <Korak st={++st} naslov="Oblika">
                <Kartice ime="ns-tip" moznosti={tipiNadstreskov} vrednost={ns.tip} nastavi={(v) => posodobiNs('tip', v)} />
              </Korak>
              <Korak st={++st} naslov="Postavitev">
                <Kartice ime="ns-postavitev" moznosti={postavitve} vrednost={ns.postavitev} nastavi={(v) => posodobiNs('postavitev', v)} />
              </Korak>
              <Korak st={++st} naslov="Mere" namig="Za en avto zadošča približno 3 × 5,5 m, za dva 5,5 × 5,5 m.">
                <Mera oznaka="Širina" vrednost={ns.sirina} nastavi={(v) => posodobiNs('sirina', v)} min={2} max={12} korak={0.1} enota="m" />
                <Mera oznaka="Globina" vrednost={ns.globina} nastavi={(v) => posodobiNs('globina', v)} min={1.5} max={8} korak={0.1} enota="m" />
                <Mera oznaka="Svetla višina" vrednost={ns.visina} nastavi={(v) => posodobiNs('visina', v)} min={2.1} max={3.2} korak={0.05} enota="m" />
              </Korak>
              <Korak st={++st} naslov="Kritina">
                <Kartice ime="ns-kritina" moznosti={kritine} vrednost={ns.kritina} nastavi={(v) => posodobiNs('kritina', v)} />
              </Korak>
              <Korak st={++st} naslov="Stranske stene">
                <div className={s.stikala}>
                  <label className="potrditev">
                    <input type="checkbox" checked={ns.stranLevo} onChange={(e) => posodobiNs('stranLevo', e.target.checked)} />
                    <span><strong>Levo</strong>, kaljeno steklo</span>
                  </label>
                  <label className="potrditev">
                    <input type="checkbox" checked={ns.stranDesno} onChange={(e) => posodobiNs('stranDesno', e.target.checked)} />
                    <span><strong>Desno</strong>, kaljeno steklo</span>
                  </label>
                </div>
              </Korak>
              <Korak st={++st} naslov="Material in barva">
                <Kartice
                  ime="ns-material"
                  moznosti={materiali}
                  vrednost={ns.material}
                  nastavi={(v) => posodobiNs('material', v)}
                  stolpci={3}
                />
                <Barve ral={ns.ral} nastavi={(k) => posodobiNs('ral', k)} />
              </Korak>
            </>
          )}

          <div className={s.koncni} ref={povRef} id="povprasevanje">
            <h2 className="h3">
              <span className={s.st} aria-hidden>{++st}</span> Pošljite izbiro za informativno ponudbo
            </h2>
            <p className="muted">
              Cena je odvisna od terena in podrobnosti, zato jo pripravimo na podlagi vaše izbire in fotografij. Končno ponudbo dobite po ogledu in izmeri.
            </p>
            <Povprasevanje
              izdelki={izdelek === 'nadstresek' ? ['Nadstrešek'] : og.tip === 'dvoriscna' && og.vrata !== 'brez' ? ['Ograja', 'Dvoriščna vrata'] : og.tip.startsWith('stopniscna') ? ['Ograja', 'Stopnišče'] : ['Ograja']}
              konfiguracija={povzetekTekst}
              kompaktno
            />
          </div>
        </div>
      </div>
    </div>
  );
}
