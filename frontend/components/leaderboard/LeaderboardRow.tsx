import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { BadgeIcon } from "./BadgeIcon";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/leaderboard";
import type { BadgeType } from "@/types/enums";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

const RANK_PILL_BY_BADGE: Record<BadgeType, string> = {
  gold: "bg-amber-50 text-amber-700 ring-amber-200",
  silver: "bg-slate-100 text-slate-700 ring-slate-200",
  bronze: "bg-orange-50 text-orange-700 ring-orange-200",
  none: "bg-[var(--bg-cream)] text-brand-darker ring-[var(--border-green)]",
};

export function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const { rank, user, completedThisWeek, badge } = entry;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-[15px] border border-[var(--border-green)]",
        "bg-white px-3 py-3 transition-all duration-150",
        "hover:-translate-y-0.5 hover:border-brand-dark/20 hover:shadow-sm",
        "focus-within:ring-2 focus-within:ring-brand-dark/40 focus-within:ring-offset-2 focus-within:ring-offset-[var(--bg-cream)]",
        "sm:gap-4 sm:px-5",
      )}
    >
      {/* Rank pill */}
      <div
        aria-label={`Hạng ${rank}`}
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold ring-1 ring-inset",
          "sm:size-10 sm:text-base",
          RANK_PILL_BY_BADGE[badge],
        )}
      >
        {rank}
      </div>

      {/* Avatar + Name (primary link target) */}
      <Link
        href={`/profile/${user._id}`}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3",
          "rounded-md outline-none",
          "focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        )}
      >
        <Avatar
          src={user.avatar}
          alt={user.name}
          size="sm"
          className="transition-transform group-hover:scale-105"
        />
        <span
          className="truncate text-sm font-medium text-brand-darker group-hover:text-brand-dark sm:text-[15px]"
          title={user.name}
        >
          {user.name}
        </span>
      </Link>

      {/* Badge — chip on sm+, icon only on mobile */}
      {badge !== "none" && (
        <>
          <span className="hidden sm:inline-flex">
            <BadgeIcon badge={badge} variant="chip" size="sm" />
          </span>
          <span className="inline-flex sm:hidden">
            <BadgeIcon badge={badge} size="md" />
          </span>
        </>
      )}

      {/* Count */}
      <div
        className="shrink-0 text-right tabular-nums"
        aria-label={`${completedThisWeek} bài hoàn thành`}
      >
        <span className="text-base font-semibold text-brand-darker sm:text-lg">
          {completedThisWeek}
        </span>
        <span className="ml-1 text-xs text-muted-foreground sm:text-sm">
          bài
        </span>
      </div>
    </div>
  );
}
