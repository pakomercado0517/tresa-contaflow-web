'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LazyMotion, domAnimation, m } from 'motion/react';

interface DashboardRouteTransitionProps {
  children: React.ReactNode;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setPrefersReducedMotion(mediaQuery.matches);

    onChange();
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return prefersReducedMotion;
}

export function DashboardRouteTransition({ children }: DashboardRouteTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        key={pathname}
        className="min-w-0 flex-1 overflow-x-hidden"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
