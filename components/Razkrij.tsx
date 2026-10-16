'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Elementi z razredom .razkrij se nežno pokažejo, ko pridejo v vidno polje. Brez JS so vidni takoj. */
export default function Razkrij() {
  const pot = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('js');
    const io = new IntersectionObserver(
      (vnosi) => {
        for (const v of vnosi) {
          if (v.isIntersecting) {
            v.target.classList.add('je-vidno');
            io.unobserve(v.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    document.querySelectorAll('.razkrij:not(.je-vidno)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pot]);
  return null;
}
