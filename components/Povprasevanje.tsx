'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CheckCircle, FilePdf, ImageSquare, PaperPlaneTilt, Trash, UploadSimple, WarningCircle } from '@phosphor-icons/react';
import { IZDELKI, MAX_DATOTEK, MAX_SKUPAJ, MAX_VELIKOST, shema } from '@/lib/povprasevanje';
import { deli, polnilaNazivi, oblikeNazivi, vrataNazivi } from '@/lib/moznosti';
import { ralIme } from '@/lib/ral';
import { podjetje } from '@/lib/podjetje';
import type { DelId } from '@/lib/risbe/procelje';
import s from './Povprasevanje.module.css';

type Priloga = { id: string; datoteka: File; predogled?: string };
type Props = {
  /** Predizbrani izdelki (npr. na strani Nadstreški). */
  izdelki?: (typeof IZDELKI)[number][];
  /** Povzetek iz konfiguratorja, ki gre zraven povpraševanja. */
  konfiguracija?: string;
  naslov?: string;
  kompaktno?: boolean;
};

const izDela: Record<DelId, (typeof IZDELKI)[number][]> = {
  A: ['Ograja'],
  B: ['Nadstrešek'],
  C: ['Stopnišče', 'Ograja'],
  D: ['Ograja', 'Dvoriščna vrata'],
};

/** Fotografije s telefona zmanjša na 2000 px, da se pošiljanje ne vleče po mobilnem omrežju. */
async function zmanjsaj(f: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(f.type) || f.size < 500_000) return f;
  try {
    const bmp = await createImageBitmap(f);
    const k = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', 0.8));
    return blob && blob.size < f.size ? new File([blob], f.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : f;
  } catch {
    return f;
  }
}

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : `${Math.round(n / 1024)} kB`);

