// 3D modeli za konfigurator: ograje (balkonska, galerijska, dvoriščna z vrati, zunanja in notranja stopniščna) in nadstreški.
// Vse mere so v metrih, os y kaže navzgor. Funkcije sprejmejo isto stanje kot 2D risba, zato se oba pogleda vedno ujemata.
import * as THREE from 'three';
import type { OgrajaStanje, NadstresekStanje } from './konfigurator';
import type { Polnilo } from './risbe/ograja';
import { ralHex } from './ral';
import { obl, oblikeNaPlatno, type Vzorec } from './vzorci';
import { zarkiPolja, type VzorecZarkov } from './zarki';

/* ---------------------------------------------------------------- materiali */

export type Materiali = ReturnType<typeof ustvariMateriale>;

const predpomnilnik = new Map<string, ReturnType<typeof novaMateriala>>();

/** materiali se ob vsaki spremembi mere ne ustvarjajo znova (brez ponovnega prevajanja senčilnikov in zatikanja) */
export function ustvariMateriale(ral: string, material: string) {
  const kljuc = `${ral}|${material}`;
  let M = predpomnilnik.get(kljuc);
  if (!M) {
    M = novaMateriala(ral, material);
    Object.values(M).forEach((m) => (m.userData.trajen = true));
    predpomnilnik.set(kljuc, M);
  }
  return M;
}

