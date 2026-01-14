import { getProfiles } from "@/lib/api/profiles";
import { UploadExpensesContent } from "./components/UploadExpensesContent";

export default async function UploadExpensesPage() {
  const profiles = await getProfiles();

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <UploadExpensesContent profiles={profiles.data} />
    </main>
  );
}

