import type { Metadata } from 'next';
import { GlavaPodstrani } from '@/components/Sekcije';
import NastavitvePiskotkov from '@/components/NastavitvePiskotkov';
import { podjetje } from '@/lib/podjetje';
import s from './pravno.module.css';

export const metadata: Metadata = {
  title: 'Zasebnost in piškotki',
  description: 'Kako HIFA d.o.o. obdeluje osebne podatke iz povpraševanj in katere piškotke uporablja spletna stran.',
  alternates: { canonical: '/pravno-obvestilo' },
};

export default function Pravno() {
  return (
    <>
      <GlavaPodstrani naslov="Zasebnost in piškotki" uvod="Vaše podatke uporabimo samo za to, da vam odgovorimo in pripravimo ponudbo. Analitiko in zemljevid naložimo samo z vašo privolitvijo." />
      <div className={`wrap ${s.mreza}`}>
        <nav className={s.kazalo} aria-label="Vsebina">
          <ul>
            <li><a href="#upravljavec">Upravljavec</a></li>
            <li><a href="#povprasevanja">Povpraševanja</a></li>
            <li><a href="#hramba">Hramba</a></li>
            <li><a href="#pravice">Vaše pravice</a></li>
            <li><a href="#piskotki">Piškotki</a></li>
          </ul>
        </nav>
        <div className="prose">
          <h2 className="h3" id="upravljavec">Upravljavec osebnih podatkov</h2>
          <p>
            {podjetje.ime}, {podjetje.ulica}, {podjetje.kraj}, {podjetje.posta} {podjetje.obcina}. Telefon {podjetje.telefon}, e-pošta{' '}
            <a href={`mailto:${podjetje.email}`}>{podjetje.email}</a>.
          </p>

          <h2 className="h3" id="povprasevanja">Povpraševanja in konfigurator</h2>
          <p>
            Ko pošljete povpraševanje, prek obrazca ali na koncu konfiguratorja, obdelujemo ime in priimek, telefon, e-pošto, kraj montaže, mere, sporočilo, izbiro iz konfiguratorja in priložene fotografije ali načrte. Podatke potrebujemo, da vam odgovorimo, pripravimo informativno in končno ponudbo ter se dogovorimo za ogled. Pravna podlaga je vaša privolitev in ukrepi pred sklenitvijo pogodbe na vašo zahtevo.
          </p>
          <p>Podatkov ne uporabljamo za druge namene in jih ne posredujemo tretjim osebam, razen ponudnikom, ki za nas zagotavljajo gostovanje spletne strani in e-pošte.</p>

          <h2 className="h3" id="hramba">Hramba</h2>
          <p>
            Povpraševanja, iz katerih ni nastalo naročilo, hranimo največ dve leti. Podatke o naročilih hranimo toliko časa, kot to zahtevajo predpisi o računovodstvu in garanciji.
          </p>

          <h2 className="h3" id="pravice">Vaše pravice</h2>
          <p>
            Kadarkoli lahko zahtevate dostop do svojih podatkov, popravek, izbris, omejitev obdelave ali prenos, in prekličete privolitev. Pišite na <a href={`mailto:${podjetje.email}`}>{podjetje.email}</a>. Če menite, da kršimo predpise, se lahko pritožite pri Informacijskem pooblaščencu (ip-rs.si).
          </p>

          <h2 className="h3" id="piskotki">Piškotki</h2>
          <p>Ob prvem obisku vas vprašamo za privolitev. Izbiro lahko kadarkoli spremenite: <NastavitvePiskotkov />.</p>
          <div className={s.tabela} role="region" aria-label="Piškotki na strani" tabIndex={0}>
            <table>
              <thead>
                <tr><th>Vrsta</th><th>Ime</th><th>Namen</th><th>Trajanje</th></tr>
              </thead>
              <tbody>
                <tr><td>Nujni</td><td>hifa-piskotki-v1 (lokalna shramba)</td><td>Zapomni si vašo izbiro piškotkov</td><td>do izbrisa</td></tr>
                <tr><td>Analitika (s privolitvijo)</td><td>_ga, _ga_*</td><td>Google Analytics: anonimna statistika obiska</td><td>do 2 leti</td></tr>
                <tr><td>Zemljevid (s privolitvijo)</td><td>piškotki Google</td><td>Prikaz Googlovega zemljevida na strani Kontakt</td><td>po pravilih Googla</td></tr>
              </tbody>
            </table>
          </div>
          <p className="small muted">Osnutek besedila. Pred objavo naj ga HIFA preveri in dopolni s svojimi postopki.</p>
        </div>
      </div>
    </>
  );
}
