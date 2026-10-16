// Najpogostejše RAL barve za prašno barvanje ograj in nadstreškov (približne sRGB vrednosti za zaslon).
export const RAL = [
  { koda: '7016', ime: 'Antracitno siva', hex: '#383e42' },
  { koda: '9005', ime: 'Globoko črna', hex: '#121314' },
  { koda: '9006', ime: 'Belo aluminijasta', hex: '#a5a8a6' },
  { koda: '9016', ime: 'Prometno bela', hex: '#f1f0ea' },
  { koda: '7035', ime: 'Svetlo siva', hex: '#cbd0cc' },
  { koda: '7039', ime: 'Kremenovo siva', hex: '#6b665e' },
  { koda: '8017', ime: 'Čokoladno rjava', hex: '#45322e' },
  { koda: '6005', ime: 'Mahovno zelena', hex: '#114232' },
] as const;

export type RalKoda = (typeof RAL)[number]['koda'];

export function ralHex(koda: string): string {
  return RAL.find((r) => r.koda === koda)?.hex ?? '#383e42';
}

export function ralIme(koda: string): string {
  const r = RAL.find((x) => x.koda === koda);
  return r ? `RAL ${r.koda} ${r.ime.toLowerCase()}` : `RAL ${koda}`;
}
