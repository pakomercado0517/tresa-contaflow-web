/**
 * Calendario de negocio: mes/año/día según zona horaria fija (mayoría del territorio MX).
 * Evita defaults en UTC del servidor (Vercel) que adelantan el mes en la noche del último día local.
 */
export const APP_CALENDAR_TIMEZONE = 'America/Mexico_City' as const;

export interface CalendarPartsInAppTimezone {
  year: number;
  month: number;
  /** 1–12 */
  day: number;
}

/**
 * Partes de calendario (año, mes 1–12, día) en {@link APP_CALENDAR_TIMEZONE} para un instante dado.
 */
export function getCalendarPartsInAppTimezone(
  instant: Date = new Date()
): CalendarPartsInAppTimezone {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_CALENDAR_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = formatter.formatToParts(instant);
  const yearStr = parts.find((p) => p.type === 'year')?.value;
  const monthStr = parts.find((p) => p.type === 'month')?.value;
  const dayStr = parts.find((p) => p.type === 'day')?.value;
  const year = yearStr !== undefined ? Number(yearStr) : NaN;
  const month = monthStr !== undefined ? Number(monthStr) : NaN;
  const day = dayStr !== undefined ? Number(dayStr) : NaN;
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw new Error('getCalendarPartsInAppTimezone: invalid Intl parts');
  }
  return { year, month, day };
}

export function getCurrentMonthYearInAppTimezone(
  instant: Date = new Date()
): { mes: number; año: number } {
  const { year, month } = getCalendarPartsInAppTimezone(instant);
  return { mes: month, año: year };
}

/**
 * 12 meses consecutivos en orden cronológico (el más antiguo primero),
 * terminando en (endMes, endAño). Equivale al rango que armaba getTrendData con Date(y,m,d) local.
 */
export function getLast12CalendarMonthsAscending(
  endMes: number,
  endAño: number
): Array<{ mes: number; año: number }> {
  let mes = endMes;
  let año = endAño;
  for (let k = 0; k < 11; k++) {
    mes -= 1;
    if (mes < 1) {
      mes = 12;
      año -= 1;
    }
  }
  const out: Array<{ mes: number; año: number }> = [];
  let m = mes;
  let y = año;
  for (let i = 0; i < 12; i++) {
    out.push({ mes: m, año: y });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}