function novaMateriala(ral: string, material: string) {
  const barva = new THREE.Color(ralHex(ral));
  // prašno barvanje: rahlo kovinsko, satenast sijaj; inox nekoliko bolj gladek
  const kovina = new THREE.MeshStandardMaterial({ color: barva, metalness: 0.45, roughness: material === 'inox' ? 0.36 : 0.5 });
  const steklo = new THREE.MeshPhysicalMaterial({
    color: 0xd9e6e8,
    metalness: 0,
    roughness: 0.05,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const robStekla = new THREE.MeshStandardMaterial({ color: 0x9fb4b8, transparent: true, opacity: 0.6, roughness: 0.2 });
  const beton = new THREE.MeshStandardMaterial({ color: 0xb7bab3, roughness: 0.95 });
  const betonTemen = new THREE.MeshStandardMaterial({ color: 0x9ea29b, roughness: 0.95 });
  const fasada = new THREE.MeshStandardMaterial({ color: 0xeeede6, roughness: 0.92 });
  const okvirOkna = new THREE.MeshStandardMaterial({ color: 0x383e42, roughness: 0.5, metalness: 0.2 });
  const oknoSteklo = new THREE.MeshStandardMaterial({ color: 0x8fa6ab, roughness: 0.15, metalness: 0.1 });
  const les = new THREE.MeshStandardMaterial({ color: 0xa8743f, roughness: 0.6 });
  const asfalt = new THREE.MeshStandardMaterial({ color: 0x8d918e, roughness: 1 });
  const trava = new THREE.MeshStandardMaterial({ color: 0xb3bba9, roughness: 1 });
  const tla = new THREE.MeshStandardMaterial({ color: 0xc8cbc4, roughness: 0.9 });
  const parket = new THREE.MeshStandardMaterial({ color: 0xd8c7ad, roughness: 0.7 });
  const motor = new THREE.MeshStandardMaterial({ color: 0x2a2f33, roughness: 0.55 });
  const luc = new THREE.MeshStandardMaterial({ color: 0xf0b33c, emissive: 0xf0b33c, emissiveIntensity: 0.6, roughness: 0.4 });
  return { kovina, steklo, robStekla, beton, betonTemen, fasada, okvirOkna, oknoSteklo, les, asfalt, trava, tla, parket, motor, luc };
}

/* ---------------------------------------------------------------- osnovni gradniki */

const skatla = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

/** profil med dvema točkama v ravnini XY (pravokoten presek a × b) */
function palica(x1: number, y1: number, x2: number, y2: number, a: number, b: number, m: THREE.Material) {
  const dx = x2 - x1, dy = y2 - y1;
  const dol = Math.hypot(dx, dy);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(dol, a, b), m);
  mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, 0);
  mesh.rotation.z = Math.atan2(dy, dx);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** mnogo enakih profilov v enem klicu risanja (polnila imajo lahko več sto letvic) */
function instance(segmenti: [number, number, number, number][], a: number, b: number, m: THREE.Material) {
  const geo = new THREE.BoxGeometry(1, a, b);
  const im = new THREE.InstancedMesh(geo, m, Math.max(1, segmenti.length));
  const mat = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const os = new THREE.Vector3(0, 0, 1);
  segmenti.forEach(([x1, y1, x2, y2], i) => {
    const dx = x2 - x1, dy = y2 - y1;
    q.setFromAxisAngle(os, Math.atan2(dy, dx));
    mat.compose(new THREE.Vector3((x1 + x2) / 2, (y1 + y2) / 2, 0), q, new THREE.Vector3(Math.hypot(dx, dy), 1, 1));
    im.setMatrixAt(i, mat);
  });
  im.count = segmenti.length;
  im.castShadow = true;
  im.receiveShadow = true;
  return im;
}

/** odsek premice znotraj paralelograma (za žarke in poševna polnila) */
function obrezi(p: [number, number], s: [number, number], L: number, h: number, r: number): [number, number, number, number] | null {
  // paralelogram: spodnji rob y = x*r/L, zgornji y = x*r/L + h, 0 ≤ x ≤ L
  let t0 = -1e9, t1 = 1e9;
  const omeji = (num: number, den: number) => {
    // pogoj: num + den*t >= 0
    if (Math.abs(den) < 1e-12) return num >= 0;
    const t = -num / den;
    if (den > 0) t0 = Math.max(t0, t);
    else t1 = Math.min(t1, t);
    return true;
  };
  const k = r / L;
  if (!omeji(p[0], s[0])) return null; // x >= 0
  if (!omeji(L - p[0], -s[0])) return null; // x <= L
  if (!omeji(p[1] - k * p[0], s[1] - k * s[0])) return null; // nad spodnjim robom
  if (!omeji(k * p[0] + h - p[1], k * s[0] - s[1])) return null; // pod zgornjim robom
  if (t1 - t0 < 1e-4) return null;
  return [p[0] + s[0] * t0, p[1] + s[1] * t0, p[0] + s[0] * t1, p[1] + s[1] * t1];
}

/** prozorna ali perforirana ploskev v obliki paralelograma; uvMetri: u v metrih (maska se ponavlja vsak meter) */
function ploskev(L: number, h: number, r: number, m: THREE.Material, debelina = 0.01, uvMetri = false) {
  const oblika = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(L, r), new THREE.Vector2(L, r + h), new THREE.Vector2(0, h)]);
  const geo = new THREE.ExtrudeGeometry(oblika, { depth: debelina, bevelEnabled: false });
  geo.translate(0, 0, -debelina / 2);
  // UV: u po dolžini, v po višini ploskve (neodvisno od naklona), da je perforacija vedno vodoravna z robom
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const poz = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < poz.count; i++) {
    const x = poz.getX(i), y = poz.getY(i);
    uv.setXY(i, uvMetri ? x : x / L, (y - (x * r) / L) / h);
  }
  const mesh = new THREE.Mesh(geo, m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

const maske = new Map<string, THREE.CanvasTexture | null>();
/** maska izrezov za pločevino: belo = pločevina, črno = izrez. Ploščica 1 m × h, po dolžini se ponavlja. */
function maskaVzorca(vzorec: Vzorec, h: number) {
  const kljuc = `${vzorec}|${Math.round(h * 100)}`;
  if (maske.has(kljuc)) return maske.get(kljuc)!;
  if (typeof document === 'undefined') return null;
  const ppm = 512;
  const c = document.createElement('canvas');
  c.width = ppm;
  c.height = Math.max(64, Math.round(h * ppm));
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#000';
  oblikeNaPlatno(g, obl(vzorec, h), ppm, c.height);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 4;
  maske.set(kljuc, t);
  return t;
}

/* ---------------------------------------------------------------- polje ograje */

/**
 * Eno polje ograje v ravnini XY: od (0,0) do (L, r) spodaj, višina h. r je dvig (za stopnišča).
 * Okvir: zgornji in spodnji profil, polnilo med njima. Stebri niso del polja.
 */
/** dodatne nastavitve ograje: razmik letvic (m), odprte palice s šipko, ograja brez stebričkov ... */
export type OpcijeOgraje = {
  razmik?: number;
  razmikStebrov?: number;
  odprte?: boolean;
  /** višina šipke nad dnom polja, m */
  sipka?: number;
  brezStebrov?: boolean;
  /** razdalja od dna polja do spodnjega profila (privzeto 6 cm) */
  dno?: number;
  /** perforirana pločevina: vzorec izreza */
  vzorec?: Vzorec;
  /** žarki: izvedba */
  zarki?: VzorecZarkov;
  /** zaporedna številka polja (za raznolike, a ponovljive žarke) */
  seme?: number;
  /** žarki: kje na celotni ograji se polje začne in kako dolga je ograja (neprekinjen vzorec čez stebre) */
  zarkiOd?: number;
  zarkiCelota?: number;
  /** ročaj čez vrh tudi na vodoravnem delu (nadaljevanje stopniščne ograje ob podestu ali zgornji etaži) */
  rocaj?: boolean;
  /** odprte palice brez stebrov: vse palice enake (kvadratna cev), vsaka sidrana posebej, brez spodnje letve */
  proste?: boolean;
  /** koliko palice segajo pod dno polja (sidranje v ploščo ali ob bok stopnic), m */
  podaljsaj?: number;
  /** brez prve palice (nadaljevanje ob vogalu, kjer palica že stoji) */
  brezPrve?: boolean;
};

export function polje(L: number, h: number, r: number, polnilo: Polnilo, M: Materiali, op: OpcijeOgraje = {}) {
  const g = new THREE.Group();
  const k = r / L;
  const okvir = 0.04;
  const dno = op.dno ?? 0.06;
  const zgoraj = (x: number) => x * k + h;
  const spodaj = (x: number) => x * k;
  const odprte = (polnilo === 'palicna' || polnilo === 'vertikalne') && !!op.odprte;
  const razmik = (privzeto: number) => (op.razmik && op.razmik > 0 ? op.razmik : privzeto);

  if (polnilo !== 'horizontalne' && !op.proste) {
    // okvir polja (pri odprtih palicah brez zgornjega profila)
    if (!odprte) g.add(palica(0, h - okvir / 2, L, r + h - okvir / 2, okvir, polnilo === 'palicna' ? 0.06 : 0.05, M.kovina));
    g.add(palica(0, okvir / 2 + dno, L, r + okvir / 2 + dno, okvir, 0.04, M.kovina));
  }
  // prostor za polnilo; proste palice gredo od tal (oz. iz plošče) do vrha
  const notri = op.proste ? { y0: -(op.podaljsaj ?? 0), y1: h } : { y0: dno + okvir, y1: odprte ? h : h - okvir };
  const ys = Math.min(Math.max(op.sipka ?? h - 0.12, (op.proste ? 0 : notri.y0) + 0.1), h - 0.06);
  if (odprte && !op.proste) {
    // čisto tanka okrogla šipka skozi palice, da ostanejo poravnane
    g.add(cev(new THREE.Vector3(0, ys, 0), new THREE.Vector3(L, r + ys, 0), 0.005, M.kovina));
  }

  if (polnilo === 'vertikalne' || polnilo === 'palicna') {
    // proste palice: vse enake kvadratne cevi 40 × 40, nosilna je vsaka palica
    const a = op.proste ? 0.04 : 0.03;
    const b = op.proste ? 0.04 : polnilo === 'vertikalne' ? 0.01 : 0.05;
    const korak = a + (polnilo === 'vertikalne' ? razmik(0.025) : razmik(0.09));
    const seg: [number, number, number, number][] = [];
    if (op.proste) {
      // enakomerno od prve do zadnje palice na robovih; ob vogalu (podest) prva palica odpade, ker že stoji
      const n = Math.max(2, Math.round((L - a) / korak) + 1);
      const korakX = (L - a) / (n - 1);
      for (let i = op.brezPrve ? 1 : 0; i < n; i++) {
        const x = a / 2 + i * korakX;
        seg.push([x, spodaj(x) + notri.y0, x, spodaj(x) + notri.y1]);
      }
      // vezna palica natanko od prve do zadnje palice (ob vogalu se stakne s prejšnjim odsekom)
      const x0 = op.brezPrve ? -a / 2 : a / 2, x1 = L - a / 2;
      g.add(cev(new THREE.Vector3(x0, spodaj(x0) + ys, 0), new THREE.Vector3(x1, spodaj(x1) + ys, 0), 0.005, M.kovina));
    } else {
      const n = Math.max(1, Math.floor((L - 0.04) / korak));
      const zamik = (L - (n - 1) * korak) / 2;
      for (let i = 0; i < n; i++) {
        const x = zamik + i * korak;
        seg.push([x, spodaj(x) + notri.y0, x, spodaj(x) + notri.y1]);
      }
    }
    // profili stojijo pokonci: dolžina po y, presek a × b
    const im = instance(seg, a, b, M.kovina);
    g.add(im);
  } else if (polnilo === 'horizontalne') {
    // lamele 50 × 20 z režo 15 mm, vzporedne z robom (na stopnišču poševne)
    const korak = 0.05 + razmik(0.015);
    const seg: [number, number, number, number][] = [];
    for (let y = dno + 0.01; y < h - 0.02; y += korak) seg.push([0, y, L, r + y]);
    g.add(instance(seg, 0.05, 0.02, M.kovina));
    g.add(palica(0, h, L, r + h, 0.02, 0.06, M.kovina));
  } else if (polnilo === 'zarki') {
    // palice v koordinatah polja (x, v od spodnjega roba) preslikamo na naklon polja
    const visina = notri.y1 - notri.y0;
    const od = op.zarkiOd ?? 0;
    const seg: [number, number, number, number][] = zarkiPolja(op.zarki ?? 'pokoncni', op.zarkiCelota ?? L, od, od + L, visina, razmik(0.13), op.seme ?? 0).map(
      ([x1, v1, x2, v2]) => [x1, x1 * k + notri.y0 + v1, x2, x2 * k + notri.y0 + v2],
    );
    g.add(instance(seg, 0.014, 0.014, M.kovina));
  } else if (polnilo === 'steklo') {
    const steklo = ploskev(L - 0.06, notri.y1 - notri.y0 - 0.02, r - 0.06 * k, M.steklo, 0.012);
    steklo.position.set(0.03, notri.y0 + 0.01 + 0.03 * k, 0);
    steklo.castShadow = false;
    g.add(steklo);
    // držala stekla
    for (const x of [0.25, L - 0.25]) {
      for (const y of [notri.y0 + 0.08, notri.y1 - 0.08]) g.add(skatla(0.05, 0.05, 0.035, M.kovina, x, spodaj(x) + y, 0));
    }
  } else if (polnilo === 'perforirana') {
    const vz = op.vzorec ?? 'kvadrati';
    const hp = notri.y1 - notri.y0;
    const maska = vz === 'po-meri' ? null : maskaVzorca(vz, hp);
    const pl = new THREE.MeshStandardMaterial({
      color: (M.kovina as THREE.MeshStandardMaterial).color,
      metalness: 0.45,
      roughness: 0.5,
      ...(maska ? { alphaMap: maska, alphaTest: 0.5 } : {}),
      side: THREE.DoubleSide,
    });
    g.add(ploskev(L, hp, r, pl, 0.004, true));
    g.children[g.children.length - 1].position.y = notri.y0;
  }

  // spodnji del polja pri polnilih brez okvirja pod polnilom
  void zgoraj;
  return g;
}

/** steber 60 × 60 */
const steber = (x: number, y0: number, visina: number, M: Materiali, z = 0, prerez = 0.06) => {
  const s = skatla(prerez, visina, prerez, M.kovina, x, y0 + visina / 2, z);
  return s;
};

/**
 * Ograja vzdolž osi X: stebri na razmiku do ~1,8 m, polja med njimi.
 * r je skupni dvig (stopnišče), y0 višina tal na začetku.
 */
function ograjaVzdolz(L: number, h: number, polnilo: Polnilo, M: Materiali, r = 0, podStebrom = 0, op: OpcijeOgraje = {}) {
  const g = new THREE.Group();
  if ((polnilo === 'palicna' || polnilo === 'vertikalne') && op.odprte) {
    // odprte palice: brez ločenih stebrov in spodnje letve, vse palice enake in sidrane posebej
    g.add(polje(L, h + 0.02, r, polnilo, M, { ...op, proste: true, podaljsaj: podStebrom }));
    return g;
  }
  const n = Math.max(1, Math.ceil(L / (op.razmikStebrov ?? 1.8) - 1e-6));
  const d = L / n;
  if (op.brezStebrov) {
    // polja brez stebričkov: samo končna profila, pritrjena na nosilno ploščo
    for (const x of [0, L]) g.add(steber(x, (r * x) / L, h + 0.02, M, 0, 0.04));
  } else {
    for (let i = 0; i <= n; i++) {
      const x = i * d;
      g.add(steber(x, (r * x) / L - podStebrom, h + 0.02 + podStebrom, M));
    }
  }
  const reza = op.brezStebrov ? 0.01 : 0.03;
  for (let i = 0; i < n; i++) {
    const p = polje(d - 2 * reza, h - 0.02, (r * (d - 2 * reza)) / L, polnilo, M, { ...op, seme: i, zarkiOd: i * d + reza, zarkiCelota: L });
    p.position.set(i * d + reza, (r * (i * d + reza)) / L, 0);
    g.add(p);
  }
  // ročaj čez vrh pri stopniščih (pri odprtih palicah ga ni)
  if ((r !== 0 || op.rocaj) && !((polnilo === 'palicna' || polnilo === 'vertikalne') && op.odprte)) g.add(palica(-0.05, h + 0.04 - (0.05 * r) / L, L + 0.05, r + h + 0.04 + (0.05 * r) / L, 0.045, 0.06, M.kovina));
  return g;
}

/* ---------------------------------------------------------------- okolica */

function okno(w: number, h: number, M: Materiali) {
  const g = new THREE.Group();
  g.add(skatla(w, h, 0.06, M.okvirOkna));
  g.add(skatla(w - 0.1, h - 0.1, 0.07, M.oknoSteklo));
  g.add(skatla(w + 0.12, 0.05, 0.16, M.beton, 0, -h / 2 - 0.02, 0.05));
  return g;
}

function tla(w: number, d: number, M: Materiali, m: THREE.Material = M.tla) {
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m);
  p.rotation.x = -Math.PI / 2;
  p.receiveShadow = true;
  return p;
}

