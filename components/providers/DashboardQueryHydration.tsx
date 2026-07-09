'use client';

import { HydrationBoundary, type DehydratedState } from '@tanstack/react-query';

interface DashboardQueryHydrationProps {
  state: DehydratedState;
  children: React.ReactNode;
}

export function DashboardQueryHydration({ state, children }: DashboardQueryHydrationProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}
