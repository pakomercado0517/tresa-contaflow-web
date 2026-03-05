import Image from 'next/image';
import { Building2, User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type {
  PublicReportBranding,
  PublicReportProfile,
  PublicReportMetrics,
} from '@/lib/types/public-reports';

interface PublicHeaderProps {
  branding: PublicReportBranding;
  profile: PublicReportProfile;
  metrics: PublicReportMetrics | null;
}

function formatPeriod(metrics: PublicReportMetrics | null): string {
  if (!metrics?.period?.start) return 'Mes actual';

  const start = new Date(metrics.period.start);
  return start.toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });
}

export function PublicHeader({ branding, profile, metrics }: PublicHeaderProps) {
  const { logo_url, nombre_comercial } = branding;
  const displayName = nombre_comercial || 'Mi Despacho';

  return (
    <header className="border-border bg-card border-b">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Branding del despacho */}
          <div className="flex items-center gap-4">
            {logo_url ? (
              <div className="border-border relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border">
                <Image
                  src={logo_url}
                  alt={displayName}
                  fill
                  className="object-contain"
                  sizes="56px"
                />
              </div>
            ) : (
              <div className="border-border bg-muted flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border">
                <Building2 className="text-muted-foreground h-7 w-7" />
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Reporte generado por
              </p>
              <h1 className="text-foreground text-xl font-bold">{displayName}</h1>
            </div>
          </div>

          {/* Info del cliente + periodo */}
          <div className="flex flex-col gap-2 md:items-end">
            <div className="flex items-center gap-2">
              <User className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground text-sm font-medium">{profile.nombre}</span>
            </div>
            <Badge variant="secondary" className="w-fit font-mono text-xs">
              RFC: {profile.rfc}
            </Badge>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <Calendar className="h-3.5 w-3.5" />
              <span className="capitalize">{formatPeriod(metrics)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
