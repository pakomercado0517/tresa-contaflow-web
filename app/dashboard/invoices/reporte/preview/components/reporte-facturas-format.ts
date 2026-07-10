export function formatReporteFacturasCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatReporteFacturasDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
