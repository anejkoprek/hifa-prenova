import type { Metadata } from 'next';
import { Phone, EnvelopeSimple, Clock, FacebookLogo } from '@phosphor-icons/react/ssr';
import Povprasevanje from '@/components/Povprasevanje';
import Zemljevid from '@/components/Zemljevid';
import { GlavaPodstrani } from '@/components/Sekcije';
import { podjetje } from '@/lib/podjetje';
import s from './kontakt.module.css';

export const metadata: Metadata = {
  title: 'Kontakt in povpraševanje',
  description: `Pošljite povpraševanje s fotografijami in merami ali pokličite ${podjetje.telefon}. HIFA d.o.o., ${podjetje.ulica}, ${podjetje.kraj}, ${podjetje.posta} ${podjetje.obcina}.`,
  alternates: { canonical: '/kontakt' },
};

export default function Kontakt() {
  return (
    <>
      <GlavaPodstrani
        naslov="Kontakt in povpraševanje"
        uvod="Najhitreje vam pomagamo po telefonu. Za informativno ponudbo pošljite fotografijo obstoječega stanja, sliko želenega izdelka, približne mere in kraj montaže."
      />
      <div className={`wrap ${s.mreza}`}>
        <section id="povprasevanje" className={s.obrazec} aria-labelledby="pov-h">
          <h2 className="h3" id="pov-h">Povpraševanje</h2>
          <Povprasevanje />
        </section>
        <aside className={s.stranski} aria-label="Kontaktni podatki">
          <a className={s.velik} href={podjetje.telefonHref}>
            <Phone size={26} weight="bold" aria-hidden />
            <span>{podjetje.telefon}</span>
          </a>
          <a className={s.velik} href={`mailto:${podjetje.email}`}>
            <EnvelopeSimple size={26} weight="bold" aria-hidden />
            <span>{podjetje.email}</span>
          </a>
          <dl className={s.podatki}>
            <div><dt className="napis">Delovni čas</dt><dd><Clock size={16} aria-hidden /> {podjetje.delovniCas}</dd></div>
            <div><dt className="napis">Delavnica</dt><dd>{podjetje.ime}<br />{podjetje.ulica}<br />{podjetje.kraj}, {podjetje.posta} {podjetje.obcina}</dd></div>
            <div><dt className="napis">Območje</dt><dd>vsa Slovenija, fizične in pravne osebe</dd></div>
            <div><dt className="napis">Družbena omrežja</dt><dd><a href={podjetje.facebook} target="_blank" rel="noopener noreferrer"><FacebookLogo size={16} weight="fill" aria-hidden /> Facebook</a></dd></div>
          </dl>
          <Zemljevid />
        </aside>
      </div>
    </>
  );
}
