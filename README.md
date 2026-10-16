# HIFA – prenova spletne strani (osnutek, Devera Studio)

Next.js 16 (App Router) + React 19 + TypeScript. Brez CSS ogrodja: CSS moduli + `app/globals.css` (tokeni).

## Zagon
```bash
npm install
npm run slike     # prenese ~400 fotografij s hifa.si v public/hifa/ in nastavi .env.local
npm run dev       # http://localhost:3000
```
Brez `npm run slike` se fotografije nalagajo neposredno s hifa.si (tudi deluje). Pred objavo nove strani je prenos obvezen, ker stara stran izgine.

## Kaj je narejeno
- Vse strani stare strani, stari URL-ji ohranjeni (+ preusmeritve za pokvarjene /konstrukcije, /galerije/pravno-obvestilo, /galerije/sofinanciranje):
  `/`, `/ograje`, `/nadstreski`, `/stopnisca`, `/storitve`, `/holler-diy`, `/proizvodi`, `/galerije`, `/galerije/[slug]` (9 galerij), `/o-nas` (+ pogosta vprašanja), `/kontakt`, `/sofinanciranje`, `/pravno-obvestilo`, 404, sitemap, robots, JSON-LD.
- Naslovnica: interaktivno pročelje hiše (A balkon, B nadstrešek, C stopnice, D dvorišče) – klik na del, izbira polnila in RAL barve v živo, izbira gre v povpraševanje.
- Lasten konfigurator (`/konfigurator`) namesto Salesqueze: 4 vrste ograj (polnilo, mere, vrata, prehod, pogon, montaža, material, RAL) in nadstreški (oblika, postavitev, mere, kritina, stene). Živa tehnična risba, izbira v URL-ju (deljiva povezava), brez cen, konča se s povpraševanjem.
- Povpraševanje s fotografijami (do 10, zmanjšanje slik na telefonu, PDF), preverjanje polj, past za robote. `app/api/povprasevanje/route.ts` je v **demo načinu** – za pravo pošiljanje dodaj e-pošto v funkcijo `poslji()`.
- Galerija s filtri, lightbox s povečavo, drsnik prej/potem, mobilna vrstica s klicem.
- Piškotki po GDPR (Sprejmi / Zavrni / Nastavitve), GA4 in zemljevid šele po privolitvi (`NEXT_PUBLIC_GA4` v .env.local).
- Popravljena vsa besedila (tipkarske napake s stare strani), letnica v nogi samodejna.

## Pošiljanje povpraševanj
Privzeto je obrazec v demo načinu (povpraševanje se samo zapiše v dnevnik strežnika). Za pravo pošiljanje na e-pošto s prilogami dodaj v `.env.local` (glej `.env.example`):
```
RESEND_API_KEY=re_...
POVPRASEVANJE_ZA=info@hifa.si
POVPRASEVANJE_OD=splet@hifa.si   # domena mora biti preverjena v Resend
```
Priloge so omejene na 10 datotek in 4 MB skupaj (fotografije se na telefonu pred pošiljanjem zmanjšajo na 2000 px), ker Vercel sprejme največ 4,5 MB na zahtevek.

## Meritve (Lighthouse, mobilni profil, produkcijski build)
Hitrost: naslovnica 90, konfigurator 95, galerija 92, kontakt 96, podstrani izdelkov 99. Dostopnost, dobre prakse, SEO: 100. CLS 0.

## Konfigurator in noga
- `/konfigurator` je izboljšana verzija: glava risbe kot tabela načrta (polnilo, mere, material, montaža, vrata, barva z RAL vzorcem), ikone polnil v izbrani barvi, risba brez prazne mreže, mehak prehod ob spremembi.
- V nogi je logotip Devera Studio (`public/devera-logo-white.svg`), povezava na deverastudio.com.

## Odprto
- Preveriti s pravimi fotografijami (`npm run slike`) na telefonu in računalniku.
- Pravno obvestilo je osnutek – HIFA naj ga preveri.
- Design sistem je zapisan v `DESIGN.md`.

## Kje je kaj
- `lib/podjetje.ts` – telefon, naslov, navigacija, mnenja, postopek, FAQ
- `lib/galerije.ts` – vse fotografije in galerije
- `lib/risbe/` – SVG risbe (pročelje, ograja, nadstrešek); izseki pročelja za podstrani so statične slike na `/procelje/A` … `/procelje/D` (`app/procelje/[del]/route.ts`)
- `app/opengraph-image.png` – slika za deljenje na Facebooku in Viberju
- `lib/konfigurator.ts` – možnosti in privzete vrednosti konfiguratorja
- `PRODUCT.md`, `.impeccable/surfaces/` – izhodišča in smer dizajna
