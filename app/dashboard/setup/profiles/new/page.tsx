import { CreateProfileForm } from "./components/CreateProfileForm";
import { getSubscription } from "@/lib/api/subscription";
import { getProfiles } from "@/lib/api/profiles";

export default async function NewProfilePage() {
  const [subscription, profiles] = await Promise.all([
    getSubscription().catch(() => null),
    getProfiles().catch(() => null),
  ]);

  const currentProfileCount = profiles?.count || 0;
  const plan = subscription?.plan || "FREE";

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Crear Nuevo Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Agrega un nuevo perfil fiscal (RFC) a tu cuenta
          </p>
        </div>
        <CreateProfileForm
          currentProfileCount={currentProfileCount}
          plan={plan}
        />
      </div>
    </main>
  );
}

