import Link from 'next/link';
import s from './not-found.module.css';

export default function NiNajdeno() {
  return (
    <div className={`wrap ${s.stran}`}>
      <svg viewBox="0 0 600 220" className={s.risba} aria-hidden>
        <line x1="0" y1="200" x2="600" y2="200" stroke="var(--crnilo)" strokeWidth="2" />
        {[40, 140, 240].map((x) => (
          <g key={x}>
            <rect x={x} y={60} width={8} height={140} fill="var(--antracit)" />
            {[78, 98, 118, 138, 158, 178].map((y) => <rect key={y} x={x + 8} y={y} width={92} height={10} fill="var(--antracit)" />)}
          </g>
        ))}
        <rect x={340} y={60} width={8} height={140} fill="var(--antracit)" />
        <path d="M420 200 L440 60 L448 61 L428 200 Z" fill="var(--antracit)" />
        {[78, 98, 118].map((y) => <rect key={y} x={348} y={y} width={50} height={10} fill="var(--antracit)" />)}
        <path d="M398 70 q12 18 0 36 q-12 18 0 36" fill="none" stroke="var(--zelena)" strokeWidth="3" />
      </svg>
      <h1 className="display">Tukaj manjka ena letvica</h1>
      <p className="lead">Strani, ki jo iščete, ni. Morda je bila na stari strani pod drugim naslovom.</p>
      <div className={s.akcije}>
        <Link className="gumb gumb--zelen" href="/">Na začetno stran</Link>
        <Link className="gumb gumb--obroba" href="/galerije">Galerija</Link>
        <Link className="gumb gumb--obroba" href="/kontakt">Kontakt</Link>
      </div>
    </div>
  );
}
