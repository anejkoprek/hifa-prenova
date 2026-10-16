import type { PolniloP } from '@/lib/risbe/procelje';

/** Majhen piktogram polnila za čipe (28 × 20). */
export default function PolniloIkona({ tip }: { tip: PolniloP }) {
  const c = 'currentColor';
  let notranje: React.ReactNode = null;
  switch (tip) {
    case 'palicna':
      notranje = [5, 9, 13, 17, 21].map((x) => <rect key={x} x={x} y={3} width={2} height={14} fill={c} />);
      break;
    case 'vertikalne':
      notranje = [4.5, 7.5, 10.5, 13.5, 16.5, 19.5, 22.5].map((x) => <rect key={x} x={x} y={3} width={1.4} height={14} fill={c} />);
      break;
    case 'horizontalne':
      notranje = [4.5, 7.5, 10.5, 13.5].map((y) => <rect key={y} x={3} y={y} width={22} height={1.6} fill={c} />);
      break;
    case 'zarki':
      notranje = (
        <g stroke={c} strokeWidth={1.1}>
          <path d="M1 18 L11 2 M7 18 L17 2 M13 18 L23 2 M19 18 L29 2 M-5 18 L5 2" />
          <path d="M1 2 L11 18 M7 2 L17 18 M13 2 L23 18 M19 2 L29 18 M-5 2 L5 18" />
        </g>
      );
      break;
    case 'steklo':
      notranje = (
        <>
          <rect x={3} y={3} width={22} height={14} fill={c} opacity={0.18} />
          <path d="M7 15 L11 5 M10 15 L12 10" stroke={c} strokeWidth={1.1} strokeLinecap="round" />
        </>
      );
      break;
    case 'perforirana':
      notranje = (
        <>
          <rect x={3} y={3} width={22} height={14} fill={c} opacity={0.85} />
          {[6, 10, 14, 18, 22].map((x) => (
            <circle key={x} cx={x} cy={10} r={1} fill="var(--bela)" />
          ))}
        </>
      );
      break;
  }
  return (
    <svg width={28} height={20} viewBox="0 0 28 20" aria-hidden focusable="false" style={{ flex: 'none' }}>
      <defs>
        <clipPath id={`pi-${tip}`}>
          <rect x={2} y={2} width={24} height={16} />
        </clipPath>
      </defs>
      <g clipPath={`url(#pi-${tip})`}>{notranje}</g>
      <rect x={2} y={2} width={24} height={16} fill="none" stroke={c} strokeWidth={1.4} />
    </svg>
  );
}
