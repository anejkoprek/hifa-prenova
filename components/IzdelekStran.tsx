import Link from 'next/link';
import { ArrowRight, Images, SlidersHorizontal } from '@phosphor-icons/react/ssr';
import Foto from './Foto';
import Galerija from './Galerija';
import ProceljeDetajl from './ProceljeDetajl';
import { Postopek, SekcijaPovprasevanje } from './Sekcije';
import { galerija, slikeGalerije } from '@/lib/galerije';
import type { IZDELKI } from '@/lib/povprasevanje';
import type { DelId } from '@/lib/risbe/procelje';
import s from './IzdelekStran.module.css';

export type Vsebina = { id?: string; naslov: string; odstavki: React.ReactNode[]; legenda?: [string, string][] };

type Props = {
  crka?: DelId;
  naslov: string;
  uvod: string;
  banner: string;
  bannerAlt: string;
  konfigurator?: string;
  vsebina: Vsebina[];
  galerije: string[];
  izdelki: (typeof IZDELKI)[number][];
  dodatek?: React.ReactNode;
};

export default function IzdelekStran({ crka, naslov, uvod, banner, bannerAlt, konfigurator, vsebina, galerije, izdelki, dodatek }: Props) {
  const slike = galerije.flatMap((g) => slikeGalerije(galerija(g)!));
  return (
    <>
      <header className={`wrap ${s.glava}`}>
        <div className={s.glavaBesedilo}>
          <nav aria-label="Drobtine" className={`napis ${s.drobtine}`}>
            <Link href="/">Domov</Link> <span aria-hidden>/</span> <span aria-current="page">{naslov}</span>
          </nav>
          <h1 className={`display ${s.naslov}`}>
            {crka ? <span className="detajl detajl--zelen" aria-hidden>{crka}</span> : null}
            {naslov}
          </h1>
          <p className="lead">{uvod}</p>
          <div className={s.akcije}>
            {konfigurator ? (
              <Link className="gumb gumb--zelen" href={konfigurator}>
                <SlidersHorizontal size={18} weight="bold" aria-hidden /> Oblikujte v konfiguratorju
              </Link>
            ) : null}
            <Link className={`gumb ${konfigurator ? 'gumb--obroba' : 'gumb--zelen'}`} href="#povprasevanje">
              Pošljite povpraševanje
            </Link>
          </div>
        </div>
        {crka ? (
          <div className={s.izsek}>
            <ProceljeDetajl del={crka} />
            <p className="napis muted">Detajl {crka} na pročelju</p>
          </div>
        ) : null}
      </header>

      <div className={s.banner}>
        <Foto pot={banner} alt={bannerAlt} sizes="100vw" prioriteta okvir={false} style={{ height: '100%' }} />
      </div>

      <div className={`wrap ${s.vsebina}`}>
        {vsebina.map((v) => (
          <section key={v.naslov} id={v.id} className={s.blok} aria-labelledby={`b-${v.id ?? v.naslov}`}>
            <h2 className="h3" id={`b-${v.id ?? v.naslov}`}>{v.naslov}</h2>
            <div className={s.blokTelo}>
              <div className="prose">
                {v.odstavki.map((o, i) => (
                  <p key={i}>{o}</p>
                ))}
              </div>
              {v.legenda ? (
                <dl className={s.legenda}>
                  {v.legenda.map(([k, val]) => (
                    <div key={k}>
                      <dt className="napis">{k}</dt>
                      <dd>{val}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </section>
        ))}
        {dodatek}
      </div>

      <section className={`sekcija ${s.galerijaSekcija}`} aria-labelledby="g-h">
        <div className="wrap">
          <div className={s.galerijaGlava}>
            <h2 className="h2" id="g-h">Izvedena dela</h2>
            <ul className={s.galerijeSeznam}>
              {galerije.map((g) => {
                const x = galerija(g)!;
                return (
                  <li key={g}>
                    <Link className="povezava" href={`/galerije/${g}`}>
                      <Images size={18} aria-hidden /> {x.naziv} <span className="muted">({x.slike.length})</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <Galerija slike={slike} zacetno={9} />
        </div>
      </section>

      <Postopek />
      <SekcijaPovprasevanje izdelki={izdelki} />
      {konfigurator ? (
        <div className={`wrap ${s.konfPas}`}>
          <p className="h4">Bi raje sami preizkusili polnila, mere in barve?</p>
          <Link className="gumb" href={konfigurator}>
            Odpri konfigurator <ArrowRight size={18} weight="bold" className="puscica" aria-hidden />
          </Link>
        </div>
      ) : null}
    </>
  );
}
