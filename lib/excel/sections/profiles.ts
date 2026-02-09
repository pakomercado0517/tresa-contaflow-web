import type { Worksheet } from "exceljs";
import type { Profile } from "@/lib/types/profiles";
import type { ProfileStats } from "../core/types";
import { tableHeaderStyle, dataStyle, dataAlternateStyle } from "../core/styles";
import { COLORS, COLUMN_WIDTHS, ROW_HEIGHT_DATA } from "../constants";
import { formatDate } from "../utils/formatters";

const HEADERS = [
  "RFC",
  "Nombre",
  "Tipo Persona",
  "Total Facturado",
  "Total Gastos",
  "Total Facturas",
  "Cant. Gastos",
  "Primera Factura",
  "Última Factura",
];

interface ProfileWithStats extends Profile {
  stats: ProfileStats;
}

/**
 * Añade la sección de perfiles con estadísticas a la hoja.
 * Devuelve la siguiente fila disponible después de la tabla.
 */
export function addProfilesSection(
  worksheet: Worksheet,
  profiles: Profile[],
  profilesStats: ProfileStats[],
  startRow: number
): number {
  const profilesWithStats: ProfileWithStats[] = profiles.map((profile) => {
    const stats = profilesStats.find((s) => s.profileId === profile.id) ?? {
      profileId: profile.id,
      totalInvoices: 0,
      totalExpenses: 0,
      totalInvoiced: 0,
      totalSpent: 0,
      firstInvoiceDate: null,
      lastInvoiceDate: null,
      firstExpenseDate: null,
      lastExpenseDate: null,
    };
    return { ...profile, stats };
  });

  const headerRow = worksheet.getRow(startRow);
  headerRow.height = ROW_HEIGHT_DATA;
  HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.style = tableHeaderStyle(COLORS.todasFacturas.header);
  });

  let currentRow = startRow + 1;
  profilesWithStats.forEach((profile, idx) => {
    const row = worksheet.getRow(currentRow);
    row.height = ROW_HEIGHT_DATA;
    const s = profile.stats;
    const style = idx % 2 === 1 ? dataAlternateStyle(COLORS.todasFacturas.alternate) : dataStyle;

    const tipoPersona = profile.tipo_persona === "FISICA" ? "Persona Física" : "Persona Moral";
    const firstDate = s.firstInvoiceDate ?? s.firstExpenseDate;
    const lastDate = s.lastInvoiceDate ?? s.lastExpenseDate;

    row.getCell(1).value = profile.rfc;
    row.getCell(1).style = style;
    row.getCell(2).value = profile.nombre;
    row.getCell(2).style = style;
    row.getCell(3).value = tipoPersona;
    row.getCell(3).style = style;
    row.getCell(4).value = s.totalInvoiced;
    row.getCell(4).numFmt = '"$"#,##0.00';
    row.getCell(4).style = style;
    row.getCell(5).value = s.totalSpent;
    row.getCell(5).numFmt = '"$"#,##0.00';
    row.getCell(5).style = style;
    row.getCell(6).value = s.totalInvoices;
    row.getCell(6).style = style;
    row.getCell(7).value = s.totalExpenses;
    row.getCell(7).style = style;
    row.getCell(8).value = firstDate ? formatDate(firstDate) : "-";
    row.getCell(8).style = style;
    row.getCell(9).value = lastDate ? formatDate(lastDate) : "-";
    row.getCell(9).style = style;
    currentRow += 1;
  });

  [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((i) => {
    const w = i <= 2 ? COLUMN_WIDTHS.rfc : i <= 3 ? COLUMN_WIDTHS.nombre : i <= 5 ? COLUMN_WIDTHS.total : i <= 7 ? 10 : COLUMN_WIDTHS.fecha;
    worksheet.getColumn(i).width = w;
  });

  return currentRow + 1;
}
