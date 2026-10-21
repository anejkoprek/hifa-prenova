'use client';

import { useState } from 'react';
import YARL from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import type { SlikaZ } from '@/lib/galerije';
import { slika } from '@/lib/slike';

const sirine = [828, 1280, 2048];
const optimiziraj = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

export default function Lightbox({ slike, indeks, zapri }: { slike: SlikaZ[]; indeks: number; zapri: () => void }) {
  const [trenutna, setTrenutna] = useState(indeks);
  const slides = slike.map((x) => {
    const src = slika(x.pot);
    return {
      src: optimiziraj(src, 1280),
      alt: x.alt,
      description: x.alt,
      width: 1600,
      height: 1200,
      srcSet: sirine.map((w) => ({ src: optimiziraj(src, w), width: w, height: Math.round((w * 3) / 4) })),
    };
  });
  return (
    <YARL
      open
      close={zapri}
      index={indeks}
      slides={slides}
      plugins={[Zoom, Counter, Captions]}
      carousel={{ finite: false, preload: 2 }}
      on={{ view: ({ index }) => setTrenutna(index) }}
      toolbar={{
        buttons: [
          // izbrano fotografijo vzamemo kot primer v povpraševanje
          <a key="podobno" className="lightbox-podobno" href={`/kontakt?slika=${encodeURIComponent(slike[trenutna]?.pot ?? '')}#povprasevanje`}>
            Želim podobno
          </a>,
          'close',
        ],
      }}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
      captions={{ descriptionTextAlign: 'center' }}
      labels={{
        Previous: 'Prejšnja',
        Next: 'Naslednja',
        Close: 'Zapri',
        'Zoom in': 'Povečaj',
        'Zoom out': 'Pomanjšaj',
        Lightbox: 'Galerija',
        Carousel: 'Fotografije',
        Slide: 'Fotografija',
      }}
      styles={{ container: { backgroundColor: 'rgb(20 23 25 / 0.96)' } }}
    />
  );
}
