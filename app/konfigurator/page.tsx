import type { Metadata } from 'next';
import Konfigurator from '@/components/Konfigurator';
import s from './konfigurator.module.css';

export const metadata: Metadata = {
  title: 'Konfigurator ograj in nadstreškov',
  description:
    'Oblikujte svojo balkonsko, dvoriščno ali stopniščno ograjo ali nadstrešek: polnilo, mere, vrata, kritina in barva po RAL lestvici. Risba se riše sproti, izbiro pošljete za informativno ponudbo.',
  alternates: { canonical: '/konfigurator' },
};

export default function KonfiguratorStran() {
  return (
    <>
      <div className={`wrap ${s.glava}`}>
        <h1 className="h2">Oblikujte ograjo ali nadstrešek</h1>
        <p className="muted">Risba in 3D model se spreminjata z vsako izbiro. Model lahko obračate in si ga ogledate z vseh strani. Na koncu izbiro pošljete in pripravimo informativno ponudbo.</p>
      </div>
      <Konfigurator />
    </>
  );
}
