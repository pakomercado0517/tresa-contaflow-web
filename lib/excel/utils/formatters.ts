/**
 * Formateo consistente de datos para exportación Excel (alineado con PDF).
 */

export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (typeof num !== "number" || Number.isNaN(num)) {
    return "$0.00";
  }
  return num.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "currency",
    currency: "MXN",
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Fecha y hora para columna "Fecha emisión" (dd/mm/yyyy HH:mm) */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const hasTime = dateString.includes("T") || /^\d{4}-\d{2}-\d{2}\s\d{2}/.test(dateString);
  if (hasTime && !Number.isNaN(date.getTime())) {
    return date.toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatPercentage(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (typeof num !== "number" || Number.isNaN(num)) {
    return "0%";
  }
  return `${num.toFixed(2)}%`;
}

export function formatNumber(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (typeof num !== "number" || Number.isNaN(num)) {
    return "0";
  }
  return num.toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
