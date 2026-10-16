'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { List, Phone, X, ArrowRight, CaretDown } from '@phosphor-icons/react';
import { izdelkiMeni, navigacija, podjetje } from '@/lib/podjetje';
import { slika } from '@/lib/slike';
import s from './Glava.module.css';

export default function Glava() {
  const pot = usePathname();
  const [odprt, setOdprt] = useState(false);
  const [scroll, setScroll] = useState(false);
  const [izdelkiOdprti, setIzdelkiOdprti] = useState(false);
  const gumb = useRef<HTMLButtonElement>(null);
  const izdelkiRef = useRef<HTMLLIElement>(null);
  const zapriCas = useRef<ReturnType<typeof setTimeout>>(undefined);
  const vrstaKazalca = useRef('');

  useEffect(() => {
    setOdprt(false);
    setIzdelkiOdprti(false);
  }, [pot]);

  // spustni meni izdelkov: zapri ob kliku drugam ali tipki Esc
  useEffect(() => {
    if (!izdelkiOdprti) return;
    const klik = (e: MouseEvent) => {
      if (!izdelkiRef.current?.contains(e.target as Node)) setIzdelkiOdprti(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIzdelkiOdprti(false);
        (izdelkiRef.current?.querySelector('button') as HTMLButtonElement | null)?.focus();
      }
    };
    document.addEventListener('mousedown', klik);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', klik);
      document.removeEventListener('keydown', esc);
    };
  }, [izdelkiOdprti]);

  // na računalniku se meni odpre že ob prehodu z miško, z rahlim zamikom pri zapiranju
  const lebdiNoter = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(zapriCas.current);
    setIzdelkiOdprti(true);
  };
  const lebdiVen = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    zapriCas.current = setTimeout(() => setIzdelkiOdprti(false), 180);
  };

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
            <li ref={izdelkiRef} className={s.izdelki} onPointerEnter={lebdiNoter} onPointerLeave={lebdiVen}>
              <button
                type="button"
                className={s.izdelkiGumb}
                aria-expanded={izdelkiOdprti}
                aria-controls="meni-izdelki"
                data-aktiven={izdelkiMeni.some((i) => aktiven(i.href)) || undefined}
                onPointerDown={(e) => (vrstaKazalca.current = e.pointerType)}
                onClick={() => {
                  // z miško je meni že odprt ob prehodu, klik ga ne sme zapreti; prst in tipkovnica preklapljata
                  if (vrstaKazalca.current === 'mouse') setIzdelkiOdprti(true);
                  else setIzdelkiOdprti((v) => !v);
                  vrstaKazalca.current = '';
                }}
              >
                Izdelki <CaretDown size={14} weight="bold" aria-hidden />
              </button>
              <div id="meni-izdelki" className={s.plosca} data-odprt={izdelkiOdprti || undefined}>
                <ul className={s.ploscaMreza}>
                  {izdelkiMeni.map((i) => (
                    <li key={i.href}>
                      <Link href={i.href} className={s.izdelek} aria-current={aktiven(i.href) ? 'page' : undefined} tabIndex={izdelkiOdprti ? 0 : -1}>
                        <span className={s.izdelekSlika}>
                          <Image src={slika(i.slika)} alt="" fill sizes="200px" style={{ objectFit: 'cover' }} />
                        </span>
                        <span className={s.izdelekNaziv}>{i.naziv}</span>
                        <span className={s.izdelekOpis}>{i.opis}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/konfigurator" className={s.ploscaKonf} tabIndex={izdelkiOdprti ? 0 : -1}>
                  Ne veste, kaj izbrati? Oblikujte ograjo ali nadstrešek v konfiguratorju <ArrowRight size={16} weight="bold" aria-hidden />
                </Link>
              </div>
            </li>
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
          <p className={`napis ${s.meniNapis}`}>Izdelki</p>
          <ul className={s.meniIzdelki}>
            {izdelkiMeni.map((i) => (
              <li key={i.href}>
                <Link href={i.href} aria-current={aktiven(i.href) ? 'page' : undefined}>
                  <span className={s.meniSlika}>
                    <Image src={slika(i.slika)} alt="" fill sizes="120px" style={{ objectFit: 'cover' }} />
                  </span>
                  <span>{i.naziv}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul className={s.meniSeznam}>
            {navigacija.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={aktiven(n.href) ? 'page' : undefined}>
                  {n.naziv}
                  <ArrowRight size={20} aria-hidden />
                </Link>
              </li>
            ))}
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
