import Link from 'next/link';
import { ArrowRight, Images } from '@phosphor-icons/react/ssr';
import Procelje from '@/components/Procelje';
import Foto from '@/components/Foto';
import ProceljeDetajl from '@/components/ProceljeDetajl';
import type { DelId } from '@/lib/risbe/procelje';
import PrejPotem from '@/components/PrejPotem';
import Stevec from '@/components/Stevec';
import { Mnenja, Postopek, SekcijaPovprasevanje, Trak } from '@/components/Sekcije';
import { bannerji, galerija, izGalerije, vseSlike } from '@/lib/galerije';
import { RAL } from '@/lib/ral';
import s from './page.module.css';

const detajli = [
  {
    crka: 'A',
    naslov: 'Balkonske ograje',
    besedilo:
      'Ograje za balkone in terase iz aluminija, inoxa ali vroče cinkanega jekla. Izberete polnilo, višino in barvo, mi pa poskrbimo, da ograja ustreza tudi varnostnim zahtevam.',
    podatki: [
      ['Polnila', 'palice, letvice, steklo, žarki, pločevina'],
      ['Montaža', 'z vrha ali s strani plošče'],
      ['Višina', 'običajno 100 do 110 cm'],
    ],
    href: '/ograje',
    galerija: 'zunanje-balkonske-ograje',
    slike: [izGalerije('zunanje-balkonske-ograje', 23), izGalerije('zunanje-balkonske-ograje', 49), izGalerije('zunanje-balkonske-ograje', 59)],
    alt: ['Balkonska ograja v antracitni barvi', 'Balkonska ograja z vodoravnimi letvicami', 'Balkonska ograja s polnim polnilom'],
  },
  {
    crka: 'B',
    naslov: 'Nadstreški',
    besedilo:
      'Nadstreški za avtomobile, vhode, terase in balkone. Ob hiši ali samostojni, z jekleno ali aluminijasto konstrukcijo in kritino, ki jo izberete glede na svetlobo in sneg.',
    podatki: [
      ['Kritine', 'kaljeno steklo, polikarbonat, trapezna pločevina, folija'],
      ['Postavitev', 'ob objektu ali samostojen'],
      ['Zaščita', 'vroče cinkanje in prašno barvanje'],
    ],
    href: '/nadstreski',
    galerija: 'nadstreski',
    slike: [izGalerije('nadstreski', 9), izGalerije('nadstreski', 60), izGalerije('nadstreski', 30)],
    alt: ['Nadstrešek s steklom nad teraso', 'Nadstrešek za avtomobil', 'Nadstrešek nad vhodom'],
  },
  {
    crka: 'C',
    naslov: 'Stopnišča in stopniščne ograje',
    besedilo:
      'Zunanja in notranja kovinska stopnišča ter ograje ob stopnicah in podestih. Kovino radi kombiniramo z lesom ali steklom, da stopnišče postane del prostora.',
    podatki: [
      ['Konstrukcija', 'nerjavno jeklo ali cinkano jeklo'],
      ['Stopnice', 'kovinske, lesene ali kamnite'],
      ['Ograja', 'v barvi balkona ali vhodnih vrat'],
    ],
    href: '/stopnisca',
    galerija: 'stopnisca',
    slike: [galerija('zunanje-stopniscne-ograje')!.naslovnica, izGalerije('stopnisca', 22), izGalerije('notranje-ograje', 37)],
    alt: ['Zunanja stopniščna ograja', 'Zunanje kovinsko stopnišče', 'Notranja stopniščna ograja'],
  },
  {
    crka: 'D',
    naslov: 'Dvoriščne ograje in vrata',
    besedilo:
      'Ograja okoli hiše z drsnimi, samonosnimi ali krilnimi vrati in osebnim prehodom. Vrata lahko opremimo s pogonom, fotocelico, daljinskim upravljalnikom in signalno lučjo.',
    podatki: [
      ['Vrata', 'drsna, samonosna, krilna, osebni prehod'],
      ['Pogon', 'z evropskim certifikatom kakovosti'],
      ['Podlaga', 'podzidek ali točkovni temelji'],
    ],
    href: '/ograje#dvoriscne',
    galerija: 'zunanje-dvoriscne-ograje',
    slike: [galerija('zunanje-dvoriscne-ograje')!.naslovnica, izGalerije('zunanje-dvoriscne-ograje', 41), izGalerije('zunanje-dvoriscne-ograje', 57)],
    alt: ['Dvoriščna ograja in vrata', 'Dvoriščna ograja v antracitni barvi', 'Drsna dvoriščna vrata'],
  },
];

const trak = [
  { pot: izGalerije('zunanje-balkonske-ograje', 12), alt: 'Balkonska ograja' },
  { pot: izGalerije('nadstreski', 41), alt: 'Nadstrešek' },
  { pot: izGalerije('notranje-ograje', 18), alt: 'Notranja ograja ob stopnicah' },
  { pot: izGalerije('zunanje-dvoriscne-ograje', 22), alt: 'Dvoriščna ograja' },
  { pot: izGalerije('stopnisca', 8), alt: 'Kovinsko stopnišče' },
  { pot: izGalerije('ostalo', 21), alt: 'Kovinska konstrukcija' },
  { pot: izGalerije('zunanje-balkonske-ograje', 66), alt: 'Balkonska ograja s steklom' },
  { pot: izGalerije('holler-diy', 2), alt: 'Holler DIY drsna vrata z osebnim prehodom' },
];

