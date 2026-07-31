export const DASHBOARD_HEAVY_QUERY_STALE_MS = 5 * 60 * 1000;

export const dashboardHeavyQueryOptions = {
  staleTime: DASHBOARD_HEAVY_QUERY_STALE_MS,
  refetchOnWindowFocus: false,
} as const;
