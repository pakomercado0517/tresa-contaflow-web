import { notFound } from "next/navigation";
import { EditProfileForm } from "./components/EditProfileForm";
import { getProfile } from "@/lib/api/profiles";
import { ServerApiError } from "@/lib/api/server-client";

interface EditProfilePageParams {
  id: string | string[];
}

interface EditProfilePageProps {
  params: Promise<EditProfilePageParams>;
}

function isValidProfileId(profileId: string): boolean {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(profileId);
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { id } = await params;
  const rawId = Array.isArray(id) ? id[0] : id;
  const profileId = rawId?.trim();

  if (!profileId || !isValidProfileId(profileId)) {
    notFound();
  }

  try {
    const response = await getProfile(profileId);
    const profile = response.data;

    return (
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Editar Perfil</h1>
            <p className="text-muted-foreground mt-2">
              Actualiza la información fiscal del perfil RFC.
            </p>
          </div>
          <EditProfileForm profile={profile} />
        </div>
      </main>
    );
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
