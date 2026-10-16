// Od kod se nalagajo fotografije.
// - Privzeto neposredno s https://www.hifa.si (deluje takoj, Next jih stisne v AVIF/WebP).
// - Po `npm run slike` so v public/hifa/ in skripta v .env.local nastavi NEXT_PUBLIC_SLIKE=lokalno.
//   Pred objavo nove strani je to obvezno, ker stara stran (in njene /media poti) izgine.
const lokalno = process.env.NEXT_PUBLIC_SLIKE === 'lokalno';

export function slika(pot: string): string {
  return lokalno ? `/hifa/${pot}` : `https://www.hifa.si/${pot}`;
}
