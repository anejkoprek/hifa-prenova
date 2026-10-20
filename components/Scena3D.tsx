'use client';

// 3D pogled konfiguratorja. Naloži se šele, ko obiskovalec klikne »3D pogled« (three.js je ~150 kB),
// model se ob vsaki izbiri zgradi znova, kamera pa ostane, kjer jo je obiskovalec pustil.
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ArrowCounterClockwise, HandGrabbing } from '@phosphor-icons/react';
import type { NadstresekStanje, OgrajaStanje } from '@/lib/konfigurator';
import { modelNadstreska, modelOgraje, podstavek, sprosti, ustvariMateriale } from '@/lib/model3d';
import s from './Scena3D.module.css';

type Props =
  | { izdelek: 'ograja'; ograja: OgrajaStanje; nadstresek?: never }
  | { izdelek: 'nadstresek'; nadstresek: NadstresekStanje; ograja?: never };

type Svet = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  model: THREE.Group | null;
  zahtevaj: () => void;
  pogled: (animiraj: boolean) => void;
  okvir: { sredisce: THREE.Vector3; velikost: number; smer?: THREE.Vector3 } | null;
};

const ease = (t: number) => 1 - Math.pow(1 - t, 4); // močan ease-out za uvodni približek kamere

export default function Scena3D(props: Props) {
  const gostitelj = useRef<HTMLDivElement>(null);
  const svet = useRef<Svet | null>(null);
  const [napaka, setNapaka] = useState(false);
  const zadnjiTip = useRef<string>('');

  // postavitev scene (enkrat)
  useEffect(() => {
    const el = gostitelj.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      setNapaka(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // ozadje: nežen navpičen prehod, kot fotografija makete v studiu
    const platno = document.createElement('canvas');
    platno.width = 2; platno.height = 256;
    const cx = platno.getContext('2d')!;
    const grad = cx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#f3f4f2');
    grad.addColorStop(1, '#d6dad5');
    cx.fillStyle = grad; cx.fillRect(0, 0, 2, 256);
    const ozadje = new THREE.CanvasTexture(platno);
    ozadje.colorSpace = THREE.SRGBColorSpace;
    scene.background = ozadje;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.38;

    scene.add(new THREE.HemisphereLight(0xffffff, 0xa9aea5, 0.7));
    const sonce = new THREE.DirectionalLight(0xfff8ef, 2.4);
    sonce.position.set(-8, 14, 10);
    sonce.castShadow = true;
    sonce.shadow.mapSize.set(2048, 2048);
    sonce.shadow.bias = -0.0004;
    sonce.shadow.normalBias = 0.02;
    sonce.shadow.radius = 4;
    scene.add(sonce, sonce.target);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.49; // ne pod tla
    controls.enablePan = false;

    let animacija = 0;
    let tece = false;
    let vidno = true;
    const zanka = () => {
      const premik = controls.update();
      renderer.render(scene, camera);
      if (premik || animacija) requestAnimationFrame(zanka);
      else tece = false;
    };
    const zahtevaj = () => {
      if (tece || !vidno) return;
      tece = true;
      requestAnimationFrame(zanka);
    };
    controls.addEventListener('change', zahtevaj);
    controls.addEventListener('start', () => el.setAttribute('data-vlece', ''));
    controls.addEventListener('end', () => el.removeAttribute('data-vlece'));

    const velikost = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      zahtevaj();
    };
    const ro = new ResizeObserver(velikost);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      vidno = e.isIntersecting;
      if (vidno) zahtevaj();
    });
    io.observe(el);

    const zmanjsano = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const pogled = (animiraj: boolean) => {
      const o = svet.current?.okvir;
      if (!o) return;
      // kamera tako daleč, da cel model s podstavkom (krogla okoli njega) pade v vidno polje
      const vfov = THREE.MathUtils.degToRad(camera.fov);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
      const razdalja = (o.velikost / Math.sin(Math.min(vfov, hfov) / 2)) * 0.9;
      const smer = (o.smer ?? new THREE.Vector3(0.55, 0.42, 1)).clone().normalize();
      const cilj = o.sredisce.clone().add(smer.multiplyScalar(razdalja));
      controls.target.copy(o.sredisce);
      controls.minDistance = razdalja * 0.35;
      controls.maxDistance = razdalja * 2.2;
      // senca pokrije cel model
      const r = o.velikost + 1;
      Object.assign(sonce.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 0.5, far: 60 });
      sonce.shadow.camera.updateProjectionMatrix();
      sonce.target.position.copy(o.sredisce);
      sonce.position.copy(o.sredisce).add(new THREE.Vector3(-8, 14, 10));

      if (!animiraj || zmanjsano) {
        camera.position.copy(cilj);
        controls.update();
        zahtevaj();
        return;
      }
      // uvod: kamera pripelje od daleč in malo od strani (900 ms, ease-out)
      const zacetek = o.sredisce.clone().add(smer.clone().add(new THREE.Vector3(-0.5, 0.25, 0)).normalize().multiplyScalar(razdalja * 1.35));
      const t0 = performance.now();
      animacija = 1;
      const korak = (t: number) => {
        const k = Math.min(1, (t - t0) / 900);
        camera.position.lerpVectors(zacetek, cilj, ease(k));
        if (k < 1) requestAnimationFrame(korak);
        else animacija = 0;
        zahtevaj();
      };
      requestAnimationFrame(korak);
    };

    svet.current = { renderer, scene, camera, controls, model: null, zahtevaj, pogled, okvir: null };
    velikost();

    return () => {
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      if (svet.current?.model) sprosti(svet.current.model);
      pmrem.dispose();
      scene.environment?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      svet.current = null;
    };
  }, []);

  // model: zgradi znova ob vsaki izbiri
  const kljuc = JSON.stringify(props.izdelek === 'ograja' ? props.ograja : props.nadstresek);
  useEffect(() => {
    const w = svet.current;
    if (!w) return;
    if (w.model) {
      w.scene.remove(w.model);
      sprosti(w.model);
    }
    let rezultat;
    if (props.izdelek === 'ograja') {
      const M = ustvariMateriale(props.ograja.ral, props.ograja.material);
      rezultat = modelOgraje(props.ograja, M);
    } else {
      const M = ustvariMateriale(props.nadstresek.ral, props.nadstresek.material);
      rezultat = modelNadstreska(props.nadstresek, M);
    }
    w.model = rezultat.skupina;
    // podstavek makete se prilagodi modelu, zato nič ne sega čez rob
    w.model.add(podstavek(w.model, rezultat.podlaga));
    w.scene.add(w.model);
    // kamero premaknemo samo ob prvem prikazu ali menjavi vrste izdelka, ne ob vsaki izbiri
    const tip = props.izdelek === 'ograja' ? props.ograja.tip : `ns-${props.nadstresek.postavitev}`;
    const prvic = !w.okvir;
    const novTip = zadnjiTip.current !== tip;
    // okvir za kamero izračunamo iz dejanske velikosti modela s podstavkom
    const okvir = new THREE.Box3().setFromObject(w.model);
    const krogla = okvir.getBoundingSphere(new THREE.Sphere());
    const sredisce = krogla.center.clone();
    sredisce.y = Math.min(sredisce.y, okvir.min.y + (okvir.max.y - okvir.min.y) * 0.42);
    w.okvir = { sredisce, velikost: krogla.radius * 0.82, smer: rezultat.smer };
    zadnjiTip.current = tip;
    if (prvic || novTip) w.pogled(prvic);
    else w.zahtevaj();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kljuc]);

  if (napaka) {
    return (
      <div className={s.napaka} role="status">
        Vaš brskalnik ne podpira 3D prikaza. Risba zgoraj prikazuje isto izbiro.
      </div>
    );
  }

  return (
    <div className={s.scena}>
      <div ref={gostitelj} className={s.platno} aria-label="3D model izbranega izdelka. Povlecite za vrtenje." role="img" />
      <p className={s.namig} aria-hidden>
        <HandGrabbing size={16} weight="bold" /> Povlecite za vrtenje, povečava s kolescem ali dvema prstoma
      </p>
      <button type="button" className={s.pogled} onClick={() => svet.current?.pogled(false)}>
        <ArrowCounterClockwise size={16} weight="bold" aria-hidden /> Pogled
      </button>
    </div>
  );
}
