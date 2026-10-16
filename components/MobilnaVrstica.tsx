'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, PaperPlaneTilt } from '@phosphor-icons/react';
import { podjetje } from '@/lib/podjetje';
import s from './MobilnaVrstica.module.css';

/** Na telefonu sta klic in povpraševanje vedno pod palcem. V konfiguratorju gumb skoči na pošiljanje izbire. */
export default function MobilnaVrstica() {
  const pot = usePathname();
  const konf = pot === '/konfigurator';
  return (
    <nav className={s.vrstica} aria-label="Hitri kontakt">
      <a className="gumb gumb--obroba" href={podjetje.telefonHref}>
        <Phone size={18} weight="bold" aria-hidden /> Pokliči
      </a>
      <Link className="gumb gumb--zelen" href={konf ? '#povprasevanje' : '/kontakt#povprasevanje'}>
        <PaperPlaneTilt size={18} weight="bold" aria-hidden /> {konf ? 'Pošlji izbiro' : 'Povpraševanje'}
      </Link>
    </nav>
  );
}
