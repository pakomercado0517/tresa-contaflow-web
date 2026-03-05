/**
 * Catálogo estático de regímenes fiscales SAT (México).
 * Fuente: Catálogo c_RegimenFiscal del SAT — valores oficiales, no cambian frecuentemente.
 * Se usa en la página pública donde no hay acceso al endpoint autenticado del SAT.
 */
export const SAT_REGIMENES: Record<string, string> = {
  '601': 'General de Ley Personas Morales',
  '603': 'Personas Morales con Fines no Lucrativos',
  '605': 'Sueldos y Salarios e Ingresos Asimilados a Salarios',
  '606': 'Arrendamiento',
  '607': 'Régimen de Enajenación o Adquisición de Bienes',
  '608': 'Demás ingresos',
  '610': 'Residentes en el Extranjero sin Establecimiento Permanente en México',
  '611': 'Ingresos por Dividendos (socios y accionistas)',
  '612': 'Personas Físicas con Actividades Empresariales y Profesionales',
  '614': 'Ingresos por intereses',
  '615': 'Régimen de los ingresos por obtención de premios',
  '616': 'Sin obligaciones fiscales',
  '620': 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
  '621': 'Incorporación Fiscal',
  '622': 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
  '623': 'Opcional para Grupos de Sociedades',
  '624': 'Coordinados',
  '625': 'Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
  '626': 'Régimen Simplificado de Confianza (RESICO)',
};

/**
 * Devuelve el nombre legible de un régimen fiscal por su clave SAT.
 * Si la clave no está en el catálogo, devuelve la clave tal cual.
 */
export function getRegimenLabel(clave: string): string {
  return SAT_REGIMENES[clave] ?? clave;
}
