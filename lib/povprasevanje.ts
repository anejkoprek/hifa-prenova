import { z } from 'zod';

export const IZDELKI = ['Ograja', 'Dvoriščna vrata', 'Nadstrešek', 'Stopnišče', 'Konstrukcija', 'Holler DIY', 'Drugo'] as const;
export const MAX_DATOTEK = 10;
export const MAX_VELIKOST = 10 * 1024 * 1024; // 10 MB na datoteko
// Vercel sprejme največ 4,5 MB na zahtevek, zato skupaj (po zmanjšanju fotografij) največ 4 MB
export const MAX_SKUPAJ = 4 * 1024 * 1024;
/** največ toliko fotografij iz naše galerije lahko obiskovalec doda kot primer */
export const MAX_GALERIJA = 6;
export const DOVOLJENI_TIPI = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'];

export const shema = z.object({
  izdelki: z.array(z.enum(IZDELKI)).default([]),
  ime: z.string().trim().min(2, 'Vpišite ime in priimek, da vas lahko nagovorimo.').max(120),
  telefon: z
    .string()
    .trim()
    .regex(/^[+0-9 ()/-]{6,20}$/, 'Vpišite telefonsko številko, npr. 031 123 456. Pred ogledom vas pokličemo.'),
  email: z.string().trim().email('Vpišite veljaven e-naslov, nanj pošljemo informativno ponudbo.'),
  kraj: z.string().trim().min(2, 'Vpišite kraj, kjer bo izdelek montiran.').max(120),
  mere: z.string().trim().max(400).optional().default(''),
  sporocilo: z.string().trim().max(4000).optional().default(''),
  konfiguracija: z.string().trim().max(2000).optional().default(''),
  galerija: z.array(z.string().max(200)).max(6).default([]),
  soglasje: z.literal('da', { message: 'Za odgovor potrebujemo vaše soglasje s politiko zasebnosti.' }),
});

export type Povprasevanje = z.infer<typeof shema>;
