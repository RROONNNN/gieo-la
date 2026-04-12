import type { PublicProfile } from "@/types/user";
import { BASE_URL } from "./endpoints";

export async function getUserProfile(id: string): Promise<PublicProfile> {
  const res = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Không tải được hồ sơ người dùng");
  }

  const json = await res.json();
  return json.data.user as PublicProfile;
}
