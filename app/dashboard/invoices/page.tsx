import { getInvoices } from "@/lib/api/invoices";
import { getProfiles } from "@/lib/api/profiles";
import { getMetrics } from "@/lib/api/invoices";
import { InvoicesListContent } from "./components/InvoicesListContent";

interface InvoicesPageProps {
  searchParams: Promise<{
    profileId?: string;
    mes?: string;
    año?: string;
    tipo?: string;
    page?: string;
    search?: string;
  }>;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const params = await searchParams;
  const profileId = params?.profileId && params.profileId !== "all" ? params.profileId : undefined;
  const mes = params?.mes ? Number(params.mes) : new Date().getMonth() + 1;
  const año = params?.año ? Number(params.año) : new Date().getFullYear();
  const tipo = params?.tipo && params.tipo !== "all" ? params.tipo : undefined;
  const page = params?.page ? Number(params.page) : 1;
  const search = params?.search;

  const [invoices, profiles, metrics] = await Promise.all([
    getInvoices({
      profileId,
      mes,
      año,
      tipo,
      page,
      limit: 20,
      search,
    }),
    getProfiles(),
    getMetrics(profileId, mes, año),
  ]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
      <InvoicesListContent
        invoices={invoices.data}
        pagination={invoices.pagination}
        profiles={profiles.data}
        metrics={metrics.metrics}
        initialProfileId={profileId}
        initialMes={mes}
        initialAño={año}
        initialTipo={tipo}
        initialSearch={search}
      />
    </main>
  );
}
