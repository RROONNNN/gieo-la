import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UserBadge } from "./UserBadge";
import type { PublicProfile, ProfilePermissions } from "@/types/user";

interface ProfileHeaderProps {
  user: PublicProfile;
  permissions: ProfilePermissions;
}

export function ProfileHeader({ user, permissions }: ProfileHeaderProps) {
  const isLocked = user.accountStatus !== "active";

  return (
    <Card className="mb-6">
      <div className="flex items-start gap-4">
        <div className="relative h-20 w-20 flex-shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={`Ảnh đại diện của ${user.name}`}
              fill
              className="rounded-full object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-foreground truncate">{user.name}</h1>
            {isLocked && (
              <Badge variant="danger">Tài khoản đã bị khóa</Badge>
            )}
          </div>

          <div className="mt-1">
            <UserBadge
              role={user.role}
              verificationStatus={user.verificationStatus}
              badge={user.badge}
              size="md"
            />
          </div>

          {user.role !== "admin" && (
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{user.completedDonations}</span>{" "}
              Lá đã gieo
            </p>
          )}

          {user.location.city && (
            <p className="mt-1 text-sm text-muted-foreground">{user.location.city}</p>
          )}

          {permissions.canEdit && (
            <div id="profile-edit-trigger" className="mt-3" />
          )}
        </div>
      </div>
    </Card>
  );
}
