import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardFooter } from '@/components/layout/DashboardFooter';
import { DashboardTour } from '@/components/tour/DashboardTour';
import { getCurrentUser } from '@/lib/api/auth.server';
import { ProfileFreezeDetector } from '@/components/auth/ProfileFreezeDetector';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <>
      <ProfileFreezeDetector />
      <DashboardTour user={currentUser.user}>
        <div className="bg-background flex min-h-screen">
          <Sidebar user={currentUser.user} />
          <div className="flex min-w-0 flex-1 flex-col md:ml-64">
            {children}
            <DashboardFooter />
          </div>
        </div>
      </DashboardTour>
    </>
  );
}
