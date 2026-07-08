export const USER_LOGOS_BUCKET = "user-logos";

export function getUserLogoObjectPath(userId: string, extension: string): string {
  return `users/${userId}/logo.${extension}`;
}

export function getUserLogoPublicUrl(supabaseUrl: string, objectPath: string): string {
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  return `${baseUrl}/storage/v1/object/public/${USER_LOGOS_BUCKET}/${objectPath}`;
}