/* ---------------------------------------------------------------- ograje */

/** podlaga: barva podstavka makete, na katerem model stoji (podstavek doda scena glede na velikost modela) */
export type Model = { skupina: THREE.Group; sredisce: THREE.Vector3; velikost: number; smer?: THREE.Vector3; podlaga?: 'trava' | 'parket' };

export function modelOgraje(o: OgrajaStanje, M: Materiali): Model {
  const g = new THREE.Group();
  const h = o.visina / 100;
  const odprte = (o.polnilo === 'palicna' || o.polnilo === 'vertikalne') && o.zakljucek === 'odprto';
  const op: OpcijeOgraje = {
    vzorec: o.vzorec,
    zarki: o.zarki,
    razmik: o.razmikPolnila > 0 ? o.razmikPolnila / 100 : undefined,
    razmikStebrov: o.razmikStebrov,
    odprte,
    sipka: Math.min(Math.max(o.sipka, o.visina / 2), o.visina - 8) / 100,
  };

  if (o.tip === 'balkonska' || o.tip === 'galerijska') {
    // fasada s ploščo balkona v nadstropju; ograja na robu plošče.
    // Galerija: ista zasnova v notranjosti hiše (stena, plošča s parketom, vrata v sobe, spodaj dnevni prostor).
    const galerija = o.tip === 'galerijska';
    const L = o.dolzina;
    const yPlosce = 2.9;
    const globina = galerija ? 2.2 : 1.6;
    g.add(skatla(L + 1.2, 6.0, 0.3, M.fasada, L / 2, 3.0, -0.15));
    g.add(skatla(L + 0.3, 0.2, globina, galerija ? M.fasada : M.beton, L / 2, yPlosce - 0.1, globina / 2));
    if (galerija) {
      g.add(skatla(L + 0.3, 0.02, globina, M.parket, L / 2, yPlosce + 0.01, globina / 2));
      // vrata v sobe ob galeriji in velika steklena stena v dnevnem prostoru spodaj
      const nVrat = Math.max(1, Math.floor(L / 3.2));
      for (let i = 0; i < nVrat; i++) {
        const x = ((i + 0.5) * L) / nVrat;
        g.add(skatla(0.95, 2.1, 0.04, M.les, x, yPlosce + 1.05, 0.02));
        g.add(skatla(0.04, 0.04, 0.03, M.kovina, x + 0.36, yPlosce + 1.05, 0.06));
      }
      const sp = okno(Math.min(L * 0.7, 6), 2.4, M);
      sp.position.set(L / 2, 1.3, 0.03);
      g.add(sp);
      const ograja = o.montaza === 'stran'
        ? ograjaVzdolz(L, h + Math.max(0, o.podaljsek) / 100, o.polnilo, M, 0, o.brezStebrickov ? 0 : Math.max(0, 0.16 - Math.max(0, o.podaljsek) / 100), { ...op, dno: 0, brezStebrov: o.brezStebrickov, sipka: (op.sipka ?? h / 2) + Math.max(0, o.podaljsek) / 100 })
        : ograjaVzdolz(L, h, o.polnilo, M, 0, 0, op);
      ograja.position.set(0, yPlosce - (o.montaza === 'stran' ? Math.max(0, o.podaljsek) / 100 : 0), globina + (o.montaza === 'stran' ? 0.045 : -0.08));
      g.add(ograja);
      if (o.montaza === 'stran') g.add(skatla(L + 0.04, 0.2, 0.012, M.kovina, L / 2, yPlosce - 0.1, globina + 0.006));
      return { skupina: g, sredisce: new THREE.Vector3(L / 2, yPlosce, globina / 2), velikost: Math.max(L, 5), podlaga: 'parket' };
    }
    // okna in balkonska vrata v nadstropju, okna v pritličju
    const nOken = Math.max(1, Math.floor(L / 2.6));
    for (let i = 0; i < nOken; i++) {
      const x = ((i + 0.5) * L) / nOken;
      const v = i % 2 === 0;
      const zg = okno(v ? 1 : 1.2, v ? 2.2 : 1.3, M);
      zg.position.set(x, yPlosce + (v ? 1.1 : 1.3), 0.03);
      g.add(zg);
      const sp = okno(1.2, 1.3, M);
      sp.position.set(x, 1.4, 0.03);
      g.add(sp);
    }
    if (o.montaza === 'stran') {
      // s strani: nosilna plošča v barvi ograje na čelu in bokih plošče, ograja je pritrjena nanjo.
      // Spodnji rob polja je poravnan s tlemi (0) ali sega niže čez čelo plošče (podaljšek).
      const pod = Math.max(0, o.podaljsek) / 100;
      const opS: OpcijeOgraje = { ...op, dno: 0, brezStebrov: o.brezStebrickov, sipka: (op.sipka ?? h / 2) + pod };
      const visinaPolja = h + pod;
      g.add(skatla(L + 0.32, 0.2, 0.012, M.kovina, L / 2, yPlosce - 0.1, globina + 0.006));
      for (const x of [-0.156, L + 0.156]) g.add(skatla(0.012, 0.2, globina, M.kovina, x, yPlosce - 0.1, globina / 2));
      const ograja = ograjaVzdolz(L + 0.38, visinaPolja, o.polnilo, M, 0, o.brezStebrickov ? 0 : Math.max(0, 0.16 - pod), opS);
      ograja.position.set(-0.19, yPlosce - pod, globina + 0.045);
      g.add(ograja);
      // stranska dela ograje na bokih plošče
      for (const x of [-0.19, L + 0.19]) {
        const st = ograjaVzdolz(globina, visinaPolja, o.polnilo, M, 0, o.brezStebrickov ? 0 : Math.max(0, 0.16 - pod), opS);
        st.rotation.y = Math.PI / 2;
        st.position.set(x, yPlosce - pod, globina + 0.045);
        g.add(st);
      }
    } else {
      const ograja = ograjaVzdolz(L, h, o.polnilo, M, 0, 0, op);
      ograja.position.set(0, yPlosce, globina - 0.08);
      g.add(ograja);
      // stranska dela ograje na koncih balkona
      for (const x of [0, L]) {
        const st = ograjaVzdolz(globina - 0.1, h, o.polnilo, M, 0, 0, op);
        st.rotation.y = Math.PI / 2;
        st.position.set(x, yPlosce, globina - 0.08);
        g.add(st);
      }
    }
    return { skupina: g, sredisce: new THREE.Vector3(L / 2, yPlosce, globina / 2), velikost: Math.max(L, 5) };
  }

  if (o.tip === 'dvoriscna') {
    // dolžina se razporedi okoli parcele: spredaj do 10 m ob vratih, nato obe stranici in zadnja stran
    const L = o.dolzina;
    const vrata = o.vrata !== 'brez';
    const prehod = o.osebniPrehod ? 1 : 0;
    const sv = vrata ? o.sirinaVrat : 0;
    const F = Math.min(L, 10);
    const sirinaParcele = F + prehod + sv + (vrata ? 0.05 : 0);
    let ostanek = L - F;
    const stranica = Math.min(ostanek / 2, 25);
    ostanek -= stranica * 2;
    const zadaj = Math.min(ostanek, sirinaParcele);
    const podzidek = o.montaza === 'podzidek' ? 0.4 : 0;
    // en odsek ograje (s podzidkom ali točkovnimi temelji) vzdolž lokalne osi X
    const odsek = (dol: number) => {
      const k = new THREE.Group();
      if (dol < 0.3) return k;
      if (podzidek) k.add(skatla(dol, podzidek, 0.25, M.beton, dol / 2, podzidek / 2, 0));
      const og = ograjaVzdolz(dol, h, o.polnilo, M, 0, 0, op);
      og.position.y = podzidek;
      k.add(og);
      if (!podzidek) {
        const n = Math.max(1, Math.round(dol / 1.8));
        for (let i = 0; i <= n; i++) k.add(skatla(0.3, 0.04, 0.3, M.betonTemen, (i * dol) / n, 0.02, 0));
      }
      return k;
    };
    // dovoz za vrati
    if (vrata) {
      const dovoz = tla(sv + 0.6, 3.6, M, M.asfalt);
      dovoz.position.set(F + prehod + sv / 2, 0.005, -1.9);
      g.add(dovoz);
    }
    g.add(odsek(F));
    if (stranica >= 0.3) {
      const levo = odsek(stranica);
      levo.rotation.y = Math.PI / 2; // od sprednjega vogala nazaj
      g.add(levo);
      const desno = odsek(stranica);
      desno.rotation.y = Math.PI / 2;
      desno.position.x = sirinaParcele;
      g.add(desno);
    }
    if (zadaj >= 0.3) {
      const zad = odsek(zadaj);
      zad.position.z = -stranica;
      g.add(zad);
    }
    // hiša na parceli, ko je ta dovolj velika
    if (F >= 7 && stranica >= 8) {
      const hw = Math.min(F - 3, 9), hd = Math.min(stranica - 5, 8), hv = 3;
      const cx = 1.5 + hw / 2, cz = -(3 + hd / 2);
      g.add(skatla(hw, hv, hd, M.fasada, cx, hv / 2, cz));
      const streha = new THREE.Shape([new THREE.Vector2(-hd / 2 - 0.4, 0), new THREE.Vector2(hd / 2 + 0.4, 0), new THREE.Vector2(0, 2.2)]);
      const sg = new THREE.ExtrudeGeometry(streha, { depth: hw + 0.6, bevelEnabled: false });
      sg.rotateY(Math.PI / 2);
      sg.translate(cx - hw / 2 - 0.3, hv, cz);
      const st = new THREE.Mesh(sg, M.okvirOkna);
      st.castShadow = true;
      st.receiveShadow = true;
      g.add(st);
      const vh = okno(1.1, 2.1, M);
      vh.position.set(cx + hw * 0.2, 1.05, cz + hd / 2 + 0.03);
      g.add(vh);
      const ok = okno(1.4, 1.2, M);
      ok.position.set(cx - hw * 0.22, 1.5, cz + hd / 2 + 0.03);
      g.add(ok);
    }
    const visinaVrat = h + podzidek;
    let x = F;
    if (prehod) {
      // osebni prehod: krilo, rahlo odprto
      g.add(steber(x + prehod, 0, visinaVrat + 0.05, M, 0, 0.1));
      const krilo = new THREE.Group();
      const p = polje(prehod - 0.12, visinaVrat - 0.08, 0, o.polnilo, M, { ...op, odprte: false });
      p.position.set(0.02, 0.04, 0);
      krilo.add(p);
      krilo.add(skatla(0.04, visinaVrat - 0.06, 0.05, M.kovina, 0.02, visinaVrat / 2, 0));
      krilo.add(skatla(0.04, visinaVrat - 0.06, 0.05, M.kovina, prehod - 0.1, visinaVrat / 2, 0));
      krilo.add(skatla(0.03, 0.16, 0.05, M.motor, prehod - 0.16, visinaVrat * 0.52, 0.04));
      krilo.position.set(x + 0.04, 0, 0);
      krilo.rotation.y = 0.35;
      g.add(krilo);
      x += prehod;
    }
    if (vrata) {
      g.add(steber(x + sv + 0.05, 0, visinaVrat + 0.08, M, 0, 0.12));
      if (!prehod) g.add(steber(x, 0, visinaVrat + 0.08, M, 0, 0.12));
      const okvirVrat = (sirina: number, visina: number) => {
        const k = new THREE.Group();
        const p = polje(sirina - 0.08, visina - 0.06, 0, o.polnilo, M, { ...op, odprte: false });
        p.position.set(0.04, 0.03, 0);
        k.add(p);
        k.add(skatla(0.06, visina, 0.06, M.kovina, 0.03, visina / 2, 0));
        k.add(skatla(0.06, visina, 0.06, M.kovina, sirina - 0.03, visina / 2, 0));
        k.add(skatla(sirina, 0.06, 0.06, M.kovina, sirina / 2, 0.03, 0));
        k.add(skatla(sirina, 0.06, 0.06, M.kovina, sirina / 2, visina - 0.03, 0));
        return k;
      };
      if (o.vrata === 'krilna') {
        const pol = sv / 2;
        for (const [zac, smer] of [[x + 0.06, 1], [x + sv, -1]] as const) {
          const k = okvirVrat(pol - 0.04, visinaVrat - 0.05);
          const tecaj = new THREE.Group();
          k.position.set(smer > 0 ? 0 : -(pol - 0.04), 0.05, 0);
          tecaj.add(k);
          tecaj.position.set(zac, 0, -0.03);
          tecaj.rotation.y = smer > 0 ? 0.55 : -0.55; // krili odprti proti dvorišču
          g.add(tecaj);
        }
      } else {
        // drsna: vodilo na tleh, krilo pomaknjeno čez ograjo; samonosna: daljše krilo s protiutežjo, brez vodila
        const samonosna = o.vrata === 'samonosna';
        const dolzinaKrila = samonosna ? sv * 1.4 : sv;
        const odprto = sv * 0.18;
        const k = okvirVrat(dolzinaKrila, visinaVrat - 0.06);
        k.position.set(x + 0.06 - odprto - (samonosna ? sv * 0.4 : 0), 0.05, -0.12);
        g.add(k);
        if (samonosna) {
          // nosilni vozički na betonskem temelju za ograjo
          g.add(skatla(sv * 0.5, 0.06, 0.3, M.betonTemen, x - sv * 0.25, 0.03, -0.12));
          for (const dx of [-sv * 0.4, -0.15]) g.add(skatla(0.14, 0.1, 0.12, M.motor, x + dx, 0.05, -0.12));
        } else {
          // tirnica vgrajena v tla, krilo vozi po njej na kolescih
          g.add(skatla(sv * 2 + 0.2, 0.006, 0.07, M.betonTemen, x + 0.1, 0.003, -0.12));
          g.add(skatla(sv * 2 + 0.2, 0.012, 0.016, M.kovina, x + 0.1, 0.006, -0.12));
          const kx = x + 0.06 - odprto;
          for (const dx of [0.35, dolzinaKrila - 0.35]) {
            const kolo = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.035, 20), M.motor);
            kolo.rotation.x = Math.PI / 2;
            kolo.position.set(kx + dx, 0.05, -0.12);
            kolo.castShadow = true;
            g.add(kolo);
          }
        }
        if (o.pogon) g.add(skatla(0.26, 0.32, 0.2, M.motor, x - 0.4, 0.16, -0.32));
      }
      if (o.pogon) {
        // signalna luč na stebru
        const l = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.09, 16), M.luc);
        l.position.set(x + sv + 0.05, visinaVrat + 0.13, 0);
        g.add(l);
        g.add(skatla(0.06, 0.1, 0.04, M.motor, x + sv + 0.05, 0.75, 0.08)); // fotocelica
      }
    }
    return { skupina: g, sredisce: new THREE.Vector3(sirinaParcele / 2, 0.8, -stranica / 2), velikost: Math.max(sirinaParcele, stranica) };
  }

  if (o.tip === 'stopniscna-zunanja') {
    // betonske stopnice do vhodnega podesta ob fasadi, ograja ob stopnicah in podestu
    // dolžina ob stopnicah določa število stopnic, podest je ločena mera (vodoravni del ograje)
    const nastop = 0.17, globinaStopnice = 0.3;
    const naStopnico = Math.hypot(globinaStopnice, nastop);
    const n = Math.max(2, Math.round(o.dolzina / naStopnico));
    const dvig = n * nastop;
    const dolzinaStopnic = n * globinaStopnice;
    const sirina = 1.3;
    const ograjaPodesta = Math.max(0, o.podest);
    const podest = Math.max(1.1, ograjaPodesta + 0.1);
    const visinaFasade = dvig + 2.7;
    g.add(skatla(dolzinaStopnic + podest + 1, visinaFasade, 0.3, M.fasada, (dolzinaStopnic + podest) / 2, visinaFasade / 2, -sirina - 0.15));
    // vhodna vrata
    const vr = okno(1.1, 2.15, M);
    vr.position.set(dolzinaStopnic + podest / 2, dvig + 1.08, -sirina + 0.02);
    g.add(vr);
    for (let i = 0; i < n; i++) {
      g.add(skatla(globinaStopnice, nastop * (i + 1), sirina, M.betonTemen, (i + 0.5) * globinaStopnice, (nastop * (i + 1)) / 2, -sirina / 2));
      // rob nastopne ploskve
      g.add(skatla(0.03, 0.012, sirina, M.beton, i * globinaStopnice + 0.015, nastop * (i + 1) + 0.006, -sirina / 2));
    }
    g.add(skatla(podest, dvig, sirina, M.betonTemen, dolzinaStopnic + podest / 2, dvig / 2, -sirina / 2));
    // ograja na zunanjem robu (z = 0): poševni del ob stopnicah, nato vodoravni na podestu
    // odprte palice so pritrjene ob bok stopnic in segajo pod nastopne ploskve (kot pri izvedenih ograjah)
    const ob = odprte ? 0.035 : -0.06;
    const pod = odprte ? 0.28 : 0;
    // poševni del gre po robovih stopnic do zadnje stopnice; ta je že v višini podesta
    // poševni del sledi robovom stopnic do zadnje stopnice, ki je že v višini podesta, zato se vodoravni del
    // nadaljuje na isti višini in z istim ročajem
    const dPos = dolzinaStopnic - globinaStopnice;
    const posevna = ograjaVzdolz(dPos, h, o.polnilo, M, dvig - nastop, pod, op);
    posevna.position.set(0.05, nastop, ob);
    g.add(posevna);
    if (ograjaPodesta >= 0.3 || odprte) {
      const vodoravna = ograjaVzdolz(ograjaPodesta + globinaStopnice, h, o.polnilo, M, 0, pod, { ...op, brezPrve: true, rocaj: true });
      vodoravna.position.set(dPos + 0.05, dvig, ob);
      g.add(vodoravna);
    }
    return { skupina: g, sredisce: new THREE.Vector3((dolzinaStopnic + podest) / 2, dvig * 0.7, -sirina / 2), velikost: dolzinaStopnic + podest + 1.5, smer: new THREE.Vector3(-0.8, 0.45, 1) };
  }

  // notranja stopniščna: kovinska nosilca z lesenimi nastopnimi ploskvami ob steni, ograja na prosti strani
  const nastop = 0.18, globinaStopnice = 0.27;
  const naStopnico = Math.hypot(globinaStopnice, nastop);
  const n = Math.max(3, Math.round(o.dolzina / naStopnico));
  const dvig = n * nastop;
  const dolzinaStopnic = n * globinaStopnice;
  const sirina = 1.0;
  const ograjaZgoraj = Math.max(0, o.podest);
  const zgornji = Math.max(0.8, ograjaZgoraj);
  g.add(skatla(dolzinaStopnic + zgornji + 0.8, dvig + 2.8, 0.2, M.fasada, (dolzinaStopnic + zgornji) / 2, (dvig + 2.8) / 2, -sirina - 0.1));
  // zgornja etaža
  g.add(skatla(zgornji + 0.6, 0.25, sirina + 1.2, M.fasada, dolzinaStopnic + zgornji / 2 + 0.3, dvig - 0.125, -sirina / 2 + 0.6));
  for (let i = 0; i < n; i++) {
    g.add(skatla(globinaStopnice + 0.03, 0.045, sirina, M.les, (i + 0.5) * globinaStopnice, nastop * (i + 1) - 0.022, -sirina / 2));
  }
  // nosilca stopnic (lomljena kovinska nosilca)
  for (const z of [-0.05, -sirina + 0.05]) {
    const n1 = palica(0, 0.05, dolzinaStopnic, dvig - 0.12, 0.2, 0.012, M.kovina);
    n1.position.z = z;
    g.add(n1);
  }
  const obN = odprte ? 0.03 : 0.02;
  const podN = odprte ? 0.22 : 0;
  const dPosN = dolzinaStopnic - globinaStopnice;
  const posevna = ograjaVzdolz(dPosN, h, o.polnilo, M, dvig - nastop, podN, op);
  posevna.position.set(0.1, nastop, obN);
  g.add(posevna);
  if (ograjaZgoraj >= 0.3 || odprte) {
    const vodoravna = ograjaVzdolz(ograjaZgoraj + globinaStopnice, h, o.polnilo, M, 0, podN, { ...op, brezPrve: true, rocaj: true });
    vodoravna.position.set(dPosN + 0.1, dvig, obN);
    g.add(vodoravna);
  }
  return { skupina: g, sredisce: new THREE.Vector3((dolzinaStopnic + zgornji) / 2, dvig * 0.6, -sirina / 2), velikost: dolzinaStopnic + zgornji + 1, smer: new THREE.Vector3(-0.7, 0.35, 1), podlaga: 'parket' };
}

