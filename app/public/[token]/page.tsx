import { notFound } from 'next/navigation';
import { getPublicReport } from '@/lib/api/public-reports';
import { PublicHeader } from './components/PublicHeader';
import { PublicRegimenView } from './components/PublicRegimenView';

export const dynamic = 'force-dynamic';

interface PublicReportPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ mes?: string; año?: string }>;
}

export default async function PublicReportPage({ params, searchParams }: PublicReportPageProps) {
  const { token } = await params;
  const sp = await searchParams;

  const mes = sp.mes ? Number(sp.mes) : undefined;
  const año = sp.año ? Number(sp.año) : undefined;

  let report;
  try {
    report = await getPublicReport(token, mes, año);
  } catch {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      <PublicHeader branding={report.branding} profile={report.profile} metrics={report.metrics} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 pt-6 pb-12 md:px-6 lg:px-8">
        <PublicRegimenView
          metrics={report.metrics}
          metricsByRegimen={report.metrics_by_regimen ?? []}
        />
      </main>
      <footer className="border-border text-muted-foreground border-t py-6 text-center text-xs">
        Reporte generado con <span className="text-foreground font-semibold">Contafy</span>
      </footer>
    </div>
  );
}
