'use client';

import { useEffect, useState } from 'react';

/** Tailwind `md` breakpoint. */
export const MD_UP_QUERY = '(min-width: 768px)';

/**
 * Suscribe a `window.matchMedia`.
 * SSR / primer paint: `false` (trata como viewport &lt; md hasta hidratar).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const sync = () => {
      setMatches(mediaQueryList.matches);
    };

    sync();
    mediaQueryList.addEventListener('change', sync);
    return () => {
      mediaQueryList.removeEventListener('change', sync);
    };
  }, [query]);

  return matches;
}

export function useIsMdUp(): boolean {
  return useMediaQuery(MD_UP_QUERY);
}
