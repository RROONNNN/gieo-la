import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { BadgeIcon } from "./BadgeIcon";
import type { LeaderboardEntry } from "@/types/leaderboard";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
}

const PODIUM_ORDER = [1, 0, 2]; // Left=rank2, Center=rank1, Right=rank3

const HEIGHT_CLASS = ["h-28", "h-36", "h-24"];
const RING_CLASS = [
  "ring-2 ring-slate-300",
  "ring-4 ring-amber-400",
  "ring-2 ring-orange-300",
];
const NAME_SIZE = ["text-sm", "text-base font-semibold", "text-sm"];
const AVATAR_SIZE = ["md" as const, "lg" as const, "md" as const];

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  if (entries.length === 0) return null;
  const top3 = entries.slice(0, 3);

  return (
    <div className="flex items-end justify-center gap-4 mb-8">
      {PODIUM_ORDER.map((idx) => {
        const entry = top3[idx];
        if (!entry) return <div key={idx} className="w-28" />;

        return (
          <div key={entry.rank} className="flex flex-col items-center gap-2">
            <BadgeIcon badge={entry.badge} />
            <Link href={`/profile/${entry.user._id}`}>
              <Avatar
                src={entry.user.avatar}
                alt={entry.user.name}
                size={AVATAR_SIZE[idx]}
                className={`rounded-full ${RING_CLASS[idx]}`}
              />
            </Link>
            <p className={`text-brand-darker text-center max-w-[96px] truncate ${NAME_SIZE[idx]}`}>
              {entry.user.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {entry.completedThisMonth} bài
            </p>
            {/* Podium block */}
            <div
              className={`w-24 rounded-t-lg flex items-center justify-center text-2xl font-bold text-white ${HEIGHT_CLASS[idx]} ${
                idx === 1
                  ? "bg-amber-400"
                  : idx === 0
                    ? "bg-slate-300"
                    : "bg-orange-300"
              }`}
            >
              {entry.rank}
            </div>
          </div>
        );
      })}
    </div>
  );
}
