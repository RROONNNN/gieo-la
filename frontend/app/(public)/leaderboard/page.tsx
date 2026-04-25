import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchLeaderboard } from "@/lib/api/leaderboard";
import { LeaderboardPodium } from "@/components/leaderboard/LeaderboardPodium";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";

interface PageProps {
  searchParams: Promise<{ year?: string; month?: string }>;
}

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

function buildNavHref(year: number, month: number): string {
  return `/leaderboard?year=${year}&month=${month}`;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const now = new Date();
  const year = sp.year ? parseInt(sp.year, 10) : now.getFullYear();
  const month = sp.month ? parseInt(sp.month, 10) : now.getMonth() + 1;

  let data;
  try {
    data = await fetchLeaderboard(year, month);
  } catch {
    data = { year, month, entries: [] };
  }

  // Prev/next month navigation
  const prevDate = new Date(year, month - 2, 1);
  const nextDate = new Date(year, month, 1);
  const nextHref = buildNavHref(nextDate.getFullYear(), nextDate.getMonth() + 1);
  const prevHref = buildNavHref(prevDate.getFullYear(), prevDate.getMonth() + 1);
  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  const top3 = data.entries.slice(0, 3);
  const rest = data.entries.slice(3);

  return (
    <div className="py-10">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-brand-darker mb-2">
          Bảng xếp hạng
        </h1>
        <p className="text-muted-foreground text-sm">
          Top 10 người quyên góp tích cực nhất theo tháng
        </p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <Link
          href={prevHref}
          className="flex size-8 items-center justify-center rounded-full border border-[var(--border-green)] text-brand-dark hover:bg-[var(--brand-light)] transition-colors"
        >
          <ChevronLeft className="size-4" />
        </Link>
        <h2 className="font-heading text-lg font-semibold text-brand-darker min-w-[180px] text-center">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        {!isCurrentMonth && (
          <Link
            href={nextHref}
            className="flex size-8 items-center justify-center rounded-full border border-[var(--border-green)] text-brand-dark hover:bg-[var(--brand-light)] transition-colors"
          >
            <ChevronRight className="size-4" />
          </Link>
        )}
        {isCurrentMonth && <div className="size-8" />}
      </div>

      {data.entries.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Chưa có dữ liệu cho tháng này
        </div>
      ) : (
        <>
          {/* Podium — Top 3 */}
          <LeaderboardPodium entries={top3} />

          {/* Rows — Rank 4–10 */}
          {rest.length > 0 && (
            <div className="space-y-2 max-w-xl mx-auto">
              {rest.map((entry) => (
                <LeaderboardRow key={entry.user._id} entry={entry} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
