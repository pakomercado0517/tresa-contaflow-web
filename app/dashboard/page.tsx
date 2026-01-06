import { DashboardContent } from "./components/DashboardContent";

interface DashboardPageProps {
  searchParams?: Promise<{
    profileId?: string;
    mes?: string;
    año?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  return <DashboardContent searchParams={searchParams} />;
}

