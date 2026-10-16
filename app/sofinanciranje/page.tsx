import type { Metadata } from 'next';
import Image from 'next/image';
import { GlavaPodstrani } from '@/components/Sekcije';
import { ostaleSlike } from '@/lib/galerije';
import { slika } from '@/lib/slike';
import s from './sofinanciranje.module.css';

export const metadata: Metadata = {
  title: 'Sofinanciranje iz sredstev Načrta za okrevanje in odpornost',
  description:
    'Projekt Posodobitev proizvodnje v podjetju HIFA: nakup tračne žage, laserskega varilnega aparata, robotske varilne celice, računalniške opreme in programske opreme SolidWorks.',
  alternates: { canonical: '/sofinanciranje' },
};

export default function Sofinanciranje() {
  return (
    <>
      <GlavaPodstrani naslov="Posodobitev proizvodnje v podjetju" uvod="Projekt je sofinanciran s strani Evropske unije, NextGenerationEU, iz sredstev Načrta za okrevanje in odpornost." />
      <div className={`wrap ${s.mreza}`}>
        <dl className={s.podatki}>
          <div><dt className="napis">Trajanje projekta</dt><dd>april 2022 – september 2023</dd></div>
          <div><dt className="napis">Vrednost projekta</dt><dd>135.619,37 €</dd></div>
          <div><dt className="napis">Sofinanciranje iz sredstev Načrta za okrevanje in odpornost</dt><dd>135.619,37 €</dd></div>
        </dl>
        <div className="prose">
          <h2 className="h3">Opis</h2>
          <p>V okviru projekta smo kupili novo tračno žago, laserski varilni aparat, robotsko varilno celico, računalniško opremo in programsko opremo SolidWorks. Nova oprema ima snovni in energetski učinek in zmanjšuje onesnaževanje zraka.</p>
          <h2 className="h3">Namen</h2>
          <p>S projektom podjetje izboljšuje učinkovitost proizvodnje in njen vpliv na okolje, izkoristek materiala in učinkovitost rabe energije. Pri izboru strojev in naprav smo posebno pozornost namenili opremi, ki sledi sodobnim okoljskim standardom.</p>
          <h2 className="h3">Cilji</h2>
          <ul>
            <li>Večja zmogljivost proizvodnje in razbremenitev zaposlenih.</li>
            <li>Večja prepoznavnost podjetja ter ohranjanje in izboljševanje kakovosti izdelkov in storitev.</li>
            <li>Posodobitev in razširitev proizvodnje.</li>
            <li>Manjša poraba energije in materialov.</li>
            <li>Manjši negativni vpliv na okolje.</li>
          </ul>
          <p>Sredstva je odobril Slovenski podjetniški sklad na podlagi Javnega razpisa za spodbude za sofinanciranje začetnih investicij na manj razvitih območjih P4I 2022.</p>
          <p><a href="https://noo.gov.si" rel="noopener noreferrer" target="_blank">noo.gov.si</a> · <a href="https://evropskasredstva.si/" rel="noopener noreferrer" target="_blank">evropskasredstva.si</a></p>
        </div>
        <div className={s.logo}>
          <Image src={slika(ostaleSlike.sofinanciranje)} alt="Logotipi: Sofinancira Evropska unija NextGenerationEU, Načrt za okrevanje in odpornost, Slovenski podjetniški sklad" fill sizes="(min-width: 900px) 560px, 100vw" style={{ objectFit: 'contain' }} />
        </div>
      </div>
    </>
  );
}
