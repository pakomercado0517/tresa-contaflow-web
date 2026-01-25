'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { getTrendDataClient } from '@/lib/api/invoices.client';
import type { TrendPeriodView } from '@/lib/api/invoices';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const MONTHS_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

type TrendDataPoint = {
  mes: number;
  año: number;
  ingresos: number;
  gastos: number;
};

interface FlowTrendChartProps {
  initialData: TrendDataPoint[];
  profileId?: string;
  año?: number;
}

export function FlowTrendChart({ initialData, profileId, año }: FlowTrendChartProps) {
  const [filter, setFilter] = useState<'ingresos' | 'gastos' | 'ambos'>('ambos');
  const [periodView, setPeriodView] = useState<TrendPeriodView>('año-actual');
  const [data, setData] = useState<TrendDataPoint[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const selectedYear = año || new Date().getFullYear();
  const isMountedRef = useRef(true);
  const shouldUseInitialData = periodView === 'año-actual';

  // Actualizar datos cuando cambien las props iniciales y estemos en vista "año-actual"
  useEffect(() => {
    if (shouldUseInitialData) {
      // Usar setTimeout para evitar setState síncrono en el efecto
      const timeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          setData(initialData);
          setIsLoading(false);
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [initialData, shouldUseInitialData, profileId, año]);

  // Cargar datos cuando cambie el período, profileId o año (solo para modos que no sean "año-actual")
  useEffect(() => {
    // Si estamos en vista "año-actual", no hacer fetch
    if (shouldUseInitialData) {
      return;
    }

    // Para otros modos, hacer fetch de los datos
    let cancelled = false;

    // Usar setTimeout para evitar setState síncrono en el efecto
    const loadingTimeoutId = setTimeout(() => {
      if (!cancelled && isMountedRef.current) {
        setIsLoading(true);
      }
    }, 0);

    const fetchData = async () => {
      try {
        const newData = await getTrendDataClient(profileId, selectedYear, periodView);
        if (!cancelled && isMountedRef.current) {
          setData(newData);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error al cargar datos de tendencia:', error);
        if (!cancelled && isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
      clearTimeout(loadingTimeoutId);
    };
  }, [periodView, profileId, selectedYear, shouldUseInitialData]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Transformar datos de API (mes numérico) a formato de gráfico (nombre de mes)
  const currentYear = new Date().getFullYear();
  const chartData = data.map((item) => {
    const monthLabel = MONTHS_SHORT[item.mes - 1];
    const label = item.año === currentYear ? monthLabel : `${monthLabel} ${item.año}`;

    return {
      fecha: label,
      ingresos: item.ingresos,
      gastos: item.gastos,
    };
  });

  // Verificar si hay datos
  const hasData = data.some((item) => item.ingresos > 0 || item.gastos > 0);

  const periodViewLabels: Record<TrendPeriodView, string> = {
    'año-actual': 'Año Actual',
    'últimos-12-meses': 'Últimos 12 Meses',
    'año-completo': 'Año Completo',
    'comparar-anterior': 'Comparar con Anterior',
  };

  return (
    <Card data-tour="trend-chart" className="bg-card border-border p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold">Tendencia de Flujo</h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={periodView}
              onValueChange={(value) => setPeriodView(value as TrendPeriodView)}
            >
              <SelectTrigger className="w-45">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="año-actual">{periodViewLabels['año-actual']}</SelectItem>
                <SelectItem value="últimos-12-meses">
                  {periodViewLabels['últimos-12-meses']}
                </SelectItem>
                <SelectItem value="año-completo">{periodViewLabels['año-completo']}</SelectItem>
                {selectedYear === currentYear && (
                  <SelectItem value="comparar-anterior">
                    {periodViewLabels['comparar-anterior']}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={filter === 'ingresos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('ingresos')}
                className={filter === 'ingresos' ? 'bg-primary' : ''}
              >
                Ingresos (Total pagado)
              </Button>
              <Button
                variant={filter === 'gastos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('gastos')}
                className={filter === 'gastos' ? 'bg-primary' : ''}
              >
                Gastos
              </Button>
              <Button
                variant={filter === 'ambos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('ambos')}
                className={filter === 'ambos' ? 'bg-primary' : ''}
              >
                Ambos
              </Button>
            </div>
          </div>
        </div>

        <div className="h-80">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner message="Cargando datos..." />
            </div>
          ) : hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="fecha" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                />
                {(filter === 'ingresos' || filter === 'ambos') && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#22c55e"
                      strokeWidth={3}
                      fill="url(#colorIngresos)"
                    />
                  </>
                )}
                {(filter === 'gastos' || filter === 'ambos') && (
                  <Line
                    type="monotone"
                    dataKey="gastos"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-center">
                No hay datos disponibles para mostrar.
                <br />
                <span className="text-sm">
                  Sube tus primeras facturas y gastos para ver la tendencia.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
