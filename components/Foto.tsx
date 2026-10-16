import Image from 'next/image';
import { slika } from '@/lib/slike';

type Props = {
  pot: string;
  alt: string;
  sizes: string;
  className?: string;
  prioriteta?: boolean;
  /** Zaobljen okvir z ozadjem (privzeto). Brez okvirja za fotografije znotraj kartic. */
  okvir?: boolean;
  style?: React.CSSProperties;
};

/** Fotografija, ki zapolni starša (starš določi razmerje stranic). */
export default function Foto({ pot, alt, sizes, className, prioriteta, okvir = true, style }: Props) {
  return (
    <span className={[okvir ? 'foto' : '', className].filter(Boolean).join(' ')} style={{ display: 'block', position: 'relative', ...style }}>
      <Image
        src={slika(pot)}
        alt={alt}
        fill
        sizes={sizes}
        priority={prioriteta}
        style={{ objectFit: 'cover' }}
      />
    </span>
  );
}
