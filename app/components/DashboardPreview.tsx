'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// Datos de ejemplo: tendencia de utilidad mensual (ingresos - egresos)
const DEMO_CHART_DATA = [
  { mes: 'Ene', utilidad: 40 },
  { mes: 'Feb', utilidad: 55 },
  { mes: 'Mar', utilidad: 45 },
  { mes: 'Abr', utilidad: 70 },
  { mes: 'May', utilidad: 80 },
  { mes: 'Jun', utilidad: 95 },
];

const CHART_PRIMARY = 'hsl(142, 76%, 36%)';

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
              <div className="h-64 min-h-64 w-full">
                {inView ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={DEMO_CHART_DATA}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="demoUtilidadGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(0,0%,20%)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="mes"
                        tick={{ fill: 'hsl(0,0%,63.9%)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        hide
                        domain={[0, (max: number) => Math.max(max, 100)]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(0,0%,7%)',
                          border: '1px solid hsl(0,0%,14.9%)',
                          borderRadius: '8px',
                          fontSize: 12,
                        }}
                        formatter={(value) => [
                          value != null ? `$${value}K MXN` : '',
                          'Utilidad',
                        ]}
                        labelFormatter={(label) => label}
                        cursor={{ fill: 'hsl(0,0%,14.9%)' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="utilidad"
                        stroke={CHART_PRIMARY}
                        strokeWidth={2}
                        fill="url(#demoUtilidadGradient)"
                        isAnimationActive
                        animationDuration={1000}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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
