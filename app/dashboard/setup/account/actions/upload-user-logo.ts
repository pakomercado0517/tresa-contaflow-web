"use server";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { getFirebaseApp } from "@/lib/firebase/server-app";
import { requireAuth } from "@/lib/auth/require-auth";

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

export async function uploadUserLogoAction(userId: string, formData: FormData): Promise<string> {
  await requireAuth();

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

  const storage = getStorage(getFirebaseApp());
  const ext = getImageExtension(file.type);
  const objectPath = `users/${userId}/logo.${ext}`;
  const storageRef = ref(storage, objectPath);

  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
