import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PAGE, MARGINS } from '../layout/constants';
import { drawHeader } from '../layout/header';
import { drawFooter } from '../layout/footer';

interface ExportFinancialReportOptions {
  title: string;
  subtitle?: string;
  tableHead: string[];
  tableBody: (string | number)[][];
  fileName: string;
}

export function exportFinancialReportPDF(options: ExportFinancialReportOptions): void {
  const { title, subtitle, tableHead, tableBody, fileName } = options;

  const doc = new jsPDF({
    orientation: PAGE.orientation,
    unit: PAGE.unit,
    format: PAGE.size,
  });

  const startY = drawHeader(doc, title, subtitle);

  autoTable(doc, {
    startY,
    head: [tableHead],
    body: tableBody.map((row) => row.map(String)),
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    margin: {
      left: MARGINS.left,
      right: MARGINS.right,
      top: MARGINS.header,
      bottom: MARGINS.footer,
    },
    showHead: 'everyPage',
  });

  drawFooter(doc);
  doc.save(fileName);
}
