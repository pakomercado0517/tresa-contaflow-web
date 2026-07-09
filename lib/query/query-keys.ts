export const subscriptionQueryKey = ['subscription'] as const;

export const profilesQueryKey = ['profiles'] as const;

export function metricsTrendQueryKey(
  profileId: string | undefined,
  año: number,
  periodView: string,
  mes: number | undefined,
  regimenFiscal: string | undefined
): readonly [
  'metrics-trend',
  string | undefined,
  number,
  string,
  number | undefined,
  string | undefined,
] {
  return ['metrics-trend', profileId, año, periodView, mes, regimenFiscal];
}
