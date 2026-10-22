'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Check, LinkSimple, ArrowCounterClockwise, Cube, PencilRuler, Minus, Plus, PencilSimpleLine } from '@phosphor-icons/react';
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
  dolzinaZaTip,
  jeStopnisce,
  podestRazpon,
  skupnaDolzina,
  razmikStebrovZaTip,
  razmikPolnilaZaPolnilo,
  zakljucki,
  imaZakljucek,
  sipkaPrivzeto,
  sipkaRazpon,
  podaljsekRazpon,
  materialiZaTip,
  materialiNadstreska,
  kritineZaTip,
  steneTipi,
  steneSmeri,
  PREKAT,
  smeriLesa,
  rocaji,
  imaLesenRocaj,
  imaKonzole,
  konzoleVklopljene,
  imaLesenStrop,
  naPlosci,
  type NadstresekStanje,
  type OgrajaStanje,
} from '@/lib/konfigurator';
import { polnilaNazivi, polnilaOpisi } from '@/lib/moznosti';
import { RAL, ralHex } from '@/lib/ral';
import { vzorci, obl, oblikeSvg, type Vzorec } from '@/lib/vzorci';
import { vzorciZarkov, odsekiZarkov, type VzorecZarkov } from '@/lib/zarki';
import s from './Konfigurator.module.css';

// three.js se naloži šele ob prvem odprtju 3D pogleda
const Scena3D = dynamic(() => import('./Scena3D'), {
  ssr: false,
  loading: () => (
    <div className={s.nalaganje3d} role="status">
      <Cube size={28} weight="duotone" aria-hidden />
      <span>Nalagam 3D model</span>
    </div>
  ),
});

type Izdelek = 'ograja' | 'nadstresek';

/** vse možnosti na vrhu, v istem vrstnem redu kot na pročelju; izbrana s povezave je privzeta */
const IZDELKI: { id: OgrajaStanje['tip'] | 'nadstresek'; naziv: string }[] = [
  { id: 'balkonska', naziv: 'Balkonska ograja' },
  { id: 'nadstresek', naziv: 'Nadstrešek' },
  { id: 'stopniscna-zunanja', naziv: 'Zunanja stopniščna' },
  { id: 'dvoriscna', naziv: 'Dvoriščna ograja in vrata' },
  { id: 'stopniscna-notranja', naziv: 'Notranja stopniščna' },
  { id: 'galerijska', naziv: 'Galerijska ograja' },
];

/** Ikone polnil v izbrani RAL barvi; zelo svetle barve pokažemo temneje, da so vidne na beli kartici. */
function barvaIkone(koda: string) {
  const hex = ralHex(koda).replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const svetlost = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return svetlost > 0.62 ? '#7b8286' : `#${hex}`;
}

/** majhen predogled vzorca izreza: pločevina v izbrani barvi, izrezi svetli */
function VzorecIkona({ vzorec, barva }: { vzorec: Vzorec; barva: string }) {
  if (vzorec === 'po-meri') return <PencilSimpleLine size={26} weight="duotone" style={{ color: barva }} aria-hidden />;
  const s = 40;
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden style={{ borderRadius: 4, display: 'block' }}
      dangerouslySetInnerHTML={{ __html: `<rect width="40" height="40" fill="${barva}"/>${oblikeSvg(obl(vzorec, 1), s, 0, 40, '#f4f5f1')}` }} />
  );
}

