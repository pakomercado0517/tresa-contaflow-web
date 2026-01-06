import { Sidebar } from "@/components/layout/Sidebar";
import { getProfiles } from "@/lib/api/profiles";
import { UploadExpensesContent } from "./components/UploadExpensesContent";

export default async function UploadExpensesPage() {
  const profiles = await getProfiles();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <UploadExpensesContent profiles={profiles.data} />
        </main>
      </div>
    </div>
  );
}

