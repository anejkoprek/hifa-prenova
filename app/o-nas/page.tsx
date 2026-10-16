import type { Metadata } from 'next';
import Link from 'next/link';
import Foto from '@/components/Foto';
import { GlavaPodstrani, Mnenja, PogostaVprasanja, Postopek } from '@/components/Sekcije';
import { izGalerije, ostaleSlike } from '@/lib/galerije';
import { pogostaVprasanja, podjetje } from '@/lib/podjetje';
import s from './o-nas.module.css';

export const metadata: Metadata = {
  title: 'O nas: družinsko podjetje za ograje in nadstreške od leta 1990',
  description:
    'HIFA d.o.o. iz Njiverc pri Kidričevem od leta 1990 izdeluje in montira ograje, nadstreške, stopnišča in kovinske konstrukcije po vsej Sloveniji. Pogosta vprašanja o ponudbi, ogledu in materialih.',
  alternates: { canonical: '/o-nas' },
};

const ldFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: pogostaVprasanja.map((q) => ({ '@type': 'Question', name: q.v, acceptedAnswer: { '@type': 'Answer', text: q.o } })),
};

const nacela = [
  ['Ugodno razmerje', 'Dobro razmerje med vrednostjo in ceno, dolgoletne izkušnje, visoka kakovost in hitra odzivnost.'],
  ['Zanesljivost in natančnost', 'Spoštujemo dogovorjene roke in uporabljamo materiale in postopke, ki so se izkazali kot obstojni.'],
  ['Izdelki po meri', 'Vsak izdelek naredimo za konkretno situacijo, po potrebah in željah naročnika.'],
];

export default function ONas() {
  return (
    <>
      <GlavaPodstrani
        naslov={`Z vami od leta ${podjetje.od}`}
        uvod="HIFA je podjetje iz Njiverc pri Kidričevem. Izdelujemo in montiramo kovinske izdelke za hiše in podjetja po vsej Sloveniji: ograje, nadstreške, stopnišča in konstrukcije."
      />

      <section className="sekcija--ozka" aria-labelledby="zgodba-h">
        <div className={`wrap ${s.zgodba}`}>
          <div className={s.slike}>
            <Foto pot={ostaleSlike.oPodjetju} alt="Nadstrešek in ograja, delo podjetja HIFA" sizes="(min-width: 1000px) 30vw, 60vw" className={s.s1} />
            <Foto pot={izGalerije('ostalo', 9)} alt="Kovinska konstrukcija iz delavnice HIFA" sizes="(min-width: 1000px) 22vw, 40vw" className={s.s2} />
          </div>
          <div className={`prose ${s.besedilo}`}>
            <h2 className="h2" id="zgodba-h">Lasten razvoj, lastna delavnica</h2>
            <p>
              Vsi naši izdelki so plod lastnega razvoja. Tudi način dela smo razvijali sami, skozi desetletja izkušenj. Pri vsakem izdelku se posvetimo vašim željam in potrebam, ga projektiramo za konkretno situacijo in izdelamo po meri.
            </p>
            <p>
              Ponujamo celosten pristop. Pri nas lahko naročite izdelavo in montažo več izdelkov hkrati, na primer balkonsko in dvoriščno ograjo ter nadstrešek, s čimer prihranite čas in znižate strošek investicije.
            </p>
            <p>
              Uporabljamo kakovostne materiale preverjenih dobaviteljev, s katerimi sodelujemo že vrsto let. Zunanje izdelke iz črnega jekla vroče cinkamo in prašno barvamo v želeni barvi po RAL lestvici. Tudi izdelke iz inoxa in aluminija lahko prašno barvamo, da se ujemajo z vsakim okoljem.
            </p>
            <p>
              V letih 2022 in 2023 smo s pomočjo sredstev Evropske unije posodobili proizvodnjo z robotsko varilno celico, laserskim varilnim aparatom, novo tračno žago in programsko opremo za načrtovanje. <Link href="/sofinanciranje">Več o projektu</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="sekcija" aria-labelledby="nacela-h">
        <div className="wrap">
          <h2 className="visually-hidden" id="nacela-h">Kako delamo</h2>
          <dl className={s.nacela}>
            {nacela.map(([n, o]) => (
              <div key={n}>
                <dt className="h3">{n}</dt>
                <dd>{o}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Postopek naslov="Kako poteka sodelovanje" />
      <Mnenja />
      <PogostaVprasanja />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldFaq) }} />
    </>
  );
}
