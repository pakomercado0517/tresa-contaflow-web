'use client';

import dynamic from 'next/dynamic';
import type { PublicReportMetrics } from '@/lib/types/public-reports';

const PublicFlowBarChart = dynamic(
  () => import('./PublicFlowBarChart').then((m) => ({ default: m.PublicFlowBarChart })),
  {
    ssr: false,
    loading: () => <div className="bg-muted h-72 w-full animate-pulse rounded-lg" />,
  }
);

interface PublicChartWrapperProps {
  metrics: PublicReportMetrics | null;
}

export function PublicChartWrapper({ metrics }: PublicChartWrapperProps) {
  return <PublicFlowBarChart metrics={metrics} />;
}
