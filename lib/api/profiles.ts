import { apiClient } from "./client";
import { cookies } from "next/headers";
import type { GetProfilesResponse } from "@/lib/types/profiles";

export async function getProfiles(): Promise<GetProfilesResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  return apiClient<GetProfilesResponse>("/api/profiles", {
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      Cookie: cookieStore.toString(),
    },
  });
}

