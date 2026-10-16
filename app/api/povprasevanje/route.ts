import { NextResponse } from 'next/server';
import { shema, MAX_DATOTEK, MAX_SKUPAJ, MAX_VELIKOST, DOVOLJENI_TIPI, type Povprasevanje } from '@/lib/povprasevanje';

// Sprejme povpraševanje (multipart/form-data) s prilogami, ga preveri in pošlje po e-pošti (glej poslji()).
export async function POST(req: Request) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, napaka: 'Obrazca ni bilo mogoče prebrati.' }, { status: 400 });
  }

  // past za robote: človek tega polja ne vidi
  if (String(fd.get('spletna_stran') ?? '')) return NextResponse.json({ ok: true });

  const rezultat = shema.safeParse({
    izdelki: fd.getAll('izdelki').map(String),
    ime: fd.get('ime') ?? '',
    telefon: fd.get('telefon') ?? '',
    email: fd.get('email') ?? '',
    kraj: fd.get('kraj') ?? '',
    mere: fd.get('mere') ?? '',
    sporocilo: fd.get('sporocilo') ?? '',
    konfiguracija: fd.get('konfiguracija') ?? '',
    soglasje: fd.get('soglasje') ?? '',
  });
  if (!rezultat.success) {
    const polja: Record<string, string> = {};
    for (const t of rezultat.error.issues) polja[String(t.path[0])] ??= t.message;
    return NextResponse.json({ ok: false, polja }, { status: 422 });
  }

  const datoteke = fd.getAll('datoteke').filter((f): f is File => f instanceof File && f.size > 0);
  if (datoteke.length > MAX_DATOTEK) {
    return NextResponse.json({ ok: false, napaka: `Priložite največ ${MAX_DATOTEK} datotek.` }, { status: 422 });
  }
  if (datoteke.reduce((n, f) => n + f.size, 0) > MAX_SKUPAJ) {
    return NextResponse.json({ ok: false, napaka: 'Priloge so skupaj večje od 4 MB. Večje načrte pošljite na info@hifa.si.' }, { status: 413 });
  }
  for (const f of datoteke) {
    if (f.size > MAX_VELIKOST) return NextResponse.json({ ok: false, napaka: `Datoteka ${f.name} je večja od 10 MB.` }, { status: 422 });
    if (f.type && !DOVOLJENI_TIPI.includes(f.type)) {
      return NextResponse.json({ ok: false, napaka: `Datoteka ${f.name} ni fotografija ali PDF.` }, { status: 422 });
    }
  }

  try {
    await poslji(rezultat.data, datoteke);
  } catch (e) {
    console.error('[povpraševanje] pošiljanje ni uspelo', e);
    return NextResponse.json({ ok: false, napaka: 'Sporočila ni bilo mogoče poslati. Pokličite nas na 031 688 704.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, demo: !aktivno() });
}

// Pošiljanje prek Resend (resend.com). Vklopi se, ko sta v .env.local nastavljena:
//   RESEND_API_KEY=re_...            ključ iz Resend
//   POVPRASEVANJE_ZA=info@hifa.si    kam pridejo povpraševanja
//   POVPRASEVANJE_OD=splet@hifa.si   (neobvezno) pošiljatelj na preverjeni domeni
// Brez ključa obrazec deluje v demo načinu in samo zapiše povpraševanje v dnevnik strežnika.
const aktivno = () => Boolean(process.env.RESEND_API_KEY && process.env.POVPRASEVANJE_ZA);

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

async function poslji(p: Povprasevanje, datoteke: File[]) {
  if (!aktivno()) {
    console.info('[povpraševanje · demo]', JSON.stringify(p), `${datoteke.length} prilog`);
    return;
  }
  const vrstice: [string, string][] = [
    ['Izdelki', p.izdelki.join(', ') || '–'],
    ['Ime', p.ime],
    ['Telefon', p.telefon],
    ['E-pošta', p.email],
    ['Kraj montaže', p.kraj],
    ['Mere', p.mere || '–'],
    ['Izbira iz konfiguratorja', p.konfiguracija || '–'],
    ['Sporočilo', p.sporocilo || '–'],
  ];
  const html = `<h2 style="font-family:sans-serif">Novo povpraševanje s spletne strani</h2><table style="font-family:sans-serif;border-collapse:collapse">${vrstice
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#545d62;vertical-align:top">${k}</td><td style="padding:6px 0"><strong>${esc(v).replace(/\n/g, '<br>')}</strong></td></tr>`)
    .join('')}</table><p style="font-family:sans-serif;color:#545d62">Priloženih datotek: ${datoteke.length}</p>`;
  const attachments = await Promise.all(
    datoteke.map(async (f) => ({ filename: f.name, content: Buffer.from(await f.arrayBuffer()).toString('base64') })),
  );
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.POVPRASEVANJE_OD || 'HIFA splet <onboarding@resend.dev>',
      to: process.env.POVPRASEVANJE_ZA,
      reply_to: p.email,
      subject: `Povpraševanje: ${p.izdelki.join(', ') || 'splet'} – ${p.ime}, ${p.kraj}`,
      html,
      attachments,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
