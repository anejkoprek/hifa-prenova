import Image from 'next/image';
import Link from 'next/link';
import { Phone, EnvelopeSimple, Clock, FacebookLogo } from '@phosphor-icons/react/ssr';
import { izdelki, podjetje } from '@/lib/podjetje';
import { slika } from '@/lib/slike';
import { ostaleSlike } from '@/lib/galerije';
import NastavitvePiskotkov from './NastavitvePiskotkov';
import s from './Noga.module.css';

export default function Noga() {
  const leto = new Date().getFullYear();
  return (
    <footer className={s.noga}>
      <div className={`wrap ${s.mreza}`}>
        <div className={s.uvod}>
          <p className={s.geslo}>Ograje, nadstreški, stopnišča in konstrukcije po meri. Izdelano v Njivercah, montirano po vsej Sloveniji.</p>
          <div className={s.kontakti}>
            <a href={podjetje.telefonHref}><Phone size={20} weight="bold" aria-hidden /> {podjetje.telefon}</a>
            <a href={`mailto:${podjetje.email}`}><EnvelopeSimple size={20} weight="bold" aria-hidden /> {podjetje.email}</a>
          </div>
        </div>

        <div className={s.blok}>
          <h2 className="napis">Izdelki</h2>
          <ul>
            {izdelki.map((i) => (
              <li key={i.href}><Link href={i.href}>{i.naziv}</Link></li>
            ))}
            <li><Link href="/konfigurator">Konfigurator ograj in nadstreškov</Link></li>
          </ul>
        </div>

        <div className={s.blok}>
          <h2 className="napis">Podjetje</h2>
          <ul>
            <li><Link href="/o-nas">O nas in pogosta vprašanja</Link></li>
            <li><Link href="/galerije">Galerija izvedenih del</Link></li>
            <li><Link href="/kontakt">Kontakt in povpraševanje</Link></li>
            <li>
              <a href={podjetje.facebook} rel="noopener noreferrer" target="_blank">
                <FacebookLogo size={16} weight="fill" aria-hidden /> Facebook
              </a>
            </li>
          </ul>
        </div>

        <div className={s.blok}>
          <h2 className="napis">Delavnica</h2>
          <address>
            {podjetje.ime}
            <br />
            {podjetje.ulica}
            <br />
            {podjetje.kraj}, {podjetje.posta} {podjetje.obcina}
          </address>
          <p className={s.cas}><Clock size={16} aria-hidden /> {podjetje.delovniCas}</p>
          <a className={s.zemljevid} href={podjetje.mapsLink} target="_blank" rel="noopener noreferrer">Odpri v Google Zemljevidih</a>
        </div>

        <Link className={s.noo} href="/sofinanciranje">
          <span className={s.nooLogo}>
            <Image src={slika(ostaleSlike.sofinanciranje)} alt="Logotipi: Sofinancira Evropska unija NextGenerationEU, Načrt za okrevanje in odpornost, Slovenski podjetniški sklad" fill sizes="280px" style={{ objectFit: 'contain', objectPosition: 'left center' }} />
          </span>
          <span>Projekt je sofinanciran s strani Evropske unije, NextGenerationEU, iz sredstev Načrta za okrevanje in odpornost.</span>
        </Link>
      </div>

      <div className={`wrap ${s.spodaj}`}>
        <p>© {leto} {podjetje.ime}</p>
        <ul>
          <li><Link href="/pravno-obvestilo">Zasebnost in piškotki</Link></li>
          <li><NastavitvePiskotkov /></li>
          <li><Link href="/sofinanciranje">Sofinanciranje</Link></li>
        </ul>
        <p className={s.izdelava}>
          <span>Izdelava</span>
          <a href="https://deverastudio.com" rel="noopener" aria-label="Devera Studio, izdelava spletnih strani">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/devera-logo-white.svg" alt="Devera Studio" width={141} height={18} />
          </a>
        </p>
      </div>
    </footer>
  );
}
