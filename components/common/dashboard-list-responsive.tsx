import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardListResponsiveProps {
  children: ReactNode;
  className?: string;
}

export function DashboardListMobile({ children, className }: DashboardListResponsiveProps) {
  return <div className={cn('space-y-3 md:hidden', className)}>{children}</div>;
}

export function DashboardListDesktop({ children, className }: DashboardListResponsiveProps) {
  return (
    <div className={cn('hidden min-w-0 overflow-x-auto md:block', className)}>{children}</div>
  );
}