export default function Domov() {
  return (
    <>
      <Procelje />

      {/* DEJSTVA */}
      <section className={s.dejstva} aria-label="HIFA v številkah">
        <dl className={`wrap ${s.dejstvaMreza}`}>
          <div className="razkrij">
            <dt className="napis">Z vami od leta</dt>
            <dd className={s.stevilka}>1990</dd>
            <dd className={s.dejstvoOpis}>Več kot 35 let ograj, nadstreškov in stopnišč po meri.</dd>
          </div>
          <div className="razkrij" style={{ transitionDelay: '70ms' }}>
            <dt className="napis">Fotografij izvedenih del</dt>
            <dd className={s.stevilka}><Stevec do={vseSlike().length} /></dd>
            <dd className={s.dejstvoOpis}>Ograje, nadstreški in stopnišča, ki stojijo po vsej Sloveniji.</dd>
          </div>
          <div className="razkrij" style={{ transitionDelay: '140ms' }}>
            <dt className="napis">Lastna delavnica</dt>
            <dd className={s.stevilka}>Njiverce</dd>
            <dd className={s.dejstvoOpis}>Robotska varilna celica in laserski varilni aparat.</dd>
          </div>
          <div className="razkrij" style={{ transitionDelay: '210ms' }}>
            <dt className="napis">Barve</dt>
            <dd className={s.stevilka}>vse RAL</dd>
            <dd className={s.dejstvoOpis}>Prašno barvano, zunanje jeklo še vroče cinkano.</dd>
          </div>
        </dl>
      </section>

      {/* DETAJLI A in B: izmenično, C in D: v paru */}
      <div className={s.detajli}>
        {detajli.slice(0, 2).map((d, i) => (
          <section key={d.crka} className={`sekcija ${s.detajl}`} data-obrnjen={i % 2 === 1 || undefined} aria-labelledby={`d-${d.crka}`}>
            <div className={`wrap ${s.dMreza}`}>
              <div className={s.dBesedilo}>
                <h2 className="h2 naslov-detajl" id={`d-${d.crka}`}>
                  <span className="detajl" aria-hidden>{d.crka}</span>
                  {d.naslov}
                </h2>
                <p className={s.dOpis}>{d.besedilo}</p>
                <dl className={s.legenda}>
                  {d.podatki.map(([k, v]) => (
                    <div key={k}>
                      <dt className="napis">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className={s.dPovezave}>
                  <Link className="gumb" href={d.href}>
                    {d.naslov} <ArrowRight size={18} weight="bold" className="puscica" aria-hidden />
                  </Link>
                  <Link className="povezava" href={`/galerije/${d.galerija}`}>
                    <Images size={18} aria-hidden /> {galerija(d.galerija)!.slike.length} fotografij
                  </Link>
                </div>
              </div>
              <div className={`${s.kolaz} razkrij`}>
                <figure className={`${s.plosca} ${s.k1}`}>
                  <Foto pot={d.slike[0]} alt={d.alt[0]} sizes="(min-width: 1000px) 38vw, 92vw" okvir={false} style={{ height: '100%' }} />
                  <figcaption className={`napis ${s.oznakaPlosce}`}>
                    Detajl {d.crka} · {d.naslov}
                  </figcaption>
                </figure>
                <figure className={`${s.plosca} ${s.k2}`}>
                  <Foto pot={d.slike[1]} alt={d.alt[1]} sizes="(min-width: 1000px) 18vw, 45vw" okvir={false} style={{ height: '100%' }} />
                </figure>
                <figure className={`${s.plosca} ${s.k3} ${s.risbaPlosca}`} aria-hidden>
                  <ProceljeDetajl del={d.crka as DelId} />
                  <figcaption className={`napis ${s.oznakaRisbe}`}>{d.crka} · pročelje</figcaption>
                </figure>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className={`sekcija ${s.par}`} aria-label="Stopnišča in dvoriščne ograje">
        <div className={`wrap ${s.parMreza}`}>
          {detajli.slice(2).map((d, i) => (
            <article key={d.crka} className={`${s.parDetajl} razkrij`} style={{ transitionDelay: `${i * 90}ms` }} aria-labelledby={`d-${d.crka}`}>
              <div className={`${s.parSlike} ${s.odkrij}`}>
                <figure className={`${s.plosca} ${s.parFoto}`}>
                  <Foto pot={d.slike[0]} alt={d.alt[0]} sizes="(min-width: 1000px) 44vw, 92vw" okvir={false} style={{ height: '100%' }} />
                  <figcaption className={`napis ${s.oznakaPlosce}`}>Detajl {d.crka}</figcaption>
                </figure>
                <figure className={`${s.plosca} ${s.risbaPlosca} ${s.parRisba}`} aria-hidden>
                  <ProceljeDetajl del={d.crka as DelId} />
                </figure>
              </div>
              <h2 className="h2 naslov-detajl" id={`d-${d.crka}`}>
                <span className="detajl" aria-hidden>{d.crka}</span>
                {d.naslov}
              </h2>
              <p className={s.dOpis}>{d.besedilo}</p>
              <dl className={s.legenda}>
                {d.podatki.map(([k, v]) => (
                  <div key={k}>
                    <dt className="napis">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className={s.dPovezave}>
                <Link className="gumb" href={d.href}>
                  {d.crka === 'C' ? 'Stopnišča' : 'Dvoriščne ograje'} <ArrowRight size={18} weight="bold" className="puscica" aria-hidden />
                </Link>
                <Link className="povezava" href={`/galerije/${d.galerija}`}>
                  <Images size={18} aria-hidden /> {galerija(d.galerija)!.slike.length} fotografij
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* KONSTRUKCIJE IN HOLLER */}
      <section className={s.pas} aria-label="Konstrukcije in vrata Holler DIY">
        <div className={`wrap ${s.pasMreza}`}>
          <Link href="/storitve" className={s.pasKartica}>
            <span className={s.pasSlika}>
              <Foto pot={izGalerije('ostalo', 19)} alt="Kovinska konstrukcija in ograja v lokalu" sizes="(min-width: 900px) 46vw, 92vw" okvir={false} style={{ height: '100%' }} />
            </span>
            <div className={s.pasBesedilo}>
              <span className="h3">Kovinske konstrukcije</span>
              <span>Nosilci, podesti, pohištvo, oprema lokalov. Montiramo tudi izdelke, ki niso kupljeni pri nas.</span>
              <span className={s.pasPovezava}>Konstrukcije <ArrowRight size={16} weight="bold" aria-hidden /></span>
            </div>
          </Link>
          <Link href="/holler-diy" className={s.pasKartica}>
            <span className={s.pasSlika}>
              <Foto pot={bannerji.holler} alt="Aluminijasta drsna vrata Holler DIY" sizes="(min-width: 900px) 46vw, 92vw" okvir={false} style={{ height: '100%' }} />
            </span>
            <div className={s.pasBesedilo}>
              <span className="h3">Vrata in ograje Holler DIY</span>
              <span>Avstrijska aluminijasta vrata s pogonom, skritim v stebru. Svetujemo, izmerimo in montiramo.</span>
              <dl className={s.pasPodatki}>
                <div><dt className="napis">Drsna samonosna</dt><dd>do 6 × 2 m</dd></div>
                <div><dt className="napis">Krilna</dt><dd>do 4,34 × 2 m</dd></div>
                <div><dt className="napis">Certifikat</dt><dd>CE EN 13241-1</dd></div>
              </dl>
              <span className={s.pasPovezava}>Holler DIY <ArrowRight size={16} weight="bold" aria-hidden /></span>
            </div>
          </Link>
        </div>
      </section>

      {/* PREJ / POTEM */}
      <section className="sekcija" aria-labelledby="pp-h">
        <div className={`wrap ${s.ppMreza}`}>
          <div className={s.ppBesedilo}>
            <h2 className="h2" id="pp-h">Prej in potem</h2>
            <p className="lead">Povlecite črto čez fotografijo. Tako je bilo pred montažo in tako je danes.</p>
            <Link className="povezava" href="/galerije/prej-potem">
              Vsi projekti prej in potem <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
          </div>
          <PrejPotem />
        </div>
      </section>

      <Postopek />

      {/* MATERIALI IN BARVA */}
      <section className="sekcija" aria-labelledby="mat-h">
        <div className={`wrap ${s.matMreza}`}>
          <div className={s.matBesedilo}>
            <h2 className="h2" id="mat-h">Narejeno, da zdrži desetletja</h2>
            <p className="lead">
              Vse načrtujemo in izdelamo v lastni delavnici. Zunanje izdelke iz črnega jekla vroče cinkamo in nato prašno barvamo, inox in aluminij prav tako prašno barvamo, v katerikoli barvi po RAL lestvici.
            </p>
            <p className="muted">
              Za natančnejše in hitrejše delo smo delavnico opremili z robotsko varilno celico in laserskim varilnim aparatom.
            </p>
          </div>
          <div className={s.karta} aria-label="Najpogostejše barve po RAL lestvici">
            {RAL.map((r, i) => (
              <div key={r.koda} className={`${s.trakBarve} razkrij`} style={{ ['--sw' as string]: r.hex, transitionDelay: `${i * 50}ms` }}>
                <span className={s.barva} />
                <span className={s.ralKoda}>RAL {r.koda}</span>
                <span className={s.ralIme}>{r.ime}</span>
              </div>
            ))}
            <p className={`small muted ${s.kartaOpomba}`}>in vse ostale barve RAL lestvice</p>
          </div>
        </div>
      </section>

      <Mnenja />
      <Trak slike={trak} />
      <SekcijaPovprasevanje />
    </>
  );
}
