import type { PeriodMetricsResponse } from './metrics';

export interface GeneratePublicReportRequest {
  profile_id: string;
  expires_in_days?: number;
  send_to_email?: string;
}

export interface GeneratePublicReportResponse {
  token: string;
  url: string;
  expires_at: string;
  /** Presente cuando el token se generó pero el email de invitación no se pudo enviar */
  message?: string;
}

export interface PublicReportBranding {
  logo_url: string | null;
  nombre_comercial: string | null;
}

export interface PublicReportProfile {
  id: string;
  nombre: string;
  rfc: string;
  /** Claves SAT de los regímenes fiscales del perfil (ej. ["601"], ["612", "626"]) */
  regimenes_fiscales: string[];
}

export interface PublicReportMetricsByRegimen {
  regimen: string;
  metrics: PublicReportMetrics | null;
}

export interface PublicReportNomina {
  total_pagada: number;
  percepciones: number;
  deducciones: number;
  cantidad_empleados: number;
}

export interface PublicReportMetrics extends PeriodMetricsResponse {
  nomina: PublicReportNomina;
}

export interface PublicReportResponse {
  branding: PublicReportBranding;
  profile: PublicReportProfile;
  /** Métricas consolidadas de todos los regímenes del mes actual */
  metrics: PublicReportMetrics | null;
  /** Métricas desglosadas por régimen fiscal (mismo orden que profile.regimenes_fiscales) */
  metrics_by_regimen: PublicReportMetricsByRegimen[];
}
