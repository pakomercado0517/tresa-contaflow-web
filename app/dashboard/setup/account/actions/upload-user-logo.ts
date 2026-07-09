"use server";

import { getCurrentUser } from "@/lib/api/auth.server";
import { requireAuth } from "@/lib/auth/require-auth";
import { getSupabaseAdminClient, getSupabaseProjectUrl } from "@/lib/supabase/server-client";
import {
  getUserLogoObjectPath,
  getUserLogoPublicUrl,
  USER_LOGOS_BUCKET,
} from "@/lib/supabase/user-logos-bucket";

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function getImageExtension(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return map[mimeType] ?? "png";
}

export async function uploadUserLogoAction(formData: FormData): Promise<string> {
  await requireAuth();
  const { user } = await getCurrentUser();

  const file = formData.get("logo");
  if (!(file instanceof File)) {
    throw new Error("No se recibió ninguna imagen.");
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato no permitido. Usa JPEG, PNG, GIF o WebP.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("La imagen no debe superar 2 MB.");
  }

  const ext = getImageExtension(file.type);
  const objectPath = getUserLogoObjectPath(user.id, ext);
  const fileBytes = new Uint8Array(await file.arrayBuffer());

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage.from(USER_LOGOS_BUCKET).upload(objectPath, fileBytes, {
    contentType: file.type,
    upsert: true,
    cacheControl: "3600",
  });

  if (error) {
    if (error.message.includes("Invalid path specified in request URL")) {
      throw new Error(
        "Configuración de Supabase incorrecta: SUPABASE_URL debe ser https://<ref>.supabase.co (sin /rest/v1). Reinicia el servidor de desarrollo tras cambiar .env.local."
      );
    }
    if (error.message.toLowerCase().includes("bucket") && error.message.toLowerCase().includes("not found")) {
      throw new Error(
        'No existe el bucket "user-logos" en Supabase Storage. Créalo como bucket público con ese nombre exacto.'
      );
    }
    throw new Error(error.message || "No se pudo subir la imagen.");
  }

  return getUserLogoPublicUrl(getSupabaseProjectUrl(), objectPath);
}
