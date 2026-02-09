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
