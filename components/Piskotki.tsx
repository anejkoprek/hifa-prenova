'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { ODPRI_NASTAVITVE, shrani, usePrivolitev } from '@/lib/privolitev';
import s from './Piskotki.module.css';

const GA4 = process.env.NEXT_PUBLIC_GA4 ?? '';

export default function Piskotki() {
  const p = usePrivolitev();
  const [nastavitve, setNastavitve] = useState(false);
  const [analitika, setAnalitika] = useState(false);
  const [zemljevid, setZemljevid] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const odpri = () => {
      setAnalitika(!!p?.analitika);
      setZemljevid(!!p?.zemljevid);
      setNastavitve(true);
      requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('input')?.focus());
    };
    window.addEventListener(ODPRI_NASTAVITVE, odpri);
    return () => window.removeEventListener(ODPRI_NASTAVITVE, odpri);
  }, [p]);

  const vidno = p === null || nastavitve;

  const potrdi = (v: { analitika: boolean; zemljevid: boolean }) => {
    shrani(v);
    setNastavitve(false);
  };

  return (
    <>
      {GA4 && p?.analitika ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA4}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}

      {vidno ? (
        <div ref={ref} className={s.piskotki} role="dialog" aria-modal="false" aria-labelledby="piskotki-naslov">
          <h2 id="piskotki-naslov" className={s.naslov}>Piškotki</h2>
          <p className={s.besedilo}>
            Nujne piškotke stran potrebuje za delovanje. Analitiko in Googlov zemljevid naložimo samo, če se strinjate.{' '}
            <Link href="/pravno-obvestilo#piskotki">Več o piškotkih</Link>
          </p>

          {nastavitve ? (
            <fieldset className={s.izbire}>
              <legend className="visually-hidden">Izberite piškotke</legend>
              <label className="potrditev">
                <input type="checkbox" checked disabled /> <span><strong>Nujni</strong>, vedno vklopljeni</span>
              </label>
              <label className="potrditev">
                <input type="checkbox" checked={analitika} onChange={(e) => setAnalitika(e.target.checked)} />
                <span><strong>Analitika</strong> (Google Analytics), da vidimo, katere strani so uporabne</span>
              </label>
              <label className="potrditev">
                <input type="checkbox" checked={zemljevid} onChange={(e) => setZemljevid(e.target.checked)} />
                <span><strong>Zemljevid</strong> (Google Maps) na strani Kontakt</span>
              </label>
            </fieldset>
          ) : null}

          <div className={s.gumbi}>
            {nastavitve ? (
              <button type="button" className="gumb gumb--mal" onClick={() => potrdi({ analitika, zemljevid })}>
                Shrani izbiro
              </button>
            ) : (
              <button type="button" className="gumb gumb--mal gumb--obroba" onClick={() => setNastavitve(true)}>
                Nastavitve
              </button>
            )}
            <button type="button" className="gumb gumb--mal gumb--obroba" onClick={() => potrdi({ analitika: false, zemljevid: false })}>
              Zavrni
            </button>
            <button type="button" className="gumb gumb--mal" onClick={() => potrdi({ analitika: true, zemljevid: true })}>
              Sprejmi vse
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
