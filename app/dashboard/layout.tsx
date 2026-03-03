import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { DashboardFooter } from '@/components/layout/DashboardFooter';
import { DashboardTour } from '@/components/tour/DashboardTour';
import { getCurrentUser } from '@/lib/api/auth.server';
import { ProfileFreezeDetector } from '@/components/auth/ProfileFreezeDetector';
import { DashboardRouteTransition } from '@/components/layout/DashboardRouteTransition';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <>
      <ProfileFreezeDetector />
      <DashboardTour user={currentUser.user}>
        <div className="bg-background flex min-h-screen">
          <MobileNav user={currentUser.user} />
          <Sidebar user={currentUser.user} />
            <div className="flex min-w-0 flex-1 flex-col w-full pt-16 lg:ml-64 lg:pt-0 print:ml-0 print:pt-0">
            <DashboardRouteTransition>{children}</DashboardRouteTransition>
            <DashboardFooter />
          </div>
        </div>
      </DashboardTour>
    </>
  );
}
