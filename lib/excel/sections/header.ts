import type { Worksheet } from "exceljs";
import { headerStyle } from "../core/styles";
import { ROW_HEIGHT_HEADER } from "../constants";
import { formatDate } from "../utils/formatters";

/**
 * Añade el encabezado del documento a la hoja (título, perfil, RFC, período).
 * Devuelve la siguiente fila disponible después del header.
 */
export function addHeader(
  worksheet: Worksheet,
  title: string,
  profileName: string,
  rfc: string,
  mes: number,
  año: number
): number {
  const row = worksheet.getRow(1);
  row.height = ROW_HEIGHT_HEADER;

  const titleCell = row.getCell(1);
  titleCell.value = title;
  titleCell.style = { ...headerStyle };

  worksheet.mergeCells(1, 1, 1, 4);

  const row2 = worksheet.getRow(2);
  row2.getCell(1).value =
    mes >= 1 && año >= 1 ? `Período: ${mes}/${año}` : "Reporte general";
  row2.getCell(1).style = { font: { size: 10 } };

  let col = 1;
  if (profileName) {
    worksheet.getRow(3).getCell(col).value = `Perfil: ${profileName}`;
    worksheet.getRow(3).getCell(col).style = { font: { size: 9 } };
    col += 1;
  }
  if (rfc) {
    worksheet.getRow(3).getCell(col).value = `RFC: ${rfc}`;
    worksheet.getRow(3).getCell(col).style = { font: { size: 9 } };
    col += 1;
  }

  const row4 = worksheet.getRow(4);
  row4.getCell(1).value = `Generado: ${formatDate(new Date().toISOString())}`;
  row4.getCell(1).style = { font: { size: 8 }, alignment: { horizontal: "left" } };

  return 6;
}
