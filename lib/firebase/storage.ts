import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "./config";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
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

/**
 * Sube el logo del usuario a Firebase Storage en users/{userId}/logo.{ext}
 * y devuelve la URL pública para enviar como logo_url al backend.
 */
export async function uploadUserLogo(userId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Formato no permitido. Usa JPEG, PNG, GIF o WebP."
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("La imagen no debe superar 2 MB.");
  }

  const storage = getStorage(getFirebaseApp());
  const ext = getImageExtension(file.type);
  const path = `users/${userId}/logo.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}
