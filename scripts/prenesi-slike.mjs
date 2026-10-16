// Prenese vse fotografije s hifa.si v public/hifa/ (in katalog Holler v public/files/).
// Zaženi enkrat: `npm run slike`. Nato stran slike bere lokalno (NEXT_PUBLIC_SLIKE=lokalno v .env.local).
// Pred objavo nove strani je to obvezno, ker stara stran s fotografijami izgine.
import { mkdir, writeFile, access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const koren = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://www.hifa.si/';
const VZPOREDNO = 6;

// Poti beremo neposredno iz lib/galerije.ts, da je seznam samo na enem mestu.
const vir = await readFile(join(koren, 'lib/galerije.ts'), 'utf8');
const poti = new Set();
for (const m of vir.matchAll(/'((?:media|files|img)\/[^']+\.(?:jpg|jpeg|png))'/g)) poti.add(m[1]);
for (const m of vir.matchAll(/zaporedje\('([^']+)', (\d+), (\d+)\)/g)) {
  const [, slug, prvi, st] = m;
  for (let i = 0; i < Number(st); i++) {
    poti.add(`media/${Number(prvi) + i}/${slug}-hifa-${String(i + 1).padStart(2, '0')}.jpg`);
  }
}

async function obstaja(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function prenesi(url, cilj) {
  if (await obstaja(cilj)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await mkdir(dirname(cilj), { recursive: true });
  await writeFile(cilj, Buffer.from(await res.arrayBuffer()));
}

const seznam = [...poti];
let ok = 0;
let napake = 0;
let i = 0;
console.log(`Prenašam ${seznam.length} slik s hifa.si ...`);

async function delavec() {
  while (i < seznam.length) {
    const pot = seznam[i++];
    try {
      await prenesi(BASE + pot, join(koren, 'public/hifa', pot));
      ok++;
    } catch (e) {
      napake++;
      console.warn('  napaka:', e.message);
    }
    if ((ok + napake) % 25 === 0) console.log(`  ${ok + napake}/${seznam.length}`);
  }
}
await Promise.all(Array.from({ length: VZPOREDNO }, delavec));

try {
  await prenesi(BASE + 'files/media/slo-diy-2023-small.pdf', join(koren, 'public/files/holler-diy-katalog.pdf'));
} catch (e) {
  console.warn('  katalog Holler ni bil prenesen:', e.message);
}

if (napake === 0) {
  const envPot = join(koren, '.env.local');
  let env = (await obstaja(envPot)) ? await readFile(envPot, 'utf8') : '';
  if (!env.includes('NEXT_PUBLIC_SLIKE')) {
    env += `${env && !env.endsWith('\n') ? '\n' : ''}NEXT_PUBLIC_SLIKE=lokalno\n`;
    await writeFile(envPot, env);
  }
  console.log(`Končano: ${ok} slik. Stran zdaj bere slike lokalno. Ponovno zaženi "npm run dev".`);
} else {
  console.log(`Končano: ${ok} slik, ${napake} napak. Slike se še naprej nalagajo s hifa.si. Zaženi znova.`);
}
