'use client';

import { ODPRI_NASTAVITVE } from '@/lib/privolitev';

export default function NastavitvePiskotkov() {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(ODPRI_NASTAVITVE))}>
      Nastavitve piškotkov
    </button>
  );
}
