'use client';

import { useSyncExternalStore } from 'react';

// Privolitev v piškotke. Analitika in zemljevid (Google) se naložita šele po privolitvi.
export type Privolitev = { analitika: boolean; zemljevid: boolean; cas: string };

const KLJUC = 'hifa-piskotki-v1';
const DOGODEK = 'hifa-privolitev';
export const ODPRI_NASTAVITVE = 'hifa-piskotki-odpri';

let predpomnilnik: Privolitev | null | undefined;

function beri(): Privolitev | null {
  if (predpomnilnik !== undefined) return predpomnilnik;
  try {
    const v = localStorage.getItem(KLJUC);
    predpomnilnik = v ? (JSON.parse(v) as Privolitev) : null;
  } catch {
    predpomnilnik = null;
  }
  return predpomnilnik;
}

export function shrani(p: Omit<Privolitev, 'cas'>) {
  const z: Privolitev = { ...p, cas: new Date().toISOString() };
  predpomnilnik = z;
  try {
    localStorage.setItem(KLJUC, JSON.stringify(z));
  } catch {
    /* zasebno okno: privolitev velja do zaprtja strani */
  }
  window.dispatchEvent(new Event(DOGODEK));
}

function narocnina(cb: () => void) {
  window.addEventListener(DOGODEK, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(DOGODEK, cb);
    window.removeEventListener('storage', cb);
  };
}

/** undefined = še ne vemo (strežnik), null = uporabnik se še ni odločil. */
export function usePrivolitev(): Privolitev | null | undefined {
  return useSyncExternalStore(narocnina, beri, () => undefined);
}