export default function Povprasevanje({ izdelki = [], konfiguracija = '', naslov, kompaktno }: Props) {
  const uid = useId();
  const id = (x: string) => `${uid}-${x}`;
  const [izbrani, setIzbrani] = useState<string[]>(izdelki);
  const [opis, setOpis] = useState(konfiguracija);
  const [priloge, setPriloge] = useState<Priloga[]>([]);
  const [napake, setNapake] = useState<Record<string, string>>({});
  const [stanje, setStanje] = useState<'miruje' | 'posilja' | 'uspeh' | 'napaka'>('miruje');
  const [sporociloNapake, setSporociloNapake] = useState('');
  const [vlece, setVlece] = useState(false);
  const [demo, setDemo] = useState(false);
  const obrazec = useRef<HTMLFormElement>(null);
  const vnosDatotek = useRef<HTMLInputElement>(null);

  useEffect(() => setOpis(konfiguracija), [konfiguracija]);

  // predizpolnitev iz pročelja na naslovni strani (?del=A&polnilo=...&ral=...)
  useEffect(() => {
    if (konfiguracija) return;
    const q = new URLSearchParams(window.location.search);
    const d = q.get('del') as DelId | null;
    if (!d || !deli[d]) return;
    setIzbrani(izDela[d]);
    const deli_: string[] = [deli[d].naziv];
    const p = q.get('polnilo') as keyof typeof polnilaNazivi | null;
    const o = q.get('oblika') as keyof typeof oblikeNazivi | null;
    const v = q.get('vrata') as keyof typeof vrataNazivi | null;
    if (p && polnilaNazivi[p]) deli_.push(`polnilo: ${polnilaNazivi[p].toLowerCase()}`);
    if (o && oblikeNazivi[o]) deli_.push(`oblika: ${oblikeNazivi[o].toLowerCase()}`);
    if (v && vrataNazivi[v]) deli_.push(`vrata: ${vrataNazivi[v].toLowerCase()}`);
    if (q.get('ral')) deli_.push(ralIme(q.get('ral')!));
    setOpis(deli_.join(', '));
  }, [konfiguracija]);

  useEffect(() => () => priloge.forEach((p) => p.predogled && URL.revokeObjectURL(p.predogled)), [priloge]);

  const dodaj = async (seznam: FileList | File[]) => {
    const nove: Priloga[] = [];
    let opozorilo = '';
    for (const f of Array.from(seznam)) {
      if (priloge.length + nove.length >= MAX_DATOTEK) {
        opozorilo = `Priložite lahko največ ${MAX_DATOTEK} datotek.`;
        break;
      }
      if (!/^image\//.test(f.type) && f.type !== 'application/pdf') {
        opozorilo = `${f.name} ni fotografija ali PDF.`;
        continue;
      }
      const z = await zmanjsaj(f);
      if (z.size > MAX_VELIKOST) {
        opozorilo = `${f.name} je večja od 10 MB.`;
        continue;
      }
      const skupaj = [...priloge, ...nove].reduce((n, p) => n + p.datoteka.size, 0) + z.size;
      if (skupaj > MAX_SKUPAJ) {
        opozorilo = `Priloge so skupaj prevelike (več kot 4 MB). Večje načrte pošljite na ${podjetje.email}.`;
        continue;
      }
      nove.push({ id: `${f.name}-${f.size}-${Math.random()}`, datoteka: z, predogled: /^image\/(jpeg|png|webp)/.test(z.type) ? URL.createObjectURL(z) : undefined });
    }
    setPriloge((p) => [...p, ...nove]);
    setNapake((n) => ({ ...n, datoteke: opozorilo }));
  };

  const odstrani = (pid: string) =>
    setPriloge((p) => {
      const x = p.find((y) => y.id === pid);
      if (x?.predogled) URL.revokeObjectURL(x.predogled);
      return p.filter((y) => y.id !== pid);
    });

  const poslji = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.delete('datoteke');
    priloge.forEach((p) => fd.append('datoteke', p.datoteka, p.datoteka.name));

    const preveri = shema.safeParse({
      izdelki: fd.getAll('izdelki').map(String),
      ime: fd.get('ime'),
      telefon: fd.get('telefon'),
      email: fd.get('email'),
      kraj: fd.get('kraj'),
      mere: fd.get('mere') ?? '',
      sporocilo: fd.get('sporocilo') ?? '',
      konfiguracija: fd.get('konfiguracija') ?? '',
      soglasje: fd.get('soglasje') ?? '',
    });
    if (!preveri.success) {
      const n: Record<string, string> = {};
      for (const t of preveri.error.issues) n[String(t.path[0])] ??= t.message;
      setNapake(n);
      const prvo = obrazec.current?.querySelector<HTMLElement>(`[name="${Object.keys(n)[0]}"]`);
      prvo?.focus();
      return;
    }
    setNapake({});
    setStanje('posilja');
    try {
      const res = await fetch('/api/povprasevanje', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.polja) setNapake(json.polja);
        setSporociloNapake(json.napaka ?? 'Preverite označena polja.');
        setStanje('napaka');
        return;
      }
      setDemo(!!json.demo);
      setStanje('uspeh');
    } catch {
      setSporociloNapake(`Povezava ni uspela. Poskusite znova ali nas pokličite na ${podjetje.telefon}.`);
      setStanje('napaka');
    }
  };

  if (stanje === 'uspeh') {
    return (
      <div className={s.uspeh} role="status" tabIndex={-1} ref={(el) => el?.focus()}>
        <CheckCircle size={44} weight="fill" aria-hidden className={s.uspehIkona} />
        <h3 className="h3">Hvala, povpraševanje smo prejeli.</h3>
        <p>
          Pregledali bomo fotografije in mere ter se vam oglasili v enem do dveh delovnih dneh, običajno z informativno ponudbo. Če se vam mudi, pokličite na{' '}
          <a href={podjetje.telefonHref}>{podjetje.telefon}</a>.
        </p>
        {demo ? <p className={s.demo}>Osnutek strani: obrazec je v demo načinu in sporočila ne pošlje.</p> : null}
      </div>
    );
  }

  const napaka = (k: string) =>
    napake[k] ? (
      <p className="napaka" id={id(`${k}-n`)}>
        {napake[k]}
      </p>
    ) : null;
  const opis_ = (k: string) => (napake[k] ? { 'aria-invalid': true as const, 'aria-describedby': id(`${k}-n`) } : {});

  return (
    <form ref={obrazec} className={`${s.obrazec} ${kompaktno ? s.kompaktno : ''}`} onSubmit={poslji} noValidate>
      {naslov ? <h3 className="h3">{naslov}</h3> : null}

      <fieldset className={s.izdelki}>
        <legend className="napis">Kaj potrebujete?</legend>
        <div className="cipi">
          {IZDELKI.map((i) => (
            <label key={i} className="cip">
              <input
                type="checkbox"
                name="izdelki"
                value={i}
                checked={izbrani.includes(i)}
                onChange={(e) => setIzbrani((x) => (e.target.checked ? [...x, i] : x.filter((y) => y !== i)))}
              />
              {i}
            </label>
          ))}
        </div>
      </fieldset>

      {opis ? (
        <div className={s.konfiguracija}>
          <p className="napis">Vaša izbira</p>
          <p>{opis}</p>
          <input type="hidden" name="konfiguracija" value={opis} />
        </div>
      ) : null}

      <div className={s.mreza}>
        <div className="polje">
          <label htmlFor={id('ime')}>Ime in priimek</label>
          <input className="vnos" id={id('ime')} name="ime" autoComplete="name" required {...opis_('ime')} />
          {napaka('ime')}
        </div>
        <div className="polje">
          <label htmlFor={id('telefon')}>Telefon</label>
          <input className="vnos" id={id('telefon')} name="telefon" type="tel" inputMode="tel" autoComplete="tel" required {...opis_('telefon')} />
          {napaka('telefon')}
        </div>
        <div className="polje">
          <label htmlFor={id('email')}>E-pošta</label>
          <input className="vnos" id={id('email')} name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required {...opis_('email')} />
          {napaka('email')}
        </div>
        <div className="polje">
          <label htmlFor={id('kraj')}>Kraj montaže</label>
          <input className="vnos" id={id('kraj')} name="kraj" autoComplete="address-level2" required {...opis_('kraj')} />
          {napaka('kraj')}
        </div>
      </div>

      <div className="polje">
        <label htmlFor={id('mere')}>
          Približne mere <span className="muted">(neobvezno)</span>
        </label>
        <input className="vnos" id={id('mere')} name="mere" placeholder="npr. balkon 8,5 m, višina 110 cm" />
      </div>

      <div className="polje">
        <span className="oznaka" id={id('dat-o')}>
          Fotografije, skica ali načrt <span className="muted">(neobvezno, do {MAX_DATOTEK} datotek)</span>
        </span>
        <div
          className={s.spust}
          data-vlece={vlece || undefined}
          onDragOver={(e) => {
            e.preventDefault();
            setVlece(true);
          }}
          onDragLeave={() => setVlece(false)}
          onDrop={(e) => {
            e.preventDefault();
            setVlece(false);
            dodaj(e.dataTransfer.files);
          }}
        >
          <UploadSimple size={26} aria-hidden />
          <p>
            <button type="button" className={s.izberi} onClick={() => vnosDatotek.current?.click()} aria-describedby={id('dat-o')}>
              Izberite fotografije
            </button>{' '}
            <span className={s.aliPovlecite}>ali jih povlecite sem</span>
          </p>
          <p className="small muted">Fotografija obstoječega stanja in slika želenega izdelka nam najbolj pomagata.</p>
          <input
            ref={vnosDatotek}
            type="file"
            name="datoteke"
            accept="image/*,application/pdf"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) dodaj(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
        {napaka('datoteke')}
        {priloge.length ? (
          <ul className={s.priloge}>
            {priloge.map((p) => (
              <li key={p.id}>
                {p.predogled ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.predogled} alt="" />
                ) : p.datoteka.type === 'application/pdf' ? (
                  <FilePdf size={28} aria-hidden />
                ) : (
                  <ImageSquare size={28} aria-hidden />
                )}
                <span className={s.ime}>{p.datoteka.name}</span>
                <span className="small muted">{kb(p.datoteka.size)}</span>
                <button type="button" onClick={() => odstrani(p.id)} aria-label={`Odstrani ${p.datoteka.name}`}>
                  <Trash size={18} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="polje">
        <label htmlFor={id('sporocilo')}>
          Sporočilo <span className="muted">(neobvezno)</span>
        </label>
        <textarea className="vnos" id={id('sporocilo')} name="sporocilo" rows={4} placeholder="Kaj želite, kdaj bi radi montažo, posebnosti objekta ..." />
      </div>

      <div className={s.past} aria-hidden>
        <label>
          Spletna stran <input name="spletna_stran" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="polje">
        <label className="potrditev">
          <input type="checkbox" name="soglasje" value="da" required {...opis_('soglasje')} />
          <span>
            Strinjam se, da HIFA moje podatke uporabi za pripravo ponudbe, v skladu s <a href="/pravno-obvestilo">politiko zasebnosti</a>.
          </span>
        </label>
        {napaka('soglasje')}
      </div>

      {stanje === 'napaka' ? (
        <p className={s.napakaVrstica} role="alert">
          <WarningCircle size={20} weight="fill" aria-hidden /> {sporociloNapake}
        </p>
      ) : null}

      <div className={s.oddaj}>
        <button type="submit" className="gumb gumb--zelen" disabled={stanje === 'posilja'}>
          <PaperPlaneTilt size={18} weight="bold" aria-hidden />
          {stanje === 'posilja' ? 'Pošiljam ...' : 'Pošlji povpraševanje'}
        </button>
        <p className="small muted">Odgovorimo v enem do dveh delovnih dneh.</p>
      </div>
    </form>
  );
}