/* ---------------------------------------------------------------- nadstreški */

function kritinaMaterial(k: NadstresekStanje['kritina'], M: Materiali) {
  if (k === 'steklo') return M.steklo;
  if (k === 'polikarbonat') return new THREE.MeshStandardMaterial({ color: 0xe9eeee, transparent: true, opacity: 0.62, roughness: 0.4, side: THREE.DoubleSide, depthWrite: false });
  if (k === 'folija') return new THREE.MeshStandardMaterial({ color: 0xf4f4f0, transparent: true, opacity: 0.85, roughness: 0.8, side: THREE.DoubleSide });
  return new THREE.MeshStandardMaterial({ color: (M.kovina as THREE.MeshStandardMaterial).color.clone().offsetHSL(0, 0, 0.06), metalness: 0.4, roughness: 0.55, side: THREE.DoubleSide });
}

/** trapezna pločevina: valovita ploskev */
function trapezna(sirina: number, globina: number, m: THREE.Material) {
  const geo = new THREE.PlaneGeometry(sirina, globina, Math.max(8, Math.round(sirina / 0.035)), 1);
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const faza = ((x + sirina / 2) / 0.2) % 1;
    p.setZ(i, faza < 0.35 ? 0.035 : faza < 0.5 ? 0.035 * (1 - (faza - 0.35) / 0.15) : faza < 0.85 ? 0 : (0.035 * (faza - 0.85)) / 0.15);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, m);
}

