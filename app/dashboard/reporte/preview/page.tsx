import { getMetrics, getInvoices } from "@/lib/api/invoices";
import { getExpenses } from "@/lib/api/expenses";
import { getProfiles } from "@/lib/api/profiles";
import { ReportePreviewContent } from "./components/ReportePreviewContent";
import type { ReporteMensualData } from "./components/ReporteMensualTemplate";
import type {
  DetalleOperacionesDevengadasData,
  FilaIngresoDevengado,
  FilaEgresoDevengado,
} from "./components/DetalleOperacionesDevengadasTemplate";
import type { Invoice } from "@/lib/types/invoices";
import type { Expense } from "@/lib/types/expenses";

const TOTAL_PAGES = 2;

interface PreviewPageProps {
  searchParams?: Promise<{
    profileId?: string;
    mes?: string;
    año?: string;
  }>;
}

export const dynamic = "force-dynamic";

function toNumber(value: number | string): number {
  return typeof value === "number" ? value : parseFloat(String(value)) || 0;
}

function buildIngresosRows(
  invoices: Invoice[],
  profileRfc: string | undefined,
  allProfileRfcs: string[]
): FilaIngresoDevengado[] {
  const filtered = profileRfc
    ? invoices.filter((inv) => inv.rfc_emisor === profileRfc)
    : invoices.filter((inv) =>
        allProfileRfcs.length > 0 ? allProfileRfcs.includes(inv.rfc_emisor) : true
      );
  return filtered.map((inv) => ({
    fecha: inv.fecha,
    folioUuid: inv.uuid ?? inv.id,
    rfcReceptor: inv.rfc_receptor ?? "",
    concepto: inv.concepto ?? "—",
    montoTotal: toNumber(inv.total),
  }));
}

function buildEgresosRows(expenses: Expense[]): FilaEgresoDevengado[] {
  return expenses.map((exp) => ({
    fecha: exp.fecha,
    folioUuid: exp.uuid ?? exp.id,
    rfcEmisor: exp.rfc_emisor ?? "—",
    concepto: exp.concepto ?? "—",
    montoTotal: toNumber(exp.total),
  }));
}

export default async function ReportePreviewPage({ searchParams }: PreviewPageProps) {
  const params = await searchParams;
  const currentDate = new Date();
  const profileId = params?.profileId;
  const mesParam = params?.mes;
  const añoParam = params?.año;

  const mes = mesParam ? Number(mesParam) : currentDate.getMonth() + 1;
  const año = añoParam ? Number(añoParam) : currentDate.getFullYear();

  const mesValid =
    Number.isFinite(mes) && mes >= 1 && mes <= 12 ? mes : currentDate.getMonth() + 1;
  const añoValid =
    Number.isFinite(año) && año >= 2000 && año <= 2100 ? año : currentDate.getFullYear();

  const [metrics, profiles, invoicesRes, expensesRes] = await Promise.all([
    getMetrics(profileId, mesValid, añoValid),
    getProfiles(),
    getInvoices({ profileId, mes: mesValid, año: añoValid, limit: 1000 }),
    getExpenses({ profileId, mes: mesValid, año: añoValid, limit: 1000 }),
  ]);

  const activeProfile = profileId
    ? profiles.data.find((p) => p.id === profileId) ?? null
    : null;
  const profileRfc = activeProfile?.rfc;

  const reportData: ReporteMensualData = {
    profileName: activeProfile?.nombre ?? "Todos los perfiles",
    rfc: profileRfc ?? "",
    mes: mesValid,
    año: añoValid,
    ingresosCobrados: metrics.flujo?.ingresos_cobrados ?? 0,
    egresosPagados: metrics.flujo?.egresos_pagados ?? 0,
    flujoNeto: metrics.flujo?.flujo_neto ?? 0,
    facturasPorCobrar: metrics.pendientes?.por_cobrar ?? 0,
    facturasPorPagar: metrics.pendientes?.por_pagar ?? 0,
    proyeccionSaldo: metrics.flujo?.flujo_neto ?? 0,
    ingresosDevengados: metrics.devengado?.ingresos_devengados ?? 0,
    egresosDevengados: metrics.devengado?.egresos_devengados ?? 0,
    utilidadOperativa: metrics.devengado?.resultado_devengado ?? 0,
  };

  const allProfileRfcs = (profiles.data ?? []).map((p) => p.rfc).filter(Boolean);
  const ingresosRows = buildIngresosRows(
    invoicesRes.data ?? [],
    profileRfc,
    allProfileRfcs
  );
  const egresosRows = buildEgresosRows(expensesRes.data ?? []);
  const totalIngresos = ingresosRows.reduce((s, r) => s + r.montoTotal, 0);
  const totalEgresos = egresosRows.reduce((s, r) => s + r.montoTotal, 0);
  const utilidadBruta = totalIngresos - totalEgresos;
  const margenPercent =
    totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0;

  const detalleData: DetalleOperacionesDevengadasData = {
    rfc: profileRfc ?? "",
    mes: mesValid,
    año: añoValid,
    ingresos: ingresosRows,
    egresos: egresosRows,
    totalIngresos,
    totalEgresos,
    utilidadBruta,
    margenPercent,
    pageNumber: 2,
    totalPages: TOTAL_PAGES,
  };

  return (
    <div className="py-6">
      <ReportePreviewContent
        data={reportData}
        detalleData={detalleData}
        totalPages={TOTAL_PAGES}
      />
    </div>
  );
}
