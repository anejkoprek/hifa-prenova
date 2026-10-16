# HIFA – design sistem

Zapisano po izdelavi osnutka (oktober 2026), iz dejanske kode. Tokeni so v `app/globals.css`.

## Svet: list načrta pročelja
Stran je arhitektov list z risbo pročelja. Podlaga je hladen fasadni omet, črte in kovina so RAL 7016 antracit, zelena iz logotipa je samo za dejanja in izbrani del. Izdelki se na strani pojavljajo kot **detajli A–D** (krog s črko), kot na načrtu.

## Barve
| Token | Vrednost | Raba |
|---|---|---|
| `--papir` | #e4e7e5 | podlaga strani |
| `--papir-2` | #dbdfdc | ozadje fotografij med nalaganjem |
| `--list` | #eff1ef | svetlejši pasovi, obrazci |
| `--bela` | #fbfbf9 | polja, kartice izbir |
| `--crnilo` | #1c2124 | besedilo, močne črte |
| `--crnilo-2` | #384045 | sekundarno besedilo |
| `--jeklo` | #545d62 | oznake, opisi |
| `--crta` / `--crta-mocna` | #c7cac3 / #9fa59e | ločilne črte |
| `--zelena` | #91bd30 | primarni gumb, izbrani del, oblaček spremembe |
| `--zelena-temna` | #45620f | zelene ikone in povezave na svetlem |
| `--antracit` | #383e42 | noga, temni pasovi, okvirji plošč |

Zelena nikoli ne pokriva velikih površin; pas in noga sta antracitna.

## Tipografija
Ena družina: **Archivo Variable** (osi debeline in širine), gostovana na strani v `public/fonts/`: `archivo-latin.woff2` (90 kB) in `archivo-sl.woff2` (7,5 kB, obrezan na č š ž ć đ). Obe se naložita vnaprej (preload), nadomestna pisava ima prilagojene mere, da se besedilo ob zamenjavi ne premakne.
- `.display` – 122 % širine, 780, -0.028em, naslovi strani
- `.h2` / `.h3` / `.h4` – 118 % / 110 % / 104 % širine
- `.napis` – ozke velike črke (72 %, 0.09em), kot napisi in kote na načrtu: legende, oznake polj, oznake plošč
- telo 1rem–1.06rem, vrstica 1.6, tabelarične številke

## Oblike
- Radiji: 4 px kontrole (gumbi, polja, čipi), 2 px plošče s fotografijami, 12 px obrazci in plošče vsebine.
- Fotografije izvedenih del so **plošče**: oster rob, 1 px antracitni okvir, oznaka »Detajl A · …« v ozkih velikih črkah.
- Ločevanje s tankimi črtami (1 px, 2 px črnilo nad pomembnimi bloki), ne s sencami. Senca samo za plavajoče (piškotki, gumb »Cela hiša«).
- Krog s črko (`.detajl`) je edina dekoracija, ki se ponavlja; vedno pomeni del hiše.

## Gibanje
- Ena avtorska poteza: zeleni »oblaček spremembe« se nariše okoli izbranega dela (620 ms, ease-out). Na telefonu se pogled približa izbranemu delu.
- Ostalo: rahlo razkrivanje ob scrollu (16 px, 700 ms), pritisk gumbov `scale(0.97)`. Vse spoštuje `prefers-reduced-motion`.

## Komponente
- Gumbi: `.gumb` (črn), `.gumb--zelen` (primarni, en na pogled), `.gumb--obroba`.
- Izbire: `.cip` (aria-pressed), kartice izbir v konfiguratorju z zeleno kljukico, RAL vzorci kot krogi.
- Legenda: `dl` z oznako `.napis` levo in vrednostjo desno, ločeno s črtami.

## Ni del sistema
- Mreža (karirasto ozadje) je samo na platnu tehnične risbe v konfiguratorju, nikjer drugje.
- Brez nadnaslovov nad naslovi, brez gradientov, brez steklenih učinkov.
