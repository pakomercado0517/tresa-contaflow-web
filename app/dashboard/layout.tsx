import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardFooter } from "@/components/layout/DashboardFooter";
import { DashboardTour } from "@/components/tour/DashboardTour";
import { getCurrentUser } from "@/lib/api/auth.server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <DashboardTour user={currentUser.user}>
      <div className="flex min-h-screen bg-background">
        <Sidebar user={currentUser.user} />
        <div className="flex-1 flex flex-col md:ml-64 min-w-0">
          {children}
          <DashboardFooter />
        </div>
      </div>
    </DashboardTour>
  );
}
