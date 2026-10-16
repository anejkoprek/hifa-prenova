// 3D modeli za konfigurator: ograje (balkonska, dvoriščna z vrati, zunanja in notranja stopniščna) in nadstreški.
// Vse mere so v metrih, os y kaže navzgor. Funkcije sprejmejo isto stanje kot 2D risba, zato se oba pogleda vedno ujemata.
import * as THREE from 'three';
import type { OgrajaStanje, NadstresekStanje } from './konfigurator';
import type { Polnilo } from './risbe/ograja';
import { ralHex } from './ral';

/* ---------------------------------------------------------------- materiali */

export type Materiali = ReturnType<typeof ustvariMateriale>;

export function ustvariMateriale(ral: string, material: string) {
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

/** prozorna ali perforirana ploskev v obliki paralelograma */
function ploskev(L: number, h: number, r: number, m: THREE.Material, debelina = 0.01) {
  const oblika = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(L, r), new THREE.Vector2(L, r + h), new THREE.Vector2(0, h)]);
  const geo = new THREE.ExtrudeGeometry(oblika, { depth: debelina, bevelEnabled: false });
  geo.translate(0, 0, -debelina / 2);
  // UV: u po dolžini, v po višini ploskve (neodvisno od naklona), da je perforacija vedno vodoravna z robom
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const poz = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < poz.count; i++) {
    const x = poz.getX(i), y = poz.getY(i);
    uv.setXY(i, x / L, (y - (x * r) / L) / h);
  }
  const mesh = new THREE.Mesh(geo, m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

let perforacija: THREE.CanvasTexture | null = null;
/** maska za pločevino: polna pločevina z vodoravnim trakom luknjic */
function teksturaPerforacije() {
  if (perforacija || typeof document === 'undefined') return perforacija;
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fff';
  g.fillRect(0, 0, 512, 512);
  g.fillStyle = '#000';
  for (let y = 300; y < 420; y += 18) for (let x = 6 + ((y / 18) % 2) * 9; x < 512; x += 18) {
    g.beginPath(); g.arc(x, 512 - y, 5, 0, Math.PI * 2); g.fill();
  }
  perforacija = new THREE.CanvasTexture(c);
  perforacija.wrapS = THREE.RepeatWrapping;
  return perforacija;
}

/* ---------------------------------------------------------------- polje ograje */

/**
 * Eno polje ograje v ravnini XY: od (0,0) do (L, r) spodaj, višina h. r je dvig (za stopnišča).
 * Okvir: zgornji in spodnji profil, polnilo med njima. Stebri niso del polja.
 */
export function polje(L: number, h: number, r: number, polnilo: Polnilo, M: Materiali) {
  const g = new THREE.Group();
  const k = r / L;
  const okvir = 0.04;
  const zgoraj = (x: number) => x * k + h;
  const spodaj = (x: number) => x * k;

  if (polnilo !== 'horizontalne') {
    // okvir polja
    g.add(palica(0, h - okvir / 2, L, r + h - okvir / 2, okvir, 0.05, M.kovina));
    g.add(palica(0, okvir / 2 + 0.06, L, r + okvir / 2 + 0.06, okvir, 0.04, M.kovina));
  }
  const notri = { y0: 0.06 + okvir, y1: h - okvir }; // prostor za polnilo

  if (polnilo === 'vertikalne' || polnilo === 'palicna') {
    const korak = polnilo === 'vertikalne' ? 0.055 : 0.12;
    const [a, b] = polnilo === 'vertikalne' ? [0.03, 0.01] : [0.03, 0.05];
    const seg: [number, number, number, number][] = [];
    const n = Math.max(1, Math.floor((L - 0.04) / korak));
    const zamik = (L - (n - 1) * korak) / 2;
    for (let i = 0; i < n; i++) {
      const x = zamik + i * korak;
      seg.push([x, spodaj(x) + notri.y0, x, spodaj(x) + notri.y1]);
    }
    // profili stojijo pokonci: dolžina po y, presek a × b
    const im = instance(seg, a, b, M.kovina);
    g.add(im);
  } else if (polnilo === 'horizontalne') {
    // lamele 50 × 20 z režo 15 mm, vzporedne z robom (na stopnišču poševne)
    const korak = 0.065;
    const seg: [number, number, number, number][] = [];
    for (let y = 0.07; y < h - 0.02; y += korak) seg.push([0, y, L, r + y]);
    g.add(instance(seg, 0.05, 0.02, M.kovina));
    g.add(palica(0, h, L, r + h, 0.02, 0.06, M.kovina));
  } else if (polnilo === 'zarki') {
    const korak = 0.13;
    const seg: [number, number, number, number][] = [];
    const visina = notri.y1 - notri.y0;
    const raztezek = L + visina + Math.abs(r);
    for (let s = -raztezek; s < raztezek; s += korak) {
      for (const smer of [1, -1]) {
        const o = obrezi([s, notri.y0], [1, smer], L, visina, r);
        if (o) seg.push([o[0], o[1] + notri.y0, o[2], o[3] + notri.y0]);
      }
    }
    g.add(instance(seg, 0.012, 0.012, M.kovina));
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
    const pl = new THREE.MeshStandardMaterial({
      color: (M.kovina as THREE.MeshStandardMaterial).color,
      metalness: 0.45,
      roughness: 0.5,
      alphaMap: teksturaPerforacije(),
      alphaTest: 0.5,
      side: THREE.DoubleSide,
    });
    const tex = pl.alphaMap;
    if (tex) tex.repeat.set(Math.max(1, Math.round(L / 1.2)), 1);
    g.add(ploskev(L, notri.y1 - notri.y0, r, pl, 0.004));
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
function ograjaVzdolz(L: number, h: number, polnilo: Polnilo, M: Materiali, r = 0, podStebrom = 0) {
  const g = new THREE.Group();
  const n = Math.max(1, Math.round(L / 1.8));
  const d = L / n;
  for (let i = 0; i <= n; i++) {
    const x = i * d;
    g.add(steber(x, (r * x) / L - podStebrom, h + 0.02 + podStebrom, M));
  }
  for (let i = 0; i < n; i++) {
    const p = polje(d - 0.06, h - 0.02, (r * (d - 0.06)) / L, polnilo, M);
    p.position.set(i * d + 0.03, (r * (i * d + 0.03)) / L, 0);
    g.add(p);
  }
  // ročaj čez vrh pri stopniščih
  if (r !== 0) g.add(palica(-0.05, h + 0.04 - (0.05 * r) / L, L + 0.05, r + h + 0.04 + (0.05 * r) / L, 0.045, 0.06, M.kovina));
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

export type Model = { skupina: THREE.Group; sredisce: THREE.Vector3; velikost: number; smer?: THREE.Vector3 };

export function modelOgraje(o: OgrajaStanje, M: Materiali): Model {
  const g = new THREE.Group();
  const h = o.visina / 100;

  if (o.tip === 'balkonska') {
    // fasada s ploščo balkona v nadstropju; ograja na robu plošče
    const L = Math.min(o.dolzina, 24);
    const yPlosce = 2.9;
    const globina = 1.6;
    g.add(tla(L + 12, 14, M, M.trava));
    g.add(skatla(L + 3, 6.2, 0.3, M.fasada, L / 2, 3.1, -0.15));
    g.add(skatla(L + 0.3, 0.2, globina, M.beton, L / 2, yPlosce - 0.1, globina / 2));
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
    const ograja = ograjaVzdolz(L, h, o.polnilo, M, 0, o.montaza === 'stran' ? 0.22 : 0);
    if (o.montaza === 'stran') {
      ograja.position.set(0, yPlosce, globina + 0.06);
      // konzole na čelu plošče
      const n = Math.max(1, Math.round(L / 1.8));
      for (let i = 0; i <= n; i++) g.add(skatla(0.1, 0.16, 0.06, M.kovina, (i * L) / n, yPlosce - 0.1, globina + 0.03));
    } else {
      ograja.position.set(0, yPlosce, globina - 0.08);
    }
    g.add(ograja);
    // stranski deli ograje na koncih balkona
    for (const [x, smer] of [[0, 1], [L, -1]] as const) {
      const st = ograjaVzdolz(globina - 0.1, h, o.polnilo, M, 0, o.montaza === 'stran' ? 0.22 : 0);
      st.rotation.y = smer > 0 ? Math.PI / 2 : Math.PI / 2;
      st.position.set(x, yPlosce, globina - 0.08);
      st.rotation.y = Math.PI / 2;
      g.add(st);
    }
    return { skupina: g, sredisce: new THREE.Vector3(L / 2, yPlosce, globina / 2), velikost: Math.max(L, 5) };
  }

  if (o.tip === 'dvoriscna') {
    const L = Math.min(o.dolzina, 40);
    const vrata = o.vrata !== 'brez';
    const prehod = o.osebniPrehod ? 1 : 0;
    const sv = vrata ? o.sirinaVrat : 0;
    const skupaj = L + prehod + sv;
    const podzidek = o.montaza === 'podzidek' ? 0.4 : 0;
    g.add(tla(skupaj + 16, 18, M, M.trava));
    // dovoz za vrati
    if (vrata) {
      const dovoz = tla(sv + 0.6, 9, M, M.asfalt);
      dovoz.position.set(L + prehod + sv / 2, 0.005, -3);
      g.add(dovoz);
    }
    if (podzidek) g.add(skatla(L, podzidek, 0.25, M.beton, L / 2, podzidek / 2, 0));
    const ograja = ograjaVzdolz(L, h, o.polnilo, M);
    ograja.position.set(0, podzidek, 0);
    g.add(ograja);
    if (!podzidek) {
      // točkovni temelji
      const n = Math.max(1, Math.round(L / 1.8));
      for (let i = 0; i <= n; i++) g.add(skatla(0.3, 0.04, 0.3, M.betonTemen, (i * L) / n, 0.02, 0));
    }
    const visinaVrat = h + podzidek;
    let x = L;
    if (prehod) {
      // osebni prehod: krilo, rahlo odprto
      g.add(steber(x + prehod, 0, visinaVrat + 0.05, M, 0, 0.1));
      const krilo = new THREE.Group();
      const p = polje(prehod - 0.12, visinaVrat - 0.08, 0, o.polnilo, M);
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
        const p = polje(sirina - 0.08, visina - 0.06, 0, o.polnilo, M);
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
          g.add(skatla(sv * 2 + 0.2, 0.02, 0.05, M.kovina, x + 0.1, 0.01, -0.12));
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
    // kamera gleda na vrata in zadnjih nekaj metrov ograje, ostala ograja se izgubi v daljavi
    const fokus = Math.max(0, skupaj - (sv + prehod + 5));
    return { skupina: g, sredisce: new THREE.Vector3((fokus + skupaj) / 2, 0.8, 0), velikost: Math.min(skupaj, sv + prehod + 3.5) };
  }

  if (o.tip === 'stopniscna-zunanja') {
    // betonske stopnice do vhodnega podesta ob fasadi, ograja ob stopnicah in podestu
    const nastop = 0.17, globinaStopnice = 0.3;
    const n = 7;
    const dvig = n * nastop;
    const dolzinaStopnic = n * globinaStopnice;
    const sirina = 1.3;
    const podest = Math.max(1.2, Math.min(o.dolzina - Math.hypot(dolzinaStopnic, dvig), 6));
    g.add(tla(14, 12, M, M.trava));
    g.add(skatla(dolzinaStopnic + podest + 4, 4.2, 0.3, M.fasada, (dolzinaStopnic + podest) / 2, 2.1, -sirina - 0.15));
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
    const posevna = ograjaVzdolz(dolzinaStopnic, h, o.polnilo, M, dvig);
    posevna.position.set(0.05, nastop, -0.06);
    g.add(posevna);
    const vodoravna = ograjaVzdolz(podest - 0.05, h, o.polnilo, M);
    vodoravna.position.set(dolzinaStopnic + 0.05, dvig, -0.06);
    g.add(vodoravna);
    return { skupina: g, sredisce: new THREE.Vector3((dolzinaStopnic + podest) / 2, dvig * 0.7, -sirina / 2), velikost: dolzinaStopnic + podest + 1.5, smer: new THREE.Vector3(-0.8, 0.45, 1) };
  }

  // notranja stopniščna: kovinska nosilca z lesenimi nastopnimi ploskvami ob steni, ograja na prosti strani
  const nastop = 0.18, globinaStopnice = 0.27;
  const n = 15;
  const dvig = n * nastop;
  const dolzinaStopnic = n * globinaStopnice;
  const sirina = 1.0;
  const zgornji = Math.max(0.6, Math.min(o.dolzina - Math.hypot(dolzinaStopnic, dvig), 5));
  g.add(tla(dolzinaStopnic + zgornji + 6, 8, M, M.parket));
  g.add(skatla(dolzinaStopnic + zgornji + 3, dvig + 2.8, 0.2, M.fasada, (dolzinaStopnic + zgornji) / 2, (dvig + 2.8) / 2, -sirina - 0.1));
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
  const posevna = ograjaVzdolz(dolzinaStopnic, h, o.polnilo, M, dvig);
  posevna.position.set(0.1, nastop, 0.02);
  g.add(posevna);
  const vodoravna = ograjaVzdolz(zgornji, h, o.polnilo, M);
  vodoravna.position.set(dolzinaStopnic + 0.1, dvig, 0.02);
  g.add(vodoravna);
  return { skupina: g, sredisce: new THREE.Vector3((dolzinaStopnic + zgornji) / 2, dvig * 0.6, -sirina / 2), velikost: dolzinaStopnic + zgornji + 1, smer: new THREE.Vector3(-0.7, 0.35, 1) };
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

export function modelNadstreska(n: NadstresekStanje, M: Materiali): Model {
  const g = new THREE.Group();
  const W = n.sirina, D = n.globina, H = n.visina;
  const obObjektu = n.postavitev === 'ob-objektu';
  const enokapnica = n.tip === 'enokapnica';
  const naklon = enokapnica ? Math.min(0.45, D * 0.11) : 0.04; // dvig zadnjega roba
  const prerez = 0.12;
  const zadaj = -D; // z zadnjega roba (stena)

  g.add(tla(W + 14, D + 14, M, M.trava));
  const tlakovano = tla(W + 0.6, D + 0.6, M, M.tla);
  tlakovano.position.set(0, 0.004, -D / 2);
  g.add(tlakovano);

  if (obObjektu) {
    g.add(skatla(W + 5, H + 3.2, 0.3, M.fasada, 0, (H + 3.2) / 2, zadaj - 0.15));
    const vr = okno(1.1, 2.2, M);
    vr.position.set(-W * 0.18, 1.1, zadaj + 0.02);
    g.add(vr);
    const ok = okno(1.4, 1.3, M);
    ok.position.set(W * 0.22, 1.45, zadaj + 0.02);
    g.add(ok);
    const ok2 = okno(1.2, 1.3, M);
    ok2.position.set(0, H + 1.6, zadaj + 0.02);
    g.add(ok2);
  }

  // stebri: spredaj vedno, zadaj samo pri samostojnem; vmesni steber pri širokih
  const xs = W > 4.8 ? [-W / 2 + prerez / 2, 0, W / 2 - prerez / 2] : [-W / 2 + prerez / 2, W / 2 - prerez / 2];
  for (const x of xs) {
    g.add(skatla(prerez, H, prerez, M.kovina, x, H / 2, -prerez / 2));
    if (!obObjektu) g.add(skatla(prerez, H + naklon, prerez, M.kovina, x, (H + naklon) / 2, zadaj + prerez / 2));
  }

  const yS = H, yZ = H + naklon; // višina strehe spredaj in zadaj
  const nagib = Math.atan2(naklon, D);

  if (n.tip === 'box') {
    // ravna streha, skrita v obodnem okvirju višine 25 cm (žleb je v okvirju)
    const v = 0.25;
    g.add(skatla(W, v, 0.08, M.kovina, 0, yS + v / 2, -0.04));
    g.add(skatla(W, v, 0.08, M.kovina, 0, yS + v / 2, zadaj + 0.04));
    g.add(skatla(0.08, v, D, M.kovina, -W / 2 + 0.04, yS + v / 2, -D / 2));
    g.add(skatla(0.08, v, D, M.kovina, W / 2 - 0.04, yS + v / 2, -D / 2));
  } else {
    // enokapnica: žleb spredaj, nosilec zadaj (na steni ali stebrih), špirovci po naklonu
    g.add(skatla(W + 0.1, 0.16, 0.14, M.kovina, 0, yS + 0.06, -0.05));
    g.add(skatla(W, 0.14, 0.1, M.kovina, 0, yZ + 0.05, zadaj + 0.06));
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
  const streha = n.kritina === 'trapezna' ? trapezna(W - 0.04, strehaD, km) : new THREE.Mesh(new THREE.BoxGeometry(W - 0.04, strehaD, n.kritina === 'steklo' ? 0.012 : 0.008), km);
  streha.rotation.x = -Math.PI / 2 + nagib;
  streha.position.set(0, (yS + yZ) / 2 + 0.13, -D / 2);
  streha.castShadow = n.kritina === 'trapezna' || n.kritina === 'folija';
  streha.receiveShadow = true;
  g.add(streha);

  // stranske stene iz stekla
  for (const [vkljuceno, x] of [[n.stranLevo, -W / 2 + 0.03], [n.stranDesno, W / 2 - 0.03]] as const) {
    if (!vkljuceno) continue;
    const st = ploskev(D - 0.15, H - 0.08, 0, M.steklo, 0.01);
    st.rotation.y = Math.PI / 2;
    st.position.set(x, 0.04, -0.07);
    st.castShadow = false;
    g.add(st);
    g.add(skatla(0.05, 0.05, D, M.kovina, x, 0.025, -D / 2));
  }

  return { skupina: g, sredisce: new THREE.Vector3(0, H * 0.55, -D / 2), velikost: Math.max(W, D) + 2 };
}

/** sprosti geometrije in materiale (ob vsaki spremembi zgradimo model znova) */
export function sprosti(o: THREE.Object3D) {
  o.traverse((x) => {
    const m = x as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((y) => y.dispose());
    else if (mat && !(mat as THREE.MeshStandardMaterial).alphaMap) mat.dispose();
  });
}
