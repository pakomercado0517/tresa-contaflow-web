import { getProfiles } from "@/lib/api/profiles";
import { getSubscription } from "@/lib/api/subscription";
import { ProfilesSectionView } from "../components/ProfilesSectionView";

export default async function ProfilesPage() {
  const [subscription, profiles] = await Promise.all([
    getSubscription(),
    getProfiles(),
  ]);

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Perfiles RFC</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tus perfiles fiscales (RFCs)
          </p>
        </div>
        <ProfilesSectionView profiles={profiles} subscription={subscription} />
      </div>
    </main>
  );
}
