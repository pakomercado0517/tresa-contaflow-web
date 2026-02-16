'use client';

import type { ReporteMensualData } from './ReporteMensualTemplate';
import type { DetalleOperacionesDevengadasData } from './DetalleOperacionesDevengadasTemplate';

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

interface ReportPDFLayoutProps {
  data: ReporteMensualData;
  detalleData: DetalleOperacionesDevengadasData;
  totalPages: number;
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function truncate(str: string, max: number): string {
  if (!str) return '—';
  return str.length <= max ? str : `${str.slice(0, max)}...`;
}

/**
 * Layout exclusivo para PDF/impresión. NO reutiliza estilos del dashboard.
 * Diseñado para hoja A4 profesional con formato de documento financiero corporativo.
 */
export function ReportPDFLayout({ data, detalleData, totalPages }: ReportPDFLayoutProps) {
  const periodoTexto = `${MESES[data.mes - 1]} ${data.año}`;
  const margen =
    data.ingresosDevengados > 0 ? (data.utilidadOperativa / data.ingresosDevengados) * 100 : 0;

  return (
    <div className="report-pdf-root">
      {/* Página 1: Reporte mensual */}
      <section className="report-pdf-page report-pdf-page-break-avoid" data-reporte-contenido>
        {/* Header fijo con logo y datos del reporte */}
        <header className="report-pdf-header">
          <div className="report-pdf-header-logo">
            <span className="report-pdf-logo-text">Contafy</span>
            <span className="report-pdf-logo-sub">Financial Analytics</span>
          </div>
          <div className="report-pdf-header-info">
            <p className="report-pdf-header-title">Reporte Mensual de Operaciones</p>
            <p className="report-pdf-header-rfc">RFC: {data.rfc || '—'}</p>
            <p className="report-pdf-header-periodo">Período: {periodoTexto}</p>
          </div>
        </header>

        <div className="report-pdf-body">
          {/* Resumen de flujo (caja) - layout lineal */}
          <section className="report-pdf-section">
            <h3 className="report-pdf-section-title">Resumen de flujo (caja)</h3>
            <div className="report-pdf-grid-3">
              <div className="report-pdf-metric">
                <span className="report-pdf-metric-label">Ingresos cobrados</span>
                <span className="report-pdf-metric-value">
                  {formatCurrency(data.ingresosCobrados)}
                </span>
              </div>
              <div className="report-pdf-metric">
                <span className="report-pdf-metric-label">Egresos pagados</span>
                <span className="report-pdf-metric-value">
                  {formatCurrency(data.egresosPagados)}
                </span>
              </div>
              <div className="report-pdf-metric report-pdf-metric-total">
                <span className="report-pdf-metric-label">Flujo neto</span>
                <span className="report-pdf-metric-value">{formatCurrency(data.flujoNeto)}</span>
              </div>
            </div>
          </section>

          {/* Tesorería pendiente */}
          <section className="report-pdf-section">
            <h3 className="report-pdf-section-title">Tesorería pendiente</h3>
            <div className="report-pdf-rows">
              <div className="report-pdf-row">
                <span>Facturas por cobrar</span>
                <span className="report-pdf-row-value">
                  {formatCurrency(data.facturasPorCobrar)}
                </span>
              </div>
              <div className="report-pdf-row">
                <span>Facturas por pagar</span>
                <span className="report-pdf-row-value">
                  {formatCurrency(data.facturasPorPagar)}
                </span>
              </div>
              <div className="report-pdf-row">
                <span>Proyección saldo bancario</span>
                <span className="report-pdf-row-value">{formatCurrency(data.proyeccionSaldo)}</span>
              </div>
            </div>
          </section>

          {/* Estado de resultados por régimen */}
          {data.estadoPorRegimen && data.estadoPorRegimen.length > 0 && (
            <section className="report-pdf-section report-pdf-page-break-avoid">
              <h3 className="report-pdf-section-title">Estado de resultados por régimen</h3>
              <p className="report-pdf-note">Basado en fecha de emisión CFDI</p>
              <div className="report-pdf-regimen-list">
                {data.estadoPorRegimen.map((regimen, index) => (
                  <div key={index} className="report-pdf-regimen-block" data-reporte-regimen>
                    <h4 className="report-pdf-regimen-name">{regimen.nombreRegimen}</h4>
                    <div className="report-pdf-regimen-rows">
                      <div className="report-pdf-row">
                        <span>Ingresos (cobrados / devengados)</span>
                        <span>{formatCurrency(regimen.ingresos)}</span>
                      </div>
                      <div className="report-pdf-row">
                        <span>Egresos (pagados / deducidos)</span>
                        <span className="report-pdf-negative">
                          ({formatCurrency(regimen.egresos)})
                        </span>
                      </div>
                      <div className="report-pdf-row">
                        <span>Retenciones de terceros (IVA)</span>
                        <span>{formatCurrency(regimen.retencionesIva)}</span>
                      </div>
                      <div className="report-pdf-row">
                        <span>Retenciones de terceros (ISR)</span>
                        <span>{formatCurrency(regimen.retencionesIsr)}</span>
                      </div>
                      <div className="report-pdf-row">
                        <span>Impuesto trasladado</span>
                        <span>{formatCurrency(regimen.impuestoTrasladado)}</span>
                      </div>
                      <div className="report-pdf-row report-pdf-row-total">
                        <span>Utilidad neta del régimen</span>
                        <span>{formatCurrency(regimen.utilidadNeta)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Estado de resultados (modelo único) */}
          {(!data.estadoPorRegimen || data.estadoPorRegimen.length === 0) && (
            <section className="report-pdf-section report-pdf-page-break-avoid">
              <h3 className="report-pdf-section-title">Estado de resultados (modelo devengado)</h3>
              <p className="report-pdf-note">Basado en fecha de emisión CFDI</p>
              <div className="report-pdf-block">
                <div className="report-pdf-row">
                  <span>Ingresos devengados (ventas totales)</span>
                  <span>{formatCurrency(data.ingresosDevengados)}</span>
                </div>
                <div className="report-pdf-row">
                  <span>Egresos devengados (costos y gastos)</span>
                  <span className="report-pdf-negative">
                    ({formatCurrency(data.egresosDevengados)})
                  </span>
                </div>
                <div className="report-pdf-row report-pdf-row-total">
                  <span>Utilidad operativa</span>
                  <span>{formatCurrency(data.utilidadOperativa)}</span>
                </div>
                <p className="report-pdf-margin-note">Margen de operación: {margen.toFixed(1)}%</p>
              </div>
            </section>
          )}
        </div>

        <footer className="report-pdf-footer">
          <div className="report-pdf-footer-left">
            <p>Generado por Contafy</p>
            <p suppressHydrationWarning>
              {new Date().toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <p className="report-pdf-footer-page">Página 1 de {totalPages}</p>
        </footer>
      </section>

      {/* Página 2: Detalle de operaciones */}
      <section className="report-pdf-page report-pdf-page-break-before" data-reporte-pagina-2>
        <header className="report-pdf-header">
          <div className="report-pdf-header-logo">
            <span className="report-pdf-logo-text">Contafy</span>
            <span className="report-pdf-logo-sub">Financial Analytics</span>
          </div>
          <div className="report-pdf-header-info">
            <p className="report-pdf-header-title">Detalle de Operaciones Devengadas</p>
            <p className="report-pdf-header-rfc">RFC: {detalleData.rfc || '—'}</p>
            <p className="report-pdf-header-periodo">Período: {periodoTexto}</p>
          </div>
        </header>

        <div className="report-pdf-body">
          {/* Tabla ingresos */}
          <section className="report-pdf-section report-pdf-page-break-avoid">
            <h3 className="report-pdf-section-title">Ingresos devengados (ventas)</h3>
            <div className="report-pdf-table-wrapper">
              <table className="report-pdf-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Folio / UUID</th>
                    <th>RFC receptor</th>
                    <th>Concepto</th>
                    <th className="report-pdf-th-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleData.ingresos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="report-pdf-td-empty">
                        Sin registros
                      </td>
                    </tr>
                  ) : (
                    detalleData.ingresos.map((row, idx) => (
                      <tr key={`ing-${idx}-${row.folioUuid}`}>
                        <td>{formatDate(row.fecha)}</td>
                        <td className="report-pdf-td-mono">{truncate(row.folioUuid, 20)}</td>
                        <td>{truncate(row.rfcReceptor, 18)}</td>
                        <td>{truncate(row.concepto, 35)}</td>
                        <td className="report-pdf-td-right">{formatCurrency(row.montoTotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="report-pdf-tfoot-total">
                    <td colSpan={4}>Total ingresos devengados</td>
                    <td className="report-pdf-td-right report-pdf-total-value">
                      {formatCurrency(detalleData.totalIngresos)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Tabla egresos */}
          <section className="report-pdf-section report-pdf-page-break-avoid">
            <h3 className="report-pdf-section-title">Egresos devengados (gastos)</h3>
            <div className="report-pdf-table-wrapper">
              <table className="report-pdf-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Folio / UUID</th>
                    <th>RFC emisor</th>
                    <th>Concepto</th>
                    <th className="report-pdf-th-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleData.egresos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="report-pdf-td-empty">
                        Sin registros
                      </td>
                    </tr>
                  ) : (
                    detalleData.egresos.map((row, idx) => (
                      <tr key={`egr-${idx}-${row.folioUuid}`}>
                        <td>{formatDate(row.fecha)}</td>
                        <td className="report-pdf-td-mono">{truncate(row.folioUuid, 20)}</td>
                        <td>{truncate(row.rfcEmisor, 18)}</td>
                        <td>{truncate(row.concepto, 35)}</td>
                        <td className="report-pdf-td-right">{formatCurrency(row.montoTotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="report-pdf-tfoot-total report-pdf-tfoot-egresos">
                    <td colSpan={4}>Total egresos devengados</td>
                    <td className="report-pdf-td-right report-pdf-total-value report-pdf-total-egresos">
                      {formatCurrency(detalleData.totalEgresos)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Utilidad bruta */}
          <div className="report-pdf-utilidad-block">
            <p className="report-pdf-utilidad-label">Utilidad bruta</p>
            <p className="report-pdf-utilidad-value">{formatCurrency(detalleData.utilidadBruta)}</p>
            <p className="report-pdf-utilidad-margen">
              Margen: {detalleData.margenPercent.toFixed(1)}%
            </p>
          </div>
        </div>

        <footer className="report-pdf-footer">
          <div className="report-pdf-footer-left">
            <p>Generado por Contafy</p>
            <p suppressHydrationWarning>
              {new Date().toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <p className="report-pdf-footer-page">Página 2 de {totalPages}</p>
        </footer>
      </section>
    </div>
  );
}
