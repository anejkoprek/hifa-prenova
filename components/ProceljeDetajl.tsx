import type { DelId } from '@/lib/risbe/procelje';

/** Izsek pročelja z naslovnice (statična SVG slika iz /procelje/[del]): pokaže, kateri del hiše stran razlaga. */
export default function ProceljeDetajl({ del }: { del: DelId }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/procelje/${del}`}
      alt=""
      width={800}
      height={600}
      loading="lazy"
      decoding="async"
      style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', aspectRatio: '4 / 3' }}
    />
  );
}
