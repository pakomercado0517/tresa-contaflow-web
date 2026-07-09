'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const DashboardPreviewAreaChart = dynamic(() => import('./DashboardPreviewAreaChart'), {
  ssr: false,
});

export function DashboardPreview() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl px-4 py-16 md:py-24 lg:px-8"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Una vista consolidada de tus ingresos y egresos
          </h2>
          <p className="text-muted-foreground max-w-xl text-lg">
            Revisa ingresos, egresos y utilidades por mes desde tus XML CFDI, sin Excel ni archivos
            dispersos. Ideal para negocios y contadores que necesitan consolidar información y
            generar reportes con rapidez.
          </p>
          <p className="text-muted-foreground text-sm italic">
            <span className="font-bold">
              Menos tiempo consolidando CFDI. Más tiempo tomando decisiones.
            </span>
          </p>
        </div>

        <div className="flex-1">
          <div className="border-border bg-card relative w-full overflow-hidden rounded-lg border shadow-lg">
            <div className="border-border bg-muted/30 flex items-center gap-2 border-b p-4">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="bg-background p-8">
              <div className="h-64 min-h-64 w-full min-w-0">
                {inView ? (
                  <DashboardPreviewAreaChart />
                ) : (
                  <div className="bg-muted/30 flex h-full w-full items-center justify-center rounded-lg">
                    <div className="text-muted-foreground text-sm">Cargando vista...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
