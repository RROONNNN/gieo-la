import { Badge } from "@/components/ui/Badge";
import type { UserBadgeProps } from "@/types/user";

const LEADERBOARD_BADGES = {
  gold: { label: "Đại sứ Lá Lành", icon: "👑" },
  silver: { label: "Lá Lành Tích Cực", icon: "🥈" },
  bronze: { label: "Mầm Lành Năng Nổ", icon: "🥉" },
} as const;

function getVerificationBadgeConfig(
  role: UserBadgeProps["role"],
  verificationStatus: UserBadgeProps["verificationStatus"],
) {
  if (role !== "ngo" && role !== "individual") {
    return null;
  }

  const roleLabel = role === "ngo" ? "NGO" : "Hoàn cảnh khó khăn";

  switch (verificationStatus) {
    case "verified":
      return {
        variant: role === "ngo" ? "info" : "success",
        label: `✓ ${roleLabel} đã xác thực`,
      } as const;
    case "pending":
      return {
        variant: "warning",
        label: `${roleLabel} đang chờ xác thực`,
      } as const;
    case "rejected":
      return {
        variant: "danger",
        label: `${roleLabel} đã bị từ chối xác thực`,
      } as const;
    case "unverified":
    default:
      return {
        variant: "default",
        label: `${roleLabel} chưa xác thực`,
      } as const;
  }
}

export function UserBadge({ role, verificationStatus, badge, size = "sm" }: UserBadgeProps) {
  const sizeClass = size === "md" ? "text-sm px-3 py-1" : undefined;
  const verificationConfig = getVerificationBadgeConfig(role, verificationStatus);

  if (role === "ngo" || role === "individual") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {verificationConfig && (
          <Badge variant={verificationConfig.variant} className={sizeClass}>
            {verificationConfig.label}
          </Badge>
        )}

        {badge !== "none" && (
          <Badge variant="warning" className={sizeClass}>
            {LEADERBOARD_BADGES[badge].icon} {LEADERBOARD_BADGES[badge].label}
          </Badge>
        )}
      </div>
    );
  }

  if (badge !== "none") {
    const config = LEADERBOARD_BADGES[badge];
    return (
      <Badge variant="warning" className={sizeClass}>
        {config.icon} {config.label}
      </Badge>
    );
  }

  return null;
}
