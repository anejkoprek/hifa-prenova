import type { Metadata, Viewport } from 'next';
import { preload } from 'react-dom';
import './globals.css';
import Glava from '@/components/Glava';
import Noga from '@/components/Noga';
import Piskotki from '@/components/Piskotki';
import MobilnaVrstica from '@/components/MobilnaVrstica';
import Razkrij from '@/components/Razkrij';
import { podjetje } from '@/lib/podjetje';

export const metadata: Metadata = {
  metadataBase: new URL(podjetje.url),
  title: {
    default: 'Aluminijaste ograje, nadstreški in stopnišča po meri | HIFA',
    template: '%s | HIFA',
  },
  description:
    'Ograje za balkone, dvorišča in stopnice, dvoriščna vrata, nadstreški in kovinska stopnišča po meri. Lastna izdelava v Njivercah pri Kidričevem in montaža po vsej Sloveniji, od leta 1990.',
  applicationName: 'HIFA d.o.o.',
  openGraph: { type: 'website', locale: 'sl_SI', siteName: 'HIFA d.o.o.' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e4e7e5',
  viewportFit: 'cover',
};

const ldPodjetje = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  '@id': `${podjetje.url}/#podjetje`,
  name: podjetje.ime,
  url: podjetje.url,
  logo: `${podjetje.url}/img/logo-hifa.png`,
  image: `${podjetje.url}/opengraph-image.png`,
  telephone: '+386 31 688 704',
  email: podjetje.email,
  foundingDate: String(podjetje.od),
  address: {
    '@type': 'PostalAddress',
    streetAddress: podjetje.ulica,
    addressLocality: `${podjetje.kraj}, ${podjetje.obcina}`,
    postalCode: podjetje.posta,
    addressCountry: 'SI',
  },
  geo: { '@type': 'GeoCoordinates', latitude: podjetje.geo.lat, longitude: podjetje.geo.lng },
  areaServed: { '@type': 'Country', name: 'Slovenija' },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '16:00',
    },
  ],
  sameAs: [podjetje.facebook],
  makesOffer: ['Aluminijaste ograje', 'Dvoriščna vrata', 'Nadstreški', 'Kovinska stopnišča', 'Kovinske konstrukcije'].map((n) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: n },
  })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // pisavi začneta nalaganje takoj, da se naslov izriše prej
  preload('/fonts/archivo-latin.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  preload('/fonts/archivo-sl.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  return (
    <html lang="sl">
      <body>
        <a className="preskok" href="#vsebina">Preskoči na vsebino</a>
        <Glava />
        <main id="vsebina">{children}</main>
        <Noga />
        <MobilnaVrstica />
        <Piskotki />
        <Razkrij />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldPodjetje) }} />
      </body>
    </html>
  );
}
