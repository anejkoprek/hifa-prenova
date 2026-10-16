import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from '@phosphor-icons/react/ssr';
import Galerija from '@/components/Galerija';
import { SekcijaPovprasevanje } from '@/components/Sekcije';
import { galerija, galerije, slikeGalerije, type KategorijaId } from '@/lib/galerije';
import { slika } from '@/lib/slike';
import type { IZDELKI } from '@/lib/povprasevanje';
import s from '../galerije.module.css';

export const dynamicParams = false;
export function generateStaticParams() {
  return galerije.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<'/galerije/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const g = galerija(slug);
  if (!g) return {};
  return {
    title: `${g.naziv}: galerija izvedenih del`,
    description: `${g.slike.length} fotografij. ${g.opis}`,
    alternates: { canonical: `/galerije/${g.slug}` },
    openGraph: { images: [slika(g.naslovnica)] },
  };
}

const izdelkiZa: Record<KategorijaId, (typeof IZDELKI)[number][]> = {
  ograje: ['Ograja'],
  nadstreski: ['Nadstrešek'],
  stopnisca: ['Stopnišče'],
  konstrukcije: ['Konstrukcija'],
  holler: ['Holler DIY'],
  'prej-potem': [],
};

export default async function GalerijaStran({ params }: PageProps<'/galerije/[slug]'>) {
  const { slug } = await params;
  const g = galerija(slug);
  if (!g) notFound();
  return (
    <>
      <div className={`wrap ${s.glava}`}>
        <Link className={`napis ${s.nazaj}`} href="/galerije">
          <ArrowLeft size={14} weight="bold" aria-hidden /> Vse galerije
        </Link>
        <h1 className="display">{g.naziv}</h1>
        <p className="lead">{g.opis} <span className="muted">{g.slike.length} fotografij.</span></p>
        <ul className={s.ostale}>
          {galerije
            .filter((x) => x.slug !== g.slug)
            .map((x) => (
              <li key={x.slug}>
                <Link className="cip" href={`/galerije/${x.slug}`}>
                  {x.naziv}
                </Link>
              </li>
            ))}
        </ul>
      </div>
      <section className="sekcija--ozka" aria-label={`Fotografije: ${g.naziv}`}>
        <div className="wrap">
          <Galerija slike={slikeGalerije(g)} zacetno={36} />
        </div>
      </section>
      <SekcijaPovprasevanje izdelki={izdelkiZa[g.kategorija]} />
    </>
  );
}