/** predogled izvedbe žarkov: palice v okvirju */
function ZarkiIkona({ vzorec, barva }: { vzorec: VzorecZarkov; barva: string }) {
  const L = 1.25, h = 1, s = 32, ox = 4, oy = 36;
  const crte = odsekiZarkov(vzorec, L, h, 0.15, 0)
    .map(([x1, v1, x2, v2]) => `<line x1="${ox + x1 * s}" y1="${oy - v1 * s}" x2="${ox + x2 * s}" y2="${oy - v2 * s}"/>`)
    .join('');
  return (
    <svg viewBox="0 0 48 40" width="48" height="40" aria-hidden style={{ display: 'block' }}
      dangerouslySetInnerHTML={{ __html: `<g stroke="${barva}" stroke-width="1.3" stroke-linecap="round">${crte}</g><rect x="${ox}" y="${oy - h * s}" width="${L * s}" height="${h * s}" fill="none" stroke="${barva}" stroke-width="2.2"/>` }} />
  );
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
  gumb,
  enota,
}: {
  oznaka: string;
  vrednost: number;
  nastavi: (v: number) => void;
  min: number;
  max: number;
  korak: number;
  /** korak gumbov − / + (npr. 0,5 m); brez njega ni gumbov */
  gumb?: number;
  enota: string;
}) {
  const decimalke = korak < 0.1 ? 2 : korak < 1 ? 1 : 0;
  const zapis = (v: number) => String(+v.toFixed(decimalke)).replace('.', ',');
  const [tekst, setTekst] = useState(zapis(vrednost));
  useEffect(() => setTekst(zapis(vrednost)), [vrednost]); // eslint-disable-line react-hooks/exhaustive-deps
  const omeji = (v: number) => +Math.min(max, Math.max(min, Math.round(v / korak) * korak)).toFixed(decimalke);
  const potrdi = (t: string) => {
    const v = Number(t.replace(',', '.'));
    if (Number.isFinite(v)) nastavi(omeji(v));
    else setTekst(zapis(vrednost));
  };
  // gumba skočita na naslednjo okroglo vrednost (7,3 → 7,5 → 8,0)
  const premakni = (smer: 1 | -1) => {
    if (!gumb) return;
    const naslednja = smer > 0 ? Math.floor(vrednost / gumb + 1e-6) * gumb + gumb : Math.ceil(vrednost / gumb - 1e-6) * gumb - gumb;
    nastavi(omeji(naslednja));
  };
  const id = `mera-${oznaka.replace(/\W+/g, '-')}`;
  return (
    <div className={s.mera}>
      <div className={s.meraGlava}>
        <label htmlFor={id} className={s.meraOznaka}>{oznaka}</label>
        <span className={s.meraRazpon}>{zapis(min)}–{zapis(max)} {enota}</span>
      </div>
      <div className={s.meraVrstica} data-gumbi={gumb ? '' : undefined}>
        <input
          type="range"
          min={min}
          max={max}
          step={korak}
          value={vrednost}
          onChange={(e) => nastavi(omeji(+e.target.value))}
          aria-label={`${oznaka} (drsnik)`}
          className={s.drsnik}
          style={{ ['--p' as string]: `${((vrednost - min) / (max - min)) * 100}%` }}
        />
        <span className={s.meraKontrole}>
          {gumb ? (
            <button type="button" className={s.meraGumb} onClick={() => premakni(-1)} disabled={vrednost <= min} aria-label={`${oznaka}: manj za ${zapis(gumb)} ${enota}`}>
              <Minus size={14} weight="bold" aria-hidden />
            </button>
          ) : null}
          <span className={s.meraVnos}>
            <input
              id={id}
              className="vnos"
              inputMode="decimal"
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              onBlur={(e) => potrdi(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') potrdi((e.target as HTMLInputElement).value);
                if (gumb && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                  e.preventDefault();
                  premakni(e.key === 'ArrowUp' ? 1 : -1);
                }
              }}
            />
            <span className={s.enota}>{enota}</span>
          </span>
          {gumb ? (
            <button type="button" className={s.meraGumb} onClick={() => premakni(1)} disabled={vrednost >= max} aria-label={`${oznaka}: več za ${zapis(gumb)} ${enota}`}>
              <Plus size={14} weight="bold" aria-hidden />
            </button>
          ) : null}
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
  // opozorilo, ko obiskovalec izbere nekaj, kar se izključuje (stranske stene in stranski konzoli)
  const [napakaNs, setNapakaNs] = useState<'stene' | 'konzole' | null>(null);
  const [ns, setNs] = useState<NadstresekStanje>(privzetNadstresek);
  const [nalozeno, setNalozeno] = useState(false);
  const [pogled3d, setPogled3d] = useState(false);

  // na računalniku z miško se konfigurator odpre v 3D, na telefonu z lažjo risbo (3D je en klik stran)
  useEffect(() => {
    if (window.matchMedia('(min-width: 1000px) and (pointer: fine)').matches) setPogled3d(true);
  }, []);

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
        // vsaka vrsta ima svoj smiseln razpon dolžine; ob menjavi vzamemo tipično dolžino za to vrsto
        if (t !== o.tip) {
          n.dolzina = dolzinaZaTip[t].privzeto;
          n.razmikStebrov = razmikStebrovZaTip[t].privzeto;
        }
        // zunanje ograje so brez jekla
        if (!materialiZaTip(t).some((m) => m.id === n.material)) n.material = 'aluminij';
      }
      // lesene deske: na balkonu običajno vodoravne, pri dvoriščnih ograjah pokončne
      if (k === 'polnilo' && v === 'les' && o.polnilo !== 'les') n.smerLesa = n.tip === 'balkonska' ? 'vodoravne' : 'navpicne';
      // vsako polnilo ima svoj tipičen razmik letvic
      if ((k === 'tip' || k === 'polnilo') && n.polnilo !== o.polnilo) n.razmikPolnila = razmikPolnilaZaPolnilo[n.polnilo]?.privzeto ?? 0;
      // šipka ostane med četrtino in polovico višine
      if (k === 'zakljucek' && v === 'odprto' && o.zakljucek !== 'odprto') n.sipka = sipkaPrivzeto(n.visina);
      const sr = sipkaRazpon(n.visina);
      if (k === 'visina' || k === 'tip') n.sipka = Math.min(sr.max, Math.max(sr.min, n.sipka));
      return n;
    });
  const posodobiNs = <K extends keyof NadstresekStanje>(k: K, v: NadstresekStanje[K]) =>
    setNs((o) => {
      const n = { ...o, [k]: v };
      // sendvič panel samo pri enokapnici, folija samo pri boxu
      if (!kritineZaTip[n.tip].includes(n.kritina)) n.kritina = kritineZaTip[n.tip][0];
      return n;
    });

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
        podest: jeStopnisce(og.tip) ? og.podest : 0,
        visina: og.visina,
        barva: ralHex(og.ral),
        montaza: montazeZaTip[og.tip].length ? og.montaza : 'vrh',
        vrata: og.tip === 'dvoriscna' ? og.vrata : 'brez',
        sirinaVrat: og.sirinaVrat,
        osebniPrehod: og.tip === 'dvoriscna' && og.osebniPrehod,
        pogon: og.pogon && og.vrata !== 'brez',
        razmikStebrov: og.razmikStebrov,
        razmikPolnila: og.razmikPolnila,
        zakljucek: imaZakljucek(og.polnilo) ? og.zakljucek : 'rocaj',
        vzorec: og.vzorec,
        zarki: og.zarki,
        smerLesa: og.smerLesa,
        rocaj: imaLesenRocaj(og.tip) ? og.rocaj : 'kovina',
        sipka: Math.min(Math.max(og.sipka, sipkaRazpon(og.visina).min), sipkaRazpon(og.visina).max),
        podaljsek: naPlosci(og.tip) && og.montaza === 'stran' ? og.podaljsek : 0,
        id: 'konf-og',
        h: og.tip === 'dvoriscna' ? 400 : naPlosci(og.tip) ? 430 : 560,
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
      stranZadaj: ns.stranZadaj && ns.postavitev === 'samostojen',
      stenaTip: ns.stenaTip,
      stenaSmer: ns.stenaSmer,
      konzole: konzoleVklopljene(ns),
      lesenStrop: ns.lesenStrop && imaLesenStrop(ns.kritina),
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
          ['Mere', jeStopnisce(og.tip) ? `${m(og.dolzina)} + ${m(og.podest)} = ${m(skupnaDolzina(og))} m × ${og.visina} cm` : `${m(og.dolzina)} m × ${og.visina} cm`],
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
          ['Stene', [ns.stranLevo && 'levo', ns.stranDesno && 'desno', ns.stranZadaj && ns.postavitev === 'samostojen' && 'zadaj'].filter(Boolean).join(', ') || 'brez'],
          ...(konzoleVklopljene(ns) ? [['Stebri', 'ob straneh, nazaj, s trikotnima konzolama'] as [string, string]] : []),
          ...(ns.lesenStrop && imaLesenStrop(ns.kritina) ? [['Strop', 'lesena obloga'] as [string, string]] : []),
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
        <Link className={s.poMeriPovezava} href="/kontakt?izdelek=Drugo&po-meri=1#povprasevanje">
          Ne najdete ustreznega izdelka? <strong>Povpraševanje po meri</strong>
        </Link>
      </div>

      <div className={`wrap ${s.mreza}`}>
        {/* ---------- risba (lepljiva) ---------- */}
        <div className={s.risbaStolpec}>
          <div className={s.risbaLepljiva}>
            <div className={s.pogledi} role="group" aria-label="Prikaz">
              <button type="button" aria-pressed={!pogled3d} onClick={() => setPogled3d(false)}>
                <PencilRuler size={16} weight="bold" aria-hidden /> Risba
              </button>
              <button type="button" aria-pressed={pogled3d} onClick={() => setPogled3d(true)}>
                <Cube size={16} weight="bold" aria-hidden /> 3D pogled
              </button>
            </div>
            {pogled3d ? (
              <div className={s.okvir3d}>
                {izdelek === 'ograja' ? <Scena3D izdelek="ograja" ograja={og} /> : <Scena3D izdelek="nadstresek" nadstresek={ns} />}
              </div>
            ) : (
              <div className={`platno ${s.platno}`} aria-live="polite">
                <div key={iskanje} className={s.risba} dangerouslySetInnerHTML={{ __html: risba }} />
              </div>
            )}
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
                {og.polnilo === 'les' ? (
                  <>
                    <p className={s.podnaslov}>Smer desk</p>
                    <Kartice ime="deske" moznosti={smeriLesa} vrednost={og.smerLesa} nastavi={(v) => posodobiOg('smerLesa', v)} />
                    <p className={`small muted ${s.opomba}`}>Deske so v kovinskem okvirju v barvi ograje. Druge barve lesa dodamo kmalu.</p>
                  </>
                ) : null}
                {imaLesenRocaj(og.tip) && !(imaZakljucek(og.polnilo) && og.zakljucek === 'odprto') ? (
                  <>
                    <p className={s.podnaslov}>Ročaj</p>
                    <Kartice ime="rocaj" moznosti={rocaji} vrednost={og.rocaj} nastavi={(v) => posodobiOg('rocaj', v)} />
                  </>
                ) : null}
                {og.polnilo === 'zarki' ? (
                  <>
                    <p className={s.podnaslov}>Izvedba žarkov</p>
                    <Kartice
                      ime="zarki"
                      moznosti={vzorciZarkov}
                      vrednost={og.zarki}
                      nastavi={(v) => posodobiOg('zarki', v)}
                      ikona={(v) => <ZarkiIkona vzorec={v} barva={barvaIkone(og.ral)} />}
                    />
                  </>
                ) : null}
                {og.polnilo === 'perforirana' ? (
                  <>
                    <p className={s.podnaslov}>Vzorec izreza</p>
                    <Kartice
                      ime="vzorec"
                      moznosti={vzorci}
                      vrednost={og.vzorec}
                      nastavi={(v) => posodobiOg('vzorec', v)}
                      ikona={(v) => <VzorecIkona vzorec={v} barva={barvaIkone(og.ral)} />}
                    />
                    {og.vzorec === 'po-meri' ? (
                      <p className={`small muted ${s.opomba}`}>
                        Motiv izrežemo po vaši skici, fotografiji ali logotipu. Datoteko priložite povpraševanju.
                      </p>
                    ) : null}
                  </>
                ) : null}
                {imaZakljucek(og.polnilo) ? (
                  <>
                    <p className={s.podnaslov}>Zaključek ograje</p>
                    <Kartice ime="zakljucek" moznosti={zakljucki} vrednost={og.zakljucek} nastavi={(v) => posodobiOg('zakljucek', v)} />
                    {og.zakljucek === 'odprto' ? (
                      <Mera
                        oznaka="Višina vezne palice"
                        vrednost={Math.min(Math.max(og.sipka, sipkaRazpon(og.visina).min), sipkaRazpon(og.visina).max)}
                        nastavi={(v) => posodobiOg('sipka', v)}
                        min={sipkaRazpon(og.visina).min}
                        max={sipkaRazpon(og.visina).max}
                        korak={1}
                        gumb={5}
                        enota="cm"
                      />
                    ) : null}
                  </>
                ) : null}
              </Korak>

              <Korak st={++st} naslov="Razporeditev" namig="Razmik med nosilnimi stebri in med polnilom. Pri balkonih in stopniščih je največji dovoljeni svetli razmik 10 cm; skladnost s predpisi preverimo ob izmeri.">
                {imaZakljucek(og.polnilo) && og.zakljucek === 'odprto' ? (
                  <p className={`small muted ${s.opomba}`}>Izvedba brez zgornjega ročaja nima ločenih stebrov: vse palice so enakega prereza (40 × 40 mm) in nosilne.</p>
                ) : (
                <Mera
                  oznaka="Razmik nosilnih stebrov"
                  vrednost={og.razmikStebrov}
                  nastavi={(v) => posodobiOg('razmikStebrov', v)}
                  min={razmikStebrovZaTip[og.tip].min}
                  max={razmikStebrovZaTip[og.tip].max}
                  korak={0.1}
                  gumb={0.1}
                  enota="m"
                />
                )}
                {razmikPolnilaZaPolnilo[og.polnilo] ? (
                  <Mera
                    oznaka={razmikPolnilaZaPolnilo[og.polnilo]!.oznaka}
                    vrednost={og.razmikPolnila}
                    nastavi={(v) => posodobiOg('razmikPolnila', v)}
                    min={razmikPolnilaZaPolnilo[og.polnilo]!.min}
                    max={razmikPolnilaZaPolnilo[og.polnilo]!.max}
                    korak={razmikPolnilaZaPolnilo[og.polnilo]!.korak}
                    gumb={razmikPolnilaZaPolnilo[og.polnilo]!.korak}
                    enota="cm"
                  />
                ) : null}
                {og.tip !== 'dvoriscna' && razmikPolnilaZaPolnilo[og.polnilo] && og.razmikPolnila > 10 ? (
                  <p className={`small ${s.opozorilo}`} role="status">
                    Svetli razmik nad 10 cm ni skladen s predpisi za balkone in stopnišča. Primeren je za dekorativne in vrtne ograje.
                  </p>
                ) : null}
              </Korak>

              <Korak st={++st} naslov="Mere" namig="Približne mere so dovolj. Natančno izmerimo na objektu.">
                <Mera
                  oznaka={jeStopnisce(og.tip) ? 'Dolžina ob stopnicah' : 'Dolžina ograje'}
                  vrednost={og.dolzina}
                  nastavi={(v) => posodobiOg('dolzina', v)}
                  min={dolzinaZaTip[og.tip].min}
                  max={dolzinaZaTip[og.tip].max}
                  korak={0.1}
                  gumb={0.5}
                  enota="m"
                />
                {jeStopnisce(og.tip) && (
                  <Mera
                    oznaka={og.tip === 'stopniscna-notranja' ? 'Dolžina ob zgornji etaži' : 'Dolžina na podestu'}
                    vrednost={og.podest}
                    nastavi={(v) => posodobiOg('podest', v)}
                    min={podestRazpon.min}
                    max={podestRazpon.max}
                    korak={0.1}
                    gumb={0.5}
                    enota="m"
                  />
                )}
                {jeStopnisce(og.tip) && (
                  <p className={`small ${s.skupaj}`}>
                    Skupaj <strong>{m(skupnaDolzina(og))} m</strong> ograje
                  </p>
                )}
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
                  <Kartice ime="vrata" moznosti={vrataMoznosti} vrednost={og.vrata} nastavi={(v) => posodobiOg('vrata', v)} stolpci={2} />
                  {og.vrata !== 'brez' ? (
                    <Mera oznaka="Širina vrat" vrednost={og.sirinaVrat} nastavi={(v) => posodobiOg('sirinaVrat', v)} min={1} max={8} korak={0.1} enota="m" />
                  ) : null}
                  <div className={s.stikala}>
                    <label className="potrditev">
                      <input type="checkbox" checked={og.osebniPrehod} onChange={(e) => posodobiOg('osebniPrehod', e.target.checked)} />
                      <span><strong>Osebni prehod</strong> v enaki izvedbi polnila</span>
                    </label>
                    {og.vrata !== 'brez' ? (
                      <label className="potrditev">
                        <input type="checkbox" checked={og.pogon} onChange={(e) => posodobiOg('pogon', e.target.checked)} />
                        <span><strong>Avtomatski pogon</strong> s fotocelico, daljinskim upravljalnikom in signalno lučjo</span>
                      </label>
                    ) : null}
                  </div>
                </Korak>
              ) : null}

              {montazeZaTip[og.tip].length ? (
                <Korak st={++st} naslov="Montaža">
                  <Kartice ime="montaza" moznosti={montazeZaTip[og.tip]} vrednost={og.montaza} nastavi={(v) => posodobiOg('montaza', v)} />
                  {naPlosci(og.tip) && og.montaza === 'stran' ? (
                    <>
                      <p className={`small muted ${s.opomba}`}>
                        Na čelo balkonske plošče namestimo nosilni profil v barvi ograje, nanj pa montiramo ograjo.
                      </p>
                      <Mera
                        oznaka="Podaljšek pod nivo tal"
                        vrednost={og.podaljsek}
                        nastavi={(v) => posodobiOg('podaljsek', v)}
                        min={podaljsekRazpon.min}
                        max={podaljsekRazpon.max}
                        korak={1}
                        gumb={5}
                        enota="cm"
                      />
                      <p className={`small muted ${s.opomba}`}>
                        Pri 0 cm je spodnji rob ograje v ravnini tal balkona. Podaljšek navzdol prekrije čelo plošče.
                      </p>
                    </>
                  ) : null}
                </Korak>
              ) : null}

              <Korak st={++st} naslov="Material in barva">
                <Kartice ime="material" moznosti={materialiZaTip(og.tip)} vrednost={og.material} nastavi={(v) => posodobiOg('material', v)} stolpci={materialiZaTip(og.tip).length} />
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
              <Korak st={++st} naslov="Mere" namig="Za en avto zadošča približno 3 × 5,5 m, za dva 5,5 × 5,5 m. Od širine 6 m dalje dodamo vmesni steber. Pri boxu ob objektu lahko stebra pomaknemo nazaj in jima dodamo stranski konzoli.">
                <Mera oznaka="Širina" vrednost={ns.sirina} nastavi={(v) => posodobiNs('sirina', v)} min={2} max={12} korak={0.1} enota="m" />
                <Mera oznaka="Globina" vrednost={ns.globina} nastavi={(v) => posodobiNs('globina', v)} min={1.5} max={8} korak={0.1} enota="m" />
                <Mera oznaka="Svetla višina" vrednost={ns.visina} nastavi={(v) => posodobiNs('visina', v)} min={2.1} max={3.2} korak={0.05} enota="m" />
                {imaKonzole(ns) ? (
                  <>
                    <div className={s.stikala}>
                      <label className="potrditev">
                        <input
                          type="checkbox"
                          checked={konzoleVklopljene(ns)}
                          aria-invalid={napakaNs === 'konzole' || undefined}
                          onChange={(e) => {
                            if (e.target.checked && (ns.stranLevo || ns.stranDesno)) return setNapakaNs('konzole');
                            setNapakaNs(null);
                            posodobiNs('konzole', e.target.checked);
                          }}
                        />
                        <span><strong>Stranski konzoli, brez stebrov spredaj</strong></span>
                      </label>
                    </div>
                    <p className={`small muted ${s.opomba}`}>
                      Stebra ob straneh postavimo blizu objekta, streha pa brez stebrov sega daleč naprej (velik previs, spredaj popolnoma prost prehod). Previs nosi trikotna konzola na vrhu vsakega stebra, vzdolž stranice: okvir iz {ns.material === 'aluminij' ? 'aluminija' : ns.material === 'inox' ? 'inoxa' : 'jekla'} v barvi konstrukcije, notri lesena obloga.
                    </p>
                    {napakaNs === 'konzole' ? (
                      <p className={s.napakaIzbire} role="alert">
                        Stranskih konzol ni mogoče dodati, ker so izbrane stranske stene. Najprej v koraku Stranske stene odstranite stene.
                      </p>
                    ) : null}
                  </>
                ) : null}
              </Korak>
              <Korak st={++st} naslov="Kritina">
                <Kartice ime="ns-kritina" moznosti={kritine.filter((k) => kritineZaTip[ns.tip].includes(k.id))} vrednost={ns.kritina} nastavi={(v) => posodobiNs('kritina', v)} stolpci={3} />
                {imaLesenStrop(ns.kritina) ? (
                  <div className={s.stikala}>
                    <label className="potrditev">
                      <input type="checkbox" checked={ns.lesenStrop} onChange={(e) => posodobiNs('lesenStrop', e.target.checked)} />
                      <span><strong>Lesena obloga stropa</strong>: lesene letvice pod kritino</span>
                    </label>
                  </div>
                ) : null}
              </Korak>
              <Korak st={++st} naslov="Stene" namig={`Lamele ali lesena obloga v kovinskem okvirju, razdeljeni na prekate po ${String(PREKAT).replace('.', ',')} m. Samostojen nadstrešek lahko zaprete tudi zadaj.`}>
                <div className={s.stikala}>
                  <label className="potrditev">
                    <input type="checkbox" checked={ns.stranLevo} aria-invalid={napakaNs === 'stene' || undefined} onChange={(e) => {
                      if (e.target.checked && konzoleVklopljene(ns)) return setNapakaNs('stene');
                      setNapakaNs(null);
                      posodobiNs('stranLevo', e.target.checked);
                    }} />
                    <span><strong>Levo</strong></span>
                  </label>
                  <label className="potrditev">
                    <input type="checkbox" checked={ns.stranDesno} aria-invalid={napakaNs === 'stene' || undefined} onChange={(e) => {
                      if (e.target.checked && konzoleVklopljene(ns)) return setNapakaNs('stene');
                      setNapakaNs(null);
                      posodobiNs('stranDesno', e.target.checked);
                    }} />
                    <span><strong>Desno</strong></span>
                  </label>
                  {ns.postavitev === 'samostojen' ? (
                    <label className="potrditev">
                      <input type="checkbox" checked={ns.stranZadaj} onChange={(e) => posodobiNs('stranZadaj', e.target.checked)} />
                      <span><strong>Zadaj</strong></span>
                    </label>
                  ) : null}
                </div>
                {napakaNs === 'stene' ? (
                  <p className={s.napakaIzbire} role="alert">
                    Stranskih sten ni mogoče dodati, ker so izbrane stranske konzole: stojijo ravno tam, kjer bi bila stena. Če želite stene, najprej v koraku Mere izklopite stranske konzole.
                  </p>
                ) : null}
                {ns.stranLevo || ns.stranDesno || (ns.stranZadaj && ns.postavitev === 'samostojen') ? (
                  <>
                    <Kartice ime="ns-stena" moznosti={steneTipi} vrednost={ns.stenaTip} nastavi={(v) => posodobiNs('stenaTip', v)} stolpci={3} />
                    <Kartice ime="ns-smer" moznosti={steneSmeri} vrednost={ns.stenaSmer} nastavi={(v) => posodobiNs('stenaSmer', v)} />
                  </>
                ) : null}
              </Korak>
              <Korak st={++st} naslov="Material in barva">
                <Kartice
                  ime="ns-material"
                  moznosti={materialiNadstreska}
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
