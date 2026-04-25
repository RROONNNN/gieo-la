import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { BadgeIcon } from "./BadgeIcon";
import type { LeaderboardEntry } from "@/types/leaderboard";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

export function LeaderboardRow({ entry }: LeaderboardRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-[15px] border border-[var(--border-green)] bg-white px-5 py-3">
      <span className="w-6 shrink-0 text-center text-sm font-semibold text-brand-darker">
        {entry.rank}
      </span>
      <Link href={`/profile/${entry.user._id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar src={entry.user.avatar} alt={entry.user.name} size="sm" />
        <span className="text-sm font-medium text-brand-darker truncate">{entry.user.name}</span>
      </Link>
      <BadgeIcon badge={entry.badge} showLabel />
      <span className="shrink-0 text-sm text-muted-foreground">
        {entry.completedThisMonth} bài
      </span>
    </div>
  );
}
