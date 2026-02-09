import jsPDF from 'jspdf';
import { PAGE, MARGINS } from '../layout/constants';
import { drawHeader } from '../layout/header';
import { drawFooter } from '../layout/footer';

interface Profile {
  rfc: string;
  nombre: string;
}

export function exportProfilesPDF(profiles: Profile[]): void {
  const doc = new jsPDF({
    orientation: PAGE.orientation,
    unit: PAGE.unit,
    format: PAGE.size,
  });

  let y = drawHeader(doc, 'Reporte de Perfiles RFC');

  doc.setFontSize(10);
  doc.setTextColor(0);

  for (const profile of profiles) {
    if (y > doc.internal.pageSize.getHeight() - MARGINS.footer - 10) {
      doc.addPage();
      y = drawHeader(doc, 'Reporte de Perfiles RFC');
    }

    doc.text(`${profile.rfc} — ${profile.nombre}`, MARGINS.left, y);
    y += 8;
  }

  drawFooter(doc);
  doc.save('perfiles.pdf');
}
