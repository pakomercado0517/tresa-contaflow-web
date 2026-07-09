import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { DashboardFooter } from '@/components/layout/DashboardFooter';
import { DashboardTour } from '@/components/tour/DashboardTour';
import { getCurrentUser } from '@/lib/api/auth.server';
import { ProfileFreezeDetector } from '@/components/auth/ProfileFreezeDetector';
import { DashboardRouteTransition } from '@/components/layout/DashboardRouteTransition';
import { prefetchDashboardQueries } from '@/lib/query/dashboard-prefetch';
import { DashboardQueryHydration } from '@/components/providers/DashboardQueryHydration';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [currentUser, dehydratedState] = await Promise.all([
    getCurrentUser(),
    prefetchDashboardQueries(),
  ]);

  return (
    <DashboardQueryHydration state={dehydratedState}>
      <ProfileFreezeDetector />
      <DashboardTour user={currentUser.user}>
        <div className="bg-background flex min-h-screen">
          <MobileNav user={currentUser.user} />
          <Sidebar user={currentUser.user} />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col w-full overflow-x-hidden overflow-y-auto pt-16 lg:ml-64 lg:pt-0 print:ml-0 print:pt-0">
            <DashboardRouteTransition>{children}</DashboardRouteTransition>
            <DashboardFooter />
          </div>
        </div>
      </DashboardTour>
    </DashboardQueryHydration>
  );
}