/** material žleba: v barvi konstrukcije, malo bolj svetleč (pločevina) */
function materialZleba(M: Materiali) {
  return new THREE.MeshStandardMaterial({
    color: (M.kovina as THREE.MeshStandardMaterial).color.clone().offsetHSL(0, 0, 0.07),
    metalness: 0.6,
    roughness: 0.32,
    side: THREE.DoubleSide,
  });
}

/** cev med dvema točkama */
function cev(a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material) {
  const dol = a.distanceTo(b);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dol, 20), m);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  mesh.castShadow = true;
  return mesh;
}

/**
 * Viden žleb enokapnice: polkrožen profil z zavihanim robom, zaključni kapi, kljuke in
 * odtočna cev z »labodjim vratom« ob desnem sprednjem stebru ter izlivnim kolenom spodaj.
 */
function zlebEnokapnice(W: number, yS: number, M: Materiali) {
  const g = new THREE.Group();
  const m = materialZleba(M);
  const R = 0.07, t = 0.005;
  const L = W + 0.24;
  const zC = R + 0.02; // os žleba pred sprednjim nosilcem
  const yC = yS + 0.1; // zgornji rob žleba tik pod kritino
  // polkrožen presek (spodnja polovica kroga), izvlečen po dolžini
  const profil = new THREE.Shape();
  profil.absarc(0, 0, R, Math.PI, Math.PI * 2, false);
  profil.lineTo(R - t, 0);
  profil.absarc(0, 0, R - t, Math.PI * 2, Math.PI, true);
  profil.lineTo(-R, 0);
  const geo = new THREE.ExtrudeGeometry(profil, { depth: L, bevelEnabled: false, curveSegments: 20 });
  geo.rotateY(-Math.PI / 2); // presek v ravnini YZ, dolžina po osi X
  geo.translate(L / 2, yC, zC);
  const zleb = new THREE.Mesh(geo, m);
  zleb.castShadow = true;
  zleb.receiveShadow = true;
  g.add(zleb);
  // zavihan sprednji rob (okrogla obroba)
  const rob = cev(new THREE.Vector3(-L / 2, yC, zC + R), new THREE.Vector3(L / 2, yC, zC + R), 0.009, m);
  g.add(rob);
  // zaključni kapi
  for (const x of [-L / 2, L / 2]) {
    const kapa = new THREE.Mesh(new THREE.CircleGeometry(R, 24, Math.PI, Math.PI), m);
    kapa.rotation.y = Math.PI / 2;
    kapa.position.set(x, yC, zC);
    g.add(kapa);
  }
  // kljuke na približno 80 cm
  const nK = Math.max(2, Math.round(L / 0.8));
  for (let i = 0; i <= nK; i++) {
    const x = -L / 2 + 0.08 + (i * (L - 0.16)) / nK;
    const k = new THREE.Mesh(new THREE.TorusGeometry(R + 0.004, 0.006, 6, 20, Math.PI), m);
    k.rotation.set(0, Math.PI / 2, Math.PI);
    k.position.set(x, yC, zC);
    g.add(k);
  }
  // odtočna cev: iz dna žleba poševno k stebru, nato navpično ob stebru, spodaj izlivno koleno
  const xC = W / 2 + 0.07; // tik ob zunanji strani desnega stebra
  const rC = 0.04;
  const p0 = new THREE.Vector3(W / 2 - 0.02, yC - R + 0.01, zC);
  const p1 = new THREE.Vector3(W / 2 - 0.02, yC - R - 0.08, zC);
  const p2 = new THREE.Vector3(xC, yC - R - 0.3, 0.05);
  const p3 = new THREE.Vector3(xC, 0.24, 0.05);
  const p4 = new THREE.Vector3(xC, 0.1, 0.17);
  for (const [a, b] of [[p0, p1], [p1, p2], [p2, p3], [p3, p4]] as const) g.add(cev(a, b, rC, m));
  for (const p of [p1, p2, p3]) {
    const zgib = new THREE.Mesh(new THREE.SphereGeometry(rC, 16, 12), m);
    zgib.position.copy(p);
    g.add(zgib);
  }
  // objemke cevi na steber
  for (const y of [0.7, 1.6]) {
    if (y > p2.y) continue;
    const obj = new THREE.Mesh(new THREE.TorusGeometry(rC + 0.006, 0.007, 6, 18), M.kovina);
    obj.rotation.x = Math.PI / 2;
    obj.position.set(xC, y, 0.05);
    g.add(obj);
    g.add(skatla(0.06, 0.02, 0.02, M.kovina, xC - 0.045, y, 0.05));
  }
  return g;
}

