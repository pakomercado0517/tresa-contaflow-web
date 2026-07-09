'use client';

import dynamic from 'next/dynamic';
import { DashboardGreeting } from './DashboardGreeting';
import { useSelectedDashboardProfile } from '@/lib/hooks/useSelectedDashboardProfile';

const ShareReportButton = dynamic(
  () => import('./ShareReportButton').then((mod) => ({ default: mod.ShareReportButton })),
  {
    loading: () => <div className="bg-muted h-10 w-28 animate-pulse rounded-md" />,
  }
);

const ExportPDFButton = dynamic(
  () => import('./ExportPDFButton').then((mod) => ({ default: mod.ExportPDFButton })),
  {
    loading: () => <div className="bg-muted h-10 w-32 animate-pulse rounded-md" />,
  }
);

interface DashboardHomeIntroProps {
  userName: string;
  profileId?: string;
  mes: number;
  año: number;
}

export function DashboardHomeIntro({ userName, profileId, mes, año }: DashboardHomeIntroProps) {
  const { companyName, activeProfile } = useSelectedDashboardProfile(profileId);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <DashboardGreeting userName={userName} companyName={companyName} />
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <ShareReportButton
          profileId={profileId}
          clientName={activeProfile?.nombre}
          mes={mes}
          año={año}
        />
        <ExportPDFButton profileId={profileId} mes={mes} año={año} />
      </div>
    </div>
  );
}
