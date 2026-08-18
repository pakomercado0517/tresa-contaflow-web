import "./report-pdf.css";
import { getAllExpenses } from "@/lib/api/expenses";
import { listAllPaymentComplements } from "@/lib/api/payment-complements";
import { getProfiles } from "@/lib/api/profiles";
import { getRegimenesFiscales } from "@/lib/api/sat";
import { getCurrentUser } from "@/lib/api/auth.server";
import { ExpensesReportPreviewContent } from "./components/ExpensesReportPreviewContent";
import type {
  ReporteGastosData,
  FilaGastoReporte,
  FilaComplementoReporte,
} from "./components/ReporteGastosTemplate";
import { getCurrentMonthYearInAppTimezone } from "@/lib/utils/app-calendar";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const dynamic = "force-dynamic";

interface PreviewPageProps {
  searchParams?: Promise<{
    profileId?: string;
    mes?: string;
    año?: string;
    regimen_fiscal?: string;
    search?: string;
  }>;
}

function toNumber(value: number | string): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function shortUuid(uuid: string | null): string {
  if (!uuid) return "—";
  return uuid.length > 16 ? `${uuid.slice(0, 8)}-${uuid.slice(-6)}` : uuid;
}

function truncateUuid(uuid: string): string {
  if (!uuid) return "—";
  if (uuid.length <= 16) return uuid;
  return `${uuid.slice(0, 8)}…${uuid.slice(-8)}`;
}

export default async function ExpensesReportePreviewPage({ searchParams }: PreviewPageProps) {
  const params = await searchParams;
  const { mes: defaultMes, año: defaultAño } = getCurrentMonthYearInAppTimezone();
  const profileId = params?.profileId && params.profileId !== "all" ? params.profileId : undefined;
  const mesParam = params?.mes;
  const añoParam = params?.año;
  const regimenFiscal =
    params?.regimen_fiscal && params.regimen_fiscal !== "all" ? params.regimen_fiscal : undefined;
  const search = params?.search ?? undefined;

  const mes = mesParam ? Math.min(12, Math.max(1, toNumber(mesParam))) : defaultMes;
  const año = añoParam
    ? Math.min(2100, Math.max(2000, toNumber(añoParam)))
    : defaultAño;

  const [profilesRes, expensesRaw, complements, regimenesCatalog, currentUser] =
    await Promise.all([
      getProfiles(),
      getAllExpenses({
        profileId,
        mes,
        año,
        regimen_fiscal: regimenFiscal,
        search,
      }),
      listAllPaymentComplements({
        role: "EGRESO",
        profile_id: profileId,
        mes,
        año,
      }),
      getRegimenesFiscales(),
      getCurrentUser(),
    ]);

  const profiles = profilesRes.data ?? [];
  const expenses = expensesRaw.filter((exp) => exp.tipo !== "COMPLEMENTO_PAGO");
  const activeProfile = profileId
    ? (profiles.find((p) => p.id === profileId) ?? null)
    : null;
  const profileName = activeProfile?.nombre ?? "Todos los perfiles";
  const rfc = activeProfile?.rfc ?? "";
  const showComplementProfileColumn = !profileId;

  const catalogByClave = new Map(
    (regimenesCatalog?.data ?? []).map((r) => [r.clave, r.descripcion])
  );
  const regimenFiscalLabel = regimenFiscal
    ? catalogByClave.get(regimenFiscal) ?? `Régimen ${regimenFiscal}`
    : "Todos";

  const now = new Date();
  const generatedDate = now.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const generatedTime = now.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const reportId = `#GASTOS-${profileId?.slice(0, 8) ?? "all"}-${mes}-${año}-${now.getTime().toString(36).toUpperCase().slice(-6)}`;

  const totalEgresos = expenses.reduce((s, exp) => s + toNumber(exp.total), 0);
  const totalIva = expenses.reduce(
    (s, exp) => s + toNumber(exp.iva ?? exp.iva_amount ?? 0),
    0
  );
  const totalRetencionesIva = expenses.reduce(
    (s, exp) => s + toNumber(exp.retencion_iva_amount ?? 0),
    0
  );
  const totalRetencionesIsr = expenses.reduce(
    (s, exp) => s + toNumber(exp.retencion_isr_amount ?? 0),
    0
  );

  const algunaInvalida = expenses.some((exp) => !exp.validacion?.valido);
  const estadoCfdi = algunaInvalida ? "Vigentes y con errores" : "Vigentes";

  const filas: FilaGastoReporte[] = expenses.map((exp) => ({
    fecha: exp.fecha,
    folio: exp.uuid?.slice(0, 8) ?? exp.id?.slice(0, 8) ?? "—",
    uuidCorto: exp.uuid ? shortUuid(exp.uuid) : undefined,
    rfcEmisor: exp.rfc_emisor ?? "—",
    subtotal: toNumber(exp.subtotal),
    impuestos: toNumber(exp.iva ?? exp.iva_amount ?? 0),
    total: toNumber(exp.total),
  }));

  const filasComplementos: FilaComplementoReporte[] = complements.map((item) => {
    const relacionadas = item.cantidad_facturas_relacionadas;
    const sinConciliar = item.cantidad_items_sin_conciliar;
    const conciliados = Math.max(0, relacionadas - sinConciliar);
    const conciliacionLabel =
      sinConciliar > 0
        ? `${sinConciliar} sin conciliar · ${relacionadas} facturas`
        : relacionadas > 0
          ? `Conciliado · ${relacionadas} facturas`
          : `${conciliados}/${relacionadas} conciliados`;

    return {
      linkId: item.link_id,
      fechaEmision: item.fecha_emision,
      uuidCorto: truncateUuid(item.uuid),
      rfcContraparte: item.rfc_emisor || "—",
      totalPagado: toNumber(item.total_pagado),
      conciliacionLabel,
      perfilNombre: showComplementProfileColumn ? item.profile.nombre : undefined,
      perfilRfc: showComplementProfileColumn ? item.profile.rfc : undefined,
    };
  });

  const reportData: ReporteGastosData = {
    profileName,
    rfc,
    reportId,
    generatedDate,
    generatedTime,
    mes,
    año,
    periodoLabel: `${MESES[mes - 1]} ${año}`,
    regimenFiscalLabel,
    estadoCfdi,
    totalEgresos,
    totalIva,
    totalRetencionesIva,
    totalRetencionesIsr,
    filas,
    filasComplementos,
    showComplementProfileColumn,
    logoUrl: currentUser?.user?.logo_url ?? null,
    nombreComercial: currentUser?.user?.nombre_comercial ?? null,
  };

  return (
    <div className="py-6">
      <ExpensesReportPreviewContent data={reportData} />
    </div>
  );
}