/** box: voda teče skozi steber, spodaj iz sprednje stranice pogleda kratek pravokoten izliv */
function izlivStebra(x: number, prerez: number, M: Materiali) {
  const g = new THREE.Group();
  const m = materialZleba(M);
  const izliv = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.11), m);
  izliv.position.set(0, 0, 0.055);
  izliv.castShadow = true;
  g.add(izliv);
  // temna odprtina na koncu
  const odprtina = new THREE.Mesh(new THREE.PlaneGeometry(0.036, 0.022), new THREE.MeshBasicMaterial({ color: 0x15181a }));
  odprtina.position.set(0, 0, 0.111);
  g.add(odprtina);
  g.rotation.x = 0.18; // rahlo navzdol
  g.position.set(x, 0.16, 0);
  void prerez;
  return g;
}

export function modelNadstreska(n: NadstresekStanje, M: Materiali): Model {
  const g = new THREE.Group();
  const W = n.sirina, D = n.globina, H = n.visina;
  const obObjektu = n.postavitev === 'ob-objektu';
  const enokapnica = n.tip === 'enokapnica';
  const naklon = enokapnica ? Math.min(0.45, D * 0.11) : 0.04; // dvig zadnjega roba
  const prerez = 0.12;
  const zadaj = -D; // z zadnjega roba (stena)

  const tlakovano = tla(W + 0.6, D + 0.6, M, M.tla);
  tlakovano.position.set(0, 0.004, -D / 2);
  g.add(tlakovano);

  if (obObjektu) {
    g.add(skatla(W + 1.4, H + 1.4, 0.3, M.fasada, 0, (H + 1.4) / 2, zadaj - 0.15));
    const vr = okno(1.1, 2.2, M);
    vr.position.set(-W * 0.18, 1.1, zadaj + 0.02);
    g.add(vr);
    const ok = okno(1.4, 1.3, M);
    ok.position.set(W * 0.22, 1.45, zadaj + 0.02);
    g.add(ok);
  }

  // stebri: spredaj vedno, zadaj samo pri samostojnem; od širine 6 m vmesni steber na sredini
  const xs = W >= 6 ? [-W / 2 + prerez / 2, 0, W / 2 - prerez / 2] : [-W / 2 + prerez / 2, W / 2 - prerez / 2];
  for (const x of xs) {
    g.add(skatla(prerez, H, prerez, M.kovina, x, H / 2, -prerez / 2));
    if (!obObjektu) g.add(skatla(prerez, H + naklon, prerez, M.kovina, x, (H + naklon) / 2, zadaj + prerez / 2));
  }

  const yS = H, yZ = H + naklon; // višina strehe spredaj in zadaj
  const nagib = Math.atan2(naklon, D);

  if (n.tip === 'box') {
    // odtok je speljan skozi sprednja vogalna stebra, spodaj iz stebra pogleda kratek izliv
    for (const sx of [-1, 1]) g.add(izlivStebra(sx * (W / 2 - prerez / 2), prerez, M));
    // ravna streha, skrita v obodnem okvirju višine 25 cm (žleb je v okvirju)
    const v = 0.25;
    g.add(skatla(W, v, 0.08, M.kovina, 0, yS + v / 2, -0.04));
    g.add(skatla(W, v, 0.08, M.kovina, 0, yS + v / 2, zadaj + 0.04));
    g.add(skatla(0.08, v, D, M.kovina, -W / 2 + 0.04, yS + v / 2, -D / 2));
    g.add(skatla(0.08, v, D, M.kovina, W / 2 - 0.04, yS + v / 2, -D / 2));
  } else {
    // enokapnica: nosilec spredaj z vidnim žlebom in odtočno cevjo, nosilec zadaj (na steni ali stebrih)
    g.add(skatla(W + 0.1, 0.16, 0.12, M.kovina, 0, yS + 0.06, -0.06));
    g.add(skatla(W, 0.14, 0.1, M.kovina, 0, yZ + 0.05, zadaj + 0.06));
    g.add(zlebEnokapnice(W, yS, M));
  }

  // špirovci
  const nSp = Math.max(2, Math.round(W / 0.95));
  for (let i = 0; i <= nSp; i++) {
    const x = -W / 2 + 0.03 + (i * (W - 0.06)) / nSp;
    const s = skatla(0.06, 0.1, Math.hypot(D, naklon), M.kovina, x, (yS + yZ) / 2 + 0.07, -D / 2);
    s.rotation.x = nagib;
    g.add(s);
  }

  // kritina
  const km = kritinaMaterial(n.kritina, M);
  const strehaD = Math.hypot(D, naklon);
  const sendvic = n.kritina === 'trapezna';
  const streha = sendvic ? trapezna(W - 0.04, strehaD, km) : new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, strehaD, n.kritina === 'steklo' ? 0.012 : 0.008), km);
  streha.rotation.x = -Math.PI / 2 + nagib;
  streha.position.set(0, (yS + yZ) / 2 + (sendvic ? 0.17 : 0.13), -D / 2);
  streha.castShadow = sendvic || n.kritina === 'folija';
  streha.receiveShadow = true;
  g.add(streha);
  if (sendvic) {
    // sendvič panel: valovita zgornja pločevina, izolacija in ravna spodnja pločevina
    const jedro = new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, strehaD, 0.04), new THREE.MeshStandardMaterial({ color: 0xe6e3da, roughness: 0.9 }));
    jedro.rotation.x = -Math.PI / 2 + nagib;
    jedro.position.set(0, (yS + yZ) / 2 + 0.145, -D / 2);
    jedro.castShadow = true;
    jedro.receiveShadow = true;
    g.add(jedro);
  }

  // stranske stene: lamele (fiksne ali mehanske) v okvirju, prekati po 1,5 m
  const meh = n.stenaTip === 'mehanske';
  for (const [vkljuceno, x] of [[n.stranLevo, -W / 2 + 0.06], [n.stranDesno, W / 2 - 0.06]] as const) {
    if (!vkljuceno) continue;
    const st = new THREE.Group();
    const z0 = -0.12, z1 = zadaj + (obObjektu ? 0.02 : 0.12);
    const dol = z0 - z1;
    const yTop = (z: number) => yS + ((yZ - yS) * (z0 - z)) / dol - 0.02;
    const nP = Math.max(1, Math.ceil(dol / 1.5 - 1e-6));
    // okvir: spodnji profil in pokončni prekati
    st.add(skatla(0.05, 0.05, dol, M.kovina, 0, 0.1, (z0 + z1) / 2));
    for (let i = 0; i <= nP; i++) {
      const z = z0 - (dol * i) / nP;
      st.add(skatla(0.05, yTop(z) - 0.08, 0.05, M.kovina, 0, (yTop(z) + 0.08) / 2, z));
    }
    const seg: [number, number, number, number][] = [];
    if (n.stenaSmer === 'horizontalne') {
      const korak = meh ? 0.12 : 0.09;
      for (let y = 0.2; y < yS - 0.04; y += korak) seg.push([z1, y, z0, y]);
      const im = instance(seg, meh ? 0.1 : 0.07, 0.02, M.kovina);
      // mehanske lamele so nagnjene (odprte)
      if (meh) im.rotation.x = 0;
      const grp = new THREE.Group();
      grp.add(im);
      grp.rotation.y = -Math.PI / 2;
      st.add(grp);
      if (meh) {
        im.instanceMatrix.needsUpdate = true;
        const m4 = new THREE.Matrix4();
        const nag = new THREE.Matrix4().makeRotationX(0.6);
        for (let i = 0; i < seg.length; i++) {
          im.getMatrixAt(i, m4);
          const poz = new THREE.Vector3().setFromMatrixPosition(m4);
          const sk = new THREE.Vector3(); const q = new THREE.Quaternion();
          m4.decompose(poz, q, sk);
          m4.compose(poz, new THREE.Quaternion().setFromRotationMatrix(nag), sk);
          im.setMatrixAt(i, m4);
        }
      }
    } else {
      const korak = meh ? 0.13 : 0.1;
      for (let z = z0 - 0.06; z > z1 + 0.04; z -= korak) seg.push([0, 0.13, 0, yTop(z) - 0.04]);
      // pokončne lamele: vsaka na svoji globini
      const im = instance(seg, meh ? 0.1 : 0.07, 0.02, M.kovina);
      const m4 = new THREE.Matrix4();
      let i = 0;
      for (let z = z0 - 0.06; z > z1 + 0.04; z -= korak) {
        im.getMatrixAt(i, m4);
        const poz = new THREE.Vector3(), q = new THREE.Quaternion(), sk = new THREE.Vector3();
        m4.decompose(poz, q, sk);
        poz.z = z;
        // lamela leži pravokotno na steno; mehanske so zasukane
        const zasuk = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2 + (meh ? 0.6 : 0));
        m4.compose(poz, zasuk.multiply(q), sk);
        im.setMatrixAt(i++, m4);
      }
      im.instanceMatrix.needsUpdate = true;
      st.add(im);
    }
    st.position.x = x;
    g.add(st);
  }

  return { skupina: g, sredisce: new THREE.Vector3(0, H * 0.55, -D / 2), velikost: Math.max(W, D) + 2 };
}

