import Link from "next/link";
import { Crown, Medal, Award, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/leaderboard";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
}

type Position = "left" | "center" | "right";

interface PositionStyle {
  icon: LucideIcon;
  iconLabel: string;
  /** Height of the block on desktop / mobile. */
  blockHeight: string;
  /** Gradient applied to the block. */
  blockBg: string;
  /** Ring around the avatar. */
  avatarRing: string;
  /** Optional glow behind the avatar (used for rank 1). */
  avatarGlow?: string;
  /** Color accent for the rank number on the block. */
  blockText: string;
  /** Color accent for the icon above the avatar. */
  iconColor: string;
  /** Order on mobile (column-reverse style not used; we use CSS order). */
  order: number;
}

const POSITION_STYLES: Record<Position, PositionStyle> = {
  left: {
    icon: Medal,
    iconLabel: "Hạng 2",
    blockHeight: "h-24 sm:h-28",
    blockBg:
      "bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400",
    avatarRing: "ring-2 ring-slate-300",
    blockText: "text-slate-700",
    iconColor: "text-slate-500",
    order: 1,
  },
  center: {
    icon: Crown,
    iconLabel: "Hạng 1",
    blockHeight: "h-32 sm:h-40",
    blockBg:
      "bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500",
    avatarRing: "ring-4 ring-amber-400",
    avatarGlow:
      "before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-amber-300/40 before:blur-xl",
    blockText: "text-amber-900",
    iconColor: "text-amber-500",
    order: 2,
  },
  right: {
    icon: Award,
    iconLabel: "Hạng 3",
    blockHeight: "h-20 sm:h-24",
    blockBg:
      "bg-gradient-to-b from-orange-200 via-orange-300 to-orange-400",
    avatarRing: "ring-2 ring-orange-300",
    blockText: "text-orange-800",
    iconColor: "text-orange-500",
    order: 3,
  },
};

// indices into entries array (rank - 1) laid out as left, center, right columns.
const COLUMN_LAYOUT: Array<{ position: Position; entryIndex: number }> = [
  { position: "left", entryIndex: 1 },
  { position: "center", entryIndex: 0 },
  { position: "right", entryIndex: 2 },
];

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  if (entries.length === 0) return null;

  return (
    <section
      aria-label="Top 3 tuần này"
      className="mx-auto mb-10 max-w-2xl"
    >
      <ol className="flex items-end justify-center gap-3 sm:gap-6">
        {COLUMN_LAYOUT.map(({ position, entryIndex }) => {
          const entry = entries[entryIndex];
          const style = POSITION_STYLES[position];
          const Icon = style.icon;

          if (!entry) {
            return (
              <li
                key={position}
                aria-hidden
                className="flex w-[30%] max-w-[160px] flex-col items-center gap-2 opacity-40"
              >
                <div
                  className={cn(
                    "flex w-full items-center justify-center rounded-t-xl bg-slate-100 font-heading text-2xl font-bold text-slate-400",
                    style.blockHeight,
                  )}
                >
                  —
                </div>
              </li>
            );
          }

          const isCenter = position === "center";

          return (
            <li
              key={entry.user._id}
              className="flex w-[30%] max-w-[180px] flex-col items-center gap-2"
              aria-label={`Hạng ${entry.rank}: ${entry.user.name}, ${entry.completedThisWeek} bài`}
            >
              <Icon
                className={cn(
                  "size-5 sm:size-6",
                  style.iconColor,
                )}
                aria-label={style.iconLabel}
              />

              <Link
                href={`/profile/${entry.user._id}`}
                className={cn(
                  "group relative isolate inline-flex rounded-full transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-cream)]",
                  style.avatarGlow,
                )}
              >
                <Avatar
                  src={entry.user.avatar}
                  alt={entry.user.name}
                  size={isCenter ? "lg" : "md"}
                  className={cn(
                    "rounded-full shadow-md transition-shadow group-hover:shadow-lg",
                    style.avatarRing,
                  )}
                />
              </Link>

              <div className="flex w-full min-w-0 flex-col items-center gap-0.5 text-center">
                <Link
                  href={`/profile/${entry.user._id}`}
                  className={cn(
                    "block max-w-full truncate text-brand-darker transition-colors hover:text-brand-dark focus-visible:outline-none focus-visible:underline",
                    isCenter
                      ? "text-sm font-semibold sm:text-base"
                      : "text-xs font-medium sm:text-sm",
                  )}
                  title={entry.user.name}
                >
                  {entry.user.name}
                </Link>
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  <span className="font-semibold text-brand-darker">
                    {entry.completedThisWeek}
                  </span>{" "}
                  bài
                </p>
              </div>

              <div
                className={cn(
                  "flex w-full items-center justify-center rounded-t-xl font-heading text-2xl font-bold shadow-inner sm:text-3xl",
                  style.blockHeight,
                  style.blockBg,
                  style.blockText,
                )}
              >
                {entry.rank}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
