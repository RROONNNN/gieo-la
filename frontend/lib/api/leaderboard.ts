import { BASE_URL, ENDPOINTS } from "./endpoints";
import type { LeaderboardResponse } from "@/types/leaderboard";

export async function fetchLeaderboard(
  year?: number,
  month?: number,
): Promise<LeaderboardResponse> {
  const query = new URLSearchParams();
  if (year) query.set("year", String(year));
  if (month) query.set("month", String(month));

  const url = `${BASE_URL}${ENDPOINTS.LEADERBOARD.MONTHLY}${query.size > 0 ? `?${query}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json();

  if (!res.ok) throw new Error(json.message || "Không tải được bảng xếp hạng");

  return json.data as LeaderboardResponse;
}
