'use client';

import { MapPin } from '@phosphor-icons/react';
import { shrani, usePrivolitev } from '@/lib/privolitev';
import { podjetje } from '@/lib/podjetje';
import s from './Zemljevid.module.css';

/** Googlov zemljevid se naloži šele po privolitvi, sicer pokažemo naslov in gumb. */
export default function Zemljevid() {
  const p = usePrivolitev();
  if (p?.zemljevid) {
    return (
      <div className={s.okvir}>
        <iframe title="Lokacija delavnice HIFA na zemljevidu" src={podjetje.mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className={s.iframe} />
      </div>
    );
  }
  return (
    <div className={`${s.okvir} ${s.zaslon}`}>
      <MapPin size={36} weight="fill" aria-hidden className={s.ikona} />
      <p className="h4">{podjetje.ulica}, {podjetje.kraj}</p>
      <p className="small muted">Zemljevid nalaga Google, ki pri tem nastavi svoje piškotke.</p>
      <div className={s.gumbi}>
        <button type="button" className="gumb gumb--mal" onClick={() => shrani({ analitika: !!p?.analitika, zemljevid: true })}>
          Prikaži zemljevid
        </button>
        <a className="gumb gumb--mal gumb--obroba" href={podjetje.mapsLink} target="_blank" rel="noopener noreferrer">
          Odpri v Google Zemljevidih
        </a>
      </div>
    </div>
  );
}