/** sprosti geometrije in materiale (ob vsaki spremembi zgradimo model znova) */
export function sprosti(o: THREE.Object3D) {
  o.traverse((x) => {
    const m = x as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((y) => !y.userData.trajen && y.dispose());
    else if (mat && !mat.userData.trajen && !(mat as THREE.MeshStandardMaterial).alphaMap) mat.dispose();
  });
}

/**
 * Podstavek makete: zaobljena plošča, ki se prilagodi velikosti modela, da nič ne sega čez rob.
 * Zgornja ploskev je na višini 0, model stoji na njej.
 */
export function podstavek(model: THREE.Object3D, podlaga: 'trava' | 'parket' = 'trava') {
  const box = new THREE.Box3().setFromObject(model);
  const rob = 0.9;
  const x1 = box.min.x - rob, x2 = box.max.x + rob;
  const z1 = box.min.z - rob, z2 = box.max.z + rob;
  const w = x2 - x1, d = z2 - z1;
  const r = Math.min(0.6, w / 6, d / 6);
  const oblika = new THREE.Shape();
  oblika.moveTo(-w / 2 + r, -d / 2);
  oblika.lineTo(w / 2 - r, -d / 2);
  oblika.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
  oblika.lineTo(w / 2, d / 2 - r);
  oblika.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
  oblika.lineTo(-w / 2 + r, d / 2);
  oblika.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
  oblika.lineTo(-w / 2, -d / 2 + r);
  oblika.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  const deb = 0.22;
  const geo = new THREE.ExtrudeGeometry(oblika, { depth: deb, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 10 });
  geo.rotateX(-Math.PI / 2); // ploskev obliko postavi vodoravno, debelina gre navzgor
  geo.translate((x1 + x2) / 2, -deb - 0.03, (z1 + z2) / 2);
  const zgoraj = new THREE.MeshStandardMaterial({ color: podlaga === 'parket' ? 0xcbb795 : 0xd5d9d1, roughness: 0.95 });
  const stran = new THREE.MeshStandardMaterial({ color: podlaga === 'parket' ? 0x9c8665 : 0xb2b8ae, roughness: 0.9 });
  // ExtrudeGeometry: skupina 0 = ploskvi (spodaj, zgoraj), skupina 1 = stranice
  const mesh = new THREE.Mesh(geo, [zgoraj, stran]);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.name = 'podstavek';
  return mesh;
}
