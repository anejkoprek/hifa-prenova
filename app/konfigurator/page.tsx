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
        <p className="muted">Risba se spreminja z vsako izbiro. Na koncu izbiro pošljete in pripravimo informativno ponudbo.</p>
      </div>
      <Konfigurator />
    </>
  );
}
