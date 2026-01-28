import { DashboardContent } from './components/DashboardContent';

interface DashboardPageProps {
  searchParams?: Promise<{
    profileId?: string;
    mes?: string;
    año?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const currentDate = new Date();
  const params = await searchParams;

  const profileId = params?.profileId;
  const mesParam = params?.mes;
  const añoParam = params?.['año'];

  const mesNumber = mesParam ? Number(mesParam) : currentDate.getMonth() + 1;
  const añoNumber = añoParam ? Number(añoParam) : currentDate.getFullYear();

  const mes = Number.isFinite(mesNumber) ? mesNumber : currentDate.getMonth() + 1;
  const año = Number.isFinite(añoNumber) ? añoNumber : currentDate.getFullYear();

  return <DashboardContent profileId={profileId} mes={mes} año={año} />;
}
