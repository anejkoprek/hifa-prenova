'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { List, Phone, X, ArrowRight } from '@phosphor-icons/react';
import { navigacija, podjetje } from '@/lib/podjetje';
import { slika } from '@/lib/slike';
import s from './Glava.module.css';

export default function Glava() {
  const pot = usePathname();
  const [odprt, setOdprt] = useState(false);
  const [scroll, setScroll] = useState(false);
  const gumb = useRef<HTMLButtonElement>(null);

  useEffect(() => setOdprt(false), [pot]);

  useEffect(() => {
    const f = () => setScroll(window.scrollY > 8);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);

  useEffect(() => {
    if (!odprt) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOdprt(false);
        gumb.current?.focus();
      }
    };
    document.addEventListener('keydown', esc);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', esc);
      document.documentElement.style.overflow = '';
    };
  }, [odprt]);

  const aktiven = (href: string) => pot === href || pot.startsWith(href + '/');

  return (
    <header className={s.glava} data-scroll={scroll || undefined}>
      <div className={`wrap ${s.vrstica}`}>
        <Link href="/" className={s.logo} aria-label="HIFA d.o.o., na začetno stran">
          <Image src={slika('img/logo-hifa.png')} alt="" fill sizes="160px" priority style={{ objectFit: 'contain', objectPosition: 'left center' }} />
        </Link>

        <nav className={s.nav} aria-label="Glavna navigacija">
          <ul>
            {navigacija.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={aktiven(n.href) ? 'page' : undefined}>
                  {n.naziv}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={s.akcije}>
          <a className={s.telefon} href={podjetje.telefonHref}>
            <Phone size={18} weight="bold" aria-hidden />
            <span>{podjetje.telefon}</span>
          </a>
          <Link className="gumb gumb--zelen gumb--mal" href="/konfigurator">
            Konfigurator
          </Link>
          <button
            ref={gumb}
            type="button"
            className={s.meniGumb}
            aria-expanded={odprt}
            aria-controls="mobilni-meni"
            onClick={() => setOdprt((v) => !v)}
          >
            {odprt ? <X size={24} weight="bold" aria-hidden /> : <List size={24} weight="bold" aria-hidden />}
            <span className="visually-hidden">{odprt ? 'Zapri meni' : 'Odpri meni'}</span>
          </button>
        </div>
      </div>

      <div id="mobilni-meni" className={s.meni} data-odprt={odprt || undefined} hidden={!odprt}>
        <nav aria-label="Mobilna navigacija" className="wrap">
          <ul className={s.meniSeznam}>
            {navigacija.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={aktiven(n.href) ? 'page' : undefined}>
                  {n.naziv}
                  <ArrowRight size={20} aria-hidden />
                </Link>
              </li>
            ))}
            <li>
              <Link href="/kontakt">
                Kontakt
                <ArrowRight size={20} aria-hidden />
              </Link>
            </li>
          </ul>
          <div className={s.meniSpodaj}>
            <Link className="gumb gumb--zelen gumb--poln" href="/konfigurator">
              Oblikujte svojo ograjo
            </Link>
            <a className="gumb gumb--obroba gumb--poln" href={podjetje.telefonHref}>
              <Phone size={18} weight="bold" aria-hidden /> {podjetje.telefon}
            </a>
            <p className="small muted">{podjetje.delovniCas} · {podjetje.email}</p>
          </div>
        </nav>
      </div>
    </header>
  );
}
