import Link from 'next/link';
import { Phone, PaperPlaneTilt } from '@phosphor-icons/react/ssr';
import { podjetje } from '@/lib/podjetje';
import s from './MobilnaVrstica.module.css';

/** Na telefonu sta klic in povpraševanje vedno pod palcem. */
export default function MobilnaVrstica() {
  return (
    <nav className={s.vrstica} aria-label="Hitri kontakt">
      <a className="gumb gumb--obroba" href={podjetje.telefonHref}>
        <Phone size={18} weight="bold" aria-hidden /> Pokliči
      </a>
      <Link className="gumb gumb--zelen" href="/kontakt#povprasevanje">
        <PaperPlaneTilt size={18} weight="bold" aria-hidden /> Povpraševanje
      </Link>
    </nav>
  );
}
