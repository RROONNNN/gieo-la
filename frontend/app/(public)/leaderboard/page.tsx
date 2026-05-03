import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, Trophy, RotateCcw } from "lucide-react";
import { fetchLeaderboard } from "@/lib/api/leaderboard";
import { LeaderboardPodium } from "@/components/leaderboard/LeaderboardPodium";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { BadgeIcon } from "@/components/leaderboard/BadgeIcon";
import { BADGE_TIER_META } from "@/components/leaderboard/badgeMeta";

interface PageProps {
  searchParams: Promise<{ year?: string; week?: string }>;
}

// ---------------------------------------------------------------------------
// ISO week helpers (pure JS, no external deps)
// ---------------------------------------------------------------------------

function getISOWeekYear(date: Date): { isoYear: number; isoWeek: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return {
    isoYear: d.getUTCFullYear(),
    isoWeek: Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7),
  };
}

function getISOWeekRange(year: number, week: number): { start: Date; end: Date } {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const startOfWeek1 = new Date(Date.UTC(year, 0, 4 - dayOfWeek + 1));
  const start = new Date(startOfWeek1);
  start.setUTCDate(startOfWeek1.getUTCDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start, end };
}

function formatWeekRange(year: number, week: number): string {
  const { start, end } = getISOWeekRange(year, week);
  const d = (date: Date) => date.getUTCDate();
  const m = (date: Date) => date.getUTCMonth() + 1;
  return `${d(start)}/${m(start)} – ${d(end)}/${m(end)}/${year}`;
}

function prevWeek(year: number, week: number): { year: number; week: number } {
  if (week === 1) {
    const { isoWeek } = getISOWeekYear(new Date(year - 1, 11, 28));
    return { year: year - 1, week: isoWeek };
  }
  return { year, week: week - 1 };
}

function nextWeek(year: number, week: number): { year: number; week: number } {
  const { isoWeek: lastWeekOfYear } = getISOWeekYear(new Date(year, 11, 28));
  if (week >= lastWeekOfYear) return { year: year + 1, week: 1 };
  return { year, week: week + 1 };
}

function buildNavHref(year: number, week: number): string {
  return `/leaderboard?year=${year}&week=${week}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const now = new Date();
  const { isoYear: currentYear, isoWeek: currentWeek } = getISOWeekYear(now);

  const year = sp.year ? parseInt(sp.year, 10) : currentYear;
  const week = sp.week ? parseInt(sp.week, 10) : currentWeek;

  let data;
  try {
    data = await fetchLeaderboard(year, week);
  } catch {
    data = { year, week, entries: [] };
  }

  const prev = prevWeek(year, week);
  const next = nextWeek(year, week);
  const isCurrentWeek = year === currentYear && week === currentWeek;
  const dateRange = formatWeekRange(year, week);

  const top3 = data.entries.slice(0, 3);
  const rest = data.entries.slice(3);

  return (
    <div className="py-8 sm:py-12">
      {/* ─── Header ─── */}
      <header className="mb-6 text-center sm:mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-light/50 px-3 py-1 text-xs font-medium text-brand-dark sm:text-sm">
          <Trophy className="size-3.5 sm:size-4" aria-hidden />
          <span>Bảng xếp hạng tuần</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-brand-darker sm:text-3xl md:text-4xl">
          Những người gieo nhiều nhất
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground sm:text-base">
          Top 10 thành viên hoàn thành nhiều bài đăng nhất trong tuần.
        </p>
      </header>

      {/* ─── Week navigator ─── */}
      <nav
        aria-label="Chọn tuần"
        className="mx-auto mb-6 flex max-w-md items-center justify-between gap-2 rounded-full border border-[var(--border-green)] bg-white p-1.5 shadow-sm sm:mb-10"
      >
        <Link
          href={buildNavHref(prev.year, prev.week)}
          aria-label={`Tuần trước: tuần ${prev.week} năm ${prev.year}`}
          className="inline-flex size-9 items-center justify-center rounded-full text-brand-dark transition-colors hover:bg-brand-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-1"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col items-center">
          <div className="flex items-center gap-1.5 text-brand-darker">
            <Calendar className="size-3.5 text-brand-dark/70 sm:size-4" aria-hidden />
            <span className="font-heading text-sm font-semibold sm:text-base">
              Tuần {week} — {year}
            </span>
            {isCurrentWeek && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                Hiện tại
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground sm:text-xs">{dateRange}</p>
        </div>

        {isCurrentWeek ? (
          <span className="size-9" aria-hidden />
        ) : (
          <Link
            href={buildNavHref(next.year, next.week)}
            aria-label={`Tuần sau: tuần ${next.week} năm ${next.year}`}
            className="inline-flex size-9 items-center justify-center rounded-full text-brand-dark transition-colors hover:bg-brand-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-1"
          >
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        )}
      </nav>

      {/* "Back to current week" shortcut */}
      {!isCurrentWeek && (
        <div className="mb-8 flex justify-center">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-green)] bg-white px-3 py-1.5 text-xs font-medium text-brand-dark transition-colors hover:bg-brand-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-1 sm:text-sm"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Về tuần hiện tại
          </Link>
        </div>
      )}

      {/* ─── Content ─── */}
      {data.entries.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <LeaderboardPodium entries={top3} />

          {rest.length > 0 && (
            <section
              aria-label="Hạng 4 đến 10"
              className="mx-auto max-w-2xl"
            >
              <ol
                className="flex flex-col gap-2"
                start={4}
              >
                {rest.map((entry) => (
                  <li key={entry.user._id}>
                    <LeaderboardRow entry={entry} />
                  </li>
                ))}
              </ol>
            </section>
          )}

          <BadgeLegend />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents local to this page
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-[15px] border border-dashed border-[var(--border-green)] bg-white px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-light/60">
        <Trophy className="size-7 text-brand-dark/60" aria-hidden />
      </div>
      <div>
        <p className="font-heading text-base font-semibold text-brand-darker">
          Chưa có dữ liệu cho tuần này
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Hãy là người đầu tiên hoàn thành bài đăng để xuất hiện trên bảng xếp hạng.
        </p>
      </div>
    </div>
  );
}

function BadgeLegend() {
  return (
    <aside
      aria-label="Chú thích danh hiệu"
      className="mx-auto mt-10 max-w-2xl rounded-[15px] border border-[var(--border-green)] bg-white/60 p-4 sm:p-5"
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Các danh hiệu trong tuần
      </p>
      <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
        {BADGE_TIER_META.map((tier) => (
          <li
            key={tier.badge}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-green)] bg-white px-2.5 py-1"
          >
            <BadgeIcon badge={tier.badge} size="md" />
            <span className="text-xs font-medium text-brand-darker sm:text-sm">
              {tier.label}
            </span>
            <span className="text-[11px] text-muted-foreground sm:text-xs">
              · {tier.rangeLabel}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
