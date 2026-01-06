import { Sidebar } from "@/components/layout/Sidebar";
import { ProfilesSection } from "../components/ProfilesSection";

export default async function ProfilesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Perfiles RFC</h1>
              <p className="text-muted-foreground mt-2">
                Gestiona tus perfiles fiscales (RFCs)
              </p>
            </div>
            <ProfilesSection />
          </div>
        </main>
      </div>
    </div>
  );
}

