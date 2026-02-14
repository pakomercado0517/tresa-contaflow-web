import ExcelJS from "exceljs";
import type { Workbook, Worksheet } from "exceljs";

const APP_NAME = "Contafy";

/**
 * Crea un workbook base con propiedades del documento.
 */
export function createWorkbook(title?: string): Workbook {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = APP_NAME;
  workbook.created = new Date();
  workbook.modified = new Date();
  if (title) {
    workbook.title = title;
  }
  return workbook;
}

/**
 * Añade una hoja al workbook con opciones por defecto (vista con primera fila congelada).
 */
export function addWorksheet(
  workbook: Workbook,
  name: string,
  options?: { freezeFirstRow?: boolean }
): Worksheet {
  const sheet = workbook.addWorksheet(name, {
    views: [
      {
        state: "frozen",
        ySplit: 1,
        activeCell: "A2",
        showRowColHeaders: true,
        showGridLines: true,
      },
    ],
  });
  if (options?.freezeFirstRow === false) {
    sheet.views = [];
  }
  return sheet;
}
