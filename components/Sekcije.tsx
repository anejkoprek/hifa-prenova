import Link from 'next/link';
import { ArrowRight, Phone, EnvelopeSimple, MapPin, Clock, Quotes } from '@phosphor-icons/react/ssr';
import Foto from './Foto';
import Povprasevanje from './Povprasevanje';
import { mnenja, podjetje, postopek, pogostaVprasanja } from '@/lib/podjetje';
import { steviloSlik } from '@/lib/galerije';
import type { IZDELKI } from '@/lib/povprasevanje';
import { lezeca } from '@/lib/mere';
import s from './Sekcije.module.css';

/** Pet korakov kot črta na gradbenem terminskem planu. Številke tu nosijo zaporedje. */
export function Postopek({ naslov = 'Od fotografije do montaže' }: { naslov?: string }) {
  return (
    <section className={`sekcija ${s.postopek}`} aria-labelledby="postopek-h">
      <div className="wrap">
        <div className={s.glavaSekcije}>
          <h2 className="h2" id="postopek-h">{naslov}</h2>
          <p className="lead">Brez presenečenj: najprej informativna ponudba, končna cena šele po izmeri na objektu.</p>
        </div>
        <ol className={s.koraki}>
          {postopek.map((k, i) => (
            <li key={k.naslov} className={`${s.korak} razkrij`} style={{ transitionDelay: `${i * 70}ms` }}>
              <span className={s.korakSt} aria-hidden>{i + 1}</span>
              <h3 className="h4">{k.naslov}</h3>
              <p>{k.opis}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Mnenja() {
  const [glavno, ...ostala] = mnenja;
  const Podpis = ({ m }: { m: (typeof mnenja)[number] }) => (
    <figcaption className={s.podpis}>
      <span className={s.zacetnica} aria-hidden>{m.ime[0]}</span>
      <span>
        <strong>{m.ime}</strong>
        <span className={s.tema}>{m.tema}</span>
      </span>
    </figcaption>
  );
  return (
    <section className={`sekcija ${s.mnenja}`} aria-labelledby="mnenja-h">
      <div className="wrap">
        <div className={`${s.glavaSekcije} ${s.mnenjaGlava}`}>
          <p className={`napis ${s.oznaka}`}>Mnenja strank</p>
          <h2 className="h2" id="mnenja-h">Zadovoljne stranke so naša najboljša referenca</h2>
          <p className="lead">Nekaj besed strank po zaključeni montaži, zapisanih tako, kot so nam jih poslale.</p>
        </div>
        <div className={s.mnenjaMreza}>
          <figure className={`${s.mnenje} ${s.glavno} razkrij`}>
            <Quotes size={40} weight="fill" aria-hidden className={s.narekovaj} />
            <blockquote><p>{glavno.besedilo}</p></blockquote>
            <Podpis m={glavno} />
          </figure>
          {ostala.map((m, i) => (
            <figure key={m.ime} className={`${s.mnenje} razkrij`} style={{ transitionDelay: `${(i + 1) * 80}ms` }}>
              <Quotes size={26} weight="fill" aria-hidden className={s.narekovaj} />
              <blockquote><p>{m.besedilo}</p></blockquote>
              <Podpis m={m} />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Trak({ slike }: { slike: { pot: string; alt: string }[] }) {
  return (
    <section className={`sekcija--ozka ${s.trakSekcija}`} aria-labelledby="trak-h">
      <div className={`wrap ${s.trakGlava}`}>
        <h2 className="h3" id="trak-h">{steviloSlik} fotografij izvedenih del</h2>
        <Link className="povezava" href="/galerije">
          Odpri galerijo <ArrowRight size={16} weight="bold" aria-hidden />
        </Link>
      </div>
      <ul className={s.trak} tabIndex={0} aria-label="Izbrane fotografije, podrsajte vodoravno">
        {slike.map((t) => (
          <li key={t.pot} data-pokoncna={!lezeca(t.pot) || undefined}>
            <Link href="/galerije" tabIndex={-1}>
              <Foto pot={t.pot} alt={t.alt} sizes="(min-width: 1024px) 28vw, 72vw" okvir={false} style={{ height: '100%' }} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SekcijaPovprasevanje({
  naslov = 'Pošljite fotografijo in mere',
  izdelki,
  uvod = 'Iz fotografije obstoječega stanja in približnih mer pripravimo informativno ponudbo. Na ogled pridemo, ko jo potrdite.',
}: {
  naslov?: string;
  izdelki?: (typeof IZDELKI)[number][];
  uvod?: string;
}) {
  return (
    <section className={`sekcija ${s.pov}`} id="povprasevanje" aria-labelledby="pov-h">
      <div className={`wrap ${s.povMreza}`}>
        <div className={s.povUvod}>
          <h2 className="h2" id="pov-h">{naslov}</h2>
          <p className="lead">{uvod}</p>
          <ul className={s.kontakti}>
            <li><a href={podjetje.telefonHref}><Phone size={22} weight="bold" aria-hidden /><span><strong>{podjetje.telefon}</strong><br /><span className="muted small">Najhitreje, {podjetje.delovniCas}</span></span></a></li>
            <li><a href={`mailto:${podjetje.email}`}><EnvelopeSimple size={22} weight="bold" aria-hidden /><span><strong>{podjetje.email}</strong></span></a></li>
            <li><a href={podjetje.mapsLink} target="_blank" rel="noopener noreferrer"><MapPin size={22} weight="bold" aria-hidden /><span>{podjetje.ulica}<br />{podjetje.kraj}, {podjetje.posta} {podjetje.obcina}</span></a></li>
            <li><span className={s.brezPovezave}><Clock size={22} weight="bold" aria-hidden /><span>{podjetje.delovniCas}</span></span></li>
          </ul>
        </div>
        <div className={s.povObrazec}>
          <Povprasevanje izdelki={izdelki} />
        </div>
      </div>
    </section>
  );
}

export function PogostaVprasanja({ vprasanja = pogostaVprasanja, naslov = 'Pogosta vprašanja' }: { vprasanja?: typeof pogostaVprasanja; naslov?: string }) {
  return (
    <section className="sekcija" aria-labelledby="faq-h">
      <div className={`wrap ${s.faqMreza}`}>
        <h2 className="h2" id="faq-h">{naslov}</h2>
        <div className={s.faq}>
          {vprasanja.map((q) => (
            <details key={q.v} className={s.faqVnos}>
              <summary>
                <span>{q.v}</span>
                <span className={s.plus} aria-hidden />
              </summary>
              <p>{q.o}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Uvod podstrani: naslov, opis in dejanja, z detajlom pročelja, ki ga stran razlaga. */
export function GlavaPodstrani({
  naslov,
  uvod,
  crka,
  children,
}: {
  naslov: string;
  uvod: string;
  crka?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`wrap ${s.glavaPodstrani}`}>
      <div className={s.gpNaslov}>
        {crka ? <span className="detajl detajl--zelen" aria-hidden>{crka}</span> : null}
        <h1 className="display">{naslov}</h1>
      </div>
      <p className="lead">{uvod}</p>
      {children ? <div className={s.gpAkcije}>{children}</div> : null}
    </div>
  );
}
