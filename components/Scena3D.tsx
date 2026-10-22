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
  prilagodi: () => void;
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
    // na telefonih nižja ločljivost risanja: ostra slika, a pol manj dela za grafični čip
    const groba = window.matchMedia('(pointer: coarse)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, groba ? 1.5 : 1.75));
    renderer.shadowMap.enabled = true;
    // scena je mirujoča: senco narišemo samo ob spremembi modela, ne pri vsakem obratu kamere
    renderer.shadowMap.autoUpdate = false;
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
    sonce.shadow.mapSize.set(groba ? 1024 : 2048, groba ? 1024 : 2048);
    sonce.shadow.bias = -0.0004;
    sonce.shadow.normalBias = 0.02;
    sonce.shadow.radius = 4;
    scene.add(sonce, sonce.target);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.49; // ne pod tla
    // premikanje pogleda: desni gumb, ali levi gumb s tipko Shift/Ctrl/Cmd; na telefonu poteg z dvema prstoma
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.panSpeed = 0.9;
    controls.keyPanSpeed = 14;
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
    // središče pogleda ne sme odplavati daleč od modela (sicer se uporabnik »izgubi«)
    const omejiPremik = () => {
      const o = svet.current?.okvir;
      if (!o) return;
      const meja = o.velikost * 1.1;
      const d = controls.target.clone().sub(o.sredisce);
      d.y = Math.max(-o.velikost * 0.6, Math.min(meja, d.y));
      if (d.length() > meja) d.setLength(meja);
      const nov = o.sredisce.clone().add(d);
      const zamik = nov.sub(controls.target);
      if (zamik.lengthSq() > 1e-10) {
        controls.target.add(zamik);
        camera.position.add(zamik);
      }
    };
    controls.addEventListener('change', omejiPremik);

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
      Object.assign(sonce.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 0.5, far: Math.max(60, r * 4) });
      sonce.shadow.camera.updateProjectionMatrix();
      sonce.target.position.copy(o.sredisce);
      sonce.position.copy(o.sredisce).add(new THREE.Vector3(-8, 14, 10).normalize().multiplyScalar(Math.max(18, r * 2)));
      renderer.shadowMap.needsUpdate = true;

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

    // ob spremembi mere kamera ostane natanko tam, kjer jo je obiskovalec pustil (kot, razdalja in središče);
    // posodobimo le senco in meje povečave, ki ne smejo premakniti trenutnega pogleda
    const prilagodi = () => {
      const o = svet.current?.okvir;
      if (!o) return;
      const vfov = THREE.MathUtils.degToRad(camera.fov);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
      const razdalja = (o.velikost / Math.sin(Math.min(vfov, hfov) / 2)) * 0.9;
      const zdaj = camera.position.distanceTo(controls.target);
      controls.minDistance = Math.min(razdalja * 0.35, zdaj);
      controls.maxDistance = Math.max(razdalja * 2.2, zdaj);
      const r = o.velikost + 1;
      Object.assign(sonce.shadow.camera, { left: -r, right: r, top: r, bottom: -r, near: 0.5, far: Math.max(60, r * 4) });
      sonce.shadow.camera.updateProjectionMatrix();
      sonce.target.position.copy(o.sredisce);
      sonce.position.copy(o.sredisce).add(new THREE.Vector3(-8, 14, 10).normalize().multiplyScalar(Math.max(18, r * 2)));
      renderer.shadowMap.needsUpdate = true;
      zahtevaj();
    };

    svet.current = { renderer, scene, camera, controls, model: null, zahtevaj, pogled, prilagodi, okvir: null };
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

  // model: zgradi znova ob izbiri. Med vlečenjem drsnika gradimo največ enkrat na sličico (zadnja vrednost zmaga).
  const kljuc = JSON.stringify(props.izdelek === 'ograja' ? props.ograja : props.nadstresek);
  const zadnjiProps = useRef(props);
  zadnjiProps.current = props;
  const cakajoca = useRef(0);
  useEffect(() => {
    if (cakajoca.current) return;
    cakajoca.current = requestAnimationFrame(() => {
      cakajoca.current = 0;
      const w = svet.current;
      if (!w) return;
      const p = zadnjiProps.current;
      const star = w.model;
      let rezultat;
      if (p.izdelek === 'ograja') rezultat = modelOgraje(p.ograja, ustvariMateriale(p.ograja.ral, p.ograja.material));
      else rezultat = modelNadstreska(p.nadstresek, ustvariMateriale(p.nadstresek.ral, p.nadstresek.material));
      const model = rezultat.skupina;
      // podstavek makete se prilagodi modelu, zato nič ne sega čez rob
      model.add(podstavek(model, rezultat.podlaga));
      model.matrixAutoUpdate = false;
      model.updateMatrixWorld(true);
      w.scene.add(model);
      w.model = model;
      // okvir za kamero iz dejanske velikosti modela s podstavkom
      const okvir = new THREE.Box3().setFromObject(model);
      const krogla = okvir.getBoundingSphere(new THREE.Sphere());
      const sredisce = krogla.center.clone();
      sredisce.y = Math.min(sredisce.y, okvir.min.y + (okvir.max.y - okvir.min.y) * 0.42);
      const prvic = !w.okvir;
      w.okvir = { sredisce, velikost: krogla.radius * 0.82, smer: rezultat.smer };
      const tip = p.izdelek === 'ograja' ? p.ograja.tip : `ns-${p.nadstresek.postavitev}`;
      const novTip = zadnjiTip.current !== tip;
      zadnjiTip.current = tip;
      if (prvic || novTip) w.pogled(prvic);
      else w.prilagodi();
      w.renderer.shadowMap.needsUpdate = true;
      // stari model odstranimo šele po risanju novega: senčilniki ostanejo v uporabi in se ne prevajajo znova
      w.renderer.render(w.scene, w.camera);
      if (star) {
        w.scene.remove(star);
        w.renderer.shadowMap.needsUpdate = true;
        w.renderer.render(w.scene, w.camera); // ista sličica: na zaslonu je samo nov model
        sprosti(star);
      }
    });
  }, [kljuc]);
  useEffect(() => () => cancelAnimationFrame(cakajoca.current), []);

  if (napaka) {
    return (
      <div className={s.napaka} role="status">
        Vaš brskalnik ne podpira 3D prikaza. Risba zgoraj prikazuje isto izbiro.
      </div>
    );
  }

  return (
    <div className={s.scena}>
      <div ref={gostitelj} className={s.platno} aria-label="3D model izbranega izdelka. Povlecite za vrtenje, z desnim gumbom ali s tipko Shift za premik." role="img" />
      <p className={s.namig} aria-hidden>
        <HandGrabbing size={16} weight="bold" />
        <span className={s.namigMis}>Vrtenje: povlecite · premik: desni gumb ali Shift + povlecite · povečava: kolesce</span>
        <span className={s.namigDotik}>Vrtenje: en prst · premik in povečava: dva prsta</span>
      </p>
      <button type="button" className={s.pogled} onClick={() => svet.current?.pogled(false)}>
        <ArrowCounterClockwise size={16} weight="bold" aria-hidden /> Pogled
      </button>
    </div>
  );
}
