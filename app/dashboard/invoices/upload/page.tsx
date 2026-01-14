import { getProfiles } from "@/lib/api/profiles";
import { UploadInvoicesContent } from "./components/UploadInvoicesContent";

export default async function UploadInvoicesPage() {
  const profiles = await getProfiles();

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <UploadInvoicesContent profiles={profiles.data} />
    </main>
  );
}

